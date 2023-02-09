import styled from 'styled-components';

export const ChannelHeader = styled.h3`
    width: 6vw;
  color: #ced4de;
  font-size: 18px;
`;

export const ChannelNameInput = styled.input`
    color: #ced4de;
    font-size: 18px;
    width: 6vw;
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