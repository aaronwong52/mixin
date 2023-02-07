import { useState } from 'react';

import * as styles from './ExportMixStyles';

import { bufferToWav } from '../utils/audio-utils';
import { AUDIO_FORMATS, getDownloadFormat } from '../utils/constants';


function ExportMix({displayState, recordings}) {

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
        let renderedBuffer = await renderBuffer();
    
        /* ????? necessary? */
        let mix = Tone.getContext().createBufferSource();
        mix.buffer = renderedBuffer;
        mix.connect(Tone.getContext().rawContext.destination);
        
        let wav = bufferToWav(renderedBuffer);
        exportFile(wav, AUDIO_FORMATS.wav);
      };
    
      const exportAsMp3 = async (ranges) => {
        let mp3 = [];
        let renderedBuffer = await renderBuffer();
    
        // https://github.com/zhuker/lamejs
        let mp3Encoder = new window.lamejs.Mp3Encoder(1, 44100, 128);
        
        let tempMP3 = mp3Encoder.encodeBuffer(renderedBuffer);
        mp3.push(tempMP3);
    
        // get end of mp3
        tempMP3 = mp3Encoder.flush();
        mp3.push(tempMP3);
    
        exportFile(mp3, AUDIO_FORMATS.mp3);
    };

    const exportFile = (file, fileFormat) => {
        let blob = new window.Blob([new DataView(file)], {
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

    const renderBuffer = async () => {
        // OfflineAudioContext(numChannels, length, sampleRate)
        const offlineContext = new OfflineAudioContext(2, state.endPosition, SAMPLE_RATE);
        recordings.forEach(function(recording) {
          let source = offlineContext.createBufferSource();
          source.buffer = bufferFromToneBuffer(recording.buffer);
          source.connect(offlineContext.destination);
          source.start();
        }); 
        return await offlineContext.startRendering();
    };

    return (
        <styles.ExportMenuView displayState={displayState}>
            <styles.ExportMenuOptions>
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

export default ExportMix;