import styled from 'styled-components';

// https://stackoverflow.com/questions/22955465/overflow-y-scroll-is-hiding-overflowing-elements-on-the-horizontal-line
export const SpanWrap = styled.span`
  position: relative;
  display: block;
`;

export const TransportView = styled.div`
  overflow-x: scroll;
  overflow-y: visible;
  width: 92vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  border-radius: 8px;
  margin-left: 5vw;
  background-color: #282f38;
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TransportTimeline = styled.div`
  position: relative;
  display: flex;
  width: 2075px;
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
  background-color: #282f38;
  border-radius: 0px 0px 0px 8px;
`;

export const Timeline = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #282f38;
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

export const SnapView = styled.div`
  position: absolute;
  right: 10px;
  top: -60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 75px;
  color: white;
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

