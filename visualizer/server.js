var express = require('express'),
    fs = require('fs'),
    app = express();

var JsCompiler = require("../js-compiler");

app.use(require('body-parser').json()); // for parsing application/json
app.use(express.static('public'));

app.post('/', function(req, res) {
    var input = req.body.input;
    console.log(input.trim());

    try {
        var compiler = new JsCompiler({ log: true });
        compiler.init();
        var results = compiler.compile(input.trim());
        if (results) {
            res.send('[' + results + ']');
        }
        else {
            res.sendStatus(404);
        }
    }
    catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.listen(8080);
