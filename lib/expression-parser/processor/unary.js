/**
 * Function Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// constants ///
var constants = {
    prefixKeywords: [ "delete", "void", "typeof", "yield" ],
    prefixPunctuations: [ "++", "--", "+", "-", "~", "!" ],
    postfixPunctuations: [ "++", "--" ],
    generatorSignCharacter: "*"
};

/// methods ///
var utils = {

    postfix: function(state) {
        if(!state.token) return false;
        
        state.leaf();
        state.item.type = "postfix";

        var item = state.item;

        var lastLine = state.token.line;
        state.levelDown();
        if(!state.expressionProcessor.token(state, ["lefthandside"])) return false;
        state.levelUp();

        if(validators.isPostfix(state) && state.token.line === lastLine /* Non-terminal */) {
            item.subtype = state.token.data;
            state.next();
        }

        return true;
    },

    unary: function(state) {
        state.leaf();
        state.item.type = "unary";

        if(validators.isPrefix(state)) {
            state.item.subtype = state.token.data;

            state.next();

            var result = ExtensionManager.inject(state.item.subtype, this, state, utils.unary);
            if(result.hasResult) return result.value;

            state.levelDown();
                if(!utils.unary(state)) return false;
            state.levelUp();
        }
        else {
            state.levelDown();
                if(!utils.postfix(state)) return false;
            state.levelUp();
        }

        return true;
    }

};

var validators = {

    isPrefixKeyword: function(state) {
        if(state.token && state.token.type === "keyword") {
            for(var i = 0; i < constants.prefixKeywords.length; ++i) {
                if(state.token.data === constants.prefixKeywords[i]) return true;
            }
        }

        return false;
    },

    isPrefixPunctuation: function(state) {
        if(state.token && state.token.type === state.token.data) {
            for(var i = 0; i < constants.prefixPunctuations.length; ++i) {
                if(state.token.type === constants.prefixPunctuations[i]) return true;
            }
        }

        return false;
    },

    isPrefix: function(state) {
        return validators.isPrefixPunctuation(state) || validators.isPrefixKeyword(state);
    },

    isPostfix: function(state) {
        if(state.token && state.token.type === state.token.data) {
            for(var i = 0; i < constants.postfixPunctuations.length; ++i) {
                if(state.token.type === constants.postfixPunctuations[i]) return true;
            }
        }

        return false;
    },

    isGeneratorSign: function(state) {
        return state.token && state.token.type === constants.generatorSignCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "unary",

    include: function(extensionDefinition) {
        if(extensionDefinition.constants) {

            if(extensionDefinition.constants.prefixKeywords) {
                constants.prefixKeywords = constants.prefixKeywords.concat(extensionDefinition.constants.prefixKeywords)
            }

            if(extensionDefinition.constants.postfixPunctuations) {
                constants.postfixPunctuations = constants.postfixPunctuations.concat(extensionDefinition.constants.postfixPunctuations)
            }

            if(extensionDefinition.constants.prefixPunctuations) {
                constants.prefixPunctuations = constants.prefixPunctuations.concat(extensionDefinition.constants.prefixPunctuations)
            }

        }

        ExtensionManager.include(extensionDefinition);
    },

    canProcess: function() {
        return true;
    },

    process: function(state) {
        return utils.unary(state);
    }

};