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

export const ExportMenuView = styled.div`
    visibility: ${props => props.displayState ? 'visible' : 'hidden'};
    position: absolute;
    top: calc(12vh + 15px);
    height: 350px;
    width: 275px;
    border-radius: 6px;
    background: linear-gradient(to bottom, #282f38, #262d36);
    animation: 0.1s ${props => props.displayState ? fadeIn : fadeOut} linear;
    transition: visibility 0.1s linear;
    border: none;
    box-shadow: 0 0 2px #1e2126;
    margin-left: 10px;
    padding: 10px 25px;
    z-index: 99999;
`;

export const ExportMenuOptions = styled.section`
    position: relative;
    height: 95%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #ced4de;
    font-size: 13px;
`;

export const ExportMenuOption = styled.div`
    display: flex;
    align-items: center;
    width: 90%;
`;

export const FileTypeButton = styled.button`
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

export const ExportRangeInput = styled.input`
    height: 30px;
    width: 100px;
    margin-left: 25px;
    background-color: #ced4de;
    border-radius: 4px;
    border: none;
    font-family: Avenir, Arial, sans-serif;
    text-indent: 5px;
`;

export const ExportButton = styled(FileTypeButton)`
    height: 30px;
    width: 100px;
    font-size: 16px;
    align-self: center;
    background-color: #d7dae0;
`;