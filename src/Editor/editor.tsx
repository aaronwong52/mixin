import p5 from 'p5';

import { useState, useEffect, useRef, useContext, forwardRef } from 'react';
import * as styles from './Styles/editorStyles';
import * as Tone from 'tone';
import Crop from './Crop';
import Split from './Split';
import LiveWaveform from './LiveWaveform';

import { PIX_TO_TIME } from '../utils/constants';
import { map } from '../utils/audio-utils';

import { StateContext, StateDispatchContext } from '../utils/StateContext';
import { AppTheme } from '../View/Themes';

interface EditorProps {
    solo: (s: boolean) => void;
    exporting: boolean;
}

// recording is selectedRecording prop
function Editor({solo, exporting}: EditorProps) {
    const state = useContext(StateContext)
    const dispatch = useContext(StateDispatchContext);

    const waveformRef = useRef<HTMLDivElement>(null);
    const [buffer, setBuffer] = useState([]);
    const [muted, setMuted] = useState(false);
    const [cropping, setCropping] = useState(false);
    const [cropLeft, setCropLeft] = useState(0);
    const [cropRight, setCropRight] = useState(0);
    const [splitting, setSplitting] = useState(false);

    const waveformSketch = (sketch: p5) => {
        let width: number = 0, height: number = 0;
        if (waveformRef.current) {
            width = waveformRef.current.offsetWidth;
            height = waveformRef.current.offsetHeight;
        }
        sketch.setup = () => {
            sketch.createCanvas(width, height);
        };
        sketch.draw = () => {
            if (buffer.length === 0) {
                return;
            }
            sketch.background('#2c3036');
            sketch.beginShape();
            sketch.stroke(AppTheme.AppTextOffColor);

            // @ts-ignore
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
            sketch.rect(timeScaled, 0, 1, height, 0); // playline
        }
    };

    const checkEnabled = (): boolean => {
        // @ts-ignore
        return (Object.keys(state.selectedRecording).length && !exporting);
    };
    
    const _reset = (): void => {
        _clearBuffer();
        setCropping(false);
    };

    const _clearBuffer = (): void => {
        setBuffer([]);
    };

    // mutating recording state directly for Tone operations
    const mute = (): void => {
        // @ts-ignore
        let recording = state.selectedRecording;
        if (!checkEnabled()) {
            return;
        }
        muted 
            ? recording.player.mute = false
            : recording.player.mute = true;
        setMuted(!muted);
    };

    const soloClip = (): void => {
        if (!checkEnabled()) {
            return;
        }
        // @ts-ignore
        solo(state.selectedRecording.solo);
    };

    // crop does not modify audio data
    // start and end points are used to calculate offset and duration for Tone player
    const cropClip = () => {
        if (!checkEnabled()) {
            return;
        }
        if (cropping) {
            // @ts-ignore
            let recording = state.selectedRecording;
            // @ts-ignore
            dispatch({type: 'cropRecording', payload: {
                recording, 
                leftDelta: cropLeft,
                rightDelta: cropRight,
            }});
        }
        setCropping(!cropping);
    };

    // get a point position in seconds
    // @ts-ignore
    const _mapPointToTime = (point: number, recording): number => {
        let recordingLength = recording.duration - recording.start;
        let waveformWidth = waveformRef.current ? waveformRef.current.offsetWidth : 0;
        return map(point, 0, waveformWidth, 0, recordingLength);
    };

    const setCropPoints = (type: string, delta: number): void => {
        // @ts-ignore
        delta = _mapPointToTime(delta, state.selectedRecording)

        if (type == 'start') {
            setCropLeft(delta);

        } else if (type == 'end') {
            setCropRight(delta);
        }
    };

    const onSplitClick = (): void => {
        if (!checkEnabled()) {
            return;
        }
        setSplitting(!splitting);
    };

    const splitClip = (point: number): void => {
        if (!checkEnabled()) {
            return;
        }

        // @ts-ignore
        let recording = state.selectedRecording;
        if ((point / PIX_TO_TIME) > recording.start) {
            setSplitting(!splitting);
            point = _mapPointToTime(point, recording);
            // dispatch updateRecording to shorten original and then addRecording
            // @ts-ignore
            dispatch({type: 'addSplitRecording', payload: {recording, splitPoint: point}});
            // @ts-ignore
            dispatch({type: 'updateSplitRecording', payload: {recording, splitPoint: point}});
        }
    };

    useEffect(() => {
        // @ts-ignore
        let recording = state.selectedRecording;
        if (waveformRef.current) {
            let waveform = new p5(waveformSketch, waveformRef.current);
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
        }
        // @ts-ignore
    }, [state.selectedRecording, buffer]);

    return (
        <styles.Editor id="editor">
            <styles.ControlView>
                <styles.ClipMute onClick={mute} muted={muted}></styles.ClipMute>
                {/* @ts-ignore */}
                <styles.ClipSolo onClick={soloClip} solo={state.selectedRecording.solo}>S</styles.ClipSolo>
                <styles.Crop cropping={cropping} onClick={cropClip}></styles.Crop>
                <styles.Split splitting={splitting} onClick={onSplitClick}></styles.Split>
            </styles.ControlView>
            {/* @ts-ignore */}
            {state.recordingState
                ? <LiveWaveform></LiveWaveform>
                : <styles.EditorWaveform ref={waveformRef}>
                    <Crop key="cropElem" cropping={cropping} setPoints={setCropPoints}></Crop>
                    { /* @ts-ignore */ }
                    <Split key="splitElem" splitting={splitting} splitClip={splitClip}></Split>
                </styles.EditorWaveform>
            }
        </styles.Editor>
    )
}

export default Editor;