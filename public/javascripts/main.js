const board = ChessBoard();
const socket = new WebSocket("ws://localhost:3000");
const state = GameState(board, socket, 10, 'white');

state.initGame();
