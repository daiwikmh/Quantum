import { usePrivy } from '@privy-io/react-auth';
import HomeBeforeLogin from './pages/HomeBeforeLogin';
import HomeAfterLogin from './pages/HomeAfterLogin';

function App() {
  const { authenticated } = usePrivy();
  
  return (
    <>
      {authenticated ? (
        <HomeAfterLogin />
      ) : (
        <HomeBeforeLogin />
      )}
    </>
  );
}

export default App;

// Updated HomeAfterLogin component with subscription check
