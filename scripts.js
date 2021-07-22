// Set up gameboard : Gameboard object using Revealing Module Pattern
const Gameboard = (() => { 
    let _board = ['','','','','','','','','',];
    let _xCount = 0;
    let _oCount = 0;
    let xTiles = [];
    let oTiles = [];
   
    
    // _privateMethods
    const _setField = (n) => {
        return new Promise(function(resolve, reject){
            if(n < 0 || n > 8) {
                reject('Field number out of range');
            }

            let sign = GameController.getCurrentPlayer().getSign();
            _board[n] = sign;
            DisplayController.placeSignOnTile(n);

            if(sign === 'X') {
                _xCount++;
                xTiles.push(parseInt(n));
                if(_xCount >= 3) GameController.checkForWin(xTiles);
            } else if(sign === 'O') {
                _oCount++;
                oTiles.push(parseInt(n));
                if(_oCount >= 3) GameController.checkForWin(oTiles);
            }
            console.log(_board);
            resolve('Field has been set');
        });
    }

    const _isBoardFull = () => {
        let emptyTiles = false;
        for(let i = 0; i < _board.length; i++){
            if(_board[i] === ''){
                console.log('there are still empty fields');
                emptyTiles = true;
                return;
            } 
        }
        if(!emptyTiles){
             GameController.gameOver = true;
            DisplayController.displayGameOver(false);
        }
    }


    // public methods 
    const startNewGame = (mode) => {
        console.log(`starting game: ${mode}`);
    }

    const getBoard = () => _board;

    const checkField = (n) => {
        if(_board[n] === '' || _board.length === 0){
            console.log('clear! show sign and add to board');
            _setField(n)
            .then(_isBoardFull); // Check if all tiles are filled 
            // .then(DisplayController.placeSignOnTile(n));
            // checkForWinningMoves (GameController) - await for Xms
            GameController.switchPlayerTurn();
            setTimeout(DisplayController.showCurrentPlayer, 200);
        } else if(GameController.getCurrentPlayer().getName() === 'AI'){
            getRandomNum();
        }
    }

    const resetBoard = () => {
        _xCount = 0;
        _oCount = 0;

        _board = ['','','','','','','','','',];
        console.log(_board);
        xTiles = [];
        oTiles = [];

    }

    const getRandomNum = () => {
        let randomNum = Math.floor(Math.random() * 9);
        checkField(randomNum);
        
    }

    return {
        startNewGame,
        getBoard,
        checkField,
        getRandomNum,
        resetBoard
    };
})(); //IIFE 

