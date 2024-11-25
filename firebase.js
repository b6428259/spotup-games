// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child, onValue, remove, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBsTBVH3_eLG4SyYQtSS-rQKpTwFSq2CpI",
  authDomain: "coup-by-spotup.firebaseapp.com",
  databaseURL: "https://coup-by-spotup-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "coup-by-spotup",
  storageBucket: "coup-by-spotup.firebasestorage.app",
  messagingSenderId: "210719711979",
  appId: "1:210719711979:web:54abcc230903cf3674d4ae",
  measurementId: "G-XKVHD2M68G"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Create room with Promise
export const createRoom = async (roomId, players) => {
  try {
    await set(ref(db, 'rooms/' + roomId), {
      players: players,
      state: 'waiting',
      lastActivity: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

// Update room activity with Promise
export const updateRoomActivity = async (roomId) => {
  try {
    await set(ref(db, `rooms/${roomId}/lastActivity`), serverTimestamp());
    return true;
  } catch (error) {
    console.error("Error updating room activity:", error);
    throw error;
  }
};

// Delete room with Promise
export const deleteRoom = async (roomId) => {
  try {
    await remove(ref(db, 'rooms/' + roomId));
    return true;
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};

// Get room data with Promise
export const getRoomData = async (roomId) => {
  try {
    const roomRef = ref(db, 'rooms/' + roomId);
    const snapshot = await get(roomRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error("Error getting room data:", error);
    throw error;
  }
};

// Join room with Promise
export const joinRoom = async (roomId, newPlayer) => {
  try {
    const roomRef = ref(db, 'rooms/' + roomId);
    const snapshot = await get(roomRef);
    if (snapshot.exists()) {
      const roomData = snapshot.val();
      const updatedPlayers = [...(roomData.players || []), newPlayer];
      await set(roomRef, {
        ...roomData,
        players: updatedPlayers,
        lastActivity: serverTimestamp()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
};

// Generate room code (this doesn't need to be async)
export const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomCode = '';
  for (let i = 0; i < 6; i++) {
    roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomCode;
};

export const initializeGame = async (roomId, players) => {
    try {
        // สร้างสำรับการ์ด
        const deck = [
            'Duke', 'Duke', 'Duke',
            'Assassin', 'Assassin', 'Assassin',
            'Captain', 'Captain', 'Captain',
            'Ambassador', 'Ambassador', 'Ambassador',
            'Contessa', 'Contessa', 'Contessa'
        ];

        // สับการ์ด
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // แจกการ์ดให้ผู้เล่น
        const playerCards = {};
        players.forEach((player, index) => {
            playerCards[player] = [deck[index * 2], deck[index * 2 + 1]];
        });

        const initialState = {
          state: 'playing',
          currentTurn: 0,
          currentPhase: 'initial',
          players: players,
          coins: players.reduce((acc, player) => ({ ...acc, [player]: 2 }), {}),
          cards: playerCards,
          deck: deck.slice(players.length * 2), // เก็บการ์ดที่เหลือไว้ในสำรับ
          eliminatedPlayers: [],
          challenger: null, // กำหนดให้เป็น null เริ่มต้น
          challengedPlayer: null, // กำหนดให้เป็น null เริ่มต้น
          claimedCard: null, // กำหนดให้เป็น null เริ่มต้น
          challengeOutcome: null, // กำหนดให้เป็น null เริ่มต้น
          lastActivity: serverTimestamp()
      };
      
      await set(ref(db, `rooms/${roomId}`), initialState);
      
        return true;
    } catch (error) {
        console.error("Error initializing game:", error);
        throw error;
    }
};
export const performGameAction = async (roomId, action, player, target = null) => {
  try {
      const gameRef = ref(db, `rooms/${roomId}`);
      const snapshot = await get(gameRef);

      if (snapshot.exists()) {
          const gameData = snapshot.val();
          let updatedGameData = { ...gameData };
          
          // Logic for handling the challenge action
          if (action === 'Challenge' && target) {
              updatedGameData.challenger = player;
              updatedGameData.challengedPlayer = target;
              updatedGameData.claimedCard = 'someCard'; // ใส่การ์ดที่ผู้เล่นท้าทาย
              updatedGameData.challengeOutcome = null; // ตั้งค่าผลลัพธ์ของการท้าทายเป็น null ก่อน

              // Log the challenge action
              const logMessage = `${player} ท้าทาย ${target} ว่ามีการ์ด ${updatedGameData.claimedCard}`;
              await addGameLog(roomId, logMessage, 'action', player);
          }

          // อัปเดตข้อมูลเกม
          await set(gameRef, {
              ...updatedGameData,
              lastActivity: serverTimestamp()
          });
          return true;
      }
      return false;
  } catch (error) {
      console.error("Error performing game action:", error);
      throw error;
  }
};
