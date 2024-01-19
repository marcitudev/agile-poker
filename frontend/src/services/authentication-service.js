import { API_URL } from "../../enviroment";
import BaseService from "./base-service";

export default class AuthenticationService{

    constructor(){
        this.BASE_URL = `${API_URL}authentication`;
        this.baseService = new BaseService();
    }

    authenticate(username, password){
        const authUser = {username, password};
        return this.baseService.post(`${this.BASE_URL}/login`, authUser);
    }
}