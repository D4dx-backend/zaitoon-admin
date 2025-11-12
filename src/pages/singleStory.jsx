import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import StatusModal from '../components/SuccessModal'
import { FiPlus, FiEdit3, FiTrash2, FiX } from 'react-icons/fi'
import { HiClock, HiCalendar } from 'react-icons/hi'
import logo from '../assets/logo.png'
import gradient from '../assets/gradiantRight.png'

function SingleStoryManagement() {
  const SPACES_CDN_DOMAIN = import.meta.env.VITE_SPACES_CDN_DOMAIN

  const normalizeSpacesUrl = (input) => {
    if (!input) return input

    const pathStyleMatch = input.match(/^https?:\/\/([a-z0-9-]+)\.digitaloceanspaces\.com\/([a-z0-9-]+)\/(.+)$/i)
    if (pathStyleMatch) {
      const [, region, space, key] = pathStyleMatch
      if (SPACES_CDN_DOMAIN) {
        return `https://${SPACES_CDN_DOMAIN}/${key}`
      }
      return `https://${space}.${region}.digitaloceanspaces.com/${key}`
    }

    if (SPACES_CDN_DOMAIN) {
      const cdnMissingProtocol = input.match(new RegExp(`^${SPACES_CDN_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(.+)$`, 'i'))
      if (cdnMissingProtocol) {
        return `https://${SPACES_CDN_DOMAIN}/${cdnMissingProtocol[1]}`
      }
    }

    return input
  }

  const resolveImageUrl = (url) => {
    if (!url) return url
    const trimmed = normalizeSpacesUrl(String(url).trim())
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith('//')) return `https:${trimmed}`
    if (/^[a-z0-9.-]+\.digitaloceanspaces\.com\//i.test(trimmed)) return `https://${trimmed}`
    if (/^[a-z0-9.-]+\.cdn\.digitaloceanspaces\.com\//i.test(trimmed)) return `https://${trimmed}`
    return trimmed
  }
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusModalType, setStatusModalType] = useState('success') // 'loading', 'success', 'error', 'confirmation'
  const [statusMessage, setStatusMessage] = useState('')
  const [deleteStoryId, setDeleteStoryId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingStory, setEditingStory] = useState(null)
  const [selectedStory, setSelectedStory] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    mlTitle: '',
    readTime: '',
    description: '',
    tag: '',
    highlight: 'Disable'
  })
  const [files, setFiles] = useState({
    coverImage: null,
    enStoryFile: null,
    mlStoryFile: null,
    mlBanner: null,
    enBanner: null
  })

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const STORIES_PER_PAGE = 18
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalStories, setTotalStories] = useState(0)
  
  // Debug logging

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }

  // Fetch stories with pagination
  const fetchStories = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_BASE_URL}/single-stories`, {
        params: { page, limit: STORIES_PER_PAGE }
      })
      const responseData = response.data || {}
      const total = responseData.total || 0
      const meta = responseData.meta || {}
      const safeTotalPages = meta.totalPages || 1
      setStories(responseData.data || [])
      setTotalStories(total)
      setTotalPages(safeTotalPages)
      if (total > 0 && page > safeTotalPages) {
        setCurrentPage(safeTotalPages)
      }
    } catch (err) {
      setError('Failed to fetch stories')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL, STORIES_PER_PAGE])

  // Fetch single story details
  const fetchStoryDetails = async (storyId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/single-stories/${storyId}`)
      setSelectedStory(response.data.data)
    } catch (err) {
      setError('Failed to fetch story details')
      console.error('Fetch story details error:', err)
    }
  }

  // Handle card expand
  const handleCardExpand = (storyId) => {
    setExpandedCard(storyId)
    fetchStoryDetails(storyId)
  }

  // Handle card collapse
  const handleCardCollapse = () => {
    setExpandedCard(null)
    setSelectedStory(null)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Enable' : 'Disable') : value
    }))
  }

  // Handle file changes
  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFiles(prev => ({
      ...prev,
      [name]: files[0] || null
    }))
  }

  // Create new story
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      
      // Show loading modal
      setStatusModalType('loading')
      setStatusMessage('Creating your story...')
      setShowStatusModal(true)
      
      const formDataToSend = new FormData()
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataToSend.append(key, formData[key])
      })
      
      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) formDataToSend.append(key, files[key])
      })

      const response = await axios.post(
        `${API_BASE_URL}/single-stories`,
        formDataToSend,
        { headers: getAuthHeaders() }
      )

      // Show success modal
      setStatusModalType('success')
      setStatusMessage('Story created successfully!')
      setShowForm(false)
      resetForm()
      if (currentPage !== 1) {
        setCurrentPage(1)
      } else {
        fetchStories(1)
      }
    } catch (err) {
      // Show error modal
      setStatusModalType('error')
      setStatusMessage(err.response?.data?.message || 'Failed to create story')
      console.error('Create error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update story
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      
      // Show loading modal
      setStatusModalType('loading')
      setStatusMessage('Updating your story...')
      setShowStatusModal(true)
      
      const formDataToSend = new FormData()
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataToSend.append(key, formData[key])
      })
      
      // Add files (only if new files are selected)
      Object.keys(files).forEach(key => {
        if (files[key]) formDataToSend.append(key, files[key])
      })

      const response = await axios.put(
        `${API_BASE_URL}/single-stories/${editingStory._id}`,
        formDataToSend,
        { headers: getAuthHeaders() }
      )

      // Show success modal
      setStatusModalType('success')
      setStatusMessage('Story updated successfully!')
      setShowForm(false)
      setEditingStory(null)
      resetForm()
      fetchStories(currentPage)
    } catch (err) {
      // Show error modal
      setStatusModalType('error')
      setStatusMessage(err.response?.data?.message || 'Failed to update story')
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Show delete confirmation modal
  const handleDelete = (id) => {
    setDeleteStoryId(id)
    setStatusModalType('confirmation')
    setStatusMessage('Are you sure you want to delete this story? This action cannot be undone.')
    setShowStatusModal(true)
  }

  // Actually delete the story after confirmation
  const confirmDelete = async () => {
    if (!deleteStoryId) return
    
    try {
      setLoading(true)
      
      // Show loading modal
      setStatusModalType('loading')
      setStatusMessage('Deleting your story...')
      
      const token = localStorage.getItem('adminToken')
      await axios.delete(`${API_BASE_URL}/single-stories/${deleteStoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Show success modal
      setStatusModalType('success')
      setStatusMessage('Story deleted successfully!')
      setExpandedCard(null)
      setSelectedStory(null)
      setDeleteStoryId(null)
      const shouldGoToPrevPage = stories.length === 1 && currentPage > 1
      const targetPage = shouldGoToPrevPage ? currentPage - 1 : currentPage
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage)
      } else {
        fetchStories(targetPage)
      }
    } catch (err) {
      // Show error modal
      setStatusModalType('error')
      setStatusMessage(err.response?.data?.message || 'Failed to delete story')
      console.error('Delete error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteStoryId(null)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
    setCurrentPage(newPage)
  }

  const startIndex = totalStories === 0 ? 0 : Math.min((currentPage - 1) * STORIES_PER_PAGE + 1, totalStories)
  const endIndex = Math.min(totalStories, currentPage * STORIES_PER_PAGE)

  // Edit story (for expandable card)
  const handleEdit = (story) => {
    setEditingStory(story)
    setFormData({
      title: story.title || '',
      mlTitle: story.mlTitle || '',
      readTime: story.readTime || '',
      description: story.description || '',
      tag: story.tag || '',
      highlight: story.highlight || 'Disable'
    })
    setFiles({
      coverImage: null,
      enStoryFile: null,
      mlStoryFile: null,
      mlBanner: null,
      enBanner: null
    })
    setExpandedCard(null) // Close the expanded card
    setSelectedStory(null)
    setShowForm(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      mlTitle: '',
      readTime: '',
      description: '',
      tag: '',
      highlight: 'Disable'
    })
    setFiles({
      coverImage: null,
      enStoryFile: null,
      mlStoryFile: null,
      mlBanner: null,
      enBanner: null
    })
  }

  // Close form
  const closeForm = () => {
    setShowForm(false)
    setEditingStory(null)
    resetForm()
  }

  useEffect(() => {
    fetchStories(currentPage)
  }, [currentPage, fetchStories])

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 
                className="text-white text-5xl font-bold mb-1 relative"
                style={{ fontFamily: 'Archivo Black' }}
              >
                Single Stories
                <div 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-32"
                style={{
                    background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)'
                }}
                ></div>
              </h1>
            </div>
              <button
                onClick={() => setShowForm(true)}
              className="flex items-center justify-center space-x-2 text-white transition duration-200"
              style={{
                background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)',
                width: '160px',
                height: '36px',
                borderRadius: '18px',
                fontFamily: 'Fredoka One',
                fontWeight: '400',
                fontSize: '14px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center'
              }}
            >
              <FiPlus className="w-3 h-3" />
              <span>Add Story</span>
              </button>
        </div>
      </div>



      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth scroll-indicator">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <img 
                  src={logo} 
                  alt="Zai Toon Logo" 
                  className="h-10 w-auto"
                />
                <h2 
                  className="text-white text-2xl"
                style={{ fontFamily: 'Archivo Black' }}
              >
                {editingStory ? 'Edit Story' : 'Add New Story'}
              </h2>
              </div>
              <button
                onClick={closeForm}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={editingStory ? handleUpdate : handleCreate} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                />
              </div>

              {/* ML Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>ML Title</label>
                <input
                  type="text"
                  name="mlTitle"
                  value={formData.mlTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                />
              </div>

              {/* Read Time */}
              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Read Time</label>
                <input
                  type="text"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-none scrollbar-hide scroll-smooth"
                />
              </div>

              {/* Tag */}
              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Tag</label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                />
              </div>


              {/* Files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Cover Image *</label>
                  {editingStory && editingStory.coverImage && (
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm mb-2">Current image:</p>
                      <img 
                        src={resolveImageUrl(editingStory.coverImage)} 
                        alt="Current cover" 
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Image load error:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="coverImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    required={!editingStory}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>EN Story File *</label>
                  {editingStory && editingStory.enStoryFile && (
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm mb-2">Current file:</p>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(editingStory.enStoryFile, '_blank', 'noopener,noreferrer')
                        }}
                        className="text-purple-400 hover:text-purple-300 text-sm underline"
                      >
                        View current EN story file
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    name="enStoryFile"
                    onChange={handleFileChange}
                    required={!editingStory}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>ML Story File *</label>
                  {editingStory && editingStory.mlStoryFile && (
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm mb-2">Current file:</p>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(editingStory.mlStoryFile, '_blank', 'noopener,noreferrer')
                        }}
                        className="text-purple-400 hover:text-purple-300 text-sm underline"
                      >
                        View current ML story file
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    name="mlStoryFile"
                    onChange={handleFileChange}
                    required={!editingStory}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>ML Banner</label>
                  <input
                    type="file"
                    name="mlBanner"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>EN Banner</label>
                  <input
                    type="file"
                    name="enBanner"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  />
                </div>

                {/* Highlight Checkbox */}
                <div className="flex flex-col justify-center">
                  <label className="flex items-center space-x-3 cursor-pointer mb-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="highlight"
                        checked={formData.highlight === 'Enable'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                        formData.highlight === 'Enable' 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'bg-gray-800/50 border-gray-600 backdrop-blur-sm'
                      }`}>
                        {formData.highlight === 'Enable' && (
                          <svg 
                            className="w-4 h-4 text-white absolute top-0.5 left-0.5" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-white text-sm font-semibold" style={{ fontFamily: 'Archivo Black' }}>
                      Highlight Story
                    </span>
                  </label>
                  <p className="text-gray-400 text-xs ml-9">
                    Enable to feature this story prominently
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-8">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex items-center justify-center space-x-2 text-white transition duration-200"
                  style={{
                    background: 'linear-gradient(90.05deg, #374151 6.68%, #4B5563 49.26%, #6B7280 91.85%)',
                    width: '140px',
                    height: '36px',
                    borderRadius: '18px',
                    fontFamily: 'Fredoka One',
                    fontWeight: '400',
                    fontSize: '14px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    textAlign: 'center'
                  }}
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 text-white transition duration-200 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)',
                    width: '160px',
                    height: '36px',
                    borderRadius: '18px',
                    fontFamily: 'Fredoka One',
                    fontWeight: '400',
                    fontSize: '14px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    textAlign: 'center'
                  }}
                >
                  <FiPlus className="w-3 h-3" />
                  <span>{loading ? 'Saving...' : (editingStory ? 'Update' : 'Create')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !showForm ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-white text-lg">Loading stories...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {stories.map((story) => {
              const isThisCardExpanded = expandedCard === story._id
              const currentStory = expandedCard === story._id && selectedStory ? selectedStory : story
              
              return (
                <div key={story._id}>
                  {/* Story Card */}
                  <div 
                    className={`relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border-2 w-[180px] h-[220px] ${
                      isThisCardExpanded 
                        ? 'scale-110 z-10 shadow-2xl border-blue-500' 
                        : 'hover:scale-105 hover:shadow-2xl border-transparent hover:border-gray-600'
                    }`}
                    onClick={() => {
                      if (isThisCardExpanded) {
                        handleCardCollapse()
                      } else {
                        handleCardExpand(story._id)
                      }
                    }}
                  >
                    {/* Cover Image with Overlay Titles */}
                    <div className="relative w-full h-full overflow-hidden">
                      {story.coverImage ? (
                    <img
                      src={resolveImageUrl(story.coverImage)}
                      alt={story.title}
                          className="w-full h-full object-cover transition duration-300"
                          onError={(e) => {
                            console.error('Image load error:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full bg-gray-800 flex items-center justify-center"
                        style={{ display: story.coverImage ? 'none' : 'flex' }}
                      >
                        <span className="text-gray-500 text-sm">
                          {story.coverImage ? 'Failed to load image' : 'No Image'}
                        </span>
                      </div>
                      
                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 z-10">
                        <h3 className="text-white text-sm font-semibold truncate mb-1">
                          {story.title}
                        </h3>
                        {story.mlTitle && (
                          <p className="text-gray-300 text-xs truncate">
                            {story.mlTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Screen Modal - Rendered outside the card */}
                  {isThisCardExpanded && (
                    <div 
                      className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          handleCardCollapse()
                        }
                      }}
                    >
                      <div 
                        className="bg-gray-900/80 backdrop-blur-lg rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                      >
                        {!currentStory.description ? (
                          <div className="flex items-center justify-center py-20">
                            <div className="text-white text-lg">Loading details...</div>
                          </div>
                        ) : (
                          <div className="p-6">
                            {/* Header with Close Button */}
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex-1">
                                <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                                  {currentStory.title}
                                </h1>
                                {currentStory.mlTitle && (
                                  <p className="text-gray-300 text-base mb-3">
                                    {currentStory.mlTitle}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCardCollapse()
                                }}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Cover Image */}
                            {currentStory.coverImage && (
                              <div className="mb-6 flex justify-center">
                                <img
                                  src={resolveImageUrl(currentStory.coverImage)}
                                  alt={currentStory.title}
                                  className="max-w-full max-h-64 object-contain rounded-xl shadow-lg"
                                  onError={(e) => {
                                    console.error('Image load error:', e.target.src);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div 
                                  className="w-full h-64 bg-gray-800 flex items-center justify-center rounded-xl"
                                  style={{ display: 'none' }}
                                >
                                  <span className="text-gray-500 text-sm">Failed to load image</span>
                                </div>
                              </div>
                            )}

                            {/* Description */}
                            {currentStory.description && (
                              <div className="mb-6">
                                <h2 className="text-white text-lg font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Description</h2>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                  {currentStory.description}
                                </p>
                              </div>
                            )}

                            {/* Tag and Read Time */}
                            <div className="flex flex-col space-y-2 mb-6">
                              {currentStory.tag && (
                                <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium w-fit">
                                  {currentStory.tag}
                    </span>
                  )}
                              {currentStory.readTime && (
                                <div className="flex items-center space-x-1 text-sm text-gray-400">
                                  <span>Reading time:</span>
                                  <span>{currentStory.readTime} min</span>
                                </div>
                              )}
                            </div>


                            {/* File Links */}
                            <div className="mb-6">
                              <h3 className="text-white text-sm font-medium mb-4 text-gray-300">Story Files</h3>
                              <div className="flex items-center space-x-6">
                                {currentStory.enStoryFile ? (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      window.open(currentStory.enStoryFile, '_blank', 'noopener,noreferrer')
                                    }}
                                    className="flex items-center justify-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition duration-200 border border-gray-600/50 hover:border-gray-500/50"
                                  >
                                    <span className="text-base font-medium">English</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-center px-4 py-3 text-gray-500">
                                    <span className="text-base">No English File</span>
                                  </div>
                                )}
                                {currentStory.mlStoryFile ? (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      window.open(currentStory.mlStoryFile, '_blank', 'noopener,noreferrer')
                                    }}
                                    className="flex items-center justify-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition duration-200 border border-gray-600/50 hover:border-gray-500/50"
                                  >
                                    <span className="text-base font-medium">Malayalam</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-center px-4 py-3 text-gray-500">
                                    <span className="text-base">No Malayalam File</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Footer with Date and Action Icons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                              {/* Create Date */}
                              <div className="flex items-center space-x-1 text-sm text-gray-400">
                                <HiCalendar className="w-4 h-4" />
                                <span>
                                  {new Date(currentStory.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                    </span>
                              </div>
                              
                              {/* Action Icons */}
                              <div className="flex items-center space-x-3">
                      <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleEdit(currentStory)
                                  }}
                                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition duration-200"
                                  title="Edit Story"
                                >
                                  <FiEdit3 className="w-5 h-5" />
                      </button>
                      <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleDelete(currentStory._id)
                                  }}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition duration-200"
                                  title="Delete Story"
                                >
                                  <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                        )}
                </div>
              </div>
                  )}
              </div>
              )
            })}
          </div>
        )}

        {totalStories > 0 && (
          <div className="flex flex-col items-center justify-center gap-3 mt-8 text-sm text-gray-300 text-center">
            <div className="text-center">
              Showing {startIndex}-{endIndex} of {totalStories} stories
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {stories.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-6">No stories found</div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 mx-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Your First Story</span>
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Gradient Image - Right Bottom Corner */}
      <div className="fixed -bottom-80 right-0 z-10 pointer-events-none">
        <img 
          src={gradient} 
          alt="Gradient" 
          className="w-[800px] h-[800px] opacity-60"
        />
      </div>

      {/* Status Modal */}
      <StatusModal 
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        type={statusModalType}
        message={statusMessage}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}

export default SingleStoryManagement
