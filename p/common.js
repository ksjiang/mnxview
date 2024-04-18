/**
 * common.js - Common functions for open-source MNX viewer.
 * Engraving with VexFlow.
 * 
 * @version 1
 * @author Kyle Jiang
 * for the MIT 21M.383 Final Project, taught by
 * @author Joseph Vanderstel
 */

// imports
const {Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Dot, StaveTie, Beam} = Vex.Flow;

// default size for sheets and measures
const defaultSheetWidth = 1200.;
const defaultSheetHeight = 450.;
const defaultMeasureWidth = 350.;
const defaultMeasureHeight = 60.;

const fifthsToMajorKeyMap = {0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: "C#", "-1": 'F', "-2": "Bb", "-3": "Eb", "-4": "Ab", "-5": "Db", "-6": "Gb", "-7": "Cb"};
const diatonicPitchNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const staffCenters = {
    "treble": {"step": 'B', "alter": 0, "octave": 4}, 
    "bass": {"step": 'D', "alter": 0, "octave": 3}, 
}
const durationTranslation = {
    "whole": 'w', 
    "half": 'h', 
    "quarter": 'q', 
    "eighth": '8', 
    "16th": "16", 
    "32nd": "32", 
    "64th": "64", 
    "128th": "128", 
    "256th": "256", 
}
const fullMeasureRestDuration = {"base": 'whole', "dots": 0};
const commonTime = {"count": 4, "unit": 4};
const stemTranslation = {
    "up": StaveNote.STEM_UP, 
    "down": StaveNote.STEM_DOWN, 
}
const emptyStaveItems = {
    "notes": [], 
}

/** @class MNXParseError representing an error encountered during MNX parsing */
class MNXParseError extends Error {
    constructor (message) {
        super(message);
        this.name = "MNXParseError";
    }

}

/** @class UnsupportedFeatureError representing a feature that is not yet supported */
class UnsupportedFeatureError extends Error {
    constructor (message) {
        super(message);
        this.name = "UnsupportedFeatureError";
    }

}

function validateMNXObject(mnxObject) {
    /**
     * Validates MNX object
     * 
     * @param {object} mnxObject The MNX object to be validated
     */

    if (!("mnx" in mnxObject)) throw new MNXParseError("Metadata object not found.");
    if (!("global" in mnxObject)) throw new MNXParseError("Global data object not found.");
    if (!("parts" in mnxObject) || !(mnxObject.parts instanceof Array)) throw new MNXParseError("Parts object array not found.");
    return;
}

function validateMNXMetadata(mnxMetadata) {
    /**
     * Validates MNX metadata object
     * 
     * @param {object} mnxMetadata The metadata object to be validated
     */

    if (!("version" in mnxMetadata)) throw new MNXParseError("Metadata missing version.");
    return;
}

function validateMNXGlobal(mnxGlobal) {
    /**
     * Validates MNX global data object
     * 
     * @param {object} mnxGlobal The global data object to be validated
     */

    if (!("measures" in mnxGlobal) || !(mnxGlobal.measures instanceof Array)) throw new MNXParseError("Global missing measures object array.");
    return;
}

function validateClef(clef) {
    /**
     * Validates a clef object
     * 
     * @param {object} clef A clef object
     */

    if (!("sign" in clef)) throw new MNXParseError("Clef object missing sign.");
    if (!("staffPosition" in clef)) throw new MNXParseError("Clef object missing staff position.");
    return;
}

function validatePositionedClef(positionedClef) {
    /**
     * Validates a positioned clef object
     * 
     * @param {object} positionedClef A positioned clef object
     */

    if (!("clef" in positionedClef)) throw new MNXParseError("Positioned clef object missing clef object.");
    return;
}

function validateMeasure(measure) {
    /**
     * Validates a measure object
     * 
     * @param {object} measure A measure to be validated
     */

    if (!("sequences" in measure) || !(measure.sequences instanceof Array)) throw new MNXParseError("Measure object missing sequences array.");
    return;
}

function validateSequence(sequence) {
    /**
     * Validates a sequence object
     * 
     * @param {object} sequence A sequence to be validated
     */

    if (!("content" in sequence) || !(sequence.content instanceof Array)) throw new MNXParseError("Sequence object missing content array.");
    return;
}

function validateBeam(beam) {
    /**
     * Validates a beam object
     * 
     * @param {object} beam A beam to be validated
     */

    if (!("events" in beam) || !(beam.events instanceof Array)) throw new MNXParseError("Beam object missing events array.");
    return;
}

