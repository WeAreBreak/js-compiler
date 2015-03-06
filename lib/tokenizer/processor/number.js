/**
 * Numeric Literal Processor for the CellScript Tokenizer
 */

var constants = {
    zero: "0",
    hexMarkers: "xX",
    exponentIndicators: "eE",
    digits: "0123456789",
    hexDigits: "0123456789abcdefABCDEF",
    dotCharacter: ".",
    signs: "-+"
};

var utils = {
    hex: function(state) {
        //Add the leading zero.
        state.add();
        state.next();

        //Add the hex marker.
        state.add();
        state.next();

        //Verify the hex literal.
        if(!state.char || !validators.isHexDigit(state)) {
            return state.error("Unexpected token ILLEGAL.");
        }

        //Add the hex digits.
        do {
            state.add();
            state.next();
        }
        while(state.char && validators.isHexDigit(state));
    },

    digits: function(state, optional) {
        //Verify digits.
        if(!optional && (!state.char || !validators.isDecimalDigit(state))) {
            return state.error("Unexpected token ILLEGAL.");
        }

        //Process digits.
        do {
            state.add();
            state.next();
        }
        while(state.char && validators.isDecimalDigit(state));
    },

    sign: function(state) {
        if(validators.isSign(state)) {
            state.add();
            state.next();
        }
    },

    exponent: function(state) {
        if(validators.isExponentIndicator(state)) {
            //Add exponent indicator.
            state.add();
            state.next();

            utils.sign(state);
            utils.digits(state, false);
        }
    },

    decimal: function(state) {
        if(validators.isZeroDigit(state)) {
            state.add();
            state.next();

            if(validators.isDot(state)) {
                state.add();
                state.next();
                utils.digits(state, true);
                utils.exponent(state);
            }
        }
        else if(validators.isDot(state)) {
            state.add();
            state.next();
            utils.digits(state, false);
            utils.exponent(state);
        }
        else {
            utils.digits(state, false);
            utils.exponent(state);
        }
    }
};

var validators = {
    isZeroDigit: function(state) { return state.char === constants.zero },
    isDot: function(state) { return state.char === constants.dotCharacter },
    isDecimalDigit: function (state) { return (constants.digits.indexOf(state.char) !== -1) },
    isHexDigit: function (state) { return (constants.hexDigits.indexOf(state.char) !== -1) },
    isHexLiteral: function(state) { return (validators.isZeroDigit(state) && constants.hexMarkers.indexOf(state.lookahead) !== -1) },
    isDecimalLiteral: function(state) { return (validators.isDecimalDigit(state) && constants.hexMarkers.indexOf(state.lookahead) === -1) },
    isNumericLiteral: function(state) { return (validators.isHexLiteral(state) || validators.isDecimalLiteral(state)) },
    isExponentIndicator: function(state) { return (constants.exponentIndicators.indexOf(state.char) !== -1) },
    isSign: function(state) { return (constants.signs.indexOf(state.char) !== -1) }
};

module.exports = {
    name: 'number',

    canProcess: function(state) {
        return validators.isNumericLiteral(state);
    },

    process: function (state) {
        if(validators.isHexLiteral(state)) {
            utils.hex(state);
        }
        else {
            utils.decimal(state);
        }

        state.token("literal", "number");
    }
};