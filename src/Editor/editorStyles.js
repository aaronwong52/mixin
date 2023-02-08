import styled from 'styled-components';

export const Editor = styled.div`
    width: 100vw;
    height: 175px;
    margin-bottom: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const ControlView = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    width: 50px;
    height: 175px;
`;

export const ClipMute = styled.button`
    background: ${props => props.muted 
        ? "url('/images/mute_white.png') no-repeat;"
        : "url('/images/unmute_white.png') no-repeat;"
    };
    width: 25px;
    height: 25px;
    padding: 0;
    background-color: transparent;
    background-size: 25px;
    border: none;
    :hover {cursor: pointer;}
    -webkit-tap-highlight-color: transparent;
`;

export const ClipSolo = styled(ClipMute)`
    background: none;
    font-size: 26px;
    font-weight: bold;
    color: ${props => props.solo
        ? "#3c5e91"
        : "#d1d5de"
    };
`;

export const EditorWaveform = styled.div`
    height: 175px;
    border: 1px solid black;
    border-radius: 4px;
    box-shadow: 0 0 3px #727a87;
`;