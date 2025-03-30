
import './App.css'


import { usePrivy, useWallets } from '@privy-io/react-auth';
import HomeBeforeLogin from './pages/HomeBeforeLogin';
import HomeAfterLogin from './pages/HomeAfterLogin';


function App() {

  const { authenticated } = usePrivy();
  // console.log(JSON.stringify(user));
  const { wallets } = useWallets();
  console.log(JSON.stringify(wallets));

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
