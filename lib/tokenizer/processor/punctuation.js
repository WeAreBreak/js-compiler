/**
 * Punctuation Processor for the CellScript Tokenizer
 */

var constants = {
    commentMarkers: "/*",
    punctuatorStartCharacters: "+-!~&|^*/%><=?",
    punctuators: ["++","--","+","-","!","~","&","|","^","*","/","%",">>","<<",">>>","<",">","<=",">=","==","===","!=","!==","?","=","+=","-=","/=","*=","%=",">>=","<<=",">>>=","|=","^=","&=","&&","||"]
};

var validators = {
    isPart: function (char) { return (constants.punctuatorStartCharacters.indexOf(char) != -1); },
    isPunctuator: function (token) { return (constants.punctuators.indexOf(token) != -1); },
    isPunctuatorOrSeparator: function (token) { return token.type === token.data },
    isCommentMarker: function (char) { return constants.commentMarkers.indexOf(char) != -1 }
};

module.exports = {
    name: "punctuation",

    include: function(tokenDefinition) {
        if(tokenDefinition.punctuatorStartCharacters) {
            constants.punctuatorStartCharacters = constants.punctuatorStartCharacters + tokenDefinition.punctuatorStartCharacters;
        }

        if(tokenDefinition.punctuators) {
            constants.punctuators = constants.punctuators.concat(tokenDefinition.punctuators);
        }
    },

    canProcess: function(state) {
        if(!validators.isPart(state.char)) return false;

        if(state.char == "/" && (!state.lastToken || state.lastToken.type !== ")")) {
            if(validators.isCommentMarker(state.lookahead)) return false; //It is a comment.
            if(validators.isPunctuatorOrSeparator(state.lastToken)) return false;
        }

        return true;
    },

    process: function (state) {
        do {
            if(validators.isPunctuator(state.tokenValue) && !validators.isPunctuator(state.tokenValue + state.char) && !validators.isPunctuator(state.tokenValue + state.char + state.lookahead)) break;
            state.add();
            state.next();
        }
        while(state.char && validators.isPart(state.char));

        if(validators.isPunctuator(state.tokenValue)) {
            state.token(state.tokenValue);
        }
        else {
            state.error("Unexpected token ILLEGAL.");
        }
    }
};