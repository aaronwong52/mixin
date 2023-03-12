export const PIX_TO_TIME: number = 100;
export const EDITOR_WIDTH: number = 650;
export const CHANNEL_SIZE: number = 100;
export const TIMELINE_HEIGHT: number = 50;
export const SAMPLE_RATE: number = 44100;
export const TIMELINE_OFFSET: number = 2.5;
export const MAX_FILE_SIZE: number = 10000000; // bytes
export const MAX_DURATION: number = 60;

interface AudioFormat {
    mp3: string;
    wav: string;
}

export const AUDIO_FORMATS: AudioFormat = {
    mp3: 'audio/mp3',
    wav: 'audio/wav'
}

export const WAV_TO_MP3: number = 32767.5;

export const getDownloadFormat = (fileFormat: string) => {
    if (fileFormat == AUDIO_FORMATS.mp3) {
        return 'audio.mp3';
    } else {
        return 'audio.wav';
    }
}