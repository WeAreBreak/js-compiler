/**
 * CellScript Tokenizer
 */

/// includes ///
var ParserState       = require("./state"),
    processor         = require("./processor"),
    expressionParser  = require("../expression-parser/processor");

/// constants ///
var time = 0;

//var RE_HEX_NUMBER = /^0x[0-9a-f]+$/i;
//var RE_OCT_NUMBER = /^0[0-7]+$/;
//var RE_DEC_NUMBER = /^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i;

/// public interface ///
module.exports = {

    init: function() {
        processor.init();
        expressionParser.init();
    },

    includeParsers: function(parsers, log) {
        processor.include(parsers, log);
    },

    includeExpressionParsers: function(expressionParsers, log) {
        expressionParser.include(expressionParsers, log);
    },

    time: function() { return time; },

    /**
     * Builds a token array from the specified input string using the CellScript tokenizer.
     * @param {Array} input The input string to tokenize.
     * @param {boolean} enableLog
     * @param {Array} [definitions]
     * @returns {Object} The input as a token array.
     */
    parse: function (input, enableLog, definitions) {
        var state = new ParserState(processor, expressionParser);

        state.expressionProcessor.log(!!enableLog);
        state.processor.log(!!enableLog);

        state.begin(input);

        state.createLexicalEnvironment(); //Global Environment
        state.preprocessor.globalEnvironment = state.lexicalEnvironment();

        if(definitions)
            definitions.forEach(function(definition) { state.preprocessor.set(definition, null) });

        processor.process(state);
        state.finalizeLexicalEnvironment();

        if(state.ok) {
            time += state.time;
            return {
                tree: state.tree,
                preprocessor: state.preprocessor
            };
        }
        else {
            return null;
        }
    }

};