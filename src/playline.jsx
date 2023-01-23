import { useEffect, useRef } from 'react';
import p5 from 'p5';

import styled from 'styled-components';
import { Transport } from 'tone';

import {TRANSPORT_LENGTH, PIX_TO_TIME } from './utils';


const Playline = styled.div`
  position: absolute;
  top: 0;
`

function Playhead() {
    const playlineRef = useRef();
    useEffect(() => {
        const s = (sketch) => {
            let x = TRANSPORT_LENGTH;
            let y = 100;
            sketch.setup = () => {
                sketch.createCanvas(x, y);
            }
            sketch.draw = () => {
                let time = (Transport.seconds * PIX_TO_TIME);
                sketch.background("white");
                sketch.fill("#dcf0f3")
                sketch.rect(time, 0, 4, y);
            }
        }
        let playSketch = new p5(s, playlineRef.current);
        return () => playSketch.remove();
    }, []);
    
    return [
        <Playline key="playline" ref={playlineRef}></Playline>
    ]
}

export default Playhead;
