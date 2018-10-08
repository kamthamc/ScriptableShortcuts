// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
function batteryLevel() {
  let output = "Battery is running low please charge the device.";
  if(Device.batteryLevel() < 0.35) {
     return output;
  }
}

function calendarUpdates() {
	
}

function run() {
  const text = [];
  text.push(batteryLevel());
  text.push(calendarUpdates());
  return text.filter(text => text && text.length > 0).join('\n');
}

let siriText = run();
if(!siriText) {
  siriText = "There are no updates for today";
}
if (config.runsWithSiri) {
  Speech.speak(siriText)
} else {
  QuickLook.present(siriText)
}

