import htmlContent from './create-room-modal.html';
import './create-room-modal.scss';
import { SEQUENTIAL } from '../../utils/card-value-type-constants';
import { FIBONACCI } from '../../utils/card-value-type-constants';

class CreateRoom extends HTMLElement{

    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = htmlContent;
        this.togglePassword();
        this.cardValueTypeSelection();
    }

    togglePassword(){
        const passwordToggleEl = document.querySelector('#password-toggle');
        passwordToggleEl.addEventListener('change', (event) => {
            const passwordInputEl = document.querySelector('#password-input');
            passwordInputEl.disabled = event.target.checked ? false : true;
        });
    }

    cardValueTypeSelection(){
        const cardValueTypesEl = document.querySelector('.card-values');
        const cardValueTypesOptionsEl = cardValueTypesEl.querySelectorAll('.card-value-type');

        [...cardValueTypesOptionsEl].forEach(cardValueType => {
            cardValueType.dataset.type = cardValueType.id === 'sequential' ? SEQUENTIAL : FIBONACCI;
            cardValueType.addEventListener('click', () => {
                [...cardValueTypesOptionsEl].map(cardValueTypeEl => cardValueTypeEl.removeAttribute('selected'));
                cardValueType.setAttribute('selected', '');
                const cardValueTypeExample = document.querySelector('#card-value-type-example');
                cardValueTypeExample.innerHTML = cardValueType.dataset.type.replaceAll(',', ' ');
            });
        });
    }

}

customElements.define('modal-create-room', CreateRoom);