import { useState, useEffect, useRef, useContext, Dispatch } from 'react';
import * as Tone from 'tone';

import { RecordButton } from './Styles/recorderStyles';

import { StateContext, StateDispatchContext } from '../utils/StateContext';
import { State } from '../Reducer/ReducerTypes';
import { Action, ActionType } from '../Reducer/ActionTypes';
import { IncompleteRecording } from '../Transport/recording';
import { createPlayer } from '../utils/audio-utils';

interface RecorderProps {
    exporting: boolean;
}

function Recorder({exporting}: RecorderProps) {

    const state = useContext(StateContext) as unknown as State;
    const dispatch = useContext(StateDispatchContext) as unknown as Dispatch<Action>;

    const timeRef = useRef<Date>();
    const recordingRef = useRef(false);
    const exportingRef = useRef(false);
    const [recording, setRecording] = useState(false);

    const recorder = new Tone.Recorder();

    const openMic = async (mic: Tone.UserMedia) => {
        mic.connect(recorder);
        await mic.open();
    };

    const closeMic = (mic: Tone.UserMedia): void => {
        mic.disconnect(recorder);
        mic.close();
    };

    const addRecording = (recording: IncompleteRecording): void => {
		recording.player = createPlayer(recording.data);
        dispatch({type: ActionType.selectRecording, payload: recording});
        dispatch({type: ActionType.scheduleNewRecording, payload: recording});
	    dispatch({type: ActionType.updateTransportPosition, payload: recording.duration});
    };

    const toggleRecording = async (e: MouseEvent) => {
        e.stopPropagation();
        if (!state.mic) {
            return;
        }
        Tone.context.resume(); // https://github.com/Tonejs/Tone.js/issues/341
        if (recordingRef.current && timeRef.current) {
            closeMic(state.mic);
            let data: Blob = await recorder.stop();
            let blobUrl = URL.createObjectURL(data);
            let endTime = new Date();
            let duration = (endTime.getTime() - timeRef.current.getTime()) / 1000;
            let newRecording = {
                id: '',
                channel: '',
                position: Tone.Transport.seconds,
                duration: Tone.Transport.seconds + duration,
                start: Tone.Transport.seconds,
                data: blobUrl, 
                player: undefined,
                solo: false
            };
            addRecording(newRecording);
            recordingRef.current = false;
            setRecording(false);
            dispatch({type: ActionType.toggleRecordingState, payload: false});
        } else {
            await openMic(state.mic);
            recorder.start();
            timeRef.current = new Date();
            recordingRef.current = true;
            setRecording(true);
            dispatch({type: ActionType.toggleRecordingState, payload: true});
        }
    };

    useEffect(() => {
        exportingRef.current = exporting;        
    }, [exporting]);

    useEffect(() => {
        let recBtn = document.getElementById("rec_btn") as HTMLButtonElement;
        recBtn.disabled = !Tone.UserMedia.supported;
        recBtn.addEventListener("click", (e) => toggleRecording(e));
        return () => {
            recBtn.removeEventListener("click", (e) => toggleRecording(e));
        }
    }, [state.mic]);

    return (
        <RecordButton type="button" id="rec_btn" recording={recording}></RecordButton>
    );
}

export default Recorder;