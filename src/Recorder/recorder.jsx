import { useState, useEffect, useRef } from 'react';

import { RecordView, RecordButton } from './recorderStyles';

import LiveWaveform from './liveWaveform';
import * as Tone from 'tone';

function Recorder({receiveRecording, exporting}) {

    const recordingState = useRef(false);
    const [recording, setRecording] = useState(false);

    const recorder = new Tone.Recorder();
    const mic = new Tone.UserMedia();
    const analyser = new Tone.Analyser('waveform', 8192);

    const openMic = () => {
        mic.connect(analyser);
        mic.connect(recorder);
        mic.open();
    };

    const closeMic = () => {
        mic.disconnect(recorder);
        mic.disconnect(analyser);
        mic.close();
    };

    const toggleRecording = async () => {
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
                index: 0,
                solo: false,
                loaded: false
            };
            receiveRecording(newRecording);
            recordingState.current = false;
            setRecording(false);
        }
        else if (!exporting) { // functionality is locked while export menu is open 
            openMic();
            recorder.start();
            recordingState.current = true;
            setRecording(true);
        }
    };

    useEffect(() => {
        // for some reason (Tone?) this only works by binding a click listener, DOMException when using onClick prop
        let recBtn = document.getElementById("rec_btn");

        // recBtn.disabled = !Tone.UserMedia.supported;
        recBtn.addEventListener("click", toggleRecording)
        return () => {
            recBtn.removeEventListener("click", toggleRecording);
        }
    }, [exporting]);

    return (
        <RecordView>
            <RecordButton type="button" id="rec_btn" recording={recording}></RecordButton>
            <LiveWaveform analyser={analyser}></LiveWaveform>
        </RecordView>
    )
}

export default Recorder;