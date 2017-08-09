function setButtonSizePortrait () {
  if (document.querySelector('.layer-one').offsetWidth > (2 / 3) * document.querySelector('.layer-one').offsetHeight) {
    document.querySelectorAll('.layer-three').forEach(function (item) {
      item.style.paddingTop = '16.66vh'
    })
  } else {
    document.querySelectorAll('.layer-three').forEach(function (item) {
      if (item.id === 'inner-display') {
        item.style.paddingTop = '25%'
      } else if (item.id === 'inner-clear') {
        item.style.paddingTop = '33.33%'
      } else {
        item.style.paddingTop = '100%'
      }
    })
  }
}
function setButtonSizeLandscape () {
  if (document.querySelector('.layer-one').offsetWidth > (3 / 2) * document.querySelector('.layer-one').offsetHeight) {
    document.querySelectorAll('.layer-three').forEach(function (item) {
      item.style.paddingTop = '25vh'
    })
  } else {
    document.querySelectorAll('.layer-three').forEach(function (item) {
      if (item.id === 'inner-display') {
        item.style.paddingTop = '33.33%'
      } else {
        item.style.paddingTop = '100%'
      }
    })
  }
}
function setButtonSize () {
  if (window.matchMedia('(orientation: landscape)').matches) {
    setButtonSizeLandscape()
  } else if (window.matchMedia('(orientation: portrait)').matches) {
    setButtonSizePortrait()
  }
}
window.addEventListener('resize', setButtonSize)
setButtonSize()
