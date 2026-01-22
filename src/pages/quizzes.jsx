import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import SuccessModal from '../components/SuccessModal'
import axios from 'axios'
import { 
  FiPlus, 
  FiX,
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiCheck,
  FiXCircle
} from 'react-icons/fi'

function Quizzes() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const [quizzes, setQuizzes] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' })
  
  const [formData, setFormData] = useState({
    title: '',
    mlTitle: '',
    description: '',
    mlDescription: '',
    quizDate: '',
    questions: [],
    status: 'Active'
  })

  useEffect(() => {
    fetchQuizzes()
    fetchQuestions()
  }, [])

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(`${API_BASE}/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setQuizzes(response.data.data.quizzes || [])
      }
    } catch (error) {
      showModal('error', 'Failed to fetch quizzes')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(`${API_BASE}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setQuestions(response.data.data.questions || [])
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    }
  }

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message })
  }

  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', message: '' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleQuestionToggle = (questionId) => {
    setFormData(prev => {
      const isSelected = prev.questions.includes(questionId)
      return {
        ...prev,
        questions: isSelected
          ? prev.questions.filter(id => id !== questionId)
          : [...prev.questions, questionId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.mlTitle || !formData.quizDate || formData.questions.length === 0) {
      showModal('error', 'Please fill all required fields and select at least one question')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const url = editingQuiz 
        ? `${API_BASE}/quizzes/${editingQuiz._id}`
        : `${API_BASE}/quizzes`
      
      const method = editingQuiz ? 'put' : 'post'
      
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        showModal('success', editingQuiz ? 'Quiz updated successfully' : 'Quiz created successfully')
        setShowForm(false)
        resetForm()
        fetchQuizzes()
      }
    } catch (error) {
      showModal('error', error.response?.data?.message || 'Failed to save quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      title: quiz.title || '',
      mlTitle: quiz.mlTitle || '',
      description: quiz.description || '',
      mlDescription: quiz.mlDescription || '',
      quizDate: quiz.quizDate ? new Date(quiz.quizDate).toISOString().split('T')[0] : '',
      questions: quiz.questions?.map(q => q._id || q) || [],
      status: quiz.status || 'Active'
    })
    setShowForm(true)
  }

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.delete(`${API_BASE}/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        showModal('success', 'Quiz deleted successfully')
        fetchQuizzes()
      }
    } catch (error) {
      showModal('error', error.response?.data?.message || 'Failed to delete quiz')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      mlTitle: '',
      description: '',
      mlDescription: '',
      quizDate: '',
      questions: [],
      status: 'Active'
    })
    setEditingQuiz(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
              Quiz Management
            </h1>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Quiz</span>
            </button>
          </div>

          {/* Quiz Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowForm(false)
                        resetForm()
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Title (English) *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Title (Malayalam) *
                        </label>
                        <input
                          type="text"
                          name="mlTitle"
                          value={formData.mlTitle}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description (English)
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description (Malayalam)
                        </label>
                        <textarea
                          name="mlDescription"
                          value={formData.mlDescription}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Quiz Date *
                        </label>
                        <input
                          type="date"
                          name="quizDate"
                          value={formData.quizDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Status *
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Questions * ({formData.questions.length} selected)
                      </label>
                      <div className="bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                        {questions.length === 0 ? (
                          <p className="text-gray-400 text-sm">No questions available. Create questions first.</p>
                        ) : (
                          <div className="space-y-2">
                            {questions.map((q) => (
                              <label
                                key={q._id}
                                className="flex items-start space-x-3 p-2 hover:bg-gray-600 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.questions.includes(q._id)}
                                  onChange={() => handleQuestionToggle(q._id)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <p className="text-white text-sm">{q.questionText}</p>
                                  <p className="text-gray-400 text-xs">{q.mlQuestionText}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false)
                          resetForm()
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : editingQuiz ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Quizzes List */}
          {loading && !showForm ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading quizzes...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No quizzes found. Create your first quiz!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{quiz.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{quiz.mlTitle}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDate(quiz.quizDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {quiz.status === 'Active' ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-1">
                      Questions: {quiz.questions?.length || 0}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(quiz)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default Quizzes
