/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    logicalOr: "||",
    logicalAnd: "&&",
    or: "|",
    and: "&",
    xor: "^"
};

/// methods ///
var utils = {

    token: function(state, type) {
        if(validators.isTokenTypeEquals(state, type)) {
            state.next();
            return true;
        }

        return false;
    },

    processWhile: function(state, separator, processor) {
        state.levelDown();
        do {
            if(!processor(state)) return false;
        }
        while(utils.token(state, separator));
        state.levelUp();
        return true;
    },

    equality: function (state) {
        return state.expressionProcessor.token(state, ["equality"]);
    },

    bitwiseAND: function (state) {
        state.leaf();
        state.item.type = "bitwise";
        state.item.subtype = "and";
        return utils.processWhile(state, constants.and, utils.equality);
    },

    bitwiseXOR: function (state) {
        state.leaf();
        state.item.type = "bitwise";
        state.item.subtype = "xor";
        return utils.processWhile(state, constants.xor, utils.bitwiseAND);
    },

    bitwiseOR: function (state) {
        state.leaf();
        state.item.type = "bitwise";
        state.item.subtype = "or";
        return utils.processWhile(state, constants.or, utils.bitwiseXOR);
    },

    logicalAND: function (state) {
        state.leaf();
        state.item.type = "logical";
        state.item.subtype = "and";
        return utils.processWhile(state, constants.logicalAnd, utils.bitwiseOR);
    },

    logicalOR: function(state) {
        state.leaf();
        state.item.type = "logical";
        state.item.subtype = "or";
        return utils.processWhile(state, constants.logicalOr, utils.logicalAND);
    }

};

var validators = {

    isTokenTypeEquals: function(state, val) {
        return state.token && state.token.type === val;
    }

};

/// public interface ///
module.exports = {

    name: "logicalOR",

    canProcess: function() {
        return true;
    },

    process: function(state) {
        return utils.logicalOR(state);
    }

};