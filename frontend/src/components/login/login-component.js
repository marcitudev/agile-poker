import AuthenticationService from '../../services/authentication-service';
import Toastr from '../toastr/toastr-component';
import htmlContent from './login-component.html';
import './login-component.scss';

class Login extends HTMLElement{
    constructor(){
        super();
    }
    
    connectedCallback(){
        this.innerHTML = htmlContent;
        this.service = new AuthenticationService();
        this.toastrService = new Toastr();
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

            const validation = this.validate(authUser);
            if(!validation.username || !validation.password){
                if(!validation.username) this.invalidInput('username');
                if(!validation.password) this.invalidInput('password');
                return;
            }

            const {username, password} = authUser;
            this.service.authenticate(username, password).then((response) => {
                sessionStorage.setItem('access-token', response.token);
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
        this.toastrService.error('User or password is incorrect', 'Login failed');
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