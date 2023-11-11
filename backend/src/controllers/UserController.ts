import * as express from 'express';
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

const route = express.Router();

const userService = new UserService();

route.get('/', async (req: Request, res: Response) => {
    const result = await userService.getAllUsers()
    res.json(result);
});

export default route;