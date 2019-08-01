const codeceptjsFactory = require('../model/codeceptjs-factory');
const chokidar = require('chokidar');
const path = require('path');

let watchFileChanges;

const WS_URL = 'http://localhost:3000';

module.exports = (req, res) => {
  const { codecept, config, container } = codeceptjsFactory.getInstance();

  const mocha = container.mocha();
  mocha.files = codecept.testFiles; 
  mocha.loadFiles();

  watchFileChanges();

  const features = [];

  for (const suite of mocha.suite.suites) {
    const feature = {
      feature: {
        title: suite.title, 
        tags: suite.tags,
        orgTitle: suite.title,
      },
      file: suite.file,
      scenarios: [],
    };

    for (const test of suite.tests) {
      feature.scenarios.push({
        title: test.title,
        tags: test.tags,
        orgTitle: test.fullTitle(),
      })
    }

    features.push(feature);
  }

  res.send({
    name: config.get('name'),
    features
  });

  function watchFileChanges() {
    const socket = require('socket.io-client')(WS_URL);

    // does not handle deleted files... yet...
    chokidar.watch(path.join(codecept_dir, config.get('tests')), {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
      console.log('Changed ', path);
      codecept.loadTests();
      mocha.files = codecept.testFiles; 
      mocha.loadFiles();
  
      mocha.suite.suites
        .filter((suite) => suite.file === path)
        .forEach((suite) => {
          const scenarios = [];
          for (const test of suite.tests) {
            scenarios.push({
              title: test.title,
              tags: test.tags,
              orgTitle: test.fullTitle(),
            });
          }
  
          // sending updated scenarios
          socket.emit('codeceptjs.scenarios', [
            { 
              feature: {
                title: suite.title, 
                tags: suite.tags,
                orgTitle: suite.title,
              },
              file: suite.file,          
              scenarios,
            }
          ]);
        }
      );
    });  
  }
}
