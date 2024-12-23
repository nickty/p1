const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  stage: {
    type: String,
    enum: ['new', 'engaged', 'ordered', 'closed lost'],
    default: 'new',
  },
  totalRevenue: { type: Number, default: 0 },
  touchpoints: { type: Number, default: 0 },
});

const noteSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  type: { type: String, enum: ['call', 'email'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
  salesAgent: String,
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

// API Routes
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    res.json(customer);
  } catch (error) {
    res.status(404).json({ message: 'Customer not found' });
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

app.post('/api/customers/:id/notes', async (req, res) => {
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

app.post('/api/customers/:id/orders', async (req, res) => {
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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));