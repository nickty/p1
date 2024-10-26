// AddCustomer.js
import React, { useState } from 'react';
import { createCustomer } from '../services/api';
import './AddCustomer.css';


const AddCustomer = () => {
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [successMessage, setSuccessMessage] = useState('');

  const addCustomer = async () => {
    try {
      await createCustomer(newCustomer);
      setSuccessMessage('Customer added successfully!');
      setNewCustomer({ name: '', email: '', phone: '' });
      setTimeout(() => setSuccessMessage(''), 3000); // Hide message after 3 seconds
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  return (
    <div className="add-customer-container">
      <h2 className="title">Add New Customer</h2>
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <div className="form-container">
        <input
          className="input-field"
          placeholder="Name"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Email"
          value={newCustomer.email}
          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Phone"
          value={newCustomer.phone}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
        />
        <button
          className="add-button"
          onClick={addCustomer}
        >
          Add Customer
        </button>
      </div>
    </div>
  );
};

export default AddCustomer;
