import htmlContent from './register-component.html';
import './register-component.scss';
import './../../styles/main.scss';

class Register extends HTMLElement{
    constructor(){
        super();
    }
    
    connectedCallback(){
        this.innerHTML = htmlContent;
    }


}

customElements.define('app-register', Register);