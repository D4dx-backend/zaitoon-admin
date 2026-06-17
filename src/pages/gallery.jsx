import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import SuccessModal from '../components/SuccessModal'
import { 
  FiPlus, 
  FiX,
  FiEdit3,
  FiTrash2,
  FiImage,
  FiEye,
  FiEyeOff,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiUpload,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'
import { HiCalendar } from 'react-icons/hi'

const CATEGORIES = ['general', 'events', 'activities', 'achievements', 'nature', 'art', 'community']

function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '', onConfirm: null })
  const [showForm, setShowForm] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [multiFiles, setMultiFiles] = useState([]) // [{ file, preview, status: 'pending'|'uploading'|'done'|'error' }]
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [formCategoryOpen, setFormCategoryOpen] = useState(false)
  const dropdownRef = React.useRef(null)
  const formCategoryRef = React.useRef(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const ITEMS_PER_PAGE = 12

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    titleMl: '',
    description: '',
    category: 'general',
    sortOrder: 1,
    imageUrl: '',
    isActive: true,
    imageFile: null,
  })

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const showModal = (type, message, onConfirm = null) => {
    setModal({ isOpen: true, type, message, onConfirm })
  }
  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', message: '', onConfirm: null })
  }

  // ─── Fetch ──────────────────────────────────────────────
  const fetchImages = async (page = currentPage) => {
    setLoading(true)
    try {
      let url = `${API_BASE}/gallery?active=all&page=${page}&limit=${ITEMS_PER_PAGE}`
      if (filterCategory) url += `&category=${filterCategory}`
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setImages(data.data.images || [])
        setTotal(data.data.total || 0)
        setTotalPages(data.data.totalPages || 1)
        setCurrentPage(data.data.page || 1)
      } else {
        showModal('error', 'Failed to fetch gallery images')
      }
    } catch (error) {
      showModal('error', 'Error fetching gallery images')
    } finally {
      setLoading(false)
    }
  }

  // ─── Reset ─────────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      title: '',
      titleMl: '',
      description: '',
      category: 'general',
      sortOrder: 1,
      imageUrl: '',
      isActive: true,
      imageFile: null,
    })
    setEditingImage(null)
    setImagePreview(null)
    setMultiFiles([])
    setUploadProgress({ done: 0, total: 0 })
    setShowForm(false)
  }

  // ─── Upload single file helper ─────────────────────────
  const uploadSingle = async (file, meta) => {
    const fd = new FormData()
    fd.append('title', meta.title)
    fd.append('titleMl', meta.titleMl)
    fd.append('description', meta.description)
    fd.append('category', meta.category)
    fd.append('sortOrder', meta.sortOrder)
    fd.append('image', file)
    const response = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      body: fd
    })
    return response.json()
  }

  // ─── Create (single) ───────────────────────────────────
  const createImage = async (e) => {
    e.preventDefault()
    // Multi-file mode
    if (multiFiles.length > 0) {
      setLoading(true)
      const total = multiFiles.length
      setUploadProgress({ done: 0, total })
      let done = 0
      const updated = [...multiFiles]
      for (let i = 0; i < updated.length; i++) {
        updated[i] = { ...updated[i], status: 'uploading' }
        setMultiFiles([...updated])
        try {
          const res = await uploadSingle(updated[i].file, formData)
          updated[i] = { ...updated[i], status: res.success ? 'done' : 'error' }
        } catch (_) {
          updated[i] = { ...updated[i], status: 'error' }
        }
        done++
        setUploadProgress({ done, total })
        setMultiFiles([...updated])
      }
      setLoading(false)
      const failed = updated.filter(f => f.status === 'error').length
      if (failed === 0) {
        showModal('success', `${total} image${total > 1 ? 's' : ''} uploaded successfully!`)
        resetForm()
        fetchImages(1)
      } else {
        showModal('error', `${done - failed} uploaded, ${failed} failed. Remove failed items and retry.`)
      }
      return
    }
    // Single URL mode
    if (!formData.imageFile && !formData.imageUrl) {
      showModal('error', 'Please upload an image or provide a URL.')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('titleMl', formData.titleMl)
      fd.append('description', formData.description)
      fd.append('category', formData.category)
      fd.append('sortOrder', formData.sortOrder)
      if (formData.imageFile) {
        fd.append('image', formData.imageFile)
      } else if (formData.imageUrl) {
        fd.append('imageUrl', formData.imageUrl)
      }
      const response = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: fd
      })
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Gallery image created successfully!')
        resetForm()
        fetchImages(1)
      } else {
        showModal('error', data.message || 'Failed to create gallery image')
      }
    } catch (error) {
      showModal('error', 'Error creating gallery image')
    } finally {
      setLoading(false)
    }
  }

  // ─── Update ────────────────────────────────────────────
  const updateImage = async (e) => {
    e.preventDefault()
    if (!editingImage) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('titleMl', formData.titleMl)
      fd.append('description', formData.description)
      fd.append('category', formData.category)
      fd.append('sortOrder', formData.sortOrder)
      fd.append('isActive', formData.isActive)

      if (formData.imageFile) {
        fd.append('image', formData.imageFile)
      } else if (formData.imageUrl) {
        fd.append('imageUrl', formData.imageUrl)
      }

      const response = await fetch(`${API_BASE}/gallery/${editingImage._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: fd
      })
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Gallery image updated successfully!')
        resetForm()
        fetchImages()
      } else {
        showModal('error', data.message || 'Failed to update gallery image')
      }
    } catch (error) {
      showModal('error', 'Error updating gallery image')
    } finally {
      setLoading(false)
    }
  }

  // ─── Delete ────────────────────────────────────────────
  const deleteImage = async (id) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        showModal('success', 'Gallery image deleted successfully!')
        fetchImages()
      } else {
        showModal('error', data.message || 'Failed to delete')
      }
    } catch (error) {
      showModal('error', 'Error deleting gallery image')
    } finally {
      setLoading(false)
    }
  }

  // ─── Toggle Active ────────────────────────────────────
  const toggleActive = async (img) => {
    try {
      const fd = new FormData()
      fd.append('isActive', !img.isActive)
      const response = await fetch(`${API_BASE}/gallery/${img._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: fd
      })
      const data = await response.json()
      if (data.success) fetchImages()
    } catch (_) {}
  }

  // ─── Edit handler ──────────────────────────────────────
  const editImage = (img) => {
    setEditingImage(img)
    setFormData({
      title: img.title || '',
      titleMl: img.titleMl || '',
      description: img.description || '',
      category: img.category || 'general',
      sortOrder: img.sortOrder || 0,
      imageUrl: img.imageUrl || '',
      isActive: img.isActive !== false,
      imageFile: null,
    })
    setImagePreview(img.imageUrl || null)
    setShowForm(true)
  }

  const handleFileChange = (e) => {
    let files = Array.from(e.target.files)
    if (!files.length) return
    if (files.length > 20) {
      files = files.slice(0, 20)
      showModal('error', 'Maximum 20 images can be selected at once. Only the first 20 have been added.')
    }
    if (files.length === 1) {
      // Single file → single mode
      setMultiFiles([])
      setFormData({ ...formData, imageFile: files[0] })
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(files[0])
    } else {
      // Multiple files → multi mode
      setFormData({ ...formData, imageFile: null })
      setImagePreview(null)
      const items = files.map(file => ({ file, preview: null, status: 'pending' }))
      setMultiFiles(items)
      // Generate previews
      items.forEach((item, idx) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setMultiFiles(prev => {
            const next = [...prev]
            if (next[idx]) next[idx] = { ...next[idx], preview: ev.target.result }
            return next
          })
        }
        reader.readAsDataURL(item.file)
      })
    }
    e.target.value = ''
  }

  const removeMultiFile = (idx) => {
    setMultiFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // ─── Pagination ────────────────────────────────────────
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    fetchImages(page)
  }

  useEffect(() => { fetchImages(1) }, [filterCategory])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (formCategoryRef.current && !formCategoryRef.current.contains(e.target)) {
        setFormCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
                Gallery
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-48"
                  style={{
                    background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)'
                  }}
                ></div>
              </h1>
              <p className="text-gray-400 text-sm mt-3">Manage gallery images displayed on the website</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Custom Category Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/80 border border-gray-600/50 rounded-xl text-white text-sm hover:border-purple-500/50 hover:bg-gray-800 transition-all duration-200 min-w-[160px] justify-between"
                >
                  <span className={filterCategory ? 'text-white' : 'text-gray-400'}>
                    {filterCategory ? filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1) : 'All Categories'}
                  </span>
                  <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full min-w-[180px] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="py-1">
                      <button
                        onClick={() => { setFilterCategory(''); setDropdownOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 ${
                          !filterCategory
                            ? 'bg-purple-600/20 text-purple-300 border-l-2 border-purple-500'
                            : 'text-gray-300 hover:bg-gray-800/80 hover:text-white border-l-2 border-transparent'
                        }`}
                      >
                        All Categories
                      </button>
                      {CATEGORIES.map(c => (
                        <button
                          key={c}
                          onClick={() => { setFilterCategory(c); setDropdownOpen(false) }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 ${
                            filterCategory === c
                              ? 'bg-purple-600/20 text-purple-300 border-l-2 border-purple-500'
                              : 'text-gray-300 hover:bg-gray-800/80 hover:text-white border-l-2 border-transparent'
                          }`}
                        >
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="flex items-center justify-center space-x-2 text-white transition duration-200"
                style={{
                  background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)',
                  width: '180px',
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
                <span>Add Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex space-x-4">
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-2">
              <span className="text-gray-400 text-xs">Total</span>
              <p className="text-white text-lg font-bold">{total}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-2">
              <span className="text-gray-400 text-xs">Active</span>
              <p className="text-green-400 text-lg font-bold">{images.filter(i => i.isActive).length}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-2">
              <span className="text-gray-400 text-xs">Hidden</span>
              <p className="text-red-400 text-lg font-bold">{images.filter(i => !i.isActive).length}</p>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {loading && images.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-white text-lg">Loading gallery images...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <FiImage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-6">No gallery images found</div>
              <button
                onClick={() => { resetForm(); setShowForm(true) }}
                className="flex items-center space-x-2 mx-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Your First Image</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img) => (
                <div
                  key={img._id}
                  className={`relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 border-2 ${img.isActive ? 'border-transparent' : 'border-red-500/30'} hover:border-gray-600 hover:scale-105 hover:shadow-2xl group`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
                    {img.imageUrl ? (
                      <img
                        src={img.imageUrl}
                        alt={img.title || 'Gallery image'}
                        className="w-full h-full object-cover transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <FiImage className="w-12 h-12 text-gray-500" />
                      </div>
                    )}

                    {!img.isActive && (
                      <div className="absolute top-2 left-2 bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                        Hidden
                      </div>
                    )}

                    <div className="absolute top-2 right-2 bg-purple-500/80 text-white text-xs px-2 py-0.5 rounded-full capitalize">
                      {img.category}
                    </div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                      <button
                        onClick={() => editImage(img)}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition duration-200"
                        title="Edit"
                      >
                        <FiEdit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleActive(img)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition duration-200"
                        title={img.isActive ? 'Hide' : 'Show'}
                      >
                        {img.isActive ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => showModal('confirmation', 'Are you sure you want to delete this image?', () => deleteImage(img._id))}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition duration-200"
                        title="Delete"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-white text-sm font-semibold truncate mb-1">
                      {img.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400 capitalize">{img.category}</span>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <HiCalendar className="w-3 h-3" />
                        <span>
                          {new Date(img.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    {img.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{img.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-8">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 7) return true
                  if (page === 1 || page === totalPages) return true
                  if (Math.abs(page - currentPage) <= 1) return true
                  return false
                })
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    acc.push('...')
                  }
                  acc.push(page)
                  return acc
                }, [])
                .map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* ─── Form Modal ─────────────────────────────────── */}
        {showForm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[10000] p-4 overflow-y-auto">
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl border border-gray-600/50 scrollbar-hide scroll-smooth my-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
                  {editingImage ? 'Edit Gallery Image' : 'Add New Gallery Image'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editingImage ? updateImage : createImage} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Annual Day 2026"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  />
                </div>

                {/* Title ML */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                    Title (Malayalam)
                  </label>
                  <input
                    type="text"
                    value={formData.titleMl}
                    onChange={(e) => setFormData({ ...formData, titleMl: e.target.value })}
                    placeholder="മലയാളം ടൈറ്റിൽ"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this image..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 placeholder-gray-400 resize-none"
                  />
                </div>

                {/* Category & Sort Order row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                      Category
                    </label>
                    <div className="relative" ref={formCategoryRef}>
                      <button
                        type="button"
                        onClick={() => setFormCategoryOpen(!formCategoryOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white text-sm hover:border-purple-500/50 transition-all duration-200"
                      >
                        <span>{formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}</span>
                        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${formCategoryOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {formCategoryOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                          <div className="py-1 max-h-[200px] overflow-y-auto scrollbar-hide">
                            {CATEGORIES.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => { setFormData({ ...formData, category: c }); setFormCategoryOpen(false) }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 ${
                                  formData.category === c
                                    ? 'bg-purple-600/20 text-purple-300 border-l-2 border-purple-500'
                                    : 'text-gray-300 hover:bg-gray-800/80 hover:text-white border-l-2 border-transparent'
                                }`}
                              >
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormData({ ...formData, sortOrder: val === '' ? val : parseInt(val) || 0 })
                      }}
                      min="1"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2" style={{ fontFamily: 'Archivo Black' }}>
                    Image *
                    {!editingImage && <span className="ml-2 text-xs text-gray-400 font-normal">(select multiple for bulk upload)</span>}
                  </label>
                  <div className="space-y-3">
                    {/* Drop zone / file picker */}
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer bg-gray-800/30 hover:border-purple-500/60 hover:bg-purple-500/5 transition-all duration-200 group">
                      <FiUpload className="w-6 h-6 text-gray-500 group-hover:text-purple-400 transition mb-1" />
                      <span className="text-gray-400 text-sm group-hover:text-gray-300 transition">
                        {multiFiles.length > 0
                          ? `${multiFiles.length} file${multiFiles.length > 1 ? 's' : ''} selected — click to change`
                          : 'Click to choose file(s)'}
                      </span>
                      <span className="text-gray-600 text-xs mt-0.5">Hold Ctrl / Cmd to select multiple (max 20)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple={!editingImage}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* Multi-file preview grid */}
                    {multiFiles.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {multiFiles.map((item, idx) => (
                          <div key={idx} className="relative group/item rounded-xl overflow-hidden border border-gray-700 aspect-square bg-gray-800">
                            {item.preview
                              ? <img src={item.preview} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><FiImage className="w-6 h-6 text-gray-500" /></div>
                            }
                            {/* Status badge */}
                            {item.status === 'done' && (
                              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                <FiCheckCircle className="w-7 h-7 text-green-400" />
                              </div>
                            )}
                            {item.status === 'error' && (
                              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                <FiAlertCircle className="w-7 h-7 text-red-400" />
                              </div>
                            )}
                            {item.status === 'uploading' && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              </div>
                            )}
                            {/* Remove button (only pending) */}
                            {item.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => removeMultiFile(idx)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                              {item.file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload progress bar */}
                    {uploadProgress.total > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress.done} / {uploadProgress.total}</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(uploadProgress.done / uploadProgress.total) * 100}%`,
                              background: 'linear-gradient(90deg, #AC28DC, #7E1EB7)'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Single file preview */}
                    {multiFiles.length === 0 && imagePreview && (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-gray-600" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(null); setFormData({ ...formData, imageFile: null }) }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* URL input — only for single/edit mode */}
                    {multiFiles.length === 0 && !formData.imageFile && (
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="Or paste image URL..."
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                      />
                    )}
                  </div>
                </div>

                {/* Active toggle (edit only) */}
                {editingImage && (
                  <div className="flex items-center space-x-3">
                    <label className="text-white text-sm font-semibold" style={{ fontFamily: 'Archivo Black' }}>
                      Active
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${formData.isActive ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${formData.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl text-white font-bold transition duration-200 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(90.05deg, #AC28DC 6.68%, #7E1EB7 49.26%, #501392 91.85%)',
                    fontFamily: 'Fredoka One'
                  }}
                >
                  {loading
                    ? (multiFiles.length > 1 ? `Uploading ${uploadProgress.done}/${uploadProgress.total}...` : 'Saving...')
                    : editingImage
                      ? 'Update Image'
                      : multiFiles.length > 1
                        ? `Upload ${multiFiles.length} Images`
                        : 'Add Image'
                  }
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Success/Error Modal */}
        <SuccessModal
          isOpen={modal.isOpen}
          type={modal.type}
          message={modal.message}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
        />
      </div>
    </div>
  )
}

export default Gallery
