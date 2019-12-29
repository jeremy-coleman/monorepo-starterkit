var aparse = require('acorn-node').parse;

function parse (src, opts) {
    if (!opts) opts = {}
    return aparse(src, opts);
}

function syntaxError(src, file,opts) {
    if (typeof src !== 'string') src = String(src);
    
    try {
        eval('throw "STOP"; (function () { ' + src + '\n})()');
        return;
    }
    catch (err) {
        if (err === 'STOP') return undefined;
        if (err.constructor.name !== 'SyntaxError') return err;
        return errorInfo(src, file, opts);
    }
};

function errorInfo (src, file, opts) {
    try { parse(src,opts) }
    catch (err) {
        return new ParseError(err, src, file);
    }
    return undefined;
}


class ParseError extends SyntaxError {
    constructor(err, src, file){
        super(...arguments)

        this.message = err.message.replace(/\s+\(\d+:\d+\)$/, '');
    
        this.line = err.loc.line;
        this.column = err.loc.column + 1;
        
        this.annotated = '\n'
            + (file || '(anonymous file)')
            + ':' + this.line
            + '\n'
            + src.split('\n')[this.line - 1]
            + '\n'
            + Array(this.column).join(' ') + '^'
            + '\n'
            + 'ParseError: ' + this.message
        ;
    }

    toString = () => this.annotated;
    inspect = () => this.annotated;
}



module.exports = syntaxError
module.exports.syntaxError = syntaxError