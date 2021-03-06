const SECRET_LENGTH = 4;

var secret = generateSecret(SECRET_LENGTH);
var guessIndex = 1;

var solved = false;
var showingSecret = false;

/**
 * Generates a random secret of the defined length.
 *
 * @param {number} length the length of the secret
 * @returns {string} the randomly generated secret
 */
function generateSecret(length) {
    var secret = "";

    for (var i = 0; i < length; i++) {
        var number;

        do {
            number = generateRandomNumber(0, 9);
        } while (secret.indexOf(number) != -1);

        secret += number;
    }

    return secret;
}

/**
 * Asks the user for the secret, continues asking until a valid secret is given.
 *
 * @returns {string} the valid secret
 */
function getSecretFromUser() {
    return window.prompt("Please enter a " + SECRET_LENGTH + " digit number (no duplicate digits).");
}

/**
 * Gets the amount of bulls a guess gives when compared to the secret.
 *
 * @param {string} secret the secret value
 * @param {string} guess the guess to get the amount of bulls for
 * @returns {number} bulls
 */
function getBulls(secret, guess) {
    var bulls = 0;

    for (var i = 0; i < SECRET_LENGTH; i++) {
        var secretChar = secret.charAt(i);
        var guessChar = guess.charAt(i);

        if (secretChar == guessChar) {
            bulls++;
        }
    }

    return bulls;
}

/**
 * Gets the amount of cows a guess gives when compared to the secret.
 *
 * @param {string} secret the secret value
 * @param {string} guess the guess to get the amount of cows for
 * @returns {number} cows
 */
function getCows(secret, guess) {
    var cows = 0;

    for (var i = 0; i < SECRET_LENGTH; i++) {
        var secretChar = secret.charAt(i);

        for (var x = 0; x < SECRET_LENGTH; x++) {
            if (i != x) { // if true this is a bull
                var guessChar = guess.charAt(x);

                if (secretChar == guessChar) {
                    cows++;
                    break;
                }
            }
        }
    }

    return cows;
}

/**
 * Checks that the current secret hasn't already been solved by either the user or computer.
 *
 * @returns {boolean} true if secret is unsolved, false otherwise
 */
