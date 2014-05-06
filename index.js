var es = require('event-stream');
var rs = require('replacestream');
var stream = require('stream');

module.exports = function(search, replacement) {
  var doReplace = function(file, callback) {
    var isRegExp = search instanceof RegExp;
    var isStream = file.contents && typeof file.contents.on === 'function' && typeof file.contents.pipe === 'function';
    var isBuffer = file.contents instanceof Buffer;

    if (isRegExp && isStream) {
      return callback(new Error('gulp-replace: Cannot do regexp replace on a stream'), file);
    }

    if (isStream) {
      file.contents = file.contents.pipe(rs(search, replacement));
      return callback(null, file);
    }

    if (isBuffer) {
      if (isRegExp) {
        file.contents = new Buffer(String(file.contents).replace(search, replacement));
      }
      else {
        var replaceWithString = (typeof replacement === 'function')?replacement():replacement;
        file.contents = new Buffer(String(file.contents).split(search).join(replaceWithString));
      }
      return callback(null, file);
    }

    callback(null, file);
  };

  return es.map(doReplace);
};
