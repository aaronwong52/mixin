import { useState, useEffect, useRef } from 'react';

import styled from 'styled-components';

import Waveform from './analyser';
import NewRecording from './newrecording';

import * as Tone from 'tone';

const RecordView = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Button = styled.button`
  margin: 30px 10px;
`;

const RecordButton = styled(Button)`
  width: 35px;
  height: 35px;
  background-color: transparent;
  border: none;
  background: url('/images/record.png') no-repeat;
  background-size: 35px;
  `;

const PlayButton = styled(Button)`
    width: 35px;
    height: 35px;
    background-color: transparent;
    border: none;
    background: url('/images/play-button.png') no-repeat;
    background-size: 35px;
`;

function Record({playPosition, receiveRecording}) {

    const recordingState = useRef(false);
    const [recording, setRecording] = useState({});

    const recorder = new Tone.Recorder();
    const mic = new Tone.UserMedia();
    const analyser = new Tone.Analyser('waveform', 8192);

    const playBtn = document.getElementById("play_btn");

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
        let recBtn = document.getElementById("start_btn");

        // recBtn.disabled = !Tone.UserMedia.supported;
        recBtn.addEventListener("click", async () => {
            Tone.context.resume(); // https://github.com/Tonejs/Tone.js/issues/341
            if (recordingState.current) {
                closeMic();
                let data = await recorder.stop();
                let blobUrl = URL.createObjectURL(data);
                let newRecording = {position: playPosition, url: blobUrl};

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
            <RecordButton type="button" id="start_btn"></RecordButton>
            <Waveform analyser={analyser}></Waveform>
            {NewRecording(recording)}
        </RecordView>
    )
}

export default Record;