function validateTimeSignature(ts) {
    /**
     * Validates a time signature object
     * 
     * @param {object} ts Time signature to be validated
     */

    if (!("count" in ts)) throw new MNXParseError("Time object missing count.");
    if (!("unit" in ts)) throw new MNXParseError("Time object missing unit.");
    return;
}

function validateKeySignature(ks) {
    /**
     * Validates a key signature object
     * 
     * @param {object} ks Key signature to be validated
     */

    if (!("fifths" in ks)) throw new MNXParseError("Key signature object missing fifths.");
    return;
}

function validateDuration(dur) {
    /**
     * Validates a duration object
     * 
     * @param {object} dur Duration object to be validated
     */

    if (!("base" in dur)) throw new MNXParseError("Duration object missing base.");
    return;
}

function validateNote(note) {
    /**
     * Validates a note object
     * 
     * @param {object} note Note object to be validated
     */

    if (!("pitch" in note)) throw new MNXParseError("Note object missing pitch.");
    return;
}

function validatePitch(pitch) {
    /**
     * Validates a pitch object
     * 
     * @param {object} pitch Pitch object to be validated
     */

    if (!("octave" in pitch)) throw new MNXParseError("Pitch object missing octave.");
    if (!("step" in pitch)) throw new MNXParseError("Pitch object missing step.");
    return;
}

function validateAccidentalDisplay(accidentalDisplay) {
    /**
     * Validates a accidental display
     * 
     * @param {object} accidentalDisplay Accidental display object to be validated
     */

    if (!("show" in accidentalDisplay)) throw new MNXParseError("Accidental display object missing show.");
    return;
}

function getMNXVersion(mnxObject) {
    /**
     * Gets the MNX version. Should only be called on a valid MNX object
     * 
     * @param {object} mnxObject An MNX object
     */

    return mnxObject.mnx.version;
}

function clefFromMNX(clef) {
    /**
     * Returns the common name of a clef given MNX clef object
     * 
     * @param {object} clef A clef object
     * 
     * @returns {string} A string with the common name of the clef
     */

    if ((clef.sign == 'G') && (clef.staffPosition == -2)) {
        return "treble";
    } else if ((clef.sign == 'F') && (clef.staffPosition == 2)) {
        return "bass";
    } else {
        throw new UnsupportedFeatureError("Unrecognized clef.");
    }

}

function dotted(staveNote, noteIdx = -1) {
    /**
     * Adds a dot on a note
     * 
     * @param {StaveNote} staveNote The note to be dotted
     * @param {number} noteIdx For chords, the indices to dot
     */

    if (noteIdx < 0) {
        Dot.buildAndAttach([staveNote], {all: true});
    } else {
        Dot.buildAndAttach([staveNote], {index: noteIdx});
    }

    return staveNote;
}

function timeSignatureToVF(ts) {
    /**
     * Convert a time signature into a VexFlow string
     * 
     * @param {object} ts A time signature
     * 
     * @returns {string} A VexFlow string representing the time signature
     */

    return `${ts.count}/${ts.unit}`;
}

function pitchAlterString(pitch, explicitNatural = false) {
    /**
     * Returns the alter string of a pitch
     * 
     * @param {object} pitch A pitch
     * @param {bool} explicitNatural Determines whether 'n' is returned if there are no accidentals
     * 
     * @returns {string} A string consisting of the pitch's alteration only
     */

    let alter, symbol, repeats;

    alter = 0;
    if ("alter" in pitch) alter = pitch.alter;
    if (alter <= 0) {
        symbol = 'b';
        repeats = -alter;
    } else {
        symbol = '#';
        repeats = alter;
    }

    if ((repeats == 0) && explicitNatural) return 'n';
    return symbol.repeat(repeats);
}

function pitchToStepPlusAlter(pitch) {
    /**
     * Returns a string with the step and alteration
     * 
     * @param {object} pitch A pitch
     * 
     * @returns {string} A string consisting of the pitch's step and alteration
     */

    return pitch.step + pitchAlterString(pitch);
}

function pitchToVF(pitch) {
    /**
     * Convert a pitch into a VexFlow string
     * 
     * @param {object} pitch A note
     * 
     * @returns {string} A VexFlow string representing the note
     */

    return `${pitchToStepPlusAlter(pitch)}/${pitch.octave}`;
}

