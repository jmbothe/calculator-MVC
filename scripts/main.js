'strict'

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

(function makeModel (globalObject) {
  window.calculatorMVC = {}

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
    highPrecedenceExpression: expressionModule('*')
  }

  function evaluateSubtotal () {
    if (this.operator.isLowPrecedence()) {
      this.subtotal.set
        .call(this, this.lowPrecedenceExpression
          .evaluate(this.midPrecedenceExpression
            .evaluate(this.highPrecedenceExpression
              .evaluate(this.input.get()))))
    } else if (this.operator.isMidPrecedence()) {
      this.subtotal.set
        .call(this, this.midPrecedenceExpression
          .evaluate(this.highPrecedenceExpression
            .evaluate(this.input.get())))
    } else if (this.operator.isHighPrecedence()) {
      this.subtotal.set
        .call(this, this.highPrecedenceExpression
          .evaluate(this.input.get()))
    }
  }

  function setVariables () {
    if (this.operator.isNotDefined()) {
      return
    } else if (this.operator.isLowPrecedence()) {
      this.lowPrecedenceExpression.curry
        .call(this, this.subtotal.get(), this.operator.get())
      this.midPrecedenceExpression.reset()
      this.highPrecedenceExpression.reset()
    } else if (this.operator.isMidPrecedence()) {
      this.midPrecedenceExpression.curry.call(this, this.subtotal.get())
      this.highPrecedenceExpression.reset()
    } else if (this.operator.isHighPrecedence()) {
      this.highPrecedenceExpression.curry.call(this, this.subtotal.get())
    }
    this.operator.reset()
    this.input.reset()
  }

  function evaluateTotal () {
    this.input.setToSubtotal.call(this)
    this.lowPrecedenceExpression.reset()
    this.midPrecedenceExpression.reset()
    this.highPrecedenceExpression.reset()
    this.operator.reset()
  }

  function clearAfterEquals () {
    let userTrynaEnterNumbersAfterLastButtonPressWasEqualsBETTERrESETtHATsHIT =
      this.subtotal.get() == this.input.get() && this.operator.isNotDefined()

    if (userTrynaEnterNumbersAfterLastButtonPressWasEqualsBETTERrESETtHATsHIT) {
      this.input.reset()
      this.subtotal.reset()
    }
  }

  function clear () {
    this.input.reset()
    this.lowPrecedenceExpression.reset()
    this.midPrecedenceExpression.reset()
    this.highPrecedenceExpression.reset()
    this.operator.reset()
    this.subtotal.reset()
  }

  function round (number) {
    let isExponentialForm = /e/.test(number + '')
    let isNegativeDecimal = /\./.test(number + '') && /^-/.test(number + '')
    let negPlaces = 10 - (number + '').indexOf('.')
    let isPositiveDecimal = /\./.test(number + '')
    let posPlaces = 9 - (number + '').indexOf('.')

    if (isExponentialForm) {
      return number
    } else if (isNegativeDecimal) {
      return +(Math.round(number + 'e' + negPlaces) + 'e-' + negPlaces)
    } else if (isPositiveDecimal) {
      return +(Math.round(number + 'e' + posPlaces) + 'e-' + posPlaces)
    } else {
      return number
    }
  }

  function buildInput (char) {
    let charIsDecimal = char === '.'
    let charIsSign = char === 'sign'

    if (this.input.hasDecimal() && charIsDecimal) {
      return
    } else if (charIsSign) {
      this.input.changeSign()
      return
    } else {
      this.input.addCharEnd(char)
      this.input.trimLeadingZeros()
    }
  }

  function subtotalModule () {
    let subtotal

    function get () {
      return subtotal
    }
    function set (number) {
      subtotal = this.round(number)
    }
    function reset () {
      subtotal = undefined
    }
    return {get, set, reset}
  }

  function inputModule () {
    let input = '0'

    function get () {
      return input
    }
    function setToSubtotal () {
      input = this.subtotal.get() + ''
    }
    function reset () {
      input = '0'
    }
    function addCharEnd (char) {
      if (this.isNotMaxLength()) input += char
    }
    function isNotMaxLength () {
      return input.match(/\d/g).length < 9
    }
    function changeSign () {
      input = this.isPositive() ? '-' + input : input.substring(1)
    }
    function isPositive () {
      return !(/-/.test(input))
    }
    function trimLeadingZeros () {
      if (this.hasDecimal()) {
        return
      } else if (this.hasPositiveLeadingZero()) {
        input = input.substring(1)
      } else if (this.hasNegativeLeadingZero()) {
        input = '-' + input.substring(2)
      }
    }
    function hasDecimal () {
      return /\./.test(input)
    }
    function hasPositiveLeadingZero () {
      return /^0/.test(input)
    }
    function hasNegativeLeadingZero () {
      return /^-0/.test(input) && input.length > 2
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
      hasNegativeLeadingZero
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
    function set (symbol) {
      operator = symbol
    }
    function isLowPrecedence () {
      return (operator === '+' || operator === '-' || !operator)
    }
    function isMidPrecedence () {
      return (operator === '/')
    }
    function isHighPrecedence () {
      return (operator === '*')
    }
    function isNotDefined () {
      return (!operator)
    }
    return {
      get,
      set,
      reset,
      isLowPrecedence,
      isMidPrecedence,
      isHighPrecedence,
      isNotDefined
    }
  }

  function expressionModule (defaultOperator) {
    let expression = a => +a

    function evaluate (number) {
      return expression(number)
    }
    function reset () {
      expression = a => +a
    }
    function curry (a, operator = defaultOperator) {
      expression = b => this.round(eval(a + operator + b))
    }
    return {evaluate, reset, curry}
  }
})(window);

/* **************************************************************************
VIEW
*************************************************************************** */

