import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Waveform from './analyser';
import * as Tone from 'tone';

const RecordView = styled.div`
    height: 250px;
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #1f324d;

    @media only screen and (max-width: 768px) {
        height: 200px;
        width: 300px;
    }
    border-radius: 10px;
`;

const RecordButton = styled.button`
  width: 35px;
  height: 35px;
  background-color: transparent;
  border: none;
  background: ${props => props.recording
    ? "url('/images/stop.png') no-repeat;"
    : "url('/images/record_muted.png') no-repeat;"
  };
  background-size: 35px;
  margin: 8px 0px;
  :hover {
    cursor: pointer;
    box-shadow: 0 0 10px red;
    border-radius: 50%;
}
`;

function Record({receiveRecording}) {

    const recordingState = useRef(false);
    const [recording, setRecording] = useState(false);

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
        // for some reason (Tone?) this only works by binding a click listener, DOMException when using onClick prop
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
                    duration: 0, 
                    data: blobUrl, 
                    player: null,
                    // id: null, // used by Tone to register events (player sync)
                    index: 0,
                    solo: false,
                    loaded: false
                };
                receiveRecording(newRecording);
                recordingState.current = false;
                setRecording(false);
            }
            else {
                openMic();
                recorder.start();
                recordingState.current = true;
                setRecording(true);
            }
        })
    }, []);

    return (
        <RecordView>
            <RecordButton type="button" id="rec_btn" recording={recording}></RecordButton>
            <Waveform analyser={analyser}></Waveform>
        </RecordView>
    )
}

export default Record;