import { io } from 'socket.io-client';

// Automatically route WebSockets to the same backend host
const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';

export const socket = io(SOCKET_URL, {
    autoConnect: false, // Only connect when the user explicitly triggers Guardian Mode
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
});

socket.on('connect', () => {
    console.log('[Guardian System] Live telemetry connection established.');
});

socket.on('disconnect', () => {
    console.warn('[Guardian System] Live telemetry connection lost. Retrying...');
});

