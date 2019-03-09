import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { transparentize } from 'polished';
import useInterval from './useInterval';
import * as S from './styles';
import './App.css';
import { TetrominoType, Board, Position } from './types';
import {
  getCellsFromRotationOffset,
  getCellsWithoutRotationOffset,
  getGridPosAfterRotateOffset,
  placeable,
  randomPiece
} from './utils';

import { Tetrominoes, initialBoard, speed } from './staticData';

const Terrain = React.memo(({ board }: { board: Board }) => (
  <>
    {board.map((row, rowIdx) =>
      row.map(
        (type, colIdx) =>
          type && (
            <S.Cell
              key={`${rowIdx}${colIdx}`}
              cell={[rowIdx + 1, colIdx + 1]}
              backgroundColor={Tetrominoes[type].color}
            />
          )
      )
    )}
  </>
));

const TetrominoCells = ({
  cells,
  tetrominoType,
  transp
}: {
  cells: Position[];
  tetrominoType: TetrominoType;
  transp?: boolean;
}) => {
  return (
    <>
      {cells.map(cell => (
        <S.Cell
          key={`${cell[0]}${cell[1]}`}
          cell={cell}
          transp={transp}
          backgroundColor={Tetrominoes[tetrominoType].color}
        />
      ))}
    </>
  );
};
const newTetrominoPos = [0, 2];
const App: React.FC = () => {
  const [board, setBoard] = useState(initialBoard);
  const [startLevel, setStartLevel] = useState(0);
  const [level, setLevel] = useState(startLevel);
  const [highscore, setHighscore] = useState(0);
  const [score, setScore] = useState(0);
  const [rowsCleared, setRowsCleared] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [dead, setDead] = useState(false);
  const [activeTetrominoType, setActiveTetrominoType] = useState<TetrominoType>(
    randomPiece()
  );
  const [nextTetrominoType, setNextTetrominoType] = useState<TetrominoType>(
    randomPiece()
  );
  const [[row, col], setPosition] = useState(newTetrominoPos);
  const [rotation, setRotation] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [delay, setDelay] = useState<number | null>(60 * speed(level));
  console.log('delay', delay);
  const start = () => {
    setIsRunning(true);
    boardRef.current!.focus();
  };
  const restart = () => {
    setBoard(initialBoard);
    setLevel(1);
    setScore(0);
    setRowsCleared(0);
    setDead(false);
    setRotation(0);
    setPosition(newTetrominoPos);
    setActiveTetrominoType(randomPiece());
    setNextTetrominoType(randomPiece());
  };
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
        setPosition(([row, col]) =>
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

  const moveTo = (relRow: number, relCol: number, cb?: Function): boolean => {
    if (
      placeable(
        getCellsWithoutRotationOffset(
          Tetrominoes[activeTetrominoType].rotationDatam,
          [row + relRow, col + relCol],
          rotation
        ),
        board
      )
    ) {
      setPosition(([row, col]) => [row + relRow, col + relCol]);
      return true;
    }
    return false;
  };

  const moveLeft = () => {
    moveTo(0, -1);
  };
  const moveRight = () => {
    moveTo(0, 1);
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
    setActiveTetrominoType(nextTetrominoType);
    setNextTetrominoType(_.sample(Object.keys(Tetrominoes)) as TetrominoType);
    setPosition(newTetrominoPos);
    setRotation(0);
  };

  const drop = () => {
    if (!moveTo(1, 0)) {
      land();
    }
  };
  const getHardDropPos = () => {
    let relRow = 0;
    while (
      placeable(
        getCellsWithoutRotationOffset(
          Tetrominoes[activeTetrominoType].rotationDatam,
          [row + relRow + 1, col],
          rotation
        ),
        board
      )
    ) {
      relRow++;
    }
    return [row + relRow, col];
  };

  const hardDrop = () => {
    const [newRow, newCol] = getHardDropPos();
    const newBoard = board.map(r => r.map(c => c));
    getCellsWithoutRotationOffset(
      Tetrominoes[activeTetrominoType].rotationDatam,
      [newRow, newCol],
      rotation
    ).map(([cellRow, cellCol]) => {
      newBoard[cellRow - 1][cellCol - 1] = activeTetrominoType;
    });
    setBoard(newBoard);
    setActiveTetrominoType(nextTetrominoType);
    setNextTetrominoType(_.sample(Object.keys(Tetrominoes)) as TetrominoType);
    setPosition(newTetrominoPos);
    setRotation(0);
  };
  const changeStartLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartLevel(parseInt(e.currentTarget.value));
    setLevel(parseInt(e.currentTarget.value));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isRunning) return;
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
      case 32: // space
        hardDrop();
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    boardRef.current!.focus();
  }, []);

  useEffect(() => {
    if (board[3].some(cell => cell !== null)) {
      setDead(true);
      setIsRunning(false);
      if (score > highscore) setHighscore(score);
    }
    const newBoard = board.filter(row => row.some(cell => cell === null));
    const emptyRows = Array(24 - newBoard.length)
      .fill(0)
      .map(() =>
        Array(10)
          .fill(0)
          .map(() => null)
      );
    if (emptyRows.length > 0) {
      setBoard([...emptyRows, ...newBoard]);
      setRowsCleared(rowsCleared + emptyRows.length);
      setScore(score + 100 * 2 ** (emptyRows.length - 1));
    }
  }, [board]);

  useEffect(() => {
    const initialLevelUpRows = Math.min(
      startLevel * 10 + 10,
      Math.max(100, startLevel * 10 - 50)
    );
    if (level === startLevel) {
      if (rowsCleared >= initialLevelUpRows) setLevel(level + 1);
    } else {
      const newLevel = Math.ceil((rowsCleared - initialLevelUpRows) / 10) + 1;
      if (newLevel !== level) setLevel(newLevel);
    }
  }, [rowsCleared]);

  /** Set speed according to https://tetris.wiki/Tetris_(NES,_Nintendo) */
  useEffect(() => {
    setDelay(60 * speed(level));
  }, [level]);

  useInterval(drop, isRunning ? delay : null);

  const activeCells = getCellsWithoutRotationOffset(
    Tetrominoes[activeTetrominoType].rotationDatam,
    [row, col],
    rotation
  );

  const nextCells = getCellsWithoutRotationOffset(
    Tetrominoes[nextTetrominoType].rotationDatam,
    [0, 0],
    0
  );

  const hardDropCells = getCellsWithoutRotationOffset(
    Tetrominoes[activeTetrominoType].rotationDatam,
    getHardDropPos(),
    rotation
  );
  return (
    <S.Wrapper tabIndex={0} ref={boardRef} onKeyDown={handleKeyPress}>
      <S.Board>
        <TetrominoCells
          cells={activeCells}
          tetrominoType={activeTetrominoType}
        />
        <TetrominoCells
          cells={hardDropCells}
          tetrominoType={activeTetrominoType}
          transp
        />
        <Terrain board={board} />
      </S.Board>
      <S.MetaColumn>
        <S.Preview>
          <TetrominoCells cells={nextCells} tetrominoType={nextTetrominoType} />
        </S.Preview>

        <S.Actions>
          Starting Level:{' '}
          <input
            disabled={isRunning || dead}
            name="startLevel"
            value={startLevel}
            onChange={changeStartLevel}
            type="number"
          />
          <button disabled={isRunning || dead} onClick={start}>
            Start
          </button>
          {dead && (
            <>
              <button onClick={restart}>Restart</button>
              <div>You lose</div>
            </>
          )}
        </S.Actions>
        <S.Stats>
          <S.StatRow>Level: {level}</S.StatRow>
          <S.StatRow>High Score: {highscore}</S.StatRow>
          <S.StatRow>Score: {score}</S.StatRow>
          <S.StatRow>Rows cleared: {rowsCleared}</S.StatRow>
        </S.Stats>
      </S.MetaColumn>
    </S.Wrapper>
  );
};

export default App;
