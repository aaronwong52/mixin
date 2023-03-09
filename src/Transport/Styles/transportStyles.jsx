import styled from 'styled-components';
import { AppTheme } from '../../View/Themes';
import { TIMELINE_HEIGHT, CHANNEL_SIZE } from '../../utils/constants';

// https://stackoverflow.com/questions/22955465/overflow-y-scroll-is-hiding-overflowing-elements-on-the-horizontal-line
export const SpanWrap = styled.span`
    position: relative;
    display: block;
    width: 92vw;
    height: 45vh;
    overflow-y: scroll;
`;

export const TransportView = styled.div`
    overflow: scroll;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: ${AppTheme.AppSecondaryColor};
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }
    color: ${AppTheme.AppTextColor};
`;

export const TransportGrid = styled.div`
    display: flex;
    width: ${props => props.length + CHANNEL_SIZE}px;
    height: ${props => props.height}px;
    background-image:
        linear-gradient(to right, ${AppTheme.TransportGridColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${AppTheme.TransportGridColor} 1px, transparent 1px);
    background-size: 25px 25px;
`;

export const ChannelHeaders = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
`;

export const GridArea = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-left: ${CHANNEL_SIZE}px;
`;

export const Recordings = styled.div`
    position: relative;
    display: flex;
    height: ${props => props.height}px;
`;

export const Transport = styled.div`
    position: sticky;
    bottom: 2px;
    width: 100%;
    height: ${TIMELINE_HEIGHT}px;
`;

export const TimelinePadding = styled.div`
    position: sticky;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 0;
    height: ${TIMELINE_HEIGHT}px;
    width: ${CHANNEL_SIZE}px;
    z-index: 2;
    background-color: ${AppTheme.AppSecondaryColor};
    border-radius: 0px 0px 0px 8px;
`;

export const Timeline = styled.div`
    display: flex;
    box-sizing: border-box;
    height: ${TIMELINE_HEIGHT}px;
    width: 100%;
`;

export const AddChannelButton = styled.button`
    background: url('images/plus.png') no-repeat;
    background-size: 30px;
    width: 30px;
    height: 30px;
    border: none;
    opacity: 0.8;
    :hover {
        cursor: pointer;
        opacity: 1;
    }
`;

export const TransportSettings = styled.div`
    position: absolute;
    right: 1%;
    top: -40px;
    width: 18%;
    height: 3vh;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index; 20;
`;

export const LengthView = styled.span`
    display: flex;
    align-items: center;
    width: 60%;
    height: 60%;
    margin-right: 10%;
    font-size: 1rem;
`

export const LengthLabel = styled.label`
    margin-right: 10%;
`;

export const LengthInput = styled.input`
    background-color: ${AppTheme.AppSecondaryColor};
    font-size: 0.9rem;
    text-indent: 0.3rem;
    color: ${AppTheme.AppTextColor};
    ::placeholder {
        color: ${AppTheme.AppTextColor};
    }
    :focus::placeholder {
        color: transparent;
    }
    border: none;
    border-radius: 4px;
    width: 35%;
    height: 2rem;
    margin-right: 5px;
`;

export const SnapView = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40%;
    font-size: 1rem;
`;

export const SnapToggle = styled(AppTheme.DefaultButton)`
    width: 25px;
    height: 25px;
    background: url('images/power_white.png'); no-repeat;
    background-size: 25px;
    border-radius: 50%;
    margin-left: 10%;

    opacity: ${props => props.snapState ? '0.8' : '0.2'};
    box-shadow: ${props => props.snapState ? '0 -2.5px 12px #185cab' : 'none'};
`;

export const PlaylineView = styled.span``;

export const StyledPlayline = styled.div`
	position: absolute;
	bottom: 0px;
	width: 1px;
	padding: 0px 2px;
	background-clip: content-box;

	height: ${props => (props.height + "px")};
	background-color: red;
	opacity: 0.5;
	z-index: 9;
	:hover {cursor: col-resize;}
`;
