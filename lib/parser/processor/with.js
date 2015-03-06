/**
 * While Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    with_: function(state) {
        if(!validators.isWith(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip while keyword.
    },

    segmentStart: function(state) {
        if(!validators.isSegmentStart(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip segment start.
    },

    expression: function(state) {
        state.item.expression = {};

        state.prepareLeaf(state.item.expression);
        if(!state.expressionProcessor.token(state, ["expression"])) return state.error(constants.unexpectedToken);
        state.clearLeaf();
    },

    segmentEnd: function(state) {
        if(!validators.isSegmentEnd(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip segment end.
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

    tokenType: "keyword/"+constants.withKeyword,

    canProcess: function(state) {
        return validators.isWith(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "with";

        utils.with_(state);
        utils.segmentStart(state);
        utils.expression(state);
        utils.segmentEnd(state);
        utils.statement(state);
    }

};