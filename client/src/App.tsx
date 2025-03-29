import { BrowserRouter as Router, Routes, Route } from 'react-router'
import HomeBeforeLogin from './pages/HomeBeforeLogin'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeBeforeLogin />} />
      </Routes>
    </Router>
  )
}

export default App
