/**
 * Do-While Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    do_: function(state) {
        state.next(); //Skip do keyword.
    },

    statement: function(state) {
        state.item.statement = {};
        state.levelDown("iteration");
        state.prepareLeaf(state.item.statement);
        state.processor.token(state);
        state.clearLeaf();
        state.levelUp();
    },

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
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.doKeyword,

    canProcess: function(state) {
        return validators.isDo(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "iteration";
        state.item.subtype = "dowhile";

        utils.do_(state);
        utils.statement(state);
        utils.while_(state);
        utils.segmentStart(state);
        utils.expression(state);
        utils.segmentEnd(state);
        utils.semicolon(state);
    }

};