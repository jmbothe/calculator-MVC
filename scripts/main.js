/* **************************************************************************
CONSTANTS
*************************************************************************** */
const round = function (value, places = 9) {
  return (Number(Math.round(value + 'e' + places) + 'e-' + places) || value)
}
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
    subTotal: totalModule(),
    forkTotal: totalModule(),
    forkPath: forkPathModule(),
    mainPath: mainPathModule(),
    currentOperator: operatorModule(),
    evaluateMainPath,
    evaluateForkPath,
    evaluateEquals,
    softClear,
    hardClear
  }

  function totalModule () {
    let total

    function get () {
      return total
    }
    function set (number) {
      if (number > 999999999) {
        total = number.toExponential(3)
      } else if (/\./.test(String(number))) {
        total = round(number, 9 - String(number).indexOf('.'))
      } else {
        total = number
      }
    }
    return {get: get, set: set}
  }

  function inputModule () {
    let input = '0'

    function get () {
      return input
    }
    function addCharEnd (char) {
      if (/\d|\./.test(char) && input.length < 9)
        input += char
    }
    function changeSign () {
      if (Math.abs(Number(input)) > 999999999) {
        input = String((Number(input) * -1).toExponential(3))
      // } else if (/\./.test(String(Number(input)))) {
      //   input = String(round((Number(input) * -1), 9 - String((Number(input) * -1)).indexOf('.')))
      } else {
        input = String(Number(input) * -1)
      }
    }
    function trimLeadingZeros () {
      if (input.indexOf('0') === 0 && input.length > 1 && !/\./.test(input)) {
        input = input.substring(1)
      } else if (/^-0/.test(input) && input.length > 2 && !/\./.test(input)) {
        input = '-' + input.substring(2)
      }
    }
    function limitDecimalPoints (className) {
      if (className === 'decimal' && input.indexOf('.') !== -1 && input.indexOf('.') !== input.length - 1)
        input = input.substring(0, input.length - 1)
    }
    function setToTotal () {
      input = String(this.total.get())
    }
    function reset () {
      input = '0'
    }
    return {
      get,
      addCharEnd,
      changeSign,
      trimLeadingZeros,
      limitDecimalPoints,
      setToTotal,
      reset
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
      get,
      reset,
      add,
      subtract,
      multiply,
      divide
    }
  }

  function mainPathModule () {
    let path = a => Number(a)

    function evaluate (number) {
      return path(number)
    }
    function reset () {
      path = a => Number(a)
    }
    function add (a) {
      path = function (b) {
        return round(Number(a) + Number(b))
      }
    }
    function subtract (a) {
      path = function (b) {
        return round(Number(a) - Number(b))
      }
    }
    return {
      evaluate,
      reset,
      add,
      subtract
    }
  }

  function forkPathModule () {
    let path = a => Number(a)

    function evaluate (number) {
      return path(number)
    }
    function reset () {
      path = a => Number(a)
    }
    function multiply (a) {
      path = function (b) {
        return round(Number(a) * Number(b))
      }
    }
    function divide (a) {
      path = function (b) {
        return round(Number(a) / Number(b))
      }
    }
    return {
      evaluate,
      reset,
      multiply,
      divide
    }
  }
  function evaluateMainPath () {
    this.forkTotal.set(this.forkPath.evaluate(this.input.get()))
    this.total.set(this.mainPath.evaluate(this.forkTotal.get()))
    this.mainPath[this.currentOperator.get()](this.total.get())
    this.forkPath.reset()
    this.currentOperator.reset()
    this.input.reset()
  }
  function evaluateForkPath () {
    this.forkTotal.set(this.forkPath.evaluate(this.input.get()))
    this.forkPath[this.currentOperator.get()](this.forkTotal.get())
    this.currentOperator.reset()
    this.input.reset()
  }
  function evaluateEquals () {
    this.forkTotal.set(this.forkPath.evaluate(this.input.get()))
    this.total.set(this.mainPath.evaluate(this.forkTotal.get()))
    this.input.setToTotal.apply(this)
    this.softClear()
  }
  function softClear () {
    this.mainPath.reset()
    this.forkPath.reset()
    this.currentOperator.reset()
  }
  function hardClear () {
    this.softClear()
    this.input.reset()
    this.forkTotal.set(undefined)
    this.total.set(undefined)
  }
})(window);

/* **************************************************************************
VIEW
*************************************************************************** */

(function makeView (window, model) {
  window.calcMVC = window.calcMVC || {}

  window.calcMVC.view = {
    displayInput,
    displayTotal,
    displaySubTotal,
    formatNumber
  }
  function formatNumber (string) {
    if (!/\./.test(string)) {
      return string.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
    } else {
      return string.replace(/\.*0*e\+/, 'e')
    }
  }
  function displayInput () {
    document.querySelector('.display').textContent = this.formatNumber(model.input.get())
  }
  function displayTotal () {
    document.querySelector('.display').textContent = this.formatNumber(String(model.total.get()))
  }
  function displaySubTotal () {
    document.querySelector('.display').textContent = this.formatNumber(String(model.subTotal.get()))
  }
})(window, window.calcMVC.model);

/* **************************************************************************
CONTROLLER
*************************************************************************** */

(function (window, model, view) {
  window.calcMVC = window.calcMVC || {}

  window.calcMVC.controller = {
    numbersListener,
    operatorsListener,
    numbersClickHandler,
    numbersKeyHandler,
    operatorsClickHandler,
    operatorsKeyHandler,
    clearClickHandler,
    clearKeyHandler,
    equalsClickHandler,
    keydownFocusHandler,
    initialize
  }
  function numbersListener (e) {
    if ((e.type === 'keydown' && !NUM_KEY_MAP.hasOwnProperty(e.key)) || e.target.className === 'number-row')
      return
    if (model.currentOperator.get() === 'add' || model.currentOperator.get() === 'subtract') {
      model.evaluateMainPath()
    } else if (model.currentOperator.get() === 'multiply' || model.currentOperator.get() === 'divide') {
      model.evaluateForkPath()
    }
    if (e.target.className === 'sign' && e.type !== 'keydown') {
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
      model.subTotal.set(model.mainPath.evaluate(model.forkPath.evaluate(model.input.get())))
      view.displaySubTotal()
    } else if (model.currentOperator.get() === 'multiply' || model.currentOperator.get() === 'divide') {
      model.subTotal.set(model.forkPath.evaluate(model.input.get()))
      view.displaySubTotal()
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
      view.displayInput()
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
    view.displayInput()
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
