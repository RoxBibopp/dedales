// src/socket.js
import { io } from 'socket.io-client';
// Changez l'URL si votre serveur n'est pas en localhost
const socket = io('http://localhost:3000');
export default socket;