function checkUnsolved() {
    if (solved) {
        window.alert("This game has already been solved.\nYou must refresh the page before doing that action.");
    }

    return !solved;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 *
 * @param {number} min minimum number
 * @param {number} max maximum number
 * @returns {number} the random number (whole)
 */
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Checks that the number is valid as either the secret or a guess.
 *
 * @param {undefined|string} input
 * @returns {boolean} true if the input is valid, false otherwise
 */
function isInputValid(input) {
    return input !== undefined && input !== null && input.length == SECRET_LENGTH && !isNaN(input) && !hasDuplicateCharacters(input);
}

/**
 * Checks the input to see if it contains any duplicate characters.
 *
 * @param {string} input the string to check for duplicate characters
 * @returns {boolean} true if the input contains duplicate characters, false otherwise
 */
function hasDuplicateCharacters(input) {
    for (var i = 0; i < input.length; i++) {
        if (input.split(input.charAt(i)).length > 2) { // if contained once, there will be 2 halves
            return true;
        }
    }

    return false;
}

/**
 * Converts a string into asterisks, like a password that is hidden from being shown.
 *
 * @param {string} input the input to turn into asterisks
 * @returns {string} the asterisk version of the input
 */
function getAsterisks(input) {
    return input.replace(/./g, "*");
}

/**
 * Pads the input string with the defined character until it is of a certain length.
 *
 * @param {string} input the string to be padded
 * @param {character} padChar the character to pad the string with
 * @param {number} length the final length the output should be
 * @returns {string} the input, padded on the left
 */
function padLeft(input, padChar, length) {
    while (input.length < length) {
        input = padChar + input;
    }

    return input;
}

/**
 * Makes a guess, calculates "bulls and cows" and displays it in the guess table.
 *
 * @param {string} guess the guess to calculate the "bulls and cows" for and display in the guess table
 */
function userEnterGuess(guess) {
    var errorMessage = document.getElementById("errorMessage");

    if (checkUnsolved()) {
        if (isInputValid(guess)) {
            errorMessage.style.visibility = "hidden";
            document.getElementById("guessInput").value = "";

            var bulls = getBulls(secret, guess);
            var cows = getCows(secret, guess);

            displayGuess(guess, bulls, cows);
            guessIndex++;

            if (secret == guess) {
                if (document.getElementById("rickRoll").checked) { // special surprise for winning ;)
                    window.location = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                }

                solved = true;
                computerGuessQueue = []; // we don't need to store this anymore
            } else {
                updateGuessQueue(guess, bulls, cows);
            }
        } else {
            errorMessage.style.visibility = 'visible';
            errorMessage.innerHTML = "Invalid guess.";
        }
    }
}

/**
 * Adds a new row to the guess table and fills the columns with the appropriate data.
 *
 * @param {string} guess the number guessed
 * @param {number} bulls the bull number for this guess
 * @param {number} cows the cow number for this guess
 */
function displayGuess(guess, bulls, cows) {
    var row = document.getElementById("outputTable").insertRow();
    row.insertCell(0).innerHTML = guess;
    row.insertCell(1).innerHTML = bulls.toString();
    row.insertCell(2).innerHTML = cows.toString();
}

function resetGuessTable() {
    var table = document.getElementById("outputTable");

    for (var i = 1; i < table.rows.length; i++) {
        table.deleteRow(i--);
    }
}

/**
 * Toggles whether the secret is showing or not.
 */
function toggleSecret() {
    showingSecret = !showingSecret;
    refreshSecretText();
}

/**
 * Updates the secret text to either the secret value or the asterisk value.
 * Also sets the show/hide button to the correct postion.
 */
function refreshSecretText() {
    if (showingSecret) {
        document.getElementById("secret").innerHTML = secret;
        document.getElementById("secretDisplayToggle").innerHTML = "hide";
    } else {
        document.getElementById("secret").innerHTML = getAsterisks(secret);
        document.getElementById("secretDisplayToggle").innerHTML = "show";
    }
}

/**
 * Allows the secret to be modified, resetting the game.
 */
function editSecret() {
    if (window.confirm("This will cause all game progress to reset, are you sure?")) {
        resetGame();
        var newSecret = getSecretFromUser();

        if (isInputValid(newSecret)) {
            secret = newSecret;
            showingSecret = false;
            refreshSecretText();
        } else {
            window.alert("That number was invalid.");
        }
    }
}

/**
 * Resets the game to it's default state.
 */
function resetGame() {
    resetGuessTable();
    computerGuessQueue = generateCombinationArray();
    guessIndex = 1;
    solved = false;
}

// COMPUTER GUESS STUFF

var primaryGuessQueue = ["0123", "2345", "4567", "6789", "8901"];
var computerGuessQueue = generateCombinationArray();

/**
 * Starts the process of calculating the secret number.
 */
function doComputerGuess() {
    if (checkUnsolved()) {
        // do primary guesses
        for (var i = 0; i < primaryGuessQueue.length; i++) {
            var guess = primaryGuessQueue[i];

            // check we haven't already ruled this guess out
            if (computerGuessQueue.indexOf(guess) != -1) {
                if (makeComputerGuess(guess)) {
                    return; // return if we solve it here
                }
            }
        }

        var queueLength;
        var nextIndex = 0;

        while ((queueLength = computerGuessQueue.length) > 0) {
            if (guessIndex % 3 == 0) {
                nextIndex = queueLength - 1;
            } else if (guessIndex % 2 == 0) {
                nextIndex = Math.floor(queueLength / 2);
            } else {
                nextIndex = 0;
            }

            if (makeComputerGuess(computerGuessQueue[nextIndex])) {
                break;
            }
        }
    }
}

/**
 * Generates a new array with all possible combinations.
 * This will not include any combinations which have duplicate characters, as these are invalid.
 *
 * @returns {Array.<String>} the combination array
 */
function generateCombinationArray() {
    var guessQueue = [];
    var arrayCounter = 0;

    for (var i = 123; i < 9876; i++) {
        var numberString = i.toString();
        var leadingZerosRequired = SECRET_LENGTH - numberString.length;

        for (var x = 0; x < leadingZerosRequired; x++) {
            numberString = "0" + numberString;
        }

        if (!hasDuplicateCharacters(numberString)) {
            guessQueue[arrayCounter++] = numberString;
        }
    }

    return guessQueue;
}

/**
 * Makes a guess which will be displayed in the guess table.
 * This function takes the bulls and cows output and uses the process of elimination.
 *
 * @param {string} guess the guess being made
 * @returns {boolean} true if the secret number has been figured out, false otherwise
 */
function makeComputerGuess(guess) { // returns false until answer is found
    var bulls = getBulls(secret, guess);
    var cows = getCows(secret, guess);

    displayGuess(guess, bulls, cows);
    guessIndex++;

    if (bulls == SECRET_LENGTH) {
        window.alert("Secret is: " + guess + ", took " + (guessIndex - 1) + " guesses.");
        solved = true;
        computerGuessQueue = []; // we don't need to store this anymore
        return true;
    } else {
        updateGuessQueue(guess, bulls, cows);
    }

    return false;
}

/**
 * Takes a guess, and the amount of bulls and cows it contains and uses this data to eliminate other potential guesses.
 * Example: a guess receives 0 bulls or cows, this means that the secret cannot contain any of the characters used in the guess.
 *          So all guesses containing such characters are removed from the array.
 *
 * @param {string} guess the guess
 * @param {number} bulls the bulls this guess contains
 * @param {number} cows the cows this guess contains
 */
function updateGuessQueue(guess, bulls, cows) {
    computerGuessQueue.splice(computerGuessQueue.indexOf(guess), 1); // remove used guess from queue
    var guessArray = guess.split("");

    if (bulls == 0) { // remove all numbers containing any of the digits used in this guess
        if (cows == 0) {
            eliminateElementsContainingAny(guessArray);
        } else {
            eliminateElementsMatchingIndex(guessArray);
        }
    } else {
        eliminateElementsNotHardMatching(guessArray, bulls);

        if (cows > 0) {
            eliminateElementsNotSoftMatching(guessArray, bulls + cows);
        }
    }
}

/**
 * Removes all elements from {@link computerGuessQueue} which have at least 1 matching character
 * with the same index.
 *
 * @param {Array.<String>} characters
 */
function eliminateElementsMatchingIndex(characters) {
    for (var x = 0; x < characters.length; x++) {
        var searchCharacter = characters[x];
        for (var y = 0; y < computerGuessQueue.length; y++) { // loop through all guesses
            var element = computerGuessQueue[y];
            var elementCharacter = element.charAt(x);

            if (searchCharacter == elementCharacter) {
                computerGuessQueue.splice(y, 1);
                y--;
            }
        }
    }
}

/**
 * Removes all elements from {@link computerGuessQueue} which do not have the specified amount of soft matches.
 * A soft match is when the character is contained in the array but in the wrong position.
 * A soft match can also be known as a "Cow" in the game "Cows & Bulls".
 *
 * @param {Array.<String>} partiallyCorrectElements a string array, whereby only some of them are correct
 * @param {number} softMatchesRequired the amount of "soft matches" required
 */
function eliminateElementsNotSoftMatching(partiallyCorrectElements, softMatchesRequired) {
    for (var x = 0; x < computerGuessQueue.length; x++) {
        var element = computerGuessQueue[x];
        var matches = 0;

        for (var y = 0; y < partiallyCorrectElements.length; y++) {
            var character = partiallyCorrectElements[y];

            if (element.indexOf(character) != -1) { // found character
                matches++;
            }
        }

        // if at least 1 character wasn't found, remove from the array
        if (matches < softMatchesRequired) {
            computerGuessQueue.splice(x, 1);
            x--;
        }
    }
}

/**
 * Removes all elements from {@link computerGuessQueue} which do not have the specified amount of hard matches.
 * A hard match is when the character is contained in the array but in the wrong position.
 * A hard match can also be known as a "Bull" in the game "Cows & Bulls".
 *
 * @param {Array.<String>} partiallyCorrectElements a string array, whereby only some of them are correct
 * @param {number} hardMatchesRequired the amount of "hard matches" required
 */
function eliminateElementsNotHardMatching(partiallyCorrectElements, hardMatchesRequired) {
    for (var x = 0; x < computerGuessQueue.length; x++) {
        var element = computerGuessQueue[x];
        var bullMatches = 0;

        for (var y = 0; y < element.length; y++) {
            if (element.charAt(y) == partiallyCorrectElements[y]) {
                bullMatches++;
            }
        }

        if (bullMatches < hardMatchesRequired) {
            computerGuessQueue.splice(x, 1);
            x--;
        }
    }
}

/**
 * Removes all elements from {@link computerGuessQueue} which contain <b>any</b> of the incorrect elements.
 *
 * @param {Array.<String>} incorrectElements a string array of incorrect elements
 */
function eliminateElementsContainingAny(incorrectElements) {
    for (var x = 0; x < computerGuessQueue.length; x++) {
        var element = computerGuessQueue[x];
        var characterFound = false;

        for (var y = 0; y < incorrectElements.length; y++) {
            var character = incorrectElements[y];

            if (element.indexOf(character) != -1) { // found character
                characterFound = true;
                break;
            }
        }

        // if at least 1 character was found, remove from the array
        if (characterFound) {
            computerGuessQueue.splice(x, 1);
            x--;
        }
    }
}