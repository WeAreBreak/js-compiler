/**
 * Character Processor for the CellScript Tokenizer.
 */

/// includes ///
var fs   = require("fs"),
    path = require("path");

/// private variables ///
var processors = [],
    processorIndex = [];

/// private methods ///
function tryInit() {
    if(!processors.length) {
        var processorsPath = path.resolve(__dirname, "processor");
        var files = fs.readdirSync(processorsPath);
        for (var i = 0; i < files.length; ++i) {
            var processor = require(path.resolve(processorsPath, files[i]));
            //processor.name = processor.name || files[i];
            if(processor.priority) processors.unshift(processor);
            else processors.push(processor);
            processorIndex[processor.name] = processor;
        }
    }
}

function includeTokens(tokenDefinitions, log) {
    if(tokenDefinitions) {
        for(var tokenDefinition in tokenDefinitions) {
            if(tokenDefinitions.hasOwnProperty(tokenDefinition)) {
                var processor = processorIndex[tokenDefinition];
                var token = tokenDefinitions[tokenDefinition];

                if(typeof token.process == "function") {
                    if(processor && !token.forceOverride) throw "A token parser with this name is already included: " + tokenDefinition;
                    if(token.priority) processors.unshift(token);
                    else processors.push(token);
                    processorIndex[tokenDefinition] = token;
                    if(processor) {
                        processors.splice(processors.indexOf(processor), 1);
                        if(log) console.log("[EXTENSION] Overridden token: " + tokenDefinition);
                    }
                    else {
                        if(log){
                            if(token.priority) console.log("[EXTENSION] Loaded new token with priority: " + tokenDefinition);
                            else console.log("[EXTENSION] Loaded new token: " + tokenDefinition);
                        }
                    }
                }
                else {
                    if(!processor || typeof processor.include != "function") throw "Unsupported token definition type: " + tokenDefinition;
                    processor.include(token);
                    if(log) console.log("[EXTENSION] Configured token: " + tokenDefinition);
                }
            }
        }
    }
}

function end(state) {
    var processor = null;
    for(var i = 0; i < processors.length; ++i) {
        processor = processors[i];
        if(typeof processor.end === "function") processor.end(state);
    }
}

/// public interface ///
module.exports = {

    init: tryInit,

    include: includeTokens,

    process: function(state) {
        var processor = null;
        main: while (true) {
            if (!state.char) {
                end(state);
                state.end(true);
                return;
            }

            for (var i = 0; i < processors.length; ++i) {
                processor = processors[i];

                if (processor.canProcess(state)) {
                    processor.process(state);
                    continue main;
                }
            }

            break;
        }

        state.error("Invalid character found: <" + state.char + ">");
    }

};