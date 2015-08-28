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

    segmentStart: function(state) {
        if(!validators.isSegmentStart(state)) return false;
        state.next(); //Skip segment start.
        return true;
    },

    expression: function(state) {
        state.item.expression = {};

        state.prepareLeaf(state.item.expression);
        if(!state.expressionProcessor.token(state, ["expression"])) return state.error(constants.unexpectedToken);
        state.clearLeaf();
    },

    segmentEnd: function(state) {
        if(!validators.isSegmentEnd(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip segment end.
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/on",

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(state) {
        var result = ExtensionManager.inject("canProcess", this, state, utils);
        if(result.hasResult) return result.value;
        return state.token && state.token.type === "keyword" && state.token.data === "on";
    },

    process: function(state) {
        if(state.hasScope('on')) return state.error('Unexpected on statement.');

        state.leaf();

        state.item.type = "on";
        state.next(); // Skip the on marker.

        var result = ExtensionManager.inject("process", this, state, utils);
        if(result.hasResult) return result.value;

        utils.name(state);
        if(utils.segmentStart(state)) {
            utils.expression(state);
            utils.segmentEnd(state);
        }
        utils.block(state, "on"); //TODO: Is on requries a separate parser scope?
    }

};