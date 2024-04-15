const keyMap = new Map();
keyMap.set("ArrowLeft", 'left');
keyMap.set("ArrowRight", 'right');
keyMap.set("ArrowUp", 'up');
keyMap.set("ArrowDown", 'down');
keyMap.set(" ", 'space');

const keyboardPress = new Map();
const keyboardState = new Map();

function handleInputRelease(input) {
  keyboardState.set(input, false);
}

function handleInputPress(input) {
  if (!keyboardState.get(input)) {
    keyboardPress.set(input, true);
  }
  keyboardState.set(input, true);
}

document.addEventListener('keyup', e => {
  if (keyMap.has(e.key)) {
    key = keyMap.get(e.key)
    handleInputRelease(key)
  }
});

document.addEventListener('keydown', e => {
  if (keyMap.has(e.key)) {
    key = keyMap.get(e.key)
    handleInputPress(key);
  }
});

function updateKeyboardState() {
  keyboardPress.clear();
}

function isKeyDown(key) {
  return keyboardState.get(key);
}

function isKeyPressed(key) {
  return keyboardPress.get(key);
}