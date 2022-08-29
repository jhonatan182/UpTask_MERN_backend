import Tarea from '../models/Tarea.js';
import Proyecto from '../models/Proyecto.js';

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body;

    //? verificar que el proyecto exista
    const existeProyecto = await Proyecto.findById(proyecto);

    if (!existeProyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({ msg: error.message });
    }

    //? verificar que al agregar tareas solo el mismo creador puueda agregar tareas
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los permisos para agregar tareas');
        return res.status(403).json({ msg: error.message });
    }

    //?almacenando la tarea

    try {
        const tareaAlmacenada = await Tarea.create(req.body);

        //? almacenar el id de la tarea en el proyecto para que haya una "relacion"
        existeProyecto.tareas = [...existeProyecto.tareas, tareaAlmacenada];
        await existeProyecto.save();

        return res.json(tareaAlmacenada).status(200);
    } catch (error) {
        console.log(error);
        const mensaje = new Error('El proyecto no existe');
        return res.status(404).json({ msg: mensaje.message });
    }
};

const obtenerTarea = async (req, res) => {
    const { id } = req.params;

    //?verificar que la tarea exista y une donde haya referencia con otra coleccion
    const existeTarea = await Tarea.findById(id).populate('proyecto');

    if (!existeTarea) {
        const mensaje = new Error('La Tarea no existe');
        return res.status(404).json({ msg: mensaje.message });
    }

    //? verificar si al persona creadora del proyecto pueda consultar
    if (
        existeTarea.proyecto.creador.toString() !== req.usuario._id.toString()
    ) {
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message });
    }

    res.json(existeTarea);
};

const actualizarTarea = async (req, res) => {
    const { id } = req.params;

    //?verificar que la tarea exista y une donde haya referencia con otra coleccion
    const existeTarea = await Tarea.findById(id).populate('proyecto');

    if (!existeTarea) {
        const mensaje = new Error('La Tarea no existe');
        return res.status(404).json({ msg: mensaje.message });
    }

    //? verificar si al persona creadora del proyecto pueda consultar
    if (
        existeTarea.proyecto.creador.toString() !== req.usuario._id.toString()
    ) {
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message });
    }

    // actualizando los datos

    const { nombre, descripcion, estado, fechaEntrega, prioridad } = req.body;

    existeTarea.nombre = nombre || existeTarea.nombre;
    existeTarea.descripcion = descripcion || existeTarea.descripcion;
    existeTarea.estado = estado || existeTarea.estado;
    existeTarea.fechaEntrega = fechaEntrega || existeTarea.fechaEntrega;
    existeTarea.prioridad = prioridad || existeTarea.prioridad;

    try {
        const tareaActualizada = await existeTarea.save();
        res.status(200).json(tareaActualizada);
    } catch (error) {
        console.error(error);
        const mesanje = new Error('Ocurrio un error');
        return res.status(403).json({ msg: mesanje.message });
    }
};

const eliminarTarea = async (req, res) => {
    const { id } = req.params;

    //?verificar que la tarea exista y une donde haya referencia con otra coleccion
    const existeTarea = await Tarea.findById(id).populate('proyecto');

    if (!existeTarea) {
        const mensaje = new Error('La Tarea no existe');
        return res.status(404).json({ msg: mensaje.message });
    }

    //? verificar si al persona creadora del proyecto pueda consultar
    if (
        existeTarea.proyecto.creador.toString() !== req.usuario._id.toString()
    ) {
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message });
    }

    try {
        const proyecto = await Proyecto.findById(existeTarea.proyecto);
        proyecto.tareas.pull(existeTarea._id);

        await Promise.allSettled([
            await proyecto.save(),
            await existeTarea.deleteOne(),
        ]);

        res.json({ msg: 'Tarea Eliminada Correctamente' });
    } catch (error) {
        console.error(error);
        const mesanje = new Error('Ocurrio un error');
        return res.status(403).json({ msg: mesanje.message });
    }
};

const cambiarEstado = async (req, res) => {
    const { id } = req.params;

    //?verificar que la tarea exista y une donde haya referencia con otra coleccion
    const existeTarea = await Tarea.findById(id).populate('proyecto');

    if (!existeTarea) {
        const mensaje = new Error('La Tarea no existe');
        return res.status(404).json({ msg: mensaje.message });
    }

    //? verificar si al persona creadora del proyecto pueda consultar
    if (
        existeTarea.proyecto.creador.toString() !==
            req.usuario._id.toString() &&
        !existeTarea.proyecto.colaboradores.some(
            (colaborador) =>
                colaborador._id.toString() === req.usuario._id.toString()
        )
    ) {
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message });
    }

    existeTarea.estado = !existeTarea.estado;
    //? guardando referencia de quien completo la tarea
    existeTarea.completado = req.usuario._id;
    await existeTarea.save();

    const tareaAlmacenada = await Tarea.findById(id)
        .populate('proyecto')
        .populate('completado', 'nombre');

    console.log(tareaAlmacenada);
    res.json(tareaAlmacenada);
};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
};
