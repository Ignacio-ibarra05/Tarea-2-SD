const { Worker } = require('worker_threads');
const numThreads = 3; //numero de threads que estamos generando

const { Kafka } = require('kafkajs')
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const kafka = new Kafka({
  brokers: [process.env.kafkaHost],
  clientId: 'Tarea',
});

//Seteo de valores
let Ts = 0;

function generarMensajes(length) {
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let message = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    const randomChar = char[randomIndex];
    message += randomChar;
  }
  
  return message;
}

function generarNumero(n){
  const num = Math.random() * (15) + n;
  return num;
}

const run = async () => {
    // Producing
   for (let i = 0; i < numThreads; i++) {
      const producer1 = kafka.producer();
      const producer2 = kafka.producer();

      const worker = new Worker('./worker.js');
      let id = (worker.threadId) % 3;
      const ID = String(id);
      const n = generarNumero(id);
      const Rm = generarMensajes(n);
      
      await producer1.connect();
      await producer2.connect();
      
      await producer1.send({
          topic: 'informacion', 
          messages: [{value: Rm}],
      });

      await producer2.send({
        topic: 'mensaje',
        messages: [{value: ID}],
      });
    }
};

setInterval(() => {
  run().catch(console.error);
}, 3000);

