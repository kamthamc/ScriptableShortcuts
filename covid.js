// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: user-md;

const countriesList = ['IN', 'US']

const getFormatter = () => {
  const format = (number) => {
    let temp = number;
    const tempStrList = [];
    while(temp > 0) {
      tempStrList.push(`${temp % 1000}`);
      temp = Math.floor(temp/1000);
    }
    tempStrList.reverse();
    if(number >= 1000) {
      while(tempStrList[tempStrList.length - 1].length < 3) {
        tempStrList[tempStrList.length - 1] = '0' + tempStrList[tempStrList.length - 1]; 
      }
    }
    return tempStrList.join(',');
  };
  if(Intl && Intl.NumberFormat) {
    return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 });
  } else {
    return {
      format
    }
  }
}
const formatter = getFormatter();
const formatDate = (date) => {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month
  }
  if (day.length < 2) {
    day = '0' + day
  }

  return [year, month, day].join('-');
}
if (config.runsInWidget) {
  // create and show widget
  let widget = new ListWidget()
  let preTxt = widget.addText("COVID 19")
  preTxt.textColor = Color.white()
  preTxt.textOpacity = 0.8
  preTxt.textSize = 28
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  
  for(let index = 0; index < countriesList.length; index += 1) {
    const cn = countriesList[index];
    // const req = new Request(`https://coronavirus-19-api.herokuapp.com/countries/${countriesList[index]}`)
    const req1 = new Request(`https://api.coronatracker.com/v3/analytics/newcases/country?countryCode=${cn}&startDate=${formatDate(yesterday)}&endDate=${formatDate(today)}`)
    const res1 = (await req1.loadJSON())[0];
    const req2 = new Request(`https://api.coronatracker.com/v3/stats/worldometer/country?countryCode=${cn}`)
    const res2 = (await req2.loadJSON())[0];
    renderCountryStats(widget, res1, res2)
  }

  let lastWidgetUpdate = widget.addText(`Widget updated on ${new Date().toLocaleString()}`)
  lastWidgetUpdate.textColor = Color.lightGray()
  lastWidgetUpdate.textSize = 8

  widget.backgroundColor = Color.black()
  widget.centerAlignContent()
  
  Script.setWidget(widget)
  Script.complete()
}

function renderCountryStats(widget, res1, res2) {
  
  let titleTxt = widget.addText(res2.country)
  titleTxt.textColor = new Color('#039BE5')
  titleTxt.textSize = 22
  
  let todayTxt = widget.addText(`Today ${formatter.format(res1.new_infections)}`)
  todayTxt.textColor = Color.red()
  todayTxt.textOpacity = 0.8
  todayTxt.textSize = 18

  let totalTxt = widget.addText(`Total ${formatter.format(res2.totalConfirmed)}`)
  totalTxt.textColor = Color.white()
  totalTxt.textOpacity = 0.8
  totalTxt.textSize = 18

  let deathTxt = widget.addText(`☠️ ${formatter.format(res2.totalDeaths)}`)
  deathTxt.textColor = Color.white()
  deathTxt.textOpacity = 0.8
  deathTxt.textSize = 16

  let lastWidgetUpdate = widget.addText(`Data updated on ${new Date(res2.lastUpdated).toLocaleString()}`)
  lastWidgetUpdate.textColor = Color.lightGray()
  lastWidgetUpdate.textSize = 8
}
