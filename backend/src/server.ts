import * as express from 'express';
import { Router, Request, Response } from 'express';

import usersController from './controllers/UserController';

const app = express();
const route = Router();

app.use(express.json());

route.get('/', (req: Request, res: Response) => {
    res.json({ message: "Server Running" });
});

app.use(route);
app.use('/users', usersController);

app.listen(3000, () => {
    console.log('--- Running on port 3000 ---');
});
