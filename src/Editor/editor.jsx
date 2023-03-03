import p5 from 'p5';

import { useState, useEffect, useRef, useContext } from 'react';
import * as styles from './editorStyles';
import * as Tone from 'tone';
import Crop from './Crop';
import Split from './Split';
import LiveWaveform from './LiveWaveform';

import { PIX_TO_TIME } from '../utils/constants';
import { map } from '../utils/audio-utils';

import { StateContext, StateDispatchContext } from '../utils/StateContext';

// recording is selectedRecording prop
function Editor({solo, exporting}) {
    const state = useContext(StateContext)
    const dispatch = useContext(StateDispatchContext);

    const editorRef = useRef();
    const [buffer, setBuffer] = useState([]);
    const [muted, setMuted] = useState(false);
    const [cropping, setCropping] = useState(false);
    const [cropLeft, setCropLeft] = useState(0);
    const [cropRight, setCropRight] = useState(0);
    const [splitting, setSplitting] = useState(false);

    const waveformSketch = (sketch) => {
        let width = 650;
        let height = 200;
        sketch.setup = () => {
            sketch.createCanvas(width, height);
        };
        sketch.draw = () => {
            if (buffer.length === 0) {
                return;
            }
            sketch.background('#2c3036');
            sketch.beginShape();
            sketch.stroke('#ced4de');

            let recording = state.selectedRecording;

            let toneTime = Tone.Transport.seconds;
            let trueEnd = recording.position + recording.player._buffer.duration; // uncropped duration is here
            let timeScaled = sketch.map(toneTime, recording.start, recording.duration, 0, width);

            let sampleStart = Math.round(sketch.map(recording.start, recording.position, trueEnd, 0, buffer.length));
            let sampleEnd = Math.round(sketch.map(recording.duration, recording.position, trueEnd, 0, buffer.length));
            
            let i = sampleStart;
            let position = i;

            while (i < sampleEnd) {
                let sum = 0;
                let window = 100;
                for (let p = position; p < position + window; p++) {
                    sum += buffer[p] * 500;
                }
                let x = sketch.map(i, sampleStart, sampleEnd, 0, width);
                let average = (sum * 2) / window;
                sketch.vertex(x, height / 2 - average);
                i += window;
                position += window;
            }
            sketch.endShape();
            
            sketch.stroke("#868e9c");
            sketch.rect(timeScaled, 0, 1, 200, 0); // playline
        }
    };

    const checkEnabled = () => {
        return (Object.keys(state.selectedRecording).length && !exporting);
    };
    
    const _reset = () => {
        _clearBuffer();
        setCropping(false);
    };

    const _clearBuffer = () => {
        setBuffer([]);
    };

    // mutating recording state directly for Tone operations
    const mute = () => {
        let recording = state.selectedRecording;
        if (!checkEnabled()) {
            return;
        }
        muted 
            ? recording.player.mute = false
            : recording.player.mute = true;
        setMuted(!muted);
    };

    const soloClip = () => {
        if (!checkEnabled()) {
            return;
        }
        solo(recording.solo);
    };

    const _cancelEdits = () => {
        setCropping(false);
        setSplitting(false);
    }

    // crop does not modify audio data
    // start and end points are used to calculate offset and duration for Tone player
    const cropClip = () => {
        if (!checkEnabled()) {
            return;
        }
        if (cropping) {
            let recording = state.selectedRecording;
            dispatch({type: 'cropRecording', payload: {
                recording, 
                leftDelta: cropLeft,
                rightDelta: cropRight,
            }});
        } else {
            _cancelEdits();
        }
        setCropping(!cropping);
    };

    // get a point position in seconds
    const _mapPointToTime = (point, recording) => {
        let recordingLength = recording.duration - recording.start;
        return map(point, 0, editorWidth.current, 0, recordingLength);
    };

    const setCropPoints = (type, delta) => {
        delta = _mapPointToTime(delta, state.selectedRecording)

        if (type == 'start') {
            setCropLeft(delta);

        } else if (type == 'end') {
            setCropRight(delta);
        }
    };

    const onSplitClick = () => {
        if (!checkEnabled()) {
            return;
        }
        _cancelEdits();
        setSplitting(!splitting);
    };

    const splitClip = (point) => {
        _splitClip(point);
    }

    const _splitClip = (point) => {
        if (!checkEnabled()) {
            return;
        }

        let recording = state.selectedRecording;
        if ((point / PIX_TO_TIME) > recording.start) {
            setSplitting(!splitting);
            point = _mapPointToTime(point, recording);
            // dispatch updateRecording to shorten original and then addRecording 
            dispatch({type: 'addSplitRecording', payload: {recording, splitPoint: point}});
            dispatch({type: 'updateSplitRecording', payload: {recording, splitPoint: point}});
        }
    }

    useEffect(() => {
        let recording = state.selectedRecording;
        let waveform = new p5(waveformSketch, editorRef.current);
        if (Object.keys(recording).length) {
            try {
                setBuffer(recording.player.buffer._buffer.getChannelData(0));
            } catch (e) {
                console.log(e);
            }
        } else if (buffer.length) { // if there's no recording but a buffer is still selected
            _reset();
        }
        return () => waveform.remove();
    }, [state.selectedRecording, buffer]);

    return (
        <styles.Editor id="editor">
            <styles.ControlView>
                <styles.ClipMute onClick={mute} muted={muted}></styles.ClipMute>
                <styles.ClipSolo onClick={soloClip} solo={state.selectedRecording.solo}>S</styles.ClipSolo>
                <styles.Crop cropping={cropping} onClick={cropClip}></styles.Crop>
                <styles.Split splitting={splitting} onClick={onSplitClick}></styles.Split>
            </styles.ControlView>
            {state.recordingState
                ? <LiveWaveform></LiveWaveform>
                : <styles.EditorWaveform ref={editorRef}>
                    <Crop key="cropElem" cropping={cropping} setPoints={setCropPoints}></Crop>
                    <Split key="splitElem" splitting={splitting} splitClip={(point) => splitClip(point)}></Split>
                  </styles.EditorWaveform>
            }
        </styles.Editor>
    )
}

export default Editor;