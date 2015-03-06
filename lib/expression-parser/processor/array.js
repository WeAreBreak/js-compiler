/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    arrayStartCharacter: "[",
    arrayEndCharacter: "]",
    separatorCharacter: ","
};

/// methods ///
var utils = {

    array: function processBlock(state) {
        state.next(); //Skip array start.

        state.levelDown("value");
        while(state.token && !validators.isArrayEnd(state)) {
            if(state.expressionProcessor.token(state, ["assignment"])) {
                if(validators.isSeparator(state)) {
                    state.next();
                }
            }
            else if(validators.isSeparator(state)) {
                state.leaf();
                state.item.type = "elision";

                state.next();
            }
            else {
                return false;
            }
        }
        state.levelUp();

        state.next(); //Skip array end.
        return true;
    }

};

var validators = {

    isArrayStart: function(state) {
        return state.token && state.token.type === constants.arrayStartCharacter;
    },

    isArrayEnd: function(state) {
        return state.token && state.token.type === constants.arrayEndCharacter;
    },

    isSeparator: function(state) {
        return state.token && state.token.type === constants.separatorCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "array",

    canProcess: function(state) {
        return validators.isArrayStart(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "literal";
        state.item.subtype = "array";

        return utils.array(state);
    }

};