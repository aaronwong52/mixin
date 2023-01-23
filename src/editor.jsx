import styled from 'styled-components';
import * as Tone from 'tone';
import p5 from 'p5';

import { useState, useEffect, useRef } from 'react';
import { PIX_TO_TIME, SAMPLE_RATE } from './utils';

const StyledEditor = styled.div`
    width: 100vw;
    height: 225px;
    background-color: #fafaf7;
`;

const StyledWaveformView = styled.div`
    height: 150px;
`

function Editor({recording}) {
    const [buffer, setBuffer] = useState([]);
    const zoom = useRef(3);
    const editorRef = useRef();

    const s = (sketch) => {
        sketch.setup = () => {
            sketch.createCanvas(sketch.windowWidth, 150);
        };
        sketch.draw = () => {
            if (buffer.length === 0) {
                return;
            }
            const duration = buffer.length / SAMPLE_RATE;
            const start = findMiddle(duration * PIX_TO_TIME, 0, sketch.windowWidth);
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
                        sum -= buffer[p] * 300;
                    } else {
                        sum += buffer[p] * 300;
                    }
                }
                let x = sketch.map(
                    i, 0, buffer.length - 1, start / zoom.current, (start + (duration * PIX_TO_TIME) * zoom.current)
                );
                let average = (sum * 2) / window;
                sketch.vertex(x, 150 - average);
                i += window;
                position += window;
            }
            sketch.endShape();
        }
    }
    
    // given length of an object, and a range, return its middle-est position in this range
    const findMiddle = (length, start, end) => {
        if (start >= end) {
            return -1;
        }
        if (length > end - start) {
            return -1;
        }
        return Math.floor((end - start - length) / 2);
    }

    useEffect(() => {
        let waveform = new p5(s, editorRef.current);
        if (Object.keys(recording).length) {
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