import * as express from 'express';
import { Request, Response } from 'express';
import { SprintService } from '../services/SprintService';
import { body, query, validationResult } from 'express-validator';
import { AuthenticationRequest } from '../models/interfaces/AuthenticationRequest';
import { RoomService } from '../services/RoomService';
import { RoomDTO } from '../models/dtos/RoomDTO';

const route = express.Router();

const service = new SprintService();
const roomService = new RoomService();

route.get('/by-room', [
    query('roomId').notEmpty().isNumeric().withMessage('Room id is required and could be numeric')
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        const room: RoomDTO | void = await roomService.getById(Number.parseInt(req.query.roomId as string));
        if(!room) return res.status(404).json({ error: 404, message: 'Room not found' });

        const result = await service.getByRoomId(room.id);
        res.json(result);
    } catch(error) {
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }

});

route.post('/', [
    body('roomId').notEmpty().isNumeric().withMessage('Room id is required and could be numeric'),
    body('name').isLength({min: 3, max: 50}).withMessage('Name minimum size is 3 and maximum 50')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        const room: RoomDTO | void = await roomService.getById(req.body['roomId']);
        if(!room) return res.status(404).json({ error: 404, message: 'Room not found' });
        else if(room.user?.id !== req.user?.id) return res.status(401).json({ error: 401, message: 'You cannot create sprints in this room' });

        const result = await service.create(req.body['name'], room.id);
        res.json(result);
    } catch(error) {
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }

});

route.delete('/', [
    query('id').notEmpty().isNumeric().withMessage('Id is required and could be numeric')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id) {
            const sprintId = Number.parseInt(req.query.id as string);
            const verifySuccess = await verifySprintAuthenticity(sprintId, req);

            if(verifySuccess.success){
                await service.delete(sprintId);
                return res.status(204).json(undefined);
            }
            res.status(<number> verifySuccess.code).json({code: verifySuccess.code, message: verifySuccess.message});
        } else {
            throw new Error();
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.post('/conclude', [
    query('id').notEmpty().isNumeric().withMessage('Id is required and could be numeric')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id) {
            const sprintId = Number.parseInt(req.query.id as string);
            const verifySuccess = await verifySprintAuthenticity(sprintId, req);

            if(verifySuccess.success){
                const result = await service.conclude(sprintId);
                return res.json(result);
            }
            res.status(<number> verifySuccess.code).json({code: verifySuccess.code, message: verifySuccess.message});
        } else {
            throw new Error();
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.put('/change-name', [
    body('id').notEmpty().isNumeric().withMessage('Id is required and could be numeric'),
    body('name').isLength({min: 3, max: 50}).withMessage('Name minimum size is 3 and maximum 50')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id) {
            const sprintId = Number.parseInt(req.body['id'] as string);
            const verifySuccess = await verifySprintAuthenticity(sprintId, req);

            if(verifySuccess.success){
                const result = await service.changeName(sprintId, req.body['name']);
                return res.json(result);
            }
            res.status(<number> verifySuccess.code).json({code: verifySuccess.code, message: verifySuccess.message});
        } else {
            throw new Error();
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

const verifySprintAuthenticity = async (id: number, req: AuthenticationRequest) => {
    const sprint = await service.getById(id);
    if(!sprint) return {success: false, code: 404, message: 'Sprint not found'};

    const room = await roomService.getBySprintId(id);
    if(!room) return {success: false, code: 404, message: 'Room not found'};
    else if(room.user?.id !== req.user?.id) return {success: false, code: 401, message: 'Yout cannot modify or delete this sprint'};

    return {success: true};
}

export default route;

