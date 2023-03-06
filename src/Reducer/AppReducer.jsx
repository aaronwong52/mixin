import { PIX_TO_TIME } from '../utils/constants';
import { createPlayer } from '../utils/audio-utils';
import * as Tone from 'tone';
import { v4 as uuidv4 } from 'uuid';

export const RecordingReducer = (state, action) => {
    switch (action.type) {
      case 'setMic':
        return setMic(state, action.payload);
      case 'togglePlay':
        return togglePlay(state, action.payload);
      case 'toggleRecordingState':
        return toggleRecordingState(state, action.payload);
      case 'initializeChannels':
        return initializeChannels(state, action.payload);
      case 'selectChannel':
        return selectChannel(state, action.payload);
      case 'deselectAllChannels':
        return deselectAllChannels(state, action.payload);
      case 'addChannel':
        return addChannel(state, action.payload);
      case 'editChannelName':
        return editChannelName(state, action.payload);
      case 'deleteSelectedChannel':
        return _deleteChannel(state, action.payload);
      case 'selectRecording':
        return selectRecording(state, action.payload);
      case 'deselectRecordings':
        return deselectRecordings(state, action.payload);
      case 'scheduleNewRecording':
        return scheduleNewRecording(state, action.payload);
      case 'switchRecordingChannel':
        return switchRecordingChannel(state, action.payload);
      case 'deleteSelectedRecording':
        return _deleteRecording(state, action.payload);
      case 'updateBuffer':
        return updateBuffer(state, action.payload);
      case 'updateRecordingPosition':
        return updateRecordingPosition(state, action.payload);
      case 'updateTransportLength':
        return updateTransportLength(state, action.payload);
      case 'updateTransportPosition':
        return updateTransportPosition(state, action.payload);
      case 'cropRecording':
        return cropRecording(state, action.payload);
      case 'addSplitRecording':
        return addSplitRecording(state, action.payload);
      case 'updateSplitRecording':
        return updateSplitRecording(state, action.payload);
      case 'soloClip':
        return soloClip(state, action.payload);
      case 'unsoloClip':
        return unsoloClip(state, action.payload);
      default: 
        return state;
    }
  };

  const getNewChannel = (index) => {
    return {
      channel: new Tone.Channel().toDestination(),
      name: 'Audio ' + (index + 1),
      recordings: [],
      id: uuidv4(),
      index: index
    }
  };

  const setMic = (state, mic) => {
    return {...state, mic: mic}
  };

  const togglePlay = (state, payload) => {
    return {
      ...state,
      playing: payload.playing,
      time: payload.time
    }
  };

  const toggleRecordingState = (state, recordingState) => {
    return {...state, recordingState: recordingState}
  };

  const initializeChannels = (state, payload) => {
    let firstChannel = getNewChannel(0);
    return {
      ...state,
      channels: [
        firstChannel
      ],
      soloChannel: new Tone.Channel().toDestination(),
      selectedChannel: firstChannel.id
    }
  };

  const addChannel = (state, payload) => {
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

  const editChannelName = (state, payload) => {
    let channels = state.channels;
    let channelIndex = _findChannelIndex(channels, payload.channelId);
    return {
      ...state,
      channels: [
        ...channels.slice(0, channelIndex),
        {...channels[channelIndex],
          name: payload.name
        },
        ...channels.slice(channelIndex + 1, channels.length)

      ]
    }
  };

  const _deleteChannel = (state, channelId) => {
    return {
      ...state,
      channels: [
        ...state.channels.filter((channel) => {
          if (channel.id == channelId) {
            channel.recordings.forEach((recording) => {
              recording.player.dispose();
            })
          }
          return channel.id != channelId;
        })
      ],
      // reset selected recording if it's on this channel
      selectedRecording: channelId == state.selectedRecording.channel 
        ? {}
        : state.selectedRecording,
      selectedChannel: channelId == state.selectedChannel
        ? 0
        : state.selectedChannel
    }
  };

  const selectChannel = (state, channelId) => {
    return {...state,selectedChannel: channelId};
  };

  const deselectAllChannels = (state, payload) => {
    return {...state, selectedChannel: 0};
  }
  
  const selectRecording = (state, recording) => {
    return {...state, selectedRecording: recording};
  };

  // currently only one recording is selected at a time
  // deselection by deselecting all
  const deselectRecordings = (state, payload) => {
    return {...state, selectedRecording: {}};
  };

  const _scheduleRecording = (state, recording) => {
    let channelIndex = _findChannelIndex(state.channels, recording.channel);
    schedulePlayer(recording);
    recording.player.connect(state.channels[channelIndex].channel);
  }

  const scheduleNewRecording = (state, recording) => {
    recording.channel = state.selectedChannel;
    _scheduleRecording(state, recording);
    return addRecording(state, recording);
  };

  // moves a recording to a new channel
  // payload.recording, payload.newChannelIndex
  const switchRecordingChannel = (state, payload) => {
    let channels = state.channels;
    let currChannelIndex = payload.channelIndex;
    let newChannelIndex = payload.newChannelIndex;

    let lowerIndex = (currChannelIndex > newChannelIndex) ? newChannelIndex : currChannelIndex;
    let higherIndex = (currChannelIndex > newChannelIndex) ? currChannelIndex : newChannelIndex;

    let filteredChannel = {...channels[currChannelIndex],
      recordings: [
        ...channels[currChannelIndex].recordings.filter((recording) => {
          return recording.id != payload.recording.id
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

  const _findRecordingIndex = (recordings, recordingId) => {
    return recordings.findIndex((recording) => recording.id == recordingId);
  };

  export const _findChannelIndex = (channels, channelId) => {
    let index = channels.findIndex((c) => c.id == channelId);
    return (index > 0) ? index : 0;
  };

  const _deleteRecording = (state, selectedRecording) => {
    let channels = state.channels;
    let channelIndex = _findChannelIndex(channels, selectedRecording.channel);
    if (channelIndex < 0) {
      return state;
    }

    return {
      ...state,
      channels: [
        ...channels.slice(0, channelIndex),
        {...channels[channelIndex],
          recordings: [
            ...channels[channelIndex].recordings.filter((recording) => {
              if (recording.id == selectedRecording.id) {
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

  // all logic for adding / updating recordings
  const _setRecording = (state, recording, action) => {
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
              ]
            },
            ...channels.slice(channelIndex + 1, channels.length)
          ],
          endPosition: newEndPosition
        };
      }
  };
  
  const addRecording = (state, recording) => {
    recording.start = recording.position;
    recording.channel = state.selectedChannel;
    return _setRecording(state, recording, {type: 'add'});
  };
  
  const updateBuffer = (state, recording) => {
    schedulePlayer(recording);
    return updateRecording(state, recording);
  };
  
  // error handling in the case where delta exceeds transport limits
  // calculate when delta causes r.start to be 0, and hard limit it at that point
  const updateRecordingPosition = (state, payload) => {
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

  const updateTransportLength = (state, length) => {
    return {...state, transportLength: length};
  }

  const updateTransportPosition = (state, time) => {
    updatePlayerPositions(state, time);
    return {...state, time: time};
  };

  const cropRecording = (state, payload) => {
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
  const addSplitRecording = (state, payload) => {
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
      data: {}, 
      player: createPlayer(secondBuffer),
      solo: false,
      loaded: true,
    };
    _scheduleRecording(state, newRecording);
    return _setRecording(state, newRecording, {type: 'add'});
  };

  const updateSplitRecording = (state, payload) => {
    let originalRecording = payload.recording;
    let originalBuffer = originalRecording.player.buffer;
    let firstBuffer = originalBuffer.slice(0, payload.splitPoint);

    originalBuffer.dispose();
    originalRecording.player.buffer = firstBuffer;
    originalRecording.duration = payload.splitPoint;
    return _setRecording(state, originalRecording, {type: 'update'});
  }
  
  const updateRecording = (state, recording) => {
    return _setRecording(state, recording, {type: 'update'});
  };
  
  // internal method to shift start point of a recording
  const _schedulePlayer = (recording, offset) => {
    recording.player.unsync();

    // catch all calculation of start position
    // represents start of recording, including potential crop, adjusted for playhead position
    let startOffset = recording.start - recording.position + offset;

    // offset is passed again here because the recording starts and then seeks to the same offset position
    recording.player.sync().start(recording.position + startOffset, startOffset);
    recording.player.stop(recording.duration);
  };

  const schedulePlayer = (recording) => {
      let offset = calculatePlayOffset(Tone.Transport.seconds, recording);
      _schedulePlayer(recording, offset);
  };

  const updatePlayerPositions = (state, time) => {
    state.channels.forEach((channel) => {     
      channel.recordings.forEach((recording) => {
        let offset = calculatePlayOffset(time, recording);
        _schedulePlayer(recording, offset);
      })
    });
  };
  
  // return offset of playhead in relation to a recording clip
  // returns 0 if before or after clip
  export const calculatePlayOffset = (playPosition, recording) => {
    if (playPosition < recording.start || playPosition >= recording.duration) {
      return 0;
    }
    return playPosition - recording.start;
  };
  
  // solo: route player to solo channel and solo it
  
  const soloClip = (state, recording) => {
    recording.player.connect(state.soloChannel);
    state.soloChannel.solo = true;
    recording.solo = true;
    return updateRecording(state, recording);
  };
  
  // does player.disconnect() cancel start()?
  const unsoloClip = (state, recording) => {
    recording.player.disconnect(); // disconnect() -> disconnect all
    let channelIndex = _findChannelIndex(state.channels, recording.channel)
    recording.player.connect(state.channels[channelIndex].channel); // reconnect to original channel
    state.soloChannel.solo = false;
    recording.solo = false;
    return updateRecording(state, recording);
  };