(function makeView (globalObject) {
  window.calculatorMVC.view = {
    display,
    formatNumber,
    respondToOrientation,
    setShellSize,
    drawButtonAnimation,
    animateButton
  }

  function display (number) {
    document.querySelector('#display').textContent =
      this.formatNumber(number + '')
  }

  function formatNumber (string) {
    let excedesThresholds =
      Math.abs(+string) > 999999999 ||
      Math.abs(+string) < 0.000001 && Math.abs(+string) > 0

    return (excedesThresholds)
      ? ((+string).toExponential(5) + '')
          .replace(/\.*0*e/, 'e')
            .replace(/\+/, '')
      : string.split('.')[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') +
          ((/\./.test(string) + '').replace(/false/, '') && '.') +
            (string.split('.')[1] || '')
  }

  function respondToOrientation () {
    let shouldBeLandscape =
      window.matchMedia('(orientation: landscape)').matches &&
        window.innerWidth <= 1024
    let shouldBePortrait =
      window.matchMedia('(orientation: portrait)').matches ||
        window.innerWidth > 1024

    if (shouldBeLandscape) {
      this.setShellSize(1.5, '25vh', '16.66%', '100%')
      document.querySelector('#clear').textContent = 'cl'
    } else if (shouldBePortrait) {
      this.setShellSize(0.666, '16.66vh', '25%', '33.33%')
      document.querySelector('#clear').textContent = 'clear'
    }
  }

  function setShellSize (ratio, paddingAll, paddingDisplay, paddingClear) {
    let calculator = document.querySelector('.calculator')
    let buttonShells = document.querySelectorAll('.button-shell')
    let excedesRatio =
      calculator.offsetWidth > (ratio) * calculator.offsetHeight

    if (excedesRatio) {
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

  function animateButton (target, draw, duration) {
    let start = performance.now()

    requestAnimationFrame(function animate (time) {
      let timeFraction = (time - start) / duration
      if (timeFraction > 1) timeFraction = 1

      draw(target, timeFraction)

      if (timeFraction < 1) requestAnimationFrame(animate)
    })
  }

  function drawButtonAnimation (target, timeFraction) {
    let right = window.getComputedStyle(target, null).getPropertyValue('right')
    let fontSize = window.getComputedStyle(target, null).getPropertyValue('font-size')

    if (timeFraction < 0.5) {
      target.style.top = target.style.bottom = target.style.left =
      target.style.right = (parseFloat(right) + 1) + 'px'
      target.style.fontSize = (parseFloat(fontSize) - 1) + 'px'
    } else if (timeFraction >= 0.5 && timeFraction < 1) {
      target.style.top = target.style.bottom = target.style.left =
      target.style.right = (parseFloat(right) - 1) + 'px'
      target.style.fontSize = (parseFloat(fontSize) + 1) + 'px'
    } else {
      target.style.top = target.style.bottom = target.style.left =
      target.style.right = '3%'
      target.style.fontSize = '1rem'
    }
  }
})(window);

/* **************************************************************************
CONTROLLER
*************************************************************************** */

(function makeController (globalObject, model, view) {
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
    resizeListener
  }

  function initialize () {
    view.display(model.input.get())
    view.respondToOrientation()
    this.keydownListener()
    this.numbersClickListener()
    this.operatorsClickListener()
    this.clearClickListener()
    this.equalsClickListener()
    this.resizeListener()
  }

  function numbersHandler (e) {
    let keyTarget = document.querySelector('#' + NUM_KEY_MAP[e.key])
    let char = e.key || e.target.dataset.content

    model.clearAfterEquals()
    model.setVariables()
    model.buildInput(char)
    view.display(model.input.get())
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100)
  }

  function operatorsHandler (e) {
    let keyTarget = document.querySelector('#' + OPERATOR_KEY_MAP[e.key])

    model.operator.set(e.key || e.target.dataset.operator)
    model.evaluateSubtotal()
    view.display(model.subtotal.get())
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100)
  }

  function equalsHandler (e) {
    let keyTarget = document.querySelector('#' + OTHER_KEY_MAP[e.key])

    model.evaluateSubtotal()
    model.evaluateTotal()
    view.display(model.input.get())
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100)
  }

  function clearHandler (e) {
    let keyTarget = document.querySelector('#' + OTHER_KEY_MAP[e.key])

    model.clear()
    view.display(model.input.get())
    view.animateButton(keyTarget || e.target, view.drawButtonAnimation, 100)
  }

  function keydownListener () {
    window.addEventListener('keydown', function listen (e) {
      if (NUM_KEY_MAP.hasOwnProperty(e.key)) {
        this.numbersHandler(e)
      } else if (OPERATOR_KEY_MAP.hasOwnProperty(e.key)) {
        this.operatorsHandler(e)
      } else if (e.key === 'Enter') {
        this.equalsHandler(e)
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        this.clearHandler(e)
      }
    }.bind(this))
  }

  function numbersClickListener () {
    document.querySelectorAll('.number').forEach(function listen (item) {
      item.addEventListener('click', this.numbersHandler)
    }, this)
  }
  function operatorsClickListener () {
    document.querySelectorAll('.operator').forEach(function listen (item) {
      item.addEventListener('click', this.operatorsHandler)
    }, this)
  }
  function equalsClickListener () {
    document.querySelector('#equals').addEventListener('click', this.equalsHandler)
  }
  function clearClickListener () {
    document.querySelector('#clear').addEventListener('click', this.clearHandler)
  }
  function resizeListener () {
    window.addEventListener('resize', view.respondToOrientation.bind(view))
  }
})(window, window.calculatorMVC.model, window.calculatorMVC.view)

/* **************************************************************************
INITIALIZE
*************************************************************************** */

window.calculatorMVC.controller.initialize()
