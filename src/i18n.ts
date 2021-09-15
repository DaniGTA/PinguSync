import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

export const SUPPORT_LOCALES = ['en', 'ja']

export function setupI18n(options = { locale: 'en' }) {
    const i18n = createI18n(options)
    setI18nLanguage(i18n, options.locale)
    loadLocaleMessages(i18n, options.locale)
    return i18n
}

export function setI18nLanguage(i18n: any, locale: string) {
    if (i18n.mode === 'legacy') {
        i18n.global.locale = locale
    } else {
        i18n.global.locale.value = locale
    }
}

export async function loadLocaleMessages(i18n: any, locale: string) {
    // load locale messages with dynamic import
    const messages = await import(/* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`)

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default)

    return nextTick()
}
