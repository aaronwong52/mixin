import styled from 'styled-components';

export const ChannelHeader = styled.div`
    position: sticky;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #142c4f;
    border-radius: 8px 0px 0px 0px;
    min-width: 100px;
    height: 100px;
    z-index: 3;
`

export const ChannelName = styled.h3`
    text-align: center;
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