import styled from 'styled-components';

export const TransportView = styled.div`
  overflow: scroll;
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

export const Channel = styled.div`
  display: flex;
  position: relative;
  width: 2075px;
  min-height: 100px;

  background-size: 25px 25px;
  background-image:
  linear-gradient(to right, rgba(206, 212, 222, 0.1) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(206, 212, 222, 0.1) 1px, transparent 1px);
`;

export const ChannelView = styled.div`
  overflow: scroll;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const RecordingsView = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  background-origin: padding-box;
  background-clip: padding-box;
  width: 2050px;
  height: 80px;
  background-color: rgba(40, 47, 56, 0.5);  
`;

export const RecordingView = styled.div`
    width: 100px;
    height: 80px;
    background-color: rgba(15, 40, 77, 0.6);
    border: none;
    border-radius: 4px;
    :hover {cursor: pointer;}
`;

export const TransportTimeline = styled.div`
  display: flex;
  width: 2075px;
  position: relative;
`

export const TimelinePadding = styled.div`
  position: sticky;
  left: 0;
  height: 50px;
  min-width: 100px;
  background-color: #282f38;
  border-radius: 0px 0px 0px 8px;
  z-index: 10;
`;

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #282f38;
  z-index: 0;
`;

