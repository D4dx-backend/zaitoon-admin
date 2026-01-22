import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SuccessModal from '../components/SuccessModal'
import axios from 'axios'
import { 
  FiSave,
  FiX,
  FiSettings,
  FiToggleLeft,
  FiToggleRight,
  FiRefreshCw
} from 'react-icons/fi'

function QuizManagement() {
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' })
  
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    numberOfQuestions: 10,
    questionsRandomization: false,
    isEnable: true
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(`${API_BASE}/quizzes/config`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        const configData = response.data.data
        if (configData.startDate) {
          const startDate = new Date(configData.startDate)
          const endDate = new Date(configData.endDate)
          
          setConfig(configData)
          setFormData({
            startDate: startDate.toISOString().split('T')[0],
            startTime: startDate.toTimeString().slice(0, 5),
            endDate: endDate.toISOString().split('T')[0],
            endTime: endDate.toTimeString().slice(0, 5),
            numberOfQuestions: configData.numberOfQuestions || 10,
            questionsRandomization: configData.questionsRandomization || false,
            isEnable: configData.isEnable !== undefined ? configData.isEnable : true
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setLoading(false)
    }
  }

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message })
  }

  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', message: '' })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      showModal('error', 'Please fill all date and time fields')
      return
    }

    if (formData.numberOfQuestions < 1) {
      showModal('error', 'Number of questions must be at least 1')
      return
    }

    // Combine date and time
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

    if (startDateTime >= endDateTime) {
      showModal('error', 'Start date/time must be before end date/time')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const url = config 
        ? `${API_BASE}/quizzes/config`
        : `${API_BASE}/quizzes/config`
      
      const method = config ? 'put' : 'post'
      
      const payload = {
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        numberOfQuestions: parseInt(formData.numberOfQuestions, 10),
        questionsRandomization: formData.questionsRandomization,
        isEnable: formData.isEnable
      }

      const response = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        showModal('success', config ? 'Quiz configuration updated successfully' : 'Quiz configuration created successfully')
        fetchConfig()
      }
    } catch (error) {
      showModal('error', error.response?.data?.message || 'Failed to save quiz configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleEnable = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.put(
        `${API_BASE}/quizzes/config`,
        { isEnable: !formData.isEnable },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        setFormData(prev => ({ ...prev, isEnable: !prev.isEnable }))
        showModal('success', formData.isEnable ? 'Quiz disabled' : 'Quiz enabled')
        fetchConfig()
      }
    } catch (error) {
      showModal('error', error.response?.data?.message || 'Failed to toggle quiz status')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Archivo Black' }}>
                Quiz Management
              </h1>
              <p className="text-gray-400">Configure quiz settings and manage question bank</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/questions')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSettings className="w-5 h-5" />
                <span>Manage Question Bank</span>
              </button>
              <button
                onClick={fetchConfig}
                className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quiz Configuration Form */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Quiz Configuration</h2>
              {config && (
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.isEnable 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {formData.isEnable ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={handleToggleEnable}
                    disabled={saving}
                    className="text-3xl text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {formData.isEnable ? <FiToggleRight className="text-green-400" /> : <FiToggleLeft />}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Questions *
                  </label>
                  <input
                    type="number"
                    name="numberOfQuestions"
                    value={formData.numberOfQuestions}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Questions Randomization
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="questionsRandomization"
                      checked={formData.questionsRandomization}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-gray-300">Randomize question order</span>
                  </label>
                </div>
              </div>

              {config && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Current Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Start:</span>
                      <span className="text-white ml-2">{formatDate(config.startDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">End:</span>
                      <span className="text-white ml-2">{formatDate(config.endDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className={`ml-2 ${config.isLive ? 'text-green-400' : 'text-red-400'}`}>
                        {config.isLive ? 'Live' : 'Not Live'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Questions:</span>
                      <span className="text-white ml-2">{config.numberOfQuestions}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <FiSave className="w-5 h-5" />
                  <span>{saving ? 'Saving...' : config ? 'Update Configuration' : 'Create Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={modal.isOpen}
        type={modal.type}
        message={modal.message}
        onClose={closeModal}
      />
    </div>
  )
}

export default QuizManagement
