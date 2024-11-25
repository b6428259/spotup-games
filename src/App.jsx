// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameSelect from './pages/GameSelect';
import Coup from './pages/Coup/Coup';
import Lobby from './pages/Lobby/Lobby';
import CoupGame from './pages/Coup/Game/Game';
import { GameProvider } from './pages/Coup/context/GameContext';

function App() {
  return (
    <GameProvider>
    <Router>
      <Routes>
        <Route path="/" element={<GameSelect />} />
        <Route path="/coup" element={<Coup />} />
        <Route path="/lobby/:roomId" element={<Lobby />} />
        <Route path="/game/:roomId" element={<CoupGame />} />
      </Routes>
    </Router>
    </GameProvider>
  );
}

export default App;
