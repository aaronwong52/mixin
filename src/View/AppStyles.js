import styled from 'styled-components';

export const View = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column; 
  justify-content: flex-start;
  align-items: center;
  background: linear-gradient(to right, #1e2126, #1c2026 50%, #1e2126);
`;

export const TopView = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 95vw;
  margin: 30px 0px;
  color: #d8e0ed;
`;

export const SettingsIcon = styled.button`
  width: 30px;
  height: 30px;
  background-color: transparent;
  background: url('/images/settings.png') no-repeat;
  background-size: 30px;
  border: none;
  border-radius: 50px;
  :hover {cursor: pointer; box-shadow: 0 0 4px 1px grey;}
`;

export const Title = styled.h2`
  font-size: 36px;
  margin: 10px 30px;
  letter-spacing: .1rem;
`;

export const MenuLabels = styled.div`
`;

export const MenuOption = styled.h3`
  font-size: 18px;
  width: fit-content;
  margin: 35px 10px;
  :hover {cursor: pointer; color: white;}
`;

export const MiddleView = styled.div`
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  box-shadow: ${props => props.dropping
    ? "0 0 6px #ebeff5"
    : "none"
  };  
`;

export const ControlView = styled.div`
  position: fixed;
  bottom: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  width: 400px;
  border-radius: 10px;
  background-color: #282f38;
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
  height: 35px;
  border-radius: 10px;
  border: 1px solid rgba(97, 96, 96, 0.8);
`;