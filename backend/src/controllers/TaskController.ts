import * as express from 'express';
import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthenticationRequest } from '../models/interfaces/AuthenticationRequest';
import { RoomService } from '../services/RoomService';
import { SprintService } from '../services/SprintService';
import { TaskService } from '../services/TaskService';
import { TaskStatus } from '../models/enums/TaskStatus';
import { TaskStatusHelper } from '../helpers/TaskStatusHelper';

const route = express.Router();

const roomService = new RoomService();
const sprintService = new SprintService();
const service = new TaskService();

route.post('/', [
    body('sprintId').notEmpty().isNumeric().withMessage('Sprint id is required and could be numeric'),
    body('name').isLength({min: 3, max: 50}).withMessage('Name minimum size is 3 and maximum 50')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id){
            const sprintId = req.body['sprintId'];
    
            const verifySuccess = await verifyTaskAuthenticity(sprintId, req);

            if(verifySuccess.success){
                const result = await service.create(sprintId, req.body['name']);
                return res.json(result);
            }
            res.status(<number> verifySuccess.code).json({code: verifySuccess.code, message: verifySuccess.message});
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.post('/vote', [
    body('id').notEmpty().isNumeric().withMessage('Id is required and could be numeric'),
    body('vote').isNumeric().withMessage('Vote is required and could be numeric')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id){
            const {id, name} = req.body;
    
            const task = await service.getById(id);
            if(!task) return res.status(404).json({error: 404, message: 'Task not found'});

            const room = await roomService.getByTaskId(id);
            if(!room) return res.status(404).json({ error: 404, message: 'Room not found' });
            else if(room.user?.id !== req.user?.id) return res.status(401).json({ error: 401, message: 'You cannot modify tasks in this room' });

            const result = await service.changeName(id, name);
            return res.json(result);
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
        if(req.user && req.user.id){
            const {id, name} = req.body;
    
            const task = await service.getById(id);
            if(!task) return res.status(404).json({error: 404, message: 'Task not found'});

            const room = await roomService.getByTaskId(id);
            if(!room) return res.status(404).json({ error: 404, message: 'Room not found' });
            else if(room.user?.id !== req.user?.id) return res.status(401).json({ error: 401, message: 'You cannot modify tasks in this room' });

            const result = await service.changeName(id, name);
            return res.json(result);
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.put('/change-status', [
    body('id').notEmpty().isNumeric().withMessage('Id is required and could be numeric'),
    body('status').notEmpty().isIn(Object.values(TaskStatus)).withMessage('Valid status required')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id){
            const {id, status} = req.body;
    
            const task = await service.getById(id);
            if(!task) return res.status(404).json({error: 404, message: 'Task not found'});

            const room = await roomService.getByTaskId(id);
            if(!room) return res.status(404).json({ error: 404, message: 'Room not found' });
            else if(room.user?.id !== req.user?.id) return res.status(401).json({ error: 401, message: 'You cannot modify tasks in this room' });

            const taskStatus = TaskStatusHelper.getOrdinal(status);
            const result = await service.changeStatus(id, taskStatus);
            return res.json(result);
        }
    } catch(error){
        return res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.delete('/', [
    body('id').notEmpty().isNumeric().withMessage('Id is required and could be numeric')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id){
            const {id} = req.body;
    
            const task = await service.getById(id);
            if(!task) return res.status(404).json({error: 404, message: 'Task not found'});

            const room = await roomService.getByTaskId(id);
            if(!room) return res.status(404).json({ error: 404, message: 'Room not found' });
            else if(room.user?.id !== req.user?.id) return res.status(401).json({ error: 401, message: 'You cannot delete tasks in this room' });

            await service.delete(id);
            return res.status(204).json();
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

const verifyTaskAuthenticity = async (sprintId: number, req: AuthenticationRequest) => {
    const sprint = await sprintService.getById(sprintId);
    if(!sprint) return {success: false, code: 404, message: 'Sprint not found'};

    const room = await roomService.getBySprintId(sprintId);
    if(!room) return {success: false, code: 404, message: 'Room not found'};
    else if(room.user?.id !== req.user?.id) return {success: false, code: 401, message: 'Yout cannot modify or delete this sprint'};

    return {success: true};
}

export default route;