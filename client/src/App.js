import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { Settings, Pin, Star, Search, X } from 'lucide-react'
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

  const stages = ['new', 'engaged', 'ordered', 'closed lost']

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`)
      console.log("see customer", response.data)
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const addCustomer = async () => {
    if (newCustomer.name.trim()) {
      try {
        const response = await axios.post(`${API_BASE_URL}/customers`, newCustomer)
        setCustomers([...customers, response.data])
        setNewCustomer({ name: '', phone: '', email: '', stage: 'new' })
      } catch (error) {
        console.error('Error adding customer:', error)
      }
    }
  }

  // const debouncedUpdateCustomer = debounce(async (updatedCustomer) => {
  //   try {
  //     const response = await axios.put(`${API_BASE_URL}/customers/${updatedCustomer._id}`, updatedCustomer);
  //     setCustomers(customers.map(c => (c._id === response.data._id ? response.data : c)));
  //     setSelectedCustomer(response.data);
  //   } catch (error) {
  //     console.error('Error updating customer:', error);
  //   }
  // }, 750);

  // const debouncedUpdateCustomer = useCallback(
  //   debounce(async (updatedCustomer) => {
  //     try {
  //       const response = await axios.put(`${API_BASE_URL}/customers/${updatedCustomer._id}`, updatedCustomer);
  //       setCustomers(customers.map(c => (c._id === response.data._id ? response.data : c)));
  //       setSelectedCustomer(response.data);
  //     } catch (error) {
  //       console.error('Error updating customer:', error);
  //     }
  //   }, 750), // Adjust delay to 750 ms (or another suitable duration)
  //   [customers] // Dependencies
  // );


  // const debouncedUpdateCustomer = useCallback(
  //   debounce(async (updatedCustomer) => {
  //     try {
  //       const response = await axios.put(`${API_BASE_URL}/customers/${updatedCustomer._id}`, updatedCustomer);

  //       // Update state without directly depending on `customers`
  //       setCustomers(prevCustomers =>
  //         prevCustomers.map(c => (c._id === response.data._id ? response.data : c))
  //       );
  //       setSelectedCustomer(response.data);
  //     } catch (error) {
  //       console.error('Error updating customer:', error);
  //     }
  //   }, 750), // Adjust delay to 750 ms (or another suitable duration)
  //   [] // Empty dependency array since we handle state updates internally
  // );




  const debouncedUpdateCustomerFunc = useMemo(
    () =>
      debounce(async (updatedCustomer, setCustomers, setSelectedCustomer) => {
        try {
          const response = await axios.put(`${API_BASE_URL}/customers/${updatedCustomer._id}`, updatedCustomer);

          // Update state with the response
          setCustomers(prevCustomers =>
            prevCustomers.map(c => (c._id === response.data._id ? response.data : c))
          );
          setSelectedCustomer(response.data);
        } catch (error) {
          console.error('Error updating customer:', error);
        }
      }, 750),
    [] // Empty dependency array to ensure memoization
  );

  const debouncedUpdateCustomer = useCallback(
    (updatedCustomer) => {
      debouncedUpdateCustomerFunc(updatedCustomer, setCustomers, setSelectedCustomer);
    },
    [debouncedUpdateCustomerFunc, setCustomers, setSelectedCustomer] // Dependency array
  );





  const handleChange = (field, value) => {
    const updatedCustomer = { ...selectedCustomer, [field]: value };
    setSelectedCustomer(updatedCustomer);  // Update local state immediately
    debouncedUpdateCustomer(updatedCustomer);  // Trigger debounced API update
  };


  // const updateCustomer = async (updatedCustomer) => {
  //   try {
  //     const response = await axios.put(`${API_BASE_URL}/customers/${updatedCustomer._id}`, updatedCustomer)
  //     setCustomers(customers.map(c => c._id === response.data._id ? response.data : c))
  //     setSelectedCustomer(response.data)
  //   } catch (error) {
  //     console.error('Error updating customer:', error)
  //   }
  // }

  const updateCustomer = async (updatedCustomer) => {
    try {
      // First, check if the customer still exists
      const checkResponse = await axios.get(`${API_BASE_URL}/customers/${updatedCustomer._id}`)
      if (!checkResponse.data) {
        throw new Error('Customer not found')
      }

      const response = await axios.put(`${API_BASE_URL}/customers/${updatedCustomer._id}`, updatedCustomer)
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


  // const deleteCustomer = async (id) => {
  //   try {
  //     await axios.delete(`${API_BASE_URL}/customers/${id}`)
  //     setCustomers(customers.filter(c => c._id !== id))
  //     setSelectedCustomer(null)
  //     setAdminPassword('')
  //     setActiveSection('customers')
  //   } catch (error) {
  //     console.error('Error deleting customer:', error)
  //   }
  // }

  // const addNote = async () => {
  //   if (selectedCustomer && newNote.content.trim()) {
  //     try {
  //       const response = await axios.post(`${API_BASE_URL}/notes`, {
  //         ...newNote,
  //         customerId: selectedCustomer._id,
  //         timestamp: new Date().toISOString(),
  //         isPinned: false,
  //         isHighlighted: false
  //       })
  //       const updatedCustomer = {
  //         ...selectedCustomer,
  //         notes: [...selectedCustomer.notes, response.data],
  //         contacts: selectedCustomer.contacts + 1,
  //         touchpoints: selectedCustomer.touchpoints + 1,
  //         stage: selectedCustomer.stage === 'new' ? 'engaged' : selectedCustomer.stage
  //       }
  //       await updateCustomer(updatedCustomer)
  //       setNewNote({ type: 'call', content: '', salesAgent: '' })
  //     } catch (error) {
  //       console.error('Error adding note:', error)
  //     }
  //   }
  // }

  const addNote = async () => {
    if (selectedCustomer && newNote.content.trim()) {
      try {
        // Make API call to add note specifically to the selected customer
        const response = await axios.put(`${API_BASE_URL}/customers/${selectedCustomer._id}/notes`, {
          ...newNote,
          timestamp: new Date().toISOString(),
          isPinned: false,
          isHighlighted: false,
        });

        // Update the selectedCustomer state with the new note locally after the API call
        const updatedCustomer = {
          ...selectedCustomer,
          notes: [...selectedCustomer.notes, response.data],
          contacts: selectedCustomer.contacts + 1,
          touchpoints: selectedCustomer.touchpoints + 1,
          stage: selectedCustomer.stage === 'new' ? 'engaged' : selectedCustomer.stage,
        };

        setSelectedCustomer(updatedCustomer); // Update local state with the new note
        setNewNote({ type: 'call', content: '', salesAgent: '' }); // Reset the new note form
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };


  const toggleNotePinned = async (noteId) => {
    if (selectedCustomer) {
      try {
        const note = selectedCustomer.notes.find(n => n._id === noteId)
        const response = await axios.put(`${API_BASE_URL}/notes/${noteId}`, {
          ...note,
          isPinned: !note.isPinned
        })
        const updatedNotes = selectedCustomer.notes.map(n => n._id === noteId ? response.data : n)
        await updateCustomer({ ...selectedCustomer, notes: updatedNotes })
      } catch (error) {
        console.error('Error toggling note pin:', error)
      }
    }
  }

  const toggleNoteHighlighted = async (noteId) => {
    if (selectedCustomer) {
      try {
        const note = selectedCustomer.notes.find(n => n._id === noteId)
        const response = await axios.put(`${API_BASE_URL}/notes/${noteId}`, {
          ...note,
          isHighlighted: !note.isHighlighted
        })
        const updatedNotes = selectedCustomer.notes.map(n => n._id === noteId ? response.data : n)
        await updateCustomer({ ...selectedCustomer, notes: updatedNotes })
      } catch (error) {
        console.error('Error toggling note highlight:', error)
      }
    }
  }

  // const addOrder = async () => {
  //   if (selectedCustomer && newOrder.amount > 0) {
  //     try {
  //       const response = await axios.post(`${API_BASE_URL}/orders`, {
  //         ...newOrder,
  //         customerId: selectedCustomer._id,
  //         date: new Date().toISOString()
  //       })
  //       const updatedCustomer = {
  //         ...selectedCustomer,
  //         orders: [...selectedCustomer.orders, response.data],
  //         totalRevenue: selectedCustomer.totalRevenue + newOrder.amount,
  //         stage: 'ordered'
  //       }
  //       await updateCustomer(updatedCustomer)
  //       setNewOrder({ amount: 0, description: '' })
  //     } catch (error) {
  //       console.error('Error adding order:', error)
  //     }
  //   }
  // }

  const addOrder = async () => {
    if (selectedCustomer && newOrder.amount > 0) {
      try {
        // Make an API call to add an order specifically to the selected customer
        const response = await axios.put(`${API_BASE_URL}/customers/${selectedCustomer._id}/orders`, {
          ...newOrder,
          date: new Date().toISOString(),
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
        await axios.delete(`${API_BASE_URL}/orders/${orderId}`)
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
        const response = await axios.put(`${API_BASE_URL}/orders/${updatedOrder._id}`, updatedOrder)
        const oldOrder = selectedCustomer.orders.find(order => order._id === updatedOrder._id)
        const updatedCustomer = {
          ...selectedCustomer,
          orders: selectedCustomer.orders.map(order => order._id === updatedOrder._id ? response.data : order),
          totalRevenue: selectedCustomer.totalRevenue - oldOrder.amount + updatedOrder.amount
        }
        await updateCustomer(updatedCustomer)
        setEditingOrder(null)
      } catch (error) {
        console.error('Error updating order:', error)
      }
    }
  }

  const handleAdminLogin = () => {
    if (adminPassword === 'GULFSTREAM') {
      setIsAdminMode(true)
      setAdminPassword('')
      setShowAdminDialog(false)
      setIsAdminPortalOpen(true)
    } else {
      alert('Incorrect password')
    }
  }

  const handleAdminLogout = () => {
    setIsAdminMode(false)
    setIsAdminPortalOpen(false)
  }

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
          className="pl-10"
        />
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-5 h-5 text-gray-400" />
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

            {/* <Select
              value={newCustomer.stage}
              onChange={(e) => setNewCustomer({ ...newCustomer, stage: e.target.value })}
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </Select> */}

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

            {/* <Input
              value={selectedCustomer.name}
              onChange={(e) => updateCustomer({ ...selectedCustomer, name: e.target.value })}
              placeholder="Name"
            /> */}
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
            {adminSettings.showCustomerStage && (
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
          {/* <div className="flex justify-end">
            <Button variant="danger" onClick={() => setShowAdminDialog(true)}>Delete Customer</Button>
          </div> */}
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
            <option key={customer._id} value={customer._id.toString()}>{customer.name}</option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold">Customer Lifetime Value (CLV)</h3>
            <p className="text-2xl font-bold mt-2">€{kpis.clv.toFixed(2)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold">Conversion Rate</h3>
            <p className="text-2xl font-bold mt-2">{kpis.conversionRate.toFixed(2)}%</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold">Average Touchpoints</h3>
            <p className="text-2xl font-bold mt-2">{kpis.averageTouchpoints.toFixed(2)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold">Activity per Sales Agent</h3>
            <div className="mt-2">
              {Object.entries(kpis.activityPerSalesAgent).map(([agent, activity]) => (
                <p key={agent}>{agent}: {activity} activities</p>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold">Revenue per Touchpoint</h3>
            <p className="text-2xl font-bold mt-2">€{kpis.revenuePerTouchpoint.toFixed(2)}</p>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderAdminSettings = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Admin Settings</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="showTotalRevenue" className="text-sm font-medium text-gray-700">Show Total Revenue</label>
          <input
            type="checkbox"
            id="showTotalRevenue"
            checked={adminSettings?.showTotalRevenue}
            onChange={(e) => setAdminSettings(prev => ({ ...prev, showTotalRevenue: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="showCustomerStage" className="text-sm font-medium text-gray-700">Show Customer Stage</label>
          <input
            type="checkbox"
            id="showCustomerStage"
            checked={adminSettings?.showCustomerStage}
            onChange={(e) => setAdminSettings(prev => ({ ...prev, showCustomerStage: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="showTouchpoints" className="text-sm font-medium text-gray-700">Show Touchpoints</label>
          <input
            type="checkbox"
            id="showTouchpoints"
            checked={adminSettings?.showTouchpoints}
            onChange={(e) => setAdminSettings(prev => ({ ...prev, showTouchpoints: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="showKPIs" className="text-sm font-medium text-gray-700">Show KPIs</label>
          <input
            type="checkbox"
            id="showKPIs"
            checked={adminSettings?.showKPIs}
            onChange={(e) => setAdminSettings(prev => ({ ...prev, showKPIs: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center text-white">
          {/* App Title */}
          <h1 onClick={e => setActiveSection('customers')} className="text-3xl font-bold text-white">TopGlanz Hannover CRM</h1>

          {/* Settings Button and Section Selector */}
          <div className="flex items-center space-x-6">
            {/* Settings Button with Icon */}
            <div className="relative">
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
            </div>

            {/* Section Selector Dropdown */}
            <Select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="bg-gray-700 text-white text-sm px-3 py-2 rounded-md border border-gray-500 focus:outline-none"
            >
              <option value="customers">Customers</option>
              <option value="details">Customer Details</option>
              {adminSettings.showKPIs && <option value="kpis">KPIs</option>}
            </Select>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeSection === 'customers' && renderCustomers()}
          {activeSection === 'details' && renderCustomerDetails()}
          {activeSection === 'kpis' && adminSettings.showKPIs && renderKPIs()}
        </div>
      </main>

      {/* Admin Login Dialog */}
      {showAdminDialog && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Admin Login
                    </h3>
                    <div className="mt-2">
                      <Input
                        type="password"
                        placeholder="Enter admin password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button onClick={handleAdminLogin}>
                  Login
                </Button>
                <Button variant="secondary" onClick={() => setShowAdminDialog(false)} className="mr-2">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Portal */}
      {isAdminPortalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Admin Portal
                    </h3>
                    <div className="mt-2">
                      {renderAdminSettings()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button onClick={handleAdminLogout}>
                  Logout
                </Button>
                <Button variant="secondary" onClick={() => setIsAdminPortalOpen(false)} className="mr-2">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage Change Dialog */}
      {showStageChangeDialog && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Confirm Stage Change
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to change the stage to {newStage}? This action requires admin approval.
                      </p>
                      <Input
                        type="password"
                        placeholder="Enter admin password"
                        value={stageChangePassword}
                        onChange={(e) => setStageChangePassword(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button onClick={() => {
                  if (stageChangePassword === 'GULFSTREAM') {
                    updateCustomer({ ...selectedCustomer, stage: newStage });
                    setShowStageChangeDialog(false);
                    setStageChangePassword('');
                  } else {
                    alert('Incorrect password');
                  }
                }}>
                  Confirm
                </Button>
                <Button variant="secondary" onClick={() => setShowStageChangeDialog(false)} className="mr-2">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Dialog */}
      {editingOrder && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Edit Order
                    </h3>
                    <div className="mt-2 space-y-4">
                      <Input
                        type="number"
                        placeholder="Amount (€)"
                        value={editingOrder.amount}
                        onChange={(e) => setEditingOrder({ ...editingOrder, amount: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        placeholder="Description"
                        value={editingOrder.description}
                        onChange={(e) => setEditingOrder({ ...editingOrder, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button onClick={() => updateOrder(editingOrder)}>
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setEditingOrder(null)} className="mr-2">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Dialog */}
      {showHelpDialog && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Help & Information
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Welcome to the TopGlanz Hannover CRM system. Here are some key features:
                      </p>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-500">
                        <li>Add and manage customers</li>
                        <li>Track customer interactions with notes</li>
                        <li>Record customer orders</li>
                        <li>View important KPIs</li>
                        <li>Admin features for advanced management</li>
                      </ul>
                      <p className="mt-2 text-sm text-gray-500">
                        For more detailed information or support, please contact your system administrator.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button variant="secondary" onClick={() => setShowHelpDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App