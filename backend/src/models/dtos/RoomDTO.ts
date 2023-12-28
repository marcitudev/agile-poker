import { CardValueType } from "./../enums/CardValueType";
import { SprintDTO } from "./SprintDTO";
import { UserDTO } from "./UserDTO";

export class RoomDTO{
    id: number;
    name: string;
    code: string;
    hostVotes: boolean;
    cardValueType: CardValueType;
    user: UserDTO | undefined;
    createdAt: Date | undefined;
    sprints: Array<SprintDTO>;
    cardValues: Array<number>;

    constructor(id: number, name: string, code: string, hostVotes: boolean, 
        cardValueType: CardValueType, user: UserDTO | undefined, createdAt?: Date, sprints?: Array<SprintDTO>, cardValues?: Array<number>){
        this.id = id;
        this.name = name;
        this.code = code;
        this.hostVotes = hostVotes;
        this.cardValueType = cardValueType;
        this.user = user;
        this.createdAt = createdAt;
        this.sprints = sprints ? sprints : new Array<SprintDTO>();
        this.cardValues = cardValues ? cardValues : new Array<number>();
    }
}