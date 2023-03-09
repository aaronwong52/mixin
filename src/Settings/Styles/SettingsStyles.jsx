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
    border-radius: 6px;
    background: linear-gradient(to bottom, ${AppTheme.AppSecondaryColor}, ${AppTheme.AppSecondaryGradient});
    animation: 0.05s ${props => props.displayState ? fadeIn : fadeOut} linear;
    transition: visibility 0.05s linear;
    border: none;
    box-shadow: 0 0 0 2px #424242;
    z-index: 4;
`;

export const SettingsOptions = styled.span`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-start;
    width: 15vw;
    margin: 5% 10%;
`;

export const SettingsOption = styled(AppTheme.DefaultButton)`
    background-color: transparent;
    color: ${AppTheme.AppTextOffColor};
    font-size: 1rem;
    height: 8vh;
`;

export const OptionView = styled.div`
    margin: 5% 5%;
    width: 18vw;
`;

export const OptionHeader = styled.span`
    display: flex;
    align-items: center;
    height: 15%;
    margin: 4% 0;
`;

export const OptionTitle = styled.h3`
    color: ${AppTheme.AppTextOffColor};
    font-size: 1.2rem;
    margin: 0;
`;

export const OptionBack = styled(AppTheme.DefaultButton)`
    width: 16%;
    height: 2.3rem;
    background: url('images/arrow_left.png') no-repeat;
`;