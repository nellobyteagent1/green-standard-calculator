(() => {
    const display = document.getElementById('result');
    const expr = document.getElementById('expression');

    let current = '0';
    let previous = '';
    let operator = null;
    let shouldReset = false;
    let lastResult = null;

    const OP_SYMBOLS = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };

    function updateDisplay() {
        display.textContent = current;
        display.classList.toggle('small', current.length > 10);
    }

    function updateExpression() {
        if (previous && operator) {
            expr.textContent = `${previous} ${OP_SYMBOLS[operator] || operator}`;
        } else {
            expr.textContent = '';
        }
    }

    function clearAll() {
        current = '0';
        previous = '';
        operator = null;
        shouldReset = false;
        lastResult = null;
        updateDisplay();
        updateExpression();
        clearActiveOp();
    }

    function deleteLast() {
        if (shouldReset) return;
        current = current.length > 1 ? current.slice(0, -1) : '0';
        updateDisplay();
    }

    function appendDigit(d) {
        if (shouldReset) {
            current = d;
            shouldReset = false;
        } else if (current === '0' && d !== '.') {
            current = d;
        } else {
            if (current.length >= 15) return;
            current += d;
        }
        updateDisplay();
    }

    function appendDecimal() {
        if (shouldReset) {
            current = '0.';
            shouldReset = false;
        } else if (!current.includes('.')) {
            current += '.';
        }
        updateDisplay();
    }

    function setOperator(op) {
        if (operator && !shouldReset) {
            calculate();
        }
        previous = current;
        operator = op;
        shouldReset = true;
        updateExpression();
        setActiveOp(op);
    }

    function calculate() {
        if (!operator || previous === '') return;
        const a = parseFloat(previous);
        const b = parseFloat(current);
        let result;

        switch (operator) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/':
                if (b === 0) {
                    current = 'Error';
                    previous = '';
                    operator = null;
                    shouldReset = true;
                    lastResult = null;
                    updateDisplay();
                    updateExpression();
                    clearActiveOp();
                    return;
                }
                result = a / b;
                break;
        }

        // Handle floating point display
        if (Number.isFinite(result)) {
            const s = result.toPrecision(12);
            current = parseFloat(s).toString();
            if (current.length > 15) {
                current = result.toExponential(6);
            }
        } else {
            current = 'Error';
        }

        lastResult = current;
        previous = '';
        operator = null;
        shouldReset = true;
        updateDisplay();
        updateExpression();
        clearActiveOp();
    }

    function handlePercent() {
        const val = parseFloat(current);
        if (isNaN(val)) return;
        current = (val / 100).toString();
        updateDisplay();
    }

    function setActiveOp(op) {
        clearActiveOp();
        document.querySelectorAll('.btn.op').forEach(btn => {
            if (btn.dataset.value === op) btn.classList.add('active');
        });
    }

    function clearActiveOp() {
        document.querySelectorAll('.btn.op').forEach(btn => btn.classList.remove('active'));
    }

    // Button clicks
    document.querySelector('.buttons').addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const action = btn.dataset.action;
        switch (action) {
            case 'digit':    appendDigit(btn.dataset.value); break;
            case 'decimal':  appendDecimal(); break;
            case 'operator': setOperator(btn.dataset.value); break;
            case 'equals':   calculate(); break;
            case 'clear':    clearAll(); break;
            case 'delete':   deleteLast(); break;
            case 'percent':  handlePercent(); break;
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') appendDigit(e.key);
        else if (e.key === '.') appendDecimal();
        else if (e.key === '+') setOperator('+');
        else if (e.key === '-') setOperator('-');
        else if (e.key === '*') setOperator('*');
        else if (e.key === '/') { e.preventDefault(); setOperator('/'); }
        else if (e.key === 'Enter' || e.key === '=') calculate();
        else if (e.key === 'Escape') clearAll();
        else if (e.key === 'Backspace') deleteLast();
        else if (e.key === '%') handlePercent();
    });

    updateDisplay();
})();
