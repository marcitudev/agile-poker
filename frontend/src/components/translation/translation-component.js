import htmlContent from './translation-component.html';
import './translation-component.scss';
import brazil from './../../assets/flags/brazil.svg';
import unitedStates from './../../assets/flags/united-states.svg';
import TranslateService from './../../services/translate-service';

export class Translation extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.innerHTML = htmlContent;
        this.translateService = new TranslateService();
        this.languages = [
            {
                initials: 'en-us',
                flag: unitedStates
            },
            {
                initials: 'pt-br',
                flag: brazil
            }
        ];
        this.selectedLanguage();
        this.listLanguages();
    }

    selectedLanguage(){
        const selectedLanguage = localStorage.getItem('language');

        const language = selectedLanguage ? this.languages.find(lang => lang.initials?.toLowerCase() === selectedLanguage?.toLowerCase()) : null;
        if(language) {
            this.setSelectedLanguageImg(language);
        } else {
            this.setDefaultLanguage();
        }
    }

    setDefaultLanguage(){
        localStorage.setItem('language', 'en-us');
        this.setSelectedLanguageImg(this.languages.find(lang => lang.initials === 'en-us'));
        this.translateService.translate();
    }

    setSelectedLanguageImg(language){
        const selectedLanguageEl = document.querySelector('.selected');
        const arrowEl = selectedLanguageEl.querySelector('.arrow');
        let flagImgEl = selectedLanguageEl.querySelector('.flag');

        if(!flagImgEl) {
            flagImgEl = document.createElement('img');
            flagImgEl.classList.add('flag');
            selectedLanguageEl.insertBefore(flagImgEl, arrowEl);
        }

        flagImgEl.src = language.flag;
        flagImgEl.alt = language.initials;
    }

    listLanguages(){
        const languageOptionsEl = document.querySelector('.language-options');
        languageOptionsEl.style.display = 'none';
        this.openAndCloseLanguagesListEvents();

        this.languages.forEach(language => {
            const languageDiv = document.createElement('div');
            languageDiv.setAttribute('lang', language.initials?.toLowerCase());
            this.setTranslationEvent(languageDiv);

            const flagImg = document.createElement('img');
            flagImg.classList.add('flag');
            flagImg.src = language.flag;
            flagImg.alt = language.initials;

            const languageName = document.createElement('span');
            const translationName = this.translateService.getTranslation(`language-names.${language.initials}`);
            languageName.textContent = translationName;
            languageName.setAttribute('translate', `language-names.${language.initials}`);

            languageDiv.appendChild(flagImg);            
            languageDiv.appendChild(languageName);     
            languageOptionsEl.appendChild(languageDiv);     
        });
    }

    openAndCloseLanguagesListEvents(){
        const languageEl = document.querySelector('.language');
        const languageOptionsEl = languageEl.querySelector('.language-options');
        const arrowEl = languageEl.querySelector('.arrow');

        languageEl.addEventListener('click', () => {
            languageOptionsEl.style.display = languageOptionsEl.style.display === 'none' ? 'block' : 'none';
            if(arrowEl.classList.contains('arrow-rotate')) arrowEl.classList.remove('arrow-rotate');
            else arrowEl.classList.add('arrow-rotate');
        });

        document.addEventListener('click', (event) => {
            if (!languageEl.contains(event.target)) {
                languageOptionsEl.style.display = 'none';
                arrowEl.classList.remove('arrow-rotate');
            }
        });
    }

    setTranslationEvent(element){
        element.addEventListener('click', () => {
            const lang = element.getAttribute('lang');
            
            if(!lang){
                this.setDefaultLanguage();
                return;
            }

            const language = this.languages.find(langValue => langValue.initials?.toLowerCase() === lang.toLowerCase());
            
            if(language){
                localStorage.setItem('language', language.initials);
                this.setSelectedLanguageImg(language);
                this.translateService.translate();
            } else {
                this.setDefaultLanguage();
            }
        });
    }
}

customElements.define('app-translation', Translation);