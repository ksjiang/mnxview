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
const {Factory, StaveNote, Formatter, Accidental, Dot, Beam, Articulation, ModifierPosition, Barline} = Vex.Flow;

// default size for sheets and measures
const defaultSheetWidth = 1200.;
const defaultSheetHeight = 1200.;
const defaultMeasureWidth = 350.;
const minMeasureWidth = 200;
const defaultMeasureHeight = 200.;
// safety margin for measure width
const measureSafetyFactor = 2;
const sheetSafetyFactor = 0.1;

const fifthsToMajorKeyMap = {0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: "C#", "-1": 'F', "-2": "Bb", "-3": "Eb", "-4": "Ab", "-5": "Db", "-6": "Gb", "-7": "Cb"};
const diatonicPitchNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const staffCenters = {
    "treble": {"step": 'B', "alter": 0, "octave": 4}, 
    "bass": {"step": 'D', "alter": 0, "octave": 3}, 
};
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
};
const fullMeasureRestDuration = {"base": 'whole', "dots": 0};
const commonTime = {"count": 4, "unit": 4};
const stemTranslation = {
    "up": StaveNote.STEM_UP, 
    "down": StaveNote.STEM_DOWN, 
};
const emptySequenceables = {
    "notes": [], 
    "tuplets": [], 
};
const articulationTranslation = {
    "accent": "a>", 
    "staccatissimo": "av", 
    "staccato": "a.", 
    "strongAccent": "a^", 
    "tenuto": "a-", 
};
const startPosition = {
    'x': 0, 
    'y': 0, 
}
const emptyQueue = {
    "beams": [], 
    "staves": [], 
    "voices": [], 
    "tuplets": [], 
};
const globalMeasureInfoTemplate = {
    "start": false, 
    "end": false, 
    "repeat": {
        "start": false, 
        "end": false, 
    }, 
    "timeChange": null, 
    "keyChange": null, 
    "startKey": null, 
    "startClefs": {
        "clefs": null, 
        "clefsAdded": null, 
    }, 
};

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

function validateSequenceContentItem(sc) {
    /**
     * Validates a sequence content item
     * 
     * @param {object} sc The sequence content item
     */

    if (!("type" in sc)) throw new MNXParseError("Sequence content object missing type.");
    return;
}

function validateNoteValueQuantity(nvq) {
    /**
     * Validates a note value quantity
     * 
     * @param {object} nvq The note value quantity object to be validated
     */

    if (!("duration" in nvq)) throw new MNXParseError("Note value quantity object missing duration.");
    if (!("multiple" in nvq)) throw new MNXParseError("Note value quantity object missing multiple.");
    return;
}

