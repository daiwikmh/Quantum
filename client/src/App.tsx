import { BrowserRouter as Router, Routes, Route } from 'react-router'
import HomeBeforeLogin from './pages/HomeBeforeLogin'
import Profile from './pages/profile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeBeforeLogin />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  )
}

export default App
