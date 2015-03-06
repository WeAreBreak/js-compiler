/**
 * Regular Expression Processor for the CellScript Tokenizer
 */

var constants = {
    startCharacter: '/',
    endCharacter: '/',
    lineTerminators: "\u000A\u000D\u2028\u2029",
    classStart: "[",
    classEnd: "]",
    backslash: "\\",
    commentMarkers: "*/",
    flags: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$ÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜäëïöüçÇßØøÅåÆæÞþÐð\u005F\u203F\u2040\u2054\uFE33\uFE34\uFE4D\uFE4E\uFE4F\uFF3F\u200C\u200D0123456789"
};

var counters = {
    classLevel: 0
};

var utils = {
    start: function(state) {
        state.add();
        state.next();
    },

    body: function(state) {
        while(state.char && !validators.isEnd(state)) {
            if(validators.isClassStart(state)) {
                counters.classLevel++;
                state.add();
                state.next();
            }
            else if(validators.isClassEnd(state)) {
                counters.classLevel--;
                if(counters.classLevel < 0) return state.error("Unexpected token ILLEGAL.");

                state.add();
                state.next();
            }
            else if(validators.isBackslash(state)) {
                state.add();
                state.next();

                if(validators.isLineTerminator(state)) return state.error("Unexpected line terminator.");

                state.add();
                state.next();
            }
            else if(validators.isLineTerminator(state)) {
                return state.error("Unexpected line terminator.");
            }
            else {
                state.add();
                state.next();
            }
        }

        if(state.char) {
            state.add();
            state.next();
        }
    },

    flags: function(state) {
        while(state.char && validators.isFlag(state)) {
            state.add();
            state.next();
        }
    }
};

var validators = {
    isStart: function (state) { return (constants.startCharacter === state.char) },
    isEnd: function (state) { return (constants.endCharacter === state.char && state.lookback !== constants.backslash) },
    isBackslash: function (state) { return (constants.backslash === state.char) },
    isClassStart: function (state) { return (constants.classStart === state.char) },
    isClassEnd: function (state) { return (constants.classEnd === state.char) },
    isFlag: function(state) { return (constants.flags.indexOf(state.char) !== -1)},
    isLineTerminator: function(state) { return (constants.lineTerminators.indexOf(state.char) !== -1)},
    isLookaheadCommentMarker: function(state) { return (constants.commentMarkers.indexOf(state.lookahead) !== -1)},
    isRegularExpression: function(state) { return validators.isStart(state) && !validators.isLookaheadCommentMarker(state) }
};

module.exports = {
    name: "regexp",

    canProcess: function(state) {
        return validators.isRegularExpression(state);
    },

    process: function (state) {
        utils.start(state);
        utils.body(state);
        utils.flags(state);

        if(counters.classLevel !== 0) return state.error("Unexpected end of regular expression.");

        state.token("literal", "regexp");
    }
};