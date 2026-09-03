import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import GameShell from './components/game/GameShell';
import { getSession } from './lib/roomService';
import { useMockStore } from './store/mockStore';

/**
 * SessionRecovery — checks localStorage on app startup.
 * If a valid session exists, restore it to the store and
 * redirect the user back to their room.
 */
function SessionRecovery() {
  const navigate = useNavigate();
  const setSession = useMockStore((s) => s.setSession);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setSession(session);
      // Only redirect if we're on the Home page
      if (window.location.pathname === '/') {
        navigate(`/room/${session.roomId}`);
      }
    }
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <SessionRecovery />
      <GameShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </GameShell>
    </BrowserRouter>
  );
}

export default App;
