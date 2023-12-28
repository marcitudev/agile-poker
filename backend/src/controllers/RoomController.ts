import * as express from 'express';
import {Request, Response} from 'express';
import { RoomService } from '../services/RoomService';
import { AuthenticationRequest } from '../models/interfaces/AuthenticationRequest';
import { validationResult, body } from 'express-validator';
import { UserService } from '../services/UserService';
import { CardValueType } from '../models/enums/CardValueType';
import { CardValueTypeHelper } from '../helpers/CardValueTypeHelper';

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
    body('cardValueType').isIn(Object.values(CardValueType)).withMessage('Valid card value type is required'),
    body('password').optional().isLength({min: 3, max: 20}).withMessage('Password minimum size is 3 and maximum 30'),
    body('cardValues').custom((value, {req}) => {
        const cardValueType = CardValueTypeHelper.getOrdinal(req.body['cardValueType']);
        if(cardValueType !== CardValueType['CUSTOM']) return true;
        else if(cardValueType === CardValueType['CUSTOM'] && Array.isArray(value) && value.every(element => typeof element === 'number' && Number.isInteger(element)) && value.length >= 5) return true;
        throw new Error('When the room card values are CUSTOM, the custom card values are mandatory and must be an array with 5 or more integer numeric elements.');
    })
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
    body('password').optional().isLength({min:3, max:20}).withMessage('Password minimum size is 3 and maximum 20')
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

route.delete('/', [
    body('id').isNumeric().withMessage('Id is required and should be numeric'),
    body('password').optional().isLength({min:3, max:20}).withMessage('Password minimum size is 3 and maximum 20')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        const room = await roomService.getById(req.body['id']);
        if(!room) return res.status(404).json({error: 404, message: 'Room not found'});
    
        const roomByIdAndPassword = await roomService.getByIdAndPassword(room.id, req.body['password']);
        if(!roomByIdAndPassword) return res.status(400).json({error: 400, message: 'Invalid password'});
    
        if(room.user?.id == req.user?.id) {
            await roomService.delete(room.id, req.body['password']);
        } else {
            return res.status(401).json({error: 401, message: 'You cannot delete this room'})
        }

        res.status(204).json();
    } catch(error) {
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

export default route;
