import { useState } from 'react';

import * as styles from './ExportMixStyles';

import { calculatePlayOffset } from '../Reducer/recordingReducer';
import { bufferToWav, bufferFromToneBuffer } from '../utils/audio-utils';
import { SAMPLE_RATE, AUDIO_FORMATS, getDownloadFormat, WAV_TO_MP3 } from '../utils/constants';


function Export({displayState, channels}) {

    const [fileFormat, setFileFormat] = useState('');

    const onFormatClick = (format) => {
        setFileFormat(format);
    };
    
    const onBounceClick = () => {
        if (!fileFormat) {
            // error
        }

        // ranges: [start, end]
        let rangeInputs = Array.from(document.getElementsByClassName("export_range_input")); // HTMLCollection -> array
        let ranges = getRangesFromInputs(rangeInputs);
        bounce(fileFormat, ranges);
    };

    const getRangesFromInputs = (inputs) => {
        return inputs.map((input) => {
            return parseInt(input.value);
        })
    };

    const bounce = (fileFormat, ranges) => {
        if (fileFormat == 'mp3') {
          exportAsMp3(ranges);
        } else {
          exportAsWav(ranges);
        }
    };

    const exportAsWav = async (ranges) => {
        let renderedBuffer = await renderBuffer(ranges);    

        // To preview mix
        // let mix = Tone.getContext().createBufferSource();
        // mix.buffer = renderedBuffer;
        // mix.connect(Tone.getContext().rawContext.destination);
        
        let wav = bufferToWav(renderedBuffer);
        exportFile(wav, AUDIO_FORMATS.wav);
    };

    const boostMp3 = (floatBuffer) => {
        return floatBuffer.map((val) => {
            return val * WAV_TO_MP3;
        })
    }
    
    const exportAsMp3 = async (ranges) => {
        let mp3 = [];
        let renderedBuffer = await renderBuffer(ranges);
    
        // https://github.com/zhuker/lamejs
        let mp3Encoder = new window.lamejs.Mp3Encoder(1, 44100, 128);
        
        let floatBuffer = renderedBuffer.getChannelData(0);
        floatBuffer = boostMp3(floatBuffer);
        let sampleBlocksize = 576;
        for (let i = 0; i < floatBuffer.length; i += sampleBlocksize) {
            let sampleChunk = floatBuffer.subarray(i, i + sampleBlocksize);
            let mp3Chunk = mp3Encoder.encodeBuffer(sampleChunk);
            if (mp3Chunk.length > 0) {
                mp3.push(mp3Chunk);
            }
        }    
        // get end of mp3
        let mp3End = mp3Encoder.flush();
        if (mp3End.length > 0) {
            mp3.push(mp3End);
        } 
    
        exportFile(mp3, AUDIO_FORMATS.mp3);
    };

    const exportFile = (file, fileFormat) => {
        let formattedFile = file;
        if (fileFormat == AUDIO_FORMATS.wav) {
            formattedFile = [new DataView(file)];
        }
        let blob = new window.Blob(formattedFile, {
          type: fileFormat
        });
        downloadBlob(blob, fileFormat);
    };

    const downloadBlob = (blob, fileFormat) => {
        let anchor = document.createElement('a');
        let url = window.URL.createObjectURL(blob);
        anchor.href = url;
        anchor.download = getDownloadFormat(fileFormat);
        anchor.click();
        window.URL.revokeObjectURL(url);;
    };

    const renderBuffer = async (ranges) => {
        // OfflineAudioContext(numChannels, length, sampleRate)
        const offlineContext = new OfflineAudioContext(2, SAMPLE_RATE * ranges[1], SAMPLE_RATE);
        channels.forEach(function(channel) {
          channel.recordings.forEach(function(recording) {
            let source = offlineContext.createBufferSource();
            let offset = calculatePlayOffset(ranges[0], recording);
            let startOffset = recording.start - recording.position + offset;
            source.buffer = bufferFromToneBuffer(recording.data);
            source.connect(offlineContext.destination);
            source.start(recording.position + startOffset, startOffset);
          })
        }); 
        return await offlineContext.startRendering();
    };

    return (
        <styles.ExportMenuView displayState={displayState}>
            <styles.ExportMenuOptions>
                <styles.CenteredHeader>Export</styles.CenteredHeader>
                <styles.ExportMenuOption>
                    <h3>Format:</h3>
                    <styles.FileTypeButton 
                        fileFormat={fileFormat == 'wav'}
                        onClick={() => onFormatClick("wav")}>WAV
                    </styles.FileTypeButton>
                    <styles.FileTypeButton 
                        fileFormat={fileFormat == 'mp3'}
                        onClick={() => onFormatClick("mp3")}>MP3</styles.FileTypeButton>
                </styles.ExportMenuOption>
                <styles.ExportMenuOption>
                    <h3>Start:</h3>
                    <styles.ExportRangeInput className="export_range_input"></styles.ExportRangeInput>
                </styles.ExportMenuOption>
                <styles.ExportMenuOption>
                    <h3>End:</h3>
                    <styles.ExportRangeInput className="export_range_input"></styles.ExportRangeInput>
                </styles.ExportMenuOption>
                <styles.ExportButton onClick={onBounceClick}>Bounce</styles.ExportButton>
            </styles.ExportMenuOptions>
        </styles.ExportMenuView>
    )
}

export default Export;