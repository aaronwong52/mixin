import styled from 'styled-components';
import { AppTheme } from '../../View/Themes';

export const ExportMenu = styled.section`
    position: relative;
    height: 35vh;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    color: ${AppTheme.AppTextColor};
    font-size: 0.7rem;
    font-weight: normal;
`;

export const ExportMenuOption = styled.div`
    display: flex;
    align-items: center;
    font-size: 0.7rem;
    width: 80%;
    margin-left: 5%;
`;

export const FileTypeButton = styled(AppTheme.DefaultButton)`
    width: 25%;
    height: 30px;
    margin-left: 10%;
    background-color: ${props => props.fileFormat ? AppTheme.ContrastBlue : AppTheme.AppTextOffColor};
    color: ${props => props.fileFormat ? AppTheme.AppTextColor : 'black'};
`;

export const ExportRangeText = styled.h3`
    min-width: 20%;
`;

export const ExportRangeInput = styled.input`
    height: 25px;
    width: 20%;
    margin-left: 10%;
    margin-right: 2%;
    background-color: ${AppTheme.AppTextOffColor};
    border-radius: 4px;
    border: none;
    font-family: Avenir, Arial, sans-serif;
    text-indent: 0.3rem;
`;

export const ExportButton = styled(AppTheme.DefaultButton)`
    height: 30px;
    width: 30%;
    font-size: 1rem;
    align-self: flex-start;
    color: black;
    background-color: ${AppTheme.AppTextColor};
`;