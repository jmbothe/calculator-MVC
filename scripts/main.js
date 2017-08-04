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
  '.': 'decimal'
}
const OPERATOR_KEY_MAP = {
  '/': 'divide',
  '*': 'multiply',
  '+': 'add',
  '-': 'subtract'
}
const OTHER_KEY_MAP = {
  'Enter': 'equals',
  'Backspace': 'clear',
  'Delete': 'clear'
};

/* **************************************************************************
MODEL
*************************************************************************** */

(function makeModel (window) {
  window.calcMVC = window.calcMVC || {}

  window.calcMVC.model = {
    input: inputModule(),
    total: totalModule(),
    forkTotal: totalModule(),
    forkPath: forkPathModule(),
    mainPath: mainPathModule(),
    currentOperator: operatorModule(),
    evaluateMainPath: evaluateMainPath,
    evaluateForkPath: evaluateForkPath,
    evaluateEquals: evaluateEquals,
    softClear: softClear,
    hardClear: hardClear,
    round: round
  }

  function totalModule () {
    let total

    function get () {
      return total
    }
    function set (number) {
      total = number
    }
    return {get: get, set: set}
  }

  function inputModule () {
    let input = ''

    function get () {
      return input
    }
    function addCharEnd (char) {
      if (/\d|\./.test(char))
        input += char
    }
    function changeSign () {
      input = input.indexOf('-') === -1 ? '-' + input : input.substring(1)
    }
    function trimLeadingZeros () {
      if (input.indexOf('0') === 0 && input.length > 1)
        input = input.substring(1)
    }
    function limitDecimalPoints (className) {
      if (className === 'decimal' && input.indexOf('.') !== -1 && input.indexOf('.') !== input.length - 1)
        input = input.substring(0, input.length - 1)
    }
    function reset () {
      input = ''
    }
    return {
      get: get,
      addCharEnd: addCharEnd,
      changeSign: changeSign,
      trimLeadingZeros: trimLeadingZeros,
      limitDecimalPoints: limitDecimalPoints,
      reset: reset
    }
  }

  function operatorModule () {
    let operator = ''

    function get () {
      return operator
    }
    function reset () {
      operator = ''
    }
    function add () {
      operator = 'add'
    }
    function subtract () {
      operator = 'subtract'
    }
    function multiply () {
      operator = 'multiply'
    }
    function divide () {
      operator = 'divide'
    }
    return {
      get: get,
      reset: reset,
      add: add,
      subtract: subtract,
      multiply: multiply,
      divide: divide
    }
  }

  function mainPathModule () {
    let path = a => round(Number(a))

    function get () {
      return path
    }
    function reset () {
      path = a => round(Number(a))
    }
    function add (a) {
      path = function (b) {
        return round(round(Number(a)) + round(Number(b)))
      }
    }
    function subtract (a) {
      path = function (b) {
        return round(round(Number(a)) - round(Number(b)))
      }
    }
    return {
      get: get,
      reset: reset,
      add: add,
      subtract: subtract
    }
  }

  function forkPathModule () {
    let path = a => round(Number(a))

    function get () {
      return path
    }
    function reset () {
      path = a => round(Number(a))
    }
    function multiply (a) {
      path = function (b) {
        return round(round(Number(a)) * round(Number(b)))
      }
    }
    function divide (a) {
      path = function (b) {
        return round(round(Number(a)) / round(Number(b)))
      }
    }
    return {
      get: get,
      reset: reset,
      multiply: multiply,
      divide: divide
    }
  }
  function evaluateMainPath () {
    this.forkTotal.set(this.forkPath.get()(this.input.get() || this.total.get()))
    this.total.set(this.mainPath.get()(this.forkTotal.get()))
    this.mainPath[this.currentOperator.get()](this.total.get())
    this.forkPath.reset()
    this.currentOperator.reset()
    this.input.reset()
  }
  function evaluateForkPath () {
    this.forkTotal.set(this.forkPath.get()(this.input.get() || this.total.get()))
    this.forkPath[this.currentOperator.get()](this.forkTotal.get())
    this.currentOperator.reset()
    this.input.reset()
  }
  function evaluateEquals () {
    this.forkTotal.set(this.forkPath.get()(this.input.get()))
    this.total.set(this.mainPath.get()(this.forkTotal.get()))
    this.softClear()
  }
  function softClear () {
    this.mainPath.reset()
    this.forkPath.reset()
    this.currentOperator.reset()
    this.input.reset()
  }
  function hardClear () {
    this.softClear()
    this.forkTotal.set(undefined)
    this.total.set(undefined)
  }
  function round (value) {
    return (Number(Math.round(value + 'e' + 9) + 'e-' + 9) || Math.round(value * 1000000000) / 1000000000)
  }
})(window);

/* **************************************************************************
VIEW
*************************************************************************** */

