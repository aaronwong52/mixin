import styled from 'styled-components';

export const Editor = styled.div`
    position: relative;
    height: 200px;
    margin-bottom: 40px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    align-self: center;
    box-shadow: 0 0 3px #818a99;
    z-index: 99;
`;

export const ControlView = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    width: 40px;
    height: 200px;
    margin: 0px 5px;
    box-shadow: 0px 0 3px #818a99;
    clip-path: inset(0px 0px -3px 0px);
`;

export const Crop = styled.button`
    background: url('/images/crop.png') no-repeat;
    width: 30px;
    height: 30px;
    box-sizing: content-box;
    padding: 2px;
    background-size: 30px;
    background-position: center;
    border: none;
    border-radius: 8px;
    background-color: ${props => props.cropping ? '#525252' : 'transparent'};
    :hover {
        cursor: pointer;
        background-color: #525252;
    }
    -webkit-tap-highlight-color: transparent;
`;

export const Split = styled(Crop)`
    background: url('/images/scissors.png') no-repeat;
    background-position: center;
    border-radius: 8px;
    background-color: ${props => props.splitting ? '#525252' : 'transparent'};
`;

export const ClipMute = styled(Crop)`
    background: ${props => props.muted 
        ? "url('/images/mute_white.png') no-repeat;"
        : "url('/images/unmute_white.png') no-repeat;"
    };
    background-position: center;
`;

export const ClipSolo = styled(ClipMute)`
    background: none;
    font-size: 30px;
    border-radius: 8px;
    line-height: 30px;
    color: ${props => props.solo ? '#3c5e91' : '#d1d5de'};
`;

export const EditorWaveform = styled.div`
    position: relative;
    width: 650px;
    height: 200px;
    box-shadow: 0px 0 2px #818a99;
`;