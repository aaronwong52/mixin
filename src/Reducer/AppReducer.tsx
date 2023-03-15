import { PIX_TO_TIME } from '../utils/constants';
import { createPlayer } from '../utils/audio-utils';
import * as Tone from 'tone';
import { v4 as uuidv4 } from 'uuid';
import { Channel } from '../Transport/channel';
import { EmptyRecording, IncompleteRecording, Recording } from '../Transport/recording';

export interface State {
    recordingState: boolean;
    mic?: Tone.UserMedia | null;
    channels: Channel[];
    selectedRecording: Recording | EmptyRecording;
    selectedChannel: string;
    endPosition: number;
    soloChannel?: Tone.Channel;
    time: number;
    playing: boolean;
    transportLength: number;
}

export type Action = {
    type: ActionType;
    payload: any;
}

export enum ActionType {
    setMic,
    togglePlay,
    toggleRecordingState,
    initializeChannels,
    selectChannel,
    deselectAllChannels,
    addChannel,
    editChannelName,
    deleteSelectedChannel,
    selectRecording,
    deselectRecordings,
    scheduleNewRecording,
    switchRecordingChannel,
    deleteSelectedRecording,
    updateBuffer,
    updateRecordingPosition,
    updateTransportLength,
    updateTransportPosition,
    cropRecording,
    addSplitRecording,
    updateSplitRecording,
    soloClip,
    unsoloClip
}

export const RecordingReducer = (state: State, action: Action): State => {
	switch (action.type) {
        case ActionType.setMic:
            return setMic(state, action.payload);
        case ActionType.togglePlay:
            return togglePlay(state, action.payload);
        case ActionType.toggleRecordingState:
            return toggleRecordingState(state, action.payload);
        case ActionType.initializeChannels:
            return initializeChannels(state, action.payload);
        case ActionType.selectChannel:
            return selectChannel(state, action.payload);
        case ActionType.deselectAllChannels:
            return deselectAllChannels(state, action.payload);
        case ActionType.addChannel:
            return addChannel(state, action.payload);
        case ActionType.editChannelName:
            return editChannelName(state, action.payload);
        case ActionType.deleteSelectedChannel:
            return _deleteChannel(state, action.payload);
        case ActionType.selectRecording:
            return selectRecording(state, action.payload);
        case ActionType.deselectRecordings:
            return deselectRecordings(state, action.payload);
        case ActionType.scheduleNewRecording:
            return scheduleNewRecording(state, action.payload);
        case ActionType.switchRecordingChannel:
            return switchRecordingChannel(state, action.payload);
        case ActionType.deleteSelectedRecording:
            return _deleteRecording(state, action.payload);
        case ActionType.updateBuffer:
            return updateBuffer(state, action.payload);
        case ActionType.updateRecordingPosition:
            return updateRecordingPosition(state, action.payload);
        case ActionType.updateTransportLength:
            return updateTransportLength(state, action.payload);
        case ActionType.updateTransportPosition:
            return updateTransportPosition(state, action.payload);
        case ActionType.cropRecording:
            return cropRecording(state, action.payload);
        case ActionType.addSplitRecording:
            return addSplitRecording(state, action.payload);
        case ActionType.updateSplitRecording:
            return updateSplitRecording(state, action.payload);
        case ActionType.soloClip:
            return soloClip(state, action.payload);
        case ActionType.unsoloClip:
            return unsoloClip(state, action.payload);
        default: 
            return state;
	}
};

const getNewChannel = (index: number): Channel => {
    return {
        channel: new Tone.Channel().toDestination(),
        name: 'Audio ' + (index + 1).toString(),
        recordings: [],
        id: uuidv4(),
        index: index,
	}
};

const setMic = (state: State, mic: Tone.UserMedia): State => {
    return {...state, mic: mic}
};

const togglePlay = (state: State, payload: State): State => {
    return {
        ...state,
        playing: payload.playing,
        time: payload.time
    }
};

const toggleRecordingState = (state: State, recordingState: boolean): State => {
    return {...state, recordingState: recordingState}
};

