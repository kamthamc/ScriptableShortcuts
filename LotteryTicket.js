// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
let table = new UITable()

function createArray(length) {
  const arr = [];
  for(let index = 0; index < length; index += 1) {
    arr[index] = index + 1;
  }
  return arr;
}

// Lottery picker generates numbers, special number to pick and 
// then picks 5 numbers and 1 special number
function lotteryPicker(mainNumbers, specialNumbers) {
  let picks = createArray(mainNumbers);
  let specialPicks = createArray(specialNumbers);
  let lottery = [];
  for( let index = 0; index < 5; index += 1) {
    const id = Math.round(Math.random() * 1000) % picks.length;
    lottery.push(picks[id]);
    picks.splice(id, 1);
  }
  lottery = lottery.sort((a, b) => (a - b));
  const special = Math.round(Math.random() * 1000) % specialPicks.length;
  lottery.push(specialPicks[special]);
  return lottery.join(" ");
}
// Mega Million has numbers from 1-70, special nubers from 1-25
function megaMillion() {
  return lotteryPicker(70, 25);
}

// Powerball has numbers from 1-69, special nubers from 1-26
function powerBall() {
  return lotteryPicker(69, 26);
}

// Picks up next Mega Million Lottery pick date Tuesday, Friday
function nextMegaMillionDate() {
  const today = new Date();
  const future = new Date();
  future.setHours(19);
  future.setMinutes(30);
  while((future.valueOf() - today.valueOf()) < 0) {
    future.setDate(future.getDate() + 1);
  }
  let day = future.getDay();
  let count = 0;
  while(count < 7) {
    if(day == 2 || day == 5) {
      break;
    }
    future.setDate(future.getDate() + 1);
    day = future.getDay();
    count += 1;
  }
  return future;
}

// Picks up next Powerball Lottery pick date Wednesday, Thursday
function nextPowerBallDate() {
  const today = new Date();
  const future = new Date();
  future.setHours(19);
  future.setMinutes(30);
  while((future.valueOf() - today.valueOf()) < 0) {
    future.setDate(future.getDate() + 1);
  }
  let day = future.getDay();
  let count = 0;

  while(count < 7) {
    if(day == 3 || day == 6) {
      break;
    }
    future.setDate(future.getDate() + 1);
    day = future.getDay();
    count += 1;
  }
  return future;
}

// Asks for what kind of lottery to pick and how many lotteries to pick
// And then presents in a table view
// And saves in default Reminders
async function showLotteryPicker() {
  const alert = new Alert();
  alert.title = 'Lottery Generator';
  alert.addAction('MegaMillion');
  alert.addAction('PowerBall');
  alert.addTextField('No of tickets to generate', '1');
  function alertSelection(selection) {
    const tickets = parseInt(alert.textFieldValue(0));
    const generator = selection === 0 ? megaMillion : powerBall;
    const generatorText = selection === 0 ? 'Mega Million' : 'Power Ball';
    const header = new UITableRow();
    header.addText(generatorText);
    header.isHeader = true;
    table.addRow(header);
    const numbers = [];
    for(let index = 0; index < tickets; index += 1) {
      const row = new UITableRow();
      const number = generator();
      row.addText(number);
      numbers.push(number);
      table.addRow(row);
    }
    table.present();
    try {
      const reminder = new Reminder();
      const reminderDate = selection === 0 ? nextMegaMillionDate() : nextPowerBallDate();
      reminder.dueDate = reminderDate;
      reminder.priority = 1;
      reminder.notes = numbers.join('\n');
      reminder.title = `${generatorText} - ${reminderDate.toDateString()}`;
      reminder.save();
    } catch(ex) {
      console.log(ex);
    }
  }
  alertSelection(await alert.present())
}

showLotteryPicker();
