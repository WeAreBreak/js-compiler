/**
 * Identifier Processor for the CellScript Tokenizer
 */

var constants = {
    keywords: ["break","case","catch","const","continue","debugger","default","delete","do","else","finally","for","function","if","in","of","instanceof","new","return","switch","throw","try","typeof","var","void","while","with","yield","let"],
    nonTerminalKeywords: [ "continue", "break", "return", "throw", "yield" ],
    literalKeywords: ["false","null","true","undefined"],
    booleanLiterals: ["false","true"],
    reservedWords: ["abstract","boolean","byte","double","enum","export","extends","final","float","goto","implements","import","int","interface","long","native","package","short","super","synchronized","throws","transient","volatile"],
    startCharacters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$ÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜäëïöüçÇßØøÅåÆæÞþÐð",
    partCharacters: "\u005F\u203F\u2040\u2054\uFE33\uFE34\uFE4D\uFE4E\uFE4F\uFF3F\u200C\u200D",
    digits: "0123456789",
    lineTerminators: "\u000A\u000D\u2028\u2029"
};
constants.partCharacters = constants.startCharacters + constants.digits + constants.partCharacters;

var validators = {
    isStart: function (char) { return (constants.startCharacters.indexOf(char) != -1) },
    isPart: function (char) { return (constants.partCharacters.indexOf(char) != -1) },
    isLineTerminator: function(char) { return (constants.lineTerminators.indexOf(char) !== -1) },

    isKeyword: function (token) { return (constants.keywords.indexOf(token) != -1); },
    isNonTerminalKeyword: function (token) { return (constants.nonTerminalKeywords.indexOf(token) != -1); },
    isLiteralKeyword: function (token) { return (constants.literalKeywords.indexOf(token) != -1); },
    isReservedWord:function (token) { return (constants.reservedWords.indexOf(token) != -1); },
    isBoolean: function (token) { return (constants.booleanLiterals.indexOf(token) != -1); }
};

module.exports = {
    name: "identifier",

    include: function(tokenDefinition) {
        if(tokenDefinition.keywords) {
            constants.keywords = constants.keywords.concat(tokenDefinition.keywords);
        }

        if(tokenDefinition.nonTerminalKeywords) {
            constants.nonTerminalKeywords = constants.nonTerminalKeywords.concat(tokenDefinition.nonTerminalKeywords);
        }

        if(tokenDefinition.literalKeywords) {
            constants.literalKeywords = constants.literalKeywords.concat(tokenDefinition.literalKeywords);
        }

        if(tokenDefinition.booleanLiterals) {
            constants.booleanLiterals = constants.booleanLiterals.concat(tokenDefinition.booleanLiterals);
        }

        if(tokenDefinition.reservedWords) {
            constants.reservedWords = constants.reservedWords.concat(tokenDefinition.reservedWords);
        }

        if(tokenDefinition.lineTerminators) {
            constants.lineTerminators = constants.lineTerminators.concat(tokenDefinition.lineTerminators);
        }
    },

    canProcess: function(state) {
        return validators.isStart(state.char);
    },

    process: function (state) {
        do {
            state.add();
            state.next();
        }
        while(state.char && validators.isPart(state.char));

        if(validators.isKeyword(state.tokenValue)) {
            state.token("keyword");

            if(validators.isNonTerminalKeyword(state.tokenValue)) {
                state.nonTerminalMode();
            }
        }
        else if(validators.isLiteralKeyword(state.tokenValue)) {
            if(validators.isBoolean(state.tokenValue)) {
                state.token("literal", "boolean");
            }
            else {
                state.token("literal", state.tokenValue);
            }
        }
        else if(validators.isReservedWord(state.tokenValue)) {
            state.error("Reserved word found: " + state.tokenValue + ".");
        }
        else {
            state.token("identifier");
        }
    }
};