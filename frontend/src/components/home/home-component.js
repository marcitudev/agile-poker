import htmlContent from './home-component.html';
import './home-component.scss';

class Home extends HTMLElement{

    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = htmlContent;
    }
}

customElements.define('app-home', Home);