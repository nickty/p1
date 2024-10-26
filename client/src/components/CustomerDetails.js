// CustomerDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomer, getNotes, createNote, getOrders, createOrder } from '../services/api';
import './CustomerDetails.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newNote, setNewNote] = useState({ type: 'call', content: '', salesAgent: '' });
  const [newOrder, setNewOrder] = useState({ amount: 0, description: '' });

  useEffect(() => {
    fetchCustomerDetails();
  },[id]);

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

  if (!customer) return <div className="loading">Loading...</div>;

  return (
    <div className="customer-details-container">
      <div className="customer-info">
        <h2 className="customer-name">{customer.name}</h2>
        <p>Email: <span>{customer.email}</span></p>
        <p>Phone: <span>{customer.phone}</span></p>
        <p>Stage: <span>{customer.stage}</span></p>
        <p>Total Revenue: <span>${customer.totalRevenue}</span></p>
        <p>Touchpoints: <span>{customer.touchpoints}</span></p>
      </div>

      <div className="notes-section">
        <h3>Notes</h3>
        <div className="note-inputs">
          <select
            value={newNote.type}
            onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
          >
            <option value="call">Call</option>
            <option value="email">Email</option>
          </select>
          <input
            placeholder="Content"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />
          <input
            placeholder="Sales Agent"
            value={newNote.salesAgent}
            onChange={(e) => setNewNote({ ...newNote, salesAgent: e.target.value })}
          />
          <button onClick={addNote}>Add Note</button>
        </div>
        <div className="notes-list">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <p>Type: {note.type}</p>
              <p>Content: {note.content}</p>
              <p>Sales Agent: {note.salesAgent}</p>
              <p>Timestamp: {new Date(note.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="orders-section">
        <h3>Orders</h3>
        <div className="order-inputs">
          <input
            type="number"
            placeholder="Amount"
            value={newOrder.amount}
            onChange={(e) => setNewOrder({ ...newOrder, amount: parseFloat(e.target.value) })}
          />
          <input
            placeholder="Description"
            value={newOrder.description}
            onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
          />
          <button onClick={addOrder}>Add Order</button>
        </div>
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <p>Amount: ${order.amount}</p>
              <p>Description: {order.description}</p>
              <p>Date: {new Date(order.date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
