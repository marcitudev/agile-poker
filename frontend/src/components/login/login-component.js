import AuthenticationService from '../../services/authentication-service';
import TranslateService from '../../services/component-services/translate-service';
import Toastr from '../toastr/toastr-component';
import htmlContent from './login-component.html';
import './login-component.scss';
import { Router } from '@vaadin/router';

class Login extends HTMLElement{
    constructor(){
        super();
    }
    
    connectedCallback(){
        this.innerHTML = htmlContent;
        this.service = new AuthenticationService();
        this.toastrService = new Toastr();
        this.translateService = new TranslateService();
        this.addTranslation();
        this.submit();
    }

    addTranslation(){
        setTimeout(() => {
            const translationEl = document.createElement('app-translation');
            const loginBoxEl = document.querySelector('.login-box');
            const loginFormEl = document.querySelector('#login-form');
            loginBoxEl.insertBefore(translationEl, loginFormEl);

        }, 100);
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

            const validation = this.validate(authUser);
            if(!validation.username || !validation.password){
                if(!validation.username) this.invalidInput('username');
                if(!validation.password) this.invalidInput('password');
                return;
            }

            const {username, password} = authUser;
            this.service.authenticate(username, password).then(() => {
                Router.go('/home');
            }).catch(e => {
                this.showLoginFailed();
            });
        });
    }

    validate(authUser){
        const usernamePattern = /^[a-zA-Z0-9_\-\.]+$/;
        const passwordPattern = /^[^\s]+$/;
        
        const validation = {
            username: false,
            password: false
        }

        validation.username = 
            authUser.username.length >= 3 
            && authUser.username.length <=30 
            && usernamePattern.test(authUser.username);
        validation.password = 
            authUser.password.length >= 6 
            && authUser.password.length <=20 
            && passwordPattern.test(authUser.password);

        return validation;
    }

    invalidInput(id){
        const element = document.querySelector(`#${id}`);

        element.classList.add('red-border');
        this.disableButtonInErrors();
        setTimeout(() => {
            element.classList.remove('red-border');
        }, 1000)
    }

    showLoginFailed(){
        const toastrTitle = this.translateService.getTranslation('errors.login.login-failed');
        const toastrMessage = this.translateService.getTranslation('errors.login.incorrect-username-or-password');
        this.toastrService.error(toastrMessage, toastrTitle);
        this.disableButtonInErrors();
        setTimeout(() => {
            document.querySelector('#username').value = '';
            document.querySelector('#password').value = '';
        }, 1000);
    }

    disableButtonInErrors(){
        const submitEl = document.querySelector('#submit-btn');
        submitEl.classList.add('invalid-click');
        submitEl.disabled = true;
        setTimeout(() => {
            submitEl.classList.remove('invalid-click');
            submitEl.disabled = false;
        }, 1000);
    }
}

customElements.define('app-login', Login);