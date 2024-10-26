// CustomerList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers } from '../services/api';
import './CustomerList.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const fetchedCustomers = await getCustomers();
    setCustomers(fetchedCustomers);
  };

  return (
    <div className="customer-list-container">
      <h2 className="title">Customers</h2>
      <div className="customer-list">
        {customers.map((customer) => (
          <div key={customer._id} className="customer-card">
            <h3 className="customer-name">{customer.name}</h3>
            <p>Email: {customer.email}</p>
            <p>Phone: {customer.phone}</p>
            <p>Stage: {customer.stage}</p>
            <p>Total Revenue: ${customer.totalRevenue}</p>
            <p>Touchpoints: {customer.touchpoints}</p>
            <Link to={`/customer/${customer._id}`} className="view-details">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;
