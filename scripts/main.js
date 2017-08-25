'strict';

/* **************************************************************************
CONSTANTS
*************************************************************************** */

const NUM_KEY_MAP = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  '.': 'decimal',
};
const OPERATOR_KEY_MAP = {
  '/': 'divide',
  '*': 'multiply',
  '+': 'add',
  '-': 'subtract',
};
const OTHER_KEY_MAP = {
  Enter: 'equals',
  Backspace: 'clear',
  Delete: 'clear',
};

/* **************************************************************************
MODEL
*************************************************************************** */

((function makeModel() {
  function evaluateSubtotal() {
    if (this.operator.isLowPrecedence()) {
      this.subtotal.set
        .call(this, this.lowPrecedenceExpression
          .evaluate(this.midPrecedenceExpression
            .evaluate(this.highPrecedenceExpression
              .evaluate(this.input.get()))));
    } else if (this.operator.isMidPrecedence()) {
      this.subtotal.set
        .call(this, this.midPrecedenceExpression
          .evaluate(this.highPrecedenceExpression
            .evaluate(this.input.get())));
    } else if (this.operator.isHighPrecedence()) {
      this.subtotal.set
        .call(this, this.highPrecedenceExpression
          .evaluate(this.input.get()));
    }
  }

  function setVariables() {
    if (this.operator.isNotDefined()) {
      return;
    } else if (this.operator.isLowPrecedence()) {
      this.lowPrecedenceExpression.curry
        .call(this, this.subtotal.get(), this.operator.get());
      this.midPrecedenceExpression.reset();
      this.highPrecedenceExpression.reset();
    } else if (this.operator.isMidPrecedence()) {
      this.midPrecedenceExpression.curry.call(this, this.subtotal.get());
      this.highPrecedenceExpression.reset();
    } else if (this.operator.isHighPrecedence()) {
      this.highPrecedenceExpression.curry.call(this, this.subtotal.get());
    }
    this.operator.reset();
    this.input.reset();
  }

  function evaluateTotal() {
    this.input.setToSubtotal.call(this);
    this.lowPrecedenceExpression.reset();
    this.midPrecedenceExpression.reset();
    this.highPrecedenceExpression.reset();
    this.operator.reset();
  }

  function clearAfterEquals() {
    const userTrynaEnterNumbersAfterLastButtonPressWasEqualsBETTERrESETtHATsHIT =
      this.subtotal.get() == this.input.get() && this.operator.isNotDefined();

    if (userTrynaEnterNumbersAfterLastButtonPressWasEqualsBETTERrESETtHATsHIT) {
      this.input.reset();
      this.subtotal.reset();
    }
  }

  function clear() {
    this.input.reset();
    this.lowPrecedenceExpression.reset();
    this.midPrecedenceExpression.reset();
    this.highPrecedenceExpression.reset();
    this.operator.reset();
    this.subtotal.reset();
  }

  function round(number) {
    const isExponentialForm = /e/.test(`${number}`);
    const isNegativeDecimal = /\./.test(`${number}`) && /^-/.test(`${number}`);
    const negPlaces = 10 - (`${number}`).indexOf('.');
    const isPositiveDecimal = /\./.test(`${number}`);
    const posPlaces = 9 - (`${number}`).indexOf('.');

    if (isExponentialForm) {
      return number;
    } else if (isNegativeDecimal) {
      return +(`${Math.round(`${number}e${negPlaces}`)}e-${negPlaces}`);
    } else if (isPositiveDecimal) {
      return +(`${Math.round(`${number}e${posPlaces}`)}e-${posPlaces}`);
    }
    return number;
  }

  function buildInput(char) {
    const charIsDecimal = char === '.';
    const charIsSign = char === 'sign';

    if (this.input.hasDecimal() && charIsDecimal) {
      return;
    }

    if (charIsSign) {
      this.input.changeSign();
    } else {
      this.input.addCharEnd(char);
      this.input.trimLeadingZeros();
    }
  }

  function subtotalModule() {
    let subtotal;

    function get() {
      return subtotal;
    }
    function set(number) {
      subtotal = this.round(number);
    }
    function reset() {
      subtotal = undefined;
    }
    return { get, set, reset };
  }

  function inputModule() {
    let input = '0';

    function get() {
      return input;
    }
    function setToSubtotal() {
      input = `${this.subtotal.get()}`;
    }
    function reset() {
      input = '0';
    }
    function addCharEnd(char) {
      if (this.isNotMaxLength()) input += char;
    }
    function isNotMaxLength() {
      return input.match(/\d/g).length < 9;
    }
    function changeSign() {
      input = this.isPositive() ? `-${input}` : input.substring(1);
    }
    function isPositive() {
      return !(/-/.test(input));
    }
    function trimLeadingZeros() {
      if (this.hasPositiveLeadingZero() && !this.hasDecimal()) {
        input = input.substring(1);
      } else if (this.hasNegativeLeadingZero() && !this.hasDecimal()) {
        input = `-${input.substring(2)}`;
      }
    }
    function hasDecimal() {
      return /\./.test(input);
    }
    function hasPositiveLeadingZero() {
      return /^0/.test(input);
    }
    function hasNegativeLeadingZero() {
      return /^-0/.test(input) && input.length > 2;
    }
    return {
      get,
      setToSubtotal,
      reset,
      addCharEnd,
      isNotMaxLength,
      changeSign,
      isPositive,
      trimLeadingZeros,
      hasDecimal,
      hasPositiveLeadingZero,
      hasNegativeLeadingZero,
    };
  }

  function operatorModule() {
    let operator = '';

    function get() {
      return operator;
    }
    function reset() {
      operator = '';
    }
    function set(symbol) {
      operator = symbol;
    }
    function isLowPrecedence() {
      return (operator === '+' || operator === '-' || !operator);
    }
    function isMidPrecedence() {
      return (operator === '/');
    }
    function isHighPrecedence() {
      return (operator === '*');
    }
    function isNotDefined() {
      return (!operator);
    }
    return {
      get,
      set,
      reset,
      isLowPrecedence,
      isMidPrecedence,
      isHighPrecedence,
      isNotDefined,
    };
  }

  function expressionModule(defaultOperator) {
    let expression = a => +a;

    function evaluate(number) {
      return expression(number);
    }
    function reset() {
      expression = a => +a;
    }
    function curry(a, operator = defaultOperator) {
      expression = b => this.round(eval(a + operator + b));
    }
    return { evaluate, reset, curry };
  }

  window.calculatorMVC = {};

  window.calculatorMVC.model = {
    evaluateSubtotal,
    setVariables,
    evaluateTotal,
    clearAfterEquals,
    clear,
    round,
    buildInput,
    input: inputModule(),
    subtotal: subtotalModule(),
    operator: operatorModule(),
    lowPrecedenceExpression: expressionModule(),
    midPrecedenceExpression: expressionModule('/'),
    highPrecedenceExpression: expressionModule('*'),
  };
})());

