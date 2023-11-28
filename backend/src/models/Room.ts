import { User } from "./User";
import { CardValueType } from "./enums/CardValueType";

export class Room{
    id: number;
    name: string;
    code: string;
    hostVotes: boolean;
    cardValueType: CardValueType;
    user: User;
    createdAt: Date;
    password: string | undefined;

    constructor(id: number, name: string, code: string, hostVotes: boolean, 
        cardValueType: CardValueType, user: User, createdAt: Date, password?: string){
        this.id = id;
        this.name = name;
        this.code = code;
        this.hostVotes = hostVotes;
        this.cardValueType = cardValueType;
        this.user = user;
        this.createdAt = createdAt;
        this.password = password;
    }
}