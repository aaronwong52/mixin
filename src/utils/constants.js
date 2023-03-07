export const PIX_TO_TIME = 100;
export const EDITOR_WIDTH = 650;
export const CHANNEL_SIZE = 100;
export const TIMELINE_HEIGHT = 50;
export const SAMPLE_RATE = 44100;
export const TIMELINE_OFFSET = 2.5;
export const MAX_FILE_SIZE = 10000000; // bytes
export const MAX_DURATION = 60;
export const AUDIO_FORMATS = {
    mp3: 'audio/mp3',
    wav: 'audio/wav'
}
export const WAV_TO_MP3 = 32767.5;

export const getDownloadFormat = (fileFormat) => {
    if (fileFormat == AUDIO_FORMATS.mp3) {
        return 'audio.mp3';
    } else {
        return 'audio.wav';
    }
}