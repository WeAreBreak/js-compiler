/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// constants ///
var constants = {
    textOperators: [ "instanceof", "in" ]
};

/// validators ///
var validators = {
    isTextOperator: function(text) {
        return constants.textOperators.indexOf(text) !== -1;
    }
};

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "operator";
    },

    process: function(leaf, state) {
        if(leaf.subtype) {

            if (validators.isTextOperator(leaf.subtype)) state.meaningfulSpace();
            else state.print(" ");

            state.print(leaf.subtype);

            if (validators.isTextOperator(leaf.subtype)) state.meaningfulSpace();
            else state.print(" ");
        }
    }

};