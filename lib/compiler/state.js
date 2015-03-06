/**
 * State Store for the CellScript to JS Compiler
 */

/// public interface ///
module.exports = function(processor) {

    /// private variables ///
    var outputStack = [];
    var contextStack = [];
    var indent = "";
    var output_end = "";
    var indented = false;
    var indentation = "    ";

    /// public variables ///
    this.preprocessor = null;
    this.processor = processor;
    this.returned = false;

    this.configuration = {
        minify: true
    };

    this.output = "";

    this.context = null;

    this.pushContext = function(value) {
        if(this.context) contextStack.push(this.context);
        this.context = value;
    };

    this.popContext = function() {
        return this.context = contextStack.pop();
    };

    /// public methods ///
    this.begin = function (preprocessor) {
        this.preprocessor = preprocessor;
    };

    this.levelDown = function () {
        indent += indentation;
        outputStack.push(output_end);
        output_end = "";
        this.returned = false;
    };

    this.levelUp = function () {
        indent = indent.substring(indentation.length);
        this.mergeOutputs();
        output_end = outputStack.pop();
    };

    this.print_indent = function() {
        if(indented) return;
        if(!this.configuration.minify) this.output += indent;
        indented = true;
    };

    this.line_break = function(force) {
        if(!this.configuration.minify || force)this.output += "\r\n";
        indented = false;
    };

    this.meaningfulSpace = function () {
        if(!indented) this.print_indent();
        this.output += " ";
    };

    this.print = function (txt) {
        if(!indented) this.print_indent();
        if(this.configuration.minify) txt = (""+txt).trim();
        this.output += txt;
    };

    this.println = function (txt, forceLineBreak) {
        this.print(txt);
        this.line_break(forceLineBreak);
    };

    /*this.println_end = function (txt) {
        output_end = indent + txt + "\r\n" + output_end;
    };*/

    this.mergeOutputs = function () {
        this.output += output_end;
        output_end = "";
    };
};