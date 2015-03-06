/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    separatorCharacter: ","
};

/// methods ///
var utils = {

    separator: function(state) {
        if(validators.isSeparator(state)) {
            state.next();
            return true;
        }

        return false;
    },

    assignment: function (state) {
        return state.expressionProcessor.token(state, ["assignment"]);
    }

};

var validators = {

    isSeparator: function(state) {
        return state.token && state.token.type === constants.separatorCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "expression",

    canProcess: function() {
        return true;
    },

    process: function(state) {
        state.leaf();
        state.item.type = "expression";

        state.levelDown();
            do {
                if(!utils.assignment(state)) return false;
            }
            while(utils.separator(state));
        state.levelUp();

        return true;
    }

};