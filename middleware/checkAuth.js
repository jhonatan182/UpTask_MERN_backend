import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';

const checkAuth = async (req, res, next) => {
    let token;

    //recogiendo la informacion que viene por los headers
    // esto es lo primero que se envia en un peticion HTTP
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // separando en un array para quitar la palabra Bearer del token
        // y con el [1] obtenemos la posicion donde se encuentra solo el token
        token = req.headers.authorization.split(' ')[1];

        //verificar el toquen y extrar la info que en el trae
        // en este caso almacenamos el id con anterioridad

        //verifcando... retorna objeto con los datos cuando se firmo { _id: 'token' }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //consultado a la base de datos por el id que obtuvimos del token
        try {
            const usuario = await Usuario.findById(decoded.id).select(
                '-password -confirmado -token -createdAt -updatedAt -__v'
            );

            //asignando en el req la info restante del usuario
            //como req es un objeto se esta creando otra propiedad
            req.usuario = usuario;

            // como ya esta la autenticacion ya pasa al siguiente middleware
            return next();
        } catch (error) {
            return res.status(404).json({ msg: 'Hubo un error' });
        }
    }

    if (!token) {
        const error = new Error('Token no Valido');
        return res.status(401).json({ msg: error.message });
    }
};

export default checkAuth;
