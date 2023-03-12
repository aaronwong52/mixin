import { useState } from 'react';

import * as styles from './Styles/ExportMixStyles';
import { SettingsProp } from './Settings';

import { calculatePlayOffset } from '../Reducer/AppReducer';
import { bufferToWav, bufferFromToneBuffer } from '../utils/audio-utils';
import { SAMPLE_RATE, AUDIO_FORMATS, getDownloadFormat, WAV_TO_MP3 } from '../utils/constants';

export interface FileFormatProp {
    isWav: boolean;
    onClick?: any;
}

type Ranges = [number, number];

type Mp3Buffer = BlobPart[];
type WavBuffer = ArrayBuffer;


function Export({channels}: SettingsProp) {

    const [fileFormat, setFileFormat] = useState('');

    const onFormatClick = (format: string) => {
        setFileFormat(format);
    };
    
    const onBounceClick = () => {
        if (!fileFormat) {
            return;
        }

        // ranges: [start, end]
        let rangeInputs: HTMLCollectionOf<Element> = document.getElementsByClassName("export_range_input");
        let ranges: number[] = getRangesFromInputs(rangeInputs);
        // @ts-ignore
        bounce(fileFormat, ranges);
    };

    const getRangesFromInputs = (elements: HTMLCollectionOf<Element>) => {
        let inputs: Element[] = Array.from(elements);
        return inputs.map((input: Element) => {
            if (input instanceof HTMLInputElement) {
                return parseInt(input.value);
            }
            return -1;
        });
    };

    const bounce = (fileFormat: string, ranges: Ranges) => {
        if (fileFormat == 'mp3') {
            exportAsMp3(ranges);
        } else {
            exportAsWav(ranges);
        }
    };

    const exportAsWav = async (ranges: Ranges) => {
        let renderedBuffer = await renderBuffer(ranges);    

        // To preview mix
        // let mix = Tone.getContext().createBufferSource();
        // mix.buffer = renderedBuffer;
        // mix.connect(Tone.getContext().rawContext.destination);
        
        let wav: ArrayBuffer = bufferToWav(renderedBuffer);
        exportWav(wav, AUDIO_FORMATS.wav);
    };

    // mp3 encoder yields extremely quiet levels
    const boostMp3 = (floatBuffer: Float32Array) => {
        return floatBuffer.map((val: any) => {
            return val * WAV_TO_MP3;
        })
    };
    
    const exportAsMp3 = async (ranges: Ranges) => {
        let mp3: BlobPart[] = [];
        let renderedBuffer = await renderBuffer(ranges);
    
        // https://github.com/zhuker/lamejs
        // @ts-ignore
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
    
        exportMp3(mp3, AUDIO_FORMATS.mp3);
    };

    const exportMp3 = (mp3: Mp3Buffer, fileFormat: string) => {
        let blob = new window.Blob(mp3, {
            type: fileFormat
        });
        downloadBlob(blob, fileFormat);
    };

    const exportWav = (file: WavBuffer, fileFormat: string) => {
        let formattedFile: [DataView] = [new DataView(file)];
        let blob = new window.Blob(formattedFile, {
            type: fileFormat
        });
        downloadBlob(blob, fileFormat);
    };

    const downloadBlob = (blob: Blob, fileFormat: string) => {
        let anchor = document.createElement('a');
        let url = window.URL.createObjectURL(blob);
        anchor.href = url;
        anchor.download = getDownloadFormat(fileFormat);
        anchor.click();
        window.URL.revokeObjectURL(url);;
    };

    const renderBuffer = async (ranges: Ranges) => {
        // OfflineAudioContext(numChannels, length, sampleRate)
        const offlineContext = new OfflineAudioContext(2, SAMPLE_RATE * ranges[1], SAMPLE_RATE);
        // @ts-ignore
        channels.forEach(function(channel) {
            // @ts-ignore
            channel.recordings.forEach(function(recording) {
                let source = offlineContext.createBufferSource();
                let offset = calculatePlayOffset(ranges[0], recording);
                let startOffset = recording.start - recording.position + offset;
                // @ts-ignore
                source.buffer = bufferFromToneBuffer(recording.data);
                source.connect(offlineContext.destination);
                source.start(recording.position + startOffset, startOffset);
            })
        }); 
        return await offlineContext.startRendering();
    };

    return (
        <styles.ExportMenu>
            <styles.ExportMenuOption>
                <styles.ExportRangeText>Format:</styles.ExportRangeText>
                <styles.FileTypeButton 
                    isWav={fileFormat == 'wav'}
                    onClick={() => onFormatClick("wav")}>WAV
                </styles.FileTypeButton>
                <styles.FileTypeButton 
                    isWav={fileFormat == 'mp3'}
                    onClick={() => onFormatClick("mp3")}>MP3</styles.FileTypeButton>
            </styles.ExportMenuOption>
            <styles.ExportMenuOption>
                <styles.ExportRangeText>Start:</styles.ExportRangeText>
                <styles.ExportRangeInput className="export_range_input"></styles.ExportRangeInput>s
            </styles.ExportMenuOption>
            <styles.ExportMenuOption>
                <styles.ExportRangeText>End:</styles.ExportRangeText>
                <styles.ExportRangeInput className="export_range_input"></styles.ExportRangeInput>s
            </styles.ExportMenuOption>
            <styles.ExportButton onClick={onBounceClick}>Bounce</styles.ExportButton>
        </styles.ExportMenu>
    );
}

export default Export;