/**
 * Block Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// public interface ///
module.exports = {

    tokenType: constants.blockStartCharacter,

    canProcess: function(state) {
        return validators.isBlockStart(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "block";

        utils.block(state);
    }

};