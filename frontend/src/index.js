import routing from './router';
import './styles/main.scss';
import './components/login/login-component';
import './components/register/register-component';
import './components/home/home-component';
import './components/navbar/navbar-component';
import './components/translation/translation-component';
import TranslateService from './services/translate-service';

const outlet = document.querySelector('#outlet');

const observer = new MutationObserver(() => {
    let navbarEl = document.body.querySelector('app-navbar');

    const element = outlet.firstElementChild;
    if(element?.tagName.toLowerCase() === 'app-login' || element?.tagName.toLowerCase() === 'app-register') {
        if (navbarEl && document.body.contains(navbarEl)) {
            document.body.removeChild(navbarEl);
        }
    } else {
        if(!navbarEl){
            navbarEl = document.createElement('app-navbar');
            document.body.insertBefore(navbarEl, outlet);
        }
    }
});

const config = { childList: true, subtree: false, attributes: false };
observer.observe(outlet, config);

new TranslateService().init();
routing(outlet);