import { useState, useEffect, useRef } from 'react';

import styled from 'styled-components';

import Waveform from './analyser';
import * as Tone from 'tone';

const RecordView = styled.div`
    background-color: #dcf0f3;
    border-radius: 10px;
    height: 250px;
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

function Record({playPosition, receiveRecording}) {

    const recordingState = useRef(false);
    const [recording, setRecording] = useState(null);

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
                    position: playPosition.current,
                    duration: data.size, 
                    url: blobUrl, 
                    size: data.size, 
                    player: null,
                    channel: null
                };

                // Tone.Transport.schedule(position); // in seconds ... this should be done in main app after receiving
                // along with display of new recording view

                setRecording(newRecording);
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