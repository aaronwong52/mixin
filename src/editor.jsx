import styled from 'styled-components';
import * as Tone from 'tone';
import p5 from 'p5';

import { useState, useEffect, useRef } from 'react';
import { PIX_TO_TIME, SAMPLE_RATE } from './utils';

const StyledEditor = styled.div`
    width: 100vw;
    height: 225px;
    background-color: #fafaf7;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ControlView = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    width: 50px;
    height: 175px;
`
const ClipMute = styled.button`
    background: ${props => props.muted 
        ? "url('/images/mute.png') no-repeat;"
        : "url('/images/unmute.png') no-repeat;"
    };
    width: 25px;
    height: 25px;
    background-color: transparent;
    background-size: 25px;
    border: none;
    :hover {cursor: pointer;}
    -webkit-tap-highlight-color: transparent;
`;

const ClipSolo = styled(ClipMute)`
    background: none;
    font-size: 25px;
    font-weight: bold;
    color: ${props => props.solo
        ? "#42bcf5"
        : "inherit"
    };
`;

const WaveformView = styled.div`
    height: 175px;
    border: 1px solid black;
`;

function Editor({recording}) {
    const [buffer, setBuffer] = useState([]);
    const [muted, setMuted] = useState(false);
    const [solo, setSolo] = useState(false);
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
                        sum -= buffer[p] * 500;
                    } else {
                        sum += buffer[p] * 500;
                    }
                }
                let x = sketch.map(
                    i, 0, buffer.length - 1, 0, width
                );
                let average = (sum * 2) / window;
                sketch.vertex(x, height / 1.5 - average); // 1.5 since waveform points upwards
                i += window;
                position += window;
            }
            sketch.endShape();
        }
    }

    const mute = () => {
        if (!Object.keys(recording).length) {
            return;
        }
        recording.player.mute = true;
        setMuted(!muted);
    }

    const soloClip = () => {
        if (!Object.keys(recording).length) {
            return;
        }
        // figure out how to implement solo
        setSolo(!solo);
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
        return () => {
            waveform.remove();
        }
    }, [recording, buffer]);

    return (
        <StyledEditor>
            <ControlView>
                <ClipMute onClick={mute} muted={muted}></ClipMute>
                <ClipSolo onClick={soloClip} solo={solo}>S</ClipSolo>
            </ControlView>
            <WaveformView ref={editorRef}>
            </WaveformView>
        </StyledEditor>
    )
}

export default Editor;