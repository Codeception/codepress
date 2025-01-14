const debug = require('debug')('codepress:get-snapshot-html');
const snapshotStore = require('../model/snapshot-store');

module.exports = (req, res) => {
  const {id} = req.params;

  if (!snapshotStore.exists(id)) {
    debug(`step ${id} does not exist`)
    res.status(404).send(`No step for id ${id}`);
    return;
  }
  if (!snapshotStore.hasSnapshot(id)) {
    debug(`step ${id} does not have a snapshot`)
    res.status(404).send(`No snapshot for step id ${id}`);
    return;
  }

  const source = snapshotStore.get(id).snapshot.source;

  res.send(source);
}