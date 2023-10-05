import express from 'express';
import dotenv from 'dotenv';
import conectarDB from './config/db.js';
import cors from 'cors';

//imports de routes
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();

//configurar y aceptar varibles de entorno
dotenv.config();

//? permite procesar info tipo json
app.use(express.json());
// app.use(express.urlencoded({extended: false}))

//?configurar CORS

//permitiendo lista de acceso a los dominios permitidos

const whiteList = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function (origin, callback) {
        //? en origin viene los origen de donde viene las peticiones
        //? callback permite el acceso o no
        if (whiteList.includes(origin)) {
            //verificamos que la peticion de origin esta permitida en nuestrsa lista
            callback(null, true);
        } else {
            callback(new Error('Cors no permitido'));
        }
    },
};

//usar cors
app.use(cors(corsOptions));

conectarDB();

//ROUTES
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

// CREAR PARA LA VARIABLE DEL PUERTO

const PORT = process.env.PORT ?? 8080;

const servidor = app.listen(PORT, () => {
    //console.log('Puerto corriendo en el puerto 4000');
});

//? agregando Ssocket.io
import { Server } from 'socket.io';

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});

io.on('connection', (socket) => {
    //console.log('conectado a socket.io');

    //? definir los eventos de socket.io

    socket.on('abrir proyecto', (proyecto) => {
        //? esto significado que cada usuario que ingrese a la misma pagina donde seh ahce este evento se va agreagar a un socket diferente
        socket.join(proyecto);
    });

    socket.on('nueva tarea', (tarea) => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea agregada', tarea);
    });

    socket.on('eliminar tarea', (tarea) => {
        const proyecto = tarea.proyecto;

        socket.to(proyecto).emit('tarea eliminada', tarea);
    });

    socket.on('actualizar tarea', (tarea) => {
        const proyecto = tarea.proyecto._id;

        socket.to(proyecto).emit('tarea actualizada', tarea);
    });

    socket.on('cambiar estado', (tarea) => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('nuevo estado', tarea);
    });
});
