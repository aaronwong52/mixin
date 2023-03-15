import p5 from 'p5';
import { useEffect, useRef } from 'react';

import styled from 'styled-components';
import * as Tone from 'tone';

const Clock = styled.div`
    background-color: "#1e2126";
    height: 100%;
    width: 100%;
`;

// time (number) to seconds time (string) (s.ms)
// @ts-ignore
const toClockTime = (time) => {
    let timeString = time.toFixed(2).toString();
    return timeString.split(".")[0] + "." + timeString.split(".")[1];
}

export default function TransportClock() {

    const clockRef = useRef();

    useEffect(() => {
        // @ts-ignore
        const s = (sketch) => {
            // @ts-ignore
            let x = clockRef.current.offsetWidth;
            // @ts-ignore
            let y = clockRef.current.offsetHeight;
            // @ts-ignore
            let context;

            sketch.setup = () => {
                context = sketch.createCanvas(x, y).drawingContext;
                sketch.textAlign(sketch.CENTER, sketch.CENTER);
            };

            sketch.draw = () => {
                sketch.clear();
                // @ts-ignore
                context.font = '25px Avenir';
                sketch.select('#transportClock').elt.style.letterSpacing = "1.5px";
                sketch.fill("white");
                let time = toClockTime(Tone.Transport.seconds);
                sketch.text(time, x / 2, 20); // text, x pos, y pos
            }
        };

        let clockp5 = new p5(s, clockRef.current);
        return () => clockp5.remove(); 
    }, []);

    return (
        // @ts-ignore
        <Clock key="clock" id="transportClock" ref={clockRef}>
        </Clock>
    );
}