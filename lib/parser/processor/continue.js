/**
 * Continue Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    continue_: function(state) {
        state.next(); //Skip continue keyword;
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

    tokenType: "keyword/" + constants.continueKeyword,

    canProcess: function(state) {
        return validators.isContinue(state);
    },

    process: function(state) {
        if(!state.hasScope("iteration", true)) return state.error("Unexpected continue statement.");

        state.leaf();
        state.item.type = "continue";

        utils.continue_(state);
        utils.label(state);
        utils.semicolonNonTerminal(state);
    }

};