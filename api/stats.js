export default async function handler(req, res) {
  // разрешаем запросы с любого домена
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { steamid } = req.query;
  if (!steamid) return res.status(400).json({ error: 'steamid required' });

  const API_KEY = process.env.STEAM_API_KEY;

  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?appid=730&key=${API_KEY}&steamid=${steamid}`
    );
    const data = await response.json();
    const stats = data?.playerstats?.stats;

    if (!stats) return res.status(200).json({ error: 'private or no stats' });

    const get = name => stats.find(s => s.name === name)?.value || 0;

    const kills   = get('total_kills');
    const deaths  = get('total_deaths');
    const hs      = get('total_kills_headshot');
    const matches = get('total_matches_played');
    const kd      = deaths > 0 ? (kills / deaths).toFixed(2) : '0.00';
    const hsPct   = kills > 0 ? Math.round((hs / kills) * 100) : 0;

    res.status(200).json({ kills, deaths, hs, matches, kd, hsPct });
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch' });
  }
}
