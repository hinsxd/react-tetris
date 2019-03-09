import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import { Tetrominoes } from './staticData';
import { Position, TetrominoType } from './types';

export const Wrapper = styled.div`
  display: flex;
  margin: 0 auto;
  width: ${10 * 25 + 150}px;
  flex-direction: row;
`;
export const MetaColumn = styled.div`
  flex: 0 0 150px;
  display: flex;
  flex-direction: column;
`;

export const Preview = styled.div`
  flex: 0 0 150px;
  height: 150px;
  border: 1px solid #444;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
`;
export const Actions = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
`;
export const Stats = styled.div`
  flex: 0 0 200px;
  justify-self: flex-end;
  display: flex;
  flex-direction: column;
`;
export const StatRow = styled.div``;

export const Board = styled.div`
  display: grid;
  border: 1px solid #444;

  width: calc(10 * 25px);
  height: calc(24 * 25px);
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(24, 1fr);
`;
type CellProps = {
  cell: Position;
  backgroundColor: string;
  transp?: boolean;
};
export const Cell = styled.div.attrs<CellProps>(p => ({
  style: {
    backgroundColor: p.transp
      ? transparentize(0.8, p.backgroundColor)
      : p.backgroundColor,
    gridRow: p.cell[0],
    gridColumn: p.cell[1]
  }
}))<CellProps>`
  border: 1px solid ${p => (p.transp ? '#888' : '#444')};
`;
