import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { Settings, Pin, Star, Search, X, LogOut } from 'lucide-react'
import debounce from 'lodash.debounce';

// Assuming you've set up a proxy in package.json or using environment variables
const API_BASE_URL = 'http://7websites.com/api'

function Button({ children, variant = 'primary', ...props }) {
  const baseStyle = "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  }
  return (
    <button className={`${baseStyle} ${variants[variant]}`} {...props}>
      {children}
    </button>
  )
}

function Input({ ...props }) {
  return <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />
}

function Select({ children, ...props }) {
  return (
    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...props}>
      {children}
    </select>
  )
}

function Card({ children, ...props }) {
  return <div className="bg-white shadow-md rounded-lg overflow-hidden" {...props}>{children}</div>
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { username, password })
      onLogin(response.data)
    } catch (error) {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to TopGlanz Hannover CRM
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', stage: 'new' })
  const [newNote, setNewNote] = useState({ type: 'call', content: '', salesAgent: '' })
  const [newOrder, setNewOrder] = useState({ amount: 0, description: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('customers')
  const [kpiFilter, setKpiFilter] = useState('all')
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [editingOrder, setEditingOrder] = useState(null)
  const [showStageChangeDialog, setShowStageChangeDialog] = useState(false)
  const [newStage, setNewStage] = useState('new')
  const [stageChangePassword, setStageChangePassword] = useState('')
  const [adminSettings, setAdminSettings] = useState({
    showTotalRevenue: true,
    showCustomerStage: true,
    showTouchpoints: true,
    showKPIs: true,
  })
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [user, setUser] = useState(null)

  const stages = ['new', 'engaged', 'ordered', 'closed lost']

  const [pinnedNotes, setPinnedNotes] = useState([])
  const [pinnedNotesError, setPinnedNotesError] = useState(null)

  const handleLogout = () => {
    // Remove the token (assuming it's stored in localStorage)
    localStorage.removeItem('userToken')
    // Reset the user state
    setUser(null)
    // Reset any other necessary state
    setActiveSection('customers')
    setIsAdminMode(false)
    setIsAdminPortalOpen(false)
  }


  // Define fetchCustomers using useCallback
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, [user]); // Add 'user' as a dependency because it is used inside the function

  const fetchPinnedNotes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notes/pinned`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      if (Array.isArray(response.data)) {
        setPinnedNotes(response.data)
      } else {
        console.error('Unexpected data format for pinned notes:', response.data)
        setPinnedNotesError('Unexpected data format for pinned notes')
      }
    } catch (error) {
      console.error('Error fetching pinned notes:', error)
      setPinnedNotesError('Failed to fetch pinned notes')
    }
  }, [user])

  // UseEffect hook that runs fetchCustomers
  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchPinnedNotes()
    }
  }, [user, activeSection, fetchCustomers, fetchPinnedNotes]);


  const addCustomer = async () => {
    if (newCustomer.name.trim()) {
      try {
        const response = await axios.post(`${API_BASE_URL}/customers`, newCustomer, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setCustomers([...customers, response.data])
        setNewCustomer({ name: '', phone: '', email: '', stage: 'new' })
      } catch (error) {
        console.error('Error adding customer:', error)
      }
    }
  }

  const debouncedUpdateCustomerFunc = useMemo(
    () =>
      debounce(async (updatedCustomer, setCustomers, setSelectedCustomer) => {
        try {
          const response = await axios.put(`${API_BASE_URL}/customers/${updatedCustomer._id}`, updatedCustomer, {
            headers: { Authorization: `Bearer ${user.token}` }
          });

          // Update state with the response
          setCustomers(prevCustomers =>
            prevCustomers.map(c => (c._id === response.data._id ? response.data : c))
          );
          setSelectedCustomer(response.data);
        } catch (error) {
          console.error('Error updating customer:', error);
        }
      }, 750),
    [user] // Dependency array includes user to ensure the token is always current
  );

  const debouncedUpdateCustomer = useCallback(
    (updatedCustomer) => {
      debouncedUpdateCustomerFunc(updatedCustomer, setCustomers, setSelectedCustomer);
    },
    [debouncedUpdateCustomerFunc, setCustomers, setSelectedCustomer]
  );

  const handleChange = (field, value) => {
    const updatedCustomer = { ...selectedCustomer, [field]: value };
    setSelectedCustomer(updatedCustomer);  // Update local state immediately
    debouncedUpdateCustomer(updatedCustomer);  // Trigger debounced API update
  };

  const updateCustomer = async (updatedCustomer) => {
    try {
      // First, check if the customer still exists
      const checkResponse = await axios.get(`${API_BASE_URL}/customers/${updatedCustomer._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      if (!checkResponse.data) {
        throw new Error('Customer not found')
      }

      const response = await axios.put(`${API_BASE_URL}/customers/${updatedCustomer._id}`, updatedCustomer, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setCustomers(customers.map(c => c._id === response.data._id ? response.data : c))
      setSelectedCustomer(response.data)
      // toast.success('Customer updated successfully!')
    } catch (error) {
      console.error('Error updating customer:', error)
      if (error.response && error.response.status === 404) {
        console.log('Customer not found. They may have been deleted.')
        // Remove the customer from the local state
        setCustomers(customers.filter(c => c._id !== updatedCustomer._id))
        setSelectedCustomer(null)
        setActiveSection('customers')
      } else {
        console.log('Failed to update customer. Please try again.')
      }
    }
  }

  const addNote = async () => {
    if (selectedCustomer && newNote.content.trim()) {
      try {
        const response = await axios.put(`${API_BASE_URL}/customers/${selectedCustomer._id}/notes`, {
          ...newNote,
          timestamp: new Date().toISOString(),
          isPinned: false,
          isHighlighted: false,
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        // Update selectedCustomer with new note without reload
        const updatedCustomer = {
          ...selectedCustomer,
          notes: [...selectedCustomer.notes, response.data],
          contacts: selectedCustomer.contacts + 1,
          touchpoints: selectedCustomer.touchpoints + 1,
          stage: selectedCustomer.stage === 'new' ? 'engaged' : selectedCustomer.stage,
        };

        setSelectedCustomer(updatedCustomer);
        setNewNote({ type: 'call', content: '', salesAgent: '' });
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const toggleNotePinned = async (noteId) => {
    if (selectedCustomer) {
      try {
        const note = selectedCustomer.notes.find(n => n._id === noteId);
        const response = await axios.put(`${API_BASE_URL}/notes/${noteId}`, {
          ...note,
          isPinned: !note.isPinned,
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        // Update the note within selectedCustomer without reload
        const updatedNotes = selectedCustomer.notes.map(n =>
          n._id === noteId ? response.data : n
        );
        const updatedCustomer = { ...selectedCustomer, notes: updatedNotes };
        setSelectedCustomer(updatedCustomer);
      } catch (error) {
        console.error('Error toggling note pin:', error);
      }
    }
  };

  const handlePinnedNoteClick = (customerId) => {
    const customer = customers.find(c => c._id === customerId)
    if (customer) {
      setSelectedCustomer(customer)
      setActiveSection('details')
    } else {
      console.log('Customer not found for the pinned note')
    }
  }

  const renderPinnedNotes = () => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Pinned Notes</h2>
      {pinnedNotesError ? (
        <p className="text-red-500">{pinnedNotesError}</p>
      ) : pinnedNotes.length === 0 ? (
        <p>No pinned notes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pinnedNotes?.map(note => (
            <Card
              key={note._id}
              className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => handlePinnedNoteClick(note.customerId._id)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{note.customerName || 'Unknown Customer'}</span>
                <div className="flex space-x-2">
                  <Pin className="w-4 h-4 text-blue-500" />
                  {note.isHighlighted && <Star className="w-4 h-4 text-yellow-500" />}
                </div>
              </div>
              <p className="text-sm mb-2">{note.content}</p>
              <div className="text-xs text-gray-500">
                <span>{note.salesAgent}</span>
                <span className="mx-1">•</span>
                <span>{new Date(note.timestamp).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const toggleNoteHighlighted = async (noteId) => {
    if (selectedCustomer) {
      try {
        const note = selectedCustomer.notes.find(n => n._id === noteId);
        const response = await axios.put(`${API_BASE_URL}/notes/${noteId}`, {
          ...note,
          isHighlighted: !note.isHighlighted,
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        // Update the note within selectedCustomer without reload
        const updatedNotes = selectedCustomer.notes.map(n =>
          n._id === noteId ? response.data : n
        );
        const updatedCustomer = { ...selectedCustomer, notes: updatedNotes };
        setSelectedCustomer(updatedCustomer);
      } catch (error) {
        console.error('Error toggling note highlight:', error);
      }
    }
  };

  const addOrder = async () => {
    if (selectedCustomer && newOrder.amount > 0) {
      try {
        // Make an API call to add an order specifically to the selected customer
        const response = await axios.put(`${API_BASE_URL}/customers/${selectedCustomer._id}/orders`, {
          ...newOrder,
          date: new Date().toISOString(),
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        // Update the selectedCustomer state with the new order locally after the API call
        const updatedCustomer = {
          ...selectedCustomer,
          orders: [...selectedCustomer.orders, response.data],
          totalRevenue: selectedCustomer.totalRevenue + newOrder.amount,
          stage: 'ordered',
        };

        setSelectedCustomer(updatedCustomer); // Update local state with the new order
        setNewOrder({ amount: 0, description: '' }); // Reset the new order form
      } catch (error) {
        console.error('Error adding order:', error);
      }
    }
  };

  const deleteOrder = async (orderId) => {
    if (selectedCustomer) {
      try {
        await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const orderToDelete = selectedCustomer.orders.find(order => order._id === orderId)
        const updatedCustomer = {
          ...selectedCustomer,
          orders: selectedCustomer.orders.filter(order => order._id !== orderId),
          totalRevenue: selectedCustomer.totalRevenue - orderToDelete.amount
        }
        await updateCustomer(updatedCustomer)
      } catch (error) {
        console.error('Error deleting order:', error)
      }
    }
  }

  const updateOrder = async (updatedOrder) => {
    if (selectedCustomer) {
      try {
        const response = await axios.put(`${API_BASE_URL}/orders/${updatedOrder._id}`, updatedOrder, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const oldOrder = selectedCustomer.orders.find(order => order._id === updatedOrder._id)
        const updatedCustomer = {
          ...selectedCustomer,
          orders: selectedCustomer.orders.map(order =>
            order._id === updatedOrder._id ? response.data : order),
          totalRevenue: selectedCustomer.totalRevenue - oldOrder.amount + updatedOrder.amount
        }
        await updateCustomer(updatedCustomer)
        setEditingOrder(null)
      } catch (error) {
        console.error('Error updating order:', error)
      }
    }
  }

  // const handleAdminLogin = () => {
  //   if (adminPassword === 'GULFSTREAM') {
  //     setIsAdminMode(true)
  //     setAdminPassword('')
  //     setShowAdminDialog(false)
  //     setIsAdminPortalOpen(true)
  //   } else {
  //     alert('Incorrect password')
  //   }
  // }

  const handleAdminLogin = () => {
    
      setIsAdminMode(true)
      setIsAdminPortalOpen(true)
   
  }

  // const handleAdminLogout = () => {
  //   setIsAdminMode(false)
  //   setIsAdminPortalOpen(false)
  // }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  const calculateKPIs = (customerId) => {
    const filteredCustomers = customerId === 'all'
      ? customers
      : customers.filter(c => c._id.toString() === customerId)

    const totalCustomers = filteredCustomers.length
    const orderedCustomers = filteredCustomers.filter(c => c.stage === 'ordered').length
    const totalRevenue = filteredCustomers.reduce((sum, customer) => sum + customer.totalRevenue, 0)
    const totalTouchpoints = filteredCustomers.reduce((sum, customer) => sum + customer.touchpoints, 0)

    const activityPerSalesAgent = {}
    filteredCustomers.forEach(customer => {
      customer?.notes?.forEach(note => {
        activityPerSalesAgent[note.salesAgent] = (activityPerSalesAgent[note.salesAgent] || 0) + 1
      })
    })

    return {
      clv: totalRevenue / orderedCustomers || 0,
      conversionRate: (orderedCustomers / totalCustomers) * 100 || 0,
      averageTouchpoints: totalTouchpoints / totalCustomers || 0,
      activityPerSalesAgent,
      revenuePerTouchpoint: totalRevenue / totalTouchpoints || 0
    }
  }

  const kpis = calculateKPIs(kpiFilter)

  const renderStageBar = (currentStage) => (
    <div className="flex mb-4">
      {stages.map((stage, index) => (
        <div
          key={stage}
          className={`flex-1 p-2 text-center ${stages.indexOf(currentStage) >= index
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800'
            } ${index === 0 ? 'rounded-l-lg' : ''} ${index === stages.length - 1 ? 'rounded-r-lg' : ''}`}
        >
          {stage}
        </div>
      ))}
    </div>
  )

  const renderCustomers = () => (
    <div className="space-y-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Customer</h2>

        <input
          type="text"
          placeholder="Name"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Phone"
          value={newCustomer.phone}
          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Email"
          value={newCustomer.email}
          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={addCustomer}
          className="w-full bg-gray-600 text-white font-semibold py-2 rounded-md flex items-center justify-center hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Customer</span>
        </button>
      </div>

      <div className="relative">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-10 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
        />
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-600"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => (
          <Card
            key={customer._id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => {
              setSelectedCustomer(customer)
              setActiveSection('details')
            }}
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <p className="text-sm text-gray-600">{customer.email}</p>
              <p className="text-sm text-gray-600">{customer.phone}</p>
              {adminSettings.showCustomerStage && (
                <p className="text-sm text-gray-600 mt-2">Stage: {customer.stage}</p>
              )}
              {(isAdminMode && adminSettings.showTotalRevenue) && (
                <p className="text-sm text-gray-600">Revenue: €{customer.totalRevenue.toFixed(2)}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
      {renderPinnedNotes()}
    </div>
  )

  const renderCustomerDetails = () => (
    <div className="space-y-6">
      {selectedCustomer ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
            <Button variant="secondary" onClick={() => setActiveSection('customers')}>
              Back to Customers
            </Button>
          </div>
          {adminSettings.showCustomerStage && renderStageBar(selectedCustomer.stage)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={selectedCustomer.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Name"
            />
            <Input
              value={selectedCustomer.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Phone"
            />
            <Input
              value={selectedCustomer.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Email"
            />
            {/* {adminSettings.showCustomerStage && (
              <Select
                value={selectedCustomer.stage}
                onChange={(e) => {
                  const currentIndex = stages.indexOf(selectedCustomer.stage);
                  const newIndex = stages.indexOf(e.target.value);
                  if (newIndex < currentIndex) {
                    setShowStageChangeDialog(true);
                    setNewStage(e.target.value);
                  } else {
                    updateCustomer({ ...selectedCustomer, stage: e.target.value });
                  }
                }}
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </Select>
            )} */}

            {adminSettings.showCustomerStage && (
              <Select
                value={selectedCustomer.stage}
                onChange={(e) => {
                  const currentIndex = stages.indexOf(selectedCustomer.stage);
                  const newIndex = stages.indexOf(e.target.value);
                  if (newIndex < currentIndex && user.user.role !== 'admin') {
                    alert('Only admins can reverse customer stages.');
                  } else {
                    setNewStage(e.target.value);
                    updateCustomer({ ...selectedCustomer, stage: e.target.value });
                  }
                }}
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </Select>
            )}
            {(isAdminMode && adminSettings.showTotalRevenue) && (
              <Input
                type="number"
                value={selectedCustomer.totalRevenue}
                onChange={(e) => updateCustomer({ ...selectedCustomer, totalRevenue: parseFloat(e.target.value) || 0 })}
                placeholder="Total Revenue (€)"
                readOnly
              />
            )}
            {adminSettings.showTouchpoints && (
              <Input
                type="number"
                value={selectedCustomer.touchpoints}
                placeholder="Touchpoints"
                readOnly
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <div className="space-y-2 mb-4">
                  <Select
                    value={newNote.type}
                    onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                  </Select>
                  <Input
                    placeholder="Sales Agent"
                    value={newNote.salesAgent}
                    onChange={(e) => setNewNote({ ...newNote, salesAgent: e.target.value })}
                  />
                  <textarea
                    placeholder="Note content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <Button onClick={addNote}>Add Note</Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedCustomer?.notes
                    ?.sort((a, b) => {
                      if (a.isPinned && !b.isPinned) return -1;
                      if (!a.isPinned && b.isPinned) return 1;
                      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                    })
                    .map(note => (
                      <div key={note._id} className={`p-2 rounded ${note.isHighlighted ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{note.type}</span>
                          <div className="flex space-x-2">
                            <button onClick={() => toggleNotePinned(note._id)}>
                              <Pin className={`w-4 h-4 ${note.isPinned ? 'text-blue-500' : 'text-gray-500'}`} />
                            </button>
                            <button onClick={() => toggleNoteHighlighted(note._id)}>
                              <Star className={`w-4 h-4 ${note.isHighlighted ? 'text-yellow-500' : 'text-gray-500'}`} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm">{note.content}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>{note.salesAgent}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Orders</h3>
                <div className="space-y-2 mb-4">
                  <Input
                    type="number"
                    placeholder="Amount (€)"
                    value={newOrder.amount}
                    onChange={(e) => setNewOrder({ ...newOrder, amount: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="Description"
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                  />
                  <Button onClick={addOrder}>Add Order</Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedCustomer?.orders?.map(order => (
                    <div key={order._id} className="p-2 bg-gray-100 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">€{order.amount.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm mt-1">{order.description}</p>
                      {isAdminMode && (
                        <div className="mt-2 flex justify-end space-x-2">
                          <Button variant="secondary" onClick={() => setEditingOrder(order)}>Edit</Button>
                          <Button variant="danger" onClick={() => deleteOrder(order._id)}>Delete</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <p>Select a customer to view details</p>
      )}
    </div>
  )

  const renderKPIs = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">KPIs</h2>
      <div className="mb-4">
        <label htmlFor="kpi-filter" className="block text-sm font-medium text-gray-700">Filter KPIs by Customer</label>
        <Select id="kpi-filter" value={kpiFilter} onChange={(e) => setKpiFilter(e.target.value)}>
          <option value="all">All Customers</option>
          {customers?.map(customer => (
            <option key={customer._id} value={customer._id}>{customer.name}</option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Customer Lifetime Value</h3>
            <p className="text-2xl font-bold">€{kpis.clv.toFixed(2)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
            <p className="text-2xl font-bold">{kpis.conversionRate.toFixed(2)}%</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Average Touchpoints</h3>
            <p className="text-2xl font-bold">{kpis.averageTouchpoints.toFixed(2)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Revenue per Touchpoint</h3>
            <p className="text-2xl font-bold">€{kpis.revenuePerTouchpoint.toFixed(2)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Activity per Sales Agent</h3>
            {Object.entries(kpis.activityPerSalesAgent).map(([agent, activity]) => (
              <div key={agent} className="flex justify-between">
                <span>{agent}:</span>
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderAdminDialog = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${showAdminDialog ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <Input
          type="password"
          placeholder="Enter admin password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={handleAdminLogin}>Login</Button>
          <Button variant="secondary" onClick={() => setShowAdminDialog(false)}>Cancel</Button>
        </div>
      </div>
    </div>
  )

  const renderAdminPortal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isAdminPortalOpen ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={adminSettings.showTotalRevenue}
              onChange={(e) => setAdminSettings({ ...adminSettings, showTotalRevenue: e.target.checked })}
            />
            <span>Show Total Revenue</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={adminSettings.showCustomerStage}
              onChange={(e) => setAdminSettings({ ...adminSettings, showCustomerStage: e.target.checked })}
            />
            <span>Show Customer Stage</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={adminSettings.showTouchpoints}
              onChange={(e) => setAdminSettings({ ...adminSettings, showTouchpoints: e.target.checked })}
            />
            <span>Show Touchpoints</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={adminSettings.showKPIs}
              onChange={(e) => setAdminSettings({ ...adminSettings, showKPIs: e.target.checked })}
            />
            <span>Show KPIs</span>
          </label>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          {/* <Button onClick={handleAdminLogout}>Logout</Button> */}
          <Button variant="secondary" onClick={() => setIsAdminPortalOpen(false)}>Close</Button>
        </div>
      </div>
    </div>
  )

  const renderStageChangeDialog = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${showStageChangeDialog ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Confirm Stage Change</h2>
        <p className="mb-4">Are you sure you want to change the stage from {selectedCustomer?.stage} to {newStage}?</p>
        <Input
          type="password"
          placeholder="Enter admin password"
          value={stageChangePassword}
          onChange={(e) => setStageChangePassword(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={() => {
            if (stageChangePassword === 'GULFSTREAM') {
              updateCustomer({ ...selectedCustomer, stage: newStage })
              setShowStageChangeDialog(false)
              setStageChangePassword('')
            } else {
              alert('Incorrect password')
            }
          }}>Confirm</Button>
          <Button variant="secondary" onClick={() => {
            setShowStageChangeDialog(false)
            setStageChangePassword('')
          }}>Cancel</Button>
        </div>
      </div>
    </div>
  )

  const renderHelpDialog = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${showHelpDialog ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Help & Information</h2>
        <div className="space-y-4">
          <section>
            <h3 className="text-xl font-semibold mb-2">Customer Management</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Add new customers using the form at the top of the customer list.</li>
              <li>Search for customers using the search bar.</li>
              <li>Click on a customer card to view and edit their details.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold mb-2">Customer Details</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Edit customer information directly in the input fields.</li>
              <li>Add notes and orders using the respective forms.</li>
              <li>Pin or highlight important notes for quick reference.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold mb-2">Admin Features</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access admin settings by clicking the gear icon and entering the password.</li>
              <li>Toggle visibility of total revenue, customer stage, and touchpoints.</li>
              <li>View and analyze KPIs for individual customers or all customers.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold mb-2">Tips</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Regularly update customer information to maintain accurate records.</li>
              <li>Use the notes feature to keep track of all customer interactions.</li>
              <li>Monitor KPIs to identify trends and improve your sales process.</li>
            </ul>
          </section>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
        </div>
      </div>
    </div>
  )

  const renderEditOrderDialog = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${editingOrder ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Edit Order</h2>
        {editingOrder && (
          <>
            <Input
              type="number"
              value={editingOrder.amount}
              onChange={(e) => setEditingOrder({ ...editingOrder, amount: parseFloat(e.target.value) || 0 })}
              className="mb-2"
            />
            <Input
              value={editingOrder.description}
              onChange={(e) => setEditingOrder({ ...editingOrder, description: e.target.value })}
              className="mb-2"
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={() => updateOrder(editingOrder)}>Save</Button>
              <Button variant="secondary" onClick={() => setEditingOrder(null)}>Cancel</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // const handleLogin = (userData) => {
  //   setUser(userData);
  // };

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('userToken', userData.token)
    localStorage.setItem('userRole', userData.user.role)
    if (userData.user.role === 'admin') {
      setIsAdminMode(true)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    const role = localStorage.getItem('userRole')
    if (token && role) {
      setUser({ token, user: { role } })
      if (role === 'admin') {
        setIsAdminMode(true)
      }
    }
  }, [])

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 onClick={() => setActiveSection('customers')} className="text-3xl font-bold cursor-pointer">
            TopGlanz Hannover CRM
          </h1>
          <div className="flex items-center space-x-6">
            {/* <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setShowAdminDialog(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Settings className="w-5 h-5 mr-2 text-gray-300" />
                <span>Settings</span>
              </Button>
              {isAdminMode && (
                <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-black bg-green-400" />
              )}
            </div> */}
            {user.user.role === 'admin' && (
              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={handleAdminLogin}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Settings className="w-5 h-5 mr-2 text-gray-300" />
                  <span>Settings</span>
                </Button>
                {isAdminMode && (
                  <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-black bg-green-400" />
                )}
              </div>
            )}
            <Select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="bg-gray-700 text-white text-sm px-3 py-2 rounded-md border border-gray-500 focus:outline-none"
            >
              <option value="customers">Customers</option>
              {adminSettings.showKPIs && <option value="kpis">KPIs</option>}
            </Select>
            <Button variant="secondary" onClick={() => setShowHelpDialog(true)}>Help</Button>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main>
        <div className="container mx-auto py-8">
          {activeSection === 'customers' && renderCustomers()}
          {activeSection === 'details' && renderCustomerDetails()}
          {activeSection === 'kpis' && renderKPIs()}

        </div>
      </main>
      {renderAdminDialog()}
      {renderAdminPortal()}
      {renderStageChangeDialog()}
      {renderHelpDialog()}
      {renderEditOrderDialog()}
    </div>
  )
}

export default App