import React from 'react'

export function Switch({ checked, onCheckedChange, ...props }) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          {...props}
        />
        <div className={`block bg-gray-600 w-14 h-8 rounded-full ${checked ? 'bg-green-400' : ''}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'transform translate-x-6' : ''}`}></div>
      </div>
    </label>
  )
}