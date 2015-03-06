/**
 * Expression Tree Processor for the CellScript to JS Compiler.
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
            processor.name = processor.name || files[i].replace('.js', '');
            processors.push(processor);
            processorIndex[processor.name] = processor;
        }
    }
}

function includeCompilers(compilerDefinitions, log) {
    if(compilerDefinitions) {
        for(var compilerDefinition in compilerDefinitions) {
            if(compilerDefinitions.hasOwnProperty(compilerDefinition)) {
                var processor = processorIndex[compilerDefinition];
                var compiler = compilerDefinitions[compilerDefinition];

                if(typeof compiler.process == "function") {
                    if(processor && !compiler.forceOverride) throw "A compiler with this name is already included: " + compilerDefinition;
                    processors.push(compiler);
                    processorIndex[compilerDefinition] = compiler;

                    if(processor) {
                        processors.splice(processors.indexOf(processor), 1);
                        if(log) console.log("[EXTENSION] Overridden compiler: " + compilerDefinition);
                    }
                    else {
                        if(log) console.log("[EXTENSION] Loaded new compiler: " + compilerDefinition);
                    }
                }
                else {
                    if(!processor || typeof processor.include != "function") throw "Unsupported compiler definition type: " + compilerDefinition;
                    processor.include(compiler);
                    if(log) console.log("[EXTENSION] Configured compiler: " + compilerDefinition);
                }
            }
        }
    }
}

function processLeaf(leaf, state/*, shouldBreak*/) {
    if(!leaf) return;
    //if(!shouldBreak) shouldBreak = function() { return false };

    var processor = null;
    for (var i = 0; i < processors.length; ++i) {
        processor = processors[i];

        //if(shouldBreak(leaf)) return;

        if (processor.canProcess(leaf)) {
            processor.process(leaf, state);
            return;
        }
    }

    if(leaf && leaf.type) {
        console.warn("[COMPILER WARNING] Unsupported token: " + leaf.type);
    }
}

function processLevel(level, state) {
    for(var i = 0; i < level.length; ++i) {
        processLeaf(level[i], state);
    }
}

/// public interface ///
module.exports = {
    init: tryInit,
    include: includeCompilers,
    leaf: processLeaf,
    level: processLevel,
    process: processLevel
};