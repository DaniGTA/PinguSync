import VueI18n from 'vue-i18n';
import de from '../assets/locales/de.json';
import en from '../assets/locales/en.json';
import Vue from 'vue';
export default class LangLoader {
    public static getI18n(): VueI18n {
        Vue.use(VueI18n);
        const translations = {
            de,
            en
        };
        const i18n = new VueI18n({
            locale: 'en',
            fallbackLocale: 'en',
            messages: translations,
        });
        return i18n;
    }
}