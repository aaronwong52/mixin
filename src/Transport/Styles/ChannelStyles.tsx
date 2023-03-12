import styled from 'styled-components';

import { AppTheme } from '../../View/Themes';
import { CHANNEL_SIZE } from '../../utils/constants';

export const ChannelHeader = styled.div`
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
    align-self: flex-start;
	background-color: ${AppTheme.ChannelColor};
	border: ${(props: any) => props.selected 
		? `1px solid ${AppTheme.ChannelHighlight}` 
		: `1px solid ${AppTheme.AppSecondaryColor}`
	};
	width: ${CHANNEL_SIZE}px;
	height: ${CHANNEL_SIZE}px;
	z-index: 3;
`

export const ChannelName = styled.h3`
	text-align: center;
	width: 75%;
	color: ${AppTheme.AppTextColor};
	font-size: 1rem;
`;

export const ChannelNameInput = styled.input`
	color: ${AppTheme.AppTextColor};
	font-size: 1rem;
	font-weight: bold;
	width: 75%;
	background-color: ${AppTheme.AppSecondaryColor};
	border: none;
	border-radius: 2px;

	::placeholder,
	::-webkit-input-placeholder {
		color: ${AppTheme.AppTextColor};
	}
	:-ms-input-placeholder {
		color:  ${AppTheme.AppTextColor};
	}
`;

export const RecordingView = styled.div`
	height: ${CHANNEL_SIZE}px;
	padding: 5px 0px;
	box-sizing: border-box;
	background-color: ${(props: any) => props.selected 
		? AppTheme.SelectedRecordingColor
		: AppTheme.RecordingColor
	};
	background-clip: content-box;
	border: none;
	border-radius: 4px;
	:hover {cursor: pointer;}
`;