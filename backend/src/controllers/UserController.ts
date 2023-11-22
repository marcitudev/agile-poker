import * as express from 'express';
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { validationResult, check, body } from 'express-validator'
import { UserDTO } from '../models/dtos/UserDTO';
import { AuthenticationRequest } from '../models/interfaces/AuthenticationRequest';

const route = express.Router();

const userService = new UserService();

route.get('/', async (req: Request, res: Response) => {
    const result = await userService.getAllUsers();
    return res.json(result);
});

route.get('/:id', [
    check('id').isNumeric().withMessage('Id should be numeric')
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        const result = await userService.getById(Number.parseInt(req.params.id));
        if(!result) res.status(404).json({code: 404, message: 'Not found'});
        res.json(result); 
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.get('/username/:username', [
    check('username').isLength({min: 3}).withMessage('Username minimum size is 3')
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        const result = await userService.getByUsername(req.params.username);
        if(!result) res.status(404).json({code: 404, message: 'Not found'});
        res.json(result);
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.post('/', [
    body('username').isLength({min: 3, max: 30}).withMessage('Username minimum size is 3 and maximum 30'),
    body('firstName').isLength({min: 3, max: 30}).withMessage('First name minimum size is 3 and maximum 30'),
    body('lastName').isLength({min: 3, max: 30}).withMessage('Last name minimum size is 3 and maximum 30'),
    body('password').isLength({min: 6, max: 20}).withMessage('Password minimum size is 6 and maximum 20')
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    try{
        const existsByUsername = await userService.getByUsername(req.body['username']);
        if(existsByUsername) return res.status(400).json({code: 400, message: 'Username already exists'});

        const result = await userService.create(req.body);
        res.json(result);
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

route.put('/', [
    body('id').isEmpty().withMessage('cannot pass the ID into the body'),
    body('username').optional().isLength({min: 3, max: 30}).withMessage('Username minimum size is 3 and maximum 30'),
    body('firstName').optional().isLength({min: 3, max: 30}).withMessage('First name minimum size is 3 and maximum 30'),
    body('lastName').optional().isLength({min: 3, max: 30}).withMessage('Last name minimum size is 3 and maximum 30')
], async (req: AuthenticationRequest, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try{
        const user: UserDTO | undefined = UserDTO.fromJson(req.body);
        if(!user) return res.status(400).json({ error: 400, message: 'Body cannot empty' })

        if(user.username){
            const existsByUsername = await userService.getByUsername(user.username);
            if(existsByUsername) return res.status(400).json({code: 400, message: 'Username already exists'});
        }

        if(req.user && req.user.id) {
            const result = await userService.update(req.user.id, user);
            res.json(result);
        } else {
            throw new Error();
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }
});

export default route;