const initializeChannels = (state: State, payload: any): State => {
    let firstChannel = getNewChannel(0);
    return {
        ...state,
        channels: [firstChannel],
        soloChannel: new Tone.Channel().toDestination(),
        selectedChannel: firstChannel.id
    }
};

const addChannel = (state: State, payload: any): State => {
    let newLength = state.channels.length;

    let newChannel = getNewChannel(newLength);
    return {
        ...state,
        channels: [
            ...state.channels.slice(0, newLength),
            newChannel
        ],
        selectedChannel: newChannel.id
    }
};

const editChannelName = (state: State, payload: Channel): State => {
    let channels = state.channels;
    let channelIndex = _findChannelIndex(channels, payload.id);
    return {
        ...state,
        channels: [
        ...channels.slice(0, channelIndex),
        {...channels[channelIndex], name: payload.name},
        ...channels.slice(channelIndex + 1, channels.length)
        ]
    }
};

export const existsRecording = (r: Recording | EmptyRecording): r is Recording => {
    return ("id" in r && "player" in r);
};

const _deleteChannel = (state: State, channelId: string): State => {
    let sr = state.selectedRecording;
    if (existsRecording(sr) && sr.channel == channelId) {
        sr = {};
    }
    return {
        ...state,
        channels: [
            ...state.channels.filter((channel) => {
                if (channel.id == channelId) {
                    channel.recordings.forEach((recording) => {
                        if (recording.player) {
                            recording.player.dispose();
                        }
                    });
                }
                return channel.id != channelId;
            })
        ],
        // reset selected recording if it's on this channel
        selectedRecording: sr,
        selectedChannel: channelId == state.selectedChannel
            ? ''
            : state.selectedChannel
    }
};

const selectChannel = (state: State, channelId: string): State => {
    return {...state, selectedChannel: channelId};
};

const deselectAllChannels = (state: State, payload: any): State => {
    return {...state, selectedChannel: ''};
};

const selectRecording = (state: State, recording: Recording): State => {
    return {...state, selectedRecording: recording};
};

  // currently only one recording is selected at a time
  // deselection by deselecting all
const deselectRecordings = (state: State, payload: any): State => {
    return {...state, selectedRecording: {}};
};

const _scheduleRecording = (state: State, recording: Recording): void => {
    let channelIndex = _findChannelIndex(state.channels, recording.channel);
    schedulePlayer(recording);
    if (recording.player) {
        recording.player.connect(state.channels[channelIndex].channel);
    }
}

// sets recording.channel
const scheduleNewRecording = (state: State, recording: Recording): State => {
    recording.id = uuidv4();
    recording.channel = state.selectedChannel;
    _scheduleRecording(state, recording);
    return addRecording(state, recording);
};

  // moves a recording to a new channel
  // payload.recording, payload.newChannelIndex
const switchRecordingChannel = (state: State, payload: any): State => {
    let channels = state.channels;
	let currChannelIndex: number = payload.channelIndex;
	let newChannelIndex: number = payload.newChannelIndex;

	let lowerIndex = (currChannelIndex > newChannelIndex) ? newChannelIndex : currChannelIndex;
	let higherIndex = (currChannelIndex > newChannelIndex) ? currChannelIndex : newChannelIndex;

	let filteredChannel = {...channels[currChannelIndex],
	    recordings: [
		    ...channels[currChannelIndex].recordings.filter((recording) => {
		        return `recording.id` != payload.recording.id
		    })
	    ]
	};

	let growingChannel = {...channels[newChannelIndex],
	    recordings: [...channels[newChannelIndex].recordings, payload.recording]
	};

	// mark the lower index channel as filtered or growing channel
	let indices = {
	    first: lowerIndex == newChannelIndex ? growingChannel : filteredChannel,
	    second: higherIndex == currChannelIndex ? filteredChannel : growingChannel
	};

	return {
	    ...state, channels: [
		    ...channels.slice(0, lowerIndex),
		    indices.first,
		    ...channels.slice(lowerIndex + 1, higherIndex),
		    indices.second,
		    ...channels.slice(higherIndex + 1, channels.length)
	    ]
	}
};

