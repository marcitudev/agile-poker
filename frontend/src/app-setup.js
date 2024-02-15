function handlerNavbar(outlet){
    mutationOutlet(outlet);
}

const mutationOutlet = (outlet) => {
    const observer = new MutationObserver(() => {
        let navbarEl = document.body.querySelector('app-navbar');
        
        const element = outlet.firstElementChild;
        const tagName = element?.tagName.toLowerCase();
        if(tagName === 'app-login' || tagName === 'app-register') {
            removeNavbar(navbarEl);
        } else {
            addNavbar(navbarEl, outlet);
        }
    });

    const config = { childList: true, subtree: false, attributes: false };
    observer.observe(outlet, config);
}

function addNavbar(navbarEl, outlet) {
    if(!navbarEl){
        navbarEl = document.createElement('app-navbar');
        document.body.insertBefore(navbarEl, outlet);
    }
}

function removeNavbar(navbarEl){
    if (navbarEl && document.body.contains(navbarEl)) {
        document.body.removeChild(navbarEl);
    }
}

export { handlerNavbar };