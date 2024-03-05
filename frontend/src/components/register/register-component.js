import htmlContent from './register-component.html';
import './register-component.scss';
import User from './../../models/user'
import UserService from '../../services/user-service';
import Toastr from '../toastr/toastr-component';
import TranslateService from '../../services/component-services/translate-service';
import { Router } from '@vaadin/router';

class Register extends HTMLElement{
    constructor(){
        super();
        this.service = new UserService();
        this.toastrService = new Toastr();
    }
    
    connectedCallback(){
        this.innerHTML = htmlContent;
        this.submit();
        this.translateService = new TranslateService();
        this.formControlsShowValidations();
    }

    formControlsShowValidations(){
        const formEl = document.querySelector('#register-form');
        const inputsEl = formEl.querySelectorAll('input');

        [...inputsEl].forEach(input => {
            const elementValidator = () => {
                const validation = this.elementValidation(input);
                const parentElement = input.parentNode;
                const sisterElements = parentElement.querySelectorAll('small');

                const classNameToValidationKey = {
                    'min-length': 'minLength',
                    'max-length': 'maxLength',
                    'pattern': 'pattern'
                };

                [...sisterElements].forEach(element => {
                    const valid = validation[classNameToValidationKey[element.className]];
                    if(!valid) element.style.display = 'block';
                    else element.style.display = 'none';
                });
            }

            input.addEventListener('keyup', (event) => {
                if(input.name === 'username' && event.key !== 'Enter') this.hideUsernameAlreadyExistsError();
                elementValidator();
            });

            input.addEventListener('focus', () => {
                elementValidator();
            });

            input.addEventListener('blur', () => {
                const parentElement = input.parentNode;
                const sisterElements = parentElement.querySelectorAll('small');

                [...sisterElements].forEach(element => {
                    if(element.id !== 'username-already-exists') element.style.display = 'none';
                });
            });
        });
    }

    submit(){
        const formEl = document.querySelector('#register-form');
        const inputsEl = formEl.querySelectorAll('input');
        formEl.addEventListener('submit', (event) => {
            event.preventDefault();

            const submitEl = document.querySelector('#submit-btn');
            submitEl.disabled = true;
            submitEl.classList.add('loading');

            const invalidInputs = this.findInvalidInputs(inputsEl);
            if(invalidInputs.length > 0) {
                this.invalidSubmitAnimation(invalidInputs);
                return;
            };

            const user = {};
            [...inputsEl].forEach(element => {
                user[element.name] = element.value;
            });
            
            this.service.create(this.buildUser(user)).then(() => {
                const toastrTitle = this.translateService.getTranslation('register.success.registration-completed');
                const toastrMessage = this.translateService.getTranslation('register.success.registered');
                this.toastrService.success(toastrMessage, toastrTitle);
                setTimeout(() => {
                    Router.go('/login');
                }, 4000);
            }).catch(e => this.handlerErrors(e));
        });
    }

    handlerErrors(error){
        switch(error.code){
            case 'ALR_EXT001':
                this.showUsernameAlreadyExistsError();
                break;
            default:
                this.undefinedError();
        }
    }

    undefinedError(){
        const submitEl = document.querySelector('#submit-btn');
        submitEl.classList.remove('loading');
        submitEl.disabled = false;
    }

    showUsernameAlreadyExistsError(){
        const alreadyExistsElement = document.querySelector('#username-already-exists');
        const usernameInput = document.querySelector('#username');
        this.invalidSubmitAnimation([usernameInput]);

        if(alreadyExistsElement) return;
        
        const parentNode = usernameInput.parentElement;

        const alreadyExistsErrorEl = document.createElement('small');
        alreadyExistsErrorEl.id = 'username-already-exists';
        alreadyExistsErrorEl.textContent = this.translateService.getTranslation('register.info.username-already-exists');;
        alreadyExistsErrorEl.style.display = 'block';
        parentNode.appendChild(alreadyExistsErrorEl);
    }

    hideUsernameAlreadyExistsError(){
        const alreadyExistsElement = document.querySelector('#username-already-exists');
        if(!alreadyExistsElement) return;

        alreadyExistsElement.parentElement.removeChild(alreadyExistsElement);
    }

    invalidSubmitAnimation(invalidInputs){
        const emphasisInvalidInput = () => {
            [...invalidInputs].forEach(input => {
                !input.classList.contains('red-border') ? input.classList.add('red-border') : input.classList.remove('red-border');
            });
        }

        const submitEl = document.querySelector('#submit-btn');
        submitEl.classList.remove('loading');
        submitEl.classList.add('invalid-click');
        submitEl.disabled = true;
        emphasisInvalidInput();
        setTimeout(() => {
            submitEl.classList.remove('invalid-click');
            submitEl.disabled = false;
            emphasisInvalidInput();
        }, 1000);
    }

    findInvalidInputs(inputsEl){
        const invalidElements = [];
        [...inputsEl].forEach(element => {
            const validation = this.elementValidation(element);
            if(!validation.minLength || !validation.maxLength || !validation.pattern) invalidElements.push(element);
        });

        return invalidElements;
    }

    elementValidation(element){
        const validation = {
            minLength: false,
            maxLength: false,
            pattern: false
        }

        const value = element.value.trim();

        validation.minLength = value.length >= element.minLength;
        validation.maxLength = validation.minLength && value.length <= element.maxLength;
        validation.pattern = this.patternValidation(element);

        return validation;
    }

    patternValidation(element){
        const regex = {
            username: /^[a-zA-Z0-9_\-\.]+$/,
            firstName: /^\p{L}[\p{L} ]*\p{L}$/u,
            lastName: /^\p{L}[\p{L} ]*\p{L}$/u,
            password: /^[^\s]+$/
        }

        const value = element.value;
        const regexByName = regex[element.name];
        return regexByName && regexByName.test(value);
    }

    buildUser(user){
        return new User(user.id, user.username, user.firstName, user.lastName, user.password);
    }

}

customElements.define('app-register', Register);