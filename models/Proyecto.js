import mongoose from 'mongoose';

//creando la forma que tiene los daots
const proyectoSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            trim: true,
            required: true,
        },
        descripcion: {
            type: String,
            trim: true,
            required: true,
        },
        fechaEntrega: {
            type: Date,
            default: Date.now(),
        },
        cliente: {
            type: String,
            trim: true,
            required: true,
        },
        creador: {
            type: mongoose.Schema.Types.ObjectId, //haciendo referencia a un Usuario
            ref: 'Usuario', // nombre del modelo al que queremos hacer referencia
        },
        tareas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tarea',
            },
        ],
        colaboradores: [
            // se usan corchetes porque indica que van a ver muchos
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Usuario',
            },
        ],
    },

    {
        timestamps: true,
    }
);

//creando el modelo o coleccion(table) en mongo

const Proyecto = mongoose.model('Proyecto', proyectoSchema);

export default Proyecto;
