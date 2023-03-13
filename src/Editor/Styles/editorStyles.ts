import styled from 'styled-components';
import { AppTheme } from '../../View/Themes';

interface MuteProp { muted: boolean; }
interface SoloProp { solo: boolean; }
export interface CropProp { cropping: boolean; }
export interface SplitProp { splitting: boolean; }

export const Editor = styled.div`
	position: relative;
	height: 25%;
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

export const Crop = styled(AppTheme.EditorButton)`
	background: ${(props: CropProp) => props.cropping 
        ? "url('images/checkmark.png') no-repeat"
        : "url('images/crop.png') no-repeat"
    };
	
	background-color: ${props => props.cropping ? AppTheme.EditorButtonHighlight : 'transparent'};
`;

export const Split = styled(AppTheme.EditorButton)`
	background: url('images/scissors.png') no-repeat;
	background-color: ${(props: SplitProp) => props.splitting ? AppTheme.EditorButtonHighlight : 'transparent'};
`;

export const ClipMute = styled(AppTheme.EditorButton)`
	background: ${(props: MuteProp) => props.muted 
		? "url('images/mute_white.png') no-repeat;"
		: "url('images/unmute_white.png') no-repeat;"
	};
	background-position: center;
`;

export const ClipSolo = styled(AppTheme.EditorButton)`
	background: none;
	font-size: 30px;
	line-height: 30px;
	color: ${(props: SoloProp) => props.solo ? AppTheme.ContrastBlue : AppTheme.AppTextColor};
`;

export const EditorWaveform = styled.div`
	position: relative;
	height: 100%;
    flex-grow: 1;
	box-shadow: 0px 0 2px #818a99;
`;