/// includes ///
var JsInterpreter = require("../js-interpreter");

/// private variables ///
var enableLog = false;
var enableMinify = true;
var inputIsFolder = false;
var enableSilent = false;
var includeInq = false;
var definitions = [];
var input = "";
var output = "";

/// methods ///
function processArguments() {
    var arg;
    for(var i = 2; i < process.argv.length; ++i) {
        arg = process.argv[i];
        if(arg === "-l" || arg === "-log") enableLog = true;
        //else if(arg === "-m" || arg === "--minify") enableMinify = true;
        //else if(arg === "-f" || arg === "--folder") inputIsFolder = true;
        else if(arg === "-s" || arg === "--silent") enableSilent = true;
        else if(arg === "-i" || arg === "--input") input = process.argv[++i];
        //else if(arg === "-o" || arg === "--output") output = process.argv[++i];
        else if(arg === "-e" || arg === "--ensure") includeInq = true;
        else if(arg === "-d" || arg === "--define") definitions = process.argv[++i].split(' ');
        else console.error("[WARNING] Unknown compiler flag: " + arg);
    }

    if(!output) output = input + (inputIsFolder ? "" : ".js");
    return !!input;
}

if(!processArguments()) console.error("[ERROR] You must specify the input using the -i flag.");
else {
    var interpreter = new JsInterpreter({
        log: enableLog,
        minify: enableMinify,
        definitions: definitions,
        includeInq: includeInq
    });

    interpreter.init();
    interpreter.include(require('./modules/JavaScript+'));
    interpreter.include(require('./modules/InqScript'));
    interpreter.include(require('./modules/CellScript'));

    interpreter.execute(input);
}