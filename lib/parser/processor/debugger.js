/**
 * Debugger Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    debugger_: function(state) {
        state.next(); //Skip debugger keyword;
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.debuggerKeyword,

    canProcess: function(state) {
        return validators.isDebugger(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "debugger";

        utils.debugger_(state);
        utils.semicolon(state);
    }

};