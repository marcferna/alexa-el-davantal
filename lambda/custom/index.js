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
const moment = require('moment');

const getData = async (url, date) => {
  try {
    const from = moment(date).format("DD/MM/YYYY");
    const to = moment(date).add(1, 'day').format("DD/MM/YYYY");
    const response = await fetch(url + `?programId=el-mon&sectionId=el-davantal&from=${from}&to=${to}`);
    const text = await response.text()
    const document = parse5.parse(text);
    const xhtml = xmlser.serializeToString(document);
    const doc = new dom().parseFromString(xhtml);
    const select = xpath.useNamespaces({"x": "http://www.w3.org/1999/xhtml"});
    const nodes = select("//x:div[@class=\"audioteca-listed-search\"]//x:ul//x:li/@data-audio-id", doc);
    const audioId = nodes[0].value
    console.log(audioId)

    const audioResponse = await fetch(`https://api.audioteca.rac1.cat/piece/audio?id=${audioId}`)
    const json = await audioResponse.json();
    const finalUrl = json.path
    console.log("HERE IT COMES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    console.log(finalUrl)
  } catch (error) {
    console.log(error);
  }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('WELCOME_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = "Hola!!!2";

        let date = new Date(2020, 2, 13)
        getData("https://api.audioteca.rac1.cat//a-la-carta/cerca", date);


        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// const AudioPlayerEventHandler = {
//   canHandle(handlerInput) {
//     console.log("~~~~~~~~~~~~~~~~~~~~~ AudioPlayerEventHandler#canHandle ~~~~~~~~~~~~~~")
//     return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
//   },
//   async handle(handlerInput) {
//     console.log("~~~~~~~~~~~~~~~~~~~~~ AudioPlayerEventHandler#handle ~~~~~~~~~~~~~~")
//     const {
//       requestEnvelope,
//       attributesManager,
//       responseBuilder
//     } = handlerInput;
//     const audioPlayerEventName = requestEnvelope.request.type.split('.')[1];
//     const {
//       playbackSetting,
//       playbackInfo
//     } = await attributesManager.getPersistentAttributes();

//     switch (audioPlayerEventName) {
//       case 'PlaybackStarted':
//         playbackInfo.token = getToken(handlerInput);
//         playbackInfo.index = await getIndex(handlerInput);
//         playbackInfo.inPlaybackSession = true;
//         playbackInfo.hasPreviousPlaybackSession = true;
//         break;
//       case 'PlaybackFinished':
//         playbackInfo.inPlaybackSession = false;
//         playbackInfo.hasPreviousPlaybackSession = false;
//         playbackInfo.nextStreamEnqueued = false;
//         break;
//       case 'PlaybackStopped':
//         playbackInfo.token = getToken(handlerInput);
//         playbackInfo.index = await getIndex(handlerInput);
//         playbackInfo.offsetInMilliseconds = getOffsetInMilliseconds(handlerInput);
//         break;
//       case 'PlaybackNearlyFinished':
//         {
//           if (playbackInfo.nextStreamEnqueued) {
//             break;
//           }

//           const enqueueIndex = (playbackInfo.index + 1) % constants.audioData.length;

//           if (enqueueIndex === 0 && !playbackSetting.loop) {
//             break;
//           }

//           playbackInfo.nextStreamEnqueued = true;

//           const enqueueToken = playbackInfo.playOrder[enqueueIndex];
//           const playBehavior = 'ENQUEUE';
//           const podcast = constants.audioData[playbackInfo.playOrder[enqueueIndex]];
//           const expectedPreviousToken = playbackInfo.token;
//           const offsetInMilliseconds = 0;

//           responseBuilder.addAudioPlayerPlayDirective(
//             playBehavior,
//             podcast.url,
//             enqueueToken,
//             offsetInMilliseconds,
//             expectedPreviousToken,
//           );
//           break;
//         }
//       case 'PlaybackFailed':
//         playbackInfo.inPlaybackSession = false;
//         console.log('Playback Failed : %j', handlerInput.requestEnvelope.request.error);
//         return;
//       default:
//         throw new Error('Should never reach here!');
//     }

//     return responseBuilder.getResponse();
//   },
// };

const StartPlaybackHandler = {
  async canHandle(handlerInput) {
    console.log("~~~~~~~~~~~~~~~~~~~~~ StartPlaybackHandler#canHandle ~~~~~~~~~~~~~~");
    // const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    // console.log(playbackInfo, request.type, request.intent.name)
    // if (!playbackInfo.inPlaybackSession) {
    //   return request.type === 'IntentRequest' && request.intent.name === 'PlayAudio';
    // }
    if (request.type === 'PlaybackController.PlayCommandIssued') {
      return true;
    }

    if (request.type === 'IntentRequest') {
      return request.intent.name === 'PlayAudio' ||
        request.intent.name === 'AMAZON.ResumeIntent';
    }
  },
  handle(handlerInput) {
    console.log("~~~~~~~~~~~~~~~~~~~~~ StartPlaybackHandler#handle ~~~~~~~~~~~~~~");
    return controller.play(handlerInput);
  },
};

const PausePlaybackHandler = {
  async canHandle(handlerInput) {
    console.log("~~~~~~~~~~~~~~~~~~~~~ PausePlaybackHandler#canHandle ~~~~~~~~~~~~~~");
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    // console.log(playbackInfo, request.type, request.intent.name)
    return playbackInfo.inPlaybackSession &&
      request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.StopIntent' ||
        request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {
    console.log("~~~~~~~~~~~~~~~~~~~~~ PausePlaybackHandler#handle ~~~~~~~~~~~~~~");
    return controller.stop(handlerInput);
  },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('GOODBYE_MSG');

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
        const speakOutput = handlerInput.t('FALLBACK_MSG');

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
        const speakOutput = handlerInput.t('REFLECTOR_MSG', {intentName: intentName});

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
        const speakOutput = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

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

/* INTERCEPTORS */

// const LoadPersistentAttributesRequestInterceptor = {
//   async process(handlerInput) {
//     const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();

//     // Check if user is invoking the skill the first time and initialize preset values
//     if (Object.keys(persistentAttributes).length === 0) {
//       handlerInput.attributesManager.setPersistentAttributes({
//         playbackSetting: {
//           loop: false,
//           shuffle: false,
//         },
//         playbackInfo: {
//           playOrder: [...Array(constants.audioData.length).keys()],
//           index: 0,
//           offsetInMilliseconds: 0,
//           playbackIndexChanged: true,
//           token: '',
//           nextStreamEnqueued: false,
//           inPlaybackSession: false,
//           hasPreviousPlaybackSession: false,
//         },
//       });
//     }
//   },
// };


/* HELPER FUNCTIONS */

async function getPlaybackInfo(handlerInput) {
  console.log("~~~~~~~~~~~~~~~~~~~~~ getPlaybackInfo ~~~~~~~~~~~~~~");
  const attributes = await handlerInput.attributesManager.getPersistentAttributes();
  console.log(attributes)
  return attributes.playbackInfo;
}

const controller = {
  async play(handlerInput) {
    console.log("~~~~~~~~~~~~~~~~~~~~~ controller#play ~~~~~~~~~~~~~~")
    const {
      attributesManager,
      responseBuilder
    } = handlerInput;

    const playbackInfo = await getPlaybackInfo(handlerInput);
    const {
      playOrder,
      offsetInMilliseconds,
      index
    } = playbackInfo;

    const playBehavior = 'REPLACE_ALL';
    // const podcast = constants.audioData[playOrder[index]];
    const token = playOrder[index];
    playbackInfo.nextStreamEnqueued = false;

    console.log(playbackInfo, playOrder, offsetInMilliseconds, index, token)
    responseBuilder
      .speak("This is El Davantal for date TODO")
      .withShouldEndSession(true)
      .addAudioPlayerPlayDirective(playBehavior, "https://audioserver.rac1.cat/get/4c9c1384-06c3-4388-88ef-a41a69712658/1/2020-03-13-el-mon-a-rac1-el-davantal-empatia-i-responsabilitat.mp3?source=WEB", token, 0, null);

    return responseBuilder.getResponse();
  },
  stop(handlerInput) {
    console.log("~~~~~~~~~~~~~~~~~~~~~ controller#stop ~~~~~~~~~~~~~~")
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

// function getToken(handlerInput) {
//   console.log("~~~~~~~~~~~~~~~~~~~~~ getToken ~~~~~~~~~~~~~~");
//   // Extracting token received in the request.
//   return handlerInput.requestEnvelope.request.token;
// }

// async function getIndex(handlerInput) {
//   console.log("~~~~~~~~~~~~~~~~~~~~~ getIndex ~~~~~~~~~~~~~~")
//   // Extracting index from the token received in the request.
//   const tokenValue = parseInt(handlerInput.requestEnvelope.request.token, 10);
//   const attributes = await handlerInput.attributesManager.getPersistentAttributes();

//   console.log(tokenValue, attributes)
//   return attributes.playbackInfo.playOrder.indexOf(tokenValue);
// }

// function getOffsetInMilliseconds(handlerInput) {
//   console.log("~~~~~~~~~~~~~~~~~~~~~ getOffsetInMilliseconds ~~~~~~~~~~~~~~")
//   // Extracting offsetInMilliseconds received in the request.
//   return handlerInput.requestEnvelope.request.offsetInMilliseconds;
// }

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
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
  .lambda();
