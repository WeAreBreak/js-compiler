/**
 * String Literal Processor for the CellScript Tokenizer
 */

var constants = {
    zeroCharacter: "0",
    nul: "\u0000",
    startEndCharacters: [ "'", '"' ],
    escapeMarker: "\\",
    escapeCharacters: "'\"\\bfnrtv",
    lineTerminators: "\u000A\u000D\u2028\u2029",
    digits: "0123456789",
    hexDigits: "0123456789abcdefABCDEF",
    hexMarker: "x",
    unicodeMarker: "u"
};

var utils = {
    lineContinuation: function(state) {
        while(validators.isLineTerminator(state)) {
            state.next();
        }
    },

    hexEscape: function(state) {
        state.next(); //Skip hex marker.

        var hexValue = "";
        for(var count = 0; count < 2; count++) {
            if (!validators.isHexDigit(state)) return state.error("Unexpected token ILLEGAL.");
            hexValue += state.char;
            state.next();
        }

        state.add('\\x' + hexValue);
    },

    unicodeEscape: function(state) {
        state.next(); //Skip hex marker.

        var hexValue = "";
        for(var count = 0; count < 4; count++) {
            if (!validators.isHexDigit(state)) return state.error("Unexpected token ILLEGAL.");
            hexValue += state.char;
            state.next();
        }

        state.add('\\u' + hexValue);
    },

    string: function(state) {
        var startCharacter = state.char;
        var nonStartCharacter = (startCharacter === '"') ? "'" : '"';

        state.next(); //Skip the marker character.

        while(state.char && !validators.isEnd(startCharacter, state)) {
            if(state.char === nonStartCharacter) {
                state.add(constants.escapeMarker);
                state.add();
                state.next();
            }
            else if(validators.isLineTerminator(state)) {
                return state.error("Unexpected line terminator.");
            }
            else if(validators.isEscapeMarker(state)) {
                state.next();

                if(validators.isLineTerminator(state)) {
                    utils.lineContinuation(state);
                }
                else if(validators.isEscapeCharacter(state)) {
                    state.add(constants.escapeMarker);
                    state.add();
                    state.next();
                }
                else if(validators.isZero(state) && !validators.isLookaheadDecimalDigit(state)) {
                    state.add(constants.nul);
                    state.next();
                }
                else if(validators.isHexMarker(state)) {
                    utils.hexEscape(state);
                }
                else if(validators.isUnicodeMarker(state)) {
                    utils.unicodeEscape(state);
                }
            }
            else {
                state.add();
                state.next();
            }
        }

        state.next(); //Skip the marker character.
    }

};

var validators = {
    isStart: function (state) { return (constants.startEndCharacters.indexOf(state.char) !== -1) },
    isEnd: function(startChar, state) { return (state.char === startChar) },
    isEscapeMarker: function (state) { return state.char === constants.escapeMarker },
    isEscapeCharacter: function(state) { return (constants.escapeCharacters.indexOf(state.char) !== -1) },
    isLineTerminator: function(state) { return (constants.lineTerminators.indexOf(state.char) !== -1) },
    isZero: function(state) { return state.char === constants.zero },
    isHexMarker: function(state) { return state.char === constants.hexMarker },
    isUnicodeMarker: function(state) { return state.char === constants.unicodeMarker },
    isLookaheadDecimalDigit: function(state) { return (constants.digits.indexOf(state.lookahead) !== -1) },
    isHexDigit: function(state) { return (constants.hexDigits.indexOf(state.char) !== -1) }
};

module.exports = {
    name: "string",

    canProcess: function(state) {
        return validators.isStart(state);
    },

    process: function (state) {
        utils.string(state);
        state.token("literal", "string");
    }
};