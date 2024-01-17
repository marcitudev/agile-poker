import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { validationResult, body } from 'express-validator'
import * as jwt from 'jsonwebtoken';
import { AuthenticationRequest } from '../models/interfaces/AuthenticationRequest';
import { AuthUser } from '../models/interfaces/AuthUser';
import * as dotenv from 'dotenv';

dotenv.config();

const route = express.Router();

const userService = new UserService();

type KeyValueTuple = [string, string];
const routesWithoutAuthentication: Array<KeyValueTuple> = [
    ['POST', '/users'],
    ['GET', '/users/username-avaliable']
];

route.post('/login',[
    body('username').isLength({min: 3, max: 30}).withMessage('Username minimum size is 3 and maximum 30'),
    body('password').isLength({min: 6, max: 20}).withMessage('Password minimum size is 6 and maximum 20')
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ erros: errors.array() });

    try{
        const {username, password} = req.body;

        const result = await userService.getByUsernameAndPassword(username, password);
        if(result){
            const token = jwt.sign({id: result.id, username}, <string> process.env.AUTH_SECRET_KEY, { expiresIn: '30m' });
            res.json({token});
        } else res.status(401).json({code: 401, message: 'Unauthorized'});
    } catch(error){
        res.status(500).json({code: 500, message: 'Internal Server Error'});
    }

});

export const verifyToken = (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    if(routesWithoutAuthentication.find(request => request[0] == req.method && request[1] == req.baseUrl)) return next();

    const token: string = req.headers.authorization ? req.headers.authorization : '';

    
    if(token === '') return res.status(403).json({error: 403, message: 'Token not found'});
    
    jwt.verify(token, <string> process.env.AUTH_SECRET_KEY, async (err, decoded) => {
        if(err) return res.status(401).json({error: 401, message: 'Unauthorized'});
        
        if(decoded){
            req.user = <AuthUser> decoded;
            
            const user = await userService.getById(req.user.id);
            if(!user) return res.status(404).json({error: 404, message: 'User not found'});
        }
        next();
    });
}

export default route;