(function makeView (window, model) {
  window.calcMVC = window.calcMVC || {}

  window.calcMVC.view = {
    displayInput: displayInput,
    displayTotal: displayTotal,
    displayForkSubTotal: displayForkSubTotal,
    displayMainSubTotal: displayMainSubTotal
  }
  function displayInput () {
    let input = model.input.get()
    document.querySelector('.display').textContent =
    input.length > 9
      ? Number(input).toExponential(5)
      : input
  }
  function displayTotal () {
    let total = model.total.get()
    document.querySelector('.display').textContent =
    String(total).length > 9
      ? total.toExponential(5)
      : total
  }
  function displayForkSubTotal () {
    let subTotal = model.forkPath.get()(model.input.get() || model.total.get())
    document.querySelector('.display').textContent =
    String(subTotal).length > 9
      ? subTotal.toExponential(5)
      : subTotal
  }
  function displayMainSubTotal () {
    let subTotal = model.mainPath.get()(model.forkPath.get()(model.input.get() || model.total.get()))
    document.querySelector('.display').textContent =
    String(subTotal).length > 9
      ? subTotal.toExponential(5)
      : subTotal
  }
})(window, window.calcMVC.model);

/* **************************************************************************
CONTROLLER
*************************************************************************** */

(function (window, model, view) {
  window.calcMVC = window.calcMVC || {}

  window.calcMVC.controller = {
    numbersListener: numbersListener,
    operatorsListener: operatorsListener,
    numbersClickHandler: numbersClickHandler,
    numbersKeyHandler: numbersKeyHandler,
    operatorsClickHandler: operatorsClickHandler,
    operatorsKeyHandler: operatorsKeyHandler,
    clearClickHandler: clearClickHandler,
    clearKeyHandler: clearKeyHandler,
    equalsClickHandler: equalsClickHandler,
    keydownFocusHandler: keydownFocusHandler,
    initialize: initialize
  }
  function numbersListener (e) {
    if (e.type === 'keydown' && !NUM_KEY_MAP.hasOwnProperty(e.key))
      return
    if (model.currentOperator.get() === 'add' || model.currentOperator.get() === 'subtract') {
      model.evaluateMainPath()
    } else if (model.currentOperator.get() === 'multiply' || model.currentOperator.get() === 'divide') {
      model.evaluateForkPath()
    }
    if (e.target.className === 'sign') {
      model.input.changeSign()
      view.displayInput()
    } else {
      model.input.addCharEnd(e.key || e.target.textContent)
      model.input.limitDecimalPoints(NUM_KEY_MAP[e.key] || e.target.className)
      model.input.trimLeadingZeros()
      view.displayInput()
    }
  }
  function operatorsListener (e) {
    if ((e.type === 'keydown' && !OPERATOR_KEY_MAP.hasOwnProperty(e.key)) || (!model.input.get() && !model.total.get()))
      return
    model.currentOperator[OPERATOR_KEY_MAP[e.key] || e.target.className]()
    if (model.currentOperator.get() === 'add' || model.currentOperator.get() === 'subtract') {
      view.displayMainSubTotal()
    } else if (model.currentOperator.get() === 'multiply' || model.currentOperator.get() === 'divide') {
      view.displayForkSubTotal()
    }
  }
  function numbersClickHandler () {
    document.querySelector('.numbers').addEventListener('click', this.numbersListener)
  }
  function numbersKeyHandler () {
    window.addEventListener('keydown', this.numbersListener)
  }
  function operatorsClickHandler () {
    document.querySelector('.operators').addEventListener('click', this.operatorsListener)
  }
  function operatorsKeyHandler () {
    window.addEventListener('keydown', this.operatorsListener)
  }
  function equalsClickHandler () {
    document.querySelector('.equals').addEventListener('click', function equalsClickListen (e) {
      model.evaluateEquals()
      view.displayTotal()
    })
  }
  function clearClickHandler () {
    document.querySelector('.clear').addEventListener('click', function clearCLickListen (e) {
      model.hardClear()
      view.displayInput()
    })
  }
  function clearKeyHandler () {
    window.addEventListener('keydown', function (e) {
      if (OTHER_KEY_MAP[e.key] === 'clear') {
        model.hardClear()
        view.displayInput()
      }
    })
  }
  function keydownFocusHandler () {
    window.addEventListener('keydown', function (e) {
      if (NUM_KEY_MAP.hasOwnProperty(e.key)) {
        document.querySelector('.' + NUM_KEY_MAP[e.key]).focus()
      } else if (OPERATOR_KEY_MAP.hasOwnProperty(e.key)) {
        document.querySelector('.' + OPERATOR_KEY_MAP[e.key]).focus()
      } else if (OTHER_KEY_MAP.hasOwnProperty(e.key)) {
        document.querySelector('.' + OTHER_KEY_MAP[e.key]).focus()
      }
    })
  }
  function initialize () {
    this.numbersClickHandler()
    this.numbersKeyHandler()
    this.operatorsClickHandler()
    this.operatorsKeyHandler()
    this.clearClickHandler()
    this.clearKeyHandler()
    this.equalsClickHandler()
    this.keydownFocusHandler()
  }
})(window, window.calcMVC.model, window.calcMVC.view)

/* **************************************************************************
INITIALIZE
*************************************************************************** */

window.calcMVC.controller.initialize()
