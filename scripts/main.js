/* **************************************************************************
MODEL
*************************************************************************** */
(function makeModel (window) {
  function stringModule () {
    let string = ''

    function get () {
      return string
    }
    function set (str) {
      string = String(str)
    }
    return {get: get, set: set}
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

  function pathModule () {
    let path = a => Number(a)

    function get () {
      return path
    }
    function set (exprsn) {
      path = exprsn
    }
    return {get: get, set: set}
  }

  function inputModule () {
    let obj = stringModule()

    obj.addCharEnd = function (char) {
      this.set(this.get() + char)
    }
    obj.changeSign = function () {
      this.get().indexOf('-') === -1 ? this.set('-' + this.get()) : this.set(this.get().substring(1))
    }
    obj.trimLeadingZeros = function () {
      if (this.get().indexOf('0') === 0 && this.get().length > 1)
        this.set(this.get().substring(1))
    }
    obj.limitDecimalPoints = function () {
      if (this.get().indexOf('.') !== -1 && this.get().indexOf('.') !== this.get().length - 1)
        this.set(this.get().substring(0, this.get().length - 1))
    }
    return obj
  }

  function mainPathModule () {
    let obj = pathModule()

    obj.add = function (a) {
      return function (b) {
        return (a + b).toPrecision(10)
      }
    }
    obj.subtract = function (a) {
      return function (b) {
        return (a - b).toPrecision(10)
      }
    }
    return obj
  }

  function forkPathModule () {
    let obj = pathModule()

    obj.multiply = function (a) {
      return function (b) {
        return (a * b).toPrecision(10)
      }
    }
    obj.divide = function (a) {
      return function (b) {
        return (a / b).toPrecision(10)
      }
    }
    return obj
  }
  function evaluateMainPath () {
    this.forkTotal.set(this.round(this.forkPath.get()(this.input.get())))
    this.total.set(this.round(this.mainPath.get()(this.forkTotal.get())))
    this.mainPath.set(this.mainPath[this.currentOperator.get()](this.total.get()))
    this.forkPath.set(a => Number(a))
    this.input.set('')
    this.currentOperator.set('')
  }
  function evaluateForkPath () {
    this.forkTotal.set(this.round(this.forkPath.get()(this.input.get())))
    this.forkPath.set(this.forkPath[this.currentOperator.get()](this.forkTotal.get()))
    this.input.set('')
    this.currentOperator.set('')
  }
  function evaluateEquals () {
    this.forkTotal.set(this.round(this.forkPath.get()(this.input.get())))
    this.total.set(this.round(this.mainPath.get()(this.forkTotal.get())))
    this.input.set(this.total.get())
    this.mainPath.set(a => Number(a))
    this.forkPath.set(a => Number(a))
    this.currentOperator.set('')
  }
  function clear () {
    this.input.set('')
    this.forkTotal.set(undefined)
    this.total.set(undefined)
    this.curentOperator = ''
    this.mainPath.set(a => Number(a))
    this.forkPath.set(a => Number(a))
  }
  function round (value) {
    return Number(Math.round(value + 'e' + 12) + 'e-' + 12)
  }

  window.calcMVC = window.calcMVC || {}
  calcMVC.model = {
    input: inputModule(),
    total: totalModule(),
    forkTotal: totalModule(),
    forkPath: forkPathModule(),
    mainPath: mainPathModule(),
    currentOperator: stringModule(),
    evaluateMainPath: evaluateMainPath,
    evaluateForkPath: evaluateForkPath,
    evaluateEquals: evaluateEquals,
    clear: clear,
    round: round
  }
})(window);

/* **************************************************************************
VIEW
*************************************************************************** */

(function makeView (window, model) {
  function displayInput () {
    document.querySelector('.display').textContent = model.input.get()
  }
  function displayForkSubTotal () {
    document.querySelector('.display').textContent = model.round(model.forkPath.get()(model.input.get()))
  }
  function displayMainSubTotal () {
    document.querySelector('.display').textContent = model.round(model.mainPath.get()(model.round(model.forkPath.get()(model.input.get()))))
  }
  window.calcMVC = window.calcMVC || {}
  calcMVC.view = {
    displayInput: displayInput,
    displayForkSubTotal: displayForkSubTotal,
    displayMainSubTotal: displayMainSubTotal
  }
})(window, calcMVC.model);

/* **************************************************************************
CONTROLLER
*************************************************************************** */

(function (window, model, view) {
  function numbersHandler () {
    document.querySelector('.numbers').addEventListener('click', function (e) {
      if (model.currentOperator.get() === 'add' || model.currentOperator.get() === 'subtract') {
        model.evaluateMainPath()
      } else if (model.currentOperator.get() === 'multiply' || model.currentOperator.get() === 'divide') {
        model.evaluateForkPath()
      }
      if (e.target.className === 'sign') {
        model.input.changeSign()
        view.displayInput()
      } else if (e.target.className === 'decimal') {
        model.input.addCharEnd(e.target.textContent)
        model.input.limitDecimalPoints()
        view.displayInput()
      } else {
        model.input.addCharEnd(e.target.textContent)
        model.input.trimLeadingZeros()
        view.displayInput()
      }
    })
  }
  function operatorHandler () {
    document.querySelector('.operators').addEventListener('click', function (e) {
      model.currentOperator.set(e.target.className)
      if (model.currentOperator.get() === 'add' || model.currentOperator.get() === 'subtract') {
        view.displayMainSubTotal()
      } else if (model.currentOperator.get() === 'multiply' || model.currentOperator.get() === 'divide') {
        view.displayForkSubTotal()
      }
    })
  }
  function equalsHandler () {
    document.querySelector('.equals').addEventListener('click', function (e) {
      model.evaluateEquals()
      view.displayInput()
    })
  }
  function clearHandler () {
    document.querySelector('.clear').addEventListener('click', function (e) {
      model.clear()
      view.displayInput()
    })
  }
  function initialize () {
    this.numbersHandler()
    this.operatorHandler()
    this.clearHandler()
    this.equalsHandler()
  }
  window.calcMVC = window.calcMVC || {}
  calcMVC.controller = {
    numbersHandler: numbersHandler,
    operatorHandler: operatorHandler,
    clearHandler: clearHandler,
    equalsHandler: equalsHandler,
    initialize: initialize
  }
  calcMVC.controller.initialize()

})(window, calcMVC.model, calcMVC.view)
