import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Accommodation from './pages/Accommodation';
import Bookings from './pages/Bookings'; // Import the new Bookings component

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="accommodation" element={<Accommodation />} />
        <Route path="bookings" element={<Bookings />} /> {/* Add the new route */}
      </Routes>
    </Router>
  )
}

export default App