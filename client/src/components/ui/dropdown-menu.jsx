import React, { useState } from 'react'

export function DropdownMenu({ children }) {
  return <div className="relative inline-block text-left">{children}</div>
}

export function DropdownMenuTrigger({ children }) {
  return <div>{children}</div>
}

export function DropdownMenuContent({ children }) {
  return (
    <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
      {children}
    </div>
  )
}

export function DropdownMenuItem({ children, onSelect }) {
  return (
    <a
      href="#"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      onClick={(e) => {
        e.preventDefault()
        onSelect()
      }}
    >
      {children}
    </a>
  )
}

export function DropdownMenuSeparator() {
  return <hr className="my-1" />
}