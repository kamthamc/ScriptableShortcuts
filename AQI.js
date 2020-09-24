// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
const API_URL = "https://www.purpleair.com/json?show=";
// const CACHE_FILE = "aqi_data.json"
// Find a nearby PurpleAir sensor ID via https://fire.airnow.gov/
// Click a sensor near your location: the ID is the trailing integers
// https://www.purpleair.com/json has all sensors by location & ID.
let SENSOR_ID = args.widgetParameter || "4896";

async function getSensorData(url, id) {
  let req = new Request(`${url}${id}`);
  let json = await req.loadJSON();

  return {
    val: json.results[0].PM2_5Value,
    ts: json.results[0].LastSeen,
    loc: json.results[0].Label,
  };
}

// Widget attributes: AQI level threshold, text label, gradient start and end colors
const levelAttributes = [
  {
    threshold: 300,
    label: "Hazardous",
    startColor: "421434",
    endColor: "581845",
  },
  {
    threshold: 200,
    label: "Very Unhealthy",
    startColor: "A20F9D",
    endColor: "6D0F5E",
  },
  {
    threshold: 150,
    label: "Unhealthy",
    startColor: "FF3D3D",
    endColor: "D00D0D",
  },
  {
    threshold: 100,
    label: "Unhealthy (S.G.)",
    startColor: "F78C06",
    endColor: "B96904",
  },
  {
    threshold: 50,
    label: "Moderate",
    startColor: "F0D40F",
    endColor: "B09B0B",
  },
  {
    threshold: 0,
    label: "Good",
    startColor: "116D31",
    endColor: "0C4E23",
  },
];

// Get level attributes for AQI
const getLevelAttributes = (level, attributes) =>
  attributes
    .filter((c) => level > c.threshold)
    .sort((a, b) => b.threshold - a.threshold)[0];

// Calculates the AQI level based on
// https://cfpub.epa.gov/airnow/index.cfm?action=aqibasics.aqi#unh
function calculateLevel(aqi) {
  let res = {
    level: "OK",
    label: "fine",
    startColor: "white",
    endColor: "white",
  };

  let level = parseInt(aqi, 10) || 0;

  // Set attributes
  res = getLevelAttributes(level, levelAttributes);
  // Set level
  res.level = level;
  return res;
}

//Function to get AQI number from PPM reading
function aqiFromPM(pm) {
  if (pm > 350.5) {
    return calcAQI(pm, 500.0, 401.0, 500.0, 350.5);
  } else if (pm > 250.5) {
    return calcAQI(pm, 400.0, 301.0, 350.4, 250.5);
  } else if (pm > 150.5) {
    return calcAQI(pm, 300.0, 201.0, 250.4, 150.5);
  } else if (pm > 55.5) {
    return calcAQI(pm, 200.0, 151.0, 150.4, 55.5);
  } else if (pm > 35.5) {
    return calcAQI(pm, 150.0, 101.0, 55.4, 35.5);
  } else if (pm > 12.1) {
    return calcAQI(pm, 100.0, 51.0, 35.4, 12.1);
  } else if (pm >= 0.0) {
    return calcAQI(pm, 50.0, 0.0, 12.0, 0.0);
  } else {
    return "-";
  }
}

//Function that actually calculates the AQI number
function calcAQI(Cp, Ih, Il, BPh, BPl) {
  let a = Ih - Il;
  let b = BPh - BPl;
  let c = Cp - BPl;
  return Math.round((a / b) * c + Il);
}

async function run() {
  let wg = new ListWidget();

  try {
    console.log(`Using sensor ID: ${SENSOR_ID}`);
    let data = await getSensorData(API_URL, SENSOR_ID);
    console.log(data);

    let header = wg.addText("Air Quality");
    header.textSize = 15;
    header.textColor = Color.black();

    let aqi = aqiFromPM(data.val);
    let level = calculateLevel(aqi);
    let aqitext = aqi.toString();
    console.log(aqi);
    console.log(level.level);
    let startColor = new Color(level.startColor);
    let endColor = new Color(level.endColor);
    let gradient = new LinearGradient();
    gradient.colors = [startColor, endColor];
    gradient.locations = [0.0, 1];
    console.log(gradient);

    wg.backgroundGradient = gradient;

    let content = wg.addText(aqitext);
    content.textSize = 50;
    content.textColor = Color.black();

    let wordLevel = wg.addText(level.label);
    wordLevel.textSize = 15;
    wordLevel.textColor = Color.black();

    let id = wg.addText(data.loc);
    id.textSize = 10;
    id.textColor = Color.black();

    let updatedAt = new Date(data.ts * 1000).toLocaleTimeString("en-US", {
      timeZone: "PST",
    });
    let ts = wg.addText(`Updated ${updatedAt}`);
    ts.textSize = 10;
    ts.textColor = Color.black();
  } catch (e) {
    console.log(e);
    let err = wg.addText(`error: ${e}`);
    err.textSize = 10;
    err.textColor = Color.red();
    err.textOpacity = 30;
  }

  Script.setWidget(wg);
  Script.complete();
}
await run();
