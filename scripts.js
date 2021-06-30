// Set up gameboard : Gameboard object using Revealing Module Pattern
const Gameboard = (() => { 
    let board = new Array(9);
    // _privateMethods

    // public methods 
    const startNewGame = (mode) => {
        console.log(`starting game: ${mode}`);
    }

    return {
        startNewGame,
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

    const init = () => {
        _gameControlsListeners();
    }

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

    return {
        init,
        modeSelected,
        playerInfo,
    };

})();

// Set up players : Players objects using factory fns
const Player = (name, sign) => {
    let _name = name;
    let _sign = sign;

    const getName = () => _name;
    const getSign = () => _sign;

    return { getName, getSign, };
};

// Controls all game logic and player abilities (moves)
const GameController = (() => {
    const createPlayers = () => {
        let p = "Player";
        // console.log(DisplayController.playerInfo);
        for(let key in DisplayController.playerInfo){
            let player = `${p}${key}`;
            let name = DisplayController.playerInfo[key][0];
            let sign = DisplayController.playerInfo[key][1];
            console.log({name, sign});
            player = Player(name,sign);
            console.log(player.getName(), player.getSign());
        }
    }

    const init = () => {
        createPlayers();
    }

    return {
        init
    }
})();

DisplayController.init();