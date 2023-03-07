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

export const SettingsView = styled.div`
    visibility: ${props => props.displayState ? 'visible' : 'hidden'};
    position: absolute;
    right: 0;
    width: 15%;
    height: 40vh;
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

export const SettingsOptions = styled.span`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin: 5% 0%;
`;

export const SettingsOption = styled(AppTheme.DefaultButton)`
    background-color: transparent;
    margin-bottom: 20%;
    color: ${AppTheme.AppTextOffColor};
    font-size: 1rem;
`;

export const OptionView = styled.span`
`;

export const OptionHeader = styled.span`
    display: flex;
    align-items: center;
    height: 15%;
    margin-bottom: 4%;
`;

export const OptionTitle = styled.h3`
    color: ${AppTheme.AppTextOffColor};
    font-size: 1rem;
    margin: 0;
`;

export const OptionBack = styled(AppTheme.DefaultButton)`
    width: 20%;
    height: 2.1rem;
    background: url('/images/arrow_left.png') no-repeat;
`;