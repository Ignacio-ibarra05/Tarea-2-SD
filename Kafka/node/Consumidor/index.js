const { Worker } = require('worker_threads');
const numThreads = 2; //numero de threads que estamos generando

const { Kafka } = require('kafkajs')
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const kafka = new Kafka({
  brokers: [process.env.kafkaHost],
  clientId: 'Tarea'
});

const consumer1 = kafka.consumer({groupId: 'grupo-prueba1'});

const consumer2 = kafka.consumer({groupId: 'grupo-prueba2'});

const run = async () => {
    for (let i = 0; i < numThreads; i++) {
        const worker = new Worker('./worker.js');
        
        await consumer1.connect();
        await consumer2.connect();

        await consumer1.subscribe({ topic: 'informacion', fromBeginning: true });

        await consumer2.subscribe({ topic: 'mensaje', fromBeginning: true});
 
        await consumer1.run({

            eachMessage: async ({message, topic}) => {
                const a = (message.offset) % 3;
                console.log(`Dispositivo: ${a}, tipo: ${topic}, mensaje: ${(message.value).toString()}, timestamp: ${message.timestamp}`);
                //console.log(message);
            },
        })
        await consumer2.run({

            eachMessage: async ({message, topic}) => {
                const a = (message.offset) % 3;
                console.log(`Dispositivo: ${a}, tipo: ${topic}, mensaje: ${message.value}, timestamp: ${message.timestamp}`);
                //console.log(message)
            },
        })
    }
};

run().catch(console.error);

