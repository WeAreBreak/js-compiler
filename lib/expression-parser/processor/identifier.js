/**
 * This Expression Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    // No constants yet.
};

/// methods ///
var validators = {

    isIdentifier: function(state) {
        return state.token && state.token.type === "identifier";
    }

};

/// public interface ///
module.exports = {

    name: "identifier",

    canProcess: function(state) {
        return validators.isIdentifier(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "identifier";
        state.item.name = state.token.data;

        state.next();
        return true;
    }

};