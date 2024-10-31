import React from 'react'

export function Label({ children, ...props }) {
  return <label className="block text-sm font-medium text-gray-700" {...props}>{children}</label>
}