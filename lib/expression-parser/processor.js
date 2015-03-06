/**
 * Expression Processor for the CellScript Expression Parser.
 */

/// includes ///
var fs   = require("fs"),
    path = require("path");

/// private variables ///
var processors = [];
var processorsNamed = [];
var complexExpressions = [];
var enableLog = false;
var lvl = 0;

/// private methods ///
function tryInit() {
    var temp, i, files;

    if(!processors.length) {
        var processorsPath = path.resolve(__dirname, "processor");
        files = fs.readdirSync(processorsPath);
        for (i = 0; i < files.length; ++i) {
            temp = require(path.resolve(processorsPath, files[i]));
            processors.push(temp);
            processorsNamed[temp.name] = temp;
        }
    }

    if(!complexExpressions.length) {
        var expressionsPath = path.resolve(__dirname, "combination");
        files = fs.readdirSync(expressionsPath);
        for (i = 0; i < files.length; ++i) {
            temp = require(path.resolve(expressionsPath, files[i]));
            complexExpressions[temp.name] = temp.value;
        }
    }
}

function includeParsers(parserDefinitions, log) {
    if(parserDefinitions) {
        for(var parserDefinition in parserDefinitions) {
            if(parserDefinitions.hasOwnProperty(parserDefinition)) {
                var processor = processorsNamed[parserDefinition];
                var parser = parserDefinitions[parserDefinition];

                if(typeof parser.process == "function") {
                    if(processor && !parser.forceOverride) throw "An expression parser with this name is already included: " + parserDefinition;
                    processors.push(parser);
                    processorsNamed[parserDefinition] = parser;

                    if(processor) {
                        processors.splice(processors.indexOf(processor), 1);
                        if(log) console.log("[EXTENSION] Overridden expression parser: " + parserDefinition);
                    }
                    else {
                        if(log) console.log("[EXTENSION] Loaded new expression parser: " + parserDefinition);
                    }
                }
                else {
                    if(!processor || typeof processor.include != "function") throw "Unsupported expression parser definition type: " + parserDefinition;
                    processor.include(parser);
                    if(log) console.log("[EXTENSION] Configured expression parser: " + parserDefinition);
                }
            }
        }
    }
}

function getComplexExpression(input) {
    return complexExpressions[input] || [input];
}

function indent() {
    return new Array(lvl).join(" ");
}

function log() {
    if(enableLog) console.log.apply(this, arguments);
}

function processToken(state, targetedProcessors) {
    if(typeof targetedProcessors === "string") targetedProcessors = getComplexExpression(targetedProcessors);

    var temp, processor, i;
    for (i = 0; i < targetedProcessors.length; ++i) {
        processor = processorsNamed[targetedProcessors[i]];
        if(!processor) return state.error("Missing processor: " + targetedProcessors[i]);
        if (processor.canProcess(state, true)) {
            log(indent(++lvl) + " > " + processor.name);
            temp =  processor.process(state);
            log(indent(lvl--) + " < " + processor.name + " (" + temp + ")");

            return temp;
        }
    }

    return false;
}

/// public interface ///
module.exports = {
    init: tryInit,
    include: includeParsers,
    token: processToken,
    log: function(enable) { enableLog = enable; }
};