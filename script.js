const roundTemplate = document.getElementById("round-template");
const simulationCount = document.getElementById("simulation-count");
const run = document.getElementById("run");
const exportData = document.getElementById("export");
const reset = document.getElementById("reset");
const speed = document.getElementById("speed");
const simulationText = document.getElementById("simulation-text");
const speedText = document.getElementById("speed-text");

const go = document.getElementsByClassName("go");

const rounds = document.getElementsByClassName("Rounds")[0];

const SPIN_RATE = 100;

const ColourPointsMap = {
    ["Red"]: 2,
    ["Green"]: 0,
    ["Blue"]: -2
};

function onClick(goButton) {
    const components = goButton.parentElement;
    const round = components.parentElement;

    const result = round.querySelectorAll(".Result")[0];

    const dice = components.querySelectorAll(".Dice")[0];

    const spinner = components.querySelectorAll(".Spinner")[0];
    const selectedSpinArea = spinner.children[randomInclusive(0, 2)];
    const CYCLES = (speed.value * 1000) / SPIN_RATE;

    let spinnerIndex = 0;
    let currentlySelected;
    const spinnerIntervalId = setInterval(() => {
        spinnerIndex++;

        if (currentlySelected) {
            currentlySelected.classList.remove("Selected");
        };

        currentlySelected = spinner.children[spinnerIndex % 3];
        currentlySelected.classList.add("Selected");

        if (spinnerIndex >= CYCLES) {
            clearInterval(spinnerIntervalId);
        };
    }, SPIN_RATE);

    const dice1Value = randomInclusive(1, 6);
    const dice2Value = randomInclusive(1, 6);

    let i = 0;
    const diceIntervalId = setInterval(() => {
        i++;

        for (const die of dice.children) {
            die.textContent = randomInclusive(1, 6);
        };

        if (i >= CYCLES) {
            clearInterval(diceIntervalId);
        };
    }, SPIN_RATE);

    setTimeout(() => {
        currentlySelected.classList.remove("Selected");
        selectedSpinArea.classList.add("Selected");

        dice.children[0].textContent = `Dice 1: ${dice1Value}`;
        dice.children[1].textContent = `Dice 2: ${dice2Value}`;

        const colour = selectedSpinArea.textContent;

        const diceSum = dice1Value + dice2Value;
        const colourPoint = ColourPointsMap[colour];

        const spinColourParagraph = result.querySelectorAll(".pSpinColour")[0];
        spinColourParagraph.querySelectorAll(".SpinColour")[0].textContent = colour;
        spinColourParagraph.querySelectorAll(".SpinPoints")[0].textContent = colourPoint;

        const diceSumParagraph = result.querySelectorAll(".pDiceSum")[0];
        diceSumParagraph.querySelectorAll(".DiceSum")[0].textContent = diceSum;

        const totalParagraph = result.querySelectorAll(".pTotal")[0];

        const totalSpan = totalParagraph.querySelectorAll(".Total")[0];
        totalSpan.textContent = (parseInt(totalSpan.textContent) || 0) + diceSum + colourPoint;
    }, CYCLES * SPIN_RATE);
};

function cloneRound(id = 1) {
    const round = roundTemplate.content.cloneNode(true).firstElementChild;

    round.querySelectorAll("p")[0].textContent = `Round ${id}`;
    rounds.appendChild(round);

    const goButton = round.querySelectorAll(".Components")[0].querySelectorAll(".go")[0];
    goButton.addEventListener("click", () => {
        onClick(goButton);
    });
};

function randomInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

simulationCount.addEventListener("input", () => {
    simulationText.value = "";
    simulationText.placeholder = simulationCount.value;
    rounds.replaceChildren();

    for (let i = 0; i < simulationCount.value; i++) {
        cloneRound(i + 1);
    };
});

simulationText.addEventListener("keydown", event => {
    if (event.key == "Enter") {
        const amount = parseInt(simulationText.value);

        if (amount && amount <= 1000) {
            rounds.replaceChildren();

            for (let i = 0; i < amount; i++) {
                cloneRound(i + 1);
            };
        };
    };
});

speed.addEventListener("input", () => {
    speedText.textContent = speed.value;
});

(() => {
    for (let i = 0; i < simulationCount.value; i++) {
        cloneRound(i + 1);
    };
})();

run.addEventListener("click", () => {
    for (let i = 0; i < rounds.children.length; i++) {
        const round = rounds.children[i];
        onClick(round.querySelectorAll(".Components")[0].querySelectorAll(".go")[0]);
    };
});

reset.addEventListener("click", () => {
    window.location.reload();
});

exportData.addEventListener("click", () => {
    let csv = "Trial,Spinner,Dice Sum,X\n";

    const count = (simulationText.value || simulationCount.placeholder) || 1;
    const keys = Object.keys(ColourPointsMap);
    console.log(keys);
    
    for (let trial = 0; trial < count; trial++) {
        const colour = keys[Math.floor(Math.random() * keys.length)];
        const spinnerValue = ColourPointsMap[colour];

        const dice1 = randomInclusive(1, 6);
        const dice2 = randomInclusive(1, 6);
        const diceSum = dice1 + dice2;

        const x = diceSum + spinnerValue;

        csv += `${trial + 1},${colour},${diceSum},${x}\n`;
    };

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `game_trials_${count}.csv`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
});