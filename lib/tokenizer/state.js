/**
 * State Store for the CellScript Tokenizer
 */

module.exports = function() {

    /// private variables ///
    var index = 0;
    var input = "";
    var allowNewLine = true;

    /// public variables ///
    this.char = "";
    this.lookahead = "";
    this.lookback = "";

    this.tokens = [];
    this.lastToken = null;
    this.tokenValue = "";

    this.ok = true;

    this.line = 1;
    this.charIndex = 1;

    /// public methods ///
    this.begin = function(text) {
        input = text;
        index = 0;

        this.lookback = "";
        this.char = input[index];
        this.lookahead = input[index + 1];
    };

    this.nonTerminalMode = function() {
        allowNewLine = false;
    };

    this.newLine = function() {
        if(!allowNewLine) return false;

        this.line++;
        this.charIndex = 1;
        return true;
    };

    this.next = function() {
        this.lookback = this.char;
        this.char = input[++index];
        this.lookahead = input[index + 1];
        this.charIndex++;
    };

    this.add = function(value) {
        this.tokenValue += value || this.char;
    };

    this.token = function(type, subtype) {
        this.lastToken = { type: type, subtype: subtype, line: this.line, char: this.charIndex, data: this.tokenValue };
        this.tokens.push(this.lastToken);
        this.tokenValue = "";

        allowNewLine = true;
    };

    this.error = function(message) {
        if(!this.ok) return; //Already failed.

        console.error("[TOKENIZER ERROR at line " + this.line + ", char " + this.charIndex + "] " + message);
        this.end(false);
    };

    this.end = function(success) {
        this.lookback = null;
        this.char = null;
        this.lookahead = null;

        if(!success) {
            this.ok = false;
            process.exit(131);
        }
    };

};