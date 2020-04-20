/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');
// i18n strings for all supported locales
const languageStrings = require('./languageStrings');
var xpath = require('xpath')
var dom = require('xmldom').DOMParser
const xmlser = require('xmlserializer');
const parse5 = require('parse5');
const fetch = require("node-fetch");
const moment = require('moment-timezone');

const PlayAudioHandler = {
  canHandle(handlerInput) {
    console.log("~~~ PlayAudioHandler#canHandle");

    if (Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest') {
      return true;
    }

    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'PlayAudio'
  },
  handle(handlerInput) {
    console.log("~~~ PlayAudioHandler#handle");
    return controller.play(handlerInput, getAudioDate(handlerInput));
  },
};

const StartPlaybackHandler = {
  canHandle(handlerInput) {
    console.log("~~~ StartPlaybackHandler#canHandle");

    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.ResumeIntent'
  },
  handle(handlerInput) {
    console.log("~~~ StartPlaybackHandler#handle");
    return controller.play(handlerInput, getAudioDate(handlerInput));
  },
};

const PausePlaybackHandler = {
  async canHandle(handlerInput) {
    console.log("~~~ PausePlaybackHandler#canHandle");

    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' &&
      (
        request.intent.name === 'AMAZON.StopIntent' ||
        request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.PauseIntent'
      )
    );
  },
  handle(handlerInput) {
    console.log("~~~ PausePlaybackHandler#handle");
    return controller.stop(handlerInput);
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = handlerInput.t('HELP');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' && (
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = handlerInput.t('GOODBYE');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speakOutput = handlerInput.t('FALLBACK');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = handlerInput.t('REFLECTOR', {intentName: intentName});

    return handlerInput.responseBuilder
      .speak(speakOutput)
      //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
}
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = handlerInput.t('ERROR');
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
    console.log(handlerInput)
    console.log(error)

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

// This request interceptor will bind a translation function 't' to the handlerInput
const LocalisationRequestInterceptor = {
  process(handlerInput) {
    i18n.init({
      lng: Alexa.getLocale(handlerInput.requestEnvelope),
      resources: languageStrings
    }).then((t) => {
      handlerInput.t = (...args) => t(...args);
    });
  }
};

/* HELPER FUNCTIONS */

const controller = {
  async play(handlerInput, date) {
    console.log("~~~ controller#play")

    const audioUrl = await getAudioUrl(date)
    if (audioUrl) {
      handlerInput.responseBuilder
        .speak(
          handlerInput.t('PRE_AUDIO', { date: date.format("dddd, MMMM Do YYYY") })
        )
        .withShouldEndSession(true)
        .addAudioPlayerPlayDirective(
          'REPLACE_ALL',
          audioUrl,
          "0",
          0,
          null
        );
    } else {
      handlerInput.responseBuilder.speak(handlerInput.t('NO_AUDIO'));
    }

    return handlerInput.responseBuilder.getResponse();
  },
  stop(handlerInput) {
    console.log("~~~ controller#stop")

    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

const getAudioDate = (handlerInput) => {
  console.log("~~~ getAudioDate")

  const timezone = await getTimezone(handlerInput)
  let date = moment().tz(timezone);
  if (date.day() === 0 || date.day() === 6) {
    date = date.day(date.day() >= 5 ? 5 : -2);
  }
  return date;
}

const getTimezone = async (handlerInput) => {
  console.log("~~~ getTimezone")

  const serviceClientFactory = handlerInput.serviceClientFactory;
  const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;

  let userTimeZone;
  try {
    const upsServiceClient = serviceClientFactory.getUpsServiceClient();
    userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
  } catch (error) {
    if (error.name !== 'ServiceError') {
      return handlerInput.responseBuilder.speak("There was a problem connecting to the service.").getResponse();
    }
    console.log('error', error.message);
  }
  console.log('userTimeZone', userTimeZone);
  return userTimeZone
}

const getAudioUrl = async (date) => {
  console.log("~~~ getAudioUrl", date)
  try {
    const from = date.format("DD/MM/YYYY");
    const to = date.add(1, 'day').format("DD/MM/YYYY");
    const response = await fetch(`https://api.audioteca.rac1.cat//a-la-carta/cerca?programId=el-mon&sectionId=el-davantal&from=${from}&to=${to}`);
    const text = await response.text()
    const document = parse5.parse(text);
    const xhtml = xmlser.serializeToString(document);
    const doc = new dom().parseFromString(xhtml);
    const select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
    const nodes = select("//x:div[@class=\"audioteca-listed-search\"]//x:ul//x:li/@data-audio-id", doc);
    const audioId = nodes[0].value

    const audioResponse = await fetch(`https://api.audioteca.rac1.cat/piece/audio?id=${audioId}`)
    const json = await audioResponse.json();
    return json.path
  } catch (error) {
    console.log(error);
    return null
  }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    PlayAudioHandler,
    StartPlaybackHandler,
    PausePlaybackHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(
    ErrorHandler
  )
  .addRequestInterceptors(
    LocalisationRequestInterceptor
  )
  .withCustomUserAgent('sample/hello-world/v1.2')
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
