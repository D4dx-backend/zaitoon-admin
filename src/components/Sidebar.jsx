import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  BookOpenIcon, 
  DocumentTextIcon, 
  VideoCameraIcon, 
  UserGroupIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
  Cog6ToothIcon,
  ListBulletIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline'
import logo from '../assets/logo.png'
import dxLogo from '../assets/dxLogoWhite.png'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    
    // Dispatch custom event to notify App component of auth state change
    window.dispatchEvent(new Event('authStateChange'))
    
    navigate('/login')
  }

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')

  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path
  }

  // Helper function to get button classes based on active state
  const getButtonClasses = (path) => {
    const baseClasses = "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
    const activeClasses = "text-white bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30"
    const inactiveClasses = "text-violet-200 hover:text-white hover:bg-violet-800/60"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  return (
    <div className="bg-violet-900/95 backdrop-blur-sm border-r border-violet-800/60 h-screen w-56 fixed left-0 top-0 z-40 shadow-xl">
      <div className="p-4 h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center mb-6 px-2">
          <img 
            src={logo} 
            alt="Zai Toon Logo" 
            className="h-10 w-auto mr-3"
          />
          <h1 
            style={{
              fontFamily: 'Archivo Black',
              fontSize: '20px',
              color: '#FFFFFF'
            }}
          >
            ZaiToon 
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className={getButtonClasses('/dashboard')}
          >
            <HomeIcon className={`w-5 h-5 ${isActive('/dashboard') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => navigate('/stories')}
            className={getButtonClasses('/stories')}
          >
            <BookOpenIcon className={`w-5 h-5 ${isActive('/stories') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Stories</span>
          </button>
          
          <button
            onClick={() => navigate('/single-stories')}
            className={getButtonClasses('/single-stories')}
          >
            <DocumentTextIcon className={`w-5 h-5 ${isActive('/single-stories') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Single Stories</span>
          </button>
          
          <button
            onClick={() => navigate('/videos')}
            className={getButtonClasses('/videos')}
          >
            <VideoCameraIcon className={`w-5 h-5 ${isActive('/videos') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Videos</span>
          </button>
          
          <button
            onClick={() => navigate('/kids-submissions')}
            className={getButtonClasses('/kids-submissions')}
          >
            <UserGroupIcon className={`w-5 h-5 ${isActive('/kids-submissions') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Kids Submissions</span>
          </button>
          
          <button
            onClick={() => navigate('/bright-box')}
            className={getButtonClasses('/bright-box')}
          >
            <BookOpenIcon className={`w-5 h-5 ${isActive('/bright-box') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Bright Box</span>
          </button>

          <button
            onClick={() => navigate('/puzzles')}
            className={getButtonClasses('/puzzles')}
          >
            <PuzzlePieceIcon className={`w-5 h-5 ${isActive('/puzzles') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Puzzles</span>
          </button>

          <button
            onClick={() => navigate('/banners')}
            className={getButtonClasses('/banners')}
          >
            <PhotoIcon className={`w-5 h-5 ${isActive('/banners') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Banners</span>
          </button>

          <button
            onClick={() => navigate('/quizzes')}
            className={getButtonClasses('/quizzes')}
          >
            <AcademicCapIcon className={`w-5 h-5 ${isActive('/quizzes') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Quizzes</span>
          </button>

          <button
            onClick={() => navigate('/questions')}
            className={getButtonClasses('/questions')}
          >
            <QuestionMarkCircleIcon className={`w-5 h-5 ${isActive('/questions') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Question Bank</span>
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            className={getButtonClasses('/leaderboard')}
          >
            <TrophyIcon className={`w-5 h-5 ${isActive('/leaderboard') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Leaderboard</span>
          </button>

          <button
            onClick={() => navigate('/quiz-management')}
            className={getButtonClasses('/quiz-management')}
          >
            <Cog6ToothIcon className={`w-5 h-5 ${isActive('/quiz-management') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Quiz Management</span>
          </button>

          <button
            onClick={() => navigate('/quiz-attempts')}
            className={getButtonClasses('/quiz-attempts')}
          >
            <ListBulletIcon className={`w-5 h-5 ${isActive('/quiz-attempts') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Quiz Attempts</span>
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className={getButtonClasses('/notifications')}
          >
            <BellAlertIcon className={`w-5 h-5 ${isActive('/notifications') ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
            <span className="text-sm font-medium">Notifications</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-violet-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-violet-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group mb-4"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:text-red-400" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          
          {/* D4DX Logo and Text */}
          <div className="flex items-center justify-center space-x-2 px-3">
            <img 
              src={dxLogo} 
              alt="D4DX Logo" 
              className="h-6 w-auto opacity-80"
            />
            <p className="text-xs text-violet-300/70 font-medium tracking-wide">
              POWERED BY D4DX
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar