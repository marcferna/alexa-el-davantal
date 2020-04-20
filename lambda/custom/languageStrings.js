/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
  en: {
    translation: {
      PRE_AUDIO: 'Here you have today\'s El Davantal.',
      NO_AUDIO: 'Sorry, I can\'t find today\'s episode of El Davantal, please try again later.',
      HELP: 'How can I help? You can say play to me!',
      GOODBYE: 'Goodbye!',
      REFLECTOR: 'You just triggered {{intentName}}',
      FALLBACK: 'Sorry, I don\'t know about that. Please try again.',
      ERROR: 'Sorry, I had trouble doing what you asked. Please try again.',
      FETCHING_AUDIO: 'Looking for today\'s episode of El Davantal',
    }
  },
  es: {
    translation: {
      PRE_AUDIO: 'Aqui tienes El Davantal de hoy.',
      NO_AUDIO: 'Lo siento, no he encontrado El Davantal de hoy todavía, prueba más tarde.',
      HELP: 'Cómo te puedo ayudar? Puedes decirme reproduce!',
      GOODBYE: 'Hasta luego!',
      REFLECTOR: 'Acabas de activar {{intentName}}',
      FALLBACK: 'Lo siento, no se nada sobre eso. Por favor inténtalo otra vez.',
      ERROR: 'Lo siento, ha habido un error. Por favor inténtalo otra vez.',
      FETCHING_AUDIO: 'Buscando el episodio de hoy de El Davantal.',
    }
  }
}
