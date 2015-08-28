/**
 * Switch Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    switch_: function(state) {
        state.next(); //Skip switch keyword.
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

    blockStart: function(state) {
        if(!validators.isBlockStart(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip block start.
    },

    blockEnd: function(state) {
        if(!validators.isBlockEnd(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip block end.
    },

    case_: function(state) {
        state.leaf();
        state.item.type = "case";
        state.next();

        utils.expression(state);
    },

    default_: function(state) {
        state.leaf();
        state.item.type = "default";
        state.next();
    }

};

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.switchKeyword,

    canProcess: function(state) {
        return validators.isSwitch(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "switch";

        utils.switch_(state);
        utils.segmentStart(state);
        utils.expression(state);
        utils.segmentEnd(state);

        utils.blockStart(state);
        var hadDefault = false;
        if(!validators.isBlockEnd(state)) {
            state.levelDown();
            do {
                if(validators.isCase(state)) {
                    utils.case_(state);
                }
                else if(validators.isDefault(state)) {
                    if(hadDefault) return state.error(constants.unexpectedToken);
                    utils.default_(state);
                    hadDefault = true;
                }
                else {
                    return state.error(constants.unexpectedToken);
                }

                if(!validators.isLabelSeparator(state)) state.error(constants.unexpectedToken);
                state.next();

                state.levelDown("switch");
                while(state.token && !validators.isCase(state) && !validators.isDefault(state) && !validators.isBlockEnd(state)) {
                    state.processor.token(state);
                }
                state.levelUp();
            }
            while(!validators.isBlockEnd(state));
            state.levelUp();
        }
        utils.blockEnd(state);
    }

};