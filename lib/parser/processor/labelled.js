/**
 * While Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    name: function(state) {
        if(!validators.isIdentifier(state)) return state.error(constants.unexpectedToken);
        state.item.name = state.token.data;
        state.next();
    },

    separator: function(state) {
        if(!validators.isLabelSeparator(state)) return state.error(constants.unexpectedToken);
        state.next();
    },

    statement: function(state) {
        state.item.statement = {};
        state.levelDown();
        state.prepareLeaf(state.item.statement);
        state.processor.token(state);
        state.clearLeaf();
        state.levelUp();
    }

};

/// public interface ///
module.exports = {

    canProcess: function(state) {
        return validators.isIdentifier(state) && validators.isLookaheadLabelSeparator(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "labelled";

        utils.name(state);
        utils.separator(state);
        utils.statement(state);

        //TODO: Check for repeated occurrences.
    }

};