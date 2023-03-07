import { useEffect, useContext } from 'react'
import * as Tone from 'tone';
import p5 from 'p5';

import { StateContext } from '../utils/StateContext';

import { StyledWaveform } from './Styles/liveWaveformStyles';

export default function LiveWaveform() {
	const state = useContext(StateContext);

	useEffect(() => {
		if (!state.mic) {
			return;
	};

	const analyser = new Tone.Analyser('waveform', 8192);
	state.mic.connect(analyser);

	const s = (sketch) => {
		let x = 650;
		let y = 200;

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
		<StyledWaveform id="waveform">
		</StyledWaveform>
	);
  }