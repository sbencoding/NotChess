# Task 2
## 2.1
**Chat**
* The player writes a message and hits enter -> leads to message being sent
* If scroll is detected inside the message box -> the messages are shifted

**Board**
* The player clicks on a cell -> If there are personal pieces there, the possible moves are shown, else there is no reaction.
* The player clicks on one of the previous possible positions -> The selected piece is moved to the cell.
* If there is a enemy piece in the selected cell -> The piece is captured.
* If the player click on it's piece immediately after selecting it -> The piece is de-selected and the loop goes to the first step.
* If any piece has a move that captures an enemy piece -> That move is enforced by being the only possible one. 
* When the player finishes its move -> The personal timer stops, and the enemy timer resumes.
* When the player captures an enemy piece -> That piece is moved to the *captured enemy pieces* section.

**Actions**
* When the player clicks on the *resign* button -> The game ends and a message stating that the enemy won appears.
* When the player clicks on the *offer draw* button -> The enemy player is prompted with the option of accepting a draw.
* If the enemy player accepts the draw option -> The game ends appearing that the result was a draw.
* If the game ends -> Both players are prompted with the *rematch* option.
* If both players options accept the rematch -> A new match starts with the same players.
* When the player clicks on the *Support NotChess* button -> The player is directed to a page where it is possible to support<br> to the NotChess team.
* When the player clicks on the logo -> The player is directed to the splash screen.

## 2.2

**ChessPiece**
* `color` *String* - the color of the piece (black or white).
* `type` *String* - the type of the piece (horse, king, etc).

**ChessBoard**
* `cells` *ChessPiece[][]* - the state of every cell (possibly with a ChessPiece or with null if its empty).

**ChatMessage**
* `sender` *number* - the player that sent the message (player 1 or 2).
* `timeOfMessage` *date* - the time at what the message was sent.
* `message` *String* - message sent by a player.

**GameState**
* `personalTimer` *number* - the remaining time for the player.
* `enemyTimer` *number* - the remaining time for the enemy player.
* `globalTimer` *number* - the time elapsed since the start of the match.
* `gameBoard` *ChessBoard* - the current state of the board.
* `capturedFriendlyPieces` *ChessPiece[]* - the friendly pieces captured by the enemy.
* `capturedEnemyPieces` *ChessPiece[]* - the enemy pieces captured.
* `chatMessages` *ChatMessage[]* - all the messages sent by the two players

