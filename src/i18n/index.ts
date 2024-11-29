import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultLanguage, languagesResources } from './config';

// @ts-nocheck
// @ts-ignore
i18n
  // @ts-ignore
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // @ts-ignore
    debug: true,
    resources: languagesResources,
    compatibilityJSON: 'v4',
    fallbackLng: defaultLanguage,

    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
