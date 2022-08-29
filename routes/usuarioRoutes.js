import express from 'express';
import {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
} from '../controllers/usuarioController.js';

//importanto el middleware
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// Autenticacion, Registro y Confirmacion de Usuarios

router.post('/', registrar); // crear un nuevo usuario
router.post('/login', autenticar); // autenticar
router.get('/confirmar/:token', confirmar); // autenticar
router.post('/olvide-password', olvidePassword); // solicitar token para cambiar el password

//? esto lo puedo cambiar a:
// router.get('/olvide-password/:token', comprobarToken); //comprobando token para cambiar password
// router.post('/olvide-password/:token', nuevoPassword); // guardar el nuevo password
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);

//* usando el middleware
//? primero es el ruta
//? luego el middleware,  y cuando se haga el next() va pasar al controlador
//? luego el controlador
router.get('/perfil', checkAuth, perfil);

export default router;
