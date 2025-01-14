const debug = require('debug')('codepress:codeceptjs-factory');
const path = require('path');

// codepress must be run in testproject dir

const container = require('codeceptjs').container;
const Codecept = require('codeceptjs').codecept;
const config = require('codeceptjs').config;

const settingsRepository = require('./settings-repository');

const defaultOpts = { };

let TestProject = process.cwd();
// current instance
let instance;

module.exports = new class CodeceptjsFactory {
  constructor(configFile = 'codecept.conf.js') {
    this.configFile = configFile;
  }

  loadCodepressHelpers() {
    debug('Loading helpers...')
    const RealtimeReporterHelper = require('../codeceptjs/realtime-reporter.helper');
    const NetworkRecorderHelper = require('../codeceptjs/network-recorder.helper');
    const ConsoleRecorderHelper = require('../codeceptjs/console-recorder.helper');

    const reporterHelper = new RealtimeReporterHelper();
    const networkHelper = new NetworkRecorderHelper();
    const consoleHelper = new ConsoleRecorderHelper();

    reporterHelper._init(); 
    networkHelper._init();
    consoleHelper._init();

    return {
      helpers: {
        RealtimeReporterHelper: reporterHelper,
        // NetworkRecorderHelper: networkHelper,
        ConsoleRecorderHelper: consoleHelper,
      }
    }
  }

  _getDefaultConfig() {
    const settings = settingsRepository.getSettings();
    return {
      helpers: {
        Puppeteer: {
          show: !settings.headless,
          chrome: {
            devtools: settings.showDevtools,
          }
        }
      }
    }
  }

  getInstance() {
    if (!instance) throw new Error('CodeceptJS is not initialized, initialize it with create()');
    return instance;
  }

  getConfigFile() {
    return this.configFile;
  }

  setConfigFile(configFile) {
    this.configFile = configFile;
  }  

  getRootDir() {
    return TestProject;
  }

  setRootDir(rootDir) {
    TestProject = rootDir;
  }

  create(cfg = {}, opts = {}) {
    debug('Creating codeceptjs instance...', cfg);

    config.reset();
    config.load(this.getConfigFile())
    config.append(cfg);
    cfg = config.get();

    debug('Using CodeceptJS config', cfg);

    container.clear();
    // create runner
    const codecept = new Codecept(cfg, opts = Object.assign(opts, defaultOpts));
   
    // initialize codeceptjs in current TestProject
    codecept.initGlobals(TestProject);

    // create helpers, support files, mocha
    container.create(cfg, opts);

    const rrtConfig = this.loadCodepressHelpers(container);
    container.append(rrtConfig);

    // load tests
    debug('Loading tests...');
    codecept.loadTests();
    
    debug('Running hooks...');
    codecept.runHooks();

    instance = {
      config,
      codecept,
      container,
    }
    return instance;
  }

  unrequireFile(filePath) {
    filePath = path.join(this.getRootDir(), filePath);
    let modulePath;
    try {
      modulePath = require.resolve(filePath);
    } catch (err) {
      return;
    }
    if (require.cache[modulePath]) {
      delete require.cache[modulePath];
    }
  }

  resetSuites() {
    const { container } = this.getInstance();
    const mocha = container.mocha();

    mocha.unloadFiles();  
    mocha.suite.cleanReferences();
    mocha.suite.suites = [];
  }

  reloadSuites() {
    const { container, codecept } = this.getInstance();
    
    const mocha = container.mocha();
    
    this.resetSuites();
    
    // Reload
    mocha.files = codecept.testFiles; 
    mocha.loadFiles();
    
    return mocha.suite.suites;  
  }

  cleanupSupportObject(supportName) {
    const { container, config } = this.getInstance();
    const includesConfig = config.get('include');
    if (!includesConfig[supportName]) return;
    const support = container.support();
    delete support[supportName];
  }

  reloadConfig() {
    const { config, container } = this.getInstance();
    config.reset();
    config.load(this.getConfigFile());  
    config.append(this._getDefaultConfig());
    
    const helpersConfig = config.get('helpers');

    for (const helperName in container.helpers()) {
      if (helpersConfig[helperName]) {
        container.helpers(helperName)._setConfig(helpersConfig[helperName]);
      }
    }
  
    Object.keys(config.get('include')).forEach(s => this.cleanupSupportObject(s));  
    debug('Updated config file. Refreshing...', );
  }

  reloadConfigIfNecessary(filePath) {
    if (filePath === this.getConfigFile()) {
      this.reloadConfig();
    }  
  }

  reloadSupportObjectIfNecessary(filePath) {
    const { config } = this.getInstance();
    // if it is a support object => reinclude it
    Object.entries(config.get('include'))
      .filter(e => e[1] === path.join(this.getRootDir(), filePath))
      .forEach(e => this.cleanupSupportObject(e[0]));
  }
};
