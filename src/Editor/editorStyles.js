import styled from 'styled-components';

export const Editor = styled.div`
    width: 55%;
    height: 175px;
    margin-bottom: 40px;
    display: flex;
    visibility: ${props => props.loaded > 0 ? 'visible' : 'hidden'};
    justify-content: flex-start;
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
    background: url('/images/crop.png') no-repeat;
    width: 30px;
    height: 30px;
    box-sizing: content-box;
    padding: 2px;
    background-color: transparent;
    background-size: 30px;
    background-position: center;
    border: none;
    border-radius: 8px;
    box-shadow: ${props => props.cropping ? '0 0 3px 1px #d1d5de' : 'none'};
    :hover {cursor: pointer;}
    -webkit-tap-highlight-color: transparent;
`;

export const Split = styled(Crop)`
    background: url('/images/scissors.png') no-repeat;
    background-position: center;
    border-radius: 8px;
    box-shadow: ${props => props.splitting ? '0 0 4px 1px #d1d5de' : 'none'};
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
    border-radius: 8px;
    line-height: 30px;
    color: ${props => props.solo ? '#3c5e91' : '#d1d5de'};
`;

export const EditorWaveform = styled.div`
    position: relative;
    height: 175px;
    border-radius: 4px;
    box-shadow: 0 0 3px #727a87;
`;