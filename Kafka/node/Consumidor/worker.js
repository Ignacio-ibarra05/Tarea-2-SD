// worker.js
const { parentPort } = require('worker_threads');

// Escucha mensajes desde el hilo principal
parentPort.on('message', message => {
  console.log('Mensaje recibido en el hilo secundario:', message);
  
  // Envía una respuesta al hilo principal
  parentPort.postMessage('Respuesta desde el hilo secundario');
});
