import './toastr-component.scss'

export default class Toastr{
    constructor(){
    }
    
    success(message, title = null){
        this.show(title, message, 'success');
    }
    
    error(message, title = null){
        this.show(title, message, 'error');
    }
    
    warning(message, title = null){
        this.show(title, message, 'warning');
    }
    
    show(title, message, style){
        const container = document.createElement('div');
        container.className = 'toastr-container';
        container.classList.add(style);
        
        const titleEl = document.createElement('h1');
        titleEl.className = 'toastr-title';
        titleEl.textContent = title;
        container.appendChild(titleEl);
        
        const messageEl = document.createElement('p');
        messageEl.className = 'toastr-message';
        messageEl.textContent = message;
        container.appendChild(messageEl);
        
        document.body.appendChild(container);

        setTimeout(() => {
            container.classList.add('fade-in');
        }, 0);

        setTimeout(() => {
            container.classList.remove('fade-in');
            container.classList.remove('fade-out');
            setTimeout(() => {
                document.body.removeChild(container);
            }, 300);
        }, 3000);
    }
}