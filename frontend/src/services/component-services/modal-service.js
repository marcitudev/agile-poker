import ModalSize from '../../enums/ModalSize';

export default class ModalService{

    constructor(
        tagName,
        size
    ){
        this.tagName = tagName;
        this.size = size;
    }

    openModal(){
        const modalTemplate = document.createElement('div');
        modalTemplate.className = `${this.tagName}-modal`;

        const modal = document.createElement(this.tagName);
        modal.style.cssText = `
            width: ${this.size || 40}%;
            min-width: 350px;
        `;

        const backdrop = document.createElement('div');
        backdrop.className = 'backdrop';
        backdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        backdrop.addEventListener('click', () => this.closeModal());

        modalTemplate.appendChild(backdrop);
        backdrop.appendChild(modal);

        document.body.appendChild(modalTemplate);
    }

    closeModal(){
        const modalTemplate = document.querySelector(`.${this.tagName}-modal`);
        document.body.removeChild(modalTemplate);
    }

}    