import { useState, useEffect, useRef } from 'react';

import styled from 'styled-components';

import Waveform from './analyser';
import * as Tone from 'tone';

const RecordView = styled.div`
    background-color: #4f8adb;
    height: 250px;
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media only screen and (max-width: 768px) {
        height: 200px;
        width: 300px;
    }
`;

const RecordButton = styled.button`
  width: 35px;
  height: 35px;
  margin-left: 12px;
  background-color: transparent;
  border: none;
  background: url('/images/record.png') no-repeat;
  background-size: 35px;
  :hover {cursor: pointer;}
`;

function Record({receiveRecording}) {

    const recordingState = useRef(false);

    const recorder = new Tone.Recorder();
    const mic = new Tone.UserMedia();
    const analyser = new Tone.Analyser('waveform', 8192);

    const openMic = () => {
        mic.connect(analyser);
        mic.connect(recorder);
        mic.open();
    }

    const closeMic = () => {
        mic.disconnect(recorder);
        mic.disconnect(analyser);
        mic.close();
    }

    useEffect(() => {
        let recBtn = document.getElementById("rec_btn");

        // recBtn.disabled = !Tone.UserMedia.supported;
        recBtn.addEventListener("click", async () => {
            Tone.context.resume(); // https://github.com/Tonejs/Tone.js/issues/341
            if (recordingState.current) {
                closeMic();
                let data = await recorder.stop();
                let blobUrl = URL.createObjectURL(data);
                let newRecording = {
                    position: Tone.Transport.seconds,
                    duration: data.size, 
                    data: blobUrl, 
                    player: null,
                    channel: null,
                    loaded: false
                };
                receiveRecording(newRecording);
                recordingState.current = false;
            }
            else {
                openMic();
                recorder.start();
                recordingState.current = true;
            }
        })
    }, []);

    return (
        <RecordView>
            <RecordButton type="button" id="rec_btn"></RecordButton>
            <Waveform analyser={analyser}></Waveform>
        </RecordView>
    )
}

export default Record;