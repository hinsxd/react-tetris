export type TetrominoType = 'I' | 'O' | 'T' | 'Z' | 'S' | 'J' | 'L';
export type RotationData = {
  pos: number[][];
  offsets: number[][];
};
export type Piece = {
  color: string;
  rotationDatam: RotationData[];
};
export type TetrominoesType = { [key in TetrominoType]: Piece };

export type Board = (null | TetrominoType)[][];

export type Position = number[];
