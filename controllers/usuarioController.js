import Usuario from '../models/Usuario.js';
import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import { emailOlvidePassword, emailRegistro } from '../helpers/email.js';

const registrar = async (req, res) => {
    //prevenir usuarios duplicados
    const { email } = req.body;

    const usuarioExiste = await Usuario.findOne({ email });

    if (usuarioExiste) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({ msg: error.message });
    }

    try {
        // instancia del objeto con los datos aun en memoria
        const usuario = new Usuario(req.body);

        //asignando el token
        usuario.token = generarId();

        //almacenando ahora si a la base de datos
        await usuario.save();

        //enviar email de confirmacion
        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token,
        });

        res.json({
            msg: 'Usuario creado correctamente , revisar tu Email para confirmar tu cuenta',
        });
    } catch (error) {
        console.log(error);
    }
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;

    //comprobar si el usuario existe
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
        const error = new Error('Usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    //comprobar si el usuario esta autenticado

    if (!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({ msg: error.message });
    }

    //comprobar su password
    if (await usuario.comprobarPassword(password)) {
        return res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),
        });
    } else {
        const error = new Error('Password Incorrecto');
        return res.status(403).json({ msg: error.message });
    }
};

const confirmar = async (req, res) => {
    //capturando parametros que vienen desde la URl
    const { token } = req.params;

    const usuarioConfirmar = await Usuario.findOne({ token });

    if (!usuarioConfirmar) {
        const error = new Error('Token no Válido');
        return res.status(403).json({ msg: error.message });
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = '';

        //volver a guardar el usuario
        await usuarioConfirmar.save();

        res.status(200).json({ msg: 'Usuario Confirmado Correctamente' });
    } catch (error) {
        console.log(error);
    }
};

const olvidePassword = async (req, res) => {
    const { email } = req.body;

    //validar que el usuario existe

    const usuarioExiste = await Usuario.findOne({ email });

    if (!usuarioExiste) {
        const error = new Error('El usuario no existe');
        res.status(404).json({ msg: error.message });
    }

    try {
        //asiganandole de nuevo un token
        usuarioExiste.token = generarId();

        //guardando de nuevo el id
        await usuarioExiste.save();

        //? enviando email email al usuario
        emailOlvidePassword({
            nombre: usuarioExiste.nombre,
            email: usuarioExiste.email,
            token: usuarioExiste.token,
        });

        res.json({
            msg: `Hemos enviado las instrucciones a tu email: ${usuarioExiste.email}`,
        });
    } catch (error) {
        console.log(error);
    }
};

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const tokenValido = await Usuario.findOne({ token });

    if (tokenValido) {
        return res
            .status(200)
            .json({ msg: 'Token valido y el Usuario existe' });
    } else {
        const error = new Error('Token no valido');
        return res.status(404).json({ msg: error.message });
    }
};

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ token });

    if (usuario) {
        usuario.password = password;
        usuario.token = '';

        try {
            //almacenando el usuario
            await usuario.save();

            return res
                .status(200)
                .json({ msg: 'Password Modificado Correctamente' });
        } catch (error) {
            console.log(error);
        }
    } else {
        const error = new Error('Token no valido');
        return res.status(404).json({ msg: error.message });
    }
};

const perfil = async (req, res) => {
    const { usuario } = req;

    res.json(usuario);
};

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
};
