/**
 * Primary Expression Combination for the CellScript Expression Parser
 */

/// public interface ///
module.exports = {
    name: "primary",
    value: [ "identifier", "literal", "array", "object", "this", "group" ]
};