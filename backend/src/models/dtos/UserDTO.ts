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

    public static toDTO(user: UserDTO){
        return new UserDTO(user.id, user.username, user.firstName, user.lastName);
    }
}