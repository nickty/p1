import React, { useState } from 'react'

export function Dialog({ children, open, onOpenChange }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

export function DialogTrigger({ children }) {
  return <>{children}</>
}

export function DialogContent({ children }) {
  return <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">{children}</div>
}

export function DialogHeader({ children }) {
  return <div>{children}</div>
}

export function DialogTitle({ children }) {
  return <h3 className="text-lg leading-6 font-medium text-gray-900">{children}</h3>
}

export function DialogDescription({ children }) {
  return <div className="mt-2">{children}</div>
}