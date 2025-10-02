// Calculator State Variables
let currentOperand = '';
let previousOperand = '';
let operation = null;
let isScientific = false;
let angleMode = 'deg'; // 'deg' or 'rad'
let memory = 0;
let history = [];

// DOM Elements
const currentOperandElement = document.getElementById('currentOperand');
const previousOperandElement = document.getElementById('previousOperand');
const historyElement = document.getElementById('history');
const memoryDisplayElement = document.getElementById('memoryDisplay');

// Display Functions
function updateDisplay() {
    currentOperandElement.innerText = currentOperand || '0';
    if (operation != null) {
        previousOperandElement.innerText = `${previousOperand} ${operation}`;
    } else {
        previousOperandElement.innerText = '';
    }
    updateMemoryDisplay();
}

function updateMemoryDisplay() {
    if (memoryDisplayElement) {
        memoryDisplayElement.innerText = memory !== 0 ? `M: ${memory}` : '';
    }
}

// Mode Functions
function setMode(mode) {
    isScientific = mode === 'scientific';
    const basicButtons = document.getElementById('basicButtons');
    const scientificButtons = document.getElementById('scientificButtons');
    const scientificPanel = document.getElementById('scientificPanel');
    const modeButtons = document.querySelectorAll('.mode-btn');

    modeButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (isScientific) {
        if (basicButtons) basicButtons.style.display = 'none';
        if (scientificButtons) scientificButtons.style.display = 'grid';
        if (scientificPanel) scientificPanel.classList.add('active');
    } else {
        if (basicButtons) basicButtons.style.display = 'grid';
        if (scientificButtons) scientificButtons.style.display = 'none';
        if (scientificPanel) scientificPanel.classList.remove('active');
    }
}

// Input Functions
function appendNumber(number) {
    if (number === '.' && currentOperand.includes('.')) return;
    if (currentOperand.length >= 15) return;
    
    currentOperand = currentOperand.toString() + number.toString();
    updateDisplay();
    
    if (currentOperandElement) {
        currentOperandElement.style.transform = 'scale(1.02)';
        setTimeout(() => {
            currentOperandElement.style.transform = 'scale(1)';
        }, 100);
    }
}

function appendOperator(op) {
    if (currentOperand === '' && op !== '-' && op !== '(') return;
    
    if (op === '(' || op === ')') {
        currentOperand += op;
        updateDisplay();
        return;
    }
    
    if (previousOperand !== '' && currentOperand !== '') {
        calculate();
    }
    
    operation = op;
    previousOperand = currentOperand;
    currentOperand = '';
    updateDisplay();
}

function appendFunction(func) {
    currentOperand += func;
    updateDisplay();
}

function appendConstant(constant) {
    if (constant === 'π') {
        currentOperand += Math.PI.toString();
    } else if (constant === 'e') {
        currentOperand += Math.E.toString();
    }
    updateDisplay();
}

