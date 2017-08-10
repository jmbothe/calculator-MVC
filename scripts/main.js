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

(function makeModel () {
  window.calcMVC = {}

  window.calcMVC.model = {
    input: inputModule(),
    total: totalModule(),
    subtotal: totalModule(),
    forkTotal: totalModule(),
    forkExpression: forkExpressionModule(),
    mainExpression: mainExpressionModule(),
    currentOperator: operatorModule(),
    evaluateSubtotal,
    executeCurrentOperator,
    evaluateEquals,
    clear
  }

  function totalModule () {
    let total

    function get () {
      return total
    }
    function set (number) {
      total = (/\./.test(String(number)))
        ? round(number, 9 - String(number).indexOf('.'))
        : number
    }
    return {get: get, set: set}
  }

  function inputModule () {
    let input = '0'

    function get () {
      return input
    }
    function addCharEnd (char) {
      if (/\d|\./.test(char) && input.match(/\d/g).length < 9)
        input += char
    }
    function changeSign () {
      input = input.indexOf('-') === -1 ? '-' + input : input.substring(1)
    }
    function trimLeadingZeros () {
      if (input.indexOf('0') === 0 && input.length > 1 && !/\./.test(input)) {
        input = input.substring(1)
      } else if (/^-0/.test(input) && input.length > 2 && !/\./.test(input)) {
        input = '-' + input.substring(2)
      }
    }
    function setToSubtotal () {
      input = String(this.subtotal.get())
    }
    function reset () {
      input = '0'
    }
    return {
      get,
      addCharEnd,
      changeSign,
      trimLeadingZeros,
      setToSubtotal,
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

  function mainExpressionModule () {
    let expression = a => Number(a)

    function evaluate (number) {
      return expression(number)
    }
    function reset () {
      expression = a => Number(a)
    }
    function add (a) {
      expression = function (b) {
        return round(Number(a) + Number(b))
      }
    }
    function subtract (a) {
      expression = function (b) {
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

  function forkExpressionModule () {
    let expression = a => Number(a)

    function evaluate (number) {
      return expression(number)
    }
    function reset () {
      expression = a => Number(a)
    }
    function multiply (a) {
      expression = function (b) {
        return round(Number(a) * Number(b))
      }
    }
    function divide (a) {
      expression = function (b) {
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
  function evaluateSubtotal () {
    let operator = this.currentOperator.get()

    if (operator === 'add' || operator === 'subtract' || !operator) {
      this.subtotal.set(this.mainExpression.evaluate(this.forkExpression.evaluate(this.input.get())))
    } else {
      this.subtotal.set(this.forkExpression.evaluate(this.input.get()))
    }
  }
  function executeCurrentOperator () {
    let operator = this.currentOperator.get()
    this.subtotal.set(undefined)

    if (operator) {
      this.forkTotal.set(this.forkExpression.evaluate(this.input.get()))

      if (operator === 'add' || operator === 'subtract') {
        this.total.set(this.mainExpression.evaluate(this.forkTotal.get()))
        this.mainExpression[operator](this.total.get())
        this.forkExpression.reset()
      } else {
        this.forkExpression[operator](this.forkTotal.get())
      }
      this.currentOperator.reset()
      this.input.reset()
    }
  }
  function evaluateEquals () {
    this.evaluateSubtotal()
    this.clear()
  }
  function clear () {
    this.input.reset()
    this.mainExpression.reset()
    this.forkExpression.reset()
    this.currentOperator.reset()
    this.forkTotal.set(undefined)
    this.total.set(undefined)
  }
})();

/* **************************************************************************
VIEW
*************************************************************************** */

(function makeView (model) {
  window.calcMVC.view = {
    displayInput,
    displayTotal,
    displaySubtotal,
    formatNumber,
    setShellSize
  }
  function displayInput () {
    document.querySelector('#display').textContent = this.formatNumber(model.input.get())
  }
  function displayTotal () {
    document.querySelector('#display').textContent = this.formatNumber(String(model.total.get()))
  }
  function displaySubtotal () {
    document.querySelector('#display').textContent = this.formatNumber(String(model.subtotal.get()))
  }
  function formatNumber (string) {
    return (Math.abs(string) > 999999999)
    ? (Number(string).toExponential(5) + '').replace(/\.*0*e\+/, 'e')
    : string.split('.')[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') +
      (String(/\./.test(string)).replace(/false/, '') && '.') +
      (string.split('.')[1] || '').replace(/,/g, '')
  }
  function setShellSize () {
    if (window.matchMedia('(orientation: landscape)').matches) {
      shellSize(1.5, '25vh', '16.66%', '100%')
    } else if (window.matchMedia('(orientation: portrait)').matches) {
      shellSize(0.666, '16.66vh', '25%', '33.33%')
    }
    function shellSize (ratio, paddingAll, paddingDisplay, paddingClear) {
      let calculator = document.querySelector('.calculator')
      let btnShells = document.querySelectorAll('.btn-shell')

      if (calculator.offsetWidth > (ratio) * calculator.offsetHeight) {
        btnShells.forEach(function changePadding (item) {
          item.style.paddingTop = paddingAll
        })
      } else {
        btnShells.forEach(function changePadding (item) {
          if (item.id === 'display-shell') {
            item.style.paddingTop = paddingDisplay
          } else if (item.id === 'clear-shell') {
            item.style.paddingTop = paddingClear
          } else {
            item.style.paddingTop = '100%'
          }
        })
      }
    }
  }
})(window.calcMVC.model);

/* **************************************************************************
CONTROLLER
*************************************************************************** */

(function makeController (model, view) {
  window.calcMVC.controller = {
    initialize,
    numbersHandler,
    operatorsHandler,
    numbersClickListener,
    numbersKeyListener,
    operatorsClickListener,
    operatorsKeyListener,
    clearClickListener,
    clearKeyListener,
    equalsClickListener,
    equalsKeyListener,
    keydownFocusListener,
    shellSizeListener
  }
  function initialize () {
    view.displayInput()
    view.setShellSize()
    this.numbersClickListener()
    this.numbersKeyListener()
    this.operatorsClickListener()
    this.operatorsKeyListener()
    this.clearClickListener()
    this.clearKeyListener()
    this.equalsClickListener()
    this.equalsKeyListener()
    this.keydownFocusListener()
    this.shellSizeListener()
  }
  function numbersHandler (e) {
    if (e.type === 'keydown' && !NUM_KEY_MAP.hasOwnProperty(e.key))
      return

    model.executeCurrentOperator()

    if ((e.target.id === 'decimal' || NUM_KEY_MAP[e.key] === 'decimal') && /\./.test(model.input.get())) {
      return
    } else if (e.target.id === 'sign') {
      model.input.changeSign()
    } else {
      model.input.addCharEnd(e.key || e.target.textContent)
      model.input.trimLeadingZeros()
    }
    view.displayInput()
  }
  function operatorsHandler (e) {
    if (e.type === 'keydown' && !OPERATOR_KEY_MAP.hasOwnProperty(e.key))
      return

    if (model.subtotal.get() && !model.total.get())
      model.input.setToSubtotal.call(model)

    model.currentOperator[OPERATOR_KEY_MAP[e.key] || e.target.id]()
    model.evaluateSubtotal()
    view.displaySubtotal()
  }
  function numbersClickListener () {
    document.querySelectorAll('.number').forEach(function listen (item) { item.addEventListener('click', this.numbersHandler) }, this)
  }
  function numbersKeyListener () {
    window.addEventListener('keydown', this.numbersHandler)
  }
  function operatorsClickListener () {
    document.querySelectorAll('.operator').forEach(function listen (item) { item.addEventListener('click', this.operatorsHandler) }, this)
  }
  function operatorsKeyListener () {
    window.addEventListener('keydown', this.operatorsHandler)
  }
  function equalsClickListener () {
    document.querySelector('#equals').addEventListener('click', function listen (e) {
      model.evaluateEquals()
      view.displaySubtotal()
    })
  }
  function equalsKeyListener () {
    window.addEventListener('keydown', function listen (e) {
      if (OTHER_KEY_MAP[e.key] === 'equals') {
        model.evaluateEquals()
        view.displaySubtotal()
      }
    })
  }
  function clearClickListener () {
    document.querySelector('#clear').addEventListener('click', function listen (e) {
      model.clear()
      view.displayInput()
    })
  }
  function clearKeyListener () {
    window.addEventListener('keydown', function listen (e) {
      if (OTHER_KEY_MAP[e.key] === 'clear') {
        model.clear()
        view.displayInput()
      }
    })
  }
  function keydownFocusListener () {
    window.addEventListener('keydown', function listen (e) {
      if (NUM_KEY_MAP.hasOwnProperty(e.key)) {
        document.querySelector('#' + NUM_KEY_MAP[e.key]).focus()
      } else if (OPERATOR_KEY_MAP.hasOwnProperty(e.key)) {
        document.querySelector('#' + OPERATOR_KEY_MAP[e.key]).focus()
      } else if (OTHER_KEY_MAP.hasOwnProperty(e.key)) {
        document.querySelector('#' + OTHER_KEY_MAP[e.key]).focus()
      }
    })
  }
  function shellSizeListener () {
    window.addEventListener('resize', view.setShellSize.bind(view))
  }
})(window.calcMVC.model, window.calcMVC.view)

/* **************************************************************************
INITIALIZE
*************************************************************************** */

window.calcMVC.controller.initialize()
