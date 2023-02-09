import styled from 'styled-components';

export const TransportView = styled.div`
  overflow: scroll;
  width: 92vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  border-radius: 4px;
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
  width: 2075px;
  min-height: 85px;
`;

export const ChannelView = styled.div`
  overflow: scroll;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  min-height: 85px;

`;

export const RecordingsView = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  box-sizing: border-box;
  background-origin: padding-box;
  background-clip: padding-box;
  width: 2050px;
  min-height: 85px;
  margin-left: 6vw;
  padding: 0px 10px;
  background-color: #282f38;
  background-size: 25px 25px;
  background-image:
  linear-gradient(to right, rgba(169, 169, 169, 0.15) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(169, 169, 169, 0.15) 1px, transparent 1px);
`;

export const RecordingView = styled.div`
    width: 100px;
    height: 85px;
    background-color: #0f284d;
    border: none;
    border-radius: 4px;
    :hover {cursor: pointer;}

`;

export const TransportTimeline = styled.div`
  display: flex;
`

export const TimelinePadding = styled.div`
  position: fixed;
  height: 50px;
  width: 6vw;
  background-color: #282f38;
  z-index: 9999;
  border-radius: 4px;

`;

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 6vw;
  box-sizing: border-box;
  background-color: #282f38;
`;

