const amqp = require("amqplib");
const rabbitconfig = {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
    host: '/', 
    AutMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
}
connect();
async function connect(){
    const queue1 = "informacion";
    const queue2 = "dispositivo";

    const enterprice = "informacion";

    try{
        const conn = await amqp.connect();
        console.log('conexion lograda..');

        const channel = await conn.createChannel();
        console.log('canal creado..');

        const res = await channel.assertQueue(queue1);
        const res2 = await channel.assertQueue(queue2);
        console.log('cola creada..');

        console.log(`esperando por mensajes de ${enterprice}`);
        channel.consume(queue1, message => {
            let mensaje = JSON.parse(message.content.toString());
            //console.log(`respuesta a la : ${mensaje.value}`);
            console.log(mensaje);
        });

        channel.consume(queue2, message => {
            let mensaje = JSON.parse(message.content.toString());
            //console.log(`respuesta a la : ${mensaje.value}`);
            console.log(mensaje);
        });

    }catch(err){
        console.log(`Error -> ${err}`);
    }
}