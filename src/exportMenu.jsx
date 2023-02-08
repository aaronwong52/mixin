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
    visibility: ${props => props.display ? 'visible' : 'hidden'};
    position: absolute;
    top: 200px;
    left: 50px;
    height: 350px;
    width: 275px;
    border-radius: 10px;
    background: linear-gradient(to bottom, #282f38, #262d36);
    animation: 0.2s ${props => props.display ? fadeIn : fadeOut} linear;
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
    justify-content: space-between;
    align-items: center;
    width: 90%;
`;

const FileTypeButton = styled.button`
    font-family: Avenir, Arial, sans-serif;
    width: 60px;
    height: 30px;
    background-color: #ced4de;
    border-radius: 6px;
    border: none;
    font-weight: bold;
    :hover {cursor: pointer;}
`;

const ExportRangeInput = styled.input`
    height: 30px;
    background-color: #ced4de;
    border-radius: 2px;
    border: none;
    text-indent: 5px;
`;

const ExportButton = styled(FileTypeButton)`
    height: 30px;
    width: 100px;
    font-size: 18px;
    font-weight: normal;
    align-self: center;
`;

function ExportMenu({displayState}) {

    return (
        <ExportMenuView display={displayState}>
            <ExportMenuOptions>
                <ExportMenuOption>
                    <h3>Format</h3>
                    <FileTypeButton>WAV</FileTypeButton>
                    <FileTypeButton>MP3</FileTypeButton>
                </ExportMenuOption>
                <ExportMenuOption>
                    <h3>Start:</h3>
                    <ExportRangeInput></ExportRangeInput>
                </ExportMenuOption>
                <ExportMenuOption>
                    <h3>End:</h3>
                    <ExportRangeInput></ExportRangeInput>
                </ExportMenuOption>
                <ExportButton>BOUNCE</ExportButton>
            </ExportMenuOptions>
        </ExportMenuView>
    )
}

export default ExportMenu;