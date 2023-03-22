import * as Tone from 'tone';
import { CompleteRecording, IncompleteRecording } from '../Transport/recording';

export enum ActionType {
    setMic = 'setMic',
    togglePlay = 'togglePlay',
    toggleRecordingState = 'toggleRecordingState',
    initializeChannels = 'initializeChannels',
    selectChannel = 'selectChannel',
    deselectAllChannels = 'deselectAllChannels',
    addChannel = 'addChannel',
    editChannelName = 'editChannelName',
    deleteSelectedChannel = 'deleteSelectedChannel',
    selectRecording = 'selectRecording',
    deselectRecordings = 'deselectRecordings',
    scheduleNewRecording = 'scheduleNewRecording',
    switchRecordingChannel = 'switchRecordingChannel',
    deleteSelectedRecording = 'deleteSelectedRecording',
    updateRecordingPosition = 'updateRecordingPosition',
    updateTransportLength = 'updateTransportLength',
    updateTransportPosition = 'updateTransportPosition',
    cropRecording = 'cropRecording',
    addSplitRecording = 'addSplitRecording',
    updateSplitRecording = 'updateSplitRecording',
    soloRecording = 'soloRecording',
    unsoloRecording = 'unsoloRecording'
}

export type ActionPayload = {
    setMic: Tone.UserMedia;
    togglePlay: { playing: boolean; time: number; };
    toggleRecordingState: boolean;
    selectChannel: string;
    editChannelName: {id: string; name: string; };
    deleteSelectedChannel: string;
    
    selectRecording: CompleteRecording | IncompleteRecording;
    scheduleNewRecording: IncompleteRecording;
    deleteSelectedRecording: CompleteRecording;

    updateRecordingPosition: { recording: CompleteRecording; newPosition: number; };
    switchRecordingChannel: { 
        recording: CompleteRecording; 
        channelIndex: number;
        newChannelIndex: number;
    };
    cropRecording: { 
        recording: CompleteRecording; 
        leftDelta: number;
        rightDelta: number;
    }

    addSplitRecording: { 
        recording: CompleteRecording; 
        splitPoint: number;
    }

    updateSplitRecording: { 
        recording: CompleteRecording; 
        splitPoint: number;
    }
    soloRecording: CompleteRecording;
    unsoloRecording: CompleteRecording;
    updateTransportPosition: number;
    updateTransportLength: number;
}

export type Action = 
    { type: ActionType.setMic; payload: ActionPayload[ActionType.setMic]; } | 
    { type: ActionType.togglePlay; payload: ActionPayload[ActionType.togglePlay]; } |
    { type: ActionType.toggleRecordingState; payload: ActionPayload[ActionType.toggleRecordingState]; } |

    { type: ActionType.initializeChannels; } |
    { type: ActionType.addChannel; } |
    { type: ActionType.editChannelName; payload: ActionPayload[ActionType.editChannelName]; } |
    { type: ActionType.selectChannel; payload: ActionPayload[ActionType.selectChannel]; } | 
    { type: ActionType.deselectAllChannels; } |
    { type: ActionType.deleteSelectedChannel; payload: ActionPayload[ActionType.deleteSelectedChannel]; } |

    { type: ActionType.selectRecording; payload: ActionPayload[ActionType.selectRecording]; } |
    { type: ActionType.deselectRecordings; } |

    { type: ActionType.scheduleNewRecording; payload: ActionPayload[ActionType.scheduleNewRecording]; } |
    { type: ActionType.deleteSelectedRecording; payload: ActionPayload[ActionType.deleteSelectedRecording]; } |
    { type: ActionType.updateRecordingPosition; payload: ActionPayload[ActionType.updateRecordingPosition]; } |
    { type: ActionType.switchRecordingChannel; payload: ActionPayload[ActionType.switchRecordingChannel]; } |
    { type: ActionType.cropRecording; payload: ActionPayload[ActionType.cropRecording]; } |
    { type: ActionType.addSplitRecording; payload: ActionPayload[ActionType.addSplitRecording]; } |
    { type: ActionType.updateSplitRecording; payload: ActionPayload[ActionType.addSplitRecording]; } |
    { type: ActionType.soloRecording; payload: ActionPayload[ActionType.soloRecording]; } |
    { type: ActionType.unsoloRecording; payload: ActionPayload[ActionType.unsoloRecording]; } |
    { type: ActionType.updateTransportPosition; payload: ActionPayload[ActionType.updateTransportPosition]; }  |
    { type: ActionType.updateTransportLength; payload: ActionPayload[ActionType.updateTransportLength]; } 



