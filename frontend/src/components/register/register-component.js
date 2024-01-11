import htmlContent from './register-component.html';
import './register-component.scss';
import './../../styles/main.scss';
import User from './../../models/user'

class Register extends HTMLElement{
    constructor(){
        super();
    }
    
    connectedCallback(){
        this.innerHTML = htmlContent;
        this.submit();
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

            input.addEventListener('keyup', () => {
                elementValidator();
            });

            input.addEventListener('focus', () => {
                elementValidator();
            });

            input.addEventListener('blur', () => {
                const parentElement = input.parentNode;
                const sisterElements = parentElement.querySelectorAll('small');

                [...sisterElements].forEach(element => element.style.display = 'none');
            });
        });
    }

    submit(){
        const formEl = document.querySelector('#register-form');
        const inputsEl = formEl.querySelectorAll('input');
        formEl.addEventListener('submit', (event) => {
            event.preventDefault();
            if(!this.formValidation(inputsEl)) {
                this.invalidSubmitAnimation();
                return;
            };
            const user = {};
            [...inputsEl].forEach(element => {
                user[element.name] = element.value;
            });
            
        });
    }

    invalidSubmitAnimation(){
        const submitEl = document.querySelector('#submit-btn');
        submitEl.classList.add('invalid-click');
        setTimeout(() => {
            submitEl.classList.remove('invalid-click');
        }, 600);
    }

    formValidation(inputsEl){
        return [...inputsEl].every(element => {
            const validation = this.elementValidation(element);
            return validation.minLength && validation.maxLength && validation.pattern;
        });
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