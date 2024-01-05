class Login extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback(){
        this.shadowRoot.innerHTML = `
            My login
        `;
    }
}

customElements.define('app-login', Login);