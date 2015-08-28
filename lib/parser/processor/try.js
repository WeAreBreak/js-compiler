/**
 * Function Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    tryBlock: function (state) {
        if(!validators.isBlockStart(state)) return state.error("Missing block start.");
        state.next(); //Skip block start.

        var item = state.item;

        state.levelDown();
        state.leaf();
        state.item.type = "try";
        utils.statementsInBlock(state);
        state.levelUp();

        state.item = item;

        state.next(); //Skip block end.
    },

    catchBlock: function (state) {
        if(!validators.isBlockStart(state)) return state.error("Missing block start.");
        state.next(); //Skip block start.

        var item = state.item;

        state.levelDown();
        state.leaf();
        state.item.type = "catch";
        utils.statementsInBlock(state);
        state.levelUp();

        state.item = item;

        state.next(); //Skip block end.
    },

    finallyBlock: function (state) {
        if(!validators.isBlockStart(state)) return state.error("Missing block start.");
        state.next(); //Skip block start.

        var item = state.item;

        state.levelDown();
        state.leaf();
        state.item.type = "finally";
        utils.statementsInBlock(state);
        state.levelUp();

        state.item = item;

        state.next(); //Skip block end.
    },

    name: function(state) {
        state.item.name = "";
        if(validators.isIdentifier(state)) {
            state.item.name = state.token.data;
            state.next();
        }
        else if(state.scope !== "value") {
            return state.error(constants.unexpectedToken);
        }
    },

    segmentStart: function(state) {
        if(validators.isSegmentStart(state)) {
            state.next();
            return true;
        }

        state.error(constants.unexpectedToken);
        return false;
    },

    segmentEnd: function(state) {
        if(validators.isSegmentEnd(state)) {
            state.next();
            return true;
        }

        state.error(constants.unexpectedToken);
        return false;
    },

    catch_: function(state) {
        if(validators.isCatch(state)) {
            state.next();
            return true;
        }

        return false;
    },

    finally_: function(state) {
        if(validators.isFinally(state)) {
            state.next();
            return true;
        }

        return false;
    }
});

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.tryKeyword,

    canProcess: function(state) {
        return validators.isTry(state);
    },

    process: function(state) {
        state.leaf();

        state.item.type = "try";
        state.next(); // Skip the try keyword.

        utils.tryBlock(state);
        var hasCatchOrFinally = false;

        if(utils.catch_(state)) {
            utils.segmentStart(state);
            utils.name(state);
            utils.segmentEnd(state);
            utils.catchBlock(state);
            hasCatchOrFinally = true;
        }

        if(utils.finally_(state)) {
            utils.finallyBlock(state);
            hasCatchOrFinally = true;
        }

        if(!hasCatchOrFinally) {
            return state.error("Missing catch or finally after try");
        }
    }

};