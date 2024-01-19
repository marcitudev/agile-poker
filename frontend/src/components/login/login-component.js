import AuthenticationService from '../../services/authentication-service';
import htmlContent from './login-component.html';
import './login-component.scss';

class Login extends HTMLElement{
    constructor(){
        super();
    }
    
    connectedCallback(){
        this.innerHTML = htmlContent;
        this.service = new AuthenticationService();
        this.submit();
    }

    submit(){
        const formEl = document.querySelector('#login-form');
        const inputsEl = formEl.querySelectorAll('input');

        formEl.addEventListener('submit', (event) => {
            event.preventDefault();

            const authUser = {};
            [...inputsEl].forEach(element => {
                authUser[element.name] = element.value;
            });

            const {username, password} = authUser;
            this.service.authenticate(username, password);
        });
    }
}

customElements.define('app-login', Login);