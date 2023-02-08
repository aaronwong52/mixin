// concat audio buffers one and two

import { SAMPLE_RATE } from "./utils";
import toWav from 'audiobuffer-to-wav';

export const bufferToWav = (buffer) => {
    return toWav(buffer);
}

export const bufferFromToneBuffer = (toneBuffer) => {
    // console.log(toneBuffer._buffer.getChannelData(0));
    return toneBuffer._buffer;
}

export const concat = (one, space, two) => {
    let newLength = one.length + two.length;
    let newArray = one.map(function(array, channel) {
        let newChannelArray = new Float32Array(newLength);
        newChannelArray.set(array);
        newChannelArray.set(two[channel], newChannelArray.length); // concat two onto the end
        return newChannelArray;
    })
}

export const fromArray = (array, sampleRate) => {
    let audioBuffer = new AudioBuffer({
        length: 44100, 
        numberOfChannels: 2, 
        sampleRate: SAMPLE_RATE
    });
    console.log(audioBuffer);
    // array.forEach(function(channelArray) {
    //     if (!(channelArray instanceof Float32Array)) {
    //         channelArray = new Float32Array(channelArray);
    //     }
    //     console.log(channelArray);
    // })
}