import styled from 'styled-components/macro';
import { Tetrominoes } from './staticData';
import { Position, TetrominoType } from './types';
export const Board = styled.div`
	display: grid;
	border: 1px solid #444;
	margin: 0 auto;
	width: calc(10 * 20px);
	height: calc(24 * 20px);
	grid-template-columns: repeat(10, 1fr);
	grid-template-rows: repeat(24, 1fr);
`;

export const Cell = styled.div`
	${(p: { cell: Position; tetrominoType: TetrominoType }) => ``}
	grid-row: ${p => p.cell[0]};
	grid-column: ${p => p.cell[1]};
	border: 1px solid #444;
	background-color: ${p => Tetrominoes[p.tetrominoType].color}
`;
