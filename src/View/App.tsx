import { useRef, useEffect, useState, useReducer } from 'react'

// @ts-ignore
import * as styles from './Styles/AppStyles';

import * as Tone from 'tone';
import { FileDrop } from 'react-file-drop';

// @ts-ignore
import { createPlayer } from '../utils/audio-utils';

// @ts-ignore
import { RecordingReducer } from '../Reducer/AppReducer';

// @ts-ignore
import Transport from '../Transport/transport';
// @ts-ignore
import Recorder from '../Recorder/Recorder';
// @ts-ignore
import Editor from '../Editor/Editor';
// @ts-ignore
import TransportClock from '../Transport/TransportClock';
// @ts-ignore
import Settings from '../Settings/Settings';

// @ts-ignore
import { StateContext, StateDispatchContext } from '../utils/StateContext';
// @ts-ignore
import { MAX_DURATION, MAX_FILE_SIZE, PIX_TO_TIME } from '../utils/constants';

/* 

core functionality (use Router):

 - open the mic
 - start/stop recording ( + UI )
 - play recording (be able to switch analyser between mic and player)
 - turn analyser on and off
 - detailed waveform view

*/



/* -----------------------------------------------------------------------

how to fix this: 

2 options: 

  1. on play, look first at playhead position and update all players' start with an offset

  2. everytime playhead is moved, look at playhead position and update all players' start with an offset

  The only advantage of two is if this offset ever needs to be used outside of pressing play
  It seems we only need to use the exact position of things for playing, and for section exports, as the UI is always synced
  So 1! We can just calculate it at play time. Shouldn't be expensive, relatively

*/

