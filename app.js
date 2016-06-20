'use strict';

(function() {
    const _ = window._;
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    const largestCard = 12;

    function shuffleArray(a) {
        var j, x, i;
        for (i = a.length; i; i -= 1) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }

    const deckService = (function() {
        let deck;

        return {
            newDeck: function() {
                deck = [];

                for(var i = 1; i <= largestCard; i++) {
                    deck.push({
                        value: i,
                        flipped: false,
                        matched: false
                    });
                    deck.push({
                        value: i,
                        flipped: false,
                        matched: false
                    });
                }
                shuffleArray(deck);
                _.forEach(deck, function(card, index) {
                    card.index = index;
                });

                return deck;
            },
            getCards: function() {
                return deck;
            }
        };
    }());

    const Card = React.createClass({

        flipCard: function() {
            this.props.flipCard(this.props.card);
        },

        render: function() {
            return React.createElement(
                'div',
                { className: 'Card' + (this.props.card.flipped ? ' is-flipped' : '') + (this.props.card.matched ? ' is-matched' : ''), onClick: this.flipCard },
                React.createElement(
                    'div',
                    { className: 'Card-face' },
                    this.props.card.value
                ),
                React.createElement(
                    'div',
                    { className: 'Card-back' }
                )
            );
        }
    });

    const GameBoard = React.createClass({

        matched: 0,

        getInitialState: function() {
            return {
                playerScore1: 0,
                playerScore2: 0,
                currentPlayer: 1,
                deck: deckService.newDeck(),
                flippedCard: false,
                gameOver: false
            };
        },

        newGame: function() {
            this.matched = 0;
            this.setState({
                playerScore1: 0,
                playerScore2: 0,
                currentPlayer: 1,
                deck: deckService.newDeck(),
                flippedCard: false,
                gameOver: false
            });
        },

        flipCard: function(card) {
            const board = this;
            if (board.isLocked) return;

            const newCard = Object.create(card);
            newCard.flipped = true;
            const newDeck = Array.from(this.state.deck);
            newDeck[newCard.index] = newCard;
            this.setState({ deck: newDeck });

            if (!this.state.flippedCard) {
                this.setState({ flippedCard: newCard });
            }
            else {
                board.isLocked = true;
                setTimeout(function() {
                    const newDeck = Array.from(board.state.deck);
                    const firstCard = Object.create(board.state.flippedCard);
                    const secondCard = Object.create(newCard);
                    if (firstCard.value === secondCard.value) {
                        firstCard.matched = secondCard.matched = true;
                        board.matched++;
                        if (board.state.currentPlayer) {
                            board.setState({ playerScore1: board.state.playerScore1+1 });
                        }
                        else {
                            board.setState({ playerScore2: board.state.playerScore2+1 });
                        }
                        if (board.matched === largestCard) {
                            board.setState({ gameOver: true });
                        }
                    }
                    else {
                        firstCard.flipped = secondCard.flipped = false;
                    }
                    newDeck[firstCard.index] = firstCard;
                    newDeck[secondCard.index] = secondCard;
                    board.setState({ deck: newDeck, flippedCard: false, currentPlayer: !board.state.currentPlayer });
                    board.isLocked = false;
                }, 1500);
            }
        },

        render: function() {
            const board = this;
            const cards = this.state.deck.map(function(card, i) {
                return React.createElement(
                    Card,
                    { card: card, flipCard: board.flipCard, key: i }
                );
            });
            let title = 'Player ' + (this.state.currentPlayer ? '1' : '2') + '\'s Turn';
            let modal = null;
            if (this.state.gameOver) {
                if (this.state.playerScore1 === this.state.playerScore2) {
                    title = 'Game Over. It\'s a tie!';
                }
                else {
                    title = 'Player ' + (this.state.playerScore1 > this.state.playerScore2 ? '1' : '2') + ' wins!'
                }
                modal = React.createElement(
                    'div',
                    { className: 'Modal' },
                    React.createElement(
                        'p',
                        { className: 'Modal-title' },
                        'Play again?'
                    ),
                    React.createElement(
                        'button',
                        { onClick: this.newGame },
                        'Let\'s go!'
                    )
                )
            }

            return React.createElement(
                'div',
                { className: '' },
                React.createElement('h1', null, title),
                cards,
                React.createElement(
                    'p', null,
                    'Player 1\'s Score: ' + this.state.playerScore1 + '  Player 2\'s Score: ' + this.state.playerScore2
                ),
                modal
            );
        }
    });

    ReactDOM.render(React.createElement(GameBoard), document.getElementById('GameBoard'));
}());
