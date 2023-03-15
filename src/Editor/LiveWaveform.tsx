import { useRef, useEffect, useContext } from 'react'
import * as Tone from 'tone';
import p5 from 'p5';

import { StateContext } from '../utils/StateContext';

import { StyledWaveform } from './Styles/liveWaveformStyles';

export default function LiveWaveform() {
	const state = useContext(StateContext);
    const waveformRef = useRef<HTMLDivElement>(null);
    const analyser = useRef<Tone.Waveform | null>(null);

    const s = (sketch: p5) => {

        let width: number = 0;
        let height: number = 0;
        if (waveformRef.current) {
            width = waveformRef.current.offsetWidth;
            height = waveformRef.current.offsetHeight;
        }

        sketch.setup = () => {
            sketch.createCanvas(width, height);
        };

        sketch.draw = () => {
            sketch.noFill();
            sketch.background("#1e2126");
            if (!analyser.current) {
                return;
            }
            let values = analyser.current.getValue();
            sketch.beginShape();
            
            for (let i = 0; i < values.length; i++) {
                const amplitude = values[i];
                const xVertex = sketch.map(i, 0, values.length - 1, 0, width);
                const yVertex = height / 2 + amplitude * height * 3;
                sketch.vertex(xVertex, yVertex);
                sketch.stroke("#dbdbdb")
            } 
            sketch.endShape();
        };
    };

    useEffect(() => {
        analyser.current = new Tone.Waveform(8192);
    }, [])

	useEffect(() => {
        // @ts-ignore
		if (!state.mic || !waveformRef.current) {
			return;
	    };

        // @ts-ignore
        state.mic.connect(analyser.current);
        let recorderP5 = new p5(s, waveformRef.current);
        return () => {
            recorderP5.remove();
            // @ts-ignore
            state.mic.disconnect(analyser);
        }
        // @ts-ignore
    }, [state.mic]);

	return (
		<StyledWaveform id="waveform" ref={waveformRef}>
		</StyledWaveform>
	);
  }