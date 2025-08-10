import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from './pages/dashboard'
import Login from './pages/login';
import Invite from './pages/invite'
import Acquisition from './pages/acquisition';
import Closers from './pages/closers';
import Setters from './pages/setters';

import { PrivateRoute } from './auth/PrivateRoute';
import Leads from './pages/leads';
import Coaches from './pages/coaches';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/acquisition" element={<PrivateRoute><Acquisition /></PrivateRoute>} />
      <Route path="/closers" element={<PrivateRoute><Closers /></PrivateRoute>} />
      <Route path="/setters" element={<PrivateRoute><Setters /></PrivateRoute>} />
      <Route path="/coaches" element={<PrivateRoute><Coaches /></PrivateRoute>} />
      <Route path="/leads" element={<PrivateRoute><Leads /></PrivateRoute>} />
      <Route path="/invite" element={<PrivateRoute><Invite /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