function staffposToPitch(staffpos, clef) {
    /**
     * Compute the pitch given a staff position and a clef.
     * 
     * @param {number} staffpos The position on the staff, where 0 is the center line
     * @param {string} clef The name of the clef
     * 
     * @returns {object} A pitch object
     */

    let reference, noteNumber, quotient, remainder;

    reference = staffCenters[clef];
    noteNumber = diatonicPitchNames.indexOf(reference.step) + staffpos;
    quotient = Math.floor(noteNumber / diatonicPitchNames.length);
    remainder = noteNumber - diatonicPitchNames.length * quotient;
    return {"step": diatonicPitchNames[remainder], "alter": 0, "octave": reference.octave + quotient};
}

function applyDots(staveNote, numDots) {
    /**
     * Applies dots to a StaveNote object
     * 
     * @param {StaveNote} staveNote A StaveNote object
     * @param {number} numDots The number of dots to add
     * 
     * @returns {StaveNote} A new StaveNote with dots added
     */

    let result = staveNote;
    if (numDots > 0) {
        for (let i = 0; i < numDots; i++) result = dotted(result, -1);
    }

    return result;
}

function notesToStaveNote(notes, duration, clef, stemDirection = null) {
    /**
     * Creates VexFlow note StaveNotes given notes and duration
     * 
     * @param {Array} notes An array of MNX notes
     * @param {object} duration A duration object
     * @param {string} clef A clef, needed to determine automatic stem orientation
     * @param {object} stemDirection The direction of the stem
     * 
     * @returns {StaveNote} An VexFlow note StaveNote object
     */

    let result, template;

    // make sure all the notes are valid
    notes.map(validateNote);
    // and all pitches are valid
    notes.map((note) => validatePitch(note.pitch));
    // create a template for notes
    template = {"duration": `${durationTranslation[duration.base]}`};
    if (stemDirection === null) {
        // use automatic stem direction
        template = Object.assign(template, {"clef": clef, "auto_stem": true});
    } else {
        template = Object.assign(template, {"stem_direction": stemDirection});
    }

    result = notes.filter(
        (note) => {
            let result = false;
            if ("accidentalDisplay" in note) {
                validateAccidentalDisplay(note.accidentalDisplay);
                result = note.accidentalDisplay.show;
            }

            return result;
        }
    ).reduce(
        (sn, item, itemIdx) => sn.addModifier(new Accidental(pitchAlterString(item.pitch, true)), itemIdx), 
        new StaveNote(Object.assign(template, {"keys": notes.map((note) => pitchToVF(note.pitch))}))
    );
    if ("dots" in duration) result = applyDots(result, duration.dots);
    return result;
}

function restToStaveNote(rest, duration, clef) {
    /**
     * Creates a VexFlow rest StaveNote given a rest object and duration
     * 
     * @param {object} rest A rest object
     * @param {object} duration A duration object
     * @param {string} clef A clef, needed to determine note values for staff offsets
     * 
     * @returns {StaveNote} A VexFlow rest StaveNote object
     */

    let result;

    if (!("staffPosition" in rest)) {
        // staff center is default location for rests
        staffpos = 0;
    } else {
        staffpos = rest.staffPosition;
    }

    result = new StaveNote({"keys": [pitchToVF(staffposToPitch(staffpos, clef))], "duration": `${durationTranslation[duration.base]}r`});
    if ("dots" in duration) result = applyDots(result, duration.dots);
    return result;
}

function getSequenceContentItem(item, clef, beams) {
    /**
     * Compute a list of notes from sequence content item
     * 
     * @param {object} item A sequence content item
     * @param {string} clef A clef
     * @param {Array} beams An array of arrays of event IDs to be beamed
     * 
     * @returns {object} An object containing notes and beamed notes
     */

    let notes = [];
    if (!("type" in item)) throw new MNXParseError("Sequence content object missing type.");
    if (item.type == "event") {
        let newNoteOrRest = null;

        if (("measure" in item) && (item.measure)) {
            if ("duration" in item) throw new MNXParseError("Cannot specify duration for whole-measure event.");
            if (!("rest" in item)) throw new MNXParseError("Whole-measure event must consist of a single rest.");
            newNoteOrRest = restToStaveNote(item.rest, fullMeasureRestDuration, clef);
        } else {
            if (!("duration" in item)) throw new MNXParseError("Event object requires duration except for whole-measure events.");
            validateDuration(item.duration);
            if (!(item.duration.base in durationTranslation)) throw new UnsupportedFeatureError(`Duration type ${item.duration.base} not recognized.`);
            if ("rest" in item) newNoteOrRest = restToStaveNote(item.rest, item.duration, clef);
            if ("notes" in item) {
                let stemDir = null;

                if (!(item.notes instanceof Array)) throw new MNXParseError("Event notes must be an array.");
                if ("stem-direction" in item) {
                    if (!(item.stem_direction in stemTranslation)) throw new UnsupportedFeatureError(`Stem direction ${item.stem_direction} not recognized.`);
                    stemDir = stemTranslation[item.stem_direction];
                }

                newNoteOrRest = notesToStaveNote(item.notes, item.duration, clef, stemDir);
            }
        }

        if (!(newNoteOrRest === null)) notes.push(newNoteOrRest);
        if ("id" in item) updateBeamsWithEvent(beams, item.id, newNoteOrRest);
    } else {
        throw new UnsupportedFeatureError(`Unsupported content type ${item.type}`);
    }

    return {"notes": notes};
}

