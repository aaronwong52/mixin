export const PIX_TO_TIME = 100;
export const SAMPLE_RATE = 44100;
export const TIMELINE_OFFSET = 2.5;
export const AUDIO_FORMATS = {
    mp3: 'audio/mp3',
    wav: 'audio/wav'
}
export const WAV_TO_MP3 = 32767.5

export const getDownloadFormat = (fileFormat) => {
    if (fileFormat == AUDIO_FORMATS.mp3) {
        return 'audio.mp3';
    } else {
        return 'audio.wav';
    }
}