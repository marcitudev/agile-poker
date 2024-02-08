import Toastr from "../components/toastr/toastr-component";
import TranslateService from "../services/translate-service";

export default class HttpRequest{
    constructor(){}

    static request(method, url, params = {}){
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

            const accessToken = localStorage.getItem('access-token');
            if(accessToken) request.headers['Authorization'] = localStorage.getItem('access-token');

            fetch(url, request).then(response => {
                response.json().then(data => {
                    if(!response.ok){
                        reject(data);
                    }
                    resolve(data);
                })
            }).catch(e => {
                const translateService = new TranslateService();
                const toastrService = new Toastr();

                const title = translateService.getTranslation('errors.unexpected.title');
                const message = translateService.getTranslation('errors.unexpected.message');
                toastrService.error(message, title);
                reject(e);
            });
        });
    }
}