import _ from 'lodash';
import { Tetrominoes } from './staticData';
import { RotationData, TetrominoType, Board, Position } from './types';

export function rotCCW90<T>(arr: T[][]): T[][] {
  return _.zip(...arr.reverse()) as T[][];
}

export function rotCW90<T>(arr: T[][]): T[][] {
  return _.zip(...arr).reverse() as T[][];
}
export function rot180<T>(arr: T[][]): T[][] {
  return rotCW90(rotCW90(arr));
}
export function rotated<T>(arr: T[][], rotation: number): T[][] {
  switch ((rotation + 4) % 4) {
    case 0:
      return arr;
    case 1:
      return rotCW90(arr);
    case 2:
      return rot180(arr);
    case 3:
      return rotCCW90(arr);
    default:
      return arr;
  }
}
export function generateGridPosArr(rotation: number): Position[] {
  const arr5 = _.range(1, 6);
  return rotated(
    arr5.map(row => arr5.map(col => [row, col])),
    rotation
  ).flat() as Position[];
}
export function getGridPos(rotation: number, ...posIdxs: number[]): Position[] {
  return posIdxs.map(idx => {
    return generateGridPosArr(rotation)[idx];
  });
}
export function getGridPosAfterRotateOffset(
  rotationDatum: RotationData[],
  gridPos: number[],
  fromRotation: number,
  toRotation: number,
  offset: number
): Position {
  const { offsets: fromOffsets } = rotationDatum[fromRotation];
  const { offsets: toOffsets } = rotationDatum[toRotation];
  const [row, col] = gridPos;
  return [
    row + fromOffsets[offset][0] - toOffsets[offset][0],
    col + fromOffsets[offset][1] - toOffsets[offset][1]
  ];
}

export function getCellsWithoutRotationOffset(
  rotationDatum: RotationData[],
  gridPos: number[],
  rotation: number
): Position[] {
  const { pos } = rotationDatum[rotation];
  const [row, col] = gridPos;
  return pos.map(cell => [cell[0] + row, cell[1] + col]);
}

export function getRotationOffset(
  rotationDatum: RotationData[],
  fromRotation: number,
  toRotation: number,
  offset: number
): Position {
  const { offsets: fromOffsets } = rotationDatum[fromRotation];
  const { offsets: toOffsets } = rotationDatum[toRotation];
  return [
    fromOffsets[offset][0] - toOffsets[offset][0],
    fromOffsets[offset][1] - toOffsets[offset][1]
  ];
}

export function getCellsFromRotationOffset(
  rotationDatum: RotationData[],
  gridPos: number[],
  fromRotation: number,
  toRotation: number,
  offset: number
): Position[] {
  const rotationOffset = getRotationOffset(
    rotationDatum,
    fromRotation,
    toRotation,
    offset
  );
  const { pos } = rotationDatum[toRotation];
  const [row, col] = gridPos;
  return pos.map(cell => [
    cell[0] + rotationOffset[0] + row,
    cell[1] + rotationOffset[1] + col
  ]);
}

export function randomPiece(): TetrominoType {
  return Object.keys(Tetrominoes)[_.random(1000, false)! % 7] as TetrominoType;
}

export function placeable(cells: number[][], board: Board): boolean {
  return cells.every(
    ([cellRow, cellCol]) =>
      1 <= cellRow &&
      cellRow <= 24 &&
      1 <= cellCol &&
      cellCol <= 10 &&
      board[cellRow - 1] &&
      board[cellRow - 1][cellCol - 1] !== undefined &&
      board[cellRow - 1][cellCol - 1] === null
  );
}
