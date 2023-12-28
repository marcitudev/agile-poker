import * as express from 'express';
import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthenticationRequest } from '../models/interfaces/AuthenticationRequest';
import { RoomService } from '../services/RoomService';
import { SprintService } from '../services/SprintService';
import { TaskService } from '../services/TaskService';
import { TaskStatus } from '../models/enums/TaskStatus';
import { TaskStatusHelper } from '../helpers/TaskStatusHelper';
import { VoteService } from '../services/VoteService';

const route = express.Router();

const roomService = new RoomService();
const sprintService = new SprintService();
const service = new TaskService();
const voteService = new VoteService();

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
    body('punctuation').isNumeric().withMessage('Punctuation is required and could be numeric')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        if(req.user && req.user.id){
            const {id, punctuation} = req.body;
    
            const task = await service.getById(id);
            if(!task) return res.status(404).json({ error: 404, message: 'Task not found' });
            else if(TaskStatusHelper.getOrdinal(task.status) !== TaskStatus['IN_PROGRESS']) return res.status(400).json({error: 400, message: 'This task is not yet available for votes'});

            const room = await roomService.getByTaskId(id);
            if(!room) return res.status(404).json({ error: 404, message: 'Room not found' });

            const canVote = await voteService.canVote(room.id, req.user.id);
            if(!canVote) return res.status(401).json({ error: 401, message: 'You cannot vote in this room' });

            const voteIsValid = await voteService.isValidVote(room, punctuation);
            if(!voteIsValid) return res.status(400).json({ error: 400, message: 'Vote is invalid' });

            const result = await voteService.vote(req.user.id, id, punctuation);
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
            else if(TaskStatusHelper.getOrdinal(task.status) == TaskStatus['DONE']) return res.status(400).json({ error: 400, message: 'The task has already been completed, you can no longer change the status' });
            else if(Math.abs(TaskStatusHelper.getOrdinal(task.status) - TaskStatusHelper.getOrdinal(status)) > 1) return res.status(400).json({ error: 400, message: 'The status must follow a certain order' });

            const room = await roomService.getByTaskId(id);
            if(!room) return res.status(404).json({ error: 404, message: 'Room not found' });
            else if(room.user?.id !== req.user?.id) return res.status(401).json({ error: 401, message: 'You cannot modify tasks in this room' });

            const taskStatus = TaskStatusHelper.getOrdinal(status);

            const canChangeStatus = await service.canChangeStatus(id, room.id);
            if(!canChangeStatus) return res.status(400).json({ error: 400, message: 'Cannot open this task at the moment, some other task is open' });

            if(taskStatus == TaskStatus['SHOWING_RESULT']) {
                const everyoneVoted = await voteService.everyoneVoted(task.id, room.id, room.hostVotes);
                if(!everyoneVoted) return res.status(400).json({code: 400, message: 'Not everyone voted'});
            } 

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