// Set up display : Display Controller object using Revealing Module Pattern
const DisplayController = (() => {
    const setupBtn = document.getElementById('setup-game');
    const playerSelBtns = document.querySelectorAll('[data-group="player-selection"] label.radio');
    const playerSelectionOps = document.querySelector('[data-group="player-selection"]');
    const startBtns = document.querySelectorAll('.start-game');
    const inputFields = document.querySelectorAll('input[type="text"]');
    let modal = document.querySelector('.modal');
    let htmlBody = document.querySelector('html');
    let modeSelected = ''; 
    let playerInfo = {};

    const _gameControlsListeners = () => {
        setupBtn.addEventListener('click', function() {
            _toggleElems(playerSelectionOps, setupBtn);
        });

        playerSelBtns.forEach( playerBtn => playerBtn.addEventListener(
            'click', function(e){
                e.preventDefault();
                let selection = this.textContent.trim();
                playerSelectionOps.classList.add('hide');
                playerSelectionOps.classList.remove('show');
                _showGameSettings(selection);
            }
        ));

        inputFields.forEach( input => input.addEventListener(
            'input', function(){
                if(!input.hasAttribute('data-valid') && input.value.length >= 2) {
                    input.setAttribute('data-valid', true);
                } //else if(input.getAttribute('data-valid') === false && input.value.length >=2) {
                //     input.setAttribute('data-valid', true);
                // }
                else {
                    _validateInput();
                }
            }
        ));

        startBtns.forEach( startBtn => startBtn.addEventListener(
            'click', function(e){
                e.preventDefault();
                let validInputs = document.querySelectorAll('div.show input[data-valid="true"], div.show input:checked');
                let playerKey = 0;
                for(let i = 0; i < validInputs.length; i++){
                    if(validInputs[i].classList.contains('input')){
                        playerKey++;
                        playerInfo[playerKey] = new Array();
                    }
                    playerInfo[playerKey].push(validInputs[i].value);
                }

                // for(let key in playerInfo){
                //     console.log(`key: ${key}, value: ${playerInfo[key]}`);
                // }
                GameController.init();
                Gameboard.startNewGame(modeSelected);
                _activeGame();
                _resetFormSettings();
            }
        )); 

    }

    const _showGameSettings = (selection) => {
        let onePlayerOps = document.querySelector('[data-group="one-player"');
        let twoPlayerOps = document.querySelector('[data-group="two-players"');
        if(selection === 'One Player'){
            onePlayerOps.classList.remove('hide');
            onePlayerOps.classList.add('show');
            modeSelected = 'OnePlayer';
        } else if(selection === "Two Players") {
            twoPlayerOps.classList.remove('hide');
            twoPlayerOps.classList.add('show');
            modeSelected = 'TwoPlayers';
        }
    }

    const _validateInput = () => {
        let textFields = document.querySelectorAll('div.show input[type="text"]');
        
        let check;
        textFields.forEach( field => {
            if(field.hasAttribute('data-valid') === false){
                check = false;
                return;
            } 
            check = true;
        });
            
        if(check === true){ 
            document.querySelector('div.show button.start-game').removeAttribute('disabled');
        }
    }

    const _activeGame = () => {
        const gameSettings = document.querySelector('div.show');
        const activeOps = document.querySelector('div.active-game');
        const restartBtn = document.querySelectorAll('button.restart');
        
        _toggleElems(activeOps, gameSettings);
        showCurrentPlayer();
        _trackPlayerMoves();
        restartBtn.forEach( btn => btn.addEventListener('click', _reset));
    }

    const _trackPlayerMoves = () => {
        let tiles = document.querySelectorAll('#gameboard td');
        tiles.forEach( tile => tile.addEventListener('click', function(){
                let num = this.dataset.index;
                Gameboard.checkField(num);
            }
        ));
    }

    const _resetFormSettings = () => {
        document.getElementById('settings').reset();
        inputFields.forEach( field => {
            field.removeAttribute('data-valid');
        });
        startBtns.forEach( startBtn => {
            if(startBtn.hasAttribute('disabled') === false) {
                startBtn.setAttribute('disabled', '');
            }
        });
    }

    const _reset = () => {
        modeSelected = '';
        let tiles = document.querySelectorAll('#gameboard td');
        let activeOps = document.querySelector('div.active-game');

        for(let key in playerInfo){
            delete playerInfo[key];
        }

        tiles.forEach(tile => {
            if(tile.hasChildNodes()){
                tile.removeChild(tile.firstChild);
            }
        });

        if(modal.classList.contains('is-active')){
            modal.classList.remove('is-active');
            htmlBody.classList.remove('is-clipped');
        }

        _toggleElems(setupBtn, activeOps);
        Gameboard.resetBoard();
        GameController.resetGame();   
        //init();
    }

    const _toggleElems = (elemToShow, elemToHide) => {
        elemToShow.classList.remove('hide');
        elemToShow.classList.add('show');
        elemToHide.classList.remove('show');
        elemToHide.classList.add('hide');
    }

    const showCurrentPlayer = () => { //Update so we can access display easily
        let display = document.querySelector('#turn');
        display.innerHTML = GameController.getCurrentPlayer().getName();
    }

    const placeSignOnTile = (n) => {
        let selectedTile = document.querySelector(`#gameboard td[data-index="${n}`);
        let sign = GameController.getCurrentPlayer().getSign();
        selectedTile.innerHTML = `<span class="sign">${sign}</span>`;
    }

    const displayGameOver = (boolean) => {
        let textElem = document.querySelector('.modal p');
        if(boolean === true) {
                textElem.innerHTML = `<span>${GameController.getCurrentPlayer().getName()}</span> wins! &#x1F389;`

        } else if(boolean === false) {
            textElem.innerHTML = "It's a draw!";
        }

        modal.classList.add('is-active');
        htmlBody.classList.add('is-clipped');
    }

    const init = () => {
        _gameControlsListeners();
    }

    return {
        init,
        modeSelected,
        playerInfo,
        placeSignOnTile,
        showCurrentPlayer,
        displayGameOver

    };

})();

