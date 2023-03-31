import p5 from 'p5';

import { useState, useEffect, useRef, useContext, Dispatch } from 'react';
import * as styles from './Styles/editorStyles';
import * as Tone from 'tone';
import Crop from './Crop';
import Split from './Split';
import LiveWaveform from './LiveWaveform';

import { PIX_TO_TIME } from '../utils/constants';
import { map } from '../utils/audio-utils';

import { StateContext, StateDispatchContext } from '../utils/StateContext';
import { AppTheme } from '../View/Themes';
import { existsRecording } from '../Reducer/AppReducer';
import { Action, ActionType } from '../Reducer/ActionTypes';

import { State } from '../Reducer/ReducerTypes';
import { RecordingType } from '../Transport/recording';

interface EditorProps {
    solo: (s: boolean) => void;
}

function Editor({solo}: EditorProps) {
    const state = useContext(StateContext) as unknown as State;
    const dispatch = useContext(StateDispatchContext) as unknown as Dispatch<Action>;

    const waveformRef = useRef<HTMLDivElement>(null);
    const [buffer, setBuffer] = useState<Float32Array>(new Float32Array());
    const [muted, setMuted] = useState(false);
    const [cropping, setCropping] = useState(false);
    const [cropLeft, setCropLeft] = useState(0);
    const [cropRight, setCropRight] = useState(0);
    const [splitting, setSplitting] = useState(false);

    const waveformSketch = (sketch: p5) => {
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
            let r = state.selectedRecording;
            if (!existsRecording(r)) {
                return;
            }
            sketch.background('#2c3036');
            sketch.beginShape();
            sketch.stroke(AppTheme.AppTextOffColor);

            let toneTime = Tone.Transport.seconds;
            let trueEnd = r.position + r.player.buffer.duration; // uncropped duration is here
            let timeScaled = sketch.map(toneTime, r.start, r.duration, 0, width);

            let sampleStart = Math.round(sketch.map(r.start, r.position, trueEnd, 0, buffer.length));
            let sampleEnd = Math.round(sketch.map(r.duration, r.position, trueEnd, 0, buffer.length));
            
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

    // mutating recording state directly for Tone operations
    const mute = (): void => {
        let recording = state.selectedRecording;
        if (existsRecording(recording)) {
            if (muted) {
                recording.player.mute = false
            } else {
                recording.player.mute = true;
            }
            setMuted(!muted);
        }
    };

    const soloClip = (): void => {
        let r = state.selectedRecording;
        if (existsRecording(r)) {
            solo(r.solo);
        }
    };

    // crop does not modify audio data
    // start and end points are used to calculate offset and duration for Tone player
    const cropClip = () => {
        if (splitting) {
            setSplitting(false);
        }
        let r = state.selectedRecording;
        if (existsRecording(r)) {
            dispatch({type: ActionType.cropRecording, payload: {
                r: r, 
                left: cropLeft,
                right: cropRight,
            }});
            setCropping(!cropping);
        }
    };

    // get a point position in seconds
    const _mapPointToTime = (point: number, r: RecordingType): number => {
        let recordingLength = r.duration - r.start;
        let waveformWidth = waveformRef.current ? waveformRef.current.offsetWidth : 0;
        return map(point, 0, waveformWidth, 0, recordingLength);
    };

    const setCropPoints = (type: string, delta: number): void => {
        let r = state.selectedRecording;
        if (existsRecording(r)) {
            delta = _mapPointToTime(delta, r);
            if (type == 'start') {
                setCropLeft(delta);
    
            } else if (type == 'end') {
                setCropRight(delta);
            }
        }
    };

    const onSplitClick = (): void => {
        let r = state.selectedRecording;
        if (cropping) {
            setCropping(false);
        }
        if (existsRecording(r)) {
            setSplitting(!splitting);
        }
    };

    const splitClip = (point: number): void => {
        let r = state.selectedRecording;
        if (existsRecording(r)) {
            if ((point / PIX_TO_TIME) > r.start) {
                setSplitting(!splitting);
                point = _mapPointToTime(point, r);
                dispatch({type: ActionType.splitRecording, payload: {r: r, split: point}});
            }
        }
    };

    useEffect(() => {
        let r = state.selectedRecording;
        if (existsRecording(r)) {
            try {
                setBuffer(r.player.buffer.getChannelData(0));
            } catch (e) {
                console.log(e);
            }
            if (waveformRef.current) {
                let waveform = new p5(waveformSketch, waveformRef.current);
                return () => waveform.remove();
            }
        }
    }, [state.selectedRecording, buffer]);

    return (
        <styles.Editor id="editor">
            <styles.ControlView>
                <styles.ClipMute onClick={mute} muted={muted}></styles.ClipMute>
                <styles.ClipSolo 
                    onClick={soloClip} 
                    solo={existsRecording(state.selectedRecording) ? state.selectedRecording.solo : false}>
                S</styles.ClipSolo>
                <styles.Crop cropping={cropping} onClick={cropClip}></styles.Crop>
                <styles.Split splitting={splitting} onClick={onSplitClick}></styles.Split>
            </styles.ControlView>
            {state.recordingState
                ? <LiveWaveform></LiveWaveform>
                : <styles.EditorWaveform ref={waveformRef}>
                    <Crop key="cropElem" cropping={cropping} setPoints={setCropPoints}></Crop>
                    <Split key="splitElem" splitting={splitting} splitClip={splitClip}></Split>
                </styles.EditorWaveform>
            }
        </styles.Editor>
    )
}

export default Editor;