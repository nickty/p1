const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Updated CORS configuration to only allow 7websites.com
const corsOptions = {
  // origin: ['http://7websites.com', 'https://7websites.com', 'https://www.7websites.com', 'http://www.7websites.com'],
  origin: '*',
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], required: true }
});

const User = mongoose.model('User', userSchema);

// Existing schemas and models
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  stage: { type: String, enum: ['new', 'engaged', 'ordered', 'closed lost'], default: 'new' },
  totalRevenue: { type: Number, default: 0 },
  touchpoints: { type: Number, default: 0 },
});

const noteSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  type: { type: String, enum: ['call', 'email'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
  salesAgent: String,
  isPinned: { type: Boolean, default: false },
  isHighlighted: { type: Boolean, default: false }
});

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now },
});

const Customer = mongoose.model('Customer', customerSchema);
const Note = mongoose.model('Note', noteSchema);
const Order = mongoose.model('Order', orderSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, 'secretToken');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Function to remove all existing users
const removeAllUsers = async () => {
  try {
    await User.deleteMany({});
    console.log('All users have been removed from the database');
  } catch (error) {
    console.error('Error removing users:', error);
  }
};

// Function to initialize users
const initializeUsers = async () => {
  try {
    // Remove all existing users
    await removeAllUsers();

    // Create admin user
    const adminHashedPassword = await bcrypt.hash('TGH650', 10);
    await User.create({ username: 'admin', password: adminHashedPassword, role: 'admin' });
    console.log('Admin account created');

    // Create regular user
    const userHashedPassword = await bcrypt.hash('TGH707', 10);
    await User.create({ username: 'user', password: userHashedPassword, role: 'user' });
    console.log('User account created');

  } catch (error) {
    console.error('Error initializing users:', error);
  }
};


initializeUsers();

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ message: 'Invalid username or password' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: 'Invalid username or password' });

  const token = jwt.sign({ id: user._id, role: user.role }, 'secretToken');
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

// Update user password (admin only)
app.put('/api/update-password', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

  const { username, newPassword } = req.body;
  const user = await User.findOne({ username, role: 'user' });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

// Existing routes with added authentication
app.get('/api/customers', verifyToken, async (req, res) => {
  try {
    const customers = await Customer.find();
    const customersWithDetails = await Promise.all(
      customers.map(async (customer) => {
        const notes = await Note.find({ customerId: customer._id });
        const orders = await Order.find({ customerId: customer._id });
        return {
          ...customer.toObject(),
          notes,
          orders,
        };
      })
    );
    res.json(customersWithDetails);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

app.post('/api/customers', verifyToken, async (req, res) => {
  const customer = new Customer(req.body);
  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/customers/:id', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const notes = await Note.find({ customerId: req.params.id });
    const orders = await Order.find({ customerId: req.params.id });
    res.json({
      ...customer.toObject(),
      notes,
      orders,
    });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({ message: 'Error fetching customer data' });
  }
});

app.put('/api/customers/:id', verifyToken, async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const notes = await Note.find({ customerId: req.params.id });
    const orders = await Order.find({ customerId: req.params.id });
    res.json({
      ...updatedCustomer.toObject(),
      notes,
      orders,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/customers/:id/notes', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ customerId: req.params.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/customers/:id/notes', verifyToken, async (req, res) => {
  const note = new Note({
    ...req.body,
    customerId: req.params.id,
  });
  try {
    const newNote = await note.save();
    await Customer.findByIdAndUpdate(req.params.id, { $inc: { touchpoints: 1 } });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/customers/:id/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// New route to delete a specific order
app.delete('/api/customers/:customerId/orders/:orderId', verifyToken, async (req, res) => {
  try {
    const { customerId, orderId } = req.params;

    // Find the order and ensure it belongs to the specified customer
    const order = await Order.findOne({ _id: orderId, customerId: customerId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or does not belong to this customer' });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    // Update the customer's total revenue
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalRevenue -= order.amount;
      await customer.save();
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
});

app.put('/api/customers/:id/orders', verifyToken, async (req, res) => {
  const order = new Order({
    ...req.body,
    customerId: req.params.id,
  });
  try {
    const newOrder = await order.save();
    await Customer.findByIdAndUpdate(req.params.id, {
      $inc: { totalRevenue: req.body.amount },
      stage: 'ordered',
    });
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/notes/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = {};
    if (req.body.isPinned !== undefined) {
      updatedFields.isPinned = req.body.isPinned;
    }
    if (req.body.isHighlighted !== undefined) {
      updatedFields.isHighlighted = req.body.isHighlighted;
    }
    const updatedNote = await Note.findByIdAndUpdate(id, updatedFields, { new: true });
    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
});

// New route to delete a specific note
app.delete('/api/customers/:customerId/notes/:noteId', verifyToken, async (req, res) => {
  try {
    const { customerId, noteId } = req.params;

    // Find the note and ensure it belongs to the specified customer
    const note = await Note.findOne({ _id: noteId, customerId: customerId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or does not belong to this customer' });
    }

    // Delete the note
    await Note.findByIdAndDelete(noteId);

    // Update the customer's notes array
    await Customer.findByIdAndUpdate(customerId, {
      $pull: { notes: noteId }
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// Fetch all pinned notes
app.get('/api/notes/pinned', verifyToken, async (req, res) => {
  try {
    const pinnedNotes = await Note.find({ isPinned: true }).populate('customerId', 'name');
    
    const formattedPinnedNotes = pinnedNotes.map(note => ({
      _id: note._id,
      content: note.content,
      type: note.type,
      timestamp: note.timestamp,
      salesAgent: note.salesAgent,
      isPinned: note.isPinned,
      isHighlighted: note.isHighlighted,
      customerName: note.customerId ? note.customerId.name : 'Unknown Customer',
      customerId: note.customerId
    }));

    res.json(formattedPinnedNotes);
  } catch (error) {
    console.error('Error fetching pinned notes:', error);
    res.status(500).json({ message: 'Error fetching pinned notes' });
  }
});

// Updated route for exporting customers as CSV (admin only)
app.get('/api/export-customers', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }

    const customers = await Customer.find().lean();
    
    // Include all fields from the customer schema
    const fields = Object.keys(Customer.schema.paths).filter(field => field !== '__v');
    
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(customers);

    res.header('Content-Type', 'text/csv');
    res.attachment('customers.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({ message: 'Error exporting customers' });
  }
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));

console.log('Server code updated with authentication and user management.');