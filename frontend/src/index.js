import routing from './router';
import './styles/main.scss';
import './components/login/login-component';
import './components/register/register-component';
import TranslateService from './services/translate-service';

new TranslateService().init();
routing(document.querySelector('#outlet'));