function updateArrayFields(current, other) {
    /**
     * Concatenates all the arrays in current with those in other
     * 
     * @param {object} current The first object
     * @param {object} other The second object
     * 
     * @returns {object} An object with the concatenated array fields
     */

    let result = {};
    Object.keys(current).forEach((field) => {
        if ((current[field] instanceof Array) && (field in other) && (other[field] instanceof Array)) result[field] = current[field].concat(other[field]);
    });

    return result;
}

function getSequences(sequences, clef, beams) {
    /**
     * Compute a list of notes and rests from sequence
     * 
     * @param {Array} sequences An array of sequences to be added
     * @param {string} clef A clef
     * @param {Array} beams An array of arrays of event IDs to be beamed
     * 
     * @returns {Array} An array of StaveNote objects
     */

    let staveItems;
    // make sure sequences are valid
    sequences.map(validateSequence);
    staveItems = sequences.map((sequence) => sequence.content.map((item) => getSequenceContentItem(item, clef, beams)).reduce((si, it) => updateArrayFields(si, it), emptyStaveItems)).reduce((si, it) => updateArrayFields(si, it), emptyStaveItems);
    return staveItems;
}

function updateBeamsWithEvent(beams, id, event) {
    /**
     * Updates the beam array given event and its id
     * 
     * @param {beams} beams A beam object - will be modified
     * @param {string} id The ID
     * @param {StaveNote} event An event
     */

    for (let i = 0; i < beams.ids.length; i++) {
        // iterate through all beams, since a note could belong to many
        if (beams.ids[i].includes(id)) {
            // add it to partial
            beams.partial[i].push(event);
            // remove it from IDs list
            beams.ids[i] = beams.ids[i].filter((myID) => !(myID == id));
        }
    }

    return;
}

function updateBeams(beams) {
    /**
     * Checks whether any beams are completed, creates them, and removes them from the partial lists
     * 
     * @param {object} beams A beams object - will be modified
     * 
     * @returns {Array} A list of completed beams
     */

    let completedBeams = [], newBeamIDs = [], newPartialBeams = [];

    for (let i = 0; i < beams.ids.length; i++) {
        if (beams.ids[i].length == 0) {
            // this beam is completed - only add if it's nontrivial
            if (beams.partial[i].length > 1) completedBeams.push(new Beam(beams.partial[i]));
        } else {
            // keep in the object
            newBeamIDs.push(beams.ids[i]);
            newPartialBeams.push(beams.partial[i]);
        }
    }

    beams.ids = newBeamIDs;
    beams.partial = newPartialBeams;
    return completedBeams;
}

