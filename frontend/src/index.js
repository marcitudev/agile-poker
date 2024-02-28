import routing from './router';
import { handlerNavbar } from './app-setup';
import './styles/main.scss';
import './components/login/login-component';
import './components/register/register-component';
import './components/home/home-component';
import './components/navbar/navbar-component';
import './components/translation/translation-component';
import './modals/create-room/create-room-modal';
import TranslateService from './services/component-services/translate-service';

const outlet = document.querySelector('#outlet');

new TranslateService().init();
routing(outlet);
handlerNavbar(outlet);