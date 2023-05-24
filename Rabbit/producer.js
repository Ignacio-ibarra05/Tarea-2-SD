//como hacer para que se generen n threads 

const { Worker } = require('worker_threads');
const numThreads = 3; //numero de threads que estamos generando

const amqp = require("amqplib");
const { randomInt } = require('crypto');
const rabbitconfig = {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
    host: '/', 
    AutMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
}

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

let ini = 0;

connect();
async function connect(){

    const queue1 = "informacion";
    const queue2 = "dispositivo";

    try{
        const conn = await amqp.connect();
        console.log('conexion lograda..');

        const channel = await conn.createChannel();
        console.log('canal creado..');

        const res1 = await channel.assertQueue(queue1);
        const res2 = await channel.assertQueue(queue2);
        console.log('cola creada..');
        
        setInterval(() => {
            function receiveMessage(message) {
                console.log('Mensaje recibido desde el hilo secundario:', message);
            }
            for (let i = 0; i < numThreads; i++) {
                const Ts = new Date().getTime();
                const time = Ts - ini;
                const worker = new Worker('./worker.js');
                const id = (worker.threadId)%3;

                const nu = generarNumero(id);
                const Rm = generarMensajes(nu);

                const msgs = {"Dispositivo": id, "grupo": queue1, "value":Rm, "timestamp":time};                
                const inf = {"Dispositivo": id, "grupo": queue2, "value":Rm, "timestamp":time}
                // Escucha mensajes desde cada hilo secundario
                worker.on(msgs, receiveMessage);
                
                // Envía un mensaje a cada hilo secundario

                //worker.postMessage(`Mensaje desde el hilo principal al hilo secundario ${id}`);
                channel.sendToQueue(queue1, Buffer.from(JSON.stringify(msgs)));
                channel.sendToQueue(queue2, Buffer.from(JSON.stringify(inf)));
                //console.log(msgs);
                ini = time;
            }
            //console.log(`Mensajes enviados a la cola ${queue}`);
        }, 3000);

    }catch(err){
        console.log(`Error -> ${err}`);
    }
}
