// Set up gameboard : Gameboard object using Revealing Module Pattern
const Gameboard = (() => { 
    let board = ['','','','','','','','','',];
    // _privateMethods
    const _setField = (n) => {
        return new Promise(function(resolve, reject){
            if(n < 0 || n > 8) {
                reject('Field number out of range');
                return false;
            }
            board[n] = GameController.getCurrentPlayer().getSign();
            console.log(board);
            resolve('Field has been set');
            return true;
        });
       
    }

    // public methods 
    const startNewGame = (mode) => {
        // reset everything
        console.log(`starting game: ${mode}`);
    }

    const checkField = (n) => {
        if(board[n] === '' || board.length === 0){
            console.log('clear! show sign and add to board');
            _setField(n)
            .then(DisplayController.placeSignOnTile(n));
            // checkForWinningMoves (GameController) - await for Xms
            GameController.switchPlayerTurn();
        } 
    }

    return {
        startNewGame,
        checkField
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
        const turnDisplay = document.querySelector('#turn');
        // Apply DRY to hide/show classes 
        gameSettings.classList.remove('show');
        gameSettings.classList.add('hide');
        activeOps.classList.remove('hide');
        activeOps.classList.add('show');
        
        _showCurrentPlayer(turnDisplay);
        _trackPlayerMoves();
        
    }

    const _showCurrentPlayer = (display) => { //Update so we can access display easily
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
        placeSignOnTile
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
    const activePlayers = [];
    let _currentPlayer = ''; 
    
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

    const _createAIPlayer = () => {
        let signChosen = DisplayController.playerInfo[1][1];
        let signForAI = signChosen === 'X'? 'O' : 'X';
        let aiPlayer = Player('AI', signForAI);
        console.log(aiPlayer.getName(), aiPlayer.getSign());
        activePlayers.push(aiPlayer);
        
    }

    const switchPlayerTurn = () => {
        if(_currentPlayer === '') {
            _currentPlayer = activePlayers[0];
        } else if(_currentPlayer === activePlayers[0]){
            _currentPlayer = activePlayers[1];
        } else if(_currentPlayer === activePlayers[1]){
            _currentPlayer = activePlayers[0];
        }
    }


    const init = () => {
        return createPlayers()
        .then(switchPlayerTurn());
        
    }

    /* Make tiles available/unavailable based on players' move */


    /* Check if the player has made a winner move */ 



    return {
        init,
        activePlayers,
        getCurrentPlayer,
        switchPlayerTurn

    }
})();

DisplayController.init();