/**
 * If Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    if_: function(state) {
        state.next(); //Skip if keyword.
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

    statementIf: function(state) {
        state.item.statements = [];

        state.item.statements[0] = {};
        state.prepareLeaf(state.item.statements[0]);
        state.processor.token(state);
        state.clearLeaf();
    },

    else_: function(state) {
        if(!validators.isElse(state)) return false;
        state.next(); //Skip else keyword.
        return true;
    },

    statementElse: function(state) {
        state.item.statements[1] = {};
        state.prepareLeaf(state.item.statements[1]);
        state.processor.token(state);
        state.clearLeaf();
    }

};

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.ifKeyword,

    canProcess: function(state) {
        return validators.isIf(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "if";

        utils.if_(state);
        utils.segmentStart(state);
        utils.expression(state);
        utils.segmentEnd(state);
        utils.statementIf(state);
        if(utils.else_(state)) {
            utils.statementElse(state);
        }
    }

};