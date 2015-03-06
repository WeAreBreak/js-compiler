/**
 * Token Processor for the CellScript Parser.
 */

/// includes ///
var fs   = require("fs"),
    path = require("path");

/// private variables ///
var processors = [];
var typedProcessors = [];
var processorIndex = [];
var enableLog = false;

/// private methods ///
function log() {
    if(enableLog) console.log.apply(this, arguments);
}

function tryInit() {
    if(!processors.length) {
        var temp;
        var processorsPath = path.resolve(__dirname, "processor");
        var files = fs.readdirSync(processorsPath);
        for (var i = 0; i < files.length; ++i) {
            temp = require(path.resolve(processorsPath, files[i]));
            temp.name = temp.name || files[i];
            if(temp.tokenType) typedProcessors[temp.tokenType] = temp;
            processors.push(temp);
            processorIndex[temp.name] = temp;
        }
    }
}

function includeParsers(parserDefinitions, log) {
    if(parserDefinitions) {
        for(var parserDefinition in parserDefinitions) {
            if(parserDefinitions.hasOwnProperty(parserDefinition)) {
                var processor = processorIndex[parserDefinition];
                var parser = parserDefinitions[parserDefinition];

                if(typeof parser.process == "function") {
                    if(processor && !parser.forceOverride) throw "A parser with this name is already included: " + parserDefinition;
                    if(parser.tokenType) typedProcessors[parser.tokenType] = parser;
                    processors.push(parser);
                    processorIndex[parserDefinition] = parser;

                    if(processor) {
                        processors.splice(processors.indexOf(processor), 1);
                        if(log) console.log("[EXTENSION] Overridden parser: " + parserDefinition);
                    }
                    else {
                        if(log) console.log("[EXTENSION] Loaded new parser: " + parserDefinition);
                    }
                }
                else {
                    if(!processor || typeof processor.include != "function") throw "Unsupported parser definition type: " + parserDefinition;
                    processor.include(parser);
                    if(log) console.log("[EXTENSION] Configured parser: " + parserDefinition);
                }
            }
        }
    }
}

function end(state) {
    var processor = null;
    for (var i = 0; i < processors.length; ++i) {
        processor = processors[i];
        if(typeof processor.end === "function") processor.end(state);
    }
}

var lastToken = null;
var counter = 0;
function processToken(state) {
    if(state.token) {
        var tokenType = (state.token.type === "keyword" ? "keyword/"+state.token.data : state.token.type);
        var processor = typedProcessors[tokenType];

        if(processor) {
            log(processor.name + " ========================================================");
            processor.process(state);
            return;
        }
        else for (var i = 0; i < processors.length; ++i) {
            processor = processors[i];

            if (processor.canProcess(state)) {
                //if(lastToken === state.token) {
                //    counter++;
                //     if(counter > 5) {
                //         return state.error("Infinite loop. :(");
                //     }
                // }
                // else {
                //     lastToken = state.token;
                //     counter = 1;
                // }

                log(processor.name + " ========================================================");
                processor.process(state);
                return;
            }
        }

        state.error("Invalid token found: " + JSON.stringify(state.token));
    }
}

function processTokens(state) {
    while (true) {
        if (!state.token) {
            end(state);
            state.end(true);
            return;
        }

        processToken(state);
    }
}

/// public interface ///
module.exports = {
    init: tryInit,
    include: includeParsers,
    token: processToken,
    process: processTokens,
    log: function(enable) { enableLog = enable }
};