function displayMeasures(measures, globMeasures, context) {
    /**
     * Outputs measures in a context
     * 
     * @param {Array} measures Measures to be shown
     * @param {Array} globMeasures Global object measures
     * @param {object} context Context in which to draw measures
     */

    let curPosX, curPosY, stave, globalMeasure, curKeySignature, curClef, curTimeSignature, parsedSequence, beams;

    let beamQueue = [], staveQueue = [], voiceQueue = [];

    // initial position
    curPosX = 0.; curPosY = 0.;
    // set defaults
    curKeySignature = fifthsToMajorKeyMap[0];       //C Major
    curClef = "treble";
    curTimeSignature = commonTime;
    // keep a running array of beams
    beams = {
        "ids": [], 
        "partial": [], 
    };
    measures.forEach(
        (measure, measureIdx) => {
            validateMeasure(measure);
            // update measure position
            if (curPosX + defaultMeasureWidth > defaultSheetWidth) {
                // reflow to a new line
                curPosX = 0.;
                // TODO: justify measures
                curPosY += defaultMeasureHeight;
                // TODO: what if y overflows?
            }
            
            stave = new Stave(curPosX, curPosY, defaultMeasureWidth);
            if (("clefs" in measure) && (measure.clefs instanceof Array)) {
                // need to add a clef
                if (measure.clefs.length > 1) throw new UnsupportedFeatureError("Multiple clefs in measure.");
                validatePositionedClef(measure.clefs[0]);
                validateClef(measure.clefs[0].clef);
                curClef = clefFromMNX(measure.clefs[0].clef);
                stave.addClef(curClef);
            }

            if (measureIdx >= globMeasures.length) throw new MNXParseError(`Global measures array does not contain index ${measureIdx}.`);
            globalMeasure = globMeasures[measureIdx];
            if ("time" in globalMeasure) {
                // need to add a time signature
                validateTimeSignature(globalMeasure.time);
                curTimeSignature = {"count": globalMeasure.time.count, "unit": globalMeasure.time.unit};
                stave.addTimeSignature(timeSignatureToVF(curTimeSignature));
            }

            if ("key" in globalMeasure) {
                // need to add a key signature
                let newKeySignature;
                validateKeySignature(globalMeasure.key);
                newKeySignature = fifthsToMajorKeyMap[globalMeasure.key.fifths];
                stave.addKeySignature(newKeySignature, curKeySignature);
                // save the key signature
                curKeySignature = newKeySignature;
            }

            stave.setContext(context);
            stave.draw();
            // check for beams
            if ("beams" in measure) {
                let newBeamIDs, newBeams;
                if (!(measure.beams instanceof Array)) throw new MNXParseError("Measure beams must be an array.");
                // validate
                measure.beams.map(validateBeam);
                newBeamIDs = measure.beams.map((beam) => beam.events);
                newBeams = {"ids": newBeamIDs, "partial": Array.from(Array(newBeamIDs.length), () => [])};
                beams = updateArrayFields(beams, newBeams);
            }

            // get sequences
            parsedSequence = getSequences(measure.sequences, curClef, beams);
            //console.log(parsedSequence);
            // update beams before drawing notes
            beamQueue = beamQueue.concat(updateBeams(beams));
            // stash stave and notes to queue
            staveQueue.push(stave);
            let newVoice = new Voice({"num_beats": curTimeSignature.count, "beat_value": curTimeSignature.unit});
            newVoice.addTickables(parsedSequence.notes);
            voiceQueue.push(newVoice);
            // if beams is empty, we can draw everything in the queue
            if (beams.ids.length == 0) {
                for (let i = 0; i < staveQueue.length; i++) {
                    new Formatter().joinVoices([voiceQueue[i]]).formatToStave([voiceQueue[i]], staveQueue[i]);
                    voiceQueue[i].draw(context, staveQueue[i]);
                }
                // update the beams
                beamQueue.map((beam) => {
                    beam.setContext(context);
                    beam.draw();
                });
                // clear the queues
                staveQueue = []; voiceQueue = []; beamQueue = [];
            }

            // update the position with the measure width
            curPosX += stave.width;
        }
    );
    return;
}

function parseMNXv1(obj, outputDiv) {
    /**
     * Displays an MNX version 1 object on a div
     * 
     * @param {object} obj A potential MNX object to display
     * @param {object} outputDiv A div in which to draw the score
     */
    
    //console.log(obj);
    outputDiv.innerHTML = "";
    // check if the object is valid MNX
    validateMNXObject(obj);
    validateMNXMetadata(obj.mnx);
    validateMNXGlobal(obj.global);
    // check version
    if (getMNXVersion(obj) != 1) throw new MNXParseError("Unsupported version.");
    
    // create a new renderer
    const renderer = new Renderer(outputDiv, Renderer.Backends.SVG);
    renderer.resize(defaultSheetWidth, defaultSheetHeight);
    const context = renderer.getContext();

    obj.parts.forEach(
        (part) => {
            if (("measures" in part) && (part.measures instanceof Array)) displayMeasures(part.measures, obj.global.measures, context);
        }
    );
    return;
}

function convertMNX(inputText, outputDiv) {
    /** 
     * Interprets the MNX input to the text box and shows the score
     * 
     * @param {string} inputText A string containing MNX data
     * @param {string} outputDiv A div to output the score
    */
   
    let result;

    try {
        result = JSON.parse(inputText);
    } catch (e) {
        if (e instanceof SyntaxError) return "Bad JSON";
    }

    try {
        parseMNXv1(result, outputDiv);
        return "Success!";
    } catch (e) {
        if (e instanceof MNXParseError) return `[MNX Parse Error] ${e.message}`;
        if (e instanceof UnsupportedFeatureError) return `[Unsupported Feature] ${e.message}`;
        // let other errors be heard
        throw e;
    }

}