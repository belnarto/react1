import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

function toArrayIndex(coords) {
    return coords.row * 3 + coords.col;
}

function toCoords(index) {
    return new Coords(Math.trunc(index / 3), index % 3);
}

class Coords {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
}

Coords.prototype.toString = function coordsToString() {
    return '(' + this.row + ', ' + this.col + ')';
}

class Board extends React.Component {
    renderSquare(coords) {
        return (
            <Square
                value={this.props.squaresMap.get(coords.toString())}
                onClick={() => this.props.onClick(toArrayIndex(coords))}
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    <h3 className="square">#</h3>
                    <h3 className="square">0</h3>
                    <h3 className="square">1</h3>
                    <h3 className="square">2</h3>
                </div>
                <div className="board-row">
                    <h3 className="square">0</h3>
                    {this.renderSquare(new Coords(0, 0))}
                    {this.renderSquare(new Coords(0, 1))}
                    {this.renderSquare(new Coords(0, 2))}
                </div>
                <div className="board-row">
                    <h3 className="square">1</h3>
                    {this.renderSquare(new Coords(1, 0))}
                    {this.renderSquare(new Coords(1, 1))}
                    {this.renderSquare(new Coords(1, 2))}
                </div>
                <div className="board-row">
                    <h3 className="square">2</h3>
                    {this.renderSquare(new Coords(2, 0))}
                    {this.renderSquare(new Coords(2, 1))}
                    {this.renderSquare(new Coords(2, 2))}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                new Map()
            ],
            stepNumber: 0,
            xIsNext: true
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squaresMap = new Map(current);
        if (calculateWinner(squaresMap) || squaresMap.get(toCoords(i).toString()) != null) {
            return;
        }
        squaresMap.set(toCoords(i).toString(), this.state.xIsNext ? "X" : "O");
        history.push(squaresMap);
        this.setState({
            history: history,
            stepNumber: history.length - 1,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const squaresMap = new Map(current);
        const winner = calculateWinner(squaresMap);

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + ' ' + Array.from(step.keys()).pop() :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squaresMap={squaresMap}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game/>, document.getElementById("root"));

function calculateWinner(squaresMap) {
    const lines = [
        [toCoords(0), toCoords(1), toCoords(2)],
        [toCoords(3), toCoords(4), toCoords(5)],
        [toCoords(6), toCoords(7), toCoords(8)],
        [toCoords(0), toCoords(3), toCoords(6)],
        [toCoords(1), toCoords(4), toCoords(7)],
        [toCoords(2), toCoords(5), toCoords(8)],
        [toCoords(0), toCoords(4), toCoords(8)],
        [toCoords(2), toCoords(4), toCoords(6)]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squaresMap.get(a.toString()) &&
            squaresMap.get(a.toString()) === squaresMap.get(b.toString()) &&
            squaresMap.get(a.toString()) === squaresMap.get(c.toString())) {
            return squaresMap.get(a.toString());
        }
    }
    return null;
}
