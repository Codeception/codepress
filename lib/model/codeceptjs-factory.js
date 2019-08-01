const path = require('path');

// codepress must be run in testproject dir
const TestProject = process.cwd();

const { config, container, event } = require('codeceptjs');
const Codecept = require('codeceptjs').codecept;

const defaultOpts = { };

// current instance
let instance;

module.exports = new class CodeceptjsFactory {
  constructor() {}

  createConfig() {
    config.load(path.join(TestProject, 'codecept.conf.js'))
    return config.get();
  }

  getInstance() {
    if (!instance) instance = this.create();
    return instance;
  }

  create(cfg = {}, opts = {}) {
    config.reset();
    config.load(path.join(TestProject, 'codecept.conf.js'))
    config.append(cfg);
    cfg = config.get();

    container.clear();
    // create runner
    const codecept = new Codecept(cfg, opts = Object.assign(opts, defaultOpts));
    
    // initialize codeceptjs in current TestProject
    codecept.initGlobals(TestProject);

    
    // create helpers, support files, mocha
    container.create(cfg, opts);

    this.loadRealtimeReporter();

    // load tests
    codecept.loadTests(cfg.tests);
    
    codecept.runHooks();

    this.runWebHooks();

    return {
      codecept, config, container
    }
  }

  loadRealtimeReporter() {
    const RealtimeReporterHelper = require('../codeceptjs/realtime-reporter.helper')
    const reporter = new RealtimeReporterHelper();
    reporter._init();
    container.append({
      helpers: {
        RealtimeReporterHelper: reporter
      }
    });
  }

  runWebHooks() {
    disableTestRetries();
  }

};

function disableTestRetries() {
  event.dispatcher.on(event.test.before, (test) => {
    test.retries(0);
  });
}
