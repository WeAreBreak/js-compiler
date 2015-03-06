/**
 * For Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    for_: function(state) {
        state.next(); //Skip for keyword.
    },

    in_: function(state) {
        state.next(); //Skip in keyword.
    },

    of_: function(state) {
        state.next(); //Skip of keyword.
    },

    segmentStart: function(state) {
        if(!validators.isSegmentStart(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip segment start.
    },

    expression1: function(state, item) {
        item.expressions[0] = {};
        state.prepareLeaf(item.expressions[0]);
        if(!state.expressionProcessor.token(state, ["expressionNoIn"])) return state.error(constants.unexpectedToken);
        state.clearLeaf();
    },

    variable: function(state, item) {
        item.expressions[0] = {};
        state.prepareLeaf(item.expressions[0]);
        if(!state.expressionProcessor.token(state, ["variableDeclarationNoIn"])) return state.error(constants.unexpectedToken);
        state.clearLeaf();
    },

    semicolon: function(state) {
        if(!validators.isSemicolon(state)) return state.error(constants.unexpectedToken);
        state.next(); // Skip semicolon.
    },

    expression2: function(state, item) {
        item.expressions[1] = {};
        state.prepareLeaf(item.expressions[1]);
        state.expressionProcessor.token(state, ["expression"]);
        state.clearLeaf();
    },

    expression3: function(state, item) {
        item.expressions[2] = {};
        state.prepareLeaf(item.expressions[2]);
        state.expressionProcessor.token(state, ["expression"]);
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

    tokenType: "keyword/"+constants.forKeyword,

    canProcess: function(state) {
        return validators.isFor(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "iteration";
        state.item.subtype = "for";

        var item = state.item;
        item.expressions = [];

        utils.for_(state);
        utils.segmentStart(state);
        if(validators.isVar(state)) {
            utils.variable(state, item);
            if(validators.isIn(state)) {
                //for(var...in...)
                item.subtype = "forin";

                utils.in_(state);
                utils.expression2(state, item);
            }
            else if(validators.isOf(state)) {
                //for(...of...)
                item.subtype = "forof";

                utils.of_(state);
                utils.expression2(state, item);
            }
            else {
                //for(var...;...;...)
                utils.semicolon(state);

                if (!validators.isSemicolon(state)) {
                    utils.expression2(state, item);
                }

                utils.semicolon(state);

                if (!validators.isSemicolon(state)) {
                    utils.expression3(state, item);
                }
            }
        }
        else {
            if (!validators.isSemicolon(state)) {
                utils.expression1(state, item);
            }

            if(validators.isIn(state)) {
                //for(...in...)
                item.subtype = "forin";

                utils.in_(state);
                utils.expression2(state, item);
            }
            else if(validators.isOf(state)) {
                //for(...of...)
                item.subtype = "forof";

                utils.of_(state);
                utils.expression2(state, item);
            }
            else {
                //for(...;...;...)
                utils.semicolon(state);

                if (!validators.isSemicolon(state)) {
                    utils.expression2(state, item);
                }

                utils.semicolon(state);

                if (!validators.isSemicolon(state)) {
                    utils.expression3(state, item);
                }
            }
        }
        utils.segmentEnd(state);
        utils.statement(state);
    }

};