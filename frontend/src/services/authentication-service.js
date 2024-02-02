import { Router } from "@vaadin/router";
import { API_URL } from "../../enviroment";
import Toastr from "../components/toastr/toastr-component";
import BaseService from "./base-service";
import TranslateService from "./translate-service";

export default class AuthenticationService{

    constructor(){
        this.BASE_URL = `${API_URL}authentication`;
        this.baseService = new BaseService();
        this.translateService = new TranslateService();
        this.toastrService = new Toastr();
    }

    authenticate(username, password){
        return new Promise((resolve, reject) => {
            const authUser = {username, password};

            const request = {
                method: 'POST',
                body: JSON.stringify(authUser),
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            fetch(`${this.BASE_URL}/login`, request).then(response => {
                response.json().then(data => {
                    if(!response.ok){
                        reject(data);
                    }
                    localStorage.setItem('access-token', data.accessToken);
                    localStorage.setItem('refresh-token', data.refreshToken);
                    resolve(data);
                })
            }).catch(e => {
                const title = this.translateService.getTranslation('errors.unexpected.title');
                const message = this.translateService.getTranslation('errors.unexpected.message');
                this.toastrService.error(message, title);
                reject(e);
            });
        })
    }

    refreshToken(){
        const token = localStorage.getItem('refresh-token');
        this.baseService.post(`${this.BASE_URL}/refresh-token`, {'refreshToken': token})
        .then((response) => {
            localStorage.setItem('access-token', response.accessToken);
            localStorage.setItem('refresh-token', response.refreshToken);
        })
        .catch(() => {
            const error = this.translateService.getTranslation('errors.authentication.refresh-token');
            this.toastrService.error(error);
            this.clearToken();
        });
    }

    verifyTokenExpiration(){
        return new Promise((resolve, reject) => {
            const currentTime = new Date().getTime();
            const access = localStorage.getItem('access-token');
            const refresh = localStorage.getItem('refresh-token');

            const accessToken = this.decodeJWT(access);
            if(accessToken && accessToken.exp * 1000 > currentTime) resolve();

            const refreshToken = this.decodeJWT(refresh);
            if(refreshToken && refreshToken.exp * 1000 > currentTime) {
                this.refreshToken();
                resolve();
            }
            reject();
        });
    }

    clearToken(){
        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
    }

    decodeJWT(token){
        try{
            const decoded = JSON.parse(atob(token?.split('.')[1]));
            return decoded;
        } catch(error) {
            return null;
        }
    }
}