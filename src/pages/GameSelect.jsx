// src/pages/GameSelect.jsx
import { Link } from 'react-router-dom';

function GameSelect() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Select a Game
        </h1>
        <ul className="space-y-4">
          <li>
            <Link
              to="/coup"
              className="block w-full text-center py-3 px-6 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Coup
            </Link>
          </li>
          {/* สามารถเพิ่มเกมอื่นๆ ได้ในอนาคต */}
        </ul>
      </div>
    </div>
  );
}

export default GameSelect;
