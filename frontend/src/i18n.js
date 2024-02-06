import i18next from 'i18next';

export default (language, translations) => {
  i18next
    .init({
      interpolation: { escapeValue: false },
      lng: language,
      resources: {
        [language]: { translation: translations },
      },
    });

  return i18next;
};