const _findRecordingIndex = (recordings: Recording[], recordingId: string): number => {
	return recordings.findIndex((recording) => recording.id == recordingId);
};

export const _findChannelIndex = (channels: Channel[], channelId: string): number => {
    let index = channels.findIndex((c) => c.id == channelId);
    return (index > 0) ? index : 0;
};

const _deleteRecording = (state: State, selectedRecording: Recording): State => {
	let channels = state.channels;
	let channelIndex = _findChannelIndex(channels, selectedRecording.channel);
	if (channelIndex < 0) {
	    return state;
	} else return {
        ...state,
        channels: [
            ...channels.slice(0, channelIndex),
            {...channels[channelIndex],
                recordings: [
                    ...channels[channelIndex].recordings.filter((recording) => {
                        if (recording.id == selectedRecording.id && recording.player) {
                            recording.player.dispose();
                        }
                        return recording.id != selectedRecording.id;
                    })
                ]
            },
            ...channels.slice(channelIndex + 1, channels.length)
        ],
        selectedRecording: {}
    }
};

type RecordingActionType = 'add' | 'update';
type RecordingAction = {
    type: RecordingActionType;
}

  // all logic for adding / updating recordings
const _setRecording = (state: State, recording: Recording, action: RecordingAction) => {
	let channels = state.channels;
	let channelIndex = _findChannelIndex(channels, recording.channel);
	let recordingIndex = _findRecordingIndex(channels[channelIndex].recordings, recording.id);
	let numRecordings = channels[channelIndex].recordings.length;
	switch (action.type) {
	  // append new recording to end
	    case 'add':
            return {
                ...state, 
		        channels: [
			        ...channels.slice(0, channelIndex),
			        {...channels[channelIndex], 
			            recordings: [...channels[channelIndex].recordings.slice(0, numRecordings), {...recording}]
			        },
			        ...channels.slice(channelIndex + 1, channels.length)
		        ],
		};

		// update (replace) recording at recordingIndex
		case 'update': 
            let newEndPosition = recording.start + recording.duration > state.endPosition
                ? recording.start + recording.duration
                : state.endPosition;
		    return {
		        ...state,
		        channels: [
			        ...channels.slice(0, channelIndex),
			        {...channels[channelIndex], 
			        recordings: [
				        ...channels[channelIndex].recordings.slice(0, recordingIndex),
				        {...recording},
				        ...channels[channelIndex].recordings.slice(recordingIndex + 1, numRecordings)
			        ]},
			        ...channels.slice(channelIndex + 1, channels.length)
		        ],
                endPosition: newEndPosition
		};
	}
};
  
const addRecording = (state: State, recording: Recording): State => {
    recording.start = recording.position;
    recording.channel = state.selectedChannel;
    return _setRecording(state, recording, {type: 'add'});
};
  
const updateBuffer = (state: State, recording: Recording): State => {
    schedulePlayer(recording);
    return updateRecording(state, recording);
};
  
  // error handling in the case where delta exceeds transport limits
  // calculate when delta causes r.start to be 0, and hard limit it at that point
const updateRecordingPosition = (state: State, payload: any) => {
	let newPosition = payload.newPosition / PIX_TO_TIME;
	let delta = newPosition - payload.recording.start;
	if (payload.recording.start + newPosition < 0) {
	  newPosition = Math.abs(payload.recording.start) * -1; // so r.start + delta = 0
	}
	payload.recording.position += delta;
	payload.recording.start = newPosition;
	payload.recording.duration += delta;

	schedulePlayer(payload.recording);

	return updateRecording(state, payload.recording);
};

const updateTransportLength = (state: State, length: number): State => {
    return {...state, transportLength: length};
}

const updateTransportPosition = (state: State, time: number): State => {
    updatePlayerPositions(state, time);
    return {...state, time: time};
};

