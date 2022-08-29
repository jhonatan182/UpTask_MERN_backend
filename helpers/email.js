import nodemailer from 'nodemailer';

const emailRegistro = (datos) => {
    const { email, nombre, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // informacion del email

    const info = transport.sendMail({
        from: '"Uptask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'Uptask - Comprueba tu cuenta',
        text: 'Comprueba tu cuenta en Uptask',
        html: `<p>Hola: ${nombre} Comprueba tu cuenta en Uptask</p>
        <p>Tu cuenta ya esta casi lista, solo debes de comprobarla en el siguiente enlace:</p>
        
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
        
        <p>Si tu solicitaste esta email, puedes ignorar el mensaje</p>
        `,
    });
};

const emailOlvidePassword = (datos) => {
    const { email, nombre, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // informacion del email

    const info = transport.sendMail({
        from: '"Uptask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'Uptask - Reestablece tu Password',
        text: 'Reestablece tu Password',
        html: `<p>Hola: ${nombre} has solicitado reestablecer tu password</p>
        <p>Sigue el siguiente enlace para generar un nuevo password:</p>
        

        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
        
        <p>Si tu solicitaste esta email, puedes ignorar el mensaje</p>
        `,
    });
};

export { emailRegistro, emailOlvidePassword };
