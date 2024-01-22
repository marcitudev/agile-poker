import Toastr from "../components/toastr/toastr-component";

export default class BaseService{

    constructor(){
        this.toastrService = new Toastr();
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
                this.toastrService.error('Wait a moment and try again', 'Unexpected error');
                reject(e);
            });
        });
    }
}