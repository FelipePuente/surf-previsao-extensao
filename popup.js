const SPOTS = {
  arpoador: { name: "Arpoador", lat: -22.9892, lon: -43.1904 },
  praia_diabo: { name: "Praia do Diabo", lat: -22.9898, lon: -43.1925 },
  copacabana_p5: { name: "Copacabana (P5)", lat: -22.9785, lon: -43.1872 },
  copacabana_p6: { name: "Copacabana (P6)", lat: -22.9839, lon: -43.1912 },
  leme: { name: "Leme", lat: -22.9634, lon: -43.1664 },
  grumari: { name: "Grumari", lat: -23.0481, lon: -43.5244 },
  prainha: { name: "Prainha", lat: -23.0411, lon: -43.5056 },
  recreio: { name: "Recreio", lat: -23.0289, lon: -43.4664 },
  barra: { name: "Barra da Tijuca", lat: -23.0131, lon: -43.3056 }
};

document.addEventListener('DOMContentLoaded', () => {
  const spotSelect = document.getElementById('spot-select');
  const refreshBtn = document.getElementById('refresh-btn');

  chrome.storage?.sync?.get(['selectedSpot'], (result) => {
    if (result.selectedSpot && SPOTS[result.selectedSpot]) {
      spotSelect.value = result.selectedSpot;
    }
    loadForecast(spotSelect.value);
  });

  spotSelect.addEventListener('change', (e) => {
    const spotKey = e.target.value;
    chrome.storage?.sync?.set({ selectedSpot: spotKey });
    loadForecast(spotKey);
  });

  refreshBtn.addEventListener('click', () => {
    loadForecast(spotSelect.value);
  });
});

async function loadForecast(spotKey) {
  const spot = SPOTS[spotKey] || SPOTS.arpoador;
  showLoading(true);

  try {
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lon}&current=wave_height,wave_period,wave_direction&hourly=wave_height&daily=wave_height_max,wave_period_max,wave_direction_dominant&timezone=America%2FSao_Paulo`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&current=wind_speed_10m,wind_direction_10m&timezone=America%2FSao_Paulo`;

    const [marineRes, weatherRes] = await Promise.all([
      fetch(marineUrl).then(res => res.json()),
      fetch(weatherUrl).then(res => res.json())
    ]);

    renderCurrentConditions(spot, marineRes.current, weatherRes.current);
    renderTideGraph(marineRes.hourly);
    renderForecast(marineRes.daily);

    showLoading(false);
  } catch (err) {
    console.error("Erro ao carregar previsão:", err);
    showLoading(false);
  }
}

function showLoading(isLoading) {
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');
  if (isLoading) {
    loading.classList.remove('hidden');
    content.classList.add('hidden');
  } else {
    loading.classList.add('hidden');
    content.classList.remove('hidden');
  }
}

function renderCurrentConditions(spot, marineCurrent, weatherCurrent) {
  document.getElementById('spot-name').innerText = spot.name;

  const waveHeight = marineCurrent?.wave_height != null ? marineCurrent.wave_height.toFixed(1) : '--';
  document.getElementById('wave-height').innerText = waveHeight;

  const period = marineCurrent?.wave_period != null ? Math.round(marineCurrent.wave_period) : '--';
  document.getElementById('wave-period').innerText = `${period} s`;

  document.getElementById('wave-dir').innerText = degToCompass(marineCurrent?.wave_direction);

  const windSpeed = weatherCurrent?.wind_speed_10m != null ? Math.round(weatherCurrent.wind_speed_10m) : '--';
  document.getElementById('wind-speed').innerText = `${windSpeed} km/h`;
  document.getElementById('wind-dir').innerText = degToCompass(weatherCurrent?.wind_direction_10m);

  const badge = document.getElementById('condition-badge');
  if (parseFloat(waveHeight) >= 1.2 && period >= 9) {
    badge.innerText = "EXCELENTE 🔥";
    badge.style.background = "#22c55e";
    badge.style.color = "#052e16";
  } else if (parseFloat(waveHeight) >= 0.7) {
    badge.innerText = "BOA 👍";
    badge.style.background = "#38bdf8";
    badge.style.color = "#0c4a6e";
  } else {
    badge.innerText = "PEQUENA 🌊";
    badge.style.background = "#e2e8f0";
    badge.style.color = "#334155";
  }
}

function renderTideGraph(hourly) {
  const svg = document.getElementById('tide-svg');
  if (!svg) return;

  const hours = 24;
  const now = new Date().getHours();
  
  const maxTide = 1.3;
  const minTide = 0.2;
  const avgTide = (maxTide + minTide) / 2;
  const amp = (maxTide - minTide) / 2;

  let pathD = "";
  for (let i = 0; i <= hours; i++) {
    const x = (i / hours) * 300;
    const yVal = avgTide + amp * Math.sin((i / 6) * Math.PI - 1.5);
    const y = 75 - ((yVal - 0.1) / 1.4) * 60;

    if (i === 0) {
      pathD = `M ${x} ${y} `;
    } else {
      const prevX = ((i - 1) / hours) * 300;
      const cpX = (prevX + x) / 2;
      pathD += `S ${cpX} ${y}, ${x} ${y} `;
    }
  }

  const fillD = pathD + `L 300 90 L 0 90 Z`;
  const currentX = (now / hours) * 300;
  const currentYVal = avgTide + amp * Math.sin((now / 6) * Math.PI - 1.5);
  const currentY = 75 - ((currentYVal - 0.1) / 1.4) * 60;

  svg.innerHTML = `
    <defs>
      <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.05"/>
      </linearGradient>
    </defs>
    <path d="${fillD}" fill="url(#tideGrad)"/>
    <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
    <line x1="${currentX}" y1="0" x2="${currentX}" y2="90" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
    <circle cx="${currentX}" cy="${currentY}" r="4" fill="#ef4444"/>
    <text x="${currentX < 240 ? currentX + 6 : currentX - 50}" y="20" fill="#ef4444" font-size="9" font-weight="bold">Agora (${now}h)</text>
  `;

  document.getElementById('tide-high').innerText = `${maxTide.toFixed(1)} m`;
  document.getElementById('tide-low').innerText = `${minTide.toFixed(1)} m`;
}

function renderForecast(daily) {
  const container = document.getElementById('forecast-list');
  container.innerHTML = '';
  if (!daily || !daily.time) return;

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  daily.time.forEach((timeStr, idx) => {
    const date = new Date(timeStr + 'T00:00:00');
    const dayName = idx === 0 ? 'Hoje' : days[date.getDay()];
    const height = daily.wave_height_max[idx] != null ? daily.wave_height_max[idx].toFixed(1) + 'm' : '--';
    const period = daily.wave_period_max[idx] != null ? Math.round(daily.wave_period_max[idx]) + 's' : '--';
    const dir = degToCompass(daily.wave_direction_dominant[idx]);

    const item = document.createElement('div');
    item.className = 'forecast-item';
    item.innerHTML = `
      <span class="forecast-day">${dayName} (${date.getDate()}/${date.getMonth()+1})</span>
      <span class="forecast-wave">${height}</span>
      <span class="forecast-meta">${period} | ${dir}</span>
    `;
    container.appendChild(item);
  });
}

function degToCompass(num) {
  if (num == null) return '--';
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
}