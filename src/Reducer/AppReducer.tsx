import { PIX_TO_TIME } from '../utils/constants';
import { createPlayer } from '../utils/audio-utils';
import * as Tone from 'tone';
import { v4 as uuidv4 } from 'uuid';
import { Channel } from '../Transport/channel';
import { EmptyRecording, IncompleteRecording, RecordingType} from '../Transport/recording';
import { State } from './ReducerTypes';
import { Action, ActionType as t} from './ActionTypes'

export const RecordingReducer = (state: State, action: Action): State => {
	switch (action.type) {
        case t.setMic:
            return {...state, mic: action.payload};
        case t.togglePlay:
            return {...state, playing: action.payload.playing, time: action.payload.time};
        case t.toggleRecordingState:
            return {...state, recordingState: action.payload};

        case t.initializeChannels:
            return initializeChannels(state);
        case t.addChannel:
            return addChannel(state);
        case t.editChannelName:
            return editChannelName(state, action.payload);
        case t.selectChannel:
            return {...state, selectedChannel: action.payload};
        case t.deselectAllChannels:
            return {...state, selectedChannel: ''};
        case t.deleteSelectedChannel:
            return deleteChannel(state, state.selectedChannel);

        case t.selectRecording:
            return {...state, selectedRecording: action.payload};
        case t.deselectRecordings:
            return {...state, selectedRecording: getEmptyRecording()};

        case t.scheduleNewRecording:
            return scheduleNewRecording(state, action.payload);
        case t.deleteSelectedRecording:
            return deleteRecording(state, action.payload);
        case t.updateRecordingPosition:
            return updateRecordingPosition(state, action.payload);
        case t.switchRecordingChannel:
            return switchRecordingChannel(state, action.payload);

        case t.cropRecording:
            return cropRecording(state, action.payload);
        case t.addSplitRecording:
            return addSplitRecording(state, action.payload);
        case t.updateSplitRecording:
            return updateSplitRecording(state, action.payload);

        case t.soloRecording:
            return soloRecording(state, action.payload);
        case t.unsoloRecording:
            return unsoloRecording(state, action.payload);

        case t.updateTransportLength:
            return {...state, transportLength: action.payload};
        case t.updateTransportPosition:
            return updateTransportPosition(state, action.payload);
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

const initializeChannels = (state: State): State => {
    let firstChannel = getNewChannel(0);
    return {
        ...state,
        channels: [firstChannel],
        soloChannel: new Tone.Channel().toDestination(),
        selectedChannel: firstChannel.id
    }
};

const addChannel = (state: State): State => {
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

const editChannelName = (state: State, payload: {id: string; name: string;}): State => {
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

export const existsRecording = (r: RecordingType | EmptyRecording): r is RecordingType => {
    return ("id" in r && "player" in r);
};

export const getEmptyRecording = (): EmptyRecording => {
    return { id: '' }
}

const deleteChannel = (state: State, channelId: string): State => {
    let sr = state.selectedRecording;
    if (existsRecording(sr) && sr.channel == channelId) {
        sr = getEmptyRecording();
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

const _scheduleRecording = (state: State, r: RecordingType): void => {
    let channelIndex = _findChannelIndex(state.channels, r.channel);
    schedulePlayer(r);
    r.player.connect(state.channels[channelIndex].channel);
}

const scheduleNewRecording = (state: State, r: IncompleteRecording): State => {
    r.id = uuidv4();
    r.channel = state.selectedChannel;
    
    _scheduleRecording(state, r as RecordingType);
    return _setRecording(state, r as RecordingType, {type: 'add'});
};

const switchRecordingChannel = (state: State, payload: { r: RecordingType; index: number; newIndex: number; }): State => {
    let channels = state.channels;
	let currIndex: number = payload.index;
	let newIndex: number = payload.newIndex;

	let lowerIndex = (currIndex > newIndex) ? newIndex : currIndex;
	let higherIndex = (currIndex > newIndex) ? currIndex : newIndex;

	let filteredChannel = {...channels[currIndex],
	    recordings: [
		    ...channels[currIndex].recordings.filter((r) => {
		        return r.id != payload.r.id
		    })
	    ]
	};

	let growingChannel = {...channels[newIndex],
	    recordings: [...channels[newIndex].recordings, payload.r]
	};

	// mark the lower index channel as filtered or growing channel
	let indices = {
	    first: lowerIndex == newIndex ? growingChannel : filteredChannel,
	    second: higherIndex == currIndex ? filteredChannel : growingChannel
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

const _findRecordingIndex = (recordings: RecordingType[], recordingId: string): number => {
	return recordings.findIndex((recording) => recording.id == recordingId);
};

export const _findChannelIndex = (channels: Channel[], channelId: string): number => {
    let index = channels.findIndex((c) => c.id == channelId);
    return (index > 0) ? index : 0;
};

const deleteRecording = (state: State, r: RecordingType): State => {
	let channels = state.channels;
	let channelIndex = _findChannelIndex(channels, r.channel);
	if (channelIndex < 0) {
	    return state;
	} else {
        return {
            ...state,
            channels: [
                ...channels.slice(0, channelIndex),
                {...channels[channelIndex],
                    recordings: [
                        ...channels[channelIndex].recordings.filter((recording) => {
                            if (recording.id == r.id && recording.player) {
                                recording.player.dispose();
                            }
                            return recording.id != r.id;
                        })
                    ]
                },
                ...channels.slice(channelIndex + 1, channels.length)
            ],
            selectedRecording: getEmptyRecording()
        }
    }
};

type RecordingAction = { type: 'add' | 'update' }

  // all logic for adding / updating recordings
const _setRecording = (state: State, r: RecordingType, action: RecordingAction) => {
	let channels = state.channels;
	let channelIndex = _findChannelIndex(channels, r.channel);
	let recordingIndex = _findRecordingIndex(channels[channelIndex].recordings, r.id);
	let numRecordings = channels[channelIndex].recordings.length;
	switch (action.type) {
	  // append new recording to end
	    case 'add':
            return {
                ...state, 
		        channels: [
			        ...channels.slice(0, channelIndex),
			        {...channels[channelIndex], 
			            recordings: [...channels[channelIndex].recordings.slice(0, numRecordings), {...r}]
			        },
			        ...channels.slice(channelIndex + 1, channels.length)
		        ],
		};

		// update (replace) recording at recordingIndex
		case 'update': 
            let end = r.start + r.duration > state.endPosition
                ? r.start + r.duration
                : state.endPosition;
		    return {
		        ...state,
		        channels: [
			        ...channels.slice(0, channelIndex),
			        {...channels[channelIndex], 
			        recordings: [
				        ...channels[channelIndex].recordings.slice(0, recordingIndex),
				        {...r},
				        ...channels[channelIndex].recordings.slice(recordingIndex + 1, numRecordings)
			        ]},
			        ...channels.slice(channelIndex + 1, channels.length)
		        ],
                endPosition: end
		};
	}
};
  
  // error handling in the case where delta exceeds transport limits
  // calculate when delta causes r.start to be 0, and hard limit it at that point
const updateRecordingPosition = (state: State, payload: { r: RecordingType, pos: number; }) => {
	let pos = payload.pos / PIX_TO_TIME;
	let delta = pos - payload.r.start;
	if (payload.r.start + pos < 0) {
	  pos = Math.abs(payload.r.start) * -1; // so r.start + delta = 0
	}
	payload.r.position += delta;
	payload.r.start = pos;
	payload.r.duration += delta;

	schedulePlayer(payload.r);

    return _setRecording(state, payload.r, {type: 'update'});
};

const _updatePlayerPositions = (state: State, time: number): void => {
	state.channels.forEach((channel) => {     
	    channel.recordings.forEach((recording) => {
		    let offset = _calculatePlayOffset(time, recording);
		    _schedulePlayer(recording, offset);
	    })
	});
};
  
const updateTransportPosition = (state: State, time: number): State => {
    _updatePlayerPositions(state, time);
    return {...state, time: time};
};

const cropRecording = (state: State, payload: {r: RecordingType; left: number; right: number;}): State => {
    let recording = payload.r;

    recording.start += payload.left;
    recording.duration -= payload.right;

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
const addSplitRecording = (state: State, payload: {r: RecordingType, split: number;}): State => {
	let splitPoint = payload.split;
	let originalRecording = payload.r;
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
	};
	_scheduleRecording(state, newRecording);
	return _setRecording(state, newRecording, {type: 'add'});
};

const updateSplitRecording = (state: State, payload: {r: RecordingType, split: number;}): State => {
    let originalRecording = payload.r;
    let originalBuffer = originalRecording.player.buffer;
    let firstBuffer = originalBuffer.slice(0, payload.split);

    originalBuffer.dispose();
    originalRecording.player.buffer = firstBuffer;
    originalRecording.duration = payload.split;
    return _setRecording(state, originalRecording, {type: 'update'});
};
  
  // internal method to shift start point of a recording
const _schedulePlayer = (recording: RecordingType, offset: number): void => {
    recording.player.unsync();
    // catch all calculation of start position
    // represents start of recording, including potential crop, adjusted for playhead position
    let startOffset = recording.start - recording.position + offset;

    // offset is passed again here because the recording starts and then seeks to the same offset position
    recording.player.sync().start(recording.position + startOffset, startOffset);
    recording.player.stop(recording.duration);
};

const schedulePlayer = (recording: RecordingType): void => {
	  let offset = _calculatePlayOffset(Tone.Transport.seconds, recording);
	  _schedulePlayer(recording, offset);
};

  // return offset of playhead in relation to a recording clip
  // returns 0 if before or after clip
export const _calculatePlayOffset = (playPosition: number, recording: RecordingType): number => {
	if (playPosition < recording.start || playPosition >= recording.duration) {
	    return 0;
	}
	return playPosition - recording.start;
};
  
  const soloRecording = (state: State, recording: RecordingType): State => {
    if (recording.player && state.soloChannel) {
        recording.player.connect(state.soloChannel);
        state.soloChannel.solo = true;
        recording.solo = true;
        return _setRecording(state, recording, {type: 'update'});
    }
    return state;
};
  
const unsoloRecording = (state: State, recording: RecordingType): State => {
    if (recording.player  && state.soloChannel) {
        recording.player.disconnect(); // disconnect() -> disconnect all inputs
        let channelIndex = _findChannelIndex(state.channels, recording.channel)
        recording.player.connect(state.channels[channelIndex].channel); // reconnect to original channel
        state.soloChannel.solo = false;
        recording.solo = false;
        return _setRecording(state, recording, {type: 'update'});
    }
    return state;	
};