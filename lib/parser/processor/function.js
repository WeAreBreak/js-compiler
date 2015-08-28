/**
 * Function Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils,
    ExtensionManager = new parserUtils.ExtensionManager();

/// methods ///
utils = utils.extend({

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
        if(state.token && state.token.type == "identifier") {
            if(state.item.name) {
                state.error("Unexpected token ILLEGAL.");
                return false;
            }
            state.item.name = state.token.data;
            state.lexicalEnvironment().record().createImmutableBinding(state.item.name);
            state.next();
        }
        else if(!state.token || state.scope !== "value") {
            return state.error(constants.unexpectedToken);
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
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.functionKeyword,

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
        state.next(); // Skip the function marker.

        var result = ExtensionManager.inject("process", this, state, utils);
        if(result.hasResult) return result.value;

        utils.generator(state);

        utils.name(state);
        utils.parameters(state);

        if(state.item.generator) utils.block(state, "function", "generator");
        else utils.block(state, "function");
    }

};