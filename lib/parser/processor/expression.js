/**
 * Expression Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils,
    ExtensionManager = new parserUtils.ExtensionManager();

/// methods ///
utils = utils.extend({

    expression: function processBlock(state) {
        if(!state.expressionProcessor.token(state, ["expression"])) state.error(constants.unexpectedToken);
    }

});

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(state) {
        var result = ExtensionManager.inject("canProcess", this, state, utils);
        if(result.hasResult) return result.value;
        return !validators.isLookaheadLabelSeparator(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "expressionStatement";

        state.levelDown();
        utils.expression(state);
        state.levelUp();

        utils.semicolon(state);
    }

};