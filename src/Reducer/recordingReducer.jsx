import { PIX_TO_TIME } from '../utils/constants';
import * as Tone from 'tone';

export const recordingReducer = (state, action) => {
    switch (action.type) {
      case 'initializeChannels':
        return initializeChannels(state, action.payload);
      case 'selectChannel':
        return selectChannel(state, action.payload);
      case 'addChannel':
        return addChannel(state, action.payload);
      case 'selectRecording':
        return selectRecording(state, action.payload);
      case 'deselectRecordings':
        return deselectRecordings(state, action.payload);
      case 'scheduleRecording':
        return scheduleRecording(state, action.payload);
      case 'updateBuffer':
        return updateBuffer(state, action.payload);
      case 'updateRecordingPosition':
        return updateRecordingPosition(state, action.payload);
      case 'updateTransportPosition':
        return updateTransportPosition(state, action.payload);
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
      selectedChannel: 0
    }
  };

  const addChannel = (state, payload) => {
    let newIndex = state.channels.length;
    
    // base case will never happen since it's initialized with 1 channel
    let newChannel = getNewChannel(newIndex);
    return {
      ...state,
      channels: [
        ...state.channels.slice(0, newIndex),
        newChannel
      ],
      selectedChannel: newIndex
    }
  };

  const selectChannel = (state, index) => {
    return {
      ...state,
      selectedChannel: index
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
    let selectedChannel = state.selectedChannel;
    schedulePlayer(recording);
    recording.player.connect(state.channels[selectedChannel].channel);
    return addRecording(state, recording);
  };

  // all logic for adding / updating recordings
  const _setRecording = (state, recording, action) => {
    let channels = state.channels;
    let channelIndex = recording.channel;
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
                  {...recording, channel: channelIndex},
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
                  {...recording, channel: channelIndex},
                  ...channels[channelIndex].recordings.slice(recording.index + 1, numRecordings)
                ]
              },
              ...channels.slice(channelIndex + 1, channels.length)
            ],
            endPosition: newEndPosition
          };
        }
    }
  };
  
  const addRecording = (state, recording) => {
    let channels = state.channels;
    let channelIndex = state.selectedChannel;
    let newIndex = channels[channelIndex].recordings.length;
    recording.index = newIndex;
    recording.start = recording.position;
    recording.channel = channelIndex;
    return _setRecording(state, recording, {type: 'add'});
  };
  
  const updateBuffer = (state, recording) => {
    return updateRecording(state, recording);
  };
  
  const updateRecordingPosition = (state, payload) => {
    let oldPosition = payload.recording.start;
    let newPosition = oldPosition + (payload.delta / PIX_TO_TIME);
    if (newPosition < 0) {
      payload.recording.start = 0;
    } else {
      payload.recording.start = newPosition;
    }
    schedulePlayer(payload.recording);
    return updateRecording(state, payload.recording);
  };

  const updateTransportPosition = (state, payload) => {
    updatePlayerPositions(state, payload.time);
    return state;
  };
  
  const updateRecording = (state, recording) => {
    schedulePlayer(recording);
    return _setRecording(state, recording, {type: 'update'});
  };
  
  const _schedulePlayer = (recording, offset) => {
    recording.player.unsync();
    recording.player.sync().start(recording.start, offset, recording.duration);
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
    recording.player.connect(state.channels[recording.channel].channel); // reconnect to original channel
    state.soloChannel.solo = false;
    recording.solo = false;
    return updateRecording(state, recording);
  };