var crypto = require('crypto');
var util = require('util');
const {Transform} = require('stream')

function ShaSum(options) {
  // allow use without new
  if (!(this instanceof ShaSum)) {
    return new ShaSum(options);
  }

  // init Transform
  Transform.call(this, options);

  this.digester = crypto.createHash('sha1');
}
util.inherits(ShaSum, Transform);

/* during each chunk, update the digest */
ShaSum.prototype._transform = function (chunk, enc, cb) {
  // if is Buffer use it, otherwise coerce
  var buffer = (Buffer.isBuffer(chunk)) ? chunk : Buffer.from(chunk, enc);
  this.digester.update(buffer); // update hash

  // we are not writing anything out at this
  // time, only at end during _flush
  // so we don't need to call push
  cb();
};

/* at the end, output the hex digest */
ShaSum.prototype._flush = function (cb) {
  this.push(this.digester.digest('hex'));
  cb();
};

module.exports = ShaSum

// // try it out
// var shasum = new ShaSum();
// shasum.pipe(process.stdout); // output to stdout
// shasum.write('hello world\n'); // input line 1
// shasum.write('another line');  // input line 2
// shasum.end();  // finish