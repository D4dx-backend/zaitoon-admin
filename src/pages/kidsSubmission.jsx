import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiX, FiUpload, FiImage, FiUser, FiBook, FiStar, FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi'
import SuccessModal from '../components/SuccessModal'
import Sidebar from '../components/Sidebar'
import gradient from '../assets/gradiantRight.png'

const KidsSubmission = () => {
  // States
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSubmission, setEditingSubmission] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [modal, setModal] = useState({ show: false, type: '', message: '' })

  // Form states
  const [submissionForm, setSubmissionForm] = useState({
    contentType: 'story',
    title: '',
    storyOrPoem: '',
    drawingDescription: '',
    kidName: '',
    kidAge: '',
    schoolName: '',
    parentName: '',
    phoneNo: '',
    moreTitle: '',
    moreDescription: '',
    status: 'Pending',
    highlight: 'Disable'
  })

  // File upload states
  const [fileInputs, setFileInputs] = useState({})
  const [selectedFileNames, setSelectedFileNames] = useState({
    coverImage: '',
    drawing: '',
    kidPhoto: ''
  })

  // API Base URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL 

  // Fetch submissions
  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/kids-submissions`)
      const data = await response.json()
      if (data.success) {
        setSubmissions(data.data)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  // Modal functions
  const showModal = (type, message) => {
    setModal({ show: true, type, message })
    setTimeout(() => setModal({ show: false, type: '', message: '' }), 3000)
  }

  // Create submission
  const createSubmission = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      
      // Add all form fields
      Object.keys(submissionForm).forEach(key => {
        if (submissionForm[key]) {
          formData.append(key, submissionForm[key])
        }
      })

      // Add files
      if (fileInputs.coverImage && fileInputs.coverImage.files[0]) {
        formData.append('coverImage', fileInputs.coverImage.files[0])
      }
      if (fileInputs.drawing && fileInputs.drawing.files[0]) {
        formData.append('drawing', fileInputs.drawing.files[0])
      }
      if (fileInputs.kidPhoto && fileInputs.kidPhoto.files[0]) {
        formData.append('kidPhoto', fileInputs.kidPhoto.files[0])
      }

      const response = await fetch(`${API_BASE}/kids-submissions`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Submission created successfully!')
        resetSubmissionForm()
        setShowForm(false)
        fetchSubmissions()
      } else {
        showModal('error', data.message || 'Failed to create submission')
      }
    } catch (error) {
      showModal('error', 'Error creating submission')
    } finally {
      setLoading(false)
    }
  }

  // Update submission
  const updateSubmission = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      
      // Add all form fields
      Object.keys(submissionForm).forEach(key => {
        if (submissionForm[key]) {
          formData.append(key, submissionForm[key])
        }
      })

      // Add files
      if (fileInputs.coverImage && fileInputs.coverImage.files[0]) {
        formData.append('coverImage', fileInputs.coverImage.files[0])
      }
      if (fileInputs.drawing && fileInputs.drawing.files[0]) {
        formData.append('drawing', fileInputs.drawing.files[0])
      }
      if (fileInputs.kidPhoto && fileInputs.kidPhoto.files[0]) {
        formData.append('kidPhoto', fileInputs.kidPhoto.files[0])
      }

      const response = await fetch(`${API_BASE}/kids-submissions/${editingSubmission._id}`, {
        method: 'PUT',
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Submission updated successfully!')
        resetSubmissionForm()
        setShowForm(false)
        fetchSubmissions()
      } else {
        showModal('error', data.message || 'Failed to update submission')
      }
    } catch (error) {
      showModal('error', 'Error updating submission')
    } finally {
      setLoading(false)
    }
  }

  // Delete submission
  const deleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/kids-submissions/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Submission deleted successfully!')
        fetchSubmissions()
      } else {
        showModal('error', data.message || 'Failed to delete submission')
      }
    } catch (error) {
      showModal('error', 'Error deleting submission')
    } finally {
      setLoading(false)
    }
  }

  // Reset forms
  const resetSubmissionForm = () => {
    setSubmissionForm({
      contentType: 'story',
      title: '',
      storyOrPoem: '',
      drawingDescription: '',
      kidName: '',
      kidAge: '',
      schoolName: '',
      parentName: '',
      phoneNo: '',
      moreTitle: '',
      moreDescription: '',
      status: 'Pending',
      highlight: 'Disable'
    })
    setEditingSubmission(null)
    setShowForm(false)
    setFileInputs({})
    setSelectedFileNames({
      coverImage: '',
      drawing: '',
      kidPhoto: ''
    })
  }

  // Edit handlers
  const editSubmission = (submission) => {
    setEditingSubmission(submission)
    setSubmissionForm({
      contentType: submission.contentType || 'story',
      title: submission.title || '',
      storyOrPoem: submission.storyOrPoem || '',
      drawingDescription: submission.drawingDescription || '',
      kidName: submission.kidName || '',
      kidAge: submission.kidAge || '',
      schoolName: submission.schoolName || '',
      parentName: submission.parentName || '',
      phoneNo: submission.phoneNo || '',
      moreTitle: submission.moreTitle || '',
      moreDescription: submission.moreDescription || '',
      status: submission.status || 'Pending',
      highlight: submission.highlight || 'Disable'
    })
    setSelectedFileNames({
      coverImage: submission.coverImage ? submission.coverImage.split('/').pop() : '',
      drawing: submission.drawing ? submission.drawing.split('/').pop() : '',
      kidPhoto: submission.kidPhoto ? submission.kidPhoto.split('/').pop() : ''
    })
    setExpandedCard(null)
    setSelectedSubmission(null)
    setShowForm(true)
  }

  const viewSubmission = (submission) => {
    setSelectedSubmission(submission)
    setShowDetails(true)
  }

  // Get content type icon
  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'story': return <FiBook className="w-5 h-5" />
      case 'poem': return <FiFileText className="w-5 h-5" />
      case 'drawing': return <FiImage className="w-5 h-5" />
      default: return <FiBook className="w-5 h-5" />
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'text-green-400 bg-green-400/20'
      case 'Pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'Draft': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 
                className="text-white text-5xl font-bold mb-1 relative"
                style={{ fontFamily: 'Archivo Black' }}
              >
                Kids Submissions
                <div 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-32"
                  style={{
                    background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)'
                  }}
                ></div>
              </h1>
            </div>
            <div>
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
                <span>Add Submission</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submissions Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition duration-200"
              >
                {/* Content Type & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-purple-400">
                    {getContentTypeIcon(submission.contentType)}
                    <span className="text-sm font-medium capitalize">{submission.contentType}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>

                {/* Cover Image */}
                {submission.coverImage && (
                  <div className="mb-4">
                    <img
                      src={submission.coverImage}
                      alt={submission.title}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-white font-semibold mb-2 line-clamp-2">{submission.title}</h3>

                {/* Kid Info */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
                    <FiUser className="w-4 h-4" />
                    <span>{submission.kidName}</span>
                    {submission.kidAge && <span>({submission.kidAge})</span>}
                  </div>
                  {submission.schoolName && (
                    <div className="text-gray-500 text-xs">{submission.schoolName}</div>
                  )}
                </div>

                {/* Highlight Badge */}
                {submission.highlight === 'Enable' && (
                  <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                    <FiStar className="w-4 h-4" />
                    <span className="text-xs font-medium">Highlighted</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewSubmission(submission)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition duration-200 text-sm"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => editSubmission(submission)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl transition duration-200 text-sm"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteSubmission(submission._id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition duration-200 text-sm"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && submissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No submissions found</div>
              <p className="text-gray-500 mt-2">Create your first submission to get started</p>
            </div>
          )}
        </div>

        {/* Gradient Background */}
        <div className="fixed -bottom-80 right-0 z-10 pointer-events-none">
          <img 
            src={gradient} 
            alt="Gradient" 
            className="w-[800px] h-[800px] opacity-60"
          />
        </div>
      </div>

      {/* Submission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
                {editingSubmission ? 'Edit Submission' : 'Add New Submission'}
              </h2>
              <button
                onClick={resetSubmissionForm}
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingSubmission ? updateSubmission : createSubmission} className="space-y-6">
              {/* Content Type */}
              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Content Type *</label>
                <select
                  value={submissionForm.contentType}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, contentType: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                >
                  <option value="story">Story</option>
                  <option value="poem">Poem</option>
                  <option value="drawing">Drawing</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Title *</label>
                <input
                  type="text"
                  value={submissionForm.title}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter submission title"
                />
              </div>

              {/* Story or Poem */}
              {submissionForm.contentType !== 'drawing' && (
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>
                    {submissionForm.contentType === 'story' ? 'Story' : 'Poem'} *
                  </label>
                  <textarea
                    value={submissionForm.storyOrPoem}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, storyOrPoem: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400 resize-none"
                    placeholder={`Enter ${submissionForm.contentType} content`}
                  />
                </div>
              )}

              {/* Drawing Description */}
              {submissionForm.contentType === 'drawing' && (
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Drawing Description *</label>
                  <textarea
                    value={submissionForm.drawingDescription}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, drawingDescription: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400 resize-none"
                    placeholder="Describe the drawing"
                  />
                </div>
              )}

              {/* Kid Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Kid Name *</label>
                  <input
                    type="text"
                    value={submissionForm.kidName}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, kidName: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                    placeholder="Enter kid's name"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Kid Age</label>
                  <input
                    type="text"
                    value={submissionForm.kidAge}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, kidAge: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                    placeholder="Enter kid's age"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>School Name</label>
                <input
                  type="text"
                  value={submissionForm.schoolName}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, schoolName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter school name"
                />
              </div>

              {/* Parent Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Parent Name *</label>
                  <input
                    type="text"
                    value={submissionForm.parentName}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, parentName: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                    placeholder="Enter parent's name"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Phone Number *</label>
                  <input
                    type="tel"
                    value={submissionForm.phoneNo}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, phoneNo: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Additional Title</label>
                <input
                  type="text"
                  value={submissionForm.moreTitle}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, moreTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter additional title"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Additional Description</label>
                <textarea
                  value={submissionForm.moreDescription}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, moreDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400 resize-none"
                  placeholder="Enter additional description"
                />
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Cover Image</label>
                  <div className="relative w-full h-12 bg-gray-800/50 border border-gray-600 rounded-2xl overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setFileInputs({ ...fileInputs, coverImage: e.target })
                        setSelectedFileNames({ ...selectedFileNames, coverImage: e.target.files[0]?.name || '' })
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center h-full px-4">
                      <div className="mr-4 py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-xl transition duration-200">
                        Choose Image
                      </div>
                      <span className="text-gray-400 text-sm">
                        {selectedFileNames.coverImage || 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Drawing */}
                {submissionForm.contentType === 'drawing' && (
                  <div>
                    <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Drawing</label>
                    <div className="relative w-full h-12 bg-gray-800/50 border border-gray-600 rounded-2xl overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setFileInputs({ ...fileInputs, drawing: e.target })
                          setSelectedFileNames({ ...selectedFileNames, drawing: e.target.files[0]?.name || '' })
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center h-full px-4">
                        <div className="mr-4 py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-xl transition duration-200">
                          Choose Drawing
                        </div>
                        <span className="text-gray-400 text-sm">
                          {selectedFileNames.drawing || 'No file chosen'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Kid Photo */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Kid Photo</label>
                  <div className="relative w-full h-12 bg-gray-800/50 border border-gray-600 rounded-2xl overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setFileInputs({ ...fileInputs, kidPhoto: e.target })
                        setSelectedFileNames({ ...selectedFileNames, kidPhoto: e.target.files[0]?.name || '' })
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center h-full px-4">
                      <div className="mr-4 py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-xl transition duration-200">
                        Choose Photo
                      </div>
                      <span className="text-gray-400 text-sm">
                        {selectedFileNames.kidPhoto || 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Highlight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Status</label>
                  <select
                    value={submissionForm.status}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Highlight</label>
                  <select
                    value={submissionForm.highlight}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, highlight: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  >
                    <option value="Disable">Disable</option>
                    <option value="Enable">Enable</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={resetSubmissionForm}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl transition duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-2xl transition duration-200 font-semibold flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiPlus className="w-5 h-5" />
                      <span>{editingSubmission ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {showDetails && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
                Submission Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getContentTypeIcon(selectedSubmission.contentType)}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedSubmission.title}</h3>
                    <p className="text-gray-400 capitalize">{selectedSubmission.contentType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                  {selectedSubmission.highlight === 'Enable' && (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <FiStar className="w-4 h-4" />
                      <span className="text-sm font-medium">Highlighted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              {selectedSubmission.coverImage && (
                <div>
                  <img
                    src={selectedSubmission.coverImage}
                    alt={selectedSubmission.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Content */}
              {selectedSubmission.storyOrPoem && (
                <div>
                  <h4 className="text-white font-semibold mb-3">
                    {selectedSubmission.contentType === 'story' ? 'Story' : 'Poem'}
                  </h4>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedSubmission.storyOrPoem}</p>
                  </div>
                </div>
              )}

              {/* Drawing */}
              {selectedSubmission.drawing && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Drawing</h4>
                  <img
                    src={selectedSubmission.drawing}
                    alt="Drawing"
                    className="w-full h-64 object-contain bg-gray-800 rounded-xl"
                  />
                  {selectedSubmission.drawingDescription && (
                    <div className="mt-3 bg-gray-800/50 rounded-xl p-4">
                      <p className="text-gray-300">{selectedSubmission.drawingDescription}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Kid Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Kid Information</h4>
                  <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{selectedSubmission.kidName}</span>
                    </div>
                    {selectedSubmission.kidAge && (
                      <div className="text-gray-400 text-sm">Age: {selectedSubmission.kidAge}</div>
                    )}
                    {selectedSubmission.schoolName && (
                      <div className="text-gray-400 text-sm">School: {selectedSubmission.schoolName}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Parent Information</h4>
                  <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                    <div className="text-gray-300">{selectedSubmission.parentName}</div>
                    <div className="text-gray-400 text-sm">{selectedSubmission.phoneNo}</div>
                  </div>
                </div>
              </div>

              {/* Kid Photo */}
              {selectedSubmission.kidPhoto && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Kid Photo</h4>
                  <img
                    src={selectedSubmission.kidPhoto}
                    alt="Kid Photo"
                    className="w-32 h-32 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Additional Information */}
              {(selectedSubmission.moreTitle || selectedSubmission.moreDescription) && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Additional Information</h4>
                  <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                    {selectedSubmission.moreTitle && (
                      <div className="text-white font-medium">{selectedSubmission.moreTitle}</div>
                    )}
                    {selectedSubmission.moreDescription && (
                      <div className="text-gray-300">{selectedSubmission.moreDescription}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-gray-400 text-sm">
                <div>Created: {new Date(selectedSubmission.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(selectedSubmission.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        show={modal.show}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ show: false, type: '', message: '' })}
      />
    </div>
  )
}

export default KidsSubmission