import React, { Component, useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import useInterval from './useInterval';
import * as S from './styles';
import './App.css';

type PieceType = 'I' | 'O' | 'T' | 'Z' | 'S' | 'J' | 'L';
type RotationData = {
	pos: number[][];
	offsets: number[][];
};
type Piece = {
	color: string;
	rotationDatam: RotationData[];
};
type Pieces = { [key in PieceType]: Piece };

type Board = (null | PieceType)[][];
function rotCCW90<T>(arr: T[][]): T[][] {
	return _.zip(...arr.reverse()) as T[][];
}

function rotCW90<T>(arr: T[][]): T[][] {
	return _.zip(...arr).reverse() as T[][];
}
function rot180<T>(arr: T[][]): T[][] {
	return rotCW90(rotCW90(arr));
}
function rotated<T>(arr: T[][], rotation: number): T[][] {
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

const arr5 = _.range(1, 6);
// (row, col)
// 0  1  2  3  4
// 5  6  7  8  9
// 10 11 12 13 14
// 15 16 17 18 19
// 20 21 22 23 24
const gridPosArr = (rotation: number) =>
	rotated(arr5.map(row => arr5.map(col => [row, col])), rotation).flat();

const getGridPos = (rotation: number, ...posIdxs: number[]) =>
	posIdxs.map(idx => {
		return gridPosArr(rotation)[idx];
	});

const getGridPosAfterRotateOffset = (
	rotationDatum: RotationData[],
	gridPos: number[],
	fromRotation: number,
	toRotation: number,
	offset: number
): number[] => {
	const { offsets: fromOffsets } = rotationDatum[fromRotation];
	const { offsets: toOffsets } = rotationDatum[toRotation];
	const [row, col] = gridPos;
	return [
		row + fromOffsets[offset][0] - toOffsets[offset][0],
		col + fromOffsets[offset][1] - toOffsets[offset][1]
	];
};

const getCellsWithoutRotationOffset = (
	rotationDatum: RotationData[],
	gridPos: number[],
	rotation: number
) => {
	const { pos, offsets } = rotationDatum[rotation];
	const [row, col] = gridPos;
	return pos.map(cell => [cell[0] + row, cell[1] + col]);
};

const getRotationOffset = (
	rotationDatum: RotationData[],
	fromRotation: number,
	toRotation: number,
	offset: number
) => {
	const { offsets: fromOffsets } = rotationDatum[fromRotation];
	const { offsets: toOffsets } = rotationDatum[toRotation];
	return [
		fromOffsets[offset][0] - toOffsets[offset][0],
		fromOffsets[offset][1] - toOffsets[offset][1]
	];
};

const getCellsFromRotationOffset = (
	rotationDatum: RotationData[],
	gridPos: number[],
	fromRotation: number,
	toRotation: number,
	offset: number
) => {
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
};

const placeable = (cells: number[][], board: Board) =>
	cells.every(
		([cellRow, cellCol]) =>
			1 <= cellRow &&
			cellRow <= 24 &&
			1 <= cellCol &&
			cellCol <= 10 &&
			board[cellRow - 1] &&
			board[cellRow - 1][cellCol - 1] !== undefined &&
			board[cellRow - 1][cellCol - 1] === null
	);

const nonIOOffsets = [
	[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
	[[0, 0], [0, 1], [1, -1], [-2, 0], [-2, 1]],
	[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
	[[0, 0], [0, -1], [1, -1], [-2, 0], [-2, -1]]
];
const Pieces: Pieces = {
	I: {
		color: 'red',
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
		color: 'yellow',
		rotationDatam: _.range(4).map(rot => ({
			pos: getGridPos(rot, 8, 11, 12, 13),
			offsets: nonIOOffsets[rot]
		}))
	},
	L: {
		color: 'magenta',
		rotationDatam: _.range(4).map(rot => ({
			pos: getGridPos(rot, 6, 11, 12, 13),
			offsets: nonIOOffsets[rot]
		}))
	},
	O: {
		color: 'blue',
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
		color: 'cyan',
		rotationDatam: _.range(4).map(rot => ({
			pos: getGridPos(rot, 7, 8, 11, 12),
			offsets: nonIOOffsets[rot]
		}))
	},
	T: {
		color: 'green',
		rotationDatam: _.range(4).map(rot => ({
			pos: getGridPos(rot, 7, 11, 12, 13),
			offsets: nonIOOffsets[rot]
		}))
	},
	Z: {
		color: 'orange',
		rotationDatam: _.range(4).map(rot => ({
			pos: getGridPos(rot, 6, 7, 12, 13),
			offsets: nonIOOffsets[rot]
		}))
	}
};

const randomPiece = (): PieceType => _.sample(Object.keys(Pieces)) as PieceType;

const initialBoard: Board = Array(24)
	.fill(0)
	.map(row =>
		Array(10)
			.fill(0)
			.map(col => null)
	);
const App: React.FC = () => {
	const [board, setBoard] = useState(initialBoard);
	const [level, setLevel] = useState(0);
	const [score, setStore] = useState(0);
	const boardRef = useRef<HTMLDivElement>(null);
	const [dead, setDead] = useState(false);
	const [activePieceType, setActivePieceType] = useState<PieceType>(
		randomPiece()
	);
	// const [activePieceType, setActivePieceType] = useState<PieceType>('I');
	const [[row, col], setPosition] = useState([0, 2]);
	const [rotation, setRotation] = useState(0);

	const [isRunning, setIsRunning] = useState(true);
	const [delay, setDelay] = useState<number | null>(300);
	useEffect(() => {
		boardRef.current!.focus();
	}, []);

	useEffect(() => {
		if (board[3].some(cell => cell !== null)) {
			setDead(true);
			setDelay(null);
		}
		const newBoard = board.filter(row => row.some(cell => cell === null));
		const emptyRows = Array(24 - newBoard.length)
			.fill(0)
			.map(row =>
				Array(10)
					.fill(0)
					.map(col => null)
			);
		if (newBoard.length < 24) setBoard([...emptyRows, ...newBoard]);
	}, [board]);

	const rotateTo = (newRotation: number) => {
		let offset = 0;
		while (offset < 5) {
			if (
				placeable(
					getCellsFromRotationOffset(
						Pieces[activePieceType].rotationDatam,
						[row, col],
						rotation,
						newRotation,
						offset
					),
					board
				)
			) {
				setPosition(
					getGridPosAfterRotateOffset(
						Pieces[activePieceType].rotationDatam,
						[row, col],
						rotation,
						newRotation,
						offset
					)
				);
				setRotation(newRotation);
				return;
			}
			offset++;
		}
	};

	const rotateLeft = () => {
		rotateTo((rotation - 1 + 4) % 4);
	};
	const rotateRight = () => {
		rotateTo((rotation + 1) % 4);
	};

	const moveTo = (row: number, col: number): boolean => {
		if (
			placeable(
				getCellsWithoutRotationOffset(
					Pieces[activePieceType].rotationDatam,
					[row, col],
					rotation
				),
				board
			)
		) {
			setPosition([row, col]);
			return true;
		}
		return false;
	};

	const moveLeft = () => {
		moveTo(row, col - 1);
	};
	const moveRight = () => {
		moveTo(row, col + 1);
	};

	const land = () => {
		const newBoard = board.map(r => r.map(c => c));
		getCellsWithoutRotationOffset(
			Pieces[activePieceType].rotationDatam,
			[row, col],
			rotation
		).map(([cellRow, cellCol]) => {
			newBoard[cellRow - 1][cellCol - 1] = activePieceType;
		});
		setBoard(newBoard);
		setActivePieceType(_.sample(Object.keys(Pieces)) as PieceType);
		setPosition([0, 3]);
		setRotation(0);
	};

	const drop = () => {
		if (!moveTo(row + 1, col)) {
			land();
		}
	};

	useInterval(drop, delay);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
		switch (e.keyCode) {
			case 90: // z
				rotateLeft();
				break;
			case 88: // x
				rotateRight();
				break;
			case 37: // left
				moveLeft();
				break;
			case 39: // right
				moveRight();
				break;
			case 40: // down
				drop();
				break;
			default:
				break;
		}
	};
	return (
		<div className="App" tabIndex={0} ref={boardRef} onKeyDown={handleKeyPress}>
			<S.Board>
				{getCellsWithoutRotationOffset(
					Pieces[activePieceType].rotationDatam,
					[row, col],
					rotation
				).map(cell => (
					<div
						key={`${cell[0]}${cell[1]}`}
						style={{
							gridColumn: cell[1],
							gridRow: cell[0],
							border: '1px solid #444',
							backgroundColor: Pieces[activePieceType].color
						}}
					/>
				))}
				{board.map((row, rowIdx) =>
					row.map(
						(type, colIdx) =>
							type && (
								<div
									key={`${rowIdx}${colIdx}`}
									style={{
										gridColumn: colIdx + 1,
										gridRow: rowIdx + 1,
										border: '1px solid #444',
										backgroundColor: Pieces[type].color
									}}
								/>
							)
					)
				)}
			</S.Board>

			{dead && <div>You lose</div>}
		</div>
	);
};

export default App;
