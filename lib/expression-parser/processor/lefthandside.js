/**
 * Function Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// constants ///
var constants = {
    newKeyword: "new",
    functionKeyword: "function",
    argumentSeparatorCharacter: ",",
    argumentsStartCharacter: "(",
    argumentsEndCharacter: ")",
    indexerStartCharacter: "[",
    indexerEndCharacter: "]",
    dotCharacter: ".",
    blockStartCharacter: "{"
};

/// methods ///
var utils = {

    new_: function(state) {
        state.leaf();
        state.item.type = "new";
        state.next();
    },

    dot: function(state) {
        state.next(); //Skip dot.

        if(validators.isIdentifier(state)) {
            state.leaf();
            state.item.type = "dot";
            state.item.name = state.token.data;

            state.next();
            return true;
        }

        return false;
    },

    indexer: function(state) {
        state.next(); //Skip indexer start.

        state.leaf();
        state.item.type = "indexer";
        state.levelDown();
            if(!state.expressionProcessor.token(state, ["expression"])) return false;
        state.levelUp();

        if(validators.isIndexerEnd(state)) {
            state.next(); //Skip indexer end.
            return true;
        }
        else {
            return false;
        }
    },

    argumentItem: function(state) {
        if(!state.expressionProcessor.token(state, ["assignment"])) return false;

        if(validators.isArgumentSeparator(state)) {
            state.next();
            return true;
        }

        return validators.isArgumentsEnd(state);
    },

    arguments: function(state) {
        state.next(); //Skip arguments start.

        state.leaf();
        state.item.type = "arguments";

        state.levelDown();
            while(!validators.isArgumentsEnd(state)) {
                if(!utils.argumentItem(state)) return false;
            }
        state.levelUp();

        state.next(); //Skip arguments end.
        return true;
    },

    memberExpressionEnd: function(state, item) {
        if(validators.isDot(state)) {
            if(utils.dot(state)) {
                utils.memberExpressionEnd(state, item);
                return true;
            }
        }
        else if(validators.isIndexerStart(state)) {
            if(utils.indexer(state)) {
                utils.memberExpressionEnd(state, item);
                return true;
            }
        }
        else if(validators.isArgumentsStart(state)) {
            if(item) item.subtype = "call";
            if(utils.arguments(state)) {
                utils.memberExpressionEnd(state, item);
                return true;
            }
        }

        return false;
    },

    memberExpression: function(state, item) {
        if(validators.isNew(state)) {
            utils.new_(state);
            if(!utils.memberExpression(state)) return false;
            if(!utils.arguments(state)) return false;
        }
        else if(validators.isFunction(state)) {
            if(!state.expressionProcessor.token(state, ["function"])) return false;
        }
        else if(state.hasScope("lambda", true) && validators.isBlockStart(state)) {
            state.processor.token(state);
            return true;
        }
        else {
            if(!state.expressionProcessor.token(state, "primary")) return false;
        }

        utils.memberExpressionEnd(state, item); //Optional ending.
        return true;
    },

    newExpression: function(state) {
        if(validators.isNew(state)) {
            utils.new_(state);
            return utils.newExpression(state);
        }
        else {
            return utils.memberExpression(state);
        }
    },

    lefthandside: function(state) {
        state.leaf();
        state.item.type = "lefthandside";

        if(validators.isNew(state)) {
            state.item.subtype = "new";
            state.levelDown();
                if(!utils.newExpression(state)) return false;
            state.levelUp();
        }
        else {
            state.item.subtype = "call"; //Might be overriden by member expression.
            var item = state.item;
            state.levelDown();
                if(!utils.memberExpression(state, item)) return false;
            state.levelUp();
        }

        return true;
    }

};

var validators = {

    isNew: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.newKeyword;
    },

    isDot: function(state) {
        return state.token && state.token.type === constants.dotCharacter;
    },

    isArgumentsStart: function(state) {
        return state.token && state.token.type === constants.argumentsStartCharacter;
    },

    isBlockStart: function(state) {
        return state.token && state.token.type === constants.blockStartCharacter;
    },

    isArgumentsEnd: function(state) {
        return state.token && state.token.type === constants.argumentsEndCharacter;
    },

    isIndexerStart: function(state) {
        return state.token && state.token.type === constants.indexerStartCharacter;
    },

    isIndexerEnd: function(state) {
        return state.token && state.token.type === constants.indexerEndCharacter;
    },

    isFunction: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.functionKeyword;
    },

    isIdentifier: function(state) {
        return state.token && state.token.type === "identifier";
    },

    isArgumentSeparator: function(state) {
        return state.token && state.token.data === constants.argumentSeparatorCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "lefthandside",

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition);
    },

    canProcess: function() {
        return true;
    },

    process: function(state) {
        var result = ExtensionManager.inject("process", this, state, utils);
        if(result.hasResult) return result.value;
        return utils.lefthandside(state);
    }

};