// src/socket.js
import { io } from 'socket.io-client';
const socket = io('https://dedalback.onrender.com');
// const socket = io('localhost:3000');

export default socket;
