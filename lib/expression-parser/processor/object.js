/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    objectStartCharacter: "{",
    objectEndCharacter: "}",
    blockStartCharacter: "{",
    blockEndCharacter: "}",
    segmentStartCharacter: "(",
    segmentEndCharacter: ")",
    separatorCharacter: ",",
    assignmentSeparatorCharacter: ":",
    getKeyword: "get",
    setKeyword: "set"
};

/// methods ///
var utils = {

    propertyName: function(state, getterOrSetter) {
        state.leaf();
        state.item.type = "property";
        state.item.subtype = getterOrSetter || "";
        state.item.nameType = state.token.subtype || "identifier";
        state.item.name = state.token.data;

        state.next();
    },

    assignmentSeparator: function(state) {
        if(!validators.isAssignmentSeparator(state)) return false;
        state.next();
    },

    assignment: function(state) {
        state.item.expression = {};
        state.prepareLeaf(state.item.expression);
        var res = state.expressionProcessor.token(state, ["assignment"]);
        state.clearLeaf();
        return res;
    },

    segment: function(state) {
        if(!validators.isSegmentStart(state)) return false;
        state.next(); //Skip segment start.

        if(!validators.isSegmentEnd(state)) return false;
        state.next(); //Skip segment end.

        return true;
    },

    parameter: function(state) {
        if(!validators.isSegmentStart(state)) return false;
        state.next(); //Skip segment start.

        if(validators.isIdentifier(state)) {
            state.item.parameter = state.token.data;
        }
        else return false;

        if(!validators.isSegmentEnd(state)) return false;
        state.next(); //Skip segment end.

        return true;
    },

    block: function (state) {
        if(!validators.isBlockStart(state)) return false;
        state.next(); //Skip block start.

        state.levelDown("function");
        while(state.token && !validators.isBlockEnd(state)) {
            state.processor.token(state);
        }
        state.levelUp();

        state.next(); //Skip block end.

        return true;
    },

    object: function processBlock(state) {
        state.next(); //Skip object start.

        state.levelDown("value");
        while(state.token && !validators.isObjectEnd(state)) {
            if(validators.isNumericLiteralOrStringLiteralOrIdentifierName(state)) {
                utils.propertyName(state);
                utils.assignmentSeparator(state);
                if(!utils.assignment(state)) return false;
                if(validators.isSeparator(state)) state.next(); // Skip separator character
                else if(!validators.isObjectEnd(state)) return false;
            }
            else if(validators.isGet(state)) {
                state.next(); //Skip get.
                utils.propertyName(state, "get");
                utils.segment(state);
                utils.block(state);
            }
            else if(validators.isSet(state)) {
                state.next(); //Skip set.
                utils.propertyName(state, "set");
                utils.parameter(state);
                utils.block(state);
            }
            else {
                return false;
            }
        }
        state.levelUp();

        state.next(); //Skip object end.
        return true;
    }

};

var validators = {

    isSegmentStart: function(state) {
        return state.token && state.token.type === constants.segmentStartCharacter;
    },

    isSegmentEnd: function(state) {
        return state.token && state.token.type === constants.segmentEndCharacter;
    },

    isBlockStart: function(state) {
        return state.token && state.token.type === constants.blockStartCharacter;
    },

    isBlockEnd: function(state) {
        return state.token && state.token.type === constants.blockEndCharacter;
    },
    isObjectStart: function(state) {
        return state.token && state.token.type === constants.objectStartCharacter;
    },

    isObjectEnd: function(state) {
        return state.token && state.token.type === constants.objectEndCharacter;
    },

    isSeparator: function(state) {
        return state.token && state.token.type === constants.separatorCharacter;
    },

    isAssignmentSeparator: function(state) {
        return state.token && state.token.type === constants.assignmentSeparatorCharacter;
    },

    isIdentifier: function(state) {
        return state.token && state.token.type === "identifier";
    },

    isNumericLiteralOrStringLiteralOrIdentifierName: function(state) {
        return state.token &&
               (
                   (state.token.type === "literal" && ( state.token.subtype === "number" || state.token.subtype === "string")) ||
                   (state.token.type === "identifier")
               );
    },

    isGet: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.getKeyword;
    },

    isSet: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.setKeyword;
    }

};

/// public interface ///
module.exports = {

    name: "object",

    canProcess: function(state) {
        return validators.isObjectStart(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "literal";
        state.item.subtype = "object";

        return utils.object(state);
    }

};