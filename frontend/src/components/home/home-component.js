import htmlContent from './home-component.html';
import './home-component.scss';
import ModalService from '../../services/component-services/modal-service';
import ModalSize from '../../enums/ModalSize';

class Home extends HTMLElement{

    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = htmlContent;
        this.createModal = new ModalService('app-create-room', ModalSize.SMALL);
        this.createModal.openModal();
    }
}

customElements.define('app-home', Home);