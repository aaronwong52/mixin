import { useRef, useEffect, useContext } from 'react'
import * as Tone from 'tone';
import p5 from 'p5';

import { StateContext } from '../utils/StateContext';

import { StyledWaveform } from './Styles/liveWaveformStyles';

export default function LiveWaveform() {
	const state = useContext(StateContext);
    const waveformRef = useRef(null);

	useEffect(() => {
		if (!state.mic) {
			return;
	    };

        const analyser = new Tone.Analyser('waveform', 8192);
        state.mic.connect(analyser);

        const s = (sketch) => {
            let x = waveformRef.current.offsetWidth;
            let y = waveformRef.current.offsetHeight;

            sketch.setup = () => {
                sketch.createCanvas(x, y);
            };

            sketch.draw = () => {
                sketch.noFill();
                sketch.background("#1e2126");
                const values = analyser.getValue();
                sketch.beginShape();
                
                for (let i = 0; i < values.length; i++) {
                    const amplitude = values[i];
                    const xVertex = sketch.map(i, 0, values.length - 1, 0, x);
                    const yVertex = y / 2 + amplitude * y * 3;
                    sketch.vertex(xVertex, yVertex);
                    sketch.stroke("#dbdbdb")
                } 
                sketch.endShape();
            };
        };
        
        let recorderP5 = new p5(s, 'waveform');
        return () => {
            recorderP5.remove();
            state.mic.disconnect(analyser);
        }
    }, [state.mic]);

	return (
		<StyledWaveform id="waveform" ref={waveformRef}>
		</StyledWaveform>
	);
  }