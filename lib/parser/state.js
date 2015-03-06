/**
 * State Store for the CellScript Parser
 */

/// includes ///
var PreprocessorState = require("./preprocessor"),
    environmentManager  = require("./environment");

/// public interface ///
module.exports = function(processor, expressionProcessor) {

    /// private variables ///
    var index = 0;
    var tokens = [];
    var level = [];
    var stack = [];
    var scopeStack = [];
    var leafStack = [];
    var contextStack = [];
    var outerEnvironment = null;
    var environment = null;
    var leaf = null;

    /// public variables ///
    this.preprocessor = new PreprocessorState();
    this.processor = processor;
    this.expressionProcessor = expressionProcessor;

    this.token = null;
    //this.lookahead = null;
    //this.lookback = null;

    this.tree = [];
    this.item = null;

    this.scope = "default";
    this.time = 0;

    this.ok = true;

    this.context = null;

    this.pushContext = function(value) {
        if(this.context) contextStack.push(this.context);
        this.context = value;
    };

    this.popContext = function() {
        return this.context = contextStack.pop();
    };

    /// public methods ///
    this.begin = function (input) {
        tokens = input;

        this.token = tokens[index];
        //this.lookahead = tokens[index + 1];

        this.tree = [];
        level = this.tree;
    };

    this.prepareLeaf = function (obj) {
        leafStack.push(this.item);
        leaf = obj;
        leaf.items = [] || leaf.items;
    };

    this.clearLeaf = function() {
        leaf = null;
        this.item = leafStack.pop();
    };

    this.leaf = function () {
        this.item = leaf || { items: [] };
        if(!leaf) level.push(this.item);
        leaf = null;
    };

    this.levelDown = function (scope) {
        stack.push(level);
        scopeStack.push(this.scope);

        level = this.item.items;
        this.scope = scope || this.scope;
    };

    this.levelUp = function () {
        level = stack.pop();
        this.scope = scopeStack.pop();
    };

    this.hasScope = function(scopeName, explicit) {
        if(explicit) return this.scope === scopeName;
        else {
            if(this.scope === scopeName) return true;
            for(var i = 0; i < scopeStack.length; ++i)
                if(scopeStack[i] === scopeName) return true;
            return false;
        }
    };

    this.end = function (success) {
        this.token = null;
        if(!success) {
            this.ok = false;
            process.exit(132);
        }
    };

    this.lookback = function() {
        return tokens[index - 1];
    };

    this.lookahead = function() {
        return tokens[index + 1];
    };

    this.next = function () {
        this.token = tokens[++index];
    };

    this.previous = function (deleteLeaves) {
        for(var i = 0; i < deleteLeaves; ++i) level.pop();
        this.item = level[level.length-1];
        this.token = tokens[--index];
    };

    this.error = function (message) {
        if(!this.ok) return; //Already failed.

        console.error(JSON.stringify(this.token));
        console.error("[PARSER ERROR at line " + (this.token ? this.token.line + ", char " + this.token.char : "unknown") + "] " + message);
        this.end(false);
    };

    this.warn = function (message) {
        //console.warn(JSON.stringify(this.token));
        console.warn("[PARSER WARNING at line " + (this.token ? this.token.line + ", char " + this.token.char : "unknown") + "] " + message);
    };

    this.warnLookback = function (message) {
        //console.warn(JSON.stringify(this.token));
        var _token = this.lookback();
        console.warn("[PARSER WARNING at line " + (_token ? _token.line + ", char " + _token.char : "unknown") + "] " + message);
    };

    this.createLexicalEnvironment = function() {
        outerEnvironment = environment;
        environment = environmentManager.newDeclarativeEnvironment(outerEnvironment);
        if(this.item) this.item.environment = environment;
    };

    this.finalizeLexicalEnvironment = function() {
        environment = outerEnvironment;
        if(environment) outerEnvironment = environment.outer();
    };

    this.lexicalEnvironment = function() {
        return environment;
    }

};