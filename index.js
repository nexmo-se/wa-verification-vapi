// console.log(process.env);

import container from './container/index.js';

import indexRouter from './routes/index.js';
import adminRouter from './routes/admin.js';
import vapiRouter from './routes/vapi.js';

const { PORT, APPLICATION_ID } = container.config;

container.app.use(container.express.json());
container.app.use(container.express.urlencoded({ extended: false }));
container.app.use(container.cookieParser());
container.app.use(container.express.static(container.path.join(container.homeDir, 'public')));

container.app.use('/', indexRouter);
container.app.use('/vapi', vapiRouter);
container.app.use('/admin', adminRouter);

container.server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});

container.io.on("connection", async (socket) => {
    console.log(`socket.io connection event`);
    socket.on(`join:room`, (data) => {
        // roomId format is `${APPLICATION_ID}_room_${data.roomUuid}`
        console.log("join:room", data)
        if (data.roomId) {
            socket.join(`${data.roomId}`);
            console.log(`User joined roomId: ${data.roomId}`);
        }
    });
});
  