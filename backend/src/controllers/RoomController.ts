import * as express from 'express';
import {Request, Response} from 'express';
import { RoomService } from '../services/RoomService';
import { AuthenticationRequest } from '../models/interfaces/AuthenticationRequest';
import { validationResult, body } from 'express-validator';
import { UserService } from '../services/UserService';

const route = express.Router();

const roomService = new RoomService();
const userService = new UserService();

route.get('/', async (req: Request, res: Response) => {
    const result = await roomService.getAllRooms();
    return res.json(result);
});

route.post('/', [
    body('id').isEmpty().withMessage('Cannot pass the ID into the body'),
    body('name').isLength({min: 3, max: 50}).withMessage('Name minimum size is 3 and maximum 30'),
    body('hostVotes').isBoolean().withMessage('Host votes is required'),
    body('cardValueType').isNumeric().withMessage('Card value type is required and should be numeric'),
    body('password').optional().isLength({min: 3, max: 20}).withMessage('Password minimum size is 3 and maximum 30'),
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id) {
            const existsById = await userService.getById(req.user.id);
            if(!existsById) return res.status(400).json({code: 404, message: 'User not found'});
        
            const existsByNameAndUserId = await roomService.getByNameAndUserId(req.body['name'], req.user.id);
            if(existsByNameAndUserId) return res.status(400).json({error: 400, message: 'Room name already exists for this user'});

            const result = await roomService.create(req.user.id, req.body);
            res.status(201).json(result);
        } else {
            throw new Error();
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.get('/my-rooms', async (req: AuthenticationRequest, res: Response) => {
    try{
        if(req.user && req.user.id) {
            const existsById = await userService.getById(req.user.id);
            if(!existsById) return res.status(400).json({code: 404, message: 'User not found'});

            const result = await roomService.getByUserId(req.user.id);
            res.json(result);
        } else {
            throw new Error();
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.post('/enter', [
    body('code').isLength({min:6, max:6}).withMessage('Code is required and size is 6'),
    body('password').optional().isLength({min:3, max:20}).withMessage('Password minimum size is 3 and maximum 30')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        const room = await roomService.getByCode(req.body['code']);
        if(!room) return res.status(404).json({error: 404, message: 'Room not found'});

        const roomByIdAndPassword = await roomService.getByIdAndPassword(room.id, req.body['password']);
        if(!roomByIdAndPassword) return res.status(400).json({error: 400, message: 'Invalid password'});
        
        if(req.user && req.user.id){
            const userCanEnterTheRoom = await roomService.userCanEnterTheRoom(req.user.id, room.id);
            if(!userCanEnterTheRoom) return res.status(400).json({error: 400, message: 'You are already part of this room'});

            await roomService.enterTheRoom(req.user?.id, room.id);
            res.json();
        } else {
            throw new Error();
        }
    } catch(error) {
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

export default route;
