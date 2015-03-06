/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    questionMarkCharacter: "?",
    separatorCharacter: ":"
};

/// methods ///
var utils = {

    questionMark: function(state) {
        if(validators.isQuestionMark(state)) {
            state.next();
            return true;
        }

        return false;
    },

    separator: function(state) {
        if(validators.isSeparator(state)) {
            state.next();
            return true;
        }

        return false;
    },

    logicalOR: function (state) {
        return state.expressionProcessor.token(state, ["logicalOR"]);
    },

    assignment: function (state) {
        return state.expressionProcessor.token(state, ["assignment"]);
    }

};

var validators = {

    isQuestionMark: function(state) {
        return state.token && state.token.type === constants.questionMarkCharacter;
    },

    isSeparator: function(state) {
        return state.token && state.token.type === constants.separatorCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "conditional",

    canProcess: function() {
        return true;
    },

    process: function(state) {
        state.leaf();
        state.item.type = "conditional";

        var _self = state.item;

        state.levelDown();
            if(!utils.logicalOR(state)) return false;
            if(utils.questionMark(state)) {
                _self.subtype = "complex";
                if(!utils.assignment(state)) return false;
                if(!utils.separator(state)) return false;
                if(!utils.assignment(state)) return false;
            }
        state.levelUp();
        return true;
    }

};