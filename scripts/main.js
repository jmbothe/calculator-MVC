const model = {
  input: '',

  tempInput: '',

  tempTotal: undefined,

  total: 0,

  currentOperator: '',

  operateAddSub: a => a,

  operateMultDiv: a => a,

  changeSign: function () {
    return (this.input.indexOf('-') === -1) ? '-' + this.input : this.input.substring(1)
  },
  add: a => b => (Number(a) + Number(b)).toPrecision(10),

  subtract: a => b => (Number(a) - Number(b)).toPrecision(10),

  divide: a => b => (Number(a) / Number(b)).toPrecision(10),

  multiply: a => b => (Number(a) * Number(b)).toPrecision(10),

  clear: function () {
    this.input = ''
    this.tempInput = ''
    this.tempTotal = 0
    this.total = 0
    this.curentOperator = ''
    this.operateAddSub = a => a
    this.operateMultDiv = a => a
  },
  trimLeadingZeros: function () {
    return this.input.indexOf('0') === 0 && this.input.length > 1 ? this.input.substring(1) : this.input
  },
  limitDecimalPoints: function () {
    return this.input.indexOf('.') !== -1 && this.input.indexOf('.') !== this.input.length - 1 ? this.input.substring(0, this.input.length - 1) : this.input
  },
  round: (value) => Number(Math.round(value + 'e' + 12) + 'e-' + 12)
}
const controller = {

  init: function () {
    this.numbersHandler()
    this.operatorHandler()
    this.clearHandler()
    this.keyHandler()
    this.equalsHandler()
  },
  numbersHandler: function () {
    document.querySelector('.numbers').addEventListener('click', function (e) {
      if (model.currentOperator === 'add' || model.currentOperator === 'subtract') {
        model.tempTotal = model.round(model.operateMultDiv(model.tempInput))
        model.total = model.round(model.operateAddSub(model.tempTotal))
        model.operateAddSub = model[model.currentOperator](model.total)
        model.input = ''
        model.tempTotal = 0
        model.currentOperator = ''
        model.operateMultDiv = a => a
      } else if (model.currentOperator === 'multiply' || model.currentOperator === 'divide') {
        model.tempTotal = model.round(model.operateMultDiv(model.tempInput))
        model.operateMultDiv = model[model.currentOperator](model.tempTotal)
        model.input = ''
        model.currentOperator = ''
      }
      if (e.target.className === 'sign') {
        model.input = model.changeSign()
        view.displayInput()
      } else if (e.target.className === 'decimal') {
        model.input += e.target.textContent
        model.input = model.limitDecimalPoints()
        view.displayInput()
      } else {
        model.input += e.target.textContent
        model.input = model.trimLeadingZeros()
        view.displayInput()
      }
    })
  },
  operatorHandler: function () {
    document.querySelector('.operators').addEventListener('click', function (e) {
      model.tempInput = model.input
      model.currentOperator = e.target.className
      if (model.currentOperator === 'add' || model.currentOperator === 'subtract') {
        view.displayAddSubTotal()
      } else if (model.currentOperator === 'multiply' || model.currentOperator === 'divide') {
        view.displayMultDivTotal()
      }
    })
  },
  equalsHandler: function () {
    document.querySelector('.equals').addEventListener('click', function (e) {
      model.tempInput = model.input
      model.tempTotal = model.round(model.operateMultDiv(model.tempInput))
      model.total = model.round(model.operateAddSub(model.tempTotal))
      model.input = model.total
      model.tempTotal = 0
      model.operateAddSub = a => a
      model.operateMultDiv = a => a
      model.tempInput = ''
      model.currentOperator = ''
      view.displayTotal()
    })
  },
  clearHandler: function () {
    document.querySelector('.clear').addEventListener('click', function (e) {
      model.clear()
      view.displayInput()
    })
  },
  keyHandler: function () {
    window.addEventListener('keydown', function (e) {
      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '0':
          model.input += e.key
          model.input = model.trimLeadingZeros()
          view.displayInput()
          break
        case '.':
          model.input += e.key
          model.input = model.limitDecimalPoints()
          view.displayInput()
          break
        case '+':
          model.sum = model.round(model.operator(model.input || model.sum))
          model.operator = model.add(model.sum)
          model.input = ''
          view.displaySum()
          break
        case '-':
          model.sum = model.round(model.operator(model.input || model.sum))
          model.operator = model.subtract(model.sum)
          model.input = ''
          view.displaySum()
          break
        case '/':
          model.sum = model.round(model.operator(model.input || model.sum))
          model.operator = model.divide(model.sum)
          model.input = ''
          view.displaySum()
          break
        case '*':
          model.sum = model.round(model.operator(model.input || model.sum))
          model.operator = model.multiply(model.sum)
          model.input = ''
          view.displaySum()
          break
        case 'Enter':
          model.sum = model.round(model.operator(model.input || model.sum))
          model.operator = a => a
          model.input = ''
          view.displaySum()
          break
        case 'Backspace':
        case 'Delete':
          model.clear()
          view.displayInput()
      }
    })
  }
}
const view = {

  displayInput: function () {
    document.querySelector('.display').textContent = model.input
  },
  displayTotal: function () {
    document.querySelector('.display').textContent = model.total
  },
  displayMultDivTotal: function () {
    document.querySelector('.display').textContent = model.round(model.operateMultDiv(model.tempInput))
  },
  displayAddSubTotal: function () {
    document.querySelector('.display').textContent = model.round(model.operateAddSub(model.round(model.operateMultDiv(model.tempInput || model.input))))
  }
}
controller.init()
