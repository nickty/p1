import React, { useState } from 'react'

export function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className="tabs">
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  )
}

export function TabsList({ children }) {
  return <div className="flex border-b">{children}</div>
}

export function TabsTrigger({ children, value, activeTab, setActiveTab }) {
  return (
    <button
      className={`px-4 py-2 ${activeTab === value ? 'border-b-2 border-blue-500' : ''}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

export function TabsContent({ children, value, activeTab }) {
  if (value !== activeTab) return null
  return <div>{children}</div>
}