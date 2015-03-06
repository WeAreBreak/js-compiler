/**
 * Function Processor for the CellScript to JS Compiler.
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// constants ///
var constants = {
    textOperators: [ "typeof", "void", "delete", "yield" ]
};

/// validators ///
var validators = {
    isTextOperator: function(text) {
        return constants.textOperators.indexOf(text) !== -1;
    }
};

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        if(extensionDefinition.constants) {
            if(extensionDefinition.constants.textOperators) {
                constants.textOperators = constants.textOperators.concat(extensionDefinition.constants.textOperators)
            }
        }

        ExtensionManager.include(extensionDefinition);
    },

    canProcess: function(leaf) {
        var result = ExtensionManager.inject("canProcess", this, leaf);
        if(result.hasResult) return result.value;
        return leaf.type === "unary";
    },

    process: function(leaf, state) {
        if(leaf.subtype) {
            //Prefix
            state.print(leaf.subtype);
            if(validators.isTextOperator(leaf.subtype)) state.meaningfulSpace();
            state.processor.leaf(leaf.items[0], state);
        }
        else {
            //Postfix
            state.processor.leaf(leaf.items[0], state);
        }
    }

};