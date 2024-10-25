import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import CustomerList from './components/CustomerList';
import CustomerDetails from './components/CustomerDetails';
import './App.css';

const App = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-left">
              <Link to="/" className="navbar-logo">CRM</Link>
              <div className="dropdown">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="dropdown-button"
                >
                  Menu
                </button>
                {dropdownOpen && (
                  <div className="dropdown-content">
                    <Link to="/customers" onClick={() => setDropdownOpen(false)}>Customers</Link>
                    <Link to="/" onClick={() => setDropdownOpen(false)}>Home</Link>
                    <Link to="/about" onClick={() => setDropdownOpen(false)}>About Us</Link>
                  </div>
                )}
              </div>
              <div className="dropdown">
                <button
                  onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                  className="dropdown-button"
                >
                  Customer Actions
                </button>
                {customerDropdownOpen && (
                  <div className="dropdown-content">
                    <Link to="/customers" onClick={() => setCustomerDropdownOpen(false)}>Add New Customer</Link>
                    <Link to="/customers/view-all" onClick={() => setCustomerDropdownOpen(false)}>View All Customers</Link>
                    <Link to="/customers/reports" onClick={() => setCustomerDropdownOpen(false)}>Customer Reports</Link>
                  </div>
                )}
              </div>
            </div>
            <div className="navbar-right">
              <Link to="/profile" className="navbar-link">Profile</Link>
            </div>
          </div>
        </nav>

        <div className="content-container">
          <Routes>
            <Route
              path="/"
              element={<h1 className="home-title">Welcome to CRM</h1>}
            />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customer/:id" element={<CustomerDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
