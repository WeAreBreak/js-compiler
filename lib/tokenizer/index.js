/**
 * CellScript Tokenizer
 */

/// includes ///
var TokenizerState = require("./state");
var processor = require("./processor");

/// public interface ///
module.exports = {

    init: function() {
        processor.init();
    },

    include: function(tokens, log) {
       processor.include(tokens, log);
    },

    /**
     * Builds a token array from the specified input string using the CellScript tokenizer.
     * @param {string} input The input string to tokenize.
     * @returns {Array} The input as a token array.
     */
    tokenize: function (input) {
        var state = new TokenizerState();
        state.begin(input);
        processor.process(state);

        if(state.ok) {
            return state.tokens;
        }
        else {
            return null;
        }
    }

};