import { CardValueType } from "./../enums/CardValueType";

export class RoomDTO{
    id: number;
    name: string;
    code: string;
    hostVotes: boolean;
    cardValueType: CardValueType;
    createdAt: Date | undefined;

    constructor(id: number, name: string, code: string, hostVotes: boolean, 
        cardValueType: CardValueType, createdAt?: Date){
        this.id = id;
        this.name = name;
        this.code = code;
        this.hostVotes = hostVotes;
        this.cardValueType = cardValueType;
        this.createdAt = createdAt;
    }
}