import React from 'react'

export function Card({ children, ...props }) {
  return <div className="bg-white shadow rounded-lg" {...props}>{children}</div>
}

export function CardContent({ children, ...props }) {
  return <div className="p-4" {...props}>{children}</div>
}

export function CardHeader({ children, ...props }) {
  return <div className="px-4 py-5 border-b border-gray-200" {...props}>{children}</div>
}

export function CardTitle({ children, ...props }) {
  return <h3 className="text-lg font-medium leading-6 text-gray-900" {...props}>{children}</h3>
}