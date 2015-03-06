/**
 * Function Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// constants ///
var constants = {
    separatorCharacter: ",",
    operators: [ "=", "*=", "/=", "%=", "+=", "-=", "<<=", ">>=", ">>>=", "&=", "^=", "|=" ]
};

/// methods ///
var utils = {

    separator: function(state) {
        if(validators.isSeparator(state)) {
            state.next();
            return true;
        }

        return false;
    },

    conditional: function(state) {
        return state.expressionProcessor.token(state, ["conditional"]);
    },

    leftHandSide: function(state) {
        return state.expressionProcessor.token(state, ["lefthandside"]);
    },

    operator: function(state, item) {
        if(validators.isOperator(state)) {
            item.subtype = state.token.type;
            state.next();
            return true;
        }

        return false;
    },

    assignment: function (state) {
        state.leaf();
        state.item.type = "assignment";

        var _self = state.item;

        state.levelDown("assignment");
        if(utils.conditional(state)) {
            if(validators.isOperator(state)) {
                //HACK: TODO: What the hell?
                state.levelUp();
                var leftHandSide = null;
                var level = _self;
                while (level.items.length === 1) {
                    level = level.items[0];
                    if (level.type === "lefthandside") {
                        leftHandSide = level;
                        break;
                    }
                }

                if (leftHandSide) {
                    _self.items = [leftHandSide];
                    state.item = _self;
                }
                else {
                    return false;
                }
                state.levelDown();

                if (!utils.operator(state, _self)) return false;
                if (!utils.assignment(state)) return false;
            }
        }
        else {
            return false;
        }
        state.levelUp();

        return true;
    }

};

var validators = {

    isOperator: function(state) {
        return state.token &&  constants.operators.indexOf(state.token.type) !== -1;
    },

    isSeparator: function(state) {
        return state.token && state.token.type === constants.separatorCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "assignment",

    include: function(extensionDefinition) {
        if(extensionDefinition.constants) {
            if(extensionDefinition.constants.operators) {
                constants.operators = constants.operators.concat(extensionDefinition.constants.operators)
            }
        }

        ExtensionManager.include(extensionDefinition);
    },

    canProcess: function() {
        return true;
    },

    process: function(state) {
        var result = ExtensionManager.inject("process", this, state, utils, validators);
        if(result.hasResult) return result.value;
        return utils.assignment(state);
    }

};