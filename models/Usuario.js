import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// definincion del tabla , tipos de datos
const usuarioSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        token: {
            type: String,
        },
        confirmado: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

/* middleware que se ejcutar antes p despues de realizar un accion(guardar , actualizar , etc) */

usuarioSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// crear nuestro propios metedos
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
};

// aqui ya se crea el modelo, o mejor dicho , la tabla
const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
