import styled from 'styled-components';
import { AppTheme } from '../Themes';

export const View = styled.div`
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	background: linear-gradient(
		to right, ${AppTheme.AppColor}, ${AppTheme.AppGradient} 50%, ${AppTheme.AppColor}
	);
`;

export const TopView = styled.div`
	position: relative;
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 95%;
`;

export const Settings = styled.div`
`;

export const SettingsIcon = styled(AppTheme.DefaultButton)`
	width: 25px;
	height: 25px;
	background: url('images/arrow_down.png') no-repeat;
	background-size: 25px;
	border-radius: 50px;
	:hover {box-shadow: 0 0 4px 1px grey;}
`;

export const Title = styled.h2`
	font-size: 1.9rem;
	font-weight: normal;
	color: ${AppTheme.AppTextColor};
	margin: 10px 30px;
	letter-spacing: .1rem;
`;

export const MiddleView = styled.div`
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
	display: flex;
    position: relative;
	justify-content: space-around;
	align-items: center;
	height: 5vh;
	width: 25%;
    margin: 20px 0px;
	border-radius: 10px;
	background-color: ${AppTheme.AppSecondaryColor};
	box-shadow: 0 0 0 2px ${AppTheme.AppSecondaryGradient};
`;

export const PlayButton = styled(AppTheme.DefaultButton)`
	width: 30px;
	height: 30px;
	background: ${props => props.playState
		? "url('images/pause_white.png') center;" 
		: "url('images/play_white.png') center;"
	}
	background-size: 30px;
	-webkit-tap-highlight-color: transparent;
`;

export const RestartButton = styled(PlayButton)`
	background: url('images/restart_white.png') center;
`;

export const MuteButton = styled(PlayButton)`
  	background: ${props => props.mute 
		? "url('images/mute_white.png') center;"
		: "url('images/unmute_white.png') center"
	}
`;

export const ClockArea = styled.div`
    position: relative;
	display: flex;
    width: 25%;
	height: 100%;
	border-radius: 10px;
	border: 1px solid ${AppTheme.AppSecondaryGradient};
`;