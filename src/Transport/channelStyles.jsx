import styled from 'styled-components';
import { AppTheme } from '../View/Themes';

export const ChannelHeader = styled.div`
    position: sticky;
    left: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${AppTheme.ChannelColor};
    border: ${props => props.selected 
        ? `1px solid ${AppTheme.ChannelHighlight}` 
        : `1px solid ${AppTheme.AppSecondaryColor}`
    };
    width: 100px;
    height: 100px;
    z-index: 3;
`

export const ChannelName = styled.h3`
    text-align: center;
    width: 75%;
    color: ${AppTheme.AppTextColor};
    font-size: 1rem;
`;

export const ChannelNameInput = styled.input`
    color: #ced4de;
    font-size: 1rem;
    font-weight: bold;
    width: 75%;
    background-color: ${AppTheme.AppSecondaryColor};
    border: none;
    border-radius: 2px;

    ::placeholder,
    ::-webkit-input-placeholder {
        color: ${AppTheme.AppTextColor};
    }
    :-ms-input-placeholder {
        color:  ${AppTheme.AppTextColor};
    }
`;

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
    background-color: ${props => props.selected 
        ? AppTheme.RecordingColor
        : AppTheme.SelectedRecordingColor
    };
    border: none;
    border-radius: 4px;
    :hover {cursor: pointer;}
    z-index: 91920;
`;