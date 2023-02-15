import p5 from 'p5';

import { useState, useEffect, useRef } from 'react';
import * as styles from './editorStyles';
import * as Tone from 'tone';
import useDragRange from './useDragRange';
import { TRANSPORT_LENGTH } from '../utils/constants';

// recording is selectedRecording prop
function Editor({recording, solo, exporting}) {
    const [buffer, setBuffer] = useState([]);
    const [muted, setMuted] = useState(false);
    const [showRange, setShowRange] = useState(false);
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
            let recordingEnd = recording.position + recording.duration;
            let timeScaled = sketch.map(toneTime, recording.position, recordingEnd, 0, width);
            sketch.stroke("#868e9c");
            sketch.rect(timeScaled, 0, 1, 175, 0); // playline
        }
    };

    const checkEnabled = () => {
        return (Object.keys(recording).length && !exporting);
    }

    const mute = () => {
        if (!checkEnabled()) {
            return;
        }
        recording.player.mute = true;
        setMuted(!muted);
    };

    const soloClip = () => {
        if (!checkEnabled()) {
            return;
        }
        solo(recording.solo);
    };

    const trimClip = () => {
        if (!checkEnabled()) {
            return;
        }
        setShowRange(true);
    }

    useEffect(() => {
        let waveform = new p5(s, editorRef.current);
        if (Object.keys(recording).length) {
            try {
                setBuffer(recording.player.buffer._buffer.getChannelData(0));
            } catch (e) {
                // bad 
            }
        };
        return () => waveform.remove();
    }, [recording, buffer]);

    return (
        <styles.Editor>
            <styles.ControlView>
                <styles.ClipMute id="editorButton" onClick={mute} muted={muted}></styles.ClipMute>
                <styles.ClipSolo id="editorButton" onClick={soloClip} solo={recording.solo}>S</styles.ClipSolo>
                <styles.Scissors id="editorButton" onClick={trimClip}></styles.Scissors>
            </styles.ControlView>
            <styles.EditorWaveform ref={editorRef}>
                {useDragRange()}
            </styles.EditorWaveform>
        </styles.Editor>
    )
}

export default Editor;