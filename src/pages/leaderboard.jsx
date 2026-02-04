import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import axios from 'axios'
import { 
  FiAward,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi'

function Leaderboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const [leaderboard, setLeaderboard] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchTodayLeaderboard()
  }, [])

  const fetchTodayLeaderboard = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(`${API_BASE}/quizzes/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        const data = response.data.data
        setLeaderboard(data.attendees || [])
        setQuiz({
          title: 'Daily Quiz',
          mlTitle: 'ദൈനംദിന ക്വിസ്',
          quizDate: data.quizConfig?.startDate
        })
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboardByDate = async (date) => {
    if (!date) return
    
    setLoading(true)
    try {
      // Use stats endpoint which filters by config date range
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(`${API_BASE}/quizzes/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        const data = response.data.data
        // Filter by selected date if needed (stats already filters by config date range)
        setLeaderboard(data.attendees || [])
        setQuiz({
          title: 'Daily Quiz',
          mlTitle: 'ദൈനംദിന ക്വിസ്',
          quizDate: data.quizConfig?.startDate
        })
      } else {
        setLeaderboard([])
        setQuiz(null)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLeaderboard([])
      setQuiz(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    setSelectedDate(date)
    if (date) {
      fetchLeaderboardByDate(date)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Archivo Black' }}>
              Leaderboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={fetchTodayLeaderboard}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiRefreshCw className="w-5 h-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Quiz Info */}
          {quiz && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-2">{quiz.title}</h2>
              <p className="text-gray-400 mb-2">{quiz.mlTitle}</p>
              <p className="text-sm text-gray-500">
                Date: {formatDate(quiz.quizDate)}
              </p>
            </div>
          )}

          {/* Leaderboard */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading leaderboard...</p>
            </div>
          ) : !quiz ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No quiz found for the selected date.</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No attempts yet. Be the first to take the quiz!</p>
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
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Correct
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry._id || entry.rank}
                        className={`hover:bg-gray-700/50 transition-colors ${
                          entry.rank <= 3 ? 'bg-purple-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-white">
                              {getRankIcon(entry.rank) || `#${entry.rank}`}
                            </span>
                            {entry.rank <= 3 && (
                              <FiAward className={`w-5 h-5 ${
                                entry.rank === 1 ? 'text-yellow-400' :
                                entry.rank === 2 ? 'text-gray-300' :
                                'text-orange-400'
                              }`} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {entry.userName || entry.user?.name || ''}
                            </div>
                            <div className="text-sm text-gray-400">
                              {entry.userEmail || entry.user?.email || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {entry.userClass || entry.user?.class || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-purple-400">
                            {entry.score || entry.totalScore || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {entry.percentage ? `${entry.percentage.toFixed(2)}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatTime(entry.totalDuration || entry.timeTaken)}
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

export default Leaderboard
