/**
 * Variable Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    scope: function(state) {
        state.item.scope = "global";
        if(validators.isVariable(state)) {
            state.item.scope = "local";
            state.next();
        }
        else if(validators.isLet(state)) {
            state.item.scope = "block";
            state.next();
        }
        else if(validators.isConst(state)) {
            state.item.scope = "const";
            state.next();
        }
        else {
            state.error(constants.unexpectedToken);
            return false;
        }
    },

    name: function(state) {
        if(!validators.isIdentifier(state)) return state.error("Unexpected token found.");
        state.item.name = state.token.data;
        state.lexicalEnvironment().record().createImmutableBinding(state.item.name);
        state.next();
    },

    equalSign: function(state) {
        if(validators.isEqualSign(state)) {
            state.next();
            return true;
        }

        return false;
    },

    expression: function(state) {
        state.levelDown("value");
        state.expressionProcessor.token(state, ["assignment"]);
        state.levelUp();
    },

    type: function(state) {
        if (validators.isTypeSpecifierSign(state)) {
            state.next(); //Skip type specifier sign.

            if (validators.isIdentifier(state)) {
                state.item.valueType = state.token.data;
                state.next();
                return true;
            }
            else {
                state.error(constants.unexpectedToken);
                return false;
            }
        }

        return false;
    },

    separator: function(state) {
        if(validators.isColon(state)) {
            state.next();
            return true;
        }

        return false;
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.letKeyword,

    canProcess: function(state) {
        return validators.isVariable(state) || validators.isLet(state) || validators.isConst(state);
    },

    process: function(state) {
       // if(state.scope === "value") return state.error("Unexpected variable statement.");
        state.leaf();

        state.item.type = "variable";

        utils.scope(state);

        state.levelDown();
        do {
            state.leaf();
            state.item.type = "variableDeclaration";

            utils.name(state);
            if (utils.equalSign(state)) {
                utils.expression(state);
            }
            else {
                utils.type(state);
            }
        }
        while(utils.separator(state));
        state.levelUp();

        utils.semicolon(state);
    }

};