function validatePart(part) {
    /**
     * Validates a part
     * 
     * @param {object} part The part to be validated
     */

    if (!("measures" in part) || !(part.measures instanceof Array)) throw new MNXParseError("Part object missing measures array.");
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

function notesToStaveNote(notes, duration, clef, factory, stemDirection = null, articulation = []) {
    /**
     * Creates VexFlow note StaveNotes given notes and duration
     * 
     * @param {Array} notes An array of MNX notes
     * @param {object} duration A duration object
     * @param {string} clef A clef, needed to determine automatic stem orientation
     * @param {Factory} factory A factory with context
     * @param {object} stemDirection The direction of the stem
     * @param {Array} articulation An array of articulations to add
     * 
     * @returns {StaveNote} An VexFlow note StaveNote object
     */

    let result, template, numDots, dotsString;

    // make sure all the notes are valid
    notes.map(validateNote);
    // and all pitches are valid
    notes.map((note) => validatePitch(note.pitch));
    // create a template for notes
    numDots = 0;
    if ("dots" in duration) numDots = duration.dots;
    if (numDots < 0) throw new MNXParseError(`Illegal number of dots ${numDots}.`);
    dotsString = 'd'.repeat(numDots);
    template = {"clef": clef, "duration": `${durationTranslation[duration.base]}${dotsString}`};
    if (stemDirection === null) {
        // use automatic stem direction
        template = Object.assign(template, {"auto_stem": true});
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
        factory.StaveNote(Object.assign(template, {"keys": notes.map((note) => pitchToVF(note.pitch))}))
    );
    if ("dots" in duration) result = applyDots(result, duration.dots);
    if (articulation.length > 0) {
        // articulations typically go on the notehead side
        let articulationPosition = ModifierPosition.BELOW;
        if (result.getStemDirection() == StaveNote.STEM_DOWN) articulationPosition = ModifierPosition.ABOVE;
        result = articulation.reduce((sn, art) => sn.addModifier(new Articulation(art).setPosition(articulationPosition)), result);
    }

    return result;
}

function restToStaveNote(rest, duration, clef, factory) {
    /**
     * Creates a VexFlow rest StaveNote given a rest object and duration
     * 
     * @param {object} rest A rest object
     * @param {object} duration A duration object
     * @param {string} clef A clef, needed to determine note values for staff offsets
     * @param {Factory} factory A factory with context
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

    result = factory.StaveNote({"keys": [pitchToVF(staffposToPitch(staffpos, clef))], "duration": `${durationTranslation[duration.base]}r`});
    if ("dots" in duration) result = applyDots(result, duration.dots);
    return result;
}

function getEventItem(item, clef, beams, factory) {
    /**
     * Processes an event item
     * 
     * @param {object} item An event item
     * @param {string} clef A clef
     * @param {beams} beams A beams object - will be modified
     * @param {Factory} factory A factory with context
     * 
     * @returns {object} A VexFlow note or rest object
     */
    let newNoteOrRest = null;

    if (("measure" in item) && (item.measure)) {
        if ("duration" in item) throw new MNXParseError("Cannot specify duration for whole-measure event.");
        if (!("rest" in item)) throw new MNXParseError("Whole-measure event must consist of a single rest.");
        newNoteOrRest = restToStaveNote(item.rest, fullMeasureRestDuration, clef, factory);
    } else {
        if (!("duration" in item)) throw new MNXParseError("Event object requires duration except for whole-measure events.");
        validateDuration(item.duration);
        if (!(item.duration.base in durationTranslation)) throw new UnsupportedFeatureError(`Duration type ${item.duration.base} not recognized.`);
        if ("rest" in item) newNoteOrRest = restToStaveNote(item.rest, item.duration, clef, factory);
        if ("notes" in item) {
            let stemDir = null;

            if (!(item.notes instanceof Array)) throw new MNXParseError("Event notes must be an array.");
            if ("stem-direction" in item) {
                if (!(item["stem-direction"] in stemTranslation)) throw new UnsupportedFeatureError(`Stem direction ${item["stem-direction"]} not recognized.`);
                stemDir = stemTranslation[item["stem-direction"]];
            }

            let articulationMarkings = [];
            if ("markings" in item) {
                if (item.markings.constructor != Object) throw new MNXParseError("Markings object must be an object.");
                articulationMarkings = Object.keys(item.markings).map((artString) => {
                    if (!(artString in articulationTranslation)) throw new UnsupportedFeatureError(`Unrecognized articulation ${artString}.`);
                    return articulationTranslation[artString];
                });
            }

            newNoteOrRest = notesToStaveNote(item.notes, item.duration, clef, factory, stemDir, articulationMarkings);
        }
    }

    // Update beams
    if ("id" in item) updateBeamsWithEvent(beams, item.id, newNoteOrRest);
    return newNoteOrRest;
}

function getSequenceContentItem(item, clef, beams, factory) {
    /**
     * Extracts a sequenceable object
     * 
     * @param {object} item A sequence content item
     * @param {string} clef A clef
     * @param {beams} beams A beams object - will be modified
     * @param {Factory} factory A factory with context
     * 
     * @returns {object} A sequenceable object (containing notes, tuplets)
     */

    validateSequenceContentItem(item);
    if (item.type == "event") {
        // a simple event, containing one or more notes sounded simultaneously in a single voice
        return {"notes": [getEventItem(item, clef, beams, factory)]};
    } else if (item.type == "tuplet") {
        let result, tupletOptions;

        result = {};
        // a tuplet, including inner and outer note values
        if (!("inner" in item)) throw new MNXParseError("Tuplet object missing inner.");
        validateNoteValueQuantity(item.inner);
        if (!("outer" in item)) throw new MNXParseError("Tuplet object missing outer.");
        validateNoteValueQuantity(item.outer);
        if (!("content" in item) || !(item.content instanceof Array)) throw new MNXParseError("Tuplet object missing content array.");
        // validate that content consists *only* of events
        item.content.map((ev) => {
            validateSequenceContentItem(ev);
            if (ev.type != "event") throw new MNXParseError("Tuplet object content can only contain events.");
        });

        // collect all the notes of the tuplet
        result["notes"] = item.content.map((ev) => getEventItem(ev, clef, beams, factory));

        // initialize a set of defaults
        tupletOptions = {"num_notes": item.inner.multiple, "notes_occupied": item.outer.multiple, "bracketed": true, "ratioed": false, "location": 1};
        // and modify them according to the attributes of the MNX tuplet
        if ("show-value" in item) {
            if (item["show-value"] == "both") tupletOptions["ratioed"] = true;
        }

        if ("bracket" in item) {
            if (item.bracket == "no") tupletOptions["bracketed"] = false;
        }

        if ("orientation" in item) {
            if (item.orientation == "down") tupletOptions["location"] = -1;
        }

        // get the event objects and form tuplet
        result["tuplets"] = [factory.Tuplet({"notes": result["notes"], "options": tupletOptions})];
        return result;
    } else {
        throw new UnsupportedFeatureError(`Unsupported content type ${item.type}.`);
    }

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
    Object.keys(current).map((field) => {
        if (current[field] instanceof Array) result[field] = current[field];
        if ((field in other) && (other[field] instanceof Array)) result[field] = result[field].concat(other[field]);
    });
    return result;
}

function getSequences(sequences, clef, beams, factory) {
    /**
     * Resolves the sequenceables in voices of a sequence
     * 
     * @param {Array} sequences An array of sequences to be added
     * @param {string} clef A clef
     * @param {beams} beams A beams object - will be modified
     * @param {Factory} factory A factory with context
     * 
     * @returns {Array} An array of voices containing sequenceables
     */

    let sequenceList;
    // make sure sequences are valid
    sequences.map(validateSequence);
    sequenceList = sequences.map((sequence) => sequence.content.map((item) => getSequenceContentItem(item, clef, beams, factory)).reduce((so, so_update) => updateArrayFields(so, so_update), emptySequenceables));
    return sequenceList;
}

function updateBeamsWithEvent(beams, id, event) {
    /**
     * Updates the beam array given event and its id
     * 
     * @param {beams} beams A beams object - will be modified
     * @param {string} id The ID
     * @param {StaveNote} event An event - will be modified
     */

    for (let i = 0; i < beams.ids.length; i++) {
        // iterate through all beams, since a note can belong to many beams
        if (beams.ids[i].includes(id)) {
            // add it to partial
            beams.partial[i].push(event);
            // remove it from IDs list
            beams.ids[i] = beams.ids[i].filter((myID) => !(myID == id));
        }

    }

    return;
}

function updateBeams(beams, factory) {
    /**
     * Checks whether any beams are completed, creates them, and removes them from the partial lists
     * 
     * @param {object} beams A beams object - will be modified
     * @param {Factory} factory A factory with context
     * 
     * @returns {Array} A list of completed beams
     */

    let completedBeams, newBeamIDs, newPartialBeams;
    
    completedBeams = []; newBeamIDs = []; newPartialBeams = [];
    for (let i = 0; i < beams.ids.length; i++) {
        if (beams.ids[i].length == 0) {
            // this beam is completed - only add if it's nontrivial
            if (beams.partial[i].length > 1) completedBeams.push(factory.Beam({"notes": beams.partial[i]}));
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

function processQueues(queues, numMeasures, numParts, position, globalAttribs, factory) {
    /**
     * Outputs all items in the queues with a factory
     * 
     * @param {Array} queues An array of queue objects - will be modified
     * @param {number} numMeasures The number of measures to render
     * @param {number} numParts The number of parts
     * @param {object} position A position within the factory's context - will be modified
     * @param {Array} globalAttribs An array of global attributes - will be modified
     * @param {Factory} factory A factory with which to draw measures - will be modified
     */

    for (let i = 0; i < numMeasures; i++) {
        // i indexes over measures
        let requiredWidth, system, reflowed;

        // calculate the minimum required width to render the stave across all the parts
        requiredWidth = null;
        reflowed = false;
        for (let j = 0; j < numParts; j++) {
            // j indexes over parts
            let thisPartWidth;

            thisPartWidth = queues[j].staves[i].getNoteStartX() + (1 + measureSafetyFactor) * new Formatter().joinVoices(queues[j].voices[i]).preCalculateMinTotalWidth(queues[j].voices[i]);
            // check if the required width of the system should be increased
            if ((requiredWidth === null) || requiredWidth < thisPartWidth)requiredWidth = thisPartWidth;
        }

        if (requiredWidth === null) requiredWidth = defaultMeasureWidth;
        // for now, if the measure is too long, max it out at the sheet width minus a safety factor
        if (requiredWidth > defaultSheetWidth) requiredWidth = (1 - sheetSafetyFactor) * defaultSheetWidth;
        if (requiredWidth < minMeasureWidth) requiredWidth = minMeasureWidth;
        // check if we need to reflow
        // TODO: justify lines of measures
        // TODO: adjust context height
        if (position.x + requiredWidth > defaultSheetWidth) {
            // reflow to a new line
            position.x = 0.;
            position.y += defaultMeasureHeight;
            reflowed = true;
        }

        // create the system
        system = factory.System({'x': position.x, 'y': position.y, "width": requiredWidth});
        // now, we can update the system with the staves
        for (let j = 0; j < numParts; j++) {
            let currentStave, currentVoices;
            
            currentStave = queues[j].staves[i];
            currentVoices = queues[j].voices[i];
            // set position of stave
            currentStave.setX(position.x);
            currentStave.setY(position.y);
            currentStave.setWidth(requiredWidth);
            if (globalAttribs[i].timeChange !== null) currentStave.addTimeSignature(timeSignatureToVF(globalAttribs[i].timeChange));
            if (globalAttribs[i].keyChange !== null) {
                currentStave.addKeySignature(globalAttribs[i].keyChange[1], globalAttribs[i].keyChange[0]);
            } else if (reflowed) {
                // following convention, add key signature to new lines
                currentStave.addKeySignature(globalAttribs[i].startKey);
            }

            if (reflowed && !globalAttribs[i].startClefs.clefsAdded[j]) currentStave.addClef(globalAttribs[i].startClefs.clefs[j]);
            if (globalAttribs[i].repeat.start) currentStave.setBegBarType(Barline.type.REPEAT_BEGIN);
            if (globalAttribs[i].end) currentStave.setEndBarType(Barline.type.END);
            if (globalAttribs[i].repeat.end) currentStave.setEndBarType(Barline.type.REPEAT_END);
            system.addStave({"stave": currentStave, "voices": currentVoices});
        }

        if (globalAttribs[i].start || reflowed) system.addConnector("singleLeft");
        // update position with the true measure width
        position.x += requiredWidth;
    }

    // everything is done, clear all queues
    for (let j = 0; j < numParts; j++) {
        queues[j] = structuredClone(emptyQueue);
    }

    return;
}

function measuresToFactory(measures, globMeasures, numParts, factory) {
    /**
     * Outputs measures with a factory
     * 
     * @param {Array} measures Measures to be shown
     * @param {Array} globMeasures Global object measures: should have the same length as each item in `measures`
     * @param {number} numParts The number of parts
     * @param {Factory} vf A factory with which to draw measures - will be modified
     */

    // variables persist across measures
    let curKeySignature, prevKeySignature, curTimeSignature, beams, queues, queueSize, curPosition, globalMeasInfos, clefsArr;

    // initialize queues
    queues = Array.from(Array(numParts), () => structuredClone(emptyQueue));
    // keep track of the number of measures in the queues
    queueSize = 0;
    globalMeasInfos = [];
    // initial position
    curPosition = structuredClone(startPosition);
    // set defaults (key C major, common time, all parts treble)
    curKeySignature = fifthsToMajorKeyMap[0];
    curTimeSignature = commonTime;
    clefsArr = Array.from(Array(numParts), () => "treble");
    // keep a running array of beams
    beams = {
        "ids": [], 
        "partial": [], 
    };
    measures.map(
        (measure, measureIdx) => {
            let globalMeasure, globalMeasInfo, clefsAdded;

            clefsAdded = Array.from(Array(numParts), () => false);
            // check global measures for time and key updates
            globalMeasure = globMeasures[measureIdx];
            globalMeasInfo = structuredClone(globalMeasureInfoTemplate);
            globalTimeSignature = false;
            globalKeySignature = false;
            if (measureIdx == 0) {
                globalMeasInfo.start = true;
            }

            if (measureIdx == (measures.length - 1)) {
                globalMeasInfo.end = true;
            }

            if ("repeat-start" in globalMeasure) {
                if (globalMeasure["repeat-start"].constructor != Object) throw new MNXParseError("Global measure repeat-start must be an object.");
                globalMeasInfo.repeat.start = true;
            }

            if ("repeat-end" in globalMeasure) {
                if (globalMeasure["repeat-end"].constructor != Object) throw new MNXParseError("Global measure repeat-end must be an object.");
                globalMeasInfo.repeat.end = true;
            }

            if ("time" in globalMeasure) {
                // need to add a time signature
                validateTimeSignature(globalMeasure.time);
                curTimeSignature = {"count": globalMeasure.time.count, "unit": globalMeasure.time.unit}
                globalMeasInfo.timeChange = curTimeSignature;
            }

            if ("key" in globalMeasure) {
                // need to add a key signature
                validateKeySignature(globalMeasure.key);
                // save the previous key signature for cancelling
                prevKeySignature = curKeySignature;
                curKeySignature = fifthsToMajorKeyMap[globalMeasure.key.fifths];
                globalMeasInfo.keyChange = [prevKeySignature, curKeySignature];
            }

            // validate each part's measure
            measure.map(validateMeasure);
            // process part measures
            for (let j = 0; j < numParts; j++) {
                let stave, parsedSequence, partMeasure, newFullBeams, newVoices;

                partMeasure = measure[j];
                // create a new stave
                // the position is set to (0, 0) so that when we later call its getNoteStartX() method, it will return the offset of the first note
                stave = factory.Stave({"width": defaultMeasureWidth});
                if ("clefs" in partMeasure) {
                    if (!(partMeasure.clefs instanceof Array)) throw new MNXParseError("Clefs must be array.");
                    // need to add a clef
                    if (partMeasure.clefs.length > 1) throw new UnsupportedFeatureError("Multiple clefs in measure.");
                    validatePositionedClef(partMeasure.clefs[0]);
                    validateClef(partMeasure.clefs[0].clef);
                    clefsArr[j] = clefFromMNX(partMeasure.clefs[0].clef);
                    stave.addClef(clefsArr[j]);
                    // note this, so we don't add another clef
                    clefsAdded[j] = true;
                }

                // check for beams
                if ("beams" in partMeasure) {
                    let newBeamIDs, newBeams;
                    if (!(partMeasure.beams instanceof Array)) throw new MNXParseError("Measure beams must be an array.");
                    // validate
                    partMeasure.beams.map(validateBeam);
                    newBeamIDs = partMeasure.beams.map((beam) => beam.events);
                    newBeams = {"ids": newBeamIDs, "partial": Array.from(Array(newBeamIDs.length), () => [])};
                    beams = updateArrayFields(beams, newBeams);
                }

                // get sequences
                parsedSequence = getSequences(partMeasure.sequences, clefsArr[j], beams, factory);
                //console.log(parsedSequence);
                // update beams
                newFullBeams = updateBeams(beams, factory);
                // start queue management
                // stash beams
                queues[j].beams = queues[j].beams.concat(newFullBeams);
                // stash stave
                queues[j].staves.push(stave);
                // stash voices
                newVoices = Array.from(Array(parsedSequence.length), () => factory.Voice({"time": timeSignatureToVF(curTimeSignature)}));
                newVoices.map((newVoice, voiceIdx) => newVoice.addTickables(parsedSequence[voiceIdx].notes));
                queues[j].voices.push(newVoices);
                // stash tuplets
                parsedSequence.map((voice) => {
                    queues[j].tuplets = queues[j].tuplets.concat(voice.tuplets);
                });
            }

            // increment the size of the queue
            queueSize += 1;
            globalMeasInfo.startKey = curKeySignature;
            globalMeasInfo.startClefs = {
                "clefs": clefsArr.slice(), 
                "clefsAdded": clefsAdded, 
            };
            globalMeasInfos.push(globalMeasInfo);
            // if all continuable dependencies are empty, we can empty the queues
            if (beams.ids.length == 0) {
                processQueues(queues, queueSize, numParts, curPosition, globalMeasInfos, factory);
                // reset the measure count
                queueSize = 0;
                globalMeasInfos = [];
            }

        }

    );
    if (beams.ids.length != 0) throw new MNXParseError(`Reached end of score, but ${beams.ids.length} beam(s) were not completed.`);
    return;
}

function parseMNXv1(obj, outputDivId) {
    /**
     * Displays an MNX version 1 object on a div
     * 
     * @param {object} obj A potential MNX object to display
     * @param {string} outputDivId The ID of a div in which to draw the score - will be modified
     */

    let numMeasures, partMeasures, vf;
    
    //console.log(obj);
    // clear the contents of the div
    document.getElementById(outputDivId).innerHTML = "";
    // check if the object is valid MNX
    validateMNXObject(obj);
    validateMNXMetadata(obj.mnx);
    validateMNXGlobal(obj.global);
    // check version
    if (getMNXVersion(obj) != 1) throw new MNXParseError("Unsupported version.");
    // create a new factory
    vf = new Factory({"renderer": {"elementId": outputDivId, "width": defaultSheetWidth, "height": defaultSheetHeight}});
    // to treat parts, we will first verify that the global measures and each part's measures array has the same length
    obj.parts.map(validatePart);
    // get the length of the global measures
    numMeasures = obj.global.measures.length;
    // check that each part's measures array has this length
    obj.parts.map((part) => {
        if (part.measures.length != numMeasures) throw new MNXParseError("Global and parts measures arrays have unmatching measure counts.");
    });
    // now, we iterate over all measures in each part
    partMeasures = obj.global.measures.map((_, i) => obj.parts.map((part) => part.measures[i]));
    measuresToFactory(partMeasures, obj.global.measures, obj.parts.length, vf);
    // draw the factory
    vf.draw();
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