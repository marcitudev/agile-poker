import * as express from 'express';
import {Request, Response} from 'express';
import { RoomService } from '../services/RoomService';

const route = express.Router();

const roomService = new RoomService();

route.get('/', async (req: Request, res: Response) => {
    const result = await roomService.getAllRooms();
    return res.json(result);
});

export default route;
