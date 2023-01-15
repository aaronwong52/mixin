import {  useEffect } from 'react'
import p5 from 'p5';
import styled from 'styled-components';

const StyledWaveform = styled.div`
  height: 100px;
`

export default function Waveform(analyser) {
    useEffect(() => {
      let analyzer = analyser.analyser;
      if (!analyzer) return;
      const s = (sketch) => {
        let x = 500;
        let y = 150;

        sketch.setup = () => {
          sketch.createCanvas(x, y);
        };

        sketch.draw = () => {
          sketch.background('#dcf0f3');
          sketch.noFill();
          const values = analyzer.getValue();
          sketch.beginShape();
          // sketch.textSize(16); // add db values to waveform
          // sketch.fill(0, 102, 153);
          // sketch.text('test', 0, 150);
          for (let i=0; i<values.length; i++) {
            const amplitude = values[i];
            const x = sketch.map(i, 0, values.length - 1, 0, sketch.width);
            const y = sketch.height / 3 + amplitude * sketch.height * 3;
            sketch.vertex(x, y);
          } 
          sketch.endShape();
        };
      };
      let wavep5 = new p5(s, 'waveform');
    }, []);

    return (
        <StyledWaveform id="waveform">
        </StyledWaveform>
    );
  }