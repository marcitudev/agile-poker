import * as jwt from "jsonwebtoken";

export interface AuthUser extends jwt.JwtPayload{
    id: number | undefined,
    username: string | undefined
}