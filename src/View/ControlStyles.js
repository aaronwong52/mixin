import styled from 'styled-components';

export const ControlView = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  width: 350px;
  margin-top: 40px;
  border-radius: 10px;
  background-color: #1e2126;
  box shadow: 0 0 3px #e6f0ff;
`;  

export const PlayButton = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  padding: 0;
  background: ${props => props.playState
    ? "url('/images/pause_white.png') center;" 
    : "url('/images/play_white.png') center;"
  }
  background-size: 30px;
  -webkit-tap-highlight-color: transparent;
  :hover {cursor: pointer;}
`;

export const RestartButton = styled(PlayButton)`
  background: url('/images/restart_white.png') center;
`;

export const MuteButton = styled(PlayButton)`
  background: ${props => props.mute 
    ? "url('/images/mute_white.png') center;"
    : "url('/images/unmute_white.png') center/99%;"
  }
`;

export const ClockArea = styled.div`
  display: flex;
  justify-content: center;
  width: 100px;
  height: 35px;
  background-color: #465261;
  border-radius: 10px;
`;