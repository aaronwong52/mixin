import styled from 'styled-components';

export const ChannelHeader = styled.div`
    position: sticky;
    left: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #142c4f;
    border: ${props => props.selected ? '1px solid rgba(69, 153, 69, 0.7)' : '1px solid #3d3d3d'};
    width: 100px;
    height: 100px;
    z-index: 3;
`

export const ChannelName = styled.h3`
    text-align: center;
    width: 75px;
    color: #ced4de;
    font-size: 18px;
`;

export const ChannelNameInput = styled.input`
    color: #ced4de;
    font-size: 18px;
    font-weight: bold;
    width: 75px;
    background-color: #474e59;
    border: none;
    border-radius: 2px;

    ::placeholder,
    ::-webkit-input-placeholder {
        color: #ced4de;
    }
    :-ms-input-placeholder {
        color: #ced4de;
    }
`;

export const Channel = styled.div`
  display: flex;
  position: relative;
  width: ${props => props.length}px;
  border: ${props => props.selected ? '1px solid rgba(69, 153, 69, 0.7)' : '1px solid transparent'};
  min-height: 100px;
  
  
`;

// export const ChannelView = styled.div`
//   overflow: scroll;
//   display: flex;
//   justify-content: flex-start;
//   align-items: center;
// `;

export const RecordingsView = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  background-origin: padding-box;
  background-clip: padding-box;
  width: ${props => props.length}px;
  height: 80px;
  background-color: rgba(40, 47, 56, 0.5);  
`;

export const RecordingView = styled.div`
    position: absolute;
    width: 100px;
    height: 80px;
    background-color: ${props => props.selected ? 'rgba(29, 75, 143, 0.6)' : 'rgba(15, 40, 77, 0.6)'};
    border: none;
    border-radius: 4px;
    :hover {cursor: pointer;}
    z-index: 91920;
`;