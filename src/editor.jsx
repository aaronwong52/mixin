import styled from 'styled-components';
import * as Tone from 'tone';
import p5 from 'p5';

import { useState, useEffect, useRef } from 'react';
import { TRANSPORT_LENGTH } from './utils';

const StyledEditor = styled.div`
    width: 100vw;
    height: 250px;
    background-color: #fafaf7;
`;

const StyledWaveformView = styled.div`
    height: 150px;
`

function Editor({recording}) {
    const [buffer, setBuffer] = useState([]);
    const [duration, setDuration] = useState(0);
    const editorRef = useRef();

    const s = (sketch) => {
        sketch.setup = () => {
            sketch.createCanvas(sketch.windowWidth, 150);
        };
        sketch.draw = () => {
            if (buffer.length === 0) {
                return;
            }
            sketch.background('#fafaf7');
            sketch.beginShape();
            sketch.noFill();
            let i = 0;
            let position = 0;
            while (i < buffer.length) {
                let sum = 0;
                let window = 100;
                for (let p = position; p < position + window; p++) {
                    if (buffer[p] < 0) {
                        sum -= buffer[p] * 1000;
                    } else {
                        sum += buffer[p] * 1000;
                    }
                }
                let average = (sum * 2) / window;
                let x = sketch.map(i, 0, buffer.length - 1, 50, sketch.width - 50);
                sketch.vertex(x, sketch.height - average);
                i += window;
                position += window;
            }
            sketch.endShape();
        }
    }
    
    // useEffect(() => {
    //     new p5(s, editorRef.current);
    // }, []);

    useEffect(() => {
        let waveform = new p5(s, editorRef.current);
        if (Object.keys(recording).length) {
            setDuration(recording.player.buffer.duration);
            setBuffer(recording.player.buffer._buffer.getChannelData(0));
        };
        return () => {
            waveform.remove();
        }
    }, [recording, buffer]);
    return (
        <StyledEditor>
            <StyledWaveformView ref={editorRef}>
            </StyledWaveformView>
        </StyledEditor>
    )
}

export default Editor;