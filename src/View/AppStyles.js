import styled from 'styled-components';

export const View = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column; 
  justify-content: flex-start;
  align-items: center;
  background: linear-gradient(to right, #1e2126, #282f38 50%, #1e2126);
`;

export const TopView = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-evenly;

  padding: 25px 25px;
  border-radius: 10px;
`;

export const MixologyMenu = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  color: #ced4de;
  margin-left: 25px;
`;

export const MenuLabels = styled.div`
`;

export const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 0px;
`;

export const MenuOption = styled.h3`
  font-size: 18px;
  margin: 35px 0px;
  :hover {cursor: pointer; color: white;}
`;

export const MiddleView = styled.div`
  box-shadow: ${props => props.dropping
    ? "0 0 12px #ebeff5"
    : "none"
  };
`
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