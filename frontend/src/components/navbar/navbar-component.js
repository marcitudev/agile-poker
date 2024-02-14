import AuthenticationService from '../../services/authentication-service';
import TranslateService from '../../services/translate-service';
import htmlContent from './navbar-component.html';
import './navbar-component.scss';
import { Router } from '@vaadin/router';

export class Navbar extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = htmlContent;
        this.authenticationService = new AuthenticationService();
        this.translateService = new TranslateService();
        this.showUsername();
        this.openAndCloseProfileOptions();
        this.addProfileOptionsEvents();
        this.translateService.translate();
    }

    showUsername(){
        const authUser = this.authenticationService.getLoggedUser;
        if(authUser){
            const usernameEl = document.querySelector('.username');
            usernameEl.textContent = authUser.username;
        }
    }

    openAndCloseProfileOptions(){
        const profileEl = document.querySelector('.profile-img');
        const profileOptionsEl = profileEl.querySelector('.profile-options');
        profileOptionsEl.style.display = 'none';

        profileEl.addEventListener('click', () => {
            const display = profileOptionsEl.style.display;
            profileOptionsEl.style.display = display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (event) => {
            if(!profileEl.contains(event.target)){
                profileOptionsEl.style.display = 'none';
            }
        });
    }

    addProfileOptionsEvents(){
        const logoutEl = document.querySelector('.logout');

        logoutEl.addEventListener('click', () => {
            this.authenticationService.clearToken();
            Router.go('/login');
        });
    }
}

customElements.define('app-navbar', Navbar);