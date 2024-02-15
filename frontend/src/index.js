import routing from './router';
import { handlerNavbar } from './app-setup';
import './styles/main.scss';
import './components/login/login-component';
import './components/register/register-component';
import './components/home/home-component';
import './components/navbar/navbar-component';
import './components/translation/translation-component';
import TranslateService from './services/translate-service';

const outlet = document.querySelector('#outlet');

new TranslateService().init();
routing(outlet);
handlerNavbar(outlet);