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

    EditorButton: styled.button`
        all: unset;
        border: none;

        width: 30px;
	    height: 30px;
        box-sizing: content-box;

        background-size: 30px;
        background-position: center;
        border-radius: 8px;
        text-align: center;

        -webkit-tap-highlight-color: transparent;

        :hover {
            cursor: pointer;
            box-shadow: 0 0 2px 1px grey;
        }
    `
}