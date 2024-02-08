import { API_URL } from "../../enviroment";
import HttpRequest from "../utils/http-request";
import BaseService from "./base-service";

export default class UserService{

    constructor(){
        this.BASE_URL = `${API_URL}users`;
        this.baseService = new BaseService();
    }

    create(user){
        return HttpRequest.request('POST', this.BASE_URL, user);
    }
}