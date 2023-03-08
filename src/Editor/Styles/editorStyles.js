import styled from 'styled-components';
import { EDITOR_WIDTH } from '../../utils/constants';
import { AppTheme } from '../../View/Themes';

export const Editor = styled.div`
	position: relative;
	height: 25vh;
    width: 45%;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	align-self: center;
	box-shadow: 0 0 3px ${AppTheme.EditorBoxHighlight};
	z-index: 3;
`;

export const ControlView = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
    box-sizing: border-box;
	width: 6%;
	height: 100%;
	margin: 0px 5px;
	box-shadow: 0px 0 3px ${AppTheme.EditorBoxHighlight};
	clip-path: inset(0px 0px -3px 0px);
`;

export const Crop = styled.button`
	background: ${props => props.cropping 
        ? "url('/images/checkmark.png') no-repeat"
        : "url('/images/crop.png') no-repeat"
    };
	width: 30px;
	height: 30px;
	box-sizing: content-box;
	padding: 2px;
	background-size: 30px;
	background-position: center;
	border: none;
	border-radius: 8px;
	background-color: ${props => props.cropping ? AppTheme.EditorButtonHighlight : 'transparent'};
	:hover {
		cursor: pointer;
        box-shadow: 0 0 2px 1px grey;
	}
	-webkit-tap-highlight-color: transparent;
`;

export const Split = styled(Crop)`
	background: url('/images/scissors.png') no-repeat;
	background-position: center;
	border-radius: 8px;
	background-color: ${props => props.splitting ? AppTheme.EditorButtonHighlight : 'transparent'};
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
	color: ${props => props.solo ? AppTheme.ContrastBlue : AppTheme.AppTextColor};
`;

export const EditorWaveform = styled.div`
	position: relative;
	height: 100%;
    flex-grow: 1;
	box-shadow: 0px 0 2px #818a99;
`;