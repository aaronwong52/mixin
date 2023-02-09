import styled from 'styled-components';

export const TransportView = styled.div`
  width: 100vw;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  margin-right: 10vw;
  background-color: #1e2126;
`;

export const ChannelView = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  left: 0;
  border-radius: 4px 4px 0px 0px;
  box-sizing: border-box;
  width: 92vw;
  min-height: 85px;
  padding: 0px 10px;
  background-color: #282f38;
  z-index: 999;
`;

export const RecordingsView = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  box-sizing: border-box;
  width: 85vw;
  min-height: 85px;
  padding: 5px 0px;
  background-color: #282f38;
  z-index: 999;
`;

export const RecordingView = styled.div`
    width: 100px;
    height: 85px;
    background-color: #1f324d;
    border: none;
    border-radius: 4px;
    opacity: 0.75;
    :hover {cursor: pointer;}
    z-index: 999;
`;

export const TransportTimeline = styled.div`
  overflow: scroll;
  display: flex;
  flex-direction: column;
  width: 92vw;
  box-sizing: border-box;
  border-radius: 0px 0px 4px 4px;
  padding-left: 6vw;
  background-color: #ced4de;
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;