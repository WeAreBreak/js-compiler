/**
 * Function Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// constants ///
var constants = {
    blockStartCharacter: "{",
    blockEndCharacter: "}",
    segmentStartCharacter: "(",
    segmentEndCharacter: ")",
    functionKeyword: "function",
    parameterSeparatorCharacter: ",",
    equalSignCharacter: "=",
    typeSpecifierSignCharacter: ":",
    generatorSignCharacter: "*"
};

/// methods ///
var utils = {

    block: function (state) {
        if(!validators.isBlockStart(state)) return state.error("Missing block start.");
        state.next(); //Skip block start.

        var generator = state.item.generator;
        state.levelDown("function");
        if(generator) state.levelDown("generator");
        while(state.token && !validators.isBlockEnd(state)) {
            state.processor.token(state);
        }
        if(generator) state.levelUp();
        state.levelUp();

        state.next(); //Skip block end.

        return true;
    },

    generator: function(state) {
        if(validators.isGeneratorSign(state)) {
            if(state.item.generator) {
                state.error("Unexpected token ILLEGAL.");
                return false;
            }
            state.item.generator = true;
            state.next();
        }
    },

    name: function(state) {
        if(validators.isIdentifier(state)) {
            if(state.item.name) {
                state.error("Unexpected token ILLEGAL.");
                return false;
            }
            state.item.name = state.token.data;
            state.next();
        }
        else if(!state.item.name) state.item.name = "";
    },

    parameters: function(state) {
        if(!validators.isSegmentStart(state)) return state.error("Missing function parameters.");
        state.next(); //Skip segment start.

        var parameter;
        state.item.parameters = [];
        while(state.token && validators.isIdentifier(state)) {
            parameter = { type: "parameter", name: state.token.data };
            state.item.parameters.push(parameter);
            state.next();

            if(validators.isParameterSeparator(state)) {
                state.next();
            }
            else if (validators.isSegmentEnd(state)) break;
            else return state.error("Unexpected token ILLEGAL.");
        }

        if(!validators.isSegmentEnd(state)) return state.error("Unexpected token ILLEGAL.");
        state.next(); //Skip segment end.

        return true;
    }

};

var validators = {

    isFunction: function(state) {
        return state.token && (state.token.type === "keyword" && state.token.data === constants.functionKeyword);
    },

    isIdentifier: function(state) {
        return state.token && state.token.type === "identifier";
    },

    isLiteral: function(state) {
        return state.token && state.token.type === "literal";
    },

    isSegmentStart: function(state) {
        return state.token && state.token.type === constants.segmentStartCharacter;
    },

    isSegmentEnd: function(state) {
        return state.token && state.token.type === constants.segmentEndCharacter;
    },

    isBlockStart: function(state) {
        return state.token && state.token.type === constants.blockStartCharacter;
    },

    isBlockEnd: function(state) {
        return state.token && state.token.type === constants.blockEndCharacter;
    },

    isParameterSeparator: function(state) {
        return state.token && state.token.type === constants.parameterSeparatorCharacter;
    },

    isEqualSign: function(state) {
        return state.token && state.token.type === constants.equalSignCharacter;
    },

    isTypeSpecifierSign: function(state) {
        return state.token && state.token.type === constants.typeSpecifierSignCharacter;
    },

    isGeneratorSign: function(state) {
        return state.token && state.token.type === constants.generatorSignCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "function",

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(state) {
        var result = ExtensionManager.inject("canProcess", this, state, utils);
        if(result.hasResult) return result.value;
        return validators.isFunction(state);
    },

    process: function(state) {
        state.leaf();

        state.item.type = "function";
        state.item.isExpression = true;
        state.next(); // Skip the function marker.

        var result = ExtensionManager.inject("process", this, state, utils);
        if(result.hasResult) return result.value;

        utils.generator(state);
        utils.name(state);

        if (utils.parameters(state) === true) {
            if (utils.block(state) === true) {
                return true;
            }
        }

        return false;
    }

};