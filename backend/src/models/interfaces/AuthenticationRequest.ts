import { Request } from "express";
import { AuthUser } from "./AuthUser";


export interface AuthenticationRequest extends Request{
    user?: AuthUser

}