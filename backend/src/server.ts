import * as express from 'express';
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';

import usersController from './controllers/UserController';

import { UserService } from './services/UserService';

const app = express();
const route = Router();

app.use(express.json());

route.get('/', (req: Request, res: Response) => {
    res.json({ message: "Server Running" });
});

route.get('/login',[
    body('username').notEmpty().isString().withMessage('Username cannot be empty'),
    body('username').isLength({min: 3}).withMessage('Username minimum size is 3'),
    body('password').notEmpty().withMessage('Password cannot be empty'),
    body('password').isLength({min: 6}).withMessage('Password minimum size is 6')
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(400).json(errors);
    }

    try{
        const userService = new UserService();
        const {username, password} = req.body;

        const result = await userService.getByUsernameAndPassword(username, password);
        if(result){
            const token = jwt.sign({username}, '@123456', { expiresIn: '1m' });
            res.json({token});
        } else{
            res.status(401).json({code: 401, message: 'Unauthorized'});
        }
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }

});

app.use(route);
app.use('/users', usersController);

app.listen(3000, () => {
    console.log('--- Running on port 3000 ---');
});
