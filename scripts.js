// Set up gameboard : Gameboard object using Revealing Module Pattern
const Gameboard = (() => { 
    let board = [];
    // _privateMethods

    // public methods 

    return {};
})(); //IIFE 

// Set up display : Display Controller object using Revealing Module Pattern
const DisplayController = (() => {
    const setupBtn = document.getElementById('setup-game');
    const playerSelBtns = document.querySelectorAll('[data-group="player-selection"] label.radio');
    const playerSelectionOps = document.querySelector('[data-group="player-selection"]');

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
            
    }
    const _showPlayerOptions = () => {
        playerSelectionOps.classList.remove('hide');
        playerSelectionOps.classList.add('show');
    }

    const _showGameSettings= (selection) => {
        let onePlayerOps = document.querySelector('[data-group="one-player"');
        let twoPlayerOps = document.querySelector('[data-group="two-players"');
        if(selection === 'One Player'){
            onePlayerOps.classList.remove('hide');
            onePlayerOps.classList.add('show');
        } else if(selection === "Two Players") {
            twoPlayerOps.classList.remove('hide');
            twoPlayerOps.classList.add('show');
        }
    }

    return {
        init,
    };


})();

// Set up players : Players objects using factory fns
const Player = (name, score) => {
    // methods

    return {};
}

DisplayController.init();