import { API_URL } from '../../enviroment';
import Toastr from '../components/toastr/toastr-component';
import TranslateService from './component-services/translate-service';
import HttpRequest from '../utils/http-request';

export default class AuthenticationService{

    constructor(){
        this.BASE_URL = `${API_URL}authentication`;
        this.translateService = new TranslateService();
        this.toastrService = new Toastr();
    }

    async authenticate(username, password){
        const authUser = {username, password};
        await HttpRequest.request('POST', `${this.BASE_URL}/login`, authUser)
        .then((response) => {
            localStorage.setItem('access-token', response.accessToken);
            localStorage.setItem('refresh-token', response.refreshToken);
        });
    }

    refreshToken(){
        const token = localStorage.getItem('refresh-token');
        HttpRequest.request('POST', `${this.BASE_URL}/refresh-token`, {refreshToken: token})
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
            if(accessToken && accessToken.exp * 1000 > currentTime) {
                resolve();
                return;
            }

            const refreshToken = this.decodeJWT(refresh);
            if(refreshToken && refreshToken.exp * 1000 > currentTime) {
                this.refreshToken();
                resolve();
                return;
            }
            reject();
        });
    }

    get getLoggedUser(){
        const token = localStorage.getItem('access-token');
        return this.decodeJWT(token);
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