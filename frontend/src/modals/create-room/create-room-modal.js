import htmlContent from './create-room-modal.html';
import './create-room-modal.scss';

class CreateRoom extends HTMLElement{

    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = htmlContent;
    }

}

customElements.define('app-create-room', CreateRoom);