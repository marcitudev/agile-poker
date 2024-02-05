import Toastr from "../components/toastr/toastr-component";
import HttpRequest from "../utils/http-request";
import AuthenticationService from "./authentication-service";
import TranslateService from "./translate-service";
import { Router } from "@vaadin/router";

export default class BaseService{

    constructor(){
        this.toastrService = new Toastr();
        this.translateService = new TranslateService();
        this.authenticationService = new AuthenticationService();
    }

    get(url, params = {}){
        return this.request('GET', url, params);
    }

    post(url, params = {}){
        return this.request('POST', url, params);
    }
    
    put(url, params = {}){
        return this.request('PUT', url, params);
    }

    delete(url, params = {}){
        return this.request('DELETE', url, params);
    }

    request(method, url, params = {}){
        this.authenticationService.verifyTokenExpiration().then(() => {
            return HttpRequest.request(method, url, params);
        }).catch(() => Router.go('/login'));
    }
}