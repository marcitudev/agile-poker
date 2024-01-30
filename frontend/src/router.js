import { Router } from '@vaadin/router';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: 'app-login' },
    { path: '/register', component: 'app-register' }
]

const routing = (outlet) => {
    const router = new Router(outlet);
    router.setRoutes(routes);
}

export default routing;