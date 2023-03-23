import * as Tone from 'tone';
import { Channel } from '../Transport/channel';
import { EmptyRecording, RecordingType } from '../Transport/recording';

export interface State {
    recordingState: boolean;
    mic?: Tone.UserMedia | null;
    channels: Channel[];
    selectedRecording: RecordingType | EmptyRecording;
    selectedChannel: string;
    endPosition: number;
    soloChannel?: Tone.Channel;
    time: number;
    playing: boolean;
    transportLength: number;
}