// Set up players : Players objects using factory fns
const Player = (name, sign) => {
    let _name = name;
    let _sign = sign;

    const getName = () => _name;
    const getSign = () => _sign;

    const playerToString = function() {
        return `${this._name}`;
    }

    return { getName, getSign, playerToString };
};

// Controls all game logic and player moves
const GameController = (() => {
    let _currentPlayer = ''; 
    let activePlayers = [];
    let gameOver = false;    
    let gameWon = false; 

    const _createAIPlayer = () => {
        let signChosen = DisplayController.playerInfo[1][1];
        let signForAI = signChosen === 'X'? 'O' : 'X';
        let aiPlayer = Player('AI', signForAI);
        console.log(aiPlayer.getName(), aiPlayer.getSign());
        activePlayers.push(aiPlayer);
    }

    const getCurrentPlayer = () => _currentPlayer;

    const createPlayers = () => {
        return new Promise(function(resolve,reject){
            let p = "Player";
            let player;
            for(let key in DisplayController.playerInfo){
                player = `${p}${key}`;
                let name = DisplayController.playerInfo[key][0];
                let sign = DisplayController.playerInfo[key][1];
                console.log({name, sign});
                player = Player(name,sign);
                console.log(player.getName(), player.getSign());
                activePlayers.push(player);
            }
            
            if(Object.keys(DisplayController.playerInfo).length <= 1) _createAIPlayer();
            activePlayers.length > 0 ? resolve() : reject();
        });
    }

    const switchPlayerTurn = () => {
        if(!gameOver){
            if(_currentPlayer === '') {
                _currentPlayer = activePlayers[0];
            } else if(_currentPlayer === activePlayers[0]){
                _currentPlayer = activePlayers[1];
                if(_currentPlayer.getName() === 'AI') setTimeout(Gameboard.getRandomNum, 250);
            } else if(_currentPlayer === activePlayers[1]){
                _currentPlayer = activePlayers[0];
            }
        }
        return;
    }

    const checkForWin = (tiles) => {
        console.log(`checking if ${tiles} has won`);
        const winningMoves = [
            [0,1,2],[0,3,6],[0,4,8],
            [1,4,7],[2,4,6],[2,5,8],
            [3,4,5],[6,7,8]
        ];
        
        tiles.sort((a,b) => a - b);

        gameWon =  winningMoves.some(function(arr) {    // checks if at least one element passes the test in function below (callback)
                            let count = 0;
                            return arr.every(function(prop) {    // prop = each of the elems in the winning moves array
                                return tiles.indexOf(prop) >= 0;    // checks each elem against this function
                            })
                        });

        if(gameWon) {
            gameOver = true;
            DisplayController.displayGameOver(gameWon);
        }
    }

    const resetGame = () => {
        // Reset global vars
        _currentPlayer = ''; 
        gameOver = false;    
        gameWon = false; 
        activePlayers = [];
    }


    const init = () => {
        return createPlayers()
        .then(switchPlayerTurn());
    }

    return {
        init,
        activePlayers,
        getCurrentPlayer,
        switchPlayerTurn,
        checkForWin,
        resetGame
    }
})();

DisplayController.init();