/**
 * Return Statement Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    semicolonCharacter: ";",
    blockEndCharacter: "}"
};

/// methods ///
var utils = {

    mathematicalValue: function(value) {
        return eval(value); //TODO: Should we write a parser?
    },

    literal: function(state) {
        state.item.type = "literal";
        state.item.subtype = state.token.subtype;

        if(state.token.subtype == "number") {
            state.item.value = utils.mathematicalValue(state.token.data);
        }
        else if(state.token.subtype == "regexp") {
            try {
                eval(state.token.data); //TODO: Should we write a custom parser?
            }
            catch(e) {
                return false;
            }

            state.item.value = state.token.data;
        }
        else {
            state.item.value = state.token.data;
        }

        state.next();
        return true;
    },

    semicolon: function(state) {
        if(state.scope === "value") return;

        if(validators.isSemicolon(state)) {
            state.next();
        }
        else if(!validators.isBlockEnd(state)) {
            return false;
        }

        return true;
    }

};

var validators = {

    isLiteral: function(state) {
        return state.token && state.token.type === "literal";
    },

    isSemicolon: function(state) {
        return state.token && state.token.type === constants.semicolonCharacter;
    },

    isBlockEnd: function(state) {
        return state.token && state.token.type === constants.blockEndCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "literal",

    canProcess: function(state) {
        return validators.isLiteral(state);
    },

    process: function(state) {
        state.leaf();

        return utils.literal(state);
    }

};