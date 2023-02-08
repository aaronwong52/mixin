import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1
    }
`;

const fadeOut = keyframes`
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
`;

const ExportMenuView = styled.div`
    visibility: ${props => props.displayState ? 'visible' : 'hidden'};
    position: absolute;
    top: 200px;
    left: 50px;
    height: 350px;
    width: 275px;
    border-radius: 10px;
    background: linear-gradient(to bottom, #282f38, #262d36);
    animation: 0.2s ${props => props.displayState ? fadeIn : fadeOut} linear;
    transition: visibility 0.2s linear;
    border: none;
    box-shadow: 0 0 2px #1e2126;
    padding: 10px 25px;
`;

const ExportMenuOptions = styled.section`
    position: relative;
    height: 95%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #ced4de;
    font-size: 13px;
`;

const ExportMenuOption = styled.div`
    display: flex;
    align-items: center;
    width: 90%;
`;

const FileTypeButton = styled.button`
    width: 60px;
    height: 30px;
    margin-left: 25px;
    background-color: ${props => props.fileFormat ? '#33527d' : '#ced4de'};
    color: ${props => props.fileFormat ? '#ebedef' : 'black'};
    border-radius: 6px;
    border: none;
    font-family: Avenir, Arial, sans-serif;
    :hover {cursor: pointer;}
`;

const ExportRangeInput = styled.input`
    height: 30px;
    width: 100px;
    margin-left: 25px;
    background-color: #ced4de;
    border-radius: 4px;
    border: none;
    font-family: Avenir, Arial, sans-serif;
    text-indent: 5px;
`;

const ExportButton = styled(FileTypeButton)`
    height: 30px;
    width: 100px;
    font-size: 16px;
    align-self: center;
    background-color: #d7dae0;
`;

function ExportMenu({displayState}) {

    const [fileFormat, setFileFormat] = useState('');

    const onFormatClick = (format) => {
        setFileFormat(format);
    }
    
    const onBounceClick = () => {
        
        // ranges: [start, end]
        let ranges = document.getElementsByClassName("export_range_input");
    }

    return (
        <ExportMenuView displayState={displayState}>
            <ExportMenuOptions>
                <ExportMenuOption>
                    <h3>Format:</h3>
                    <FileTypeButton 
                        fileFormat={fileFormat == 'wav'}
                        onClick={() => onFormatClick("wav")}>WAV
                    </FileTypeButton>
                    <FileTypeButton 
                        fileFormat={fileFormat == 'mp3'}
                        onClick={() => onFormatClick("mp3")}>MP3</FileTypeButton>
                </ExportMenuOption>
                <ExportMenuOption>
                    <h3>Start:</h3>
                    <ExportRangeInput className="export_range_input"></ExportRangeInput>
                </ExportMenuOption>
                <ExportMenuOption>
                    <h3>End:</h3>
                    <ExportRangeInput className="export_range_input"></ExportRangeInput>
                </ExportMenuOption>
                <ExportButton onClick={onBounceClick}>Bounce</ExportButton>
            </ExportMenuOptions>
        </ExportMenuView>
    )
}

export default ExportMenu;