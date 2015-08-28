/**
 * This Expression Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    // No constants yet.
};

/// methods ///
var validators = {

    isIdentifier: function(state) {
        return state.token && state.token.type === "identifier";
    }

};

var knownInternalIdentifiers = [
    "abs",
    "answer",
    "append:toList:",
    "backgroundIndex",
    "bounceOffEdge",
    "broadcast:",
    "changeGraphicEffect:by:",
    "changePenHueBy:",
    "changePenShadeBy:",
    "changePenSizeBy:",
    "changeSizeBy:",
    "changeTempoBy:",
    "changeVar:by:",
    "changeVolumeBy:",
    "changeXposBy:",
    "changeYposBy:",
    "clearPenTrails",
    "CLR_COUNT",
    "color:sees:",
    "comeToFront",
    "computeFunction:of:",
    "concatenate:with:",
    "contentsOfList:",
    "costumeIndex",
    "costumeName",
    "COUNT",
    "createCloneOf",
    "deleteClone",
    "deleteLine:ofList:",
    "distanceTo:",
    "doAsk",
    "doBroadcastAndWait",
    "doForever",
    "doForeverIf",
    "doForLoop",
    "doIf",
    "doIfElse",
    "doPlaySoundAndWait",
    "doRepeat",
    "doReturn",
    "doUntil",
    "doWaitUntil",
    "doWhile",
    "drum:duration:elapsed:from:",
    "filterReset",
    "forward:",
    "getAttribute:of:",
    "getLine:ofList:",
    "getParam",
    "getUserId",
    "getUserName",
    "glideSecs:toX:y:elapsed:from:",
    "goBackByLayers:",
    "gotoSpriteOrMouse:",
    "gotoX:y:",
    "heading",
    "heading:",
    "hide",
    "hideAll",
    "hideList:",
    "hideVariable:",
    "INCR_COUNT",
    "insert:at:ofList:",
    "instrument:",
    "isLoud",
    "keyPressed:",
    "letter:of:",
    "lineCountOfList:",
    "list:contains:",
    "lookLike:",
    "midiInstrument:",
    "mousePressed",
    "mouseX",
    "mouseY",
    "nextCostume",
    "nextScene",
    "not",
    "noteOn:duration:elapsed:from:",
    "penColor:",
    "penSize:",
    "playDrum",
    "playSound:",
    "pointTowards:",
    "putPenDown",
    "putPenUp",
    "randomFrom:to:",
    "readVariable",
    "rest:elapsed:from:",
    "rounded",
    "say:",
    "say:duration:elapsed:from:",
    "sayNothing",
    "scale",
    "sceneName",
    "scrollAlign",
    "scrollRight",
    "scrollUp",
    "senseVideoMotion",
    "sensor:",
    "sensorPressed:",
    "setGraphicEffect:to:",
    "setLine:ofList:to:",
    "setPenHueTo:",
    "setPenShadeTo:",
    "setRotationStyle",
    "setSizeTo:",
    "setTempoTo:",
    "setVar:to:",
    "setVideoState",
    "setVideoTransparency",
    "setVolumeTo:",
    "show",
    "showList:",
    "showVariable:",
    "soundLevel",
    "sqrt",
    "stampCostume",
    "startScene",
    "startSceneAndWait",
    "stopAll",
    "stopAllSounds",
    "stopScripts",
    "stopSound:",
    "stringLength:",
    "tempo",
    "think:",
    "think:duration:elapsed:from:",
    "timeAndDate",
    "timer",
    "timerReset",
    "timestamp",
    "touching:",
    "touchingColor:",
    "turnAwayFromEdge",
    "turnLeft:",
    "turnRight:",
    "volume",
    "wait:elapsed:from:",
    "warpSpeed",
    "whenClicked",
    "whenCloned",
    "whenGreenFlag",
    "whenIReceive",
    "whenKeyPressed",
    "whenSceneStarts",
    "whenSensorGreaterThan",
    "xpos",
    "xpos:",
    "xScroll",
    "ypos",
    "ypos:",
    "yScroll"
];

/// public interface ///
module.exports = {

    name: "identifier",

    canProcess: function(state) {
        return validators.isIdentifier(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "identifier";
        state.item.name = state.token.data;

        if(state.item.name != "answer") {
            var record = state.lexicalEnvironment().getIdentifierReference(state.token.data).getBaseValue();
            if (record) {
                state.item.internalName = record.getUniqueName(state.token.data);

                var val = record.getBindingValue(state.token.data);
                if (val == "parameter") state.item.parameter = true;
                else if (val) state.item.customBlock = val;
            }
            else if (knownInternalIdentifiers.indexOf(state.item.name) == -1 && knownInternalIdentifiers.indexOf(state.item.name + ':') == -1)
                state.warn("Undeclared identifier: " + state.item.name);
        }

        state.next();
        return true;
    }

};