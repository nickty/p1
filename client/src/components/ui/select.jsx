import React, { useState } from 'react'

export function Select({ children, onValueChange, ...props }) {
  return (
    <select 
      className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
    >
      {children}
    </select>
  )
}

export function SelectContent({ children }) {
  return <>{children}</>
}

export function SelectItem({ children, value }) {
  return <option value={value}>{children}</option>
}

export function SelectTrigger({ children }) {
  return <>{children}</>
}

export function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>
}