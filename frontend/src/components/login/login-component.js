import htmlContent from './login-component.html';
import './login-component.scss';

class Login extends HTMLElement{
    constructor(){
        super();
    }
    
    connectedCallback(){
        this.innerHTML = htmlContent;
    }
}

customElements.define('app-login', Login);