const initialState = {
	recordingState: false,
	mic: null,
	channels: [],
	selectedRecording: {},
	selectedChannel: 0, // id-based system, set to 0 when no channels are selected
	endPosition: 0,
	soloChannel: null,
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

	const drawing = useRef();

	const audioReader = new FileReader();

	const settingsWrapperRef = useRef(null);
	useOutsideSettings(settingsWrapperRef);

    // @ts-ignore
	function useOutsideSettings(ref) {
		useEffect(() => {
            // @ts-ignore
			function handleClickOutside(event) {
			  if (ref.current && !ref.current.contains(event.target)) {
				  // clicked outside
				  setExporting(false);
			  }
			}
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}, [ref]);
	}

  // logic for this with reducer is a little tricky
  // any state operations that need to read state -> place in reducer
  // we have to place the onload callback here so that we don't have to dispatch another action from inside the reducer


  // receive from Recorder -> add to store and send to Transport
  // @ts-ignore
  	const receiveRecording = (recording) => {
		recording.player = createPlayer(recording.data);
	
		// recording.data is blobUrl
		if (typeof(recording.data) == "string") {
            // @ts-ignore
	  		recording.player.buffer.onload = (buffer) => {
			recording.data = buffer;
			recording.duration = recording.start + buffer.duration;
            // @ts-ignore
			dispatch({type: 'updateBuffer', payload: recording});
			Tone.Transport.seconds = recording.duration;
            // @ts-ignore
			dispatch({type: 'updateTransportPosition', payload: recording.duration});
            // @ts-ignore
			dispatch({type: 'selectRecording', payload: recording});
		};
        // @ts-ignore
		dispatch({type: 'scheduleNewRecording', payload: recording});
	} 
	// recording.data is the buffer itself
		else {
            // @ts-ignore
			dispatch({type: 'scheduleNewRecording', payload: recording});
		}
  };

	const toggle = () => {
		if (Tone.Transport.state === "started") {
			Tone.Transport.pause();
            // @ts-ignore
			dispatch({type: 'togglePlay', payload: {playing: false, time: Tone.Transport.seconds}});
		}
        // @ts-ignore
		else if (state.channels.length > 0) {
			Tone.context.resume();
			Tone.Transport.start();
            // @ts-ignore
			dispatch({type: 'togglePlay', payload: {playing: true, time: Tone.Transport.seconds}});
		}
	};

	const onPlay = () => {
		if (exporting) {
		return;
		}
		toggle();
	};

	const restart = () => {
		if (exporting) {
			return;
		}
		Tone.Transport.stop();
        // @ts-ignore
		dispatch({type: 'togglePlay', payload: {playing: false, time: 0}});
        // @ts-ignore
		dispatch({type: 'updateTransportPosition', payload: 0});
	};

	const mute = () => {
		if (exporting) {
			return;
		}
		let mute = Tone.getContext().destination.mute;
		mute = !mute;
		setMuted(!muted);
	};

	// takes current solo state (boolean)
	// soloes or un soloes
    // @ts-ignore
	const solo = (soloState) => { 
		if (soloState) {
            // @ts-ignore
			dispatch({type: 'unsoloClip',  payload: state.selectedRecording});
		} else {
            // @ts-ignore
			dispatch({type: 'soloClip',  payload: state.selectedRecording});
		}
	};
  
  	const setExportingState = () => {
		setExporting(!exporting);
  	};

    // @ts-ignore
	const _validateFile = (file) => {
		return (file.type == "audio/mpeg" || file.type !== "audio/wav") && file.size < MAX_FILE_SIZE;
	};

    // @ts-ignore
	const _validateFileLength = (buffer) => {
		return buffer.duration * PIX_TO_TIME <= MAX_DURATION;
	};

    // @ts-ignore
	const upload = (files, e) => {
		e.preventDefault();
		setDropping(false);
		if (files && _validateFile(files[0])) {
			audioReader.readAsArrayBuffer(files[0]);
			audioReader.onload = async () => {
				let buffer = audioReader.result;
				try {
                    // @ts-ignore
					let decodedBuffer = await Tone.getContext().rawContext.decodeAudioData(buffer);
					if (!_validateFileLength(decodedBuffer)) {
						return;
					} else {
						let pixelDuration = decodedBuffer.duration * PIX_TO_TIME;
                        // @ts-ignore
						if (pixelDuration > state.transportLength) {
                            // @ts-ignore
							dispatch({type: 'updateTransportLength', payload: (decodedBuffer.duration * PIX_TO_TIME)})
						}
						newRecordingFromBuffer(decodedBuffer);
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
    
    // @ts-ignore
	const newRecordingFromBuffer = (buffer) => {
		let recordingTime = Tone.Transport.seconds;
		let newRecording = {
			position: recordingTime,
			start: recordingTime,
			duration: recordingTime + buffer.duration, 
			data: buffer,
			player: null,
			channel: null,
			loaded: true
		};
		receiveRecording(newRecording);
	};

	useEffect(() => {
		const mic = new Tone.UserMedia();
        // @ts-ignore
		dispatch({type: 'initializeChannels', payload: {}});
        // @ts-ignore
		dispatch({type: 'setMic', payload: mic});
	}, []);

	return (
        /* @ts-ignore */
		<StateContext.Provider value={state}>
        { /* @ts-ignore */}
		<StateDispatchContext.Provider value={dispatch}>
			<styles.View id="Tone" ref={drawing.current}>
                <styles.TopView>
                    <styles.Title>MIXIN</styles.Title>
                    <styles.Settings ref={settingsWrapperRef}>
                        <styles.SettingsIcon onClick={setExportingState}></styles.SettingsIcon>
                        { /* @ts-ignore */}
                        <Settings displayState={exporting} channels={state.channels}></Settings>
                    </styles.Settings>
                </styles.TopView>
                <Editor solo={solo} exporting={exporting}></Editor>
                { /* @ts-ignore */}
                <styles.MiddleView dropping={dropping}>
                    <FileDrop 
                        onDrop={(files, event) => upload(files, event)}
                        onFrameDragEnter={(event) => setDropping(true)}
                        onFrameDragLeave={(event) => setDropping(false)}>
                        <Transport exporting={exporting}></Transport>
                    </FileDrop>
                </styles.MiddleView>
                <styles.ControlView>
                    <Recorder receiveRecording={receiveRecording} exporting={exporting}></Recorder>
                    { /* @ts-ignore */}
                    <styles.PlayButton id="play_btn" onClick={onPlay} playState={state.playing}></styles.PlayButton>
                    <styles.RestartButton onClick={restart}></styles.RestartButton>
                    { /* @ts-ignore */}
                    <styles.MuteButton onClick={mute} mute={muted}></styles.MuteButton>
                    <styles.ClockArea>
                        { /* @ts-ignore */}
                        <TransportClock></TransportClock>
                    </styles.ClockArea>
                </styles.ControlView>
			</styles.View>
		</StateDispatchContext.Provider>
		</StateContext.Provider> 
	)
}

export default App;
