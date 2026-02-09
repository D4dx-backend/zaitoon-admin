import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import SuccessModal from '../components/SuccessModal'
import { FiSend, FiImage, FiBell } from 'react-icons/fi'
import gradient from '../assets/gradiantRight.png'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '', onConfirm: null })

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image: '',
  })

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem('adminToken')

  const showModal = (type, message, onConfirm = null) => {
    setModal({ isOpen: true, type, message, onConfirm })
  }

  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', message: '', onConfirm: null })
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.success) {
        setNotifications(data.data || [])
      } else {
        showModal('error', data.message || 'Failed to fetch notifications')
      }
    } catch (err) {
      showModal('error', err.response?.data?.message || 'Error fetching notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({ title: '', message: '', image: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) {
      showModal('error', 'Title and message are required')
      return
    }
    setSending(true)
    try {
      const { data } = await axios.post(
        `${API_BASE}/notifications/send`,
        {
          title: formData.title.trim(),
          message: formData.message.trim(),
          image: formData.image.trim() || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        showModal('success', 'Notification sent successfully!')
        resetForm()
        fetchNotifications()
      } else {
        showModal('error', data.message || 'Failed to send notification')
      }
    } catch (err) {
      showModal('error', err.response?.data?.message || 'Error sending notification')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      <Sidebar />
      <div className="flex-1 ml-56 relative overflow-hidden">
        <img
          src={gradient}
          alt=""
          className="absolute top-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
        />
        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-violet-600/20 border border-violet-500/30">
              <FiBell className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
                Push Notifications
              </h1>
              <p className="text-gray-400 text-sm">Send notifications to all users via OneSignal</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Send new notification</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Notification title"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Notification message"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <span className="flex items-center gap-2">
                    <FiImage className="w-4 h-4" />
                    Image URL (optional)
                  </span>
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                <FiSend className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          </div>

          {/* List of sent notifications */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
            <h2 className="text-lg font-semibold text-white px-6 py-4 border-b border-gray-700/50">
              Sent notifications
            </h2>
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No notifications sent yet.</div>
            ) : (
              <ul className="divide-y divide-gray-700/50">
                {notifications.map((n) => (
                  <li key={n._id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-white">{n.title}</span>
                      <span className="text-sm text-gray-400 line-clamp-2">{n.message}</span>
                      {n.image && (
                        <span className="text-xs text-violet-400 truncate max-w-full" title={n.image}>
                          Image: {n.image}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 mt-1">{formatDate(n.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <SuccessModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          message={modal.message}
          onConfirm={modal.onConfirm}
        />
      )}
    </div>
  )
}

export default Notifications
