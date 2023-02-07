export const PIX_TO_TIME = 100;
export const SAMPLE_RATE = 44100;
export const TIMELINE_OFFSET = 2.5;
export const TRANSPORT_LENGTH = 2000;
export const AUDIO_FORMATS = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav'
}

export const getDownloadFormat = (fileFormat) => {
    if (fileFormat == AUDIO_FORMATS.mp3) {
        return 'audio.mp3';
    } else {
        return 'audio.wav';
    }
}