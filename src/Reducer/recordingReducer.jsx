import { PIX_TO_TIME } from '../utils/constants';
import * as Tone from 'tone';

export const recordingReducer = (state, action) => {
    switch (action.type) {
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
  
  const scheduleRecording = (state, recording) => {  
    recording.id = schedulePlayer(recording, Tone.Transport.seconds);
    recording.player.connect(state.channel);
    return addRecording(state, recording);
  };
  
  const addRecording = (state, recording) => {
    recording.index = state.recordings.length;
    if (state.recordings.length === 0) {
      return {
        ...state,
        recordings: [recording], endPosition: recording.position + recording.duration
      };
    } else {
      let newEndPosition = recording.position + recording.duration > state.endPosition
        ? recording.position
        : state.endPosition;
      return {
        ...state,
        recordings: [
          ...state.recordings.slice(0, state.recordings.length),
          recording
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
    state.recordings.forEach((recording) => {
      schedulePlayer(recording); // go through and update Transport scheduling based on new transport position
    });
    return state;
  };
  
  const updateRecording = (state, recording) => {
    let clipIndex = recording.index;
    let existingLength = state.recordings.length;
    if (existingLength === 1) {
      return {
       ...state, 
       recordings: [{...recording}]
      };
    } else return {
      ...state,
      recordings: [
        ...state.recordings.slice(0, clipIndex),
        {...recording},
        ...state.recordings.slice(clipIndex + 1, existingLength)
      ]
    }
  };
  
  // returns id of scheduled Transport event
  const schedulePlayer = (recording) => {
    // cancel current scheduling
    Tone.Transport.clear(recording.id);
  
    // replace with player.sync.start(offset)
    // because scheduling things on the transport is not built to support playback in the middle of a sample via player
    let offset = calculatePlayOffset(Tone.Transport.seconds, recording.position);
    return Tone.Transport.schedule((time) => {
      // callback runs at time, so offset can be calculated using time
      let _offset = calculatePlayOffset(Tone.Transport.seconds, recording.position);
      console.log(_offset);
      recording.player.start(0, _offset); // make sure this time parameter is relative to Transport time and not time from now
    }, recording.position + offset);
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
  
  const soloClip = (state, payload) => {
    payload.recording.player.connect(state.soloChannel);
    state.soloChannel.solo = true;
    payload.recording.solo = true;
    return updateRecording(state, payload.recording);
  };
  
  const unsoloClip = (state, payload) => {
    payload.recording.player.disconnect(); // disconnect() -> disconnect all
    payload.recording.player.connect(state.channel); // reconnect to original channel
    state.soloChannel.solo = false;
    payload.recording.solo = false;
    return updateRecording(state, payload.recording);
  };