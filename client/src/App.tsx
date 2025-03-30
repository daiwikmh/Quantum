
import './App.css'
import { usePrivy, useWallets } from '@privy-io/react-auth';
import HomeBeforeLogin from './pages/HomeBeforeLogin';
import HomeAfterLogin from './pages/HomeAfterLogin';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Profile from './pages/profile';
import Payment from './components/transactions/payment';

function App() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  return (
    <Router>
      <Routes>
        <Route path="/" element={!authenticated ? <HomeBeforeLogin /> : <Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={authenticated ? <HomeAfterLogin /> : <Navigate to="/" />}
        >
          <Route path="payments" element={<Payment />} />
        </Route>
        <Route 
          path="/profile" 
          element={authenticated ? <Profile /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App
