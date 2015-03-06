/**
 * PreprocessorState for CellScript Parser
 */

module.exports = function() {

    // private variables ///
    var variables = [];

    var options = {
        cell: ""
    };

    var flags = {
        strict: false,
        minify: true,
        typechecks: false
    };

    /// public methods ///
    this.flag = function(name, value) {
        if(arguments.length === 1) {
            return flags[name];
        }
        else {
            flags[name] = !!value;
        }
    };

    this.option = function(name, value) {
        if(arguments.length === 1) {
            return options[name];
        }
        else {
            options[name] = value;
        }
    };

    this.set = function(name, value) {
        variables[name] = value;
    };

    this.get = function(name) {
        return variables[name];
    };

    this.globalEnvironment = null;

};