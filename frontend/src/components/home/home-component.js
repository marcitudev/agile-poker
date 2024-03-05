import htmlContent from './home-component.html';
import './home-component.scss';
import ModalService from '../../services/component-services/modal-service';
import ModalSize from '../../enums/modal-size';

class Home extends HTMLElement{

    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = htmlContent;
        this.createModal = new ModalService('modal-create-room', ModalSize.MEDIUM, '700px');
        this.createModal.openModal();
        this.openModalToCreateRoom();
    }

    openModalToCreateRoom(){
        const createRoomBtn = document.querySelector('.create-room-btn');
        createRoomBtn.addEventListener('click', () => {
            this.createModal.openModal();
        });
    }
}

customElements.define('app-home', Home);