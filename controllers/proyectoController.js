import Proyecto from '../models/Proyecto.js';
import Usuario from '../models/Usuario.js';

const obtenerProyectos = async (req, res) => {
    try {
        //? en esta condiciones hacemos posible la busqueda de proyectos que los pueda ver el creador y los colaboradores
        const proyectos = await Proyecto.find({
            $or: [
                { colaboradores: { $in: req.usuario } },
                { creador: { $in: req.usuario } },
            ],
        }).select('-tareas');
        //? const proyectos = await Proyecto.find().where('creador').equals(req.usuario);

        res.status(200).json(proyectos);
    } catch (error) {
        console.log(error);
        res.status(404).json({ msg: 'No encontrado' });
    }
};

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body);

    try {
        proyecto.creador = req.usuario._id;
        const proyectoAlmacenado = await proyecto.save();

        res.status(200).json(proyectoAlmacenado);
    } catch (error) {
        console.log(error);

        const errorMensaje = new Error('No hemos podido crear el proyecto');
        res.status(400).json({ msg: errorMensaje.message });
    }
};

// lista un proyecto po ID con sus tareas asociadas
const obtenerProyecto = async (req, res) => {
    const { id } = req.params;

    try {
        //? populate es jalar todos los datos 'relacionados' con otra coneccion
        const proyecto = await Proyecto.findById(id)
            //?haciendo un div populate , es decir , haciendo un populate a un campo que se le hizo populate
            .populate({
                path: 'tareas',
                populate: { path: 'completado', select: 'nombre' },
            })
            .populate('colaboradores', 'nombre email');

        // verificando que el proyecto exista
        if (!proyecto) {
            const error = new Error('No encontrado');
            return res.status(404).json({ msg: error.message });
        }

        // verificando que el creador con el usuario autenticado sean el mismo
        if (
            proyecto.creador.toString() !== req.usuario._id.toString() &&
            !proyecto.colaboradores.some(
                (colaborador) =>
                    colaborador._id.toString() === req.usuario._id.toString()
            )
        ) {
            const error = new Error('Accion no valida');
            return res.status(401).json({ msg: error.message });
        }

        //? Obtener las tareas el proyecto

        //const tareas = await Tarea.find().where('proyecto').equals(id);

        //si todo va bien muestra el proyecto
        res.status(200).json(proyecto);
    } catch (error) {
        console.log(error);
        const alerta = new Error('Ha ocurrido un error');
        res.status(400).json({ msg: alerta.message });
    }
};

const editarProyecto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, fechaEntrega, cliente } = req.body;

    const proyecto = await Proyecto.findById(id);

    // verificando que el proyecto exista
    if (!proyecto) {
        const error = new Error('No encontrado');
        return res.status(404).json({ msg: error.message });
    }

    // verificando que el creador con el usuario autenticado sean el mismo
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no valida');
        return res.status(401).json({ msg: error.message });
    }

    //almacenando los nuevos valores y si no vienen se almacenan los mismos de la base de datos
    proyecto.nombre = nombre || proyecto.nombre;
    proyecto.descripcion = descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = cliente || proyecto.cliente;

    try {
        const proyectoActualizado = await proyecto.save();
        res.status(200).json(proyectoActualizado);
    } catch (error) {
        console.log(error);
        const alarma = new Error('Ha ocurrido un error');
        res.status(200).json({ msg: alarma.message });
    }
};

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;

    try {
        const proyecto = await Proyecto.findById(id);

        // verificando que el proyecto exista
        if (!proyecto) {
            const error = new Error('No encontrado');
            return res.status(404).json({ msg: error.message });
        }

        // verificando que el creador con el usuario autenticado sean el mismo
        if (proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error('Accion no valida');
            return res.status(401).json({ msg: error.message });
        }

        //si todo va bien eliminar proyecto
        await proyecto.deleteOne();
        res.status(200).json({ msg: 'Proyecto Eliminado' });
    } catch (error) {
        console.log(error);
        const alerta = new Error('Ha ocurrido un error');
        res.status(400).json({ msg: alerta.message });
    }
};

const buscarColaborador = async (req, res) => {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email }).select(
        '-password -confirmado -createdAt -token -updatedAt -__v'
    );

    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ msg: error.message });
    }

    res.json(usuario);
};

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
        const error = new Error('Proyecto No Encontrado');
        return res.status(404).json({ msg: error.message });
    }

    //? evitar que un persona que no sea creadora no pueda invitar colaboradores
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no Valida');
        return res.status(404).json({ msg: error.message });
    }

    const { email } = req.body;
    const usuario = await Usuario.findOne({ email }).select(
        '-password -confirmado -createdAt -token -updatedAt -__v'
    );

    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ msg: error.message });
    }

    //? evitar que admin del proyecto no se pueda agregar el mismo como colaborador
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error(
            'El creado del proyecto no puede ser colaborador'
        );
        return res.status(404).json({ msg: error.message });
    }

    //? revisar de un colaborador no este aun en el proyecto
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al proyecto');
        return res.status(404).json({ msg: error.message });
    }

    //? esta bien, se puuede agregar
    proyecto.colaboradores.push(usuario.id);
    await proyecto.save();

    res.json({ msg: 'Colaborador Agregado Correctamente' });
};

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if (!proyecto) {
        const error = new Error('Proyecto No Encontrado');
        return res.status(404).json({ msg: error.message });
    }

    //? evitar que un persona que no sea creadora no pueda invitar colaboradores
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no Valida');
        return res.status(404).json({ msg: error.message });
    }

    //? esta bien, se puuede eliminar
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();

    res.json({ msg: 'Colaborador Eliminado Correctamente' });
};

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
};
