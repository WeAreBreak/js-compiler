/**
 * Continue Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    break_: function(state) {
        state.next(); //Skip break keyword;
    },

    label: function(state) {
        state.item.label = {};
        state.prepareLeaf(state.item.label);
        if(!state.expressionProcessor.token(state, ["identifier"])) state.item.label = undefined;
        state.clearLeaf();
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/" + constants.breakKeyword,

    canProcess: function(state) {
        return validators.isBreak(state);
    },

    process: function(state) {
        if(!state.hasScope("iteration", true) &&
           !state.hasScope("switch", true)) return state.error("Unexpected break statement.");

        state.leaf();
        state.item.type = "break";

        utils.break_(state);
        utils.label(state);
        utils.semicolonNonTerminal(state);
    }

};