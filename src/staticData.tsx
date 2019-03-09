import _ from 'lodash';
import { TetrominoesType, Board } from './types';
import { getGridPos } from './utils';
export const arr5 = [1, 2, 3, 4, 5];
// (row, col)
// 0  1  2  3  4
// 5  6  7  8  9
// 10 11 12 13 14
// 15 16 17 18 19
// 20 21 22 23 24
const nonIOOffsets = [
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 1], [1, -1], [-2, 0], [-2, 1]],
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, -1], [1, -1], [-2, 0], [-2, -1]]
];

export const Tetrominoes: TetrominoesType = {
  I: {
    color: '#FF0000',
    rotationDatam: [
      {
        pos: getGridPos(0, 11, 12, 13, 14),
        offsets: [[0, 0], [0, -1], [0, 2], [0, -1], [0, 2]]
      },
      {
        pos: getGridPos(1, 11, 12, 13, 14),
        offsets: [[0, -1], [0, 0], [0, 0], [-1, 0], [2, 0]]
      },
      {
        pos: getGridPos(2, 11, 12, 13, 14),
        offsets: [[-1, -1], [-1, 1], [-1, -2], [0, 1], [0, -2]]
      },
      {
        pos: getGridPos(3, 11, 12, 13, 14),
        offsets: [[-1, 0], [-1, 0], [-1, 0], [1, 0], [-2, 0]]
      }
    ]
  },
  J: {
    color: '#FFFF00',
    rotationDatam: _.range(4).map(rot => ({
      pos: getGridPos(rot, 8, 11, 12, 13),
      offsets: nonIOOffsets[rot]
    }))
  },
  L: {
    color: '#FF00FF',
    rotationDatam: _.range(4).map(rot => ({
      pos: getGridPos(rot, 6, 11, 12, 13),
      offsets: nonIOOffsets[rot]
    }))
  },
  O: {
    color: '#0000FF',
    rotationDatam: [
      {
        pos: getGridPos(0, 7, 8, 12, 13),
        offsets: Array(5).fill([0, 0])
      },
      {
        pos: getGridPos(1, 7, 8, 12, 13),
        offsets: Array(5).fill([1, 0])
      },
      {
        pos: getGridPos(2, 7, 8, 12, 13),
        offsets: Array(5).fill([1, -1])
      },
      {
        pos: getGridPos(3, 7, 8, 12, 13),
        offsets: Array(5).fill([0, -1])
      }
    ]
  },
  S: {
    color: '#00FFFF',
    rotationDatam: _.range(4).map(rot => ({
      pos: getGridPos(rot, 7, 8, 11, 12),
      offsets: nonIOOffsets[rot]
    }))
  },
  T: {
    color: '#008000',
    rotationDatam: _.range(4).map(rot => ({
      pos: getGridPos(rot, 7, 11, 12, 13),
      offsets: nonIOOffsets[rot]
    }))
  },
  Z: {
    color: '#FFA500',
    rotationDatam: _.range(4).map(rot => ({
      pos: getGridPos(rot, 6, 7, 12, 13),
      offsets: nonIOOffsets[rot]
    }))
  }
};

export const initialBoard: Board = Array(24)
  .fill(0)
  .map(row =>
    Array(10)
      .fill(0)
      .map(col => null)
  );

export function speed(level: number): number {
  if (level < 0) return 9999;
  if (level <= 9) {
    return 48 - level * 5;
  }
  if (level <= 12) {
    return 5;
  }
  if (level <= 15) {
    return 4;
  }
  if (level <= 18) {
    return 3;
  }
  if (level <= 28) {
    return 2;
  }
  return 1;
}
