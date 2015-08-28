/**
 * Continue Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    throw_: function(state) {
        state.next(); //Skip throw keyword;
    },

    expression: function(state) {
        state.item.expression = {};

        state.prepareLeaf(state.item.expression);
        if(!state.expressionProcessor.token(state, ["expression"])) return state.error(constants.unexpectedToken);
        state.clearLeaf();
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.throwKeyword,

    canProcess: function(state) {
        return validators.isThrow(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "throw";

        utils.throw_(state);
        utils.expression(state);
        utils.semicolonNonTerminal(state);
    }

};