import AuthenticationService from '../../services/authentication-service';
import htmlContent from './navbar-component.html';
import './navbar-component.scss';

export class Navbar extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = htmlContent;
        this.authenticationService = new AuthenticationService();
        this.showUsername();
    }

    showUsername(){
        const authUser = this.authenticationService.getLoggedUser;
        if(authUser){
            const usernameEl = document.querySelector('.username');
            usernameEl.textContent = authUser.username;
        }
    }
}

customElements.define('app-navbar', Navbar);