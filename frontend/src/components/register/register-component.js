import htmlContent from './register-component.html';
import './register-component.css';
import './../../styles/main.css';
import './../../styles/fonts.css';
import './../../styles/form.css';

class Register extends HTMLElement{
    constructor(){
        super();
    }
    
    connectedCallback(){
        this.innerHTML = htmlContent;
    }


}

customElements.define('app-register', Register);