import Toastr from "../components/toastr/toastr-component";
import TranslateService from "./translate-service";

export default class BaseService{

    constructor(){
        this.toastrService = new Toastr();
        this.translateService = new TranslateService();
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
        return new Promise((resolve, reject) => {
            let request;
            
            switch(method.toUpperCase()){
                case 'GET':
                    request = {
                        method
                    };
                    break;
                default:
                    request = {
                        method,
                        body: JSON.stringify(params),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
            }

            fetch(url, request).then(response => {
                response.json().then(data => {
                    if(!response.ok){
                        reject(data);
                    }
                    resolve(data);
                })
            }).catch(e => {
                const title = this.translateService.getTranslation('errors.unexpected.title');
                const message = this.translateService.getTranslation('errors.unexpected.message');
                this.toastrService.error(message, title);
                reject(e);
            });
        });
    }
}