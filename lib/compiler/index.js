/**
 * CellScript to JavaScript Compiler
 */

/// includes ///
var CompilerState = require("./state"),
    processor = require("./processor"),
    version = 0.38,
    languageName = "JavaScript",
    extensionNames = [];

/// public interface ///
module.exports = {

    init: function(language) {
        languageName = language || languageName;
        processor.init();
    },

    include: function(compilerDefinition, name, log) {
        processor.include(compilerDefinition, log);
        if(name && extensionNames.indexOf(name) == -1)
            extensionNames.push(name);
    },

    /**
     * Builds a token array from the specified input string using the CellScript tokenizer.
     * @param {Object} input The input string to tokenize.
     * @param {Object} [config] The configuration object for the compiler.
     * @returns {Array} The input as a token array.
     */
    compile: function(input, config) {
        var state = new CompilerState(processor);
        state.configuration = config || { minify: true };
        state.begin(input.preprocessor);

        state.print("/* WARNING: GENERATED CODE. DO NOT MODIFY THIS FILE!");
        state.meaningfulSpace();
        state.println("  ");
        state.print("   " + languageName + " Compiler v" + version);
        if(extensionNames.length) state.print(" with extension" + (extensionNames.length > 1 ? "s" : "") + ": " + extensionNames.join(", "));
        state.println(" */", true);
        state.println("");

        processor.process(input.tree, state);

        return state.output;
    }

};