import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomer, getNotes, createNote, getOrders, createOrder } from '../services/api';

const CustomerDetails = ({id}) => {
  // const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newNote, setNewNote] = useState({ type: 'call', content: '', salesAgent: '' });
  const [newOrder, setNewOrder] = useState({ amount: 0, description: '' });

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    const fetchedCustomer = await getCustomer(id);
    setCustomer(fetchedCustomer);
    const fetchedNotes = await getNotes(id);
    setNotes(fetchedNotes);
    const fetchedOrders = await getOrders(id);
    setOrders(fetchedOrders);
  };

  const addNote = async () => {
    await createNote(id, newNote);
    setNewNote({ type: 'call', content: '', salesAgent: '' });
    fetchCustomerDetails();
  };

  const addOrder = async () => {
    await createOrder(id, newOrder);
    setNewOrder({ amount: 0, description: '' });
    fetchCustomerDetails();
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div>
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

export default CustomerDetails;