import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiX, FiUpload, FiImage, FiFile, FiFolder, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import SuccessModal from '../components/SuccessModal'
import CustomDropdown from '../components/CustomDropdown'
import Sidebar from '../components/Sidebar'
import gradient from '../assets/gradiantRight.png'

const BrightBox = () => {
  // States
  const [brightBoxes, setBrightBoxes] = useState([])
  const [brightBoxStories, setBrightBoxStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '', onConfirm: null })
  
  // Form states
  const [showBrightBoxForm, setShowBrightBoxForm] = useState(false)
  const [showBrightBoxStoryForm, setShowBrightBoxStoryForm] = useState(false)
  const [editingBrightBox, setEditingBrightBox] = useState(null)
  const [editingBrightBoxStory, setEditingBrightBoxStory] = useState(null)
  
  // View states
  const [expandedBrightBox, setExpandedBrightBox] = useState(null)
  const [selectedBrightBoxStory, setSelectedBrightBoxStory] = useState(null)
  const [showStoryDetails, setShowStoryDetails] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [showCategoryTable, setShowCategoryTable] = useState(false)
  const [expandedStory, setExpandedStory] = useState(null)
  const [showStoriesTable, setShowStoriesTable] = useState(false)
  
  // Form data
  const [brightBoxForm, setBrightBoxForm] = useState({
    title: '',
    mlTitle: '',
    urTitle: '',
    hinTitle: ''
  })
  
  const [brightBoxStoryForm, setBrightBoxStoryForm] = useState({
    title: '',
    mlTitle: '',
    urTitle: '',
    hinTitle: '',
    category: ''
  })

  // File upload states
  const [fileInputs, setFileInputs] = useState({})
  const [selectedFileNames, setSelectedFileNames] = useState({})

  // API Base URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL 

  // Fetch all data
  const fetchBrightBoxes = async () => {
    try {
      const response = await fetch(`${API_BASE}/bright-boxes`)
      const data = await response.json()
      if (data.success) {
        setBrightBoxes(data.data.brightBoxes)
      }
    } catch (error) {
      console.error('Error fetching bright boxes:', error)
    }
  }

  const fetchBrightBoxStories = async () => {
    try {
      const response = await fetch(`${API_BASE}/bright-box-stories`)
      const data = await response.json()
      if (data.success) {
        setBrightBoxStories(data.data.brightBoxStories)
      }
    } catch (error) {
      console.error('Error fetching bright box stories:', error)
    }
  }

  const normalizeUrl = (url) => {
    if (!url) return ''
    // If starts with //, prefix https:
    if (url.startsWith('//')) return `https:${url}`
    // If missing protocol but looks like domain/path, prefix https://
    if (!/^https?:\/\//i.test(url)) return `https://${url.replace(/^\//, '')}`
    return url
  }

  const openFileInNewTab = (url) => {
    if (!url) return
    try {
      const absoluteUrl = normalizeUrl(url)
      window.open(absoluteUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchBrightBoxes(),
          fetchBrightBoxStories()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
        showModal('error', 'Failed to load data. Please refresh the page.')
      }
    }
    
    loadData()
  }, [])

  // Modal functions
  const showModal = (type, message, onConfirm = null) => {
    setModal({ isOpen: true, type, message, onConfirm })
  }

  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', message: '', onConfirm: null })
  }

  // BrightBox CRUD operations
  const createBrightBox = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      Object.keys(brightBoxForm).forEach(key => {
        if (brightBoxForm[key]) {
          formData.append(key, brightBoxForm[key])
        }
      })
      
      if (fileInputs.image && fileInputs.image.files[0]) {
        formData.append('image', fileInputs.image.files[0])
      }

      const response = await fetch(`${API_BASE}/bright-boxes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Bright Box created successfully!')
        resetBrightBoxForm()
        setShowBrightBoxForm(false)
        fetchBrightBoxes()
      } else {
        showModal('error', data.message || 'Failed to create bright box')
      }
    } catch (error) {
      showModal('error', 'Error creating bright box')
    } finally {
      setLoading(false)
    }
  }

  const updateBrightBox = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      Object.keys(brightBoxForm).forEach(key => {
        if (brightBoxForm[key]) {
          formData.append(key, brightBoxForm[key])
        }
      })
      
      if (fileInputs.image && fileInputs.image.files[0]) {
        formData.append('image', fileInputs.image.files[0])
      }

      const response = await fetch(`${API_BASE}/bright-boxes/${editingBrightBox._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Bright Box updated successfully!')
        resetBrightBoxForm()
        setShowBrightBoxForm(false)
        fetchBrightBoxes()
      } else {
        showModal('error', data.message || 'Failed to update bright box')
      }
    } catch (error) {
      showModal('error', 'Error updating bright box')
    } finally {
      setLoading(false)
    }
  }

  const deleteBrightBox = async (id) => {
    showModal('confirmation', 'Are you sure you want to delete this bright box? This will also delete all stories in this category.', async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE}/bright-boxes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
        
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Delete error response:', errorData)
          showModal('error', errorData.message || `Failed to delete bright box (${response.status})`)
          return
        }
        
        const data = await response.json()
        
        if (data.success) {
          showModal('success', 'Bright Box deleted successfully!')
          fetchBrightBoxes()
          fetchBrightBoxStories()
        } else {
          showModal('error', data.message || 'Failed to delete bright box')
        }
      } catch (error) {
        console.error('Delete bright box error:', error)
        showModal('error', `Error deleting bright box: ${error.message}`)
      } finally {
        setLoading(false)
      }
    })
  }

  // BrightBoxStory CRUD operations
  const createBrightBoxStory = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      Object.keys(brightBoxStoryForm).forEach(key => {
        if (brightBoxStoryForm[key]) {
          formData.append(key, brightBoxStoryForm[key])
        }
      })
      
      // Handle file uploads
      if (fileInputs.storyImage && fileInputs.storyImage.files[0]) {
        formData.append('image', fileInputs.storyImage.files[0])
      }
      if (fileInputs.enFile && fileInputs.enFile.files[0]) {
        formData.append('enFile', fileInputs.enFile.files[0])
      }
      if (fileInputs.mlFile && fileInputs.mlFile.files[0]) {
        formData.append('mlFile', fileInputs.mlFile.files[0])
      }
      if (fileInputs.urFile && fileInputs.urFile.files[0]) {
        formData.append('urFile', fileInputs.urFile.files[0])
      }
      if (fileInputs.hinFile && fileInputs.hinFile.files[0]) {
        formData.append('hinFile', fileInputs.hinFile.files[0])
      }

      const response = await fetch(`${API_BASE}/bright-box-stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Bright Box Story created successfully!')
        resetBrightBoxStoryForm()
        setShowBrightBoxStoryForm(false)
        fetchBrightBoxStories()
      } else {
        showModal('error', data.message || 'Failed to create bright box story')
      }
    } catch (error) {
      showModal('error', 'Error creating bright box story')
    } finally {
      setLoading(false)
    }
  }

  const updateBrightBoxStory = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData()
      Object.keys(brightBoxStoryForm).forEach(key => {
        if (brightBoxStoryForm[key]) {
          formData.append(key, brightBoxStoryForm[key])
        }
      })
      
      // Handle file uploads
      if (fileInputs.storyImage && fileInputs.storyImage.files[0]) {
        formData.append('image', fileInputs.storyImage.files[0])
      }
      if (fileInputs.enFile && fileInputs.enFile.files[0]) {
        formData.append('enFile', fileInputs.enFile.files[0])
      }
      if (fileInputs.mlFile && fileInputs.mlFile.files[0]) {
        formData.append('mlFile', fileInputs.mlFile.files[0])
      }
      if (fileInputs.urFile && fileInputs.urFile.files[0]) {
        formData.append('urFile', fileInputs.urFile.files[0])
      }
      if (fileInputs.hinFile && fileInputs.hinFile.files[0]) {
        formData.append('hinFile', fileInputs.hinFile.files[0])
      }

      const response = await fetch(`${API_BASE}/bright-box-stories/${editingBrightBoxStory._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Bright Box Story updated successfully!')
        resetBrightBoxStoryForm()
        setShowBrightBoxStoryForm(false)
        fetchBrightBoxStories()
      } else {
        showModal('error', data.message || 'Failed to update bright box story')
      }
    } catch (error) {
      showModal('error', 'Error updating bright box story')
    } finally {
      setLoading(false)
    }
  }

  const deleteBrightBoxStory = async (id) => {
    showModal('confirmation', 'Are you sure you want to delete this bright box story?', async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE}/bright-box-stories/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
        
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Delete error response:', errorData)
          showModal('error', errorData.message || `Failed to delete bright box story (${response.status})`)
          return
        }
        
        const data = await response.json()
        
        if (data.success) {
          showModal('success', 'Bright Box Story deleted successfully!')
          fetchBrightBoxStories()
        } else {
          showModal('error', data.message || 'Failed to delete bright box story')
        }
      } catch (error) {
        console.error('Delete bright box story error:', error)
        showModal('error', `Error deleting bright box story: ${error.message}`)
      } finally {
        setLoading(false)
      }
    })
  }

  // Reset forms
  const resetBrightBoxForm = () => {
    setBrightBoxForm({
      title: '',
      mlTitle: '',
      urTitle: '',
      hinTitle: ''
    })
    setEditingBrightBox(null)
    setShowBrightBoxForm(false)
    setFileInputs(prev => ({ ...prev, image: null }))
    setSelectedFileNames(prev => ({ ...prev, image: '' }))
  }

  const resetBrightBoxStoryForm = () => {
    setBrightBoxStoryForm({
      title: '',
      mlTitle: '',
      urTitle: '',
      hinTitle: '',
      category: ''
    })
    setEditingBrightBoxStory(null)
    setShowBrightBoxStoryForm(false)
    setFileInputs({})
    setSelectedFileNames({})
  }

  // Edit handlers
  const editBrightBox = (brightBox) => {
    setEditingBrightBox(brightBox)
    setBrightBoxForm({
      title: brightBox.title || '',
      mlTitle: brightBox.mlTitle || '',
      urTitle: brightBox.urTitle || '',
      hinTitle: brightBox.hinTitle || ''
    })
    setSelectedFileNames(prev => ({ 
      ...prev, 
      image: brightBox.image ? brightBox.image.split('/').pop() : '' 
    }))
    setShowBrightBoxForm(true)
  }

  const editBrightBoxStory = (brightBoxStory) => {
    setEditingBrightBoxStory(brightBoxStory)
    setBrightBoxStoryForm({
      title: brightBoxStory.title || '',
      mlTitle: brightBoxStory.mlTitle || '',
      urTitle: brightBoxStory.urTitle || '',
      hinTitle: brightBoxStory.hinTitle || '',
      category: brightBoxStory.category?._id || ''
    })
    setSelectedFileNames({
      storyImage: brightBoxStory.image ? brightBoxStory.image.split('/').pop() : '',
      enFile: brightBoxStory.enFile ? brightBoxStory.enFile.split('/').pop() : '',
      mlFile: brightBoxStory.mlFile ? brightBoxStory.mlFile.split('/').pop() : '',
      urFile: brightBoxStory.urFile ? brightBoxStory.urFile.split('/').pop() : '',
      hinFile: brightBoxStory.hinFile ? brightBoxStory.hinFile.split('/').pop() : ''
    })
    setShowBrightBoxStoryForm(true)
  }

  const viewBrightBoxStory = (story) => {
    setSelectedBrightBoxStory(story)
    setShowStoryDetails(true)
  }

  // Get stories for a category
  const getStoriesByCategory = (categoryId) => {
    return brightBoxStories.filter(story => story.category?._id === categoryId)
  }

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      <div className="flex-1 ml-64 h-screen overflow-y-auto scrollbar-hide">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 
                className="text-white text-5xl font-bold mb-1 relative"
                style={{ fontFamily: 'Archivo Black' }}
              >
                Bright Box
                <div 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-32"
                  style={{
                    background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)'
                  }}
                ></div>
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBrightBoxStoryForm(true)}
                className="flex items-center justify-center space-x-2 text-white transition duration-200"
                style={{
                  background: 'linear-gradient(90.05deg, #501392 6.68%, #3B0F73 49.26%, #2A0A5C 91.85%)',
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
                <FiPlus className="w-3 h-3" />
                <span>Add Story</span>
              </button>
              <button
                onClick={() => setShowBrightBoxForm(true)}
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
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bright Box Categories Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="mb-8">
            <h2 
              className="text-white text-2xl font-bold mb-6 relative"
              style={{ fontFamily: 'Archivo Black' }}
            >
              Bright Box Categories
              <div 
                className="absolute -bottom-1 left-0 h-0.5 w-24"
                style={{
                  background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)'
                }}
              ></div>
            </h2>
            
            {brightBoxes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-6">No categories found</div>
                <button
                  onClick={() => setShowBrightBoxForm(true)}
                  className="flex items-center space-x-2 mx-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Your First Category</span>
                </button>
              </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
                 {/* Category Cards - Limited Display */}
                 {brightBoxes.slice(0, 5).map((brightBox) => {
                   const storyCount = getStoriesByCategory(brightBox._id).length
                   
                   return (
                     <div 
                       key={brightBox._id}
                       onClick={() => setExpandedCategory(brightBox)}
                       className="relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-gray-600 hover:scale-105 hover:shadow-2xl"
                     >
                       {/* Category Image */}
                       <div className="relative h-32 overflow-hidden">
                         {brightBox.image ? (
                           <img
                             src={brightBox.image}
                             alt={brightBox.title}
                             className="w-full h-full object-cover transition duration-300"
                           />
                         ) : (
                           <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                             <FiFolder className="w-10 h-10 text-gray-500" />
                           </div>
                         )}
                       </div>

                       {/* Category Info */}
                       <div className="p-4">
                         <h3 className="text-white text-sm font-semibold truncate mb-2">
                           {brightBox.title}
                         </h3>
                         <div className="flex items-center space-x-1 text-purple-400">
                           <FiFile className="w-3 h-3" />
                           <span className="text-xs">{storyCount} stories</span>
                         </div>
                       </div>
                     </div>
                   )
                 })}

                 {/* Management Card - Always Last */}
                 <div 
                   onClick={() => setShowCategoryTable(!showCategoryTable)}
                   className={`relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border-2 ${
                     showCategoryTable 
                       ? 'border-purple-500 scale-105 shadow-2xl' 
                       : 'border-dashed border-gray-600 hover:border-purple-500 hover:scale-105 hover:shadow-2xl'
                   }`}
                 >
                   <div className="relative h-32 w-full flex items-center justify-center">
                     <div className="flex flex-col items-center justify-center transform translate-y-8">
                       <div className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                         showCategoryTable 
                           ? 'bg-purple-600/30 border-purple-400' 
                           : 'bg-purple-600/20 border-purple-500/30'
                       }`}>
                         <svg 
                           className={`w-6 h-6 text-purple-400 transition-transform duration-300 ${
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
                       <p className="text-white text-sm font-semibold text-center">View All</p>
                       <p className="text-gray-400 text-xs text-center">Categories</p>
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
                        setShowBrightBoxForm(true)
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
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">Stories</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">Created</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brightBoxes.map((brightBox) => {
                          const totalStories = getStoriesByCategory(brightBox._id).length
                          
                          return (
                            <tr key={brightBox._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition duration-200">
                              <td className="py-4 px-4">
                                {brightBox.image ? (
                                  <img
                                    src={brightBox.image}
                                    alt={brightBox.title}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                                    <FiFolder className="w-6 h-6 text-gray-500" />
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-white font-medium">{brightBox.title}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-gray-400">
                                  {totalStories}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-gray-400 text-sm">
                                  {new Date(brightBox.createdAt).toLocaleDateString('en-US', {
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
                                      setExpandedCategory(brightBox)
                                      setShowCategoryTable(false)
                                    }}
                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition duration-200"
                                    title="View Details"
                                  >
                                    <FiEye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      editBrightBox(brightBox)
                                      setShowCategoryTable(false)
                                    }}
                                    className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition duration-200"
                                    title="Edit Category"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      deleteBrightBox(brightBox._id)
                                      setShowCategoryTable(false)
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition duration-200"
                                    title="Delete Category"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {brightBoxes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-4">No categories found</div>
                    <button
                      onClick={() => {
                        setShowBrightBoxForm(true)
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

        {/* All Stories Section */}
        {brightBoxStories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 
                className="text-white text-2xl font-bold mb-2 relative"
                style={{ fontFamily: 'Archivo Black' }}
              >
                All Stories
                <div 
                  className="absolute -bottom-1 left-0 h-0.5 w-24"
                  style={{
                    background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)'
                  }}
                ></div>
              </h2>
            </div>

            {/* Stories Row - Limited Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {/* Display first 5 stories */}
              {brightBoxStories.slice(0, 5).map((story) => (
                <div 
                  key={story._id} 
                  onClick={() => setExpandedStory(story)}
                  className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
                >
                  {/* Story Image */}
                  <div className="relative h-32 bg-gradient-to-br from-green-600/20 to-blue-600/20 overflow-hidden">
                    {story.image ? (
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiFile className="w-10 h-10 text-green-400/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  {/* Story Content */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h4 className="text-white text-sm font-bold mb-1 truncate" style={{ fontFamily: 'Archivo Black' }}>
                        {story.title}
                      </h4>
                    </div>

                    {/* File Count */}
                    <div className="flex items-center space-x-1 text-xs text-purple-400">
                      <FiFile className="w-3 h-3" />
                      <span>
                        {[story.enFile, story.mlFile, story.urFile, story.hinFile].filter(Boolean).length} files
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Management Card - Always Last */}
              <div 
                onClick={() => setShowStoriesTable(!showStoriesTable)}
                className={`relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer border-2 ${
                  showStoriesTable 
                    ? 'border-purple-500 scale-105 shadow-2xl' 
                    : 'border-dashed border-gray-600 hover:border-purple-500 hover:scale-105 hover:shadow-2xl'
                }`}
              >
                <div className="relative h-32 w-full flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center transform translate-y-8">
                    <div className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      showStoriesTable 
                        ? 'bg-purple-600/30 border-purple-400' 
                        : 'bg-purple-600/20 border-purple-500/30'
                    }`}>
                      <svg 
                        className={`w-6 h-6 text-purple-400 transition-transform duration-300 ${
                          showStoriesTable ? 'rotate-90' : 'rotate-0'
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
                    <p className="text-white text-sm font-semibold text-center">View All</p>
                    <p className="text-gray-400 text-xs text-center">Stories</p>
                  </div>
                </div>
              </div>
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
      </div>

      {/* Expanded Category Details Modal */}
      {expandedCategory && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth">
            <div className="p-6">
              {/* Header with Close Button */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                    {expandedCategory.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FiFile className="w-4 h-4 text-green-400" />
                      <span>{getStoriesByCategory(expandedCategory._id).length} stories</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedCategory(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Stories in this category */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white text-lg font-semibold" style={{ fontFamily: 'Archivo Black' }}>
                    Stories
                  </h3>
                  <button
                    onClick={() => {
                      setBrightBoxStoryForm(prev => ({ ...prev, category: expandedCategory._id }))
                      setShowBrightBoxStoryForm(true)
                      setExpandedCategory(null)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-200 text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Story</span>
                  </button>
                </div>
                {getStoriesByCategory(expandedCategory._id).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-4">No stories in this category yet</p>
                    <button
                      onClick={() => {
                        setBrightBoxStoryForm(prev => ({ ...prev, category: expandedCategory._id }))
                        setShowBrightBoxStoryForm(true)
                        setExpandedCategory(null)
                      }}
                      className="flex items-center space-x-2 mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-200 text-sm"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add First Story</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getStoriesByCategory(expandedCategory._id).map((story) => (
                      <div key={story._id} className="flex items-center justify-between bg-gray-800/50 rounded-lg border border-gray-700/50 p-3 hover:bg-gray-800/70 transition duration-200">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {story.image ? (
                            <img src={story.image} alt={story.title} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                              <FiFile className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <span className="text-white font-medium truncate">{story.title}</span>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => { setExpandedStory(story); setExpandedCategory(null) }}
                            className="p-1 text-gray-400 hover:text-green-400 rounded"
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { editBrightBoxStory(story); setExpandedCategory(null) }}
                            className="p-1 text-gray-400 hover:text-purple-400 rounded"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBrightBoxStory(story._id)}
                            className="p-1 text-gray-400 hover:text-red-400 rounded"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer with Date and Action Icons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                {/* Create Date */}
                <div className="flex items-center space-x-1 text-sm text-gray-400">
                  <span>
                    {new Date(expandedCategory.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {/* Action Icons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      editBrightBox(expandedCategory)
                      setExpandedCategory(null)
                    }}
                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition duration-200"
                    title="Edit Category"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      deleteBrightBox(expandedCategory._id)
                      setExpandedCategory(null)
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition duration-200"
                    title="Delete Category"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Story Details Modal */}
      {expandedStory && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth">
            <div className="p-6">
              {/* Header with Close Button */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                    {expandedStory.title}
                  </h1>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <span className="text-purple-400">{expandedStory.category?.title}</span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedStory(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Story Image - Full View */}
              {expandedStory.image && (
                <div className="mb-4">
                  <div className="relative h-80 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg overflow-hidden">
                    <img
                      src={expandedStory.image}
                      alt={expandedStory.title}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>
              )}

              {/* Story Details - Compact */}
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {expandedStory.mlTitle && (
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-purple-400 text-sm font-medium mb-1">Malayalam Title</h4>
                      <p className="text-white text-sm">{expandedStory.mlTitle}</p>
                    </div>
                  )}
                  {expandedStory.urTitle && (
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-purple-400 text-sm font-medium mb-1">Urdu Title</h4>
                      <p className="text-white text-sm">{expandedStory.urTitle}</p>
                    </div>
                  )}
                  {expandedStory.hinTitle && (
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-purple-400 text-sm font-medium mb-1">Hindi Title</h4>
                      <p className="text-white text-sm">{expandedStory.hinTitle}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Information - Compact */}
              <div className="mb-4">
                <h3 className="text-white text-lg font-semibold mb-3" style={{ fontFamily: 'Archivo Black' }}>
                  Available Files
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {expandedStory.enFile && (
                    <div
                      className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-800/70 transition"
                      onClick={() => openFileInNewTab(expandedStory.enFile)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openFileInNewTab(expandedStory.enFile)}
                    >
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FiFile className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="text-blue-400 text-sm font-medium">English</h4>
                    </div>
                  )}
                  {expandedStory.mlFile && (
                    <div
                      className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-800/70 transition"
                      onClick={() => openFileInNewTab(expandedStory.mlFile)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openFileInNewTab(expandedStory.mlFile)}
                    >
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FiFile className="w-5 h-5 text-green-400" />
                      </div>
                      <h4 className="text-green-400 text-sm font-medium">Malayalam</h4>
                    </div>
                  )}
                  {expandedStory.urFile && (
                    <div
                      className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-800/70 transition"
                      onClick={() => openFileInNewTab(expandedStory.urFile)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openFileInNewTab(expandedStory.urFile)}
                    >
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FiFile className="w-5 h-5 text-purple-400" />
                      </div>
                      <h4 className="text-purple-400 text-sm font-medium">Urdu</h4>
                    </div>
                  )}
                  {expandedStory.hinFile && (
                    <div
                      className="bg-gray-800/50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-800/70 transition"
                      onClick={() => openFileInNewTab(expandedStory.hinFile)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openFileInNewTab(expandedStory.hinFile)}
                    >
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FiFile className="w-5 h-5 text-orange-400" />
                      </div>
                      <h4 className="text-orange-400 text-sm font-medium">Hindi</h4>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer with Date and Action Icons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                {/* Create Date */}
                <div className="flex items-center space-x-1 text-sm text-gray-400">
                  <span>
                    {new Date(expandedStory.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {/* Action Icons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      editBrightBoxStory(expandedStory)
                      setExpandedStory(null)
                    }}
                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition duration-200"
                    title="Edit Story"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      deleteBrightBoxStory(expandedStory._id)
                      setExpandedStory(null)
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition duration-200"
                    title="Delete Story"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Stories Management Container */}
      {showStoriesTable && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth animate-in slide-in-from-top-4 duration-500 ease-out">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-2xl font-bold" style={{ fontFamily: 'Archivo Black' }}>
                  Stories Management
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowBrightBoxStoryForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-200 text-sm font-medium"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Story</span>
                  </button>
                  <button
                    onClick={() => setShowStoriesTable(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stories Table */}
              {brightBoxStories.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Image</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Files</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brightBoxStories.map((story) => (
                        <tr key={story._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition duration-200">
                          <td className="py-3 px-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg overflow-hidden">
                              {story.image ? (
                                <img
                                  src={story.image}
                                  alt={story.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FiFile className="w-6 h-6 text-green-400/50" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <h4 className="text-white font-medium text-sm">{story.title}</h4>
                              {story.mlTitle && (
                                <p className="text-gray-400 text-xs">{story.mlTitle}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-purple-400 text-sm">
                              {story.category?.title || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <FiFile className="w-4 h-4 text-green-400" />
                              <span className="text-gray-400 text-sm">
                                {[story.enFile, story.mlFile, story.urFile, story.hinFile].filter(Boolean).length}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-400 text-sm">
                              {new Date(story.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setExpandedStory(story)
                                  setShowStoriesTable(false)
                                }}
                                className="p-1 text-gray-400 hover:text-green-400 rounded transition duration-200"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  editBrightBoxStory(story)
                                  setShowStoriesTable(false)
                                }}
                                className="p-1 text-gray-400 hover:text-purple-400 rounded transition duration-200"
                                title="Edit Story"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteBrightBoxStory(story._id)}
                                className="p-1 text-gray-400 hover:text-red-400 rounded transition duration-200"
                                title="Delete Story"
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
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFile className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-white text-lg font-medium mb-2">No Stories Found</h3>
                  <p className="text-gray-400 text-sm mb-6">Get started by creating your first story</p>
                  <button
                    onClick={() => setShowBrightBoxStoryForm(true)}
                    className="flex items-center space-x-2 mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-200 text-sm font-medium"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add First Story</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bright Box Form Modal */}
      {showBrightBoxForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth scroll-indicator">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
                {editingBrightBox ? 'Edit Bright Box' : 'Add New Bright Box'}
              </h2>
              <button
                onClick={resetBrightBoxForm}
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingBrightBox ? updateBrightBox : createBrightBox} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>Title *</label>
                <input
                  type="text"
                  value={brightBoxForm.title}
                  onChange={(e) => setBrightBoxForm({ ...brightBoxForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter title"
                />
              </div>

              {/* ML Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>ML Title</label>
                <input
                  type="text"
                  value={brightBoxForm.mlTitle}
                  onChange={(e) => setBrightBoxForm({ ...brightBoxForm, mlTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter Malayalam title"
                />
              </div>

              {/* UR Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>UR Title</label>
                <input
                  type="text"
                  value={brightBoxForm.urTitle}
                  onChange={(e) => setBrightBoxForm({ ...brightBoxForm, urTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter Urdu title"
                />
              </div>

              {/* HIN Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>HIN Title</label>
                <input
                  type="text"
                  value={brightBoxForm.hinTitle}
                  onChange={(e) => setBrightBoxForm({ ...brightBoxForm, hinTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter Hindi title"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>Image</label>
                <div className="relative w-full h-10 bg-gray-800/50 border border-gray-600 rounded-xl overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFileInputs({ ...fileInputs, image: e.target })
                      setSelectedFileNames({ ...selectedFileNames, image: e.target.files[0]?.name || '' })
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center h-full px-3">
                    <div className="mr-3 py-1.5 px-3 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition duration-200">
                      Choose Image
                    </div>
                    <span className="text-gray-400 text-xs">
                      {selectedFileNames.image || 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetBrightBoxForm}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition duration-200 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl transition duration-200 font-semibold flex items-center justify-center space-x-2 text-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      <span>{editingBrightBox ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bright Box Story Form Modal */}
      {showBrightBoxStoryForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth scroll-indicator">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
                {editingBrightBoxStory ? 'Edit Bright Box Story' : 'Add New Bright Box Story'}
              </h2>
              <button
                onClick={resetBrightBoxStoryForm}
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingBrightBoxStory ? updateBrightBoxStory : createBrightBoxStory} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>Category *</label>
                <CustomDropdown
                  options={brightBoxes.map((cat) => ({
                    value: cat._id,
                    label: cat.title
                  }))}
                  value={brightBoxStoryForm.category}
                  onChange={(value) => setBrightBoxStoryForm({ ...brightBoxStoryForm, category: value })}
                  placeholder="Select category..."
                  className="w-full"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>Title *</label>
                <input
                  type="text"
                  value={brightBoxStoryForm.title}
                  onChange={(e) => setBrightBoxStoryForm({ ...brightBoxStoryForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter title"
                />
              </div>

              {/* ML Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>ML Title</label>
                <input
                  type="text"
                  value={brightBoxStoryForm.mlTitle}
                  onChange={(e) => setBrightBoxStoryForm({ ...brightBoxStoryForm, mlTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter Malayalam title"
                />
              </div>

              {/* UR Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>UR Title</label>
                <input
                  type="text"
                  value={brightBoxStoryForm.urTitle}
                  onChange={(e) => setBrightBoxStoryForm({ ...brightBoxStoryForm, urTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter Urdu title"
                />
              </div>

              {/* HIN Title */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>HIN Title</label>
                <input
                  type="text"
                  value={brightBoxStoryForm.hinTitle}
                  onChange={(e) => setBrightBoxStoryForm({ ...brightBoxStoryForm, hinTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter Hindi title"
                />
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>Image</label>
                  <div className="relative w-full h-10 bg-gray-800/50 border border-gray-600 rounded-xl overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setFileInputs({ ...fileInputs, storyImage: e.target })
                        setSelectedFileNames({ ...selectedFileNames, storyImage: e.target.files[0]?.name || '' })
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center h-full px-3">
                      <div className="mr-3 py-1.5 px-3 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition duration-200">
                        Choose Image
                      </div>
                      <span className="text-gray-400 text-xs">
                        {selectedFileNames.storyImage || 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* EN File */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>EN File *</label>
                  <div className="relative w-full h-10 bg-gray-800/50 border border-gray-600 rounded-xl overflow-hidden">
                    <input
                      type="file"
                      onChange={(e) => {
                        setFileInputs({ ...fileInputs, enFile: e.target })
                        setSelectedFileNames({ ...selectedFileNames, enFile: e.target.files[0]?.name || '' })
                      }}
                      required={!editingBrightBoxStory}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center h-full px-3">
                      <div className="mr-3 py-1.5 px-3 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition duration-200">
                        Choose EN File
                      </div>
                      <span className="text-gray-400 text-xs">
                        {selectedFileNames.enFile || 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ML File */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>ML File</label>
                  <div className="relative w-full h-10 bg-gray-800/50 border border-gray-600 rounded-xl overflow-hidden">
                    <input
                      type="file"
                      onChange={(e) => {
                        setFileInputs({ ...fileInputs, mlFile: e.target })
                        setSelectedFileNames({ ...selectedFileNames, mlFile: e.target.files[0]?.name || '' })
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center h-full px-3">
                      <div className="mr-3 py-1.5 px-3 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition duration-200">
                        Choose ML File
                      </div>
                      <span className="text-gray-400 text-xs">
                        {selectedFileNames.mlFile || 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UR File */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>UR File</label>
                  <div className="relative w-full h-10 bg-gray-800/50 border border-gray-600 rounded-xl overflow-hidden">
                    <input
                      type="file"
                      onChange={(e) => {
                        setFileInputs({ ...fileInputs, urFile: e.target })
                        setSelectedFileNames({ ...selectedFileNames, urFile: e.target.files[0]?.name || '' })
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center h-full px-3">
                      <div className="mr-3 py-1.5 px-3 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition duration-200">
                        Choose UR File
                      </div>
                      <span className="text-gray-400 text-xs">
                        {selectedFileNames.urFile || 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* HIN File */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>HIN File</label>
                  <div className="relative w-full h-10 bg-gray-800/50 border border-gray-600 rounded-xl overflow-hidden">
                    <input
                      type="file"
                      onChange={(e) => {
                        setFileInputs({ ...fileInputs, hinFile: e.target })
                        setSelectedFileNames({ ...selectedFileNames, hinFile: e.target.files[0]?.name || '' })
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center h-full px-3">
                      <div className="mr-3 py-1.5 px-3 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition duration-200">
                        Choose HIN File
                      </div>
                      <span className="text-gray-400 text-xs">
                        {selectedFileNames.hinFile || 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetBrightBoxStoryForm}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition duration-200 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl transition duration-200 font-semibold flex items-center justify-center space-x-2 text-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" />
                      <span>{editingBrightBoxStory ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Details Modal */}
      {showStoryDetails && selectedBrightBoxStory && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth scroll-indicator">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
                Story Details
              </h2>
              <button
                onClick={() => setShowStoryDetails(false)}
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedBrightBoxStory.title}</h3>
                  {selectedBrightBoxStory.mlTitle && <p className="text-gray-400">{selectedBrightBoxStory.mlTitle}</p>}
                </div>
                <div className="text-sm text-gray-400">
                  <div>Category: {selectedBrightBoxStory.category?.title}</div>
                </div>
              </div>

              {/* Image */}
              {selectedBrightBoxStory.image && (
                <div>
                  <img
                    src={selectedBrightBoxStory.image}
                    alt={selectedBrightBoxStory.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* File Links */}
              <div>
                <h4 className="text-white font-semibold mb-3">Story Files</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedBrightBoxStory.enFile && (
                    <a
                      href={normalizeUrl(selectedBrightBoxStory.enFile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition duration-200 border border-gray-600/50 hover:border-gray-500/50"
                    >
                      <FiFile className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">English</span>
                    </a>
                  )}
                  {selectedBrightBoxStory.mlFile && (
                    <a
                      href={normalizeUrl(selectedBrightBoxStory.mlFile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition duration-200 border border-gray-600/50 hover:border-gray-500/50"
                    >
                      <FiFile className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Malayalam</span>
                    </a>
                  )}
                  {selectedBrightBoxStory.urFile && (
                    <a
                      href={normalizeUrl(selectedBrightBoxStory.urFile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition duration-200 border border-gray-600/50 hover:border-gray-500/50"
                    >
                      <FiFile className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Urdu</span>
                    </a>
                  )}
                  {selectedBrightBoxStory.hinFile && (
                    <a
                      href={normalizeUrl(selectedBrightBoxStory.hinFile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition duration-200 border border-gray-600/50 hover:border-gray-500/50"
                    >
                      <FiFile className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Hindi</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-gray-400 text-sm">
                <div>Created: {new Date(selectedBrightBoxStory.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(selectedBrightBoxStory.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        message={modal.message}
        onConfirm={modal.onConfirm}
      />
    </div>
  )
}

export default BrightBox
