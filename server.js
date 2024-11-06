const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow CORS for your specific frontend domain
const corsOptions = {
  // origin: ['http://7websites.com', 'http://www.7websites.com', 'http://174.140.17.185:5000'], // add both variations
  origin: '*',
  optionsSuccessStatus: 200,
};


app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB using the URI from environment variables
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Mongoose models for customers, notes, and orders
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  stage: { type: String, enum: ['new', 'engaged', 'ordered', 'closed lost'], default: 'new' },
  totalRevenue: { type: Number, default: 0 },
  touchpoints: { type: Number, default: 0 },
});

// const noteSchema = new mongoose.Schema({
//   customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
//   type: { type: String, enum: ['call', 'email'] },
//   content: String,
//   timestamp: { type: Date, default: Date.now },
//   salesAgent: String,
// });

const noteSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  type: { type: String, enum: ['call', 'email'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
  salesAgent: String,
  isPinned: { type: Boolean, default: false },       // New field for pin status
  isHighlighted: { type: Boolean, default: false }   // New field for highlight status
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

// API routes for customers, notes, and orders
// app.get('/api/customers', async (req, res) => {
//   try {
//     const customers = await Customer.find();
//     res.json(customers);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

app.get('/api/customers', async (req, res) => {
  try {
    // Fetch all customers from the database
    const customers = await Customer.find();

    // For each customer, retrieve associated notes and orders
    const customersWithDetails = await Promise.all(
      customers.map(async (customer) => {
        // Fetch notes and orders related to the customer
        const notes = await Note.find({ customerId: customer._id });
        const orders = await Order.find({ customerId: customer._id });

        // Return the customer data with associated notes and orders
        return {
          ...customer.toObject(),
          notes,
          orders,
        };
      })
    );

    // Send the complete customer list with notes and orders
    res.json(customersWithDetails);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
});


app.post('/api/customers', async (req, res) => {
  const customer = new Customer(req.body);
  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// app.get('/api/customers/:id', async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.id);
//     res.json(customer);
//   } catch (error) {
//     res.status(404).json({ message: 'Customer not found' });
//   }
// });

app.get('/api/customers/:id', async (req, res) => {
  try {
    // Find the customer by ID
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Find notes and orders related to the customer
    const notes = await Note.find({ customerId: req.params.id });
    const orders = await Order.find({ customerId: req.params.id });

    // Send the customer data along with notes and orders
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


// Update customer information by ID
// app.put('/api/customers/:id', async (req, res) => {
//   try {
//     const updatedCustomer = await Customer.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!updatedCustomer) {
//       return res.status(404).json({ message: 'Customer not found' });
//     }
//     res.json(updatedCustomer);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Update customer information by ID and return complete customer details
app.put('/api/customers/:id', async (req, res) => {
  try {
    // Update the customer information
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If customer is not found, send a 404 error
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Retrieve associated notes and orders for the updated customer
    const notes = await Note.find({ customerId: req.params.id });
    const orders = await Order.find({ customerId: req.params.id });

    // Return the updated customer with associated notes and orders
    res.json({
      ...updatedCustomer.toObject(),
      notes,
      orders,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



app.get('/api/customers/:id/notes', async (req, res) => {
  try {
    const notes = await Note.find({ customerId: req.params.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/customers/:id/notes', async (req, res) => {
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

app.get('/api/customers/:id/orders', async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/customers/:id/orders', async (req, res) => {
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


// pin and hightlight 
// Update a specific note's pinned or highlighted status
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = {};

    // Only update provided fields
    if (req.body.isPinned !== undefined) {
      updatedFields.isPinned = req.body.isPinned;
    }
    if (req.body.isHighlighted !== undefined) {
      updatedFields.isHighlighted = req.body.isHighlighted;
    }

    // Find and update the note
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


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler for any request that doesn't match above routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
