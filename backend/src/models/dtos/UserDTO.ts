export class UserDTO{
    id: number | undefined;
    username: string;
    firstName: string;
    lastName: string;

    constructor(id: number | undefined, username: string, firstName: string, lastName: string){
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public static fromJson(json: Record<string, string>): UserDTO | undefined{
        if(Object.keys(json).length == 0) return undefined;
        const { id, username, firstName, lastName } = json;

        return new UserDTO(id ? Number.parseInt(id) : undefined, username, firstName, lastName);
    }


}