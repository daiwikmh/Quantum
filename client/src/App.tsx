import { BrowserRouter as Router, Routes, Route } from 'react-router'
import HomeBeforeLogin from './pages/HomeBeforeLogin'
import Profile from './pages/profile'

function App() {

  const { authenticated } = usePrivy();
  // console.log(JSON.stringify(user));
  const { wallets } = useWallets();
  console.log(JSON.stringify(wallets));

  return (
    <>
      {authenticated ? (
        <HomeAfterLogin />
      ) : (
          <HomeBeforeLogin />
          
      )}
    </>


  )
}

export default App
