/**
 * Environment Store for the CellScript Parser
 */

var EnvironmentBinding = function(name, mutable, deletable) {

    /// private variables ///
    var value = undefined;
    var initialised = false;


    /// public methods ///
    this.getName = function() {
        return name;
    };

    this.isMutable = function() {
        return mutable;
    };

    this.isDeletable = function() {
        return deletable;
    };

    this.getValue = function() {
        if(!initialised) return undefined;
        return value;
    };

    this.setValue = function(newValue) {
        if(mutable || !initialised) value = newValue;
        else return false;
        return initialised = true;
    };

};

var EnvironmentRecord = function() {

    /// private variables ///
    var bindings = [];


    /// public methods ///
    this.hasBinding = function(name) {
        return (bindings[name] !== undefined);
    };

    this.createMutableBinding = function(name, deletable) {
        if(this.hasBinding(name)) return false;
        else bindings[name] = new EnvironmentBinding(name, true, deletable);
        return true;
    };

    this.setMutableBinding = function(name, value) {
        if(!this.hasBinding(name)) return false;
        return bindings[name].setValue(value);
    };

    this.createImmutableBinding = function(name) {
        if(this.hasBinding(name)) return false;
        else bindings[name] = new EnvironmentBinding(name, false, false);
        return true;
    };

    this.initializeImmutableBinding = function(name, value) {
        if(!this.hasBinding(name)) return false;
        return bindings[name].setValue(value);
    };

    this.getBindingValue = function(name) {
        if(!this.hasBinding(name)) return undefined;
        return bindings[name].getValue();
    };

    this.deleteBinding = function(name) {
        if(!this.hasBinding(name)) return true;
        var binding = bindings[name];
        if(binding.isDeletable()) bindings[name] = undefined;
        return binding.isDeletable();
    };

    this.implicitThisValue = function() {
        return bindings["this"] || undefined;
    };

};

var ObjectEnvironmentRecord = function(binding) {

    /// public flags ///
    this.provideThis = true;

    /// public methods ///
    this.hasBinding = function(name) {
        return (binding[name] !== undefined);
    };

    this.createMutableBinding = function(name, deletable) {
       return true;
    };

    this.setMutableBinding = function(name, value) {
        binding[name] = value;
    };

    this.getBindingValue = function(name) {
        return binding[name];
    };

    this.deleteBinding = function(name) {
        delete binding[name];
    };

    this.implicitThisValue = function() {
        if(!this.provideThis) return undefined;
        return binding;
    };

};


var Reference = function(baseValue, name) {

    /// public methods ///
    this.getBaseValue = function() {
        return baseValue;
    };

    this.getReferencedName = function() {
        return name;
    };

};

var LexicalEnvironment = function(record, outer) {

    /// public methods ///
    this.record = function() {
        return record;
    };

    this.hasOuter = function() {
        return outer !== undefined;
    };

    this.outer = function() {
        return outer;
    };

    this.getIdentifierReference = function(name) {
        if(record.hasBinding(name)) {
            return new Reference(record, name);
        }
        else if(this.hasOuter()) {
            return outer.getIdentifierReference(name);
        }
        else {
            return new Reference(undefined, name);
        }
    };

};

/// public interface ///
module.exports = {

    getIdentifierReference: function(env, name) {
        if(!env) {
            return new Reference(undefined, name);
        }
        else {
            return env.getIdentifierReference(name);
        }
    },

    newDeclarativeEnvironment: function(outer) {
        return new LexicalEnvironment(new EnvironmentRecord(), outer);
    },

    newObjectEnvironment: function(object, outer) {
        return new LexicalEnvironment(new ObjectEnvironmentRecord(object), outer);
    }

};