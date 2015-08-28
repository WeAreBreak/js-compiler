/**
 * CellScript to JavaScript Compiler
 */

/// includes ///
var tokenizer = require("./library/tokenizer"),
    parser    = require("./library/parser"),
    compiler  = require("./library/compiler");

/// private methods ///
var initTime = 0;
var tokenizerTime = 0;
var parserTime = 0;
var compileTime = 0;
var modules = [];

/// public interface ///
module.exports = function(options) {
    options = options || {};

    this.init = function() {
        var time = Date.now();
        tokenizer.init();
        parser.init();
        compiler.init(options.language);
        initTime += Date.now() - time;
    };

    this.include = function(compilerModuleDefinition) {
        if(modules.indexOf(compilerModuleDefinition) == -1) {
            modules.push(compilerModuleDefinition);
            var cmodule = new compilerModuleDefinition();
            tokenizer.include(cmodule.tokens, options.log);
            parser.includeParsers(cmodule.parsers, options.log);
            parser.includeExpressionParsers(cmodule.expressionParsers, options.log);
            compiler.include(cmodule.compilers, cmodule.language, options.log);
        }
    };

    this.compile = function(input) {
        var time = Date.now();

        input = (options.includeInq ? 'inq;' + input : input);

        var result = tokenizer.tokenize(input);
        tokenizerTime += Date.now() - time;
        if(result) {
            time = Date.now();
            var parsed = parser.parse(result, options.log, options.definitions);
            parserTime += Date.now() - time;

            if(options.log) console.log(JSON.stringify(parsed));

            if(parsed) {
                time = Date.now();
                var compiled = compiler.compile(parsed, { minify: options.minify });
                if(compiled) {
                    compileTime += Date.now() - time;
                    return compiled;
                }
            }
        }

        return false;
    };

    this.stats = function() {
        var sum = tokenizerTime + parserTime + compileTime;

        console.log("INIT: " + initTime + "ms (" + (initTime/sum * 100).toFixed(2) + "%)");
        console.log("TOKENIZER: " + tokenizerTime + "ms (" + (tokenizerTime/sum * 100).toFixed(2) + "%)");
        console.log("PARSER: " + parserTime + "ms (" + (parserTime/sum * 100).toFixed(2) + "%)");
        console.log(" - TESTED PART: " + parser.time() +  "ms (" + (parser.time()/sum * 100).toFixed(2) + "%)");
        console.log("COMPILER: " + compileTime + "ms (" + (compileTime/sum * 100).toFixed(2) + "%)");
        console.log("------------------------------------");
        console.log(sum + "ms");

        initTime = 0;
        tokenizerTime = 0;
        parserTime = 0;
        compileTime = 0;
        parser.time(0);
    }

};