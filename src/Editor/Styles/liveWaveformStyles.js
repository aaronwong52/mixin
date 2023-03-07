import styled from 'styled-components';
import { AppTheme } from '../../View/Themes';
import { EDITOR_WIDTH } from '../../utils/constants';

export const StyledWaveform = styled.div`
	height: 25vh;
	width: ${EDITOR_WIDTH}px;
	box-shadow: 0px 0 3px ${AppTheme.EditorBoxHighlight};
`;