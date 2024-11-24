import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, getRoomData, generateRoomCode, joinRoom } from '../../../firebase';
import { ref, get, set, serverTimestamp } from 'firebase/database';
import { db } from '../../../firebase';
import coupLogo from '../../assets/coup/Coup.jpg';

function Coup() {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) setName(savedName);
  }, []);

  const validateName = () => {
    if (!name.trim()) {
      setNameError('กรุณาใส่ชื่อก่อน');
      return false;
    }
    if (name.length < 2 || name.length > 15) {
      setNameError('ชื่อต้องมี 2-15 ตัวอักษร');
      return false;
    }
    setNameError('');
    return true;
  };


  const handleCreateRoom = async () => {
    if (!validateName()) return;

    setIsLoading(true);
    try {
      const newRoomId = generateRoomCode();
      localStorage.setItem('playerName', name);
      await createRoom(newRoomId, [name]);
      navigate(`/lobby/${newRoomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      setNameError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  // In your component
  const handleJoinRoom = async () => {
    if (!validateName()) return;
    if (!roomId.trim()) {
      setNameError('กรุณาใส่รหัสห้อง');
      return;
    }

    setIsLoading(true);
    try {
      const data = await getRoomData(roomId);
      if (!data) {
        setNameError('ไม่พบห้องนี้');
        return;
      }
      if (data.players?.includes(name)) {
        setNameError('มีชื่อนี้ในห้องแล้ว');
        return;
      }
      if (data.players?.length >= 6) {
        setNameError('ห้องเต็มแล้ว');
        return;
      }

      localStorage.setItem('playerName', name);
      await joinRoom(roomId, name);
      navigate(`/lobby/${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      setNameError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/src/assets/coup/CoupBackground.jpg')",
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backgroundBlend: 'multiply'
      }}>
      <div className="min-h-screen bg-black bg-opacity-50 flex flex-col items-center justify-center px-4">
        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="mb-8 flex justify-center">
            <img
              src={coupLogo}
              alt="Coup Logo"
              className="w-64 h-auto rounded-lg shadow-lg"
            />
          </div>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="ใส่ชื่อของคุณ"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                disabled={isLoading}
                className={`w-full p-4 bg-gray-800 border ${nameError ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${nameError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                  } transition-all duration-300 ${isLoading ? 'opacity-50' : ''
                  }`}
              />
              {nameError && (
                <p className="text-red-400 text-sm mt-2">{nameError}</p>
              )}
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!name.trim() || isLoading}
              className={`w-full p-4 ${name.trim() && !isLoading
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-700 cursor-not-allowed'
                } text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100`}
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'สร้างห้อง'}
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="ใส่รหัสห้อง"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.toUpperCase());
                  setNameError('');
                }}
                disabled={isLoading}
                className={`w-full p-4 bg-gray-800 border ${nameError ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${nameError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                  } transition-all duration-300 ${isLoading ? 'opacity-50' : ''
                  }`}
              />
              <button
                onClick={handleJoinRoom}
                disabled={!name.trim() || !roomId.trim() || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${name.trim() && roomId.trim() && !isLoading
                    ? 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
                    : 'bg-gray-700 cursor-not-allowed'
                  } text-white font-bold py-2 px-6 rounded-lg transition-all duration-300`}
              >
                {isLoading ? '...' : 'เข้าร่วม'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Coup;