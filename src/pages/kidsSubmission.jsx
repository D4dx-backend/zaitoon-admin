import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiX, FiUpload, FiImage, FiUser, FiBook, FiStar, FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi'
import SuccessModal from '../components/SuccessModal'
import Sidebar from '../components/Sidebar'
import CustomDropdown from '../components/CustomDropdown'
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
        headers: {
          // Let the browser set the multipart boundary automatically
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
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

  // Update submission status
  const updateSubmissionStatus = async (submissionId, newStatus) => {
    setLoading(true)
    
    try {
      const response = await fetch(`${API_BASE}/kids-submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Submission status updated successfully!')
        fetchSubmissions()
        // Update the selected submission if it's currently being viewed
        if (selectedSubmission && selectedSubmission._id === submissionId) {
          setSelectedSubmission({ ...selectedSubmission, status: newStatus })
        }
      } else {
        showModal('error', data.message || 'Failed to update submission status')
      }
    } catch (error) {
      showModal('error', 'Error updating submission status')
    } finally {
      setLoading(false)
    }
  }

  // Update submission highlight
  const updateSubmissionHighlight = async (submissionId, newHighlight) => {
    setLoading(true)
    
    try {
      const response = await fetch(`${API_BASE}/kids-submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ highlight: newHighlight })
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Submission highlight updated successfully!')
        fetchSubmissions()
        // Update the selected submission if it's currently being viewed
        if (selectedSubmission && selectedSubmission._id === submissionId) {
          setSelectedSubmission({ ...selectedSubmission, highlight: newHighlight })
        }
      } else {
        showModal('error', data.message || 'Failed to update submission highlight')
      }
    } catch (error) {
      showModal('error', 'Error updating submission highlight')
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
      case 'other': return <FiStar className="w-5 h-5" />
      default: return <FiBook className="w-5 h-5" />
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'text-green-400 bg-green-400/20'
      case 'Pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'Rejected': return 'text-red-400 bg-red-400/20'
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
          </div>
        </div>

        {/* Submissions Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {submissions.length > 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-300 font-semibold">Title</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-semibold">Type</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-semibold">Status</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-semibold">Highlight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr 
                        key={submission._id} 
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition duration-200 cursor-pointer"
                        onClick={() => viewSubmission(submission)}
                      >
                        <td className="py-4 px-6">
                          <div className="max-w-xs">
                            <h3 className="text-white font-medium truncate">{submission.title}</h3>
                            {submission.moreTitle && (
                              <p className="text-gray-400 text-sm truncate">{submission.moreTitle}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 text-purple-400">
                            {getContentTypeIcon(submission.contentType)}
                            <span className="text-sm font-medium capitalize">{submission.contentType}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {submission.highlight === 'Enable' ? (
                            <div className="flex items-center space-x-1 text-yellow-400">
                              <FiStar className="w-4 h-4" />
                              <span className="text-xs font-medium">Highlighted</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Disabled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

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
              <p className="text-gray-500 mt-2">No submissions to display yet.</p>
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth">
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
                  <option value="other">Other</option>
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
              {submissionForm.contentType !== 'drawing' && submissionForm.contentType !== 'other' && (
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

              {/* Other Content */}
              {submissionForm.contentType === 'other' && (
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Content Description *</label>
                  <textarea
                    value={submissionForm.storyOrPoem}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, storyOrPoem: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400 resize-none"
                    placeholder="Enter content description"
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
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth">
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
                  <h4 className="text-white font-semibold mb-3">Cover Image</h4>
                  <img
                    src={selectedSubmission.coverImage}
                    alt={selectedSubmission.title}
                    className="w-full h-64 object-contain bg-gray-800 rounded-xl"
                  />
                </div>
              )}

              {/* Content */}
              {selectedSubmission.storyOrPoem && (
                <div>
                  <h4 className="text-white font-semibold mb-3">
                    {selectedSubmission.contentType === 'story' ? 'Story Content' : 'Poem Content'}
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
                    <div className="mt-3">
                      <h5 className="text-white font-medium mb-2">Drawing Description</h5>
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <p className="text-gray-300">{selectedSubmission.drawingDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Kid Information */}
              <div>
                <h4 className="text-white font-semibold mb-3">Kid Information</h4>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-start space-x-4">
                    {/* Kid Photo */}
                    {selectedSubmission.kidPhoto && (
                      <div className="flex-shrink-0">
                        <img
                          src={selectedSubmission.kidPhoto}
                          alt="Kid Photo"
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      </div>
                    )}
                    {/* Kid Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300 font-medium">Name: {selectedSubmission.kidName}</span>
                      </div>
                      {selectedSubmission.kidAge && (
                        <div className="text-gray-400">Age: {selectedSubmission.kidAge}</div>
                      )}
                      {selectedSubmission.schoolName && (
                        <div className="text-gray-400">School: {selectedSubmission.schoolName}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h4 className="text-white font-semibold mb-3">Parent Information</h4>
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                  <div className="text-gray-300">Name: {selectedSubmission.parentName}</div>
                  <div className="text-gray-400">Phone: {selectedSubmission.phoneNo}</div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedSubmission.moreTitle || selectedSubmission.moreDescription) && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Additional Information</h4>
                  <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                    {selectedSubmission.moreTitle && (
                      <div>
                        <span className="text-gray-400 text-sm">Additional Title:</span>
                        <div className="text-white font-medium mt-1">{selectedSubmission.moreTitle}</div>
                      </div>
                    )}
                    {selectedSubmission.moreDescription && (
                      <div>
                        <span className="text-gray-400 text-sm">Additional Description:</span>
                        <div className="text-gray-300 mt-1">{selectedSubmission.moreDescription}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submission Metadata */}
              <div>
                <h4 className="text-white font-semibold mb-3">Submission Details</h4>
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                  <div className="text-gray-400">
                    <span>Content Type: </span>
                    <span className="text-purple-400 capitalize">{selectedSubmission.contentType}</span>
                  </div>
                  
                  {/* Status Update Field */}
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">Status:</span>
                    <div className="flex items-center space-x-2">
                      <CustomDropdown
                        options={[
                          { value: 'Pending', label: 'Pending' },
                          { value: 'Approved', label: 'Approved' },
                          { value: 'Rejected', label: 'Rejected' }
                        ]}
                        value={selectedSubmission.status}
                        onChange={(value) => updateSubmissionStatus(selectedSubmission._id, value)}
                        placeholder="Select status..."
                        className="w-40"
                        disabled={loading}
                      />
                      {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Highlight Radio Buttons */}
                  <div className="space-y-3">
                    <span className="text-gray-400">Highlight:</span>
                    <div className="flex space-x-6">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name="highlight"
                            value="Enable"
                            checked={selectedSubmission.highlight === 'Enable'}
                            onChange={(e) => updateSubmissionHighlight(selectedSubmission._id, e.target.value)}
                            className="sr-only"
                            disabled={loading}
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                            selectedSubmission.highlight === 'Enable' 
                              ? 'border-yellow-500 bg-yellow-500' 
                              : 'border-gray-600 bg-gray-800'
                          }`}>
                            {selectedSubmission.highlight === 'Enable' && (
                              <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-white text-sm font-medium">Enable</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name="highlight"
                            value="Disable"
                            checked={selectedSubmission.highlight === 'Disable'}
                            onChange={(e) => updateSubmissionHighlight(selectedSubmission._id, e.target.value)}
                            className="sr-only"
                            disabled={loading}
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                            selectedSubmission.highlight === 'Disable' 
                              ? 'border-gray-500 bg-gray-500' 
                              : 'border-gray-600 bg-gray-800'
                          }`}>
                            {selectedSubmission.highlight === 'Disable' && (
                              <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-white text-sm font-medium">Disable</span>
                      </label>
                    </div>
                    {loading && (
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500"></div>
                        <span>Updating...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-gray-400">
                    <FiClock className="w-4 h-4" />
                    <span>Created: {new Date(selectedSubmission.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Updated: {new Date(selectedSubmission.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowDetails(false)
                    editSubmission(selectedSubmission)
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition duration-200"
                  disabled={loading}
                >
                  <FiEdit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false)
                    deleteSubmission(selectedSubmission._id)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition duration-200"
                  disabled={loading}
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
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