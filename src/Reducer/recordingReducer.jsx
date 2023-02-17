import { PIX_TO_TIME } from '../utils/constants';
import * as Tone from 'tone';
import { v4 as uuidv4 } from 'uuid';

export const recordingReducer = (state, action) => {
    switch (action.type) {
      case 'initializeChannels':
        return initializeChannels(state, action.payload);
      case 'selectChannel':
        return selectChannel(state, action.payload);
      case 'addChannel':
        return addChannel(state, action.payload);
      case 'deleteChannel':
        return deleteChannel(state, action.payload);
      case 'selectRecording':
        return selectRecording(state, action.payload);
      case 'deselectRecordings':
        return deselectRecordings(state, action.payload);
      case 'scheduleRecording':
        return scheduleRecording(state, action.payload);
      case 'deleteRecording':
        return deleteRecording(state, action.payload);
      case 'updateBuffer':
        return updateBuffer(state, action.payload);
      case 'updateRecordingPosition':
        return updateRecordingPosition(state, action.payload);
      case 'updateTransportPosition':
        return updateTransportPosition(state, action.payload);
      case 'cropRecording':
        return cropRecording(state, action.payload);
      case 'soloClip':
        return soloClip(state, action.payload);
      case 'unsoloClip':
        return unsoloClip(state, action.payload);
      default: 
        return;
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
  }

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
    
    // base case will never happen since it's initialized with 1 channel
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

  const deleteChannel = (state, payload) => {
    return {
      ...state,
      channels: [
        ...state.channels.filter((channel) => channel.id == payload.id) // is cleanup needed?
      ],
      selectedRecording: payload.id == state.selectedRecording.channel // reset selected if on this channel
        ? {}
        : state.selectedRecording
    }
  }

  const selectChannel = (state, id) => {
    return {
      ...state,
      selectedChannel: id
    }
  };

  const selectRecording = (state, recording) => {
    return {
      ...state,
      selectedRecording: recording
    };
  };

  // currently only one recording is selected at a time
  // deselection by deselecting all
  const deselectRecordings = (state, payload) => {
    return {
      ...state,
      selectedRecording: {}
    };
  };

  const scheduleRecording = (state, recording) => {  
    let channelIndex = _findIndex(state.channels, state.selectedChannel);
    schedulePlayer(recording);
    recording.player.connect(state.channels[channelIndex].channel);
    return addRecording(state, recording);
  };

  // moves a recording to a new channel
  // payload.recording, payload.newChannelIndex
  const adjustRecordingChannel = (state, payload) => {
    let channels = state.channels;
    let currChannelId = payload.recording.channel;

    // how? pop one recording, push it to another channel?
  };

  const _findIndex = (channels, id) => {
    return channels.findIndex((channel) => channel.id == id);
  }

  const deleteRecording = (state, payload) => {
    let channels = state.channels;
    let channelIndex = _findIndex(channels, state.selectedRecording.channel);
    return {
      ...state,
      channels: [
        ...channels.slice(0, channelIndex),
        {...channels[channelIndex],
          recordings: [{
            ...channels[channelIndex].filter((recording) => {
              recording.id != state.selectedRecording.id;
            })
          }]
        },
        ...channels.slice(channelIndex + 1, channels.length)
      ],
      selectedRecording: {}
    }
  };

  // all logic for adding / updating recordings
  const _setRecording = (state, recording, action) => {
    let channels = state.channels;
    let channelIndex = _findIndex(channels, recording.channel);
    let numRecordings = channels[channelIndex].recordings.length;

    if ( !numRecordings ) { // if no recordings on selected channel
      return {
        ...state, 
        channels: [
          ...channels.slice(0, channelIndex),
          {...channels[channelIndex],
            recordings: [{
              ...recording
            }]
          },
          ...channels.slice(channelIndex + 1, channels.length)
        ]
      };
    } else { // if there are already recordings on selected channel
      switch (action.type) {
        case 'add': // append new recording to end
          return {
            ...state, 
            channels: [
              ...channels.slice(0, channelIndex),
              {...channels[channelIndex], 
                recordings: [
                  ...channels[channelIndex].recordings.slice(0, numRecordings),
                  {...recording},
                ]
              },
              ...channels.slice(channelIndex + 1, channels.length)
            ],
          };
          case 'update': // update (replace) recording at recording.index
            let newEndPosition = recording.start + recording.duration > state.endPosition
            ? recording.start + recording.duration
            : state.endPosition;
          return {
            ...state,
            channels: [
              ...channels.slice(0, channelIndex),
              {...channels[channelIndex], 
                recordings: [
                  ...channels[channelIndex].recordings.slice(0, recording.index),
                  {...recording},
                  ...channels[channelIndex].recordings.slice(recording.index + 1, numRecordings)
                ]
              },
              ...channels.slice(channelIndex + 1, channels.length)
            ],
            selectedRecording: (recording.id == state.selectedRecording.id)
              ? recording
              : state.selectedRecording,
            endPosition: newEndPosition
          };
        }
    }
  };
  
  const addRecording = (state, recording) => {
    let channelIndex = _findIndex(state.channels, state.selectedChannel);
    let recordingIndex = state.channels[channelIndex].recordings.length;

    recording.index = recordingIndex;
    recording.start = recording.position;
    recording.channel = state.selectedChannel;
    return _setRecording(state, recording, {type: 'add'});
  };
  
  const updateBuffer = (state, recording) => {
    return updateRecording(state, recording);
  };
  
  const updateRecordingPosition = (state, payload) => {
    let oldStart = payload.recording.start;
    let newStart = oldStart + (payload.delta / PIX_TO_TIME);
    payload.recording.position += (payload.delta / PIX_TO_TIME);
    if (newStart < 0) {
      payload.recording.start = 0;
    } else {
      payload.recording.start = newStart;

    }
    schedulePlayer(payload.recording);
    return updateRecording(state, payload.recording);
  };

  const updateTransportPosition = (state, payload) => {
    updatePlayerPositions(state, payload.time);
    return state;
  };

  const cropRecording = (state, payload) => {
    let recording = payload.recording;

    recording.start += payload.leftDelta;
    recording.duration -= payload.rightDelta;
    schedulePlayer(recording);
    return _setRecording(state, recording, {type: 'update'});
  }
  
  const updateRecording = (state, recording) => {
    schedulePlayer(recording);
    return _setRecording(state, recording, {type: 'update'});
  };
  
  const _schedulePlayer = (recording, offset) => {
    recording.player.unsync();
    let startPos = (recording.start - recording.position) + offset;
    
    recording.player.sync().start(startPos, startPos);
    recording.player.stop(recording.duration);
  }
  /* 
    called when 
      1. recording is created, setting scheduling for that recording
      2. recording is moved, updating scheduling for that recording
  */
  const schedulePlayer = (recording) => {
      let offset = calculatePlayOffset(Tone.Transport.seconds, recording.start);
      _schedulePlayer(recording, offset);
  };

  const updatePlayerPositions = (state, time) => {
    state.channels.forEach((channel) => {     
      channel.recordings.forEach((recording) => {
        if (time >= recording.start) {
          let offset = calculatePlayOffset(time, recording.start);
          _schedulePlayer(recording, offset);
        }
      })
    });
  };
  
  // return offset of playhead in relation to a recording clip
  // returns 0 if negative
  export const calculatePlayOffset = (playPosition, recordingPosition) => {
    if (playPosition < recordingPosition) {
      return 0;
    }
    return playPosition - recordingPosition;
  };
  
  // solo: route player to solo channel and solo it
  
  const soloClip = (state, recording) => {
    recording.player.connect(state.soloChannel);
    state.soloChannel.solo = true;
    recording.solo = true;
    return updateRecording(state, recording);
  };
  
  const unsoloClip = (state, recording) => {
    recording.player.disconnect(); // disconnect() -> disconnect all
    let channelIndex = _findIndex(state.channels, recording.channel)
    recording.player.connect(state.channels[channelIndex].channel); // reconnect to original channel
    state.soloChannel.solo = false;
    recording.solo = false;
    return updateRecording(state, recording);
  };