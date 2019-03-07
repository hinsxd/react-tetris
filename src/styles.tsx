import styled from 'styled-components/macro';
import {
	gridColumn,
	gridRow,
	GridColumnProps,
	GridRowProps
} from 'styled-system';
export const Board = styled.div`
	display: grid;
	border: 1px solid #444;
	margin: 0 auto;
	width: calc(10 * 20px);
	height: calc(24 * 20px);
	grid-template-columns: repeat(10, 1fr);
	grid-template-rows: repeat(24, 1fr);
`;
