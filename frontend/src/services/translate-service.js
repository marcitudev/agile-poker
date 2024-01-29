import translatePtBr from './../assets/translate/pt-br.json';

export default class TranslateService{

    constructor(){}

    init(){
        const outlet = document.querySelector('#outlet');
        const observer = new MutationObserver(() => {
            const translateElements = document.querySelectorAll('[translate]');
            this.translate(translateElements);
        });
        
        const config = { childList: true, subtree: true, attributes: false };
        observer.observe(outlet, config);
    }
    
    translate(translateElements){
        [...translateElements].forEach(element => {
            const translationKey = element.getAttribute('translate');
            const translation = this.getTranslation(translationKey);
            
            if(translation && typeof translation === 'string') this.setTranslate(element, translation);
            else this.setTranslate(element, '-- Translation not found --');
        });
    }

    setTranslate(element, translation){
        switch(element.nodeName){
            case 'INPUT':
                element.setAttribute('placeholder', translation);
                break;
            default:
                element.textContent = translation;
        }
    }

    getTranslation(key){
        const splitTranslationKey = key.split('.');

        if(splitTranslationKey.length === 1) return this.get(key);

        const parentTranslation = this.get(splitTranslationKey.shift());
        return this.childTranslation(splitTranslationKey, parentTranslation);
    }

    childTranslation(splitTranslationKey, parentTranslation){
        const key = splitTranslationKey.shift();
        const translation = parentTranslation[key];

        if(typeof translation === 'object' && splitTranslationKey.length > 0) return this.childTranslation(splitTranslationKey, translation);
        return translation;
    }
    
    get(key){
        return translatePtBr[key];
    }
}
