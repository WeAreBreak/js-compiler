/**
 * WhiteSpace Character Processor for the CellScript Tokenizer
 */

var constants = {
    whiteSpaceCharacters: "\u0009\u000B\u000C\u0020\u00A0\uFEFF\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u000A\u000D\u2028\u2029",
    lineTerminatorCharacters: "\u000A\u000D\u2028\u2029",
    CR: "\u000D",
    LF: "\u000A"
};

var validators = {
    isWhiteSpace: function (state) { return (constants.whiteSpaceCharacters.indexOf(state.char) !== -1) },
    isLineTerminator: function (state) { return (constants.lineTerminatorCharacters.indexOf(state.char) !== -1) },
    isCRLF: function(state) { return (state.char === constants.CR && state.lookahead === constants.LF) }
};

module.exports = {
    name: "whitespace",

    canProcess: function(state) {
        return validators.isWhiteSpace(state);
    },

    process: function (state) {
        if(validators.isLineTerminator(state)) {
            if(validators.isCRLF(state)) state.next(); //Process <CR><LF> as a single character.

            if(!state.newLine()) {
                //Automatic semicolon insertion for non-terminal keywords.
                state.add(";");
                state.token(";");
                state.newLine();
            }
        }
        state.next();
    }
};