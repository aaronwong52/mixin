import styled from 'styled-components';
import * as Tone from 'tone';
import p5 from 'p5';

import { useState, useEffect, useRef } from 'react';
import { PIX_TO_TIME, SAMPLE_RATE } from './utils';

const StyledEditor = styled.div`
    width: 100vw;
    height: 175px;
    margin-bottom: 40px;
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
        ? "url('/images/mute_white.png') no-repeat;"
        : "url('/images/unmute_white.png') no-repeat;"
    };
    width: 25px;
    height: 25px;
    padding: 0;
    background-color: transparent;
    background-size: 25px;
    border: none;
    :hover {cursor: pointer;}
    -webkit-tap-highlight-color: transparent;
`;

const ClipSolo = styled(ClipMute)`
    background: none;
    font-size: 26px;
    font-weight: bold;
    color: ${props => props.solo
        ? "#3c5e91"
        : "#d1d5de"
    };
`;

const WaveformView = styled.div`
    height: 175px;
    border: 1px solid black;
    border-radius: 4px;
    box-shadow: 0 0 3px #727a87;
`;

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
        <StyledEditor>
            <ControlView>
                <ClipMute onClick={mute} muted={muted}></ClipMute>
                <ClipSolo onClick={soloClip} solo={recording.solo}>S</ClipSolo>
            </ControlView>
            <WaveformView ref={editorRef}>
            </WaveformView>
        </StyledEditor>
    )
}

export default Editor;