"use strict"

var simonSeries = [];
var currentSeries = [];
var simonTurn = true;
var gameOn = false;
var strict = false;
var currentBtn = null;
var originalColor = '';
var duration = 750;
var durationBreak = 500;
var btnDown = false;
var series = 0;

// sounds
var fail = new Audio('sounds/no.mp3');
var intro = new Audio('sounds/intro.mp3');
var context = new AudioContext;
var note = context.createOscillator();
note.start(0);

function toggleStrict() {
  if (!gameOn) {
    return;
  }

  if (strict) {
    strict = false;
    $('.light').css('background-color', 'darkred');
  } else {
    strict = true;
    $('.light').css('background-color', 'red');
  }
}

function switchUser() {
  if (simonTurn) {
    simonTurn = false;
    console.log('Your Turn');
  } else {
    simonTurn = true;
    console.log("Simon's Turn");
  }
}

function playSound() {
  if (currentBtn == '#green') {
    note.frequency.value = 261.63;
    note.connect(context.destination);
  } else if (currentBtn == '#red') {
    note.frequency.value = 293.66;
    note.connect(context.destination);
  } else if (currentBtn == '#blue') {
    note.frequency.value = 329.63;
    note.connect(context.destination);
  } else if (currentBtn == '#yellow') {
    note.frequency.value = 349.23;
    note.connect(context.destination);
  } else {
    return;
  }
}

function highlightStart() {
  playSound();
  originalColor = $(currentBtn).css("background-color");
  var newColor = tinycolor(originalColor).brighten(15);
  $(currentBtn).css("background-color", newColor);
}

function highlightStop() {
  note.disconnect();
  $(currentBtn).css("background-color", originalColor);
  currentBtn = null;
  originalColor = '';
}

function checkTimelimit() {
  var timeLimit = 750;
  var timer = setInterval(function () {
    if (!currentBtn) {
      if (!timeLimit--) {
        clearInterval(timer);
        gameOver(false);
        return;
      }
    } else {
      clearInterval(timer);
    }
  }, 1);
}

function showSeries(num) {
  if (series >= 10) {
    duration = 300;
    durationBreak = 200;
  }

  if (!num) {
    num = 0;
  }

  if (num < simonSeries.length) {
    currentBtn = simonSeries[num];
    highlightStart();
    setTimeout(function () {
      highlightStop();
      setTimeout(function () {
        showSeries(++num);
      }, durationBreak);
    }, duration);
  } else {
    switchUser();
    checkTimelimit();
    return;
  }
}

function checkWin() {
  if (series == 20) {
    gameOver(true);
    return true;
  } else {
    return false;
  }
}

function gameOver(win) {
  if (win) {
    $('#score h6').html('GG');
    setTimeout(newGame, 1500);
  } else {
    fail.play();
    $('#score h6').html('!!');
    setTimeout(function () {
      $('#score h6').html('');
      setTimeout(function () {
        $('#score h6').html('!!');
      }, 250);
    }, 250);

    switchUser();
    if (strict) {
      setTimeout(newGame, 3000);
    } else {
      currentSeries = [];
      setTimeout(function () {
        $('#score h6').html('--');
      }, 1500);
      setTimeout(showSeries, 3000);
    }
  }
}

function updateScore() {
  series = simonSeries.length;
  if (series) {
    $('#score h6').html(series);
  }
}

function newColor() {
  var n = Math.floor(Math.random() * (4 - 1 + 1) + 1);
  if (n == 1) {
    return '#green';
  } else if (n == 2) {
    return '#red';
  } else if (n == 3) {
    return '#blue';
  } else if (n == 4) {
    return '#yellow';
  }
}

function newGame() {
  intro.play();
  console.log('New Game');

  simonSeries = [];
  currentSeries = [];
  simonTurn = true;
  gameOn = true;
  currentBtn = null;
  originalColor = '';
  duration = 750;
  durationBreak = 500;
  btnDown = false;
  series = 0;

  simonSeries.push(newColor());
  setTimeout(showSeries, 3000);

  $('#score h6').html('--');
  setTimeout(function () {
    $('#score h6').html('');
    setTimeout(function () {
      $('#score h6').html('--');
    }, 250);
  }, 250);

  $('#score h6').removeClass('off');
  $('#score h6').addClass('on');
}

function nextSeries() {
  simonSeries.push(newColor());
  currentSeries = [];
  switchUser();
  setTimeout(showSeries, 1500);
}

function checkSeries() {
  for (var i = 0; i < currentSeries.length; i++) {
    if (currentSeries[i] !== simonSeries[i]) {
      gameOver(false);
      return;
    }
  }

  if (currentSeries.length == simonSeries.length) {
    updateScore();
    if (!checkWin()) {
      nextSeries();
    }
  } else {
    checkTimelimit();
  }
}

$(document).ready(function () {
  $('#start').click(function () {
    newGame();
  });
  $('#strict').click(function () {
    toggleStrict();
  });
  // disable right click
  $("html").on("contextmenu", function () {
    return false;
  });

  $('.simon-btn').mousedown(function (e) {
    if (simonTurn || !gameOn || e.which == 3 || currentBtn) {
      return;
    }
    currentBtn = '#' + this.id;
    btnDown = true;
    currentSeries.push(currentBtn);
    highlightStart(currentBtn);

    var timer = 250;
    var btnHold = setInterval(function () {
      // user holds button too long
      if (!timer) {
        btnDown = false;
        clearInterval(btnHold);
        highlightStop();
        checkSeries();
        timer = 400;
        return;
      }
      // user releases button
      if (!btnDown) {
        clearInterval(btnHold);
        highlightStop();
        checkSeries();
        timer = 400;
        return;
      }
      timer--;
    }, 1);
  }).bind('mouseup mouseleave', function () {
    if (!simonTurn && gameOn && currentBtn) {
      btnDown = false;
    }
  });
});