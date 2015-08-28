/// includes ///
var JsCompiler = require("../js-compiler"),
    fs           = require("fs"),
    path         = require("path"),
    dir          = require("../lib/utils/directory");

/// private variables ///
var enableLog = false;
var enableMinify = false;
var inputIsFolder = false;
var enableSilent = false;
var includeInq = false;
var includeExperimental = false;
var definitions = [];
var input = "";
var output = "";

/// methods ///
function processArguments() {
    var arg;
    for(var i = 2; i < process.argv.length; ++i) {
        arg = process.argv[i];
        if(arg === "-l" || arg === "-log") enableLog = true;
        else if(arg === "-m" || arg === "--minify") enableMinify = true;
        else if(arg === "-f" || arg === "--folder") inputIsFolder = true;
        else if(arg === "-s" || arg === "--silent") enableSilent = true;
        else if(arg === "-i" || arg === "--input") input = process.argv[++i];
        else if(arg === "-o" || arg === "--output") output = process.argv[++i];
        else if(arg === "-e" || arg === "--ensure") includeInq = true;
        else if(arg === "-d" || arg === "--define") definitions = process.argv[++i].split(' ');
        else console.error("[WARNING] Unknown compiler flag: " + arg);
    }

    if(!output) output = input + (inputIsFolder ? "" : ".js");
    return !!input;
}

function walk(dir, ext) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file, ext));
        else if(path.extname(file) === ext) results.push(file);
    });
    return results;
}

if(!processArguments()) console.error("[ERROR] You must specify the input using the -i flag.");
else {
    var compiler = new JsCompiler({
        log: enableLog,
        minify: enableMinify,
        definitions: definitions,
        includeInq: includeInq
    });
    compiler.init();

    if(inputIsFolder) {
        var fullInput = path.join(process.cwd(), input);
        var fullOutput = path.join(process.cwd(), output);

        var files = walk(fullInput, ".js");
        !function next(i) {
            if(i < files.length) {
                var file = files[i];

                fs.readFile(file, { encoding: "utf8" }, function (err, content) {
                    if (err) return console.error("[ERROR] " + err);

                    if(!enableSilent) console.log(file);
                    var results = compiler.compile(content);
                    if (results) {
                        var out = path.join(fullOutput, file.substring(fullInput.length));
                        var outDir = path.dirname(out);
                        dir.mkdir(outDir, function() {
                            if (err) return console.error("[ERROR] " + err);
                            fs.writeFile(path.resolve(__dirname, out), results, { encoding: "utf8" }, function (err) {
                                if (err) return console.error("[ERROR] " + err);
                                if (enableLog) console.log("Success. :)");
                                next(i + 1);
                            });
                        });
                    }
                });
            }
            else {
                compiler.stats();
            }
        }(0);
    }
    else {
        fs.readFile(path.resolve(process.cwd(), input), { encoding: "utf8" }, function(err, content) {
            if(err) return console.error("[ERROR] " + err);

            var results = compiler.compile(content);
            if(results) {
                fs.writeFile(path.resolve(process.cwd(), output), results, { encoding: "utf8" }, function(err) {
                    if(err) return console.error("[ERROR] " + err);
                    if(enableLog) console.log("Success. :)");
                });
            }
        });
    }
}