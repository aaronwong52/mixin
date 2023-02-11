import { PIX_TO_TIME } from '../utils/constants';
import * as Tone from 'tone';

export const recordingReducer = (state, action) => {
    switch (action.type) {
      case 'initializeChannels':
        return initializeChannels(state, action.payload);
      case 'selectChannel':
        return selectChannel(state, action.payload);
      case 'deselectAllChannels':
        return deselectChannels(state, action.payload);
      case 'addChannel':
        return addChannel(state, action.payload);
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
    console.log({
      ...state,
      channels: [
        ...state.channels.slice(0, newIndex),
        newChannel
      ],
      selectedChannel: newIndex + 1
    })
    return {
      ...state,
      channels: [
        ...state.channels.slice(0, newIndex),
        newChannel
      ],
      selectedChannel: newIndex + 1
    }
  };

  const selectChannel = (state, index) => {
    return {
      ...state,
      selectedChannel: index + 1
    }
  };

  const deselectChannels = (state, payload) => {
    return {
      ...state,
      selectedChannel: 0
    }
  }
  
  const scheduleRecording = (state, recording) => {  
    let selectedChannel = state.selectedChannel;
    schedulePlayer(recording);
    if (!selectedChannel) {
      recording.player.connect(state.channels[0].channel);
    } else {
      recording.player.connect(state.channels[selectedChannel - 1].channel);
    }
    return addRecording(state, recording);
  };
  
  const addRecording = (state, recording) => {
    let channels = state.channels;
    let channelIndex = (state.selectedChannel ? state.selectedChannel - 1 : 0);
    console.log(state.selectedChannel);
    let newIndex = channels[channelIndex].recordings.length;
    recording.index = newIndex;
    recording.channel = channelIndex;
    if (newIndex === 0) {
      console.log({
        ...state, 
        channels: [
          ...channels.slice(0, channelIndex),
          {...channels[channelIndex], 
            recordings: [
              {...recording},
            ]
          },
          ...channels.slice(channelIndex + 1, channels.length)
        ],
        endPosition: recording.position + recording.duration,
      })
      return {
        ...state, 
        channels: [
          ...channels.slice(0, channelIndex),
          {...channels[channelIndex], 
            recordings: [
              {...recording},
            ]
          },
          ...channels.slice(channelIndex + 1, channels.length)
        ],
        endPosition: recording.position + recording.duration,
      };
    } else {
      let newEndPosition = recording.position + recording.duration > state.endPosition
        ? recording.position
        : state.endPosition;
        return {
          ...state, 
          channels: [
            ...channels.slice(0, channelIndex),
            {...channels[channelIndex], 
              recordings: [
                ...channels[channelIndex].recordings.slice(0, newIndex),
                {...recording, channel: channelIndex},
                ...channels[channelIndex].recordings.slice(newIndex + 1, channels.length)
              ]
            },
            ...channels.slice(channelIndex + 1, state.channels.length)
          ],
          endPosition: newEndPosition
        };
    }
  };
  
  const updateBuffer = (state, recording) => {
    return updateRecording(state, recording);
  };
  
  const updateRecordingPosition = (state, payload) => {
    let oldPosition = payload.recording.position;
    payload.recording.position = (oldPosition + (payload.delta / PIX_TO_TIME) < 0)
    ? 0     // no hiding clips
    : oldPosition + (payload.delta / PIX_TO_TIME)
  
    payload.recording.id = schedulePlayer(payload.recording);
    return updateRecording(state, payload.recording);
  };

  const updateTransportPosition = (state, payload) => {
    updatePlayerPositions(state, payload.time);
    return state;
  };
  
  const updateRecording = (state, recording) => {
    let clipIndex = recording.index;
    let channelIndex = recording.channel;
    let existingLength = state.channels[channelIndex].recordings.length;
    if (existingLength === 1) {
      // console.log({
      //   ...state, 
      //   channels: [
      //     ...state.channels.slice(0, channelIndex),
      //     {...state.channels[channelIndex],
      //       recordings: [{
      //         ...recording
      //       }],
      //     },
      //     ...state.channels.slice(channelIndex + 1, state.channels.length)
      //   ]
      // })
      return {
        ...state, 
        channels: [
          ...state.channels.slice(0, channelIndex),
          {...state.channels[channelIndex],
            recordings: [{
              ...recording
            }]
          },
          ...state.channels.slice(channelIndex + 1, state.channels.length)
        ]
      };
    } else {
      return {
      ...state, 
      channels: [
        {...state.channels.slice(0, channelIndex),
          recordings: [
            ...state.channels[channelIndex].recordings.slice(0, clipIndex),
            {...recording},
            ...state.channels[channelIndex].recordings.slice(clipIndex + 1, existingLength)
          ],
          ...state.channels.slice(channelIndex + 1, state.channels.length)
        }
      ]
    };
  }
  };
  
  /* 
    called when 
      1. recording is created, setting scheduling for that recording
      2. recording is moved, updating scheduling for that recording
  */
  const schedulePlayer = (recording) => {
      recording.player.unsync();
      recording.player.sync().start(recording.position); 
  };

  // for when playhead is updated, updating scheduling based on new play position for all recordings
  // what if instead of calling player.start(), we just store an offset?
  const updatePlayerPositions = (state, time) => {
    state.channels.forEach((channel) => {
      channel.recordings.forEach((recording) => {
        if (time >= recording.position) {
          let offset = calculatePlayOffset(time, recording.position);
          recording.player.unsync();
          recording.player.sync().start(time, offset);
        }
      })
    })
  }
  
  // return offset of playhead in relation to a recording clip
  // returns 0 if negative
  export const calculatePlayOffset = (playPosition, recordingPosition) => {
    if (playPosition < recordingPosition) {
      return 0;
    }
    return playPosition - recordingPosition;
  };
  
  // solo: route player to solo channel and solo it
  
  const soloClip = (state, payload) => {
    payload.recording.player.connect(state.soloChannel);
    state.soloChannel.solo = true;
    payload.recording.solo = true;
    return updateRecording(state, payload.recording);
  };
  
  const unsoloClip = (state, payload) => {
    payload.recording.player.disconnect(); // disconnect() -> disconnect all
    payload.recording.player.connect(payload.recording.channel); // reconnect to original channel
    state.soloChannel.solo = false;
    payload.recording.solo = false;
    return updateRecording(state, payload.recording);
  };