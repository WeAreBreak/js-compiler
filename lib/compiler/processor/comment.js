/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "comment";
    },

    process: function(leaf, state) {
        if(state.configuration.minify) return;

        if(leaf.subtype == "single") {
            state.println("//" + leaf.value, true);
        }
        else {
            state.println("/*" + leaf.value + "*/");
        }
    }

};