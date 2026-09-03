import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import GameShell from './components/game/GameShell';

function App() {
  return (
    <BrowserRouter>
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
