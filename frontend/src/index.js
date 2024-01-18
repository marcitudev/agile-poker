import { Router } from '@vaadin/router';
import './styles/main.scss';
import './components/login/login-component';
import './components/register/register-component';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: 'app-login' },
    { path: '/register', component: 'app-register' }
]

const router = new Router(document.querySelector('#outlet'));
router.setRoutes(routes);