// Calculation Functions
function calculate() {
    try {
        let expression = currentOperand || previousOperand + operation + currentOperand;
        let result;

        // Handle special functions
        expression = expression.replace(/sin\(/g, 'Math.sin(');
        expression = expression.replace(/cos\(/g, 'Math.cos(');
        expression = expression.replace(/tan\(/g, 'Math.tan(');
        expression = expression.replace(/asin\(/g, 'Math.asin(');
        expression = expression.replace(/acos\(/g, 'Math.acos(');
        expression = expression.replace(/atan\(/g, 'Math.atan(');
        expression = expression.replace(/log\(/g, 'Math.log10(');
        expression = expression.replace(/ln\(/g, 'Math.log(');
        expression = expression.replace(/√\(/g, 'Math.sqrt(');
        expression = expression.replace(/\|\(/g, 'Math.abs(');
        expression = expression.replace(/1\/\(/g, '1/(');
        expression = expression.replace(/random\(\)/g, 'Math.random()');
        expression = expression.replace(/\^/g, '**');
        expression = expression.replace(/×/g, '*');
        expression = expression.replace(/÷/g, '/');

        // Handle factorial
        expression = expression.replace(/(\d+)!/g, (match, num) => {
            return factorial(parseInt(num));
        });

        // Convert angles if in degree mode
        if (angleMode === 'deg') {
            expression = expression.replace(/Math\.(sin|cos|tan)\(/g, (match, func) => {
                return `Math.${func}(Math.PI/180*`;
            });
            expression = expression.replace(/Math\.(asin|acos|atan)\(/g, (match, func) => {
                return `(180/Math.PI)*Math.${func}(`;
            });
        }

        result = eval(expression);

        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid calculation');
        }

        // Add to history
        if (historyElement) {
            history.unshift(`${previousOperand || currentOperand} = ${result}`);
            if (history.length > 3) history.pop();
            historyElement.innerText = history.join(' | ');
        }

        currentOperand = result.toString();
        operation = null;
        previousOperand = '';
        updateDisplay();

        // Success animation
        if (currentOperandElement) {
            currentOperandElement.style.transform = 'scale(1.05)';
            currentOperandElement.style.color = '#60a5fa';
            setTimeout(() => {
                currentOperandElement.style.transform = 'scale(1)';
                currentOperandElement.style.color = '#e0e0e0';
            }, 300);
        }

    } catch (error) {
        currentOperand = 'Error';
        if (currentOperandElement) {
            currentOperandElement.classList.add('error');
            setTimeout(() => {
                currentOperandElement.classList.remove('error');
                clearAll();
            }, 2000);
        }
        updateDisplay();
    }
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Clear Functions
function clearAll() {
    currentOperand = '';
    previousOperand = '';
    operation = null;
    updateDisplay();
    
    const calculator = document.querySelector('.calculator');
    if (calculator) {
        calculator.style.transform = 'scale(0.98)';
        setTimeout(() => {
            calculator.style.transform = 'scale(1)';
        }, 150);
    }
}

function deleteLast() {
    currentOperand = currentOperand.toString().slice(0, -1);
    updateDisplay();
}

// Scientific Functions
function squareNumber() {
    if (currentOperand) {
        currentOperand = (Math.pow(parseFloat(currentOperand), 2)).toString();
        updateDisplay();
    }
}

function cubeNumber() {
    if (currentOperand) {
        currentOperand = (Math.pow(parseFloat(currentOperand), 3)).toString();
        updateDisplay();
    }
}

function toggleSign() {
    if (currentOperand && currentOperand !== '0') {
        currentOperand = currentOperand.startsWith('-') 
            ? currentOperand.slice(1) 
            : '-' + currentOperand;
        updateDisplay();
    }
}

function toggleAngleMode() {
    angleMode = angleMode === 'deg' ? 'rad' : 'deg';
    const angleModeBtn = document.querySelector('.angle-mode-btn');
    if (angleModeBtn) {
        angleModeBtn.innerText = angleMode.toUpperCase();
    }
}

// Memory Functions
function memoryStore() {
    if (currentOperand) {
        memory = parseFloat(currentOperand);
        updateDisplay();
    }
}

function memoryRecall() {
    currentOperand = memory.toString();
    updateDisplay();
}

function memoryClear() {
    memory = 0;
    updateDisplay();
}

function memoryAdd() {
    if (currentOperand) {
        memory += parseFloat(currentOperand);
        updateDisplay();
    }
}

function memorySubtract() {
    if (currentOperand) {
        memory -= parseFloat(currentOperand);
        updateDisplay();
    }
}

// Keyboard Support
document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
    } else if (event.key === '.') {
        appendNumber('.');
    } else if (event.key === '+') {
        appendOperator('+');
    } else if (event.key === '-') {
        appendOperator('-');
    } else if (event.key === '*') {
        appendOperator('×');
    } else if (event.key === '/') {
        event.preventDefault();
        appendOperator('÷');
    } else if (event.key === '(' || event.key === ')') {
        appendOperator(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
        calculate();
    } else if (event.key === 'Escape') {
        clearAll();
    } else if (event.key === 'Backspace') {
        deleteLast();
    }
});

// Initialize
updateDisplay();
