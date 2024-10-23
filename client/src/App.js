import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Components
const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const response = await axios.get('/api/customers');
    setCustomers(response.data);
  };

  const addCustomer = async () => {
    await axios.post('/api/customers', newCustomer);
    setNewCustomer({ name: '', email: '', phone: '' });
    fetchCustomers();
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          placeholder="Name"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Email"
          value={newCustomer.email}
          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Phone"
          value={newCustomer.phone}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
        />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={addCustomer}>Add Customer</button>
      </div>
      {customers.map((customer) => (
        <div key={customer._id} className="border p-4 mb-4 rounded">
          <h3 className="text-xl font-semibold">{customer.name}</h3>
          <p>Email: {customer.email}</p>
          <p>Phone: {customer.phone}</p>
          <p>Stage: {customer.stage}</p>
          <p>Total Revenue: ${customer.totalRevenue}</p>
          <p>Touchpoints: {customer.touchpoints}</p>
          <Link to={`/customer/${customer._id}`} className="text-blue-500">
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
};

const CustomerDetails = ({ id }) => {
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newNote, setNewNote] = useState({ type: 'call', content: '', salesAgent: '' });
  const [newOrder, setNewOrder] = useState({ amount: 0, description: '' });

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    const customerResponse = await axios.get(`/api/customers/${id}`);
    setCustomer(customerResponse.data);
    const notesResponse = await axios.get(`/api/customers/${id}/notes`);
    setNotes(notesResponse.data);
    const ordersResponse = await axios.get(`/api/customers/${id}/orders`);
    setOrders(ordersResponse.data);
  };

  const addNote = async () => {
    await axios.post(`/api/customers/${id}/notes`, newNote);
    setNewNote({ type: 'call', content: '', salesAgent: '' });
    fetchCustomerDetails();
  };

  const addOrder = async () => {
    await axios.post(`/api/customers/${id}/orders`, newOrder);
    setNewOrder({ amount: 0, description: '' });
    fetchCustomerDetails();
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{customer.name}</h2>
      <p>Email: {customer.email}</p>
      <p>Phone: {customer.phone}</p>
      <p>Stage: {customer.stage}</p>
      <p>Total Revenue: ${customer.totalRevenue}</p>
      <p>Touchpoints: {customer.touchpoints}</p>

      <h3 className="text-xl font-semibold mt-4 mb-2">Notes</h3>
      <div className="mb-4">
        <select
          className="border p-2 mr-2"
          value={newNote.type}
          onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
        >
          <option value="call">Call</option>
          <option value="email">Email</option>
        </select>
        <input
          className="border p-2 mr-2"
          placeholder="Content"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Sales Agent"
          value={newNote.salesAgent}
          onChange={(e) => setNewNote({ ...newNote, salesAgent: e.target.value })}
        />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={addNote}>Add Note</button>
      </div>
      {notes.map((note) => (
        <div key={note._id} className="border p-2 mb-2 rounded">
          <p>Type: {note.type}</p>
          <p>Content: {note.content}</p>
          <p>Sales Agent: {note.salesAgent}</p>
          <p>Timestamp: {new Date(note.timestamp).toLocaleString()}</p>
        </div>
      ))}

      <h3 className="text-xl font-semibold mt-4 mb-2">Orders</h3>
      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          type="number"
          placeholder="Amount"
          value={newOrder.amount}
          onChange={(e) => setNewOrder({ ...newOrder, amount: parseFloat(e.target.value) })}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Description"
          value={newOrder.description}
          onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
        />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={addOrder}>Add Order</button>
      </div>
      {orders.map((order) => (
        <div key={order._id} className="border p-2 mb-2 rounded">
          <p>Amount: ${order.amount}</p>
          <p>Description: {order.description}</p>
          <p>Date: {new Date(order.date).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div>
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-gray-300">Home</Link>
            </li>
            <li>
              <Link to="/customers" className="hover:text-gray-300">Customers</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<h1 className="text-3xl font-bold text-center mt-8">Welcome to CRM</h1>} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customer/:id" element={<CustomerDetails />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
