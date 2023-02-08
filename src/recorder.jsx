import { useState, useEffect, useRef } from 'react';

import styled from 'styled-components';

import Waveform from './analyser';
import * as Tone from 'tone';

const RecordView = styled.div`
    background-color: #dcf0f3;
    border-radius: 9px;
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
  background-color: transparent;
  border: none;
  background: url('/images/record.png') no-repeat;
  background-size: 35px;
  :hover {cursor: pointer;}
`;

const IconView = styled.div`
    visibility: ${props => props.vis ? "visible" : "hidden"};
    width: 100%;
    display: flex;
    justify-content: space-around;
`

const PlayButton = styled(RecordButton)`
    margin: 0px;
    background: ${props => props.playing 
        ? "url('/images/stop.png')" 
        : "url('/images/play-button.png')"
    } no-repeat;
`;

const DownButton = styled(PlayButton)`
    width: 40px;
    height: 40px;
    background: url('/images/down.png') no-repeat;
`



function Record({playPosition, receiveRecording}) {

    const recordingState = useRef(false);
    const [recording, setRecording] = useState(null);
    const [playing, setPlaying] = useState(false);
    const player = useRef(new Tone.Player().toDestination());

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

    const setupPlayer = async (url) => {
       await player.current.load(url);
    }

    const play = () => {
        if (!playing) {
            player.current.start();
        }
        else player.current.stop();
        setPlaying(!playing);
    }

    const restart = () => {
        player.current.restart();
    }

    const saveRecording = () => {
        receiveRecording(recording);
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
                let newRecording = {
                    position: playPosition.current, 
                    url: blobUrl, 
                    size: data.size, 
                    player: null,
                    channel: null
                };

                // Tone.Transport.schedule(position); // in seconds ... this should be done in main app after receiving
                // along with display of new recording view

                // newRecording = processRecording(newRecording);
                setRecording(newRecording);
                setupPlayer(blobUrl);
                // receiveRecording(newRecording); save for after approval
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
            <IconView vis={recording}>
                <PlayButton type="button" id="play_btn" 
                    playing={playing} onClick={play}> 
                </PlayButton>
                <DownButton onClick={saveRecording}></DownButton>
            </IconView>
        </RecordView>
    )
}

export default Record;