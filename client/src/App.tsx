
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
