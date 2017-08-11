/* **************************************************************************
CONSTANTS
*************************************************************************** */

const round = function (value, places = 9) {
  return (+(Math.round(value + 'e' + places) + 'e-' + places) || value)
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

(function makeModel (globalObject) {
  window.calculatorMVC = {}

  window.calculatorMVC.model = {
    input: inputModule(),
    total: totalModule(),
    forkTotal: totalModule(),
    subTotal: totalModule(), // used for view.display purposes only
    mainExpression: mainExpressionModule(),
    forkExpression: forkExpressionModule(),
    currentOperator: operatorModule(),
    evaluatePendingExpression,
    setVariables,
    evaluateSubTotal,
    evaluateEquals,
    clearAfterEquals,
    clear
  }

  function totalModule () {
    let total

    function get () {
      return total
    }
    function set (number) {
      total = (/\./.test(number + ''))
        ? round(number, 9 - (number + '').indexOf('.'))
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
    function setToTotal () {
      input = this.total.get() + ''
    }
    function reset () {
      input = '0'
    }
    return {
      get,
      addCharEnd,
      changeSign,
      trimLeadingZeros,
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

  function mainExpressionModule () {
    let expression = a => +a

    function evaluate (number) {
      return expression(number)
    }
    function reset () {
      expression = a => +a
    }
    function add (a) {
      expression = function (b) {
        return round(a + +b)
      }
    }
    function subtract (a) {
      expression = function (b) {
        return round(a - b)
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
    let expression = a => +a

    function evaluate (number) {
      return expression(number)
    }
    function reset () {
      expression = a => +a
    }
    function multiply (a) {
      expression = function (b) {
        return round(a * b)
      }
    }
    function divide (a) {
      expression = function (b) {
        return round(a / b)
      }
    }
    return {
      evaluate,
      reset,
      multiply,
      divide
    }
  }

  function evaluateSubTotal () {
    let operator = this.currentOperator.get()

    if (operator === 'add' || operator === 'subtract' || !operator) {
      this.subTotal.set(this.mainExpression.evaluate(this.forkExpression.evaluate(this.input.get())))
    } else if (operator === 'multiply' || operator === 'divide') {
      this.subTotal.set(this.forkExpression.evaluate(this.input.get()))
    }
  }

  function evaluatePendingExpression () {
    let operator = this.currentOperator.get()

    if (!operator)
      return

    this.forkTotal.set(this.forkExpression.evaluate(this.input.get()))
    if (operator === 'add' || operator === 'subtract')
      this.total.set(this.mainExpression.evaluate(this.forkTotal.get()))
  }
  function setVariables () {
    let operator = this.currentOperator.get()

    if (!operator)
      return

    if (operator === 'add' || operator === 'subtract') {
      this.mainExpression[operator](this.total.get())
      this.forkExpression.reset()
    } else if (operator === 'multiply' || operator === 'divide') {
      this.forkExpression[operator](this.forkTotal.get())
    }
    this.currentOperator.reset()
    this.input.reset()
  }

  function evaluateEquals () {
    this.forkTotal.set(this.forkExpression.evaluate(this.input.get()))
    this.total.set(this.mainExpression.evaluate(this.forkTotal.get()))
    this.input.setToTotal.apply(this)
    this.mainExpression.reset()
    this.forkExpression.reset()
    this.currentOperator.reset()
  }

  function clearAfterEquals () {
    if (this.total.get() == this.input.get() && !this.currentOperator.get()) {
      this.input.reset()
      this.total.set(undefined)
    }
  }

  function clear () {
    this.input.reset()
    this.mainExpression.reset()
    this.forkExpression.reset()
    this.currentOperator.reset()
    this.forkTotal.set(undefined)
    this.total.set(undefined)
  }
})(window);

/* **************************************************************************
VIEW
*************************************************************************** */

(function makeView (globalObject, model) {
  window.calculatorMVC.view = {
    displayInput,
    displayTotal,
    displaySubTotal,
    formatNumber,
    respondToOrientation,
    setShellSize,
    drawButtonAnimation,
    animateButton
  }
  function displayInput () {
    document.querySelector('#display').textContent = this.formatNumber(model.input.get())
  }
  function displayTotal () {
    document.querySelector('#display').textContent = this.formatNumber(model.total.get() + '')
  }
  function displaySubTotal () {
    document.querySelector('#display').textContent = this.formatNumber(model.subTotal.get() + '')
  }

  function formatNumber (string) {
    let largeThreshold = 999999999
    let smallThreshold = 0.000001

    return (Math.abs(+string) > largeThreshold ||
    (Math.abs(+string) < smallThreshold && Math.abs(+string) > 0))
      ? ((+string).toExponential(5) + '').replace(/\.*0*e/, 'e').replace(/\+/, '')
      : string.split('.')[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') +
        ((/\./.test(string) + '').replace(/false/, '') && '.') +
        (string.split('.')[1] || '').replace(/,/g, '')
  }

  function respondToOrientation () {
    if (window.matchMedia('(orientation: landscape)').matches) {
      this.setShellSize(1.5, '25vh', '16.66%', '100%')
      document.querySelector('#clear').textContent = 'cl'
    } else if (window.matchMedia('(orientation: portrait)').matches) {
      this.setShellSize(0.666, '16.66vh', '25%', '33.33%')
      document.querySelector('#clear').textContent = 'clear'
    }
  }

  function setShellSize (ratio, paddingAll, paddingDisplay, paddingClear) {
    let calculator = document.querySelector('.calculator')
    let buttonShells = document.querySelectorAll('.button-shell')

    if (calculator.offsetWidth > (ratio) * calculator.offsetHeight) {
      buttonShells.forEach(function changePadding (item) {
        item.style.paddingTop = paddingAll
      })
    } else {
      buttonShells.forEach(function changePadding (item) {
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

  function drawButtonAnimation (target, timeFraction) {
    let top = window.getComputedStyle(target, null).getPropertyValue('top')
    let bottom = window.getComputedStyle(target, null).getPropertyValue('bottom')
    let left = window.getComputedStyle(target, null).getPropertyValue('left')
    let right = window.getComputedStyle(target, null).getPropertyValue('right')
    let fontSize = window.getComputedStyle(target, null).getPropertyValue('font-size')

    if (timeFraction < 0.5) {
      target.style.top = (parseFloat(top) + 1) + 'px'
      target.style.bottom = (parseFloat(bottom) + 1) + 'px'
      target.style.left = (parseFloat(left) + 1) + 'px'
      target.style.right = (parseFloat(right) + 1) + 'px'
      target.style.fontSize = (parseFloat(fontSize) - 1) + 'px'
    } else if (timeFraction >= 0.5 && timeFraction < 1) {
      target.style.top = (parseFloat(top) - 1) + 'px'
      target.style.bottom = (parseFloat(bottom) - 1) + 'px'
      target.style.left = (parseFloat(left) - 1) + 'px'
      target.style.right = (parseFloat(right) - 1) + 'px'
      target.style.fontSize = (parseFloat(fontSize) + 1) + 'px'
    } else {
      target.style.top = '3%'
      target.style.bottom = '3%'
      target.style.left = '3%'
      target.style.right = '3%'
      target.style.fontSize = '1rem'
    }
  }

  function animateButton (target, draw, duration) {
    let start = performance.now()

    requestAnimationFrame(function animate (time) {
      let timeFraction = (time - start) / duration
      if (timeFraction > 1) timeFraction = 1

      draw(target, timeFraction)

      if (timeFraction < 1)
        requestAnimationFrame(animate)
    })
  }
})(window, window.calculatorMVC.model);

/* **************************************************************************
CONTROLLER
*************************************************************************** */

(function makeController (globalObject, model, view) {
  window.calculatorMVC.controller = {
    initialize,
    numbersHandler,
    operatorsHandler,
    generalKeyListener,
    numbersClickListener,
    operatorsClickListener,
    clearClickListener,
    equalsClickListener,
    resizeListener
  }
  function initialize () {
    view.displayInput()
    view.respondToOrientation()
    this.generalKeyListener()
    this.numbersClickListener()
    this.operatorsClickListener()
    this.clearClickListener()
    this.equalsClickListener()
    this.resizeListener()
  }

  function numbersHandler (e) {
    let keyTarget = document.querySelector('#' + NUM_KEY_MAP[e.key])

    model.clearAfterEquals()
    model.evaluatePendingExpression()
    model.setVariables()

    if ((e.target.id === 'decimal' || keyTarget === '#decimal') && /\./.test(model.input.get()))
      return

    if (e.target.id === 'sign') {
      model.input.changeSign()
    } else {
      model.input.addCharEnd(e.key || e.target.textContent)
      model.input.trimLeadingZeros()
    }
    view.displayInput()
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100)
  }

  function operatorsHandler (e) {
    let keyTarget = document.querySelector('#' + OPERATOR_KEY_MAP[e.key])

    model.currentOperator[OPERATOR_KEY_MAP[e.key] || e.target.id]()
    model.evaluateSubTotal()
    view.displaySubTotal()
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100)
  }

  function generalKeyListener () {
    window.addEventListener('keydown', function listen (e) {
      let keyTarget = document.querySelector('#' + OTHER_KEY_MAP[e.key])

      if (NUM_KEY_MAP.hasOwnProperty(e.key)) {
        this.numbersHandler(e)
      } else if (OPERATOR_KEY_MAP.hasOwnProperty(e.key)) {
        this.operatorsHandler(e)
      } else if (e.key === 'Enter') {
        model.evaluateEquals()
        view.displayTotal()
        view.animateButton(keyTarget, view.drawButtonAnimation, 100)
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        model.clear()
        view.displayInput()
        view.animateButton(keyTarget, view.drawButtonAnimation, 100)
      }
    }.bind(this))
  }

  function numbersClickListener () {
    document.querySelectorAll('.number').forEach(function listen (item) { item.addEventListener('click', this.numbersHandler) }, this)
  }
  function operatorsClickListener () {
    document.querySelectorAll('.operator').forEach(function listen (item) { item.addEventListener('click', this.operatorsHandler) }, this)
  }
  function equalsClickListener () {
    document.querySelector('#equals').addEventListener('click', function listen (e) {
      model.evaluateEquals()
      view.displayTotal()
      view.animateButton(e.target, view.drawButtonAnimation, 100)
    })
  }
  function clearClickListener () {
    document.querySelector('#clear').addEventListener('click', function listen (e) {
      model.clear()
      view.displayInput()
      view.animateButton(e.target, view.drawButtonAnimation, 100)
    })
  }
  function resizeListener () {
    window.addEventListener('resize', view.respondToOrientation.bind(view))
  }
})(window, window.calculatorMVC.model, window.calculatorMVC.view)

/* **************************************************************************
INITIALIZE
*************************************************************************** */

window.calculatorMVC.controller.initialize()
