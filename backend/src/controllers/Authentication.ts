import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { validationResult, body } from 'express-validator'
import * as jwt from 'jsonwebtoken';

const route = express.Router();

const userService = new UserService();

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

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.headers.authorization ? req.headers.authorization : '';

    if(token === '') return res.status(403).json({error: 403, message: 'Token not found'});

    jwt.verify(token, '@123456', (err, decoded) => {
        if(err) return res.status(401).json({error: 401, message: 'Unauthorized'});
        

        req.body.user = decoded;
        next();
    });
}

export default route;