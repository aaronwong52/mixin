import { useState } from 'react';

import * as Tone from 'tone';
import styled from 'styled-components';

const NewRecord = styled.div`
    width: 100vw;
    height: 50px;
`;

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function NewRecording({newRecording, setPlayPosition}) {
    console.log(newRecording.size);
    
    return (
        <div className={Math.random() * 1000} width={newRecording.size / 150}></div>
    )
}


export default NewRecording;