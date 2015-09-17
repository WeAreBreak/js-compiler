/**
 * Separator Character Processor for the CellScript Tokenizer
 */

var constants = {
    separatorCharacters: ".;{}()[]:,",
    segmentStart: "(",
    segmentEnd: ")",
    blockStart: "{",
    blockEnd: "}",
    arrayStart: "[",
    arrayEnd: "]",
    semicolon: ";"
};

var counters = {
    segment: 0,
    block: 0,
    array: 0
};

var utils =  {
    count: function(state) {
        switch(state.char) {
            case constants.segmentStart:
                counters.segment++;
                break;

            case constants.segmentEnd:
                counters.segment--;
                if(counters.segment < 0) return state.error("Unexpected token ILLEGAL.");
                break;

            case constants.blockStart:
                counters.block++;
                break;

            case constants.blockEnd:
                counters.block--;
                if(counters.block < 0) return state.error("Unexpected token ILLEGAL.");
                break;

            case constants.arrayStart:
                counters.array++;
                break;

            case constants.arrayEnd:
                counters.array--;
                if(counters.array < 0) return state.error("Unexpected token ILLEGAL.");
                break;
        }
    }
};

var validators = {
    isSeparator: function (char) { return (constants.separatorCharacters.indexOf(char) != -1) },
    isSemicolon: function(char) { return constants.semicolon === char }
};

module.exports = {
    name: "separator",

    canProcess: function(state) {
        return validators.isSeparator(state.char);
    },

    process: function (state) {
        utils.count(state);
        state.add();
        state.token(state.char);

        if(validators.isSemicolon(state.char)) {
            while(validators.isSemicolon(state.char)) state.next();
        }
        else state.next();
    },

    end: function(state) {
        if(counters.segment !== 0 ||
           counters.block !== 0 ||
           counters.array !== 0) {
            counters.segment = 0;
            counters.block = 0;
            counters.array = 0;
            return state.error("Unexpected end of input.");
        }
    }
};