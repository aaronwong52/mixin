import p5 from 'p5';

import { useState, useEffect, useRef } from 'react';
import * as styles from './editorStyles';
import * as Tone from 'tone';
import useDragRange from './useDragRange';
import { TRANSPORT_LENGTH } from '../utils/constants';
import { map } from '../utils/audio-utils';

// recording is selectedRecording prop
function Editor({recording, solo, exporting}) {
    const [buffer, setBuffer] = useState([]);
    const [muted, setMuted] = useState(false);
    const [highlighting, setHighlighting] = useState(false);
    const zoom = useRef(3);
    const editorRef = useRef();

    // resize canvas on window resize!
    const s = (sketch) => {
        let width = TRANSPORT_LENGTH / 2.5;
        let height = 175;
        sketch.setup = () => {
            sketch.createCanvas(width, height);
        };
        sketch.draw = () => {
            if (buffer.length === 0) {
                return;
            }
            sketch.background('#454a52');
            sketch.beginShape();
            sketch.stroke('#ced4de')
            let i = 0;
            let position = 0;
            while (i < buffer.length) {
                let sum = 0;
                let window = 100;
                for (let p = position; p < position + window; p++) {
                    sum += buffer[p] * 500;
                }
                let x = sketch.map(i, 0, buffer.length, 0, width);
                let average = (sum * 2) / window;
                sketch.vertex(x, height / 2 - average);
                i += window;
                position += window;
            }
            sketch.endShape();
            let toneTime = Tone.Transport.seconds;
            let timeScaled = sketch.map(toneTime, recording.start, recording.end, 0, width);
            sketch.stroke("#868e9c");
            sketch.rect(timeScaled, 0, 1, 175, 0); // playline
        }
    };

    const checkEnabled = () => {
        return (Object.keys(recording).length && !exporting);
    };
    
    const _reset = () => {
        _clearBuffer();
        setHighlighting(false);
    };

    const _clearBuffer = () => {
        setBuffer([]);
    };

    // mutating recording state directly for Tone operations
    const mute = () => {
        if (!checkEnabled()) {
            return;
        }
        muted 
            ? recording.player.mute = false
            : recording.player.mute = true;
        setMuted(!muted);
    };

    const soloClip = () => {
        if (!checkEnabled()) {
            return;
        }
        solo(recording.solo);
    };

    // crop does not modify audio data
    // start and end points are used to calculate offset and duration for Tone player

    // !!! crop button should switch to check mark to complete
    const cropClip = () => {
        if (!checkEnabled()) {
            return;
        }
        setHighlighting(!highlighting);
    };

    const setPoints = (type, delta) => {

        delta = map(delta, 0, TRANSPORT_LENGTH / 2.5, 0, recording.duration); // get point position in seconds

        // is it computationally or logically expensive to actually go in and slice the buffer?

        // computationally not expensive. should be able to just go into the buffer and slice out a range (within react guidelines)

        // logically - if we don't slice it and just store cut points - how does that affect the UI?
        // do we display the full clip and the full waveform in the editor? If we don't, why are we storing that data?
        // there can be an option to undo crops, and/or to make them permanent?

        // let's just build it out this way safely first
        if (type == 'start') {
            recording.start += delta;
            // dispatch 

        } else if (type == 'end') {
            recording.duration -= delta;
            // dispatch 
        }
    }

    useEffect(() => {
        let waveform = new p5(s, editorRef.current);
        if (Object.keys(recording).length) {
            try {
                setBuffer(recording.player.buffer._buffer.getChannelData(0));
            } catch (e) {
                console.log(e);
            }
        } else if (buffer.length) {
            _reset();
        }
        return () => waveform.remove();
    }, [recording, buffer]);

    return (
        <styles.Editor>
            <styles.ControlView>
                <styles.ClipMute id="editorButton" onClick={mute} muted={muted}></styles.ClipMute>
                <styles.ClipSolo id="editorButton" onClick={soloClip} solo={recording.solo}>S</styles.ClipSolo>
                <styles.Crop id="editorButton" onClick={cropClip}></styles.Crop>
            </styles.ControlView>
            <styles.EditorWaveform ref={editorRef}>
                {useDragRange(highlighting, setPoints)}
            </styles.EditorWaveform>
        </styles.Editor>
    )
}

export default Editor;