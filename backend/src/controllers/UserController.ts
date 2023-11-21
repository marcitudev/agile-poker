import * as express from 'express';
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { validationResult, check } from 'express-validator'

const route = express.Router();

const userService = new UserService();

route.get('/', async (req: Request, res: Response) => {
    const result = await userService.getAllUsers()
    res.json(result);
});

route.get('/:id', [
    check('id').isNumeric().withMessage('Id should be numeric')
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const result = await userService.getById(Number.parseInt(req.params.id)).catch(() => {
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    });
    if(!result){
        res.status(404).json({code: 404, message: 'Not found'});
    }
    res.json(result);
});

route.get('/username/:username', [
    check('username').isLength({min: 3}).withMessage('Username minimum size is 3')
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await userService.getByUsername(req.params.username).catch(error => {
        console.error(error);
    });
    if(!result){
        res.status(404).json({code: 404, message: 'Not found'});
    }
    res.json(result);
});

export default route;