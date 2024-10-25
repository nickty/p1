import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, createCustomer } from '../services/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const fetchedCustomers = await getCustomers();
    setCustomers(fetchedCustomers);
  };

  const addCustomer = async () => {
    await createCustomer(newCustomer);
    setNewCustomer({ name: '', email: '', phone: '' });
    fetchCustomers();
  };

  return (
    <div>
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

export default CustomerList;