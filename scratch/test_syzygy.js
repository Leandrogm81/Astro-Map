
import * as Astronomy from 'astronomy-engine';

function dateToJD(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  
  let y = year;
  let m = month;
  
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  
  return jd + hour / 24;
}

async function calculatePrenatalSyzygy(date) {
  console.log('Calculating Syzygy for:', date.toISOString());
  try {
    const lastNewMoon = Astronomy.SearchMoonPhase(0, date, -40);
    console.log('Last New Moon:', lastNewMoon ? lastNewMoon.date.toISOString() : 'null');
    
    const lastFullMoon = Astronomy.SearchMoonPhase(2, date, -40);
    console.log('Last Full Moon:', lastFullMoon ? lastFullMoon.date.toISOString() : 'null');
    
    if (!lastNewMoon || !lastFullMoon) return 0;
    
    const syzygyDate = (lastNewMoon.date.getTime() > lastFullMoon.date.getTime()) 
      ? lastNewMoon.date 
      : lastFullMoon.date;
      
    const vector = Astronomy.GeoVector(Astronomy.Body.Sun, syzygyDate, true);
    const ecliptic = Astronomy.Ecliptic(vector);
    
    return ecliptic.elon;
  } catch (e) {
    console.error('Error in Syzygy:', e);
    return 0;
  }
}

async function test() {
  const date = new Date(Date.UTC(1990, 0, 1, 15, 0)); // 1990-01-01 12:00 UTC-3
  const lon = await calculatePrenatalSyzygy(date);
  console.log('Syzygy Longitude:', lon);
}

test();
