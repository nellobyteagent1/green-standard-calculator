(function () {
  'use strict';

  const MAX_DIGITS = 15;

  const state = {
    current: '0',
    previous: null,
    operator: null,
    overwrite: false,
    expression: '',
  };

  const $current = document.getElementById('current');
  const $expression = document.getElementById('expression');
  const buttons = document.querySelectorAll('.btn');

  function updateDisplay() {
    $current.textContent = state.current;
    $expression.textContent = state.expression;
    $current.classList.toggle('small', state.current.length > 10);
    $current.classList.toggle('error', state.current === 'Error');
  }

  function formatNumber(n) {
    if (!isFinite(n)) return 'Error';
    const s = String(n);
    if (s.length > MAX_DIGITS) {
      const exp = n.toExponential(8);
      return exp.length > MAX_DIGITS ? n.toExponential(4) : exp;
    }
    return s;
  }

  function compute(a, op, b) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    switch (op) {
      case '+': return x + y;
      case '-': return x - y;
      case '×': return x * y;
      case '÷': return y === 0 ? null : x / y;
      default: return y;
    }
  }

  function inputNumber(digit) {
    if (state.current === 'Error') clear();
    if (state.overwrite) {
      state.current = digit;
      state.overwrite = false;
    } else if (state.current === '0' && digit !== '0') {
      state.current = digit;
    } else if (state.current === '0' && digit === '0') {
      return;
    } else {
      if (state.current.replace(/[^0-9]/g, '').length >= MAX_DIGITS) return;
      state.current += digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (state.current === 'Error') clear();
    if (state.overwrite) {
      state.current = '0.';
      state.overwrite = false;
    } else if (!state.current.includes('.')) {
      state.current += '.';
    }
    updateDisplay();
  }

  function inputOperator(op) {
    if (state.current === 'Error') return;
    clearActiveOp();

    if (state.previous !== null && !state.overwrite) {
      const result = compute(state.previous, state.operator, state.current);
      if (result === null) {
        state.current = 'Error';
        state.expression = '';
        state.previous = null;
        state.operator = null;
        state.overwrite = true;
        updateDisplay();
        return;
      }
      state.current = formatNumber(result);
      state.expression = state.current + ' ' + op;
      state.previous = state.current;
    } else {
      state.expression = state.current + ' ' + op;
      state.previous = state.current;
    }

    state.operator = op;
    state.overwrite = true;
    highlightOp(op);
    updateDisplay();
  }

  function equals() {
    if (state.current === 'Error') return;
    if (state.previous === null || state.operator === null) return;

    const result = compute(state.previous, state.operator, state.current);
    const expr = state.previous + ' ' + state.operator + ' ' + state.current + ' =';

    if (result === null) {
      state.current = 'Error';
      state.expression = expr;
      state.previous = null;
      state.operator = null;
      state.overwrite = true;
    } else {
      state.current = formatNumber(result);
      state.expression = expr;
      state.previous = null;
      state.operator = null;
      state.overwrite = true;
    }

    clearActiveOp();
    updateDisplay();
  }

  function clear() {
    state.current = '0';
    state.previous = null;
    state.operator = null;
    state.overwrite = false;
    state.expression = '';
    clearActiveOp();
    updateDisplay();
  }

  function backspace() {
    if (state.current === 'Error' || state.overwrite) {
      clear();
      return;
    }
    state.current = state.current.length > 1
      ? state.current.slice(0, -1)
      : '0';
    updateDisplay();
  }

  function percent() {
    if (state.current === 'Error') return;
    const n = parseFloat(state.current);
    state.current = formatNumber(n / 100);
    state.overwrite = true;
    updateDisplay();
  }

  function toggleSign() {
    if (state.current === 'Error' || state.current === '0') return;
    state.current = state.current.startsWith('-')
      ? state.current.slice(1)
      : '-' + state.current;
    updateDisplay();
  }

  function highlightOp(op) {
    buttons.forEach(function (btn) {
      if (btn.dataset.action === 'operator') {
        btn.classList.toggle('active', btn.dataset.value === op);
      }
    });
  }

  function clearActiveOp() {
    buttons.forEach(function (btn) {
      btn.classList.remove('active');
    });
  }

  // Button clicks
  document.querySelector('.buttons').addEventListener('click', function (e) {
    var btn = e.target.closest('.btn');
    if (!btn) return;

    var action = btn.dataset.action;
    switch (action) {
      case 'number':   inputNumber(btn.dataset.value); break;
      case 'decimal':  inputDecimal(); break;
      case 'operator': inputOperator(btn.dataset.value); break;
      case 'equals':   equals(); break;
      case 'clear':    clear(); break;
      case 'backspace': backspace(); break;
      case 'percent':  percent(); break;
      case 'toggle':   toggleSign(); break;
    }
  });

  // Keyboard support
  document.addEventListener('keydown', function (e) {
    var key = e.key;
    if (key >= '0' && key <= '9') {
      e.preventDefault();
      inputNumber(key);
    } else if (key === '.') {
      e.preventDefault();
      inputDecimal();
    } else if (key === '+') {
      e.preventDefault();
      inputOperator('+');
    } else if (key === '-') {
      e.preventDefault();
      inputOperator('-');
    } else if (key === '*') {
      e.preventDefault();
      inputOperator('×');
    } else if (key === '/') {
      e.preventDefault();
      inputOperator('÷');
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      equals();
    } else if (key === 'Escape') {
      e.preventDefault();
      clear();
    } else if (key === 'Backspace') {
      e.preventDefault();
      backspace();
    } else if (key === '%') {
      e.preventDefault();
      percent();
    }
  });

  updateDisplay();
})();
