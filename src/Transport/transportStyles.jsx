import styled from 'styled-components';

export const TransportView = styled.div`
  position: relative;
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
  z-index: 1;
`;

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #282f38;
  z-index: 0;
`;

export const AddChannelButton = styled.button`
  position: absolute;
  bottom: 10px;
  left: calc(100px - 50px - 15px);
  background: url('/images/plus.png'); no-repeat;
  background-size: 30px;
  width: 30px;
  height: 30px;
  border: none;
  opacity: 0.8;
  z-index: 2;
  :hover {
    cursor: pointer;
    opacity: 1;
  }
`;


