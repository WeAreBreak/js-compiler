/**
 * While Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    while_: function(state) {
        if(!validators.isWhile(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip while keyword.
    },

    segmentStart: function(state) {
        if(!validators.isSegmentStart(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip segment start.
    },

    expression: function(state) {
        state.item.condition = {};

        state.prepareLeaf(state.item.condition);
        if(!state.expressionProcessor.token(state, ["expression"])) return state.error(constants.unexpectedToken);
        state.clearLeaf();
    },

    segmentEnd: function(state) {
        if(!validators.isSegmentEnd(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip segment end.
    },

    statement: function(state) {
        state.item.statement = {};
        state.levelDown("iteration");
        state.prepareLeaf(state.item.statement);
        state.processor.token(state);
        state.clearLeaf();
        state.levelUp();
    }

};

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.whileKeyword,

    canProcess: function(state) {
        return validators.isWhile(state);
    },

    process: function(state) {
        if(!state.hasScope('on')) return state.error('Unexpected while statement.');

        state.leaf();
        state.item.type = "iteration";
        state.item.subtype = "while";

        utils.while_(state);
        utils.segmentStart(state);
        utils.expression(state);
        utils.segmentEnd(state);
        utils.statement(state);
    }

};