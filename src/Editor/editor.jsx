import p5 from 'p5';

import { useState, useEffect, useRef } from 'react';
import * as styles from './editorStyles';
import { SAMPLE_RATE } from '../utils/constants';

// recording is selectedRecording prop
function Editor({recording, solo, exporting}) {
    const [buffer, setBuffer] = useState([]);
    const [muted, setMuted] = useState(false);
    const zoom = useRef(3);
    const editorRef = useRef();

    // resize canvas on window resize!
    const s = (sketch) => {
        let width = sketch.windowWidth / 1.5;
        let height = 175;
        sketch.setup = () => {
            sketch.createCanvas(width, height);
        };
        sketch.draw = () => {
            if (buffer.length === 0) {
                return;
            }
            const duration = buffer.length / SAMPLE_RATE;
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
                let x = sketch.map(i, 0, buffer.length - 1, 0, width);
                let average = (sum * 2) / window;
                sketch.vertex(x, height / 2 - average); // 1.5 since waveform points upwards
                i += window;
                position += window;
            }
            sketch.endShape();
        }
    }

    const mute = () => {
        if (!Object.keys(recording).length || exporting) {
            return;
        }
        recording.player.mute = true;
        setMuted(!muted);
    }

    const soloClip = () => {
        if (!Object.keys(recording).length || exporting) {
            return;
        }
        solo(recording.solo);
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
                <styles.ClipMute onClick={mute} muted={muted}></styles.ClipMute>
                <styles.ClipSolo onClick={soloClip} solo={recording.solo}>S</styles.ClipSolo>
            </styles.ControlView>
            <styles.EditorWaveform ref={editorRef}>
            </styles.EditorWaveform>
        </styles.Editor>
    )
}

export default Editor;