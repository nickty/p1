import React from 'react'

export function ScrollArea({ children, ...props }) {
  return <div className="overflow-auto" {...props}>{children}</div>
}