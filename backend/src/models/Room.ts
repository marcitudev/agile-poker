import { CardValueType } from "./enums/CardValueType";

export class Room{
    id: number;
    name: string;
    code: string;
    hostVotes: boolean;
    cardValueType: CardValueType;
    createdAt: Date;
    password: string | undefined;

    constructor(id: number, name: string, code: string, hostVotes: boolean, 
        cardValueType: CardValueType, createdAt: Date, password?: string){
        this.id = id;
        this.name = name;
        this.code = code;
        this.hostVotes = hostVotes;
        this.cardValueType = cardValueType;
        this.createdAt = createdAt;
        this.password = password;
    }
}