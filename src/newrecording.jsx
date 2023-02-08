import * as Tone from 'tone';
import styled from 'styled-components';

const NewRecord = styled.div`
    width: 100vw;
    height: 100px;
    display: flex;
    justify-content: center;
`;

const RecordingView = styled.div`
    width: ${props => props.width + "px"};
    height: 75px;
    background-color: #d6b8f5;
    border-radius: 10px;
`;

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

const NewRecording = (newRecording) => {
    let buffer = new Tone.Buffer(newRecording.url, function() {
        let buff = buffer.get();
        let newRecording = {position: playPosition, buffer: buffer};
    });
    const pixelWidth = isEmpty(newRecording) ? 0 : (buffer.duration * 100); 
    return (
        <NewRecord>
            <RecordingView width={pixelWidth}></RecordingView>
        </NewRecord>
    )
}

export default NewRecording;