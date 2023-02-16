import styled from 'styled-components';

export const Editor = styled.div`
    height: 175px;
    margin-bottom: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const ControlView = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 50px;
    height: 175px;
`;

export const Crop = styled.button`
    background: ${props => props.started
        ? "url('/images/checkmark.png') no-repeat;"
        : "url('/images/crop.png') no-repeat;"
    };
    width: 30px;
    height: 30px;
    padding: 0;
    background-color: transparent;
    background-size: 30px;
    border: none;
    :hover {cursor: pointer;}
    -webkit-tap-highlight-color: transparent;
`;

export const ClipMute = styled(Crop)`
    background: ${props => props.muted 
        ? "url('/images/mute_white.png') no-repeat;"
        : "url('/images/unmute_white.png') no-repeat;"
    };
`;

export const ClipSolo = styled(ClipMute)`
    background: none;
    font-size: 30px;
    font-weight: bold;
    color: ${props => props.solo
        ? "#3c5e91"
        : "#d1d5de"
    };
`;

export const EditorWaveform = styled.div`
    position: relative;
    height: 175px;
    border-radius: 4px;
    box-shadow: 0 0 3px #727a87;
`;