/**
 * Return Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    yield_: function(state) {
        state.next(); // Skip yield keyword.
    },

    delegate: function(state) {
        state.item.delegated = false;
        if(validators.isGeneratorSign(state)) {
            state.item.delegated = true;
            state.next(); // Skip generator sign.
        }
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

    tokenType: "keyword/"+constants.yieldKeyword,

    canProcess: function(state) {
        return validators.isYield(state);
    },

    process: function(state) {
        if(!state.hasScope("function")) return state.error("Unexpected yield statement.");
        if(!state.hasScope("generator")) return state.error("Unexpected yield statement in non-async function."); //TODO: Might cause errors when used in a nested function not marked as generator.

        state.leaf();
        state.item.type = "yield";

        utils.yield_(state);
        utils.delegate(state);

        if(!utils.semicolon(state, true)) {
            utils.expression(state);
            utils.semicolonNonTerminal(state);
        }
    }

};