import styled from 'styled-components';

export const RecordView = styled.div`
    height: 250px;
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #1f324d;

    @media only screen and (max-width: 768px) {
        height: 200px;
        width: 300px;
    }
    border-radius: 10px;
`;

export const RecordButton = styled.button`
  width: 30px;
  height: 30px;
  background-color: transparent;
  border: none;
  background: ${props => props.recording
        ? "url('/images/stop.png') no-repeat;"
        : "url('/images/record_muted.png') no-repeat;"
  };
  background-size: 30px;
  margin: 8px 0px;
  :hover {
        cursor: pointer;
        box-shadow: 0 0 8px red;
        border-radius: 50%;
    }
`;