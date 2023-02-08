import styled from 'styled-components';

export const TransportView = styled.div`
  width: 100vw;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #1e2126;
`;

export const TransportTimeline = styled.div`
  overflow: scroll;
  display: flex;
  flex-direction: column;
  width: 95vw;
  padding-bottom: 5px;
  background-color: #bed2ed;
  border-radius: 4px;
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const RecordingsView = styled.div`
  position: relative;
  display: flex;
  margin-left: 10px;
  background-color: #1f324d;
  z-index: 999;
`;

export const RecordingView = styled.div`
    position: absolute;
    width: 100px;
    height: 85px;
    margin-top: 10px;
    background-color: #1f324d;
    border: none;
    border-radius: 4px;
    opacity: 0.75;
    :hover {cursor: pointer;}
    z-index: 999;
`;