import { Request } from "express";
import * as jwt from 'jsonwebtoken';


export interface AuthenticationRequest extends Request{
    user?: string | jwt.JwtPayload | undefined

}