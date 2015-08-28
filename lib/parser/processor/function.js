/**
 * Function Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils,
    ExtensionManager = new parserUtils.ExtensionManager();

function extractType(typeName) {
    switch (typeName)
    {
        case "string":
        case "text":
            return "%s";

        case "bool":
        case "logic":
            return "%b";

        case "color":
            return "%c";

        case "int":
        case "number":
        default:
            return "%n";
    }
}

/// methods ///
utils = utils.extend({

    name: function(state) {
        if(state.token && state.token.type == "identifier") {
            if(state.item.name) {
                state.error("Unexpected token ILLEGAL.");
                return false;
            }
            state.item.name = state.token.data;

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

        var parameter, wasRest = false;
        state.item.parameters = [];
        while(state.token && validators.isIdentifier(state) && !wasRest) {
            parameter = { type: "int" };

            parameter.name = state.token.data;
            state.lexicalEnvironment().record().createImmutableBinding(parameter.name);
            state.lexicalEnvironment().record().initializeImmutableBinding(parameter.name, 'parameter');
            parameter.internalName = state.lexicalEnvironment().record().getUniqueName(parameter.name);

            state.item.parameters.push(parameter);
            state.next();

            if(validators.isParameterSeparator(state)) {
                state.next();
            }
            else if (validators.isSegmentEnd(state)) break;
            else {
                if (validators.isEqualSign(state)) {
                    state.next(); //Skip equal sign.

                    parameter.defaultValueExpression = {};
                    state.prepareLeaf(parameter.defaultValueExpression);
                    if(!state.expressionProcessor.token(state, ["literal"])) return state.error("Unexpected token ILLEGAL.");
                    parameter.type = state.item.subtype;
                    state.clearLeaf();
                }
                else if (validators.isTypeSpecifierSign(state)) {
                    state.next(); //Skip type specifier sign.
                    if (validators.isIdentifier(state)) {
                        parameter.type = state.token.data;
                    }
                    else return state.error("Unexpected token ILLEGAL.");

                    state.next(); //Skip processed default value or type.
                }
                else {
                    return state.error("Unexpected token ILLEGAL.");
                }

                if (validators.isParameterSeparator(state)) {
                    state.next();
                }
                else if (validators.isSegmentEnd(state)) break;
                else return state.error("Unexpected token ILLEGAL.");
            }
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
        if(state.hasScope('on')) return state.error('Unexpected function statement.');
        state.leaf();

        state.item.type = "function";
        state.next(); // Skip the function marker.

        var result = ExtensionManager.inject("process", this, state, utils);
        if(result.hasResult) return result.value;

        state.createLexicalEnvironment();

        utils.name(state);
        utils.parameters(state);

        var full_name = state.item.name + ' ' + state.item.parameters.map(function(item) { return extractType(item.type) }).join(' ');
        state.item.fullName = full_name;

        state.lexicalEnvironment().record().createImmutableBinding(state.item.name);
        state.lexicalEnvironment().record().initializeImmutableBinding(state.item.name, full_name);

        utils.block(state, "on");

        state.finalizeLexicalEnvironment();

    }

};