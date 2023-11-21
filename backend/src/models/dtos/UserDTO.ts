export class UserDTO{
    id: number;
    username: string;
    firstName: string;
    lastName: string;

    constructor(id: number, username: string, fistName: string, lastName: string){
        this.id = id;
        this.username = username;
        this.firstName = fistName;
        this.lastName = lastName;
    }
}