/* **************************************************************************
VIEW
*************************************************************************** */

(function makeView() {
  function display(number) {
    document.querySelector('#display').textContent =
      this.formatNumber(number);
  }

  function formatNumber(number) {
    const string = `${number}`;
    const excedesThresholds =
      Math.abs(+string) > 999999999 ||
      (Math.abs(+string) < 0.000001 && Math.abs(+string) > 0);

    return (excedesThresholds)
      ? (`${(+string).toExponential(5)}`)
        .replace(/\.*0*e/, 'e')
        .replace(/\+/, '')
      : string.split('.')[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') +
        ((/\./.test(string) && '.') || '') +
        (string.split('.')[1] || '');
  }

  function respondToOrientation() {
    const shouldBeLandscape =
      window.matchMedia('(orientation: landscape)').matches &&
        window.innerWidth <= 1024;
    const shouldBePortrait =
      window.matchMedia('(orientation: portrait)').matches ||
        window.innerWidth > 1024;

    if (shouldBeLandscape) {
      this.setShellSize(1.5, '25vh', '16.66%', '100%');
      document.querySelector('#clear').textContent = 'cl';
    } else if (shouldBePortrait) {
      this.setShellSize(0.666, '16.66vh', '25%', '33.33%');
      document.querySelector('#clear').textContent = 'clear';
    }
  }

  function setShellSize(ratio, paddingAll, paddingDisplay, paddingClear) {
    const calculator = document.querySelector('.calculator');
    const buttonShells = document.querySelectorAll('.button-shell');
    const excedesRatio =
      calculator.offsetWidth > (ratio) * calculator.offsetHeight;

    if (excedesRatio) {
      buttonShells.forEach((item) => {
        item.style.paddingTop = paddingAll;
      });
    } else {
      buttonShells.forEach((item) => {
        if (item.id === 'display-shell') {
          item.style.paddingTop = paddingDisplay;
        } else if (item.id === 'clear-shell') {
          item.style.paddingTop = paddingClear;
        } else {
          item.style.paddingTop = '100%';
        }
      });
    }
  }

  function animateButton(target, draw, duration) {
    const start = performance.now();

    requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;

      draw(target, timeFraction);

      if (timeFraction < 1) requestAnimationFrame(animate);
    });
  }

  function drawButtonAnimation(target, timeFraction) {
    const position = window.getComputedStyle(target, null).getPropertyValue('right');
    const fontSize = window.getComputedStyle(target, null).getPropertyValue('font-size');

    if (timeFraction < 0.5) {
      target.style.top = `${parseFloat(position) + 1}px`;
      target.style.bottom = `${parseFloat(position) + 1}px`;
      target.style.left = `${parseFloat(position) + 1}px`;
      target.style.right = `${parseFloat(position) + 1}px`;
      target.style.fontSize = `${parseFloat(fontSize) - 1}px`;
    } else if (timeFraction >= 0.5 && timeFraction < 1) {
      target.style.top = `${parseFloat(position) - 1}px`;
      target.style.bottom = `${parseFloat(position) - 1}px`;
      target.style.left = `${parseFloat(position) - 1}px`;
      target.style.right = `${parseFloat(position) - 1}px`;
      target.style.fontSize = `${parseFloat(fontSize) + 1}px`;
    } else {
      target.style.top = '3%';
      target.style.bottom = '3%';
      target.style.left = '3%';
      target.style.right = '3%';
      target.style.fontSize = '1rem';
    }
  }

  window.calculatorMVC.view = {
    display,
    formatNumber,
    respondToOrientation,
    setShellSize,
    drawButtonAnimation,
    animateButton,
  };
}());

