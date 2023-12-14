import { User } from "./User";
import { Sprint } from "./Sprint";
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
    sprints: Array<Sprint>;

    constructor(id: number, name: string, code: string, hostVotes: boolean, 
        cardValueType: CardValueType, user: User, createdAt: Date, password?: string, sprints?: Array<Sprint>){
        this.id = id;
        this.name = name;
        this.code = code;
        this.hostVotes = hostVotes;
        this.cardValueType = cardValueType;
        this.user = user;
        this.createdAt = createdAt;
        this.password = password;
        this.sprints = sprints ? sprints : new Array<Sprint>();
    }
}