import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SuccessModal from '../components/SuccessModal'
import CustomDropdown from '../components/CustomDropdown'
import { 
  FiPlus, 
  FiX,
  FiSave,
  FiEdit3,
  FiTrash2,
  FiPlay,
  FiVideo
} from 'react-icons/fi'
import { HiCalendar } from 'react-icons/hi'
import gradient from '../assets/gradiantRight.png'

function Videos() {
  const navigate = useNavigate()
  
  // State management
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '', onConfirm: null })
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)
  const [showCategoryTable, setShowCategoryTable] = useState(false)
  
  // Form states
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  
  // Form data
  const [videoForm, setVideoForm] = useState({
    title: '',
    category: '',
    videoLink: ''
  })
  
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    image: ''
  })


  // API Base URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  
  // Debug logging

  // Fetch videos
  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/videos`)
      const data = await response.json()
      if (data.success) {
        setVideos(data.data.videos)
      } else {
        showModal('error', 'Failed to fetch videos')
      }
    } catch (error) {
      showModal('error', 'Error fetching videos')
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/videos-categories`)
      const data = await response.json()
      if (data.success) {
        setCategories(data.data.categories)
      } else {
        showModal('error', 'Failed to fetch categories')
      }
    } catch (error) {
      showModal('error', 'Error fetching categories')
    }
  }

  // Show modal
  const showModal = (type, message, onConfirm = null) => {
    setModal({ isOpen: true, type, message, onConfirm })
  }

  // Close modal
  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', message: '', onConfirm: null })
  }

  // Create video
  const createVideo = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('title', videoForm.title)
      formData.append('category', videoForm.category)
      formData.append('videoType', 'link')
      formData.append('video', videoForm.videoLink)
      
      const response = await fetch(`${API_BASE}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Video created successfully!')
        resetVideoForm()
        setShowVideoForm(false)
        fetchVideos()
      } else {
        showModal('error', data.message || 'Failed to create video')
      }
    } catch (error) {
      showModal('error', 'Error creating video')
    } finally {
      setLoading(false)
    }
  }

  // Update video
  const updateVideo = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('title', videoForm.title)
      formData.append('category', videoForm.category)
      formData.append('videoType', 'link')
      formData.append('video', videoForm.videoLink)
      
      const response = await fetch(`${API_BASE}/videos/${editingVideo._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Video updated successfully!')
        resetVideoForm()
        setShowVideoForm(false)
        fetchVideos()
      } else {
        showModal('error', data.message || 'Failed to update video')
      }
    } catch (error) {
      showModal('error', 'Error updating video')
    } finally {
      setLoading(false)
    }
  }

  // Delete video
  const deleteVideo = async (videoId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Video deleted successfully!')
        fetchVideos()
      } else {
        showModal('error', data.message || 'Failed to delete video')
      }
    } catch (error) {
      showModal('error', 'Error deleting video')
    } finally {
      setLoading(false)
    }
  }

  // Create category
  const createCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('title', categoryForm.title)
      
      // Handle image file upload
      if (fileInputs.image && fileInputs.image.files[0]) {
        formData.append('image', fileInputs.image.files[0])
      } else if (categoryForm.image) {
        formData.append('image', categoryForm.image)
      }
      
      const response = await fetch(`${API_BASE}/videos-categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Category created successfully!')
        resetCategoryForm()
        setShowCategoryForm(false)
        fetchCategories()
      } else {
        showModal('error', data.message || 'Failed to create category')
      }
    } catch (error) {
      showModal('error', 'Error creating category')
    } finally {
      setLoading(false)
    }
  }

  // Update category
  const updateCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('title', categoryForm.title)
      
      // Handle image file upload
      if (fileInputs.image && fileInputs.image.files[0]) {
        formData.append('image', fileInputs.image.files[0])
      } else if (categoryForm.image) {
        formData.append('image', categoryForm.image)
      }
      
      const response = await fetch(`${API_BASE}/videos-categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Category updated successfully!')
        resetCategoryForm()
        setShowCategoryForm(false)
        fetchCategories()
      } else {
        showModal('error', data.message || 'Failed to update category')
      }
    } catch (error) {
      showModal('error', 'Error updating category')
    } finally {
      setLoading(false)
    }
  }

  // Delete category
  const deleteCategory = async (categoryId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/videos-categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Category deleted successfully!')
        fetchCategories()
      } else {
        showModal('error', data.message || 'Failed to delete category')
      }
    } catch (error) {
      showModal('error', 'Error deleting category')
    } finally {
      setLoading(false)
    }
  }

  // Reset forms
  const resetVideoForm = () => {
    setVideoForm({
      title: '',
      category: '',
      videoLink: ''
    })
    setEditingVideo(null)
    setShowVideoForm(false)
  }

  const resetCategoryForm = () => {
    setCategoryForm({
      title: '',
      image: ''
    })
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  // Fetch single video details
  const fetchVideoDetails = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE}/videos/${videoId}`)
      const data = await response.json()
      if (data.success) {
        setSelectedVideo(data.data)
      } else {
        showModal('error', 'Failed to fetch video details')
      }
    } catch (error) {
      showModal('error', 'Error fetching video details')
    }
  }

  // Handle card expand
  const handleCardExpand = (videoId) => {
    setExpandedCard(videoId)
    fetchVideoDetails(videoId)
  }

  // Handle card collapse
  const handleCardCollapse = () => {
    setExpandedCard(null)
    setSelectedVideo(null)
  }

  // Edit handlers
  const editVideo = (video) => {
    setEditingVideo(video)
    setVideoForm({
      title: video.title || '',
      category: video.category?._id || '',
      videoLink: video.videoLink || video.video || ''
    })
    setExpandedCard(null)
    setSelectedVideo(null)
    setShowVideoForm(true)
  }

  const editCategory = (category) => {
    setEditingCategory(category)
    setCategoryForm({
      title: category.title || '',
      image: category.image || ''
    })
    setShowCategoryForm(true)
  }

  // Load data on component mount
  useEffect(() => {
    fetchVideos()
    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-black flex">
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
                Videos
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
                onClick={() => setShowVideoForm(true)}
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
                <span>Add Video</span>
              </button>
            </div>
          </div>
        </div>

        {/* Video Categories Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="mb-8">
            <h2 
              className="text-white text-2xl font-bold mb-6 relative"
              style={{ fontFamily: 'Archivo Black' }}
            >
              Video Categories
              <div 
                className="absolute -bottom-1 left-0 h-0.5 w-24"
                style={{
                  background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)'
                }}
              ></div>
            </h2>
            
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-6">No categories found</div>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center space-x-2 mx-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Your First Category</span>
                </button>
              </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
                 {/* Category Cards - Limited Display */}
                 {categories.slice(0, 5).map((category) => (
                   <div 
                     key={category._id}
                     className="relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-gray-600 hover:scale-105 hover:shadow-2xl"
                   >
                     {/* Category Image */}
                     <div className="relative aspect-square overflow-hidden">
                       {category.image ? (
                         <img
                           src={category.image}
                           alt={category.title}
                           className="w-full h-full object-cover transition duration-300"
                         />
                       ) : (
                         <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                           <FiVideo className="w-8 h-8 text-gray-500" />
                         </div>
                       )}
                     </div>

                     {/* Category Info */}
                     <div className="p-3">
                       <h3 className="text-white text-sm font-semibold truncate">
                         {category.title}
                       </h3>
                     </div>
                   </div>
                 ))}

                 {/* Management Card - Always Last */}
                 <div 
                   onClick={() => setShowCategoryTable(!showCategoryTable)}
                   className={`relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border-2 ${
                     showCategoryTable 
                       ? 'border-purple-500 scale-105 shadow-2xl' 
                       : 'border-dashed border-gray-600 hover:border-purple-500 hover:scale-105 hover:shadow-2xl'
                   }`}
                 >
                   <div className="relative aspect-square overflow-hidden flex items-center justify-center">
                     <div className="text-center">
                       <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                         showCategoryTable 
                           ? 'bg-purple-600/30 border-purple-400' 
                           : 'bg-purple-600/20 border-purple-500/30'
                       }`}>
                         <svg 
                           className={`w-8 h-8 text-purple-400 transition-transform duration-300 ${
                             showCategoryTable ? 'rotate-90' : 'rotate-0'
                           }`}
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M9 5l7 7-7 7" 
                           />
                         </svg>
                       </div>
                       <p className="text-white text-sm font-semibold">Manage</p>
                       <p className="text-gray-400 text-xs">Categories</p>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Expandable Category Management Container - Overlay */}
        {showCategoryTable && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCategoryTable(false)
              }
            }}
          >
            <div 
              className="bg-gray-900/80 backdrop-blur-lg rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth animate-in slide-in-from-top-4 duration-500 ease-out"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              <div className="p-6">
                {/* Header with Close Button */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                      Category Management
                    </h1>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setShowCategoryForm(true)
                        setShowCategoryTable(false)
                      }}
                      className="flex items-center justify-center space-x-2 text-white transition duration-200"
                      style={{
                        background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)',
                        width: '140px',
                        height: '32px',
                        borderRadius: '16px',
                        fontFamily: 'Fredoka One',
                        fontWeight: '400',
                        fontSize: '12px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        textAlign: 'center'
                      }}
                    >
                      <FiPlus className="w-3 h-3" />
                      <span>Add Category</span>
                    </button>
                    <button
                      onClick={() => setShowCategoryTable(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Management Table */}
                <div className="scroll-indicator">
                  <div className="max-h-[60vh] overflow-y-auto overflow-x-auto scrollbar-hide scroll-smooth">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-transparent backdrop-blur-sm z-10">
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">Image</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">Title</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">Videos Count</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">Created</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={category._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition duration-200">
                            <td className="py-4 px-4">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.title}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                                  <FiVideo className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-white font-medium">{category.title}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-400">
                                {videos.filter(video => video.category?._id === category._id).length}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-400 text-sm">
                                {new Date(category.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    editCategory(category)
                                    setShowCategoryTable(false)
                                  }}
                                  className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition duration-200"
                                  title="Edit Category"
                                >
                                  <FiEdit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    showModal('confirmation', 'Are you sure you want to delete this category? This will also delete all videos in this category.', () => deleteCategory(category._id))
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition duration-200"
                                  title="Delete Category"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {categories.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-4">No categories found</div>
                    <button
                      onClick={() => {
                        setShowCategoryForm(true)
                        setShowCategoryTable(false)
                      }}
                      className="flex items-center space-x-2 mx-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Videos List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="mb-8">
            <h2 
              className="text-white text-2xl font-bold mb-6 relative"
              style={{ fontFamily: 'Archivo Black' }}
            >
              Videos
              <div 
                className="absolute -bottom-1 left-0 h-0.5 w-16"
                style={{
                  background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)'
                }}
              ></div>
            </h2>
          </div>
          
          {loading && videos.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-white text-lg">Loading videos...</div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-lg mb-6">No videos found</div>
              <button
                onClick={() => setShowVideoForm(true)}
                className="flex items-center space-x-2 mx-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Your First Video</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {videos.map((video) => {
                const isThisCardExpanded = expandedCard === video._id
                const currentVideo = expandedCard === video._id && selectedVideo ? selectedVideo : video
                
                return (
                  <div key={video._id}>
                    {/* Video Card */}
                    <div 
                      className={`relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border-2 ${
                        isThisCardExpanded 
                          ? 'scale-110 z-10 shadow-2xl border-blue-500' 
                          : 'hover:scale-105 hover:shadow-2xl border-transparent hover:border-gray-600'
                      }`}
                      onClick={() => {
                        if (isThisCardExpanded) {
                          handleCardCollapse()
                        } else {
                          handleCardExpand(video._id)
                        }
                      }}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {video.video ? (
                          <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
                            <video
                              src={video.video}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <FiPlay className="w-12 h-12 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <FiVideo className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h3 className="text-white text-sm font-semibold truncate mb-1">
                          {video.title}
                        </h3>
                        {video.category && (
                          <p className="text-gray-400 text-xs truncate">
                            {video.category.title}
                          </p>
                        )}
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
                          {!currentVideo.title ? (
                            <div className="flex items-center justify-center py-20">
                              <div className="text-white text-lg">Loading details...</div>
                            </div>
                          ) : (
                            <div className="p-6">
                              {/* Header with Close Button */}
                              <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                  <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                                    {currentVideo.title}
                                  </h1>
                                  {currentVideo.category && (
                                    <p className="text-gray-300 text-base mb-3">
                                      Category: {currentVideo.category.title}
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
                              
                              {/* Video Player */}
                              {currentVideo.video && (
                                <div className="mb-6 flex justify-center">
                                  <video
                                    src={currentVideo.video}
                                    controls
                                    className="max-w-full max-h-96 rounded-xl shadow-lg"
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              )}

                              {/* Video Details */}
                              <div className="mb-6">
                                <h3 className="text-white text-sm font-medium mb-4 text-gray-300">Video Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {currentVideo.category && (
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                      <span className="text-gray-400 text-xs mb-2 block">Category</span>
                                      <div className="flex items-center space-x-3">
                                        {currentVideo.category.image && (
                                          <img
                                            src={currentVideo.category.image}
                                            alt={currentVideo.category.title}
                                            className="w-8 h-8 object-cover rounded-lg"
                                          />
                                        )}
                                        <span className="text-white text-sm">{currentVideo.category.title}</span>
                                      </div>
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
                                    {new Date(currentVideo.createdAt).toLocaleDateString('en-US', {
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
                                      editVideo(currentVideo)
                                    }}
                                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition duration-200"
                                    title="Edit Video"
                                  >
                                    <FiEdit3 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      showModal('confirmation', 'Are you sure you want to delete this video?', () => deleteVideo(currentVideo._id))
                                    }}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition duration-200"
                                    title="Delete Video"
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
        </div>

        {/* Video Form Modal */}
        {showVideoForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth scroll-indicator">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingVideo ? 'Edit Video' : 'Add New Video'}
                </h2>
                <button
                  onClick={resetVideoForm}
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editingVideo ? updateVideo : createVideo} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Title *</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Category *</label>
                  <CustomDropdown
                    options={categories.map((category) => ({
                      value: category._id,
                      label: category.title
                    }))}
                    value={videoForm.category}
                    onChange={(value) => setVideoForm({ ...videoForm, category: value })}
                    placeholder="Select category..."
                    className="w-full"
                  />
                </div>


                {/* Video Link Input */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Video Link *</label>
                  
                  {editingVideo && (editingVideo.videoLink || editingVideo.video) && (
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm mb-2">Current video link:</p>
                      <a 
                        href={editingVideo.videoLink || editingVideo.video} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm underline"
                      >
                        {editingVideo.videoLink || editingVideo.video}
                      </a>
                    </div>
                  )}
                  <input
                    type="url"
                    value={videoForm.videoLink}
                    onChange={(e) => setVideoForm({ ...videoForm, videoLink: e.target.value })}
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                    required
                    className="w-full h-12 px-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-8">
                  <button
                    type="button"
                    onClick={resetVideoForm}
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
                    <span>{loading ? 'Saving...' : (editingVideo ? 'Update' : 'Create')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth scroll-indicator">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={resetCategoryForm}
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editingCategory ? updateCategory : createCategory} className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Title *</label>
                  <input
                    type="text"
                    value={categoryForm.title}
                    onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>Image</label>
                  {editingCategory && editingCategory.image && (
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm mb-2">Current image:</p>
                      <img src={editingCategory.image} alt="Current category" className="w-20 h-20 object-cover rounded-lg" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFileInputs({ ...fileInputs, image: e.target })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-8">
                  <button
                    type="button"
                    onClick={resetCategoryForm}
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
                    <span>{loading ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update' : 'Create')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Gradient Background */}
        <div className="fixed -bottom-80 right-0 z-10 pointer-events-none">
          <img 
            src={gradient} 
            alt="Gradient" 
            className="w-[800px] h-[800px] opacity-60"
          />
        </div>

        {/* Status Modal */}
        <SuccessModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          message={modal.message}
          onConfirm={modal.onConfirm}
        />
      </div>
    </div>
  )
}

export default Videos