/* **************************************************************************
CONTROLLER
*************************************************************************** */

(function makeController(model, view) {
  function initialize() {
    view.display(model.input.get());
    view.respondToOrientation();
    this.keydownListener();
    this.numbersClickListener();
    this.operatorsClickListener();
    this.clearClickListener();
    this.equalsClickListener();
    this.resizeListener();
  }

  function numbersHandler(e) {
    const keyTarget = document.querySelector(`#${NUM_KEY_MAP[e.key]}`);
    const char = e.key || e.target.dataset.content;

    model.clearAfterEquals();
    model.setVariables();
    model.buildInput(char);
    view.display(model.input.get());
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100);
  }

  function operatorsHandler(e) {
    const keyTarget = document.querySelector(`#${OPERATOR_KEY_MAP[e.key]}`);

    model.operator.set(e.key || e.target.dataset.operator);
    model.evaluateSubtotal();
    view.display(model.subtotal.get());
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100);
  }

  function equalsHandler(e) {
    const keyTarget = document.querySelector(`#${OTHER_KEY_MAP[e.key]}`);

    model.evaluateSubtotal();
    model.evaluateTotal();
    view.display(model.input.get());
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100);
  }

  function clearHandler(e) {
    const keyTarget = document.querySelector(`#${OTHER_KEY_MAP[e.key]}`);

    model.clear();
    view.display(model.input.get());
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100);
  }

  function keydownListener() {
    window.addEventListener('keydown', (e) => {
      if (NUM_KEY_MAP.hasOwnProperty(e.key)) {
        this.numbersHandler(e);
      } else if (OPERATOR_KEY_MAP.hasOwnProperty(e.key)) {
        this.operatorsHandler(e);
      } else if (e.key === 'Enter') {
        this.equalsHandler(e);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        this.clearHandler(e);
      }
    });
  }

  function numbersClickListener() {
    document.querySelectorAll('.number').forEach(function listen(item) {
      item.addEventListener('click', this.numbersHandler);
    }, this);
  }
  function operatorsClickListener() {
    document.querySelectorAll('.operator').forEach(function listen(item) {
      item.addEventListener('click', this.operatorsHandler);
    }, this);
  }
  function equalsClickListener() {
    document.querySelector('#equals').addEventListener('click', this.equalsHandler);
  }
  function clearClickListener() {
    document.querySelector('#clear').addEventListener('click', this.clearHandler);
  }
  function resizeListener() {
    window.addEventListener('resize', view.respondToOrientation.bind(view));
  }

  window.calculatorMVC.controller = {
    initialize,
    numbersHandler,
    operatorsHandler,
    equalsHandler,
    clearHandler,
    keydownListener,
    numbersClickListener,
    operatorsClickListener,
    clearClickListener,
    equalsClickListener,
    resizeListener,
  };
}(window.calculatorMVC.model, window.calculatorMVC.view));

/* **************************************************************************
INITIALIZE
*************************************************************************** */

window.calculatorMVC.controller.initialize();
