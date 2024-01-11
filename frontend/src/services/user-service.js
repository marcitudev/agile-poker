import { API_URL } from "../../enviroment";
import BaseService from "./base-service";

export default class UserService{

    constructor(){
        this.BASE_URL = `${API_URL}users`;
        this.baseService = new BaseService();
    }


    create(user){
        return this.baseService.post(this.BASE_URL, user);
    }
}