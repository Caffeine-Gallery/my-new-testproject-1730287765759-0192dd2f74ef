import { backend } from 'declarations/backend';

const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');
const loading = document.getElementById('loading');

let currentInput = '';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        if (button.classList.contains('num')) {
            if (waitingForSecondOperand) {
                currentInput = value;
                waitingForSecondOperand = false;
            } else {
                currentInput += value;
            }
            display.value = currentInput;
        } else if (button.classList.contains('op')) {
            if (firstOperand === null) {
                firstOperand = parseFloat(currentInput);
            } else if (operator) {
                const result = operate(firstOperand, parseFloat(currentInput), operator);
                display.value = result;
                firstOperand = result;
            }
            operator = value;
            waitingForSecondOperand = true;
        } else if (value === '=') {
            if (operator && firstOperand !== null) {
                calculateResult();
            }
        } else if (value === 'C') {
            clear();
        }
    });
});

async function calculateResult() {
    if (operator && firstOperand !== null) {
        const secondOperand = parseFloat(currentInput);
        loading.classList.remove('hidden');
        try {
            const result = await operate(firstOperand, secondOperand, operator);
            display.value = result;
            firstOperand = result;
            currentInput = result.toString();
            operator = null;
        } catch (error) {
            display.value = 'Error';
        } finally {
            loading.classList.add('hidden');
        }
    }
}

async function operate(a, b, op) {
    switch (op) {
        case '+':
            return await backend.add(a, b);
        case '-':
            return await backend.subtract(a, b);
        case '*':
            return await backend.multiply(a, b);
        case '/':
            if (b === 0) {
                throw new Error('Division by zero');
            }
            return await backend.divide(a, b);
        default:
            throw new Error('Invalid operator');
    }
}

function clear() {
    currentInput = '';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    display.value = '';
}
