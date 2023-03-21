import { useRef, useEffect, useState, useReducer, RefObject, DragEvent } from 'react'

import * as styles from './Styles/AppStyles';

import * as Tone from 'tone';
import { FileDrop } from 'react-file-drop';

import { createPlayer } from '../utils/audio-utils';

import { RecordingReducer } from '../Reducer/AppReducer';
import { ActionType } from '../Reducer/AppReducer';

import Transport from '../Transport/transport';
import Recorder from '../Recorder/recorder';
import Editor from '../Editor/editor';
import TransportClock from '../Transport/transportClock';
import Settings from '../Settings/Settings';

import { StateContext, StateDispatchContext } from '../utils/StateContext';
import { MAX_DURATION, MAX_FILE_SIZE, PIX_TO_TIME } from '../utils/constants';
import { State } from '../Reducer/AppReducer';
import { IncompleteRecording } from '../Transport/recording';

const initialState: State = {
	recordingState: false,
	mic: undefined,
	channels: [],
	selectedRecording: {},
	selectedChannel: '', // id-based system, set to '' when no channels are selected
	endPosition: 0,
	soloChannel: undefined,
	time: 0,
	playing: false,
	transportLength: 3000
};

// app serves to put views together and act as a data processor + connector to the reducer
// maintains Control state
function App() {
  
	const [muted, setMuted] = useState(false);
	const [state, dispatch] = useReducer(RecordingReducer, initialState);
	
	const [dropping, setDropping] = useState(false);
	const [exporting, setExporting] = useState(false);

	const audioReader = new FileReader();

	const settingsWrapperRef = useRef<HTMLDivElement>(null);
	useOutsideSettings(settingsWrapperRef);

	function useOutsideSettings(ref: RefObject<HTMLDivElement>) {
		useEffect(() => {
			function handleClickOutside(event: MouseEvent) {
			  if (ref.current && !ref.current.contains(event.target as Node)) {
				  // clicked outside
				  setExporting(false);
			  }
			}
			document.addEventListener("mousedown", (e) => handleClickOutside(e));
			return () => document.removeEventListener("mousedown", (e) => handleClickOutside(e));
		}, [ref]);
	}

  	const receiveRecording = (recording: IncompleteRecording): void => {
		recording.player = createPlayer(recording.data);
        dispatch({type: ActionType.scheduleNewRecording, payload: recording});
        dispatch({type: ActionType.updateTransportPosition, payload: recording.duration});
        dispatch({type: ActionType.selectRecording, payload: recording});
    };

	const toggle = () => {
		if (Tone.Transport.state === "started") {
			Tone.Transport.pause();
			dispatch({type: ActionType.togglePlay, payload: {playing: false, time: Tone.Transport.seconds}});
		}
		else if (state.channels.length > 0) {
			Tone.context.resume();
			Tone.Transport.start();
			dispatch({type: ActionType.togglePlay, payload: {playing: true, time: Tone.Transport.seconds}});
		}
	};

	const onPlay = (): void => {
		if (exporting) {
		    return;
		}
		toggle();
	};

	const restart = (): void => {
		if (exporting) {
			return;
		}
		Tone.Transport.stop();
		dispatch({type: ActionType.togglePlay, payload: {playing: false, time: 0}});
		dispatch({type: ActionType.updateTransportPosition, payload: 0});
	};

	const mute = (): void => {
		if (exporting) {
			return;
		}
		let mute = Tone.getContext().destination.mute;
		mute = !mute;
		setMuted(!muted);
	};

	// takes current solo state (boolean)
	// soloes or un soloes
	const solo = (soloState: boolean): void => { 
		if (soloState) {
			dispatch({type: ActionType.unsoloClip,  payload: state.selectedRecording});
		} else {
			dispatch({type: ActionType.soloClip,  payload: state.selectedRecording});
		}
	};
  
  	const setExportingState = (): void => {
		setExporting(!exporting);
  	};

	const _validateFile = (file: File): boolean => {
		return (file.type == "audio/mpeg" || file.type !== "audio/wav") && file.size < MAX_FILE_SIZE;
	};

	const _validateFileLength = (buffer: AudioBuffer): boolean => {
		return buffer.duration * PIX_TO_TIME <= MAX_DURATION;
	};

	const upload = (files: FileList | null, e: DragEvent): void => {
		e.preventDefault();
		setDropping(false);
		if (files && _validateFile(files[0])) {
			audioReader.readAsArrayBuffer(files[0]);
			audioReader.onload = async () => {
				let buffer = audioReader.result;
                if (!buffer || typeof(buffer) == 'string') {
                    return;
                }
				try {
					let decodedBuffer = await Tone.getContext().rawContext.decodeAudioData(buffer);
					if (!_validateFileLength(decodedBuffer)) {
						return;
					} else {
						let pixelDuration = decodedBuffer.duration * PIX_TO_TIME;
						if (pixelDuration > state.transportLength) {
							dispatch({type: ActionType.updateTransportLength, payload: (decodedBuffer.duration * PIX_TO_TIME)})
						}
						let newRecording = newRecordingFromBuffer(decodedBuffer);
                        receiveRecording(newRecording);
					}
				} catch(e) {
					// Bad format?
					console.log(e);
				}
			}
			audioReader.onerror = () => {
				console.log(audioReader.error);
			}
		}
	}
    
	const newRecordingFromBuffer = (buffer: AudioBuffer): IncompleteRecording => {
		let recordingTime = Tone.Transport.seconds;
		return {
            id: '',
            channel: '',
			position: recordingTime,
			start: recordingTime,
			duration: recordingTime + buffer.duration, 
			data: buffer,
			player: undefined,
            solo: false,
		};
	};

	useEffect(() => {
		const mic = new Tone.UserMedia();
		dispatch({type: ActionType.initializeChannels, payload: {}});
		dispatch({type: ActionType.setMic, payload: mic});
	}, []);

	return (
        /* @ts-ignore */
		<StateContext.Provider value={state}>
        { /* @ts-ignore */}
		<StateDispatchContext.Provider value={dispatch}>
			<styles.View id="Tone">
                <styles.TopView>
                    <styles.Title>MIXIN</styles.Title>
                    <styles.Settings ref={settingsWrapperRef}>
                        <styles.SettingsIcon onClick={setExportingState}></styles.SettingsIcon>
                        <Settings displayState={exporting} channels={state.channels}></Settings>
                    </styles.Settings>
                </styles.TopView>
                <Editor solo={solo} exporting={exporting}></Editor>
                <styles.MiddleView dropping={dropping}>
                    <FileDrop 
                        onDrop={(files, event) => upload(files, event)}
                        onFrameDragEnter={(event) => setDropping(true)}
                        onFrameDragLeave={(event) => setDropping(false)}>
                        <Transport exporting={exporting}></Transport>
                    </FileDrop>
                </styles.MiddleView>
                <styles.ControlView>
                    <Recorder exporting={exporting}></Recorder>
                    <styles.PlayButton id="play_btn" onClick={onPlay} playState={state.playing}></styles.PlayButton>
                    <styles.RestartButton onClick={restart}></styles.RestartButton>
                    <styles.MuteButton onClick={mute} mute={muted}></styles.MuteButton>
                    <styles.ClockArea>
                        <TransportClock></TransportClock>
                    </styles.ClockArea>
                </styles.ControlView>
			</styles.View>
		</StateDispatchContext.Provider>
		</StateContext.Provider> 
	)
}

export default App;
