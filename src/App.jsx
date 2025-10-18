import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import SingleStory from './pages/singleStory'
import Stories from './pages/stories'
import Videos from './pages/videos'
import KidsSubmission from './pages/kidsSubmission'
import BrightBox from './pages/brightBox'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            localStorage.getItem('adminToken') ? 
            <Dashboard /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/single-stories" 
          element={
            localStorage.getItem('adminToken') ? 
            <SingleStory /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/stories" 
          element={
            localStorage.getItem('adminToken') ? 
            <Stories /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/videos" 
          element={
            localStorage.getItem('adminToken') ? 
            <Videos /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/kids-submissions" 
          element={
            localStorage.getItem('adminToken') ? 
            <KidsSubmission /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/bright-box" 
          element={
            localStorage.getItem('adminToken') ? 
            <BrightBox /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
