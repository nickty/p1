import React from 'react'
import axios from 'axios'
import { Download } from 'lucide-react'

const API_BASE_URL = 'http://7websites.com/api'

function ExportButton({ token }) {
  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/export-customers`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'customers.csv')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error('Error exporting customers:', error)
      alert('Failed to export customers. Please try again.')
    }
  }

  return (
    <button
      onClick={handleExport}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
    >
      <Download className="w-4 h-4 mr-2" />
      <span>Export Customers</span>
    </button>
  )
}

export default ExportButton