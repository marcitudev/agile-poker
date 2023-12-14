import * as express from 'express';
import { Router, Request, Response } from 'express';
import usersController from './controllers/UserController';
import authentication from './controllers/Authentication';
import { verifyToken } from './controllers/Authentication';
import roomsController from './controllers/RoomController'
import { runMigrations } from './config/migrations';

const app = express();
const route = Router();

app.use(express.json());

route.get('/', (req: Request, res: Response) => {
    res.json({ message: "Server Running" });
});

app.use(route);
app.use('/authentication', authentication);
app.use('/users', verifyToken, usersController);
app.use('/rooms', verifyToken, roomsController);

app.listen(3000, () => {
    console.log('--- Running on port 3000 ---');
    runMigrations().then(() => console.log('')).catch((e) => { throw new Error(`Migrations not applied: ${e}`) });
});
