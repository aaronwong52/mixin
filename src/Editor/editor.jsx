import p5 from 'p5';

import { useState, useEffect, useRef, useContext } from 'react';
import * as styles from './editorStyles';
import * as Tone from 'tone';
import Crop from './Crop';
import Split from './Split';
import { PIX_TO_TIME } from '../utils/constants';
import { map } from '../utils/audio-utils';

import { StateDispatchContext } from '../utils/StateContext';

// recording is selectedRecording prop
function Editor({recording, solo, exporting}) {
    const dispatch = useContext(StateDispatchContext);

    const editorWidth = useRef(0);
    const [buffer, setBuffer] = useState([]);
    const [muted, setMuted] = useState(false);
    const [cropping, setCropping] = useState(false);
    const [cropLeft, setCropLeft] = useState(0);
    const [cropRight, setCropRight] = useState(0);
    const [splitting, setSplitting] = useState(false);
    const editorRef = useRef();

    // resize canvas on window resize!
    const waveformSketch = (sketch) => {
        let width = editorWidth.current;
        let height = 175;
        sketch.setup = () => {
            sketch.createCanvas(width, height);
        };
        sketch.draw = () => {
            if (buffer.length === 0) {
                return;
            }
            sketch.background('#454a52');
            sketch.beginShape();
            sketch.stroke('#ced4de')

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
            sketch.rect(timeScaled, 0, 1, 175, 0); // playline
        }
    };

    const checkEnabled = () => {
        return (Object.keys(recording).length && !exporting);
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
        delta = _mapPointToTime(delta, recording)

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

        if ((point / PIX_TO_TIME) > recording.start) {
            setSplitting(!splitting);
            point = _mapPointToTime(point, recording);
            // dispatch updateRecording to shorten original and then addRecording 
            dispatch({type: 'addSplitRecording', payload: {recording, splitPoint: point}});
            dispatch({type: 'updateSplitRecording', payload: {recording, splitPoint: point}});
        }
    }

    useEffect(() => {
        let editor = document.getElementById("editor");
        editorWidth.current = editor.offsetWidth;
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
    }, [recording, buffer]);

    useEffect(() => {
        let editor = document.getElementById("editor");
        editorWidth.current = editor.offsetWidth;
    }, [])


    return (
        <styles.Editor id="editor" loaded={editorWidth.current}>
            <styles.ControlView>
                <styles.ClipMute onClick={mute} muted={muted}></styles.ClipMute>
                <styles.ClipSolo onClick={soloClip} solo={recording.solo}>S</styles.ClipSolo>
                <styles.Crop cropping={cropping} onClick={cropClip}></styles.Crop>
                <styles.Split splitting={splitting} onClick={onSplitClick}></styles.Split>
            </styles.ControlView>
            <styles.EditorWaveform ref={editorRef}>
                <Crop cropping={cropping} setPoints={setCropPoints}></Crop>
                <Split splitting={splitting} splitClip={(point) => splitClip(point)}></Split>
            </styles.EditorWaveform>
        </styles.Editor>
    )
}

export default Editor;