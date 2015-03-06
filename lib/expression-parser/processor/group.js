/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    segmentStartCharacter: "(",
    segmentEndCharacter: ")"
};

/// methods ///
var utils = {

    group: function (state) {
        state.next(); //Skip segment start.

        if(validators.isSegmentEnd(state)) {
            state.next(); //Skip segment end.
            return true;
        }

        state.item.expression = {};
        state.prepareLeaf(state.item.expression);
        state.expressionProcessor.token(state, ["expression"]);
        state.clearLeaf();

        if(!validators.isSegmentEnd(state)) return false;
        state.next(); //Skip segment end.

        return true;
    }

};

var validators = {

    isSegmentStart: function(state) {
        return state.token && state.token.type === constants.segmentStartCharacter;
    },

    isSegmentEnd: function(state) {
        return state.token && state.token.type === constants.segmentEndCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "group",

    canProcess: function(state) {
        return validators.isSegmentStart(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "group";

        return utils.group(state);
    }

};