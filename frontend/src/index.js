import { Router } from '@vaadin/router';
import './components/login/login';
import './components/register/register-component';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/register', component: 'app-register' }
]

const router = new Router(document.querySelector('#outlet'));
router.setRoutes(routes);