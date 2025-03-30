import { BrowserRouter as Router, Routes, Route } from 'react-router'
import HomeBeforeLogin from './pages/HomeBeforeLogin'
import Profile from './pages/profile'
import Payment from './components/transactions/payment'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeBeforeLogin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  )
}

export default App
