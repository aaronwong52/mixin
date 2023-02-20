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
      case 'deleteSelectedRecording':
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
    let channelIndex = _findChannelIndex(state.channels, state.selectedChannel);
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

  const _findRecordingIndex = (recordings, recordingId) => {
    return recordings.findIndex((recording) => recording.id == recordingId);
  };

  const _findChannelIndex = (channels, channelId) => {
    return channels.findIndex((channel) => channel.id == channelId);
  };

  const deleteRecording = (state, payload) => {
    let channels = state.channels;
    let channelIndex = _findChannelIndex(channels, state.selectedRecording.channel);
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
              if (recording.id == state.selectedRecording.id) {
                // this is a permanent change !
                recording.player.dispose();
              }
              return recording.id != state.selectedRecording.id;
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
          case 'update': // update (replace) recording at recordingIndex
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
            selectedRecording: (recording.id == state.selectedRecording.id)
              ? recording
              : state.selectedRecording,
            endPosition: newEndPosition
          };
        }
    }
  };
  
  const addRecording = (state, recording) => {
    let channelIndex = _findChannelIndex(state.channels, state.selectedChannel);

    recording.start = recording.position;
    recording.channel = state.selectedChannel;
    return _setRecording(state, recording, {type: 'add'});
  };
  
  const updateBuffer = (state, recording) => {
    schedulePlayer(recording);
    return updateRecording(state, recording);
  };
  
  const updateRecordingPosition = (state, payload) => {

    payload.recording.position += (payload.delta / PIX_TO_TIME);
    payload.recording.start += payload.delta / PIX_TO_TIME;
    payload.recording.duration += (payload.delta / PIX_TO_TIME);

    if (payload.recording.start < 0) {
      payload.recording.start = 0;
    }

    if (payload.recording.duration <= 0) {
      // console.log("Something went wrong here");
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
    return _setRecording(state, recording, {type: 'update'});
  };
  
  // internal method to shift start point of a recording
  const _schedulePlayer = (recording, offset) => {
    recording.player.unsync();

    // catch all calculation of start position
    // represents start of recording, including potential crop, adjusted for playhead position
    let startPosition = (recording.start + (recording.start - recording.position)) + offset;

    // offset is passed again here because the recording starts and then seeks to the same offset position
    recording.player.sync().start(startPosition, offset);
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