const cropRecording = (state: State, payload: any): State => {
    let recording = payload.recording;

    recording.start += payload.leftDelta;
    recording.duration -= payload.rightDelta;

    schedulePlayer(recording);
    return _setRecording(state, recording, {type: 'update'});
};

  /* 
	1. create new recording
	2. set 1st recording duration to split point
	3. set 2nd recording start to split point
	3. set 2nd recording position to (split point - crop offset)
	4. set 2nd recording duration to 1st recording previous duration
	4. split buffer at split point
	5. update recording players with the buffer halves
  */
const addSplitRecording = (state: State, payload: any): State => {
	let splitPoint = payload.splitPoint;
	let originalRecording = payload.recording;
	let originalBuffer = originalRecording.player.buffer;

	let secondBuffer = originalBuffer.slice(splitPoint, originalRecording.duration);

	let cropOffset = originalRecording.start - originalRecording.position;
  
	let newRecording = {
        id: uuidv4(),
        channel: originalRecording.channel, // id of channel
        position: splitPoint - cropOffset,
        duration: originalRecording.duration,
        start: splitPoint,
        data: '', // data is effectively a temp block before loading into player
        player: createPlayer(secondBuffer),
        solo: false,
        loaded: true,
	};
	_scheduleRecording(state, newRecording);
	return _setRecording(state, newRecording, {type: 'add'});
};

const updateSplitRecording = (state: State, payload: any): State => {
    let originalRecording = payload.recording;
    let originalBuffer = originalRecording.player.buffer;
    let firstBuffer = originalBuffer.slice(0, payload.splitPoint);

    originalBuffer.dispose();
    originalRecording.player.buffer = firstBuffer;
    originalRecording.duration = payload.splitPoint;
    return updateRecording(state, originalRecording);
};
  
const updateRecording = (state: State, recording: Recording): State => {
	return _setRecording(state, recording, {type: 'update'});
};
  
  // internal method to shift start point of a recording
const _schedulePlayer = (recording: Recording, offset: number): void => {
    if (recording.player) {
        recording.player.unsync();
        // catch all calculation of start position
        // represents start of recording, including potential crop, adjusted for playhead position
        let startOffset = recording.start - recording.position + offset;
    
        // offset is passed again here because the recording starts and then seeks to the same offset position
        recording.player.sync().start(recording.position + startOffset, startOffset);
        recording.player.stop(recording.duration);
    }
};

const schedulePlayer = (recording: Recording): void => {
	  let offset = calculatePlayOffset(Tone.Transport.seconds, recording);
	  _schedulePlayer(recording, offset);
};

const updatePlayerPositions = (state: State, time: number): void => {
	state.channels.forEach((channel) => {     
	    channel.recordings.forEach((recording) => {
		    let offset = calculatePlayOffset(time, recording);
		    _schedulePlayer(recording, offset);
	    })
	});
};
  
  // return offset of playhead in relation to a recording clip
  // returns 0 if before or after clip
export const calculatePlayOffset = (playPosition: number, recording: Recording): number => {
	if (playPosition < recording.start || playPosition >= recording.duration) {
	    return 0;
	}
	return playPosition - recording.start;
};
  
  // solo: route player to solo channel and solo it
  const soloClip = (state: State, recording: Recording): State => {
    if (recording.player && state.soloChannel) {
        recording.player.connect(state.soloChannel);
        state.soloChannel.solo = true;
        recording.solo = true;
        return updateRecording(state, recording);
    }
    return state;
};
  
  // does player.disconnect() cancel start()?
const unsoloClip = (state: State, recording: Recording): State => {
    if (recording.player  && state.soloChannel) {
        recording.player.disconnect(); // disconnect() -> disconnect all inputs
        let channelIndex = _findChannelIndex(state.channels, recording.channel)
        recording.player.connect(state.channels[channelIndex].channel); // reconnect to original channel
        state.soloChannel.solo = false;
        recording.solo = false;
        return updateRecording(state, recording);
    }
    return state;	
};