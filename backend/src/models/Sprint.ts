export class Sprint{
    id: number;
    name: string;
    createdAt: Date;
    conclusionDate: Date | undefined;

    constructor(id: number, name: string, createdAt: Date, conclusionDate: Date){
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.conclusionDate = conclusionDate;
    }
}