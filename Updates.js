// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
function batteryLevel() {
  let output = "Battery is running low please charge the device.";
  if(Device.batteryLevel() < 0.35) {
     return output;
  }
}
async function parseLevisStadiumEventsXML(content) {
  return new Promise(async function(resolve, reject) {
    try {
      const today = new Date();
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() + 8);
      const eventsInThisWeek = [];
      const xmlParser = new XMLParser(content);
      const items = [];
      let currentItem = null;
      let currentValue = '';
      xmlParser.didStartElement = name => {
        if (name == 'item') {
          currentItem = {
            title: '',
            link: '',
          };
        } else if (currentItem && name == "title") {
          currentValue = '';
        } else if (currentItem && name == "link") {
          currentValue = '';
        }
      }
      xmlParser.didEndElement = name => {
        const hasItem = currentItem != null
        if (currentItem && name == 'item') {
          items.push(currentItem);
          currentItem = null;
        } else if (currentItem && name == "title") {
          currentItem.title = currentValue;
        } else if (currentItem && name == "link") {
          currentItem.link = currentValue;
        }
      }
      xmlParser.foundCharacters = str => {
        currentValue += str;
      }

      xmlParser.didEndDocument = () => {
        for (let index = 0; index < items.length; index += 1) {
            const { title, link } = items[index];
            const dateStringMatches = link.match(/\d{4}-\d{1,2}-\d{1,2}/);
            if (dateStringMatches && dateStringMatches.length > 0) {
                const dateValues = dateStringMatches[0].split('-');
                const newDate = new Date(...dateValues);
                if (newDate.toDateString() === today.toDateString()) {
                    eventsInThisWeek.push(`There is an event today, Try to avoid the route. Event: ${title}`)
                } else if (thisWeek.valueOf() >= newDate.valueOf()) {
                    eventsInThisWeek.push(`${title} on ${newDate.toDateString()}`);
                }
            }
        }
        resolve(eventsInThisWeek);
      };
      xmlParser.parse();
    } catch(e) {
      log(e);
      resolve([]);
    };
  });
} 

async function levisStadiumEvents() {
  const eventsUrl = 'http://www.levisstadium.com/events/category/tickets/feed/';
  const req = new Request(eventsUrl);
  const resp = await req.loadString();
  return (await parseLevisStadiumEventsXML(resp)).join('\n');
}

function calendarUpdates() {
	
}

async function run() {
  const text = [];
  text.push(batteryLevel());
  text.push(calendarUpdates());
  text.push(await levisStadiumEvents());
  return text.filter(text => text && text.length > 0).join('\n');
}

let siriText = await run();
if(!siriText) {
  siriText = "There are no updates for today";
}
if (config.runsWithSiri) {
  Speech.speak(siriText)
} else {
  QuickLook.present(siriText)
}

