/**
 * Function Processor for the CellScript to JS Compiler.
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition);
    },

    canProcess: function(leaf) {
        var result = ExtensionManager.inject("canProcess", this, leaf);
        if(result.hasResult) return result.value;
        return leaf.type === "assignment";
    },

    process: function(leaf, state) {
        if(leaf.subtype) {
            state.processor.leaf(leaf.items[0], state);
            state.print(" " + leaf.subtype + " ");
            state.processor.leaf(leaf.items[1], state);
        }
        else {
            //Conditional
            state.processor.leaf(leaf.items[0], state);
        }
    }

};