/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
  en: {
    translation: {
      WELCOME_MSG: 'Welcome, you can say Hello or Help. Which would you like to try?',
      HELLO_MSG: 'Hello World!',
      HELP_MSG: 'You can say hello to me! How can I help?',
      GOODBYE_MSG: 'Goodbye!',
      REFLECTOR_MSG: 'You just triggered {{intentName}}',
      FALLBACK_MSG: 'Sorry, I don\'t know about that. Please try again.',
      ERROR_MSG: 'Sorry, I had trouble doing what you asked. Please try again.'
    }
  },
  es: {
    translation: {
      WELCOME_MSG: 'Bienvenido, puedes decir Hola o Ayuda. Cual prefieres?',
      HELLO_MSG: 'Hola Mundo!',
      HELP_MSG: 'Puedes decirme hola. Cómo te puedo ayudar?',
      GOODBYE_MSG: 'Hasta luego!',
      REFLECTOR_MSG: 'Acabas de activar {{intentName}}',
      FALLBACK_MSG: 'Lo siento, no se nada sobre eso. Por favor inténtalo otra vez.',
      ERROR_MSG: 'Lo siento, ha habido un error. Por favor inténtalo otra vez.'
    }
  }
}
