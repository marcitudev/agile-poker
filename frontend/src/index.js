import { Router } from '@vaadin/router';
import './components/login/login';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: 'app-login' }
]

const router = new Router(document.querySelector('#outlet'));
router.setRoutes(routes);