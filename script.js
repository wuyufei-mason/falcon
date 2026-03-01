const sessionLabel = document.getElementById('sessionLabel');
const timeDisplay = document.getElementById('timeDisplay');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const statusHint = document.getElementById('statusHint');

const focusInput = document.getElementById('focusInput');
const shortBreakInput = document.getElementById('shortBreakInput');
const longBreakInput = document.getElementById('longBreakInput');
const roundsInput = document.getElementById('roundsInput');

let timerId = null;
let remainingSeconds = 25 * 60;
let mode = 'focus';
let focusCount = 0;

function getSettings() {
  return {
    focus: Number(focusInput.value) || 25,
    shortBreak: Number(shortBreakInput.value) || 5,
    longBreak: Number(longBreakInput.value) || 15,
    rounds: Number(roundsInput.value) || 4,
  };
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function getModeLabel(currentMode) {
  if (currentMode === 'focus') return '专注时间';
  if (currentMode === 'shortBreak') return '短休息';
  return '长休息';
}

function getModeDurationInSeconds(currentMode) {
  const settings = getSettings();
  if (currentMode === 'focus') return settings.focus * 60;
  if (currentMode === 'shortBreak') return settings.shortBreak * 60;
  return settings.longBreak * 60;
}

function render() {
  sessionLabel.textContent = getModeLabel(mode);
  timeDisplay.textContent = formatTime(remainingSeconds);
}

function notify(message) {
  statusHint.textContent = message;
}

function switchToNextMode() {
  const settings = getSettings();

  if (mode === 'focus') {
    focusCount += 1;
    mode = focusCount % settings.rounds === 0 ? 'longBreak' : 'shortBreak';
  } else {
    mode = 'focus';
  }

  remainingSeconds = getModeDurationInSeconds(mode);
  render();

  if (mode === 'focus') {
    notify(`休息结束，开始第 ${focusCount + 1} 轮专注。`);
  } else {
    notify(`${getModeLabel(mode)}开始，放松一下。`);
  }
}

function tick() {
  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
    render();
    return;
  }

  switchToNextMode();
}

function startTimer() {
  if (timerId) return;
  timerId = setInterval(tick, 1000);
  startPauseBtn.textContent = '暂停';
  notify('计时进行中，保持专注！');
}

function pauseTimer() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
  startPauseBtn.textContent = '继续';
  notify('已暂停，你可以随时继续。');
}

function resetTimer() {
  pauseTimer();
  mode = 'focus';
  focusCount = 0;
  remainingSeconds = getModeDurationInSeconds(mode);
  render();
  startPauseBtn.textContent = '开始';
  notify('已重置，准备进入第一轮专注。');
}

startPauseBtn.addEventListener('click', () => {
  if (timerId) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener('click', resetTimer);

skipBtn.addEventListener('click', () => {
  switchToNextMode();
  notify('已跳过当前阶段。');
});

[focusInput, shortBreakInput, longBreakInput, roundsInput].forEach((input) => {
  input.addEventListener('change', () => {
    const min = Number(input.min);
    const max = Number(input.max);
    let value = Number(input.value);

    if (Number.isNaN(value)) {
      value = min;
    }

    value = Math.min(max, Math.max(min, value));
    input.value = String(value);

    if (!timerId && mode === 'focus') {
      remainingSeconds = getModeDurationInSeconds(mode);
      render();
    }
  });
});

resetTimer();
