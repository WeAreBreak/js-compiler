/**
 * Variable Expression Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    variableKeyword: "var",
    equalSignCharacter: "=",
    semicolonCharacter: ";",
    separatorCharacter: ",",
    blockEndCharacter: "}",
    typeSpecifierSignCharacter: ":"
};

/// methods ///
var utils = {

    scope: function(state) {
        state.item.scope = "global";
        if(validators.isVariableKeyword(state)) {
            state.item.scope = "local";
            state.next();

            return true;
        }

        return false;
    },

    name: function(state) {
        if(!validators.isIdentifier(state)) return false;
        state.item.name = state.token.data;
        state.next();

        return true;
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
        if(!state.expressionProcessor.token(state, ["assignmentNoIn"])) return false;
        state.levelUp();

        return true;
    },

    type: function(state) {
        if (validators.isTypeSpecifierSign(state)) {
            state.next(); //Skip type specifier sign.

            if (validators.isIdentifier(state)) {
                state.item.valueType = state.token.data;
                state.next();

                return true;
            }
        }

        return false;
    },

    semicolon: function(state) {
        if(validators.isSemicolon(state)) {
            state.next();
            return true;
        }
        else if(!validators.isBlockEnd(state)) {
            return false;
        }
    },

    separator: function(state) {
        if(validators.isSeparator(state)) {
            state.next();
            return true;
        }

        return false;
    }

};

var validators = {

    isVariableKeyword: function(state) {
        return (state.token && state.token.type === "keyword" && state.token.data === constants.variableKeyword);
    },

    isGlobalVariableDeclaration: function(state) {
        return state.token && validators.isIdentifier(state) && state.lookahead.type === constants.equalSignCharacter;
    },

    isVariable: function(state) {
        return validators.isVariableKeyword(state);
    },

    isIdentifier: function(state) {
        return state.token && state.token.type === "identifier";
    },

    isSemicolon: function(state) {
        return state.token && state.token.type === constants.semicolonCharacter;
    },

    isSeparator: function(state) {
        return state.token && state.token.type === constants.separatorCharacter;
    },

    isEqualSign: function(state) {
        return state.token && state.token.type === constants.equalSignCharacter;
    },

    isBlockEnd: function(state) {
        return state.token && state.token.type === constants.blockEndCharacter;
    },

    isVariableEnd: function(state) {
        return validators.isSemicolon(state) || validators.isBlockEnd(state);
    },

    isTypeSpecifierSign: function(state) {
        return state.token && state.token.type === constants.typeSpecifierSignCharacter;
    }

};

/// public interface ///
module.exports = {

    name: "variableDeclarationNoIn",

    canProcess: function(state) {
        return validators.isVariable(state);
    },

    process: function(state) {
       // if(state.scope === "value") return state.error("Unexpected variable statement.");
        state.leaf();

        state.item.type = "variableDeclarationList";

        if(!utils.scope(state)) return false;

        state.levelDown();
        do {
            state.leaf();
            state.item.type = "variableDeclaration";

            if(!utils.name(state)) return false;
            if (utils.equalSign(state)) {
                if(!utils.expression(state)) return false;
            }
            else {
                utils.type(state);
            }
        }
        while(utils.separator(state));
        state.levelUp();

        return true;
    }

};