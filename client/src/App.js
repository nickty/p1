import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import CustomerList from './components/CustomerList';
import CustomerDetails from './components/CustomerDetails';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
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

        <div className="container mx-auto p-4">
          <Switch>
            <Route path="/" exact>
              <h1 className="text-3xl font-bold text-center mt-8">Welcome to CRM</h1>
            </Route>
            <Route path="/customers" exact component={CustomerList} />
            <Route path="/customer/:id" component={CustomerDetails} />
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;