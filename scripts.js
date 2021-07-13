// Set up gameboard : Gameboard object using Revealing Module Pattern
const Gameboard = (() => { 
    const _board = ['','','','','','','','','',];
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
            if(sign === 'X') {
                _xCount++;
                xTiles.push(n);
                if(_xCount >= 3) GameController.checkForWin(xTiles);
            } else if(sign === 'O') {
                _oCount++;
                oTiles.push(n);
                if(_oCount >= 3) GameController.checkForWin(oTiles);
            }
            console.log(_board);
            resolve('Field has been set');
        });
    }

    // public methods 
    const startNewGame = (mode) => {
        // reset everything
        console.log(`starting game: ${mode}`);
    }

    const getBoard = () => _board;

    const checkField = (n) => {
        if(_board[n] === '' || _board.length === 0){
            console.log('clear! show sign and add to board');
            _setField(n)
            .then(DisplayController.placeSignOnTile(n));
            // checkForWinningMoves (GameController) - await for Xms
            GameController.switchPlayerTurn();
            setTimeout(DisplayController.showCurrentPlayer, 200);
        } else if(GameController.getCurrentPlayer().getName() === 'AI'){
            getRandomNum();
        }
    }

    const getRandomNum = () => {
        let randomNum = Math.floor(Math.random() * 9);
        checkField(randomNum);
        
    }

    return {
        startNewGame,
        getBoard,
        checkField,
        getRandomNum
    };
})(); //IIFE 

// Set up display : Display Controller object using Revealing Module Pattern
/*
 *  TODO: Implement form validation: If player(s) have no filled out name and/or sign, the button to Begin game will not become Active. Once they do, the button is enabled and calls Gameboard.startGame and Players objs.
 */ 
const DisplayController = (() => {
    const setupBtn = document.getElementById('setup-game');
    const playerSelBtns = document.querySelectorAll('[data-group="player-selection"] label.radio');
    const playerSelectionOps = document.querySelector('[data-group="player-selection"]');
    const startBtn = document.querySelectorAll('.start-game');
    const inputFields = document.querySelectorAll('input[type="text"]');
    let modeSelected = ''; 
    let playerInfo = {};

    const _gameControlsListeners = () => {
        setupBtn.addEventListener('click', function() {
            this.classList.add('hide');
            _showPlayerOptions();
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
                } else {
                    _validateInput();
                }
            }
        ));

        startBtn.forEach( startBtn => startBtn.addEventListener(
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
            }
        )); 

    }

    const _showPlayerOptions = () => {
        playerSelectionOps.classList.remove('hide');
        playerSelectionOps.classList.add('show');
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
        // let radioFields = document.querySelectorAll('div.show input[type="radio"]');
        // radioFields.forEach( field => {
        //     if(field.checked) {
        //         field.setAttribute('data-valid', true);
        //     }
        //     field.closest('input[type="radio"').setAttribute('data-valid', true); // set 'sibling' radio to true as well
        // });
    }

    const _activeGame = () => {
        const gameSettings = document.querySelector('div.show');
        const activeOps = document.querySelector('div.active-game');
        
        // Apply DRY to hide/show classes 
        gameSettings.classList.remove('show');
        gameSettings.classList.add('hide');
        activeOps.classList.remove('hide');
        activeOps.classList.add('show');
        
        showCurrentPlayer();
        _trackPlayerMoves();
        
    }

    const showCurrentPlayer = () => { //Update so we can access display easily
        let display = document.querySelector('#turn');
        display.innerHTML = GameController.getCurrentPlayer().getName();
    }

    const _trackPlayerMoves = () => {
        let tiles = document.querySelectorAll('#gameboard td');
        tiles.forEach( tile => tile.addEventListener('click', function(){
                let num = this.dataset.index;
                Gameboard.checkField(num);
            }
        ));
    }

    const placeSignOnTile = (n) => {
        let selectedTile = document.querySelector(`#gameboard td[data-index="${n}`);
        let sign = GameController.getCurrentPlayer().getSign();
        selectedTile.innerHTML = `<span class="sign">${sign}</span>`;
    }

    const init = () => {
        _gameControlsListeners();
    }

    return {
        init,
        modeSelected,
        playerInfo,
        placeSignOnTile,
        showCurrentPlayer

    };

})();

// Set up players : Players objects using factory fns
const Player = (name, sign) => {
    let _name = name;
    let _sign = sign;

    const getName = () => _name;
    const getSign = () => _sign;

    return { getName, getSign };
};

// Controls all game logic and player moves
const GameController = (() => {
    let _currentPlayer = ''; 
    const activePlayers = [];
    const gameOver = false;    

    const _createAIPlayer = () => {
        let signChosen = DisplayController.playerInfo[1][1];
        let signForAI = signChosen === 'X'? 'O' : 'X';
        let aiPlayer = Player('AI', signForAI);
        console.log(aiPlayer.getName(), aiPlayer.getSign());
        activePlayers.push(aiPlayer);
        
    }

    const _winningMoves = {
        0 : new Map([[1,2],[3,6],[4,8]]),
        1 : new Map([[0,2],[4,7]]),
        2 : new Map([[0,1],[4,6],[5,8]]),
        3 : [[0,6],[4,5]],
        4 : new Map([[0,8],[1,7],[2,6],[3,5]]),
        5 : new Map([[2,5],[3,5],[4,5],[8,5]]),
        6 : new Map([[0,6],[2,6],[3,6],[4,6],[7,6],[8,6]]),
        7 : new Map([[1,7],[4,7],[6,7],[8,7]]),
        8 : new Map([[0,8],[2,8],[4,8],[5,8],[6,8],[7,8]]),
    };

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
        if(_currentPlayer === '') {
            _currentPlayer = activePlayers[0];
        } else if(_currentPlayer === activePlayers[0]){
            _currentPlayer = activePlayers[1];
            if(_currentPlayer.getName() === 'AI') setTimeout(Gameboard.getRandomNum, 250);
        } else if(_currentPlayer === activePlayers[1]){
            _currentPlayer = activePlayers[0];
        }
    }

    const checkForWin = (tiles) => {
        console.log(`checking if ${tiles} has won`);
        let lastPlay = tiles[tiles.length - 1];
        let count = 0;

        for(let i = tiles.length - 2; i >= 0; i--){
            for(let j = 0; j < _winningMoves[lastPlay].length; j++){
                let x = 0;
                while(x <= _winningMoves[lastPlay][j].length){
                    console.log(tiles[i]);
                    console.log(_winningMoves[lastPlay][j][x]);
                    if(tiles[i] == _winningMoves[lastPlay][j][x]){

                        count++;
                        if(count >= 2) { 
                            console.log(`${_currentPlayer} has won!`);
                            window.alert('Winner!');
                            return;
                        }
                        break;
                    } else { 
                        x++;
                    }
                }
                
            }
        }
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
        checkForWin

    }
})();

DisplayController.init();