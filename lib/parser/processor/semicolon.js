/**
 * Empty Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    semicolon: function(state) {
        if(state.scope === "value") return;

        if(validators.isSemicolon(state)) {
            state.next();
        }
    }

};

/// public interface ///
module.exports = {

    tokenType: constants.semicolonCharacter,

    canProcess: function(state) {
        return validators.isSemicolon(state);
    },

    process: function(state) {
        utils.semicolon(state);
    }

};