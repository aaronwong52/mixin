import styled, { keyframes } from 'styled-components';
import { AppTheme } from '../../View/Themes';

const fadeIn = keyframes`
    0% { opacity: 0; }
    100% { opacity: 1; }
`;

const fadeOut = keyframes`
    0% { opacity: 1; }
    100% { opacity: 0; }
`;

export const CenteredHeader = styled.h2`
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
`;

export const SettingsView = styled.div`
    visibility: ${props => props.displayState ? 'visible' : 'hidden'};
    position: absolute;
    right: 0;
    width: 20%;
    height: 45vh;
    border-radius: 6px;
    background: linear-gradient(to bottom, ${AppTheme.AppSecondaryColor}, ${AppTheme.AppSecondaryGradient});
    animation: 0.05s ${props => props.displayState ? fadeIn : fadeOut} linear;
    transition: visibility 0.05s linear;
    border: none;
    box-shadow: 0 0 0 2px #424242;
    margin-top: 10px;
    padding: 10px 25px;
    z-index: 4;
`;

export const ExportMenu = styled.section`
    position: relative;
    height: 95%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: ${AppTheme.AppTextColor};
    font-size: 0.8rem;
    font-weight: normal;
`;

export const ExportMenuOption = styled.div`
    display: flex;
    align-items: center;
    margin-left: 1rem;
    font-size: 0.9rem;
    width: 90%;
`;

export const FileTypeButton = styled(AppTheme.DefaultButton)`
    width: 25%;
    height: 30px;
    margin-left: 25px;
    background-color: ${props => props.fileFormat ? AppTheme.ContrastBlue : AppTheme.AppTextOffColor};
    color: ${props => props.fileFormat ? AppTheme.AppTextColor : 'black'};
`;

export const ExportRangeText = styled.h3`
    width: 22%;
`;

export const ExportRangeInput = styled.input`
    height: 30px;
    width: 20%;
    margin-left: 10%;
    margin-right: 2%;
    background-color: ${AppTheme.AppTextOffColor};
    border-radius: 4px;
    border: none;
    font-family: Avenir, Arial, sans-serif;
    text-indent: 0.3rem;
`;

export const ExportButton = styled(AppTheme.DefaultButton)`
    height: 30px;
    width: 30%;
    font-size: 1rem;
    align-self: flex-start;
    color: black;
    background-color: ${AppTheme.AppTextColor};
`;