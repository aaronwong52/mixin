import { useEffect, useRef } from 'react';
import p5 from 'p5';

import styled from 'styled-components';
import { Transport } from 'tone';

import {TRANSPORT_LENGTH, PIX_TO_TIME } from './utils';


const Playline = styled.div`
  position: absolute;
  left: 0;
  :hover {cursor: grab};
`

function Playhead() {
    const playlineRef = useRef();
    useEffect(() => {
        const s = (sketch) => {
            let x = TRANSPORT_LENGTH;
            let y = 85;
            sketch.setup = () => {
                sketch.createCanvas(x, y);
            }
            sketch.draw = () => {
                let time = (Transport.seconds * PIX_TO_TIME);
                sketch.background("white");
                sketch.fill("#5ba3e3")
                sketch.rect(time + 10, 0, 5, y);
            }
        }
        let playSketch = new p5(s, playlineRef.current);
        return () => playSketch.remove();
    }, []);
    
    return [
        <Playline ref={playlineRef}></Playline>
    ]
}

export default Playhead;
