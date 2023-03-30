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
            return {...state, selectedRecording: emptyRecording()};
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
        case t.splitRecording:
            return addSplitRecording(state, action.payload);
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
        index: index
	}
};

const initializeChannels = (state: State): State => {
    let firstChannel = getNewChannel(0);
    return {...state,
        channels: [firstChannel],
        soloChannel: new Tone.Channel().toDestination(),
        selectedChannel: firstChannel.id
    }
};

const addChannel = (state: State): State => {
    let newChannel = getNewChannel(state.channels.length);
    return {...state,
        channels: [...state.channels, newChannel],
        selectedChannel: newChannel.id
    }
};

const deleteChannel = (state: State, channelId: string): State => {
    let sr = state.selectedRecording;
    let sc = state.selectedChannel;
    let clearSelectedRecording = existsRecording(sr) && sr.channel == channelId;
    return {...state,
        channels: _filteredChannels(state.channels, channelId, true),
        selectedRecording: clearSelectedRecording ? sr : emptyRecording(),
        selectedChannel: channelId == sc ? '' : sc
    }
};

const editChannelName = (state: State, payload: {id: string; name: string;}): State => {
    let channels = state.channels;
    return {...state,
        channels: channels.map((channel) => {
            if (channel.id == payload.id) {
                return {...channel, name: payload.name}
            } else return channel;
        })
    }
};

export const existsRecording = (r: RecordingType | EmptyRecording): r is RecordingType => {
    return ("id" in r && "player" in r);
};

export const emptyRecording = (): EmptyRecording => {
    return { id: '' }
}

const _disposePlayer = (player: Tone.Player) => {
    if (player) {
        player.dispose();
    }
}

const _scheduleRecording = (state: State, r: RecordingType): void => {
    let channelIndex = _findChannelIndex(state.channels, r.channel);
    schedulePlayer(r);
    r.player.connect(state.channels[channelIndex].channel);
}

const scheduleNewRecording = (state: State, r: IncompleteRecording): State => {
    r.id = uuidv4();
    r.channel = state.selectedChannel;
    
    _scheduleRecording(state, r as RecordingType);
    return _addRecording(state, r as RecordingType);
};

const switchRecordingChannel = (state: State, payload: { r: RecordingType; index: number; newIndex: number; }): State => {
    return {...state, channels: state.channels.map((channel) => {
        if (channel.index == payload.index) {
            return {...channel, recordings: _filteredRecordings(channel.recordings, payload.r.id, false)}
        } else if (channel.index == payload.newIndex) {
            return {...channel, recordings: [...channel.recordings, payload.r]}
        }
        else return channel;
    })}
};

export const _findChannelIndex = (channels: Channel[], channelId: string): number => {
    let index = channels.findIndex((c) => c.id == channelId);
    return (index > 0) ? index : 0;
};

const _filteredChannels = (channels: Channel[], channelId: string, destroy: boolean) => {
    return channels.filter((channel) => {
        if (channel.id == channelId && destroy) {
            channel.recordings.map((recording) => {
                _disposePlayer(recording.player);
            });
        }
        return channel.id != channelId;
    });
};

const _filteredRecordings = (recordings: RecordingType[], id: string, destroy: boolean) => {
    return recordings.filter((r) => {
        if (id == r.id && destroy) {
            _disposePlayer(r.player);
        }
        return id != r.id;
    });
};

const _filtered = (channels: Channel[], recordingId: string, destroy: boolean) => {
    return channels.map((channel) => {
        return {...channel, recordings: _filteredRecordings(channel.recordings, recordingId, destroy)};
    })
};

const _updateRecording = (state: State, r: RecordingType): State => {
    return {...state, channels: state.channels.map((channel) => {
        if (channel.id == r.channel) {
            return {...channel, recordings: _updatedRecordings(channel.recordings, r)};
        } else return channel;
    })};
};

const _updatedRecordings = (recordings: RecordingType[], nr: RecordingType) => {
    return recordings.map((recording) => {
        return (recording.id = nr.id) ? nr : recording;
    });
};

const _addRecording = (state: State, nr: RecordingType): State => {
    return {...state, channels: state.channels.map((channel) => {
        if (channel.id == nr.channel) {
            return {...channel, recordings: {...channel.recordings, nr}};
        } else return channel;
    })}
}

const deleteRecording = (state: State, r: RecordingType): State => {
	return {...state, channels: _filtered(state.channels, r.channel, true)}
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
    return _updateRecording(state, payload.r);
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
    return _updateRecording(state, recording);
};

const addSplitRecording = (state: State, payload: {r: RecordingType, split: number;}): State => {
	let originalRecording = payload.r;
    let originalBuffer = originalRecording.player.buffer;

    let firstBuffer = originalBuffer.slice(0, payload.split);
	let secondBuffer = originalBuffer.slice(payload.split, originalRecording.duration);
    originalBuffer.dispose();

    originalRecording.duration = payload.split;
    originalRecording.player.buffer = firstBuffer;

    let cropOffset = originalRecording.start - originalRecording.position;

    let newRecording = {
        id: uuidv4(),
        channel: originalRecording.channel,
        position: payload.split - cropOffset,
        duration: originalRecording.duration,
        start: payload.split,
        data: '',
        player: createPlayer(secondBuffer),
        solo: false,
	};  
	_scheduleRecording(state, newRecording);
    return _updateRecording(_addRecording(state, newRecording), originalRecording);
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
    let inBounds = playPosition >= recording.start || playPosition < recording.duration;
    return inBounds ? 0 : playPosition - recording.start;
};
  
  const soloRecording = (state: State, recording: RecordingType): State => {
    if (recording.player && state.soloChannel) {
        recording.player.connect(state.soloChannel);
        state.soloChannel.solo = true;
        recording.solo = true;
        return _updateRecording(state, recording);
    }
    return state;
};
  
const unsoloRecording = (state: State, recording: RecordingType): State => {
    if (recording.player && state.soloChannel) {
        recording.player.disconnect(); // disconnect() -> disconnect all inputs
        let channelIndex = _findChannelIndex(state.channels, recording.channel)
        recording.player.connect(state.channels[channelIndex].channel); // reconnect to original channel
        state.soloChannel.solo = false;
        recording.solo = false;
        return _updateRecording(state, recording);
    }
    return state;	
};