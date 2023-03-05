import styled from 'styled-components';
import { AppTheme } from '../View/Themes';

// https://stackoverflow.com/questions/22955465/overflow-y-scroll-is-hiding-overflowing-elements-on-the-horizontal-line
export const SpanWrap = styled.span`
  position: relative;
  display: block;
`;

export const TransportView = styled.div`
  overflow-y: hidden;
  overflow-x: scroll;
  width: 92vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  border-radius: 4px;
  margin-bottom: 100px;
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
  width: ${props => props.length}px;
  height: ${props => props.height}px;
  background-image:
    linear-gradient(to right, rgba(206, 212, 222, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(206, 212, 222, 0.1) 1px, transparent 1px);
  background-size: 25px 25px;
`;

export const ChannelHeaders = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
`;

export const Recordings = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-left: 100px;
`;

export const TransportTimeline = styled.div`
  position: absolute;
  bottom: 0;
  display: flex;
  height: 50px;
`;

export const TimelinePadding = styled.div`
  position: sticky;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  height: 50px;
  min-width: 100px;
  z-index: 99;
  background-color: ${AppTheme.AppSecondaryColor};
  border-radius: 0px 0px 0px 8px;
`;

export const Timeline = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 50px;
  z-index: 0;
`;

export const AddChannelButton = styled.button`
  background: url('/images/plus.png') no-repeat;
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
  right: 10px;
  top: -60px;
  width: 250px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

export const LengthView = styled.span`
  display: flex;
  align-items: center;
  margin-right: 25px;
`

export const LengthLabel = styled.label`
  width: 50px;
  margin-right: 10px;
`;

export const LengthInput = styled.input`
  background-color: ${AppTheme.AppSecondaryColor};
  text-indent: 5px;
  color: ${AppTheme.AppTextColor};
  ::placeholder {
    color: ${AppTheme.AppTextColor};
  }
  :focus::placeholder {
    color: transparent;
  }
  border: none;
  border-radius: 4px;
  width: 40px;
  height: 25px;
  margin-right: 5px;
`;

export const SnapView = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 75px;
  font-size: 18px;
`;

export const SnapToggle = styled.button`
  width: 25px;
  height: 25px;
  background: url('/images/power_white.png'); no-repeat;
  background-size: 25px;
  border: none;
  border-radius: 50%;

  opacity: ${props => props.snapState ? '0.8' : '0.2'};
  box-shadow: ${props => props.snapState ? '0 -2.5px 12px #185cab' : 'none'};

  :hover {
    cursor: pointer;
  }
`;

