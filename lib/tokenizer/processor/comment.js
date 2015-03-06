/**
 * Comment Processor for the CellScript Tokenizer
 */

var constants = {
    commentMarkerCharacter: "/",
    singleLineCommentMarkerCharacter: "/",
    multiLineCommentMarkerCharacter: "*",
    singleLineCommentEndCharacters: "\u000A\u000D\u2028\u2029",
    lineTerminators: "\u000A\u000D\u2028\u2029"
};

var validators = {
    isSingleLineStart: function(char, lookahead) { return char === constants.commentMarkerCharacter && lookahead === constants.singleLineCommentMarkerCharacter },
    isMultiLineStart: function(char, lookahead) { return char === constants.commentMarkerCharacter && lookahead === constants.multiLineCommentMarkerCharacter },
    isSingleLineEnd: function(char) { return (constants.singleLineCommentEndCharacters.indexOf(char) != -1) },
    isMultiLineEnd: function(char, lookahead) { return char === constants.multiLineCommentMarkerCharacter && lookahead === constants.commentMarkerCharacter },
    isLineTerminator: function(char) { return (constants.lineTerminators.indexOf(char) != -1) }
};

var processors = {

    processSingleLine: function(state) {
        while(state.char && !validators.isSingleLineEnd(state.char)) {
            //state.add();
            state.next();
        }

        //state.token("comment", "single");
        state.next(); //Process the line terminator.
        state.newLine();
    },

    processMultiLine: function(state) {
        while(state.char && !validators.isMultiLineEnd(state.char, state.lookahead)) {
            if(validators.isLineTerminator(state.char)) state.newLine();
            //state.add();
            state.next();
        }

        //state.token("comment", "multi");
        state.next(); //Process the multi line comment marker.
        state.next(); //Process the comment marker.
    }

};

module.exports = {
    name: "comment",

    canProcess: function(state) {
        return validators.isSingleLineStart(state.char, state.lookahead) || validators.isMultiLineStart(state.char, state.lookahead);
    },

    process: function (state) {
        state.next(); //Skip the comment marker character.

        if(state.char === constants.singleLineCommentMarkerCharacter) {
            state.next(); //Skip the second marker.
            processors.processSingleLine(state);
        }
        else {
            state.next(); //Skip the second marker.
            processors.processMultiLine(state);
        }
    }
};