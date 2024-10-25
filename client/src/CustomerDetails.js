import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const CustomerDetails = ({ id }) => {
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newNote, setNewNote] = useState({ type: 'call', content: '', salesAgent: '' });
  const [newOrder, setNewOrder] = useState({ amount: 0, description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const customerResponse = await axios.get(`/api/customers/${id}`);
      setCustomer(customerResponse.data);
      const notesResponse = await axios.get(`/api/customers/${id}/notes`);
      setNotes(notesResponse.data);
      const ordersResponse = await axios.get(`/api/customers/${id}/orders`);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
    setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!customer) return <div className="text-center mt-10">Customer not found.</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{customer.name}</h2>
        <p className="text-gray-600">Email: {customer.email}</p>
        <p className="text-gray-600">Phone: {customer.phone}</p>
        <p className="text-gray-600">Stage: {customer.stage}</p>
        <p className="text-gray-600">Total Revenue: ${customer.totalRevenue}</p>
        <p className="text-gray-600">Touchpoints: {customer.touchpoints}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Notes</h3>
          <div className="mb-4">
            <select
              className="border border-gray-300 p-2 rounded mb-2 focus:ring-2 focus:ring-blue-500"
              value={newNote.type}
              onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
            </select>
            <input
              className="border border-gray-300 p-2 rounded mb-2 w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
            <input
              className="border border-gray-300 p-2 rounded mb-2 w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Sales Agent"
              value={newNote.salesAgent}
              onChange={(e) => setNewNote({ ...newNote, salesAgent: e.target.value })}
            />
            <button
              className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors"
              onClick={addNote}
            >
              Add Note
            </button>
          </div>
          {notes.map((note) => (
            <div key={note._id} className="border border-gray-300 rounded-lg p-4 mb-2">
              <p className="text-gray-800">Type: {note.type}</p>
              <p className="text-gray-600">Content: {note.content}</p>
              <p className="text-gray-600">Sales Agent: {note.salesAgent}</p>
              <p className="text-gray-500 text-sm">Timestamp: {new Date(note.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Orders</h3>
          <div className="mb-4">
            <input
              className="border border-gray-300 p-2 rounded mb-2 w-full focus:ring-2 focus:ring-blue-500"
              type="number"
              placeholder="Amount"
              value={newOrder.amount}
              onChange={(e) => setNewOrder({ ...newOrder, amount: parseFloat(e.target.value) })}
            />
            <input
              className="border border-gray-300 p-2 rounded mb-2 w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Description"
              value={newOrder.description}
              onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
            />
            <button
              className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors"
              onClick={addOrder}
            >
              Add Order
            </button>
          </div>
          {orders.map((order) => (
            <div key={order._id} className="border border-gray-300 rounded-lg p-4 mb-2">
              <p className="text-gray-800">Amount: ${order.amount}</p>
              <p className="text-gray-600">Description: {order.description}</p>
              <p className="text-gray-500 text-sm">Date: {new Date(order.date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
