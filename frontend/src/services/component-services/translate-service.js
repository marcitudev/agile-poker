import pt_br from '../../assets/translate/pt-br.json';
import en_us from '../../assets/translate/en-us.json';

export default class TranslateService{

    constructor(){}

    init(){
        const observer = new MutationObserver(() => {
            this.translate();
        });
            
        const config = { childList: true, subtree: true, attributes: false };
        observer.observe(document, config);
    }

    translate(){
        const elements = document.querySelectorAll('[translate]');
        this.translateElements(elements);
    }
    
    translateElements(elements){
        [...elements].forEach(element => {
            const translationKey = element.getAttribute('translate');
            const translation = this.getTranslation(translationKey);
            
            if(translation && typeof translation === 'string') this.setTranslation(element, translation);
            else this.setTranslation(element, '-- Translation not found --');
        });
    }

    setTranslation(element, translation){
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
        return parentTranslation ? this.childTranslation(splitTranslationKey, parentTranslation) : undefined;
    }

    childTranslation(splitTranslationKey, parentTranslation){
        const key = splitTranslationKey.shift();
        const translation = parentTranslation[key];

        if(typeof translation === 'object' && splitTranslationKey.length > 0) return this.childTranslation(splitTranslationKey, translation);
        return translation;
    }
    
    get(key){
        const translationFile = this.getTranslationFile();
        return translationFile[key];
    }

    getTranslationFile(){
        const language = localStorage.getItem('language');
        switch(language?.toLowerCase()){
            case 'pt-br':
                return pt_br;
            case 'en-us':
            default:
                return en_us;
        }
    }
}
