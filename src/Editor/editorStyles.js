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
    justify-content: space-between;
    align-items: center;
    width: 50px;
    height: 175px;
    margin-right: 10px;
`;

export const Crop = styled.button`
    background: ${props => props.started
        ? "url('/images/checkmark.png') no-repeat;"
        : "url('/images/crop.png') no-repeat;"
    };
    width: 35px;
    height: 35px;
    padding: 0;
    background-color: transparent;
    background-size: 35px;
    border: none;
    :hover {cursor: pointer;}
    -webkit-tap-highlight-color: transparent;
`;

export const Split = styled(Crop)`
    background: ${props => props.started
        ? "url('/images/checkmark.png') no-repeat;"
        : "url('/images/scissors.png') no-repeat;"
    };
`;

export const ClipMute = styled(Crop)`
    background: ${props => props.muted 
        ? "url('/images/mute_white.png') no-repeat;"
        : "url('/images/unmute_white.png') no-repeat;"
    };
`;

export const ClipSolo = styled(ClipMute)`
    background: none;
    font-size: 35px;
    font-weight: bold;
    text-align: center;
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