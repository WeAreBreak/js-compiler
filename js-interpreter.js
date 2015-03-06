/**
 * CellScript to JavaScript Compiler
 */

var JsCompiler = require('./js-compiler'),
    fs = require("fs"),
    path = require("path"),
    spawn = require('child_process').spawn;

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

/// public interface ///
module.exports = function(options) {
    options = options || {};
    var compiler = new JsCompiler(options);

    this.init = function() {
       compiler.init();
    };

    this.include = function(moduleDefinition) {
        compiler.include(moduleDefinition);
    };

    this.execute = function(input) {
        fs.readFile(path.resolve(process.cwd(), input), { encoding: "utf8" }, function(err, content) {
            if(err) return console.error("[ERROR] " + err);

            var results = compiler.compile(content);
            if(results) {
                var output = path.resolve(process.cwd(), input + ".temp." + randomString(10) + ".js");
                fs.writeFile(output, results, { encoding: "utf8" }, function(err) {
                    if(err) return console.error("[ERROR] " + err);

                    var node = spawn('node', ['--harmony',output], { stdio: [0,1,2] });

                    process.on('SIGINT', function() {
                        node.kill('SIGINT');
                    });

                    node.on('close', function () {
                        fs.unlinkSync(output);
                        process.exit();
                    });
                });
            }
        });
    };
};