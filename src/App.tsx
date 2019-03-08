import React, { Component, useState, useEffect, useRef, memo } from 'react';
import _ from 'lodash';
import useInterval from './useInterval';
import * as S from './styles';
import './App.css';
import {
	TetrominoType,
	RotationData,
	Piece,
	TetrominoesType,
	Board,
	Position
} from './types';
import {
	getGridPos,
	getCellsFromRotationOffset,
	getCellsWithoutRotationOffset,
	getGridPosAfterRotateOffset,
	placeable,
	randomPiece
} from './utils';

import { Tetrominoes, initialBoard } from './staticData';

const Terrain = React.memo(({ board }: { board: Board }) => (
	<>
		{board.map((row, rowIdx) =>
			row.map(
				(type, colIdx) =>
					type && (
						<S.Cell
							key={`${rowIdx}${colIdx}`}
							cell={[rowIdx + 1, colIdx + 1]}
							tetrominoType={type}
						/>
					)
			)
		)}
	</>
));

const ActiveTetromino = ({
	cells,
	activeTetrominoType
}: {
	cells: Position[];
	activeTetrominoType: TetrominoType;
}) => (
	<>
		{cells.map(cell => (
			<S.Cell
				key={`${cell[0]}${cell[1]}`}
				cell={cell}
				tetrominoType={activeTetrominoType}
			/>
		))}
	</>
);

const App: React.FC = () => {
	const [board, setBoard] = useState(initialBoard);
	const [level, setLevel] = useState(0);
	const [score, setStore] = useState(0);
	const boardRef = useRef<HTMLDivElement>(null);
	const [dead, setDead] = useState(false);
	const [activeTetrominoType, setActiveTetrominoType] = useState<TetrominoType>(
		randomPiece()
	);
	// const [activeTetrominoType, setActiveTetrominoType] = useState<TetrominoType>('I');
	const [[row, col], setPosition] = useState([0, 2]);
	const [rotation, setRotation] = useState(0);

	const [isRunning, setIsRunning] = useState(true);
	const [delay, setDelay] = useState<number | null>(50);
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
						Tetrominoes[activeTetrominoType].rotationDatam,
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
						Tetrominoes[activeTetrominoType].rotationDatam,
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
					Tetrominoes[activeTetrominoType].rotationDatam,
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
			Tetrominoes[activeTetrominoType].rotationDatam,
			[row, col],
			rotation
		).map(([cellRow, cellCol]) => {
			newBoard[cellRow - 1][cellCol - 1] = activeTetrominoType;
		});
		setBoard(newBoard);
		setActiveTetrominoType(_.sample(Object.keys(Tetrominoes)) as TetrominoType);
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

	const activeCells = getCellsWithoutRotationOffset(
		Tetrominoes[activeTetrominoType].rotationDatam,
		[row, col],
		rotation
	);

	return (
		<div className="App" tabIndex={0} ref={boardRef} onKeyDown={handleKeyPress}>
			<S.Board>
				<ActiveTetromino
					cells={activeCells}
					activeTetrominoType={activeTetrominoType}
				/>
				<Terrain board={board} />
			</S.Board>

			{dead && <div>You lose</div>}
		</div>
	);
};

export default App;
