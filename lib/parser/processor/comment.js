/**
 * Comment Expression Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    comment: function(state) {
        state.item.type = "comment";
        state.item.subtype = state.token.subtype;
        state.item.value = state.token.data;

        state.next();
    }

};

/// public interface ///
module.exports = {

    name: "comment",
    tokenType: "comment",

    canProcess: function(state) {
        return validators.isComment(state);
    },

    process: function(state) {
        state.leaf();

        utils.comment(state);
    }

};