import styled from "styled-components";

export const AppTheme = {
    AppColor: '#1e2126',
    AppSecondaryColor: '#282f38',
    AppGradient: '#1c2026',
    AppSecondaryGradient: '#2f3640',
    AppTextColor: '#ebedef',
    AppTextOffColor: '#d8e0ed',

    TransportGridColor: 'rgba(206, 212, 222, 0.1)',

    ChannelColor: '#142c4f',
    ChannelHighlight: 'rgba(69, 153, 69, 0.7)',

    RecordingColor: 'rgba(1, 48, 117, 0.6)',
    SelectedRecordingColor: 'rgba(29, 75, 143, 0.6)',

    EditorButtonHighlight: '#363636',
    EditorBoxHighlight: '#818a99',
    ContrastBlue: '#4f77b3',

    DefaultButton: styled.button`
        all: unset;
        text-align: center;
        border: none;
        border-radius: 6px;
        font-family: Avenir, Arial, sans-serif;
        :hover {cursor: pointer;}
    `,
}