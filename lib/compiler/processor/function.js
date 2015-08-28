/**
 * Function Processor for the CellScript to JS Compiler.
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

function extractValue(item) {
    if(item.defaultValueExpression) {
        switch (item.type)
        {
            case "string":
            case "text":
                return '"' + item.defaultValueExpression.value + '"';

            case "bool":
            case "logic":
            case "color":
            case "int":
            case "number":
            default:
                return 0 + item.defaultValueExpression.value;
        }
    }
    else
    {
        switch (item.type)
        {
            case "string":
            case "text":
                return '""';

            case "bool":
            case "logic":
            case "color":
            case "int":
            case "number":
            default:
                return 1;
        }
    }
}

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(leaf) {
        return leaf.type === "function";
    },

    process: function(leaf, state) {
        state.print('[100,100,[["procDef", ');
        state.print('"' + leaf.fullName + '", ');
        state.print('[' + leaf.parameters.map(function(item) { return '"' + item.internalName + '"' }).join(', ') + '], ');
        state.print('[' + leaf.parameters.map(function(item) { return extractValue(item) }).join(', ') + '], ');
        state.print('false]');
        if(leaf.items.length) state.print(', ');

        state.pushContext(leaf);
        state.levelDown();

        ExtensionManager.inject("before-body", this, leaf, state);

        var result = ExtensionManager.inject("body", this, leaf, state);
            if(!result.hasResult) {
                state.processor.level(leaf.items, state);
            }

        ExtensionManager.inject("after-body", this, leaf, state);

        state.levelUp();
        state.popContext();

        state.print(']]');
    }

};