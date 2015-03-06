/**
 * Return Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    return_: function(state) {
        state.next(); // Skip return keyword.
    },

    expression: function(state) {
        state.item.expression = {};
        state.prepareLeaf(state.item.expression);
        state.expressionProcessor.token(state, ["expression"]);
        state.clearLeaf();
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.returnKeyword,

    canProcess: function(state) {
        return validators.isReturn(state);
    },

    process: function(state) {
        if(!state.hasScope("function")) return state.error("Unexpected return statement.");

        state.leaf();
        state.item.type = "return";

        utils.return_(state);

        if(!utils.semicolon(state, true)) {
            utils.expression(state);
            utils.semicolonNonTerminal(state);
        }
    }

};