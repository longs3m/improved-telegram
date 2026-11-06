const display = document.querySelector("#display");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;

function render() {
  display.textContent = currentValue;
}

function inputDigit(digit) {
  if (currentValue === "Error" || waitingForOperand) {
    currentValue = digit;
    waitingForOperand = false;
  } else {
    currentValue = currentValue === "0" ? digit : currentValue + digit;
  }
  render();
}

function inputDecimal() {
  if (currentValue === "Error" || waitingForOperand) {
    currentValue = "0.";
    waitingForOperand = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  render();
}

function calculate(left, right, operator) {
  switch (operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function formatResult(value) {
  if (!Number.isFinite(value)) return "Error";
  return String(Number(value.toPrecision(10)));
}

function chooseOperator(operator) {
  if (currentValue === "Error") clear();
  const inputValue = Number(currentValue);

  if (pendingOperator && !waitingForOperand) {
    const result = calculate(storedValue, inputValue, pendingOperator);
    currentValue = formatResult(result);
    storedValue = result;
    if (currentValue === "Error") {
      pendingOperator = null;
      waitingForOperand = true;
      render();
      return;
    }
  } else {
    storedValue = inputValue;
  }

  pendingOperator = operator;
  waitingForOperand = true;
  render();
}

function equals() {
  if (!pendingOperator || waitingForOperand || currentValue === "Error") return;
  const result = calculate(storedValue, Number(currentValue), pendingOperator);
  currentValue = formatResult(result);
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  render();
}

function clear() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  render();
}

function deleteLast() {
  if (currentValue === "Error" || waitingForOperand) {
    currentValue = "0";
    waitingForOperand = false;
  } else {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
    if (currentValue === "-" || currentValue === "") currentValue = "0";
  }
  render();
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action === "decimal") inputDecimal();
  else if (button.dataset.action === "equals") equals();
  else if (button.dataset.action === "clear") clear();
  else if (button.dataset.action === "delete") deleteLast();
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) inputDigit(event.key);
  else if (event.key === ".") inputDecimal();
  else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") equals();
  else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape") clear();
  else return;

  event.preventDefault();
});
