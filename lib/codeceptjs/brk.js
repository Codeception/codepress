const container = require('codeceptjs').container;
const store = require('codeceptjs').store;
const recorder = require('codeceptjs').recorder;
const event = require('codeceptjs').event;
const output = require('codeceptjs').output;
const methodsOfObject = require('codeceptjs/lib/utils').methodsOfObject;
const wsEvents = require('../model/ws-events');

// const readline = require('readline');
const colors = require('chalk');
// let rl;
let nextStep;
let finish;
let next;

let socket

/**
 * Pauses test execution and starts interactive shell
 */
const pause = function () {
  next = false;
  // add listener to all next steps to provide next() functionality
  event.dispatcher.on(event.step.after, () => {
    recorder.add('Start next pause session', () => {
      if (!next) return;
      return pauseSession();
    });
  });
  recorder.add('Start new session', pauseSession);
};

function pauseSession() {
  recorder.session.start('pause');
  if (!next) {
    const I = container.support('I');
    wsEvents.cli.start({ 
      prompt: 'Interactive shell started',
      commands: methodsOfObject(I)
    });
    output.print(colors.yellow('Remote Interactive shell started'));
  }

  wsEvents.cli.onLine(parseInput);
  wsEvents.cli.onClose(() => {
    if (!next) console.log('Exiting interactive shell....');
  })

  return new Promise(((resolve) => {
    finish = resolve;
    return askForStep();
  }));
}

function parseInput(cmd) {
  console.log('CMD', cmd);
  // rl.pause();
  next = false;
  store.debugMode = false;
  if (cmd === '') next = true;
  if (!cmd || cmd === 'resume' || cmd === 'exit') {
    finish();
    recorder.session.restore();
    wsEvents.cli.stop();
    // socket.close();
    // rl.close();
    return nextStep();
  }
  store.debugMode = true;
  try {
    const locate = global.locate; // enable locate in this context
    const I = container.support('I');

    const fullCommand = `I.${cmd}`;
    eval(fullCommand); // eslint-disable-line no-eval

  } catch (err) {
    wsEvents.cli.error({ message: err.cliMessage ? err.cliMessage() : err.message });
    output.print(output.styles.error(' ERROR '), err.message);
  }
  recorder.session.catch((err) => {
    const msg = err.cliMessage ? err.cliMessage() : err.message;
    wsEvents.cli.error({ message: msg });
    return output.print(output.styles.error(' FAIL '), msg);
  });
  recorder.add('ask for next step', askForStep);
  nextStep();
}

function askForStep() {
  return new Promise(((resolve) => {
    nextStep = resolve;
    // rl.setPrompt(' I.', 3);
    // rl.resume();
    // rl.prompt();
    wsEvents.cli.continue();
  }));
}

module.exports = pause;
