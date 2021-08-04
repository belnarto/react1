import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    if (props.winSquare) {
        return (
            <button className="square win-square" onClick={props.onClick}>
                {props.value}
            </button>
        );
    } else {
        return (
            <button className="square" onClick={props.onClick}>
                {props.value}
            </button>
        );
    }

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
        if (this.props.winLine !== null && this.props.winLine.includes(coords.toString())) {
            return (
                <Square
                    value={this.props.squaresMap.get(coords.toString())}
                    winSquare={true}
                    onClick={() => this.props.onClick(toArrayIndex(coords))}
                />
            );
        } else {
            return (
                <Square
                    value={this.props.squaresMap.get(coords.toString())}
                    winSquare={false}
                    onClick={() => this.props.onClick(toArrayIndex(coords))}
                />
            );
        }
    }

    render() {
        let buffer = [];

        buffer.push(<div className="board-row" key="-1">
            <h3 className="square">#</h3>
            <h3 className="square">0</h3>
            <h3 className="square">1</h3>
            <h3 className="square">2</h3>
        </div>);

        for (let i = 0; i < 3; i++) {
            buffer.push(<div className="board-row" key={i}>
                <h3 className="square">{i}</h3>
                {this.renderSquare(new Coords(i, 0))}
                {this.renderSquare(new Coords(i, 1))}
                {this.renderSquare(new Coords(i, 2))}
            </div>);
        }

        return (
            <>
                <div>
                    {buffer}
                </div>
            </>
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
            xIsNext: true,
            sortingAsc: false,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squaresMap = new Map(current);
        if (calculateWinLine(squaresMap) || squaresMap.get(toCoords(i).toString()) != null) {
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
        const winLine = calculateWinLine(squaresMap);
        const winner = winLine !== null
            ? (this.state.xIsNext ? "O" : "X")
            : null;
        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + ' ' + Array.from(step.keys()).pop() :
                'Go to start';
            if (move === this.state.stepNumber) {
                return (
                    <li key={move}>
                        <button className="selected" onClick={() => this.jumpTo(move)}>{desc}</button>
                    </li>
                );
            } else {
                return (
                    <li key={move}>
                        <button onClick={() => this.jumpTo(move)}>{desc}</button>
                    </li>
                );
            }
        });

        if (this.state.sortingAsc) {
            moves.reverse();
        }

        let status;
        console.log(this.state.stepNumber)
        if (winner) {
            status = "Winner: " + winner;
        } else if (this.state.stepNumber === 9) {
            status = "Draw!";
            alert("Draw!");
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squaresMap={squaresMap}
                        winLine={winLine}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div className="order-switcher">
                        <button onClick={() => this.setState({
                            sortingAsc: !this.state.sortingAsc,
                        })}>{this.state.sortingAsc ? '↑' : '↓'}</button>
                    </div>
                    <ol reversed={this.state.sortingAsc}>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game/>, document.getElementById("root"));

function calculateWinLine(squaresMap) {
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
            return [a.toString(), b.toString(), c.toString()];
        }
    }
    return null;
}
