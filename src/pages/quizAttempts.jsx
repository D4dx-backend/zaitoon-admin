import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import axios from 'axios'
import { 
  FiAward,
  FiRefreshCw,
  FiEye,
  FiArrowUp,
  FiArrowDown,
  FiClock
} from 'react-icons/fi'

function QuizAttempts() {
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(`${API_BASE}/quizzes/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key) => {
    let direction = 'desc'
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }
    setSortConfig({ key, direction })
  }

  const sortedAttendees = stats?.attendees ? [...stats.attendees].sort((a, b) => {
    if (sortConfig.key === 'score') {
      return sortConfig.direction === 'desc' ? b.score - a.score : a.score - b.score
    } else if (sortConfig.key === 'totalDuration') {
      return sortConfig.direction === 'desc' ? b.totalDuration - a.totalDuration : a.totalDuration - b.totalDuration
    } else if (sortConfig.key === 'percentage') {
      return sortConfig.direction === 'desc' ? b.percentage - a.percentage : a.percentage - b.percentage
    }
    return 0
  }) : []

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

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'desc' ? <FiArrowDown /> : <FiArrowUp />
  }

  const handleViewDetails = (attemptId) => {
    navigate(`/quiz-attempts/${attemptId}`)
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
                Quiz Attempts Leaderboard
              </h1>
              <p className="text-gray-400">View and manage quiz attempts</p>
            </div>
            <button
              onClick={fetchStats}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiRefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Quiz Config Info */}
          {stats?.quizConfig && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Attendees</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsersAttended}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Start Date</p>
                  <p className="text-white">{formatDate(stats.quizConfig.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">End Date</p>
                  <p className="text-white">{formatDate(stats.quizConfig.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stats.quizConfig.isLive 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {stats.quizConfig.isLive ? 'Live' : 'Not Live'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading leaderboard...</p>
            </div>
          ) : !stats || sortedAttendees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No quiz attempts found.</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Class
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('score')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Score</span>
                          {getSortIcon('score')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('percentage')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Percentage</span>
                          {getSortIcon('percentage')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('totalDuration')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Duration</span>
                          {getSortIcon('totalDuration')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {sortedAttendees.map((attendee) => (
                      <tr
                        key={attendee.attemptId}
                        className={`hover:bg-gray-700/50 transition-colors ${
                          attendee.rank <= 3 ? 'bg-purple-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-white">
                              {attendee.rank <= 3 ? ['🥇', '🥈', '🥉'][attendee.rank - 1] : `#${attendee.rank}`}
                            </span>
                            {attendee.rank <= 3 && (
                              <FiAward className={`w-5 h-5 ${
                                attendee.rank === 1 ? 'text-yellow-400' :
                                attendee.rank === 2 ? 'text-gray-300' :
                                'text-orange-400'
                              }`} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {attendee.userName || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {attendee.userEmail || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {attendee.userClass || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-purple-400">
                            {attendee.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {attendee.percentage.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center space-x-1">
                            <FiClock className="w-4 h-4" />
                            <span>{formatTime(attendee.totalDuration)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(attendee.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(attendee.attemptId)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            <FiEye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizAttempts
