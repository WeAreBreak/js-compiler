/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    equalityOperators: [ "==", "===", "!=", "!==" ],
    relationalOperators: [ "<", ">", "<=", ">=", "instanceof", "in" ],
    shiftOperators: [ "<<", ">>", ">>>" ],
    additiveOperators: [ "+", "-" ],
    multiplicativeOperators: [ "*", "/", "%" ]
};

/// methods ///
var utils = {

    token: function(state, types) {
        if(validators.isTokenTypeEqualsWithAny(state, types)) {
            state.leaf();
            state.item.type = "operator";
            state.item.subtype = state.token.data;

            state.next();
            return true;
        }

        return false;
    },

    processWhile: function(state, separators, processor) {
        state.levelDown();
        do {
            if(!processor(state)) return false;
        }
        while(utils.token(state, separators));
        state.levelUp();
        return true;
    },

    unary: function(state) {
        return state.expressionProcessor.token(state, ["unary"]);
    },

    multiplicative: function(state) {
        state.leaf();
        state.item.type = "multiplicative";
        return utils.processWhile(state, constants.multiplicativeOperators, utils.unary);
    },

    additive: function(state) {
        state.leaf();
        state.item.type = "additive";
        return utils.processWhile(state, constants.additiveOperators, utils.multiplicative);
    },

    shift: function(state) {
        state.leaf();
        state.item.type = "shift";
        return utils.processWhile(state, constants.shiftOperators, utils.additive);
    },

    relational: function(state) {
        state.leaf();
        state.item.type = "relational";
        return utils.processWhile(state, constants.relationalOperators, utils.shift);
    },

    equality: function(state) {
        state.leaf();
        state.item.type = "equality";
        return utils.processWhile(state, constants.equalityOperators, utils.relational);
    }

};

var validators = {

    isTokenTypeEqualsWithAny: function(state, vals) {
        return state.token && vals.indexOf(state.token.data) !== -1;
    }

};

/// public interface ///
module.exports = {

    name: "equality",

    canProcess: function() {
        return true;
    },

    process: function(state) {
        return utils.equality(state);
    }

};