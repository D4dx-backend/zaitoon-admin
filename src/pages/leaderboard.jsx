import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import axios from 'axios'
import { 
  FiAward,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi'

const today = () => new Date().toISOString().split('T')[0]

const SORT_OPTIONS = [
  { value: 'score-desc', label: 'Score (high → low)', by: 'score', order: 'desc' },
  { value: 'score-asc', label: 'Score (low → high)', by: 'score', order: 'asc' },
  { value: 'time-asc', label: 'Time (fastest first)', by: 'time', order: 'asc' },
  { value: 'time-desc', label: 'Time (slowest first)', by: 'time', order: 'desc' }
]

function Leaderboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const [leaderboard, setLeaderboard] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fromDate, setFromDate] = useState(today())
  const [toDate, setToDate] = useState(today())
  const [viewMode, setViewMode] = useState('daily') // 'daily' | 'total' | 'byEmail'
  const [totalAllTime, setTotalAllTime] = useState(false)
  const [sortOption, setSortOption] = useState('score-desc')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchTodayLeaderboard = () => {
    setFromDate(today())
    setToDate(today())
    setTotalAllTime(false)
    setTimeout(() => fetchData(today(), today(), viewMode, false), 0)
  }

  const fetchData = async (from = fromDate, to = toDate, mode = viewMode, allTime = totalAllTime) => {
    const isTotal = mode === 'total'
    const isByEmail = mode === 'byEmail'
    if (!isTotal && !isByEmail && (!from || !to)) return
    if ((isTotal || isByEmail) && !allTime && (!from || !to || from > to)) return
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      let url
      if (isByEmail) {
        url = allTime
          ? `${API_BASE}/quizzes/leaderboard/by-email`
          : `${API_BASE}/quizzes/leaderboard/by-email?startDate=${from}&endDate=${to}`
      } else if (isTotal) {
        url = allTime
          ? `${API_BASE}/quizzes/leaderboard/total`
          : `${API_BASE}/quizzes/leaderboard/total?startDate=${from}&endDate=${to}`
      } else {
        url = `${API_BASE}/quizzes/leaderboard/daily?date=${from === to ? from : to}`
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        const data = response.data.data
        if (isByEmail) {
          const list = (data.leaderboard || []).map((e, i) => ({
            ...e,
            rank: i + 1,
            score: e.totalScore,
            userEmail: e.email,
            userClass: e.userClass ?? e.user?.class ?? 'N/A',
            userPhone: e.userPhone ?? '—',
            percentage: null
          }))
          setLeaderboard(list)
          setQuiz({
            title: 'Leaderboard by email (combined score)',
            mlTitle: '',
            quizDate: allTime ? 'All time' : `${from} to ${to}`,
            isTotal: true,
            isByEmail: true
          })
        } else if (isTotal) {
          const list = (data.leaderboard || []).map((e, i) => ({
            ...e,
            rank: i + 1,
            score: e.totalScore,
            percentage: null
          }))
          setLeaderboard(list)
          setQuiz({
            title: allTime ? 'Total Leaderboard (all time)' : 'Total Leaderboard (aggregated)',
            mlTitle: '',
            quizDate: allTime ? 'All time' : `${from} to ${to}`,
            isTotal: true
          })
        } else {
          setLeaderboard(data.attendees || [])
          setQuiz({
            title: 'Daily Quiz',
            mlTitle: 'ദൈനംദിന ക്വിസ്',
            quizDate: data.date,
            isTotal: false
          })
        }
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

  const handleApplyRange = () => {
    if ((viewMode === 'total' || viewMode === 'byEmail') && totalAllTime) {
      fetchData(fromDate, toDate, viewMode, true)
    } else if (fromDate && toDate && fromDate <= toDate) {
      fetchData()
    }
  }

  const setMode = (mode) => {
    setViewMode(mode)
    if (mode === 'byEmail') {
      setTotalAllTime(true) // default to All time so full results show
      fetchData(fromDate, toDate, 'byEmail', true)
    } else if (mode === 'total') {
      setTotalAllTime(true) // default to All time so full results show
      fetchData(fromDate, toDate, 'total', true)
    } else if (fromDate && toDate) {
      fetchData(fromDate, toDate, 'daily')
    }
  }

  const handleAllTimeChange = (e) => {
    const checked = e.target.checked
    setTotalAllTime(checked)
    if (viewMode === 'total' || viewMode === 'byEmail') {
      if (checked) fetchData(fromDate, toDate, viewMode, true)
      else if (fromDate && toDate) fetchData(fromDate, toDate, viewMode, false)
    }
  }

  const { by: sortBy, order: sortOrder } = SORT_OPTIONS.find(o => o.value === sortOption) || { by: 'score', order: 'desc' }
  const sortedLeaderboard = useMemo(() => {
    const list = [...leaderboard]
    list.sort((a, b) => {
      const scoreA = a.score ?? a.totalScore ?? 0
      const scoreB = b.score ?? b.totalScore ?? 0
      const timeA = a.totalDuration ?? a.timeTaken ?? 0
      const timeB = b.totalDuration ?? b.timeTaken ?? 0
      if (sortBy === 'score') {
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB
      }
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
    })
    return list.map((e, i) => ({ ...e, rank: i + 1 }))
  }, [leaderboard, sortBy, sortOrder])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    if (typeof dateString === 'string' && (dateString.includes(' to ') || dateString === 'All time')) return dateString
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
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={handleApplyRange}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setMode('total')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'total' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                <FiAward className="w-5 h-5" />
                <span>Total</span>
              </button>
              <button
                onClick={() => setMode('byEmail')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'byEmail' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                <span>By email</span>
              </button>
              {(viewMode === 'total' || viewMode === 'byEmail') && (
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={totalAllTime}
                    onChange={handleAllTimeChange}
                    className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                  />
                  All time
                </label>
              )}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={fetchTodayLeaderboard}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FiRefreshCw className="w-5 h-5" />
                <span>Today</span>
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
              {quiz.isByEmail && (
                <p className="text-sm text-gray-400 mt-2">
                  One row per email — total combined score from all daily attempts. Each email can attempt only once per day.
                </p>
              )}
              {quiz.isTotal && !quiz.isByEmail && (
                <p className="text-sm text-gray-400 mt-2">
                  One row per user — score and time are combined across all their attempts. Use the Attempts column to see how many tries each user had.
                </p>
              )}
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
              <p className="text-gray-400">Could not load leaderboard.</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {(viewMode === 'total' || viewMode === 'byEmail')
                  ? "No attempts in this date range. Try 'All time' or a wider range."
                  : 'No attempts yet. Be the first to take the quiz!'}
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="px-4 py-2 bg-gray-700/50 text-sm text-gray-400">
                Showing {sortedLeaderboard.length} {viewMode === 'byEmail' ? 'email(s)' : viewMode === 'total' ? 'user(s)' : 'attempt(s)'}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Correct</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                      {quiz.isTotal && (
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Attempts</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {sortedLeaderboard.map((entry) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {entry.userPhone || entry.user?.phone || '—'}
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
                        {quiz.isTotal && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {entry.attemptsCount ?? '—'}
                          </td>
                        )}
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
