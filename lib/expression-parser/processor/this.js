/**
 * This Expression Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    thisKeyword: "this"
};

/// methods ///
var validators = {

    isThis: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.thisKeyword;
    }

};

/// public interface ///
module.exports = {

    name: "this",

    canProcess: function(state) {
        return validators.isThis(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "this";

        state.next();
        return true;
    }

};