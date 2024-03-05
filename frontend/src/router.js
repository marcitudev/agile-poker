import { Router } from '@vaadin/router';
import AuthenticationService from './services/authentication-service';
import TranslateService from './services/component-services/translate-service';
import Toastr from './components/toastr/toastr-component';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: 'app-login', action: (context) => { authGuard(context); } },
    { path: '/register', component: 'app-register', action: (context) => { authGuard(context); }},
    { path: '/home', component: 'app-home', action: (context) => { authGuard(context); }}
]

const routing = (outlet) => {
    const router = new Router(outlet);
    router.setRoutes(routes);
}

const authenticationService = new AuthenticationService();
const translateService = new TranslateService();
const toastrService = new Toastr();
const routesWithoutAuthentication = ['/login', '/register'];
const authGuard = (context) => {
    authenticationService.verifyTokenExpiration().then(() => {
        if(routesWithoutAuthentication.includes(context.pathname)){
            Router.go('/home');
        }
    }).catch(() => {
        if(!routesWithoutAuthentication.includes(context.pathname)){
            const message = translateService.getTranslation('errors.session-expired');
            toastrService.error(message);
            Router.go('/login');
        }
    });
}

export default routing;