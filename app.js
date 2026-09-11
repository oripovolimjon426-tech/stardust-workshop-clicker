const SAVE_KEY = 'stardust-workshop-save-v1';
const MAX_OFFLINE_SECONDS = 60 * 60 * 8;
const SUPABASE_URL = 'https://uwoizfkhuwoynhdnpnty.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qDMnTsw3EeXETYCKiWyFpg_PMokhXtd';

const upgradeDefinitions = [
  { id: 'gloves', icon: '✧', name: '量子手套', description: '每次點擊 +1 星塵', baseCost: 25, growth: 1.55, effect: 'clickPower' },
  { id: 'drone', icon: '◇', name: '採集無人機', description: '每秒自動採集 +1', baseCost: 100, growth: 1.62, effect: 'autoPower' },
  { id: 'lens', icon: '◈', name: '聚焦透鏡', description: '所有產出 +15%', baseCost: 250, growth: 1.78, effect: 'multiplier' },
  { id: 'luck', icon: '♢', name: '幸運核心', description: '暴擊機率 +5%', baseCost: 500, growth: 1.9, effect: 'critChance' }
];
const missionDefinitions = [
  { id: 'clicks', name: '初次啟動', description: '完成 25 次點擊', goal: 25, get: state => state.clicks },
  { id: 'coins', name: '星塵囤積者', description: '累計收集 1,000 星塵', goal: 1000, get: state => state.totalCoins },
  { id: 'upgrades', name: '升級狂熱', description: '購買 5 次升級', goal: 5, get: state => state.totalUpgrades },
  { id: 'critical', name: '幸運閃耀', description: '觸發 10 次暴擊', goal: 10, get: state => state.criticalHits },
  { id: 'offline', name: '時間的禮物', description: '獲得 100 點離線收益', goal: 100, get: state => state.totalOffline }
];
const achievementDefinitions = [
  { id: 'clicks25', icon: '✦', name: '初次啟動', description: '完成 25 次點擊', goal: 25, get: state => state.clicks },
  { id: 'clicks1000', icon: '⚡', name: '手速成星', description: '完成 1,000 次點擊', goal: 1000, get: state => state.clicks },
  { id: 'coins1000', icon: '◈', name: '星塵囤積者', description: '累計收集 1,000 星塵', goal: 1000, get: state => state.totalCoins },
  { id: 'coins10000', icon: '◆', name: '星海富翁', description: '累計收集 10,000 星塵', goal: 10000, get: state => state.totalCoins },
  { id: 'upgrades5', icon: '⌘', name: '升級狂熱', description: '購買 5 次升級', goal: 5, get: state => state.totalUpgrades },
  { id: 'upgrades20', icon: '⬡', name: '工坊大師', description: '購買 20 次升級', goal: 20, get: state => state.totalUpgrades },
  { id: 'critical10', icon: '✹', name: '幸運閃耀', description: '觸發 10 次暴擊', goal: 10, get: state => state.criticalHits },
  { id: 'critical100', icon: '☄', name: '超新星手氣', description: '觸發 100 次暴擊', goal: 100, get: state => state.criticalHits },
  { id: 'offline100', icon: '☼', name: '時間的禮物', description: '獲得 100 點離線收益', goal: 100, get: state => state.totalOffline },
  { id: 'offline1000', icon: '◌', name: '離線帝國', description: '獲得 1,000 點離線收益', goal: 1000, get: state => state.totalOffline },
  { id: 'combo10', icon: '∞', name: '節奏捕手', description: '達成 x1.50 連擊倍率', goal: 10, get: state => bestCombo },
  { id: 'level5', icon: '⬆', name: '航向深空', description: '達到等級 5', goal: 5, get: state => state.level },
  { id: 'level10', icon: '✧', name: '銀河先驅', description: '達到等級 10', goal: 10, get: state => state.level },
  { id: 'supply7', icon: '▣', name: '每日報到', description: '領取 7 次每日補給', goal: 7, get: state => state.suppliesClaimed },
  { id: 'prestige1', icon: '☷', name: '重啟星核', description: '完成 1 次星核重置', goal: 1, get: state => state.prestigeCount },
  { id: 'best100', icon: '★', name: '一擊入魂', description: '單次點擊獲得 100 星塵', goal: 100, get: state => state.bestClick }
];
const generatedAchievementGroups = [
  { prefix: 'clicks', icon: '⚡', name: '點擊', description: '完成', values: [50, 100, 250, 500, 2500, 5000, 10000, 25000, 50000, 100000], unit: '次點擊', get: state => state.clicks },
  { prefix: 'coins', icon: '◈', name: '星塵', description: '累計收集', values: [2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 5000000], unit: '星塵', get: state => state.totalCoins },
  { prefix: 'critical', icon: '✹', name: '暴擊', description: '觸發', values: [25, 50, 100, 250, 500, 1000, 2500, 5000], unit: '次暴擊', get: state => state.criticalHits },
  { prefix: 'upgrades', icon: '⬡', name: '升級', description: '購買', values: [10, 15, 25, 30, 40, 60, 80, 100], unit: '次升級', get: state => state.totalUpgrades },
  { prefix: 'levels', icon: '⬆', name: '等級', description: '達到等級', values: [4, 6, 8, 12, 15, 20, 30, 50], unit: '', get: state => state.level },
  { prefix: 'offline', icon: '☼', name: '離線', description: '獲得', values: [250, 500, 1000, 2500, 5000, 10000], unit: '點離線收益', get: state => state.totalOffline },
  { prefix: 'supplies', icon: '▣', name: '補給', description: '領取', values: [2, 3, 5, 10, 20], unit: '次每日補給', get: state => state.suppliesClaimed },
  { prefix: 'prestige', icon: '☷', name: '星核', description: '完成', values: [2, 3, 5, 10], unit: '次星核重置', get: state => state.prestigeCount }
];
generatedAchievementGroups.forEach(group => group.values.forEach((goal, index) => achievementDefinitions.push({
  id: `${group.prefix}${goal}`,
  icon: group.icon,
  name: `${group.name}計畫 ${index + 1}`,
  description: `${group.description} ${goal.toLocaleString('zh-TW')} ${group.unit}`,
  goal,
  get: group.get
})));

const createPlayerId = () => crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const defaultState = () => ({ playerId: createPlayerId(), coins: 0, totalCoins: 0, clicks: 0, level: 1, clickPower: 1, autoPower: 0, multiplier: 1, permanentMultiplier: 1, critChance: 0.05, bestClick: 1, criticalHits: 0, totalUpgrades: 0, totalOffline: 0, prestigeCount: 0, suppliesClaimed: 0, lastSupply: '', playerName: '星塵探勘員', upgrades: { gloves: 0, drone: 0, lens: 0, luck: 0 }, startedAt: Date.now(), lastSaved: Date.now(), sound: true });
let state = defaultState();
let sessionStarted = Date.now();
let lastTick = Date.now();
let audioContext;
let combo = 0;
let bestCombo = 0;
let lastClickAt = 0;
let musicTimer;
let musicPlaying = false;
let supabaseClient;
let leaderboardRefreshTimer;

const $ = id => document.getElementById(id);
const format = value => Math.floor(value).toLocaleString('zh-TW');
const getLevelGoal = level => Math.floor(25 * Math.pow(level, 1.65));
const getUpgradeCost = upgrade => Math.floor(upgrade.baseCost * Math.pow(upgrade.growth, state.upgrades[upgrade.id]));

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return;
    state = { ...defaultState(), ...saved, playerId: saved.playerId || createPlayerId(), upgrades: { ...defaultState().upgrades, ...(saved.upgrades || {}) } };
    const elapsed = Math.min(MAX_OFFLINE_SECONDS, Math.max(0, (Date.now() - state.lastSaved) / 1000));
    const offlineGain = Math.floor(elapsed * state.autoPower * state.multiplier * state.permanentMultiplier);
    if (offlineGain > 0) {
      state.coins += offlineGain;
      state.totalCoins += offlineGain;
      state.totalOffline += offlineGain;
      $('offlineModalValue').textContent = format(offlineGain);
      $('offlineModal').classList.remove('hidden');
    }
  } catch (error) {
    console.warn('無法讀取存檔，將建立新遊戲。', error);
    state = defaultState();
  }
}

function saveGame() {
  state.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  $('saveStatus').textContent = '已自動保存';
  $('lastSaved').textContent = '剛剛';
}

function calculateLevel() {
  let newLevel = 1;
  let total = state.totalCoins;
  while (total >= getLevelGoal(newLevel) && newLevel < 999) { total -= getLevelGoal(newLevel); newLevel += 1; }
  state.level = newLevel;
}

function render() {
  calculateLevel();
  const goal = getLevelGoal(state.level);
  const levelCoins = state.totalCoins - Array.from({ length: state.level - 1 }, (_, index) => getLevelGoal(index + 1)).reduce((sum, value) => sum + value, 0);
  const progress = Math.min(100, Math.max(0, (levelCoins / goal) * 100));
  $('coinsValue').textContent = format(state.coins);
  $('levelValue').textContent = state.level;
  $('clicksValue').textContent = format(state.clicks);
  $('perSecondValue').textContent = format(state.autoPower * state.multiplier);
  $('clickPowerValue').textContent = format(state.clickPower * state.multiplier);
  $('critValue').textContent = `${Math.round(state.critChance * 100)}%`;
  $('multiplierValue').textContent = `x${state.multiplier.toFixed(2)} 產出`;
  $('levelProgress').style.width = `${progress}%`;
  $('progressText').textContent = `距離下一級 ${format(Math.max(0, goal - levelCoins))}`;
  $('bestClick').textContent = `${format(state.bestClick)} ✦`;
  $('totalCoinsValue').textContent = `${format(state.totalCoins)} ✦`;
  $('offlineValue').textContent = `${format(state.totalOffline)} ✦`;
  $('prestigeCountValue').textContent = `${format(state.prestigeCount)} 次`;
  $('playerName').value = state.playerName;
  $('sessionTime').textContent = `${Math.max(1, Math.floor((Date.now() - sessionStarted) / 60000))}m`;
  $('comboValue').textContent = `x${(1 + Math.min(combo, 20) * .05).toFixed(2)}`;
  $('comboBest').textContent = `最高 x${(1 + Math.min(bestCombo, 20) * .05).toFixed(2)}`;
  $('prestigeValue').textContent = `永久加成 x${state.permanentMultiplier.toFixed(2)}`;
  renderDailySupply();
  renderUpgrades();
  renderAchievements();
  renderLeaderboard();
}

function renderUpgrades() {
  const purchased = upgradeDefinitions.reduce((sum, item) => sum + state.upgrades[item.id], 0);
  $('upgradeCount').textContent = `${purchased} / 40`;
  $('upgradeList').innerHTML = upgradeDefinitions.map(upgrade => {
    const level = state.upgrades[upgrade.id];
    const cost = getUpgradeCost(upgrade);
    const canBuy = state.coins >= cost;
    return `<article class="upgrade-card ${level >= 10 ? 'maxed' : ''}"><div class="upgrade-icon">${upgrade.icon}</div><div><h3>${upgrade.name}</h3><p>${upgrade.description}</p><span class="upgrade-level">LV.${level}</span></div><button class="buy-button" data-upgrade="${upgrade.id}" ${canBuy ? '' : 'disabled'}>${level >= 10 ? 'MAX' : '升級'}<span class="cost">${level >= 10 ? '' : `${format(cost)} ✦`}</span></button></article>`;
  }).join('');
}

function renderAchievements() {
  const completed = achievementDefinitions.filter(achievement => achievement.get(state) >= achievement.goal).length;
  $('achievementCount').textContent = `${completed} / ${achievementDefinitions.length}`;
  $('achievementGrid').innerHTML = achievementDefinitions.map(achievement => {
    const current = Math.min(achievement.goal, achievement.get(state));
    const done = current >= achievement.goal;
    return `<article class="achievement-card ${done ? 'completed' : ''}"><div class="achievement-icon">${done ? '✓' : achievement.icon}</div><div class="achievement-copy"><h3>${achievement.name}</h3><p>${achievement.description}</p><div class="achievement-bar"><span style="width:${(current / achievement.goal) * 100}%"></span></div><small>${format(current)} / ${format(achievement.goal)}</small></div></article>`;
  }).join('');
}

function renderLeaderboard() {
  const scores = JSON.parse(localStorage.getItem('stardust-leaderboard-v1') || '[]');
  renderLeaderboardRows(scores, '本機排行榜');
  refreshRemoteLeaderboard();
}

function refreshRemoteLeaderboard() {
  fetch(`${SUPABASE_URL}/rest/v1/leaderboard?select=player_name,score,level&order=score.desc,created_at.asc&limit=10`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('leaderboard unavailable')))
    .then(remoteScores => renderLeaderboardRows(remoteScores.map(entry => ({ name: entry.player_name, score: entry.score, level: entry.level })), '全球排行榜'))
    .catch(() => {});
}

function initRealtimeLeaderboard() {
  if (!window.supabase?.createClient) return;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  supabaseClient.channel('global-leaderboard-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => refreshRemoteLeaderboard())
    .subscribe();
  leaderboardRefreshTimer = setInterval(refreshRemoteLeaderboard, 5000);
}

function renderLeaderboardRows(scores, label) {
  const title = $('leaderboardView')?.querySelector('.eyebrow');
  if (title) title.textContent = label === '全球排行榜' ? 'GLOBAL HALL OF FAME' : 'LOCAL HALL OF FAME';
  $('leaderboardList').innerHTML = scores.length ? scores.sort((a, b) => b.score - a.score).slice(0, 10).map((entry, index) => `<div class="leaderboard-row ${entry.name === state.playerName ? 'current-player' : ''}"><strong>${['🥇', '🥈', '🥉'][index] || `#${index + 1}`}</strong><span>${entry.name}</span><b>${format(entry.score)} ✦</b><small>LV.${entry.level}</small></div>`).join('') : '<div class="empty-leaderboard">還沒有紀錄，成為第一名吧。</div>';
}

async function recordLeaderboardScore() {
  const scores = JSON.parse(localStorage.getItem('stardust-leaderboard-v1') || '[]').filter(entry => entry.name !== state.playerName);
  scores.push({ name: state.playerName, score: Math.floor(state.totalCoins), level: state.level, date: Date.now() });
  localStorage.setItem('stardust-leaderboard-v1', JSON.stringify(scores.sort((a, b) => b.score - a.score).slice(0, 10)));
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?on_conflict=player_id`, { method: 'POST', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ player_id: state.playerId, player_name: state.playerName, score: Math.floor(state.totalCoins), level: state.level }) });
    if (!response.ok) throw new Error('submit failed');
    showToast('全球排行榜紀錄已更新');
  } catch (error) {
    showToast('目前離線，已保存本機紀錄。', true);
  }
  renderLeaderboard();
}

function collect() {
  const now = Date.now();
  combo = now - lastClickAt < 1200 ? combo + 1 : 1;
  lastClickAt = now;
  bestCombo = Math.max(bestCombo, combo);
  const isCritical = Math.random() < state.critChance;
  const comboMultiplier = 1 + Math.min(combo, 20) * .05;
  const amount = Math.max(1, Math.floor(state.clickPower * state.multiplier * state.permanentMultiplier * comboMultiplier * (isCritical ? 3 : 1)));
  state.coins += amount;
  state.totalCoins += amount;
  state.clicks += 1;
  state.bestClick = Math.max(state.bestClick, amount);
  if (isCritical) state.criticalHits += 1;
  spawnParticle(amount, isCritical);
  playTone(isCritical ? 520 : 280, isCritical ? 0.13 : 0.07);
  render();
}

function spawnParticle(amount, isCritical) {
  const particle = document.createElement('span');
  particle.className = 'particle';
  particle.textContent = `${isCritical ? '暴擊 ' : '+'}${format(amount)} ✦`;
  particle.style.left = `${50 + (Math.random() * 20 - 10)}%`;
  particle.style.top = `${48 + (Math.random() * 14 - 7)}%`;
  $('clickParticles').appendChild(particle);
  setTimeout(() => particle.remove(), 800);
}

function buyUpgrade(id) {
  const upgrade = upgradeDefinitions.find(item => item.id === id);
  if (!upgrade || state.upgrades[id] >= 10) return;
  const cost = getUpgradeCost(upgrade);
  if (state.coins < cost) { showToast('星塵不足，繼續採集吧。', true); return; }
  state.coins -= cost;
  state.upgrades[id] += 1;
  state.totalUpgrades += 1;
  if (upgrade.effect === 'clickPower') state.clickPower += 1;
  if (upgrade.effect === 'autoPower') state.autoPower += 1;
  if (upgrade.effect === 'multiplier') state.multiplier += 0.15;
  if (upgrade.effect === 'critChance') state.critChance = Math.min(.5, state.critChance + .05);
  showToast(`${upgrade.name} 已升級至 LV.${state.upgrades[id]}`);
  playTone(620, .12);
  render();
  saveGame();
}

function tick() {
  const now = Date.now();
  const seconds = Math.min(5, (now - lastTick) / 1000);
  lastTick = now;
  const gain = state.autoPower * state.multiplier * state.permanentMultiplier * seconds;
  if (gain > 0) { state.coins += gain; state.totalCoins += gain; render(); }
}

function renderDailySupply() {
  const today = new Date().toISOString().slice(0, 10);
  const claimed = state.lastSupply === today;
  $('dailySupplyText').textContent = claimed ? '今日補給已領取，明天再來' : '今天可領取 100 ✦';
  $('dailySupplyButton').textContent = claimed ? '已領取' : '領取';
  $('dailySupplyButton').disabled = claimed;
}

function claimDailySupply() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastSupply === today) return;
  state.lastSupply = today;
  state.suppliesClaimed += 1;
  state.coins += 100;
  state.totalCoins += 100;
  showToast('每日補給已送達：+100 星塵');
  playTone(720, .16);
  render();
  saveGame();
}

function prestige() {
  const cost = 5000;
  if (state.coins < cost) { showToast('需要 5,000 星塵才能啟動星核。', true); return; }
  if (!confirm('星核重置會清除本輪升級與星塵，永久產出提升 20%。確定嗎？')) return;
  state.coins = 0;
  state.clickPower = 1;
  state.autoPower = 0;
  state.multiplier = 1;
  state.critChance = 0.05;
  state.upgrades = { gloves: 0, drone: 0, lens: 0, luck: 0 };
  state.prestigeCount += 1;
  state.permanentMultiplier = 1 + state.prestigeCount * .2;
  combo = 0;
  showToast(`星核已啟動，永久加成 x${state.permanentMultiplier.toFixed(2)}`);
  render();
  saveGame();
}

function playMusicNote() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [220, 261.63, 329.63, 392, 329.63, 293.66, 261.63, 196];
  const frequency = notes[(Date.now() / 500 | 0) % notes.length];
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.018, audioContext.currentTime + .05);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .48);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + .5);
}

function toggleMusic() {
  if (musicPlaying) {
    clearInterval(musicTimer);
    musicTimer = undefined;
    musicPlaying = false;
    $('musicToggle').textContent = '播放';
    showToast('星際電台已暫停');
    return;
  }
  musicPlaying = true;
  playMusicNote();
  musicTimer = setInterval(playMusicNote, 500);
  $('musicToggle').textContent = '停止';
  showToast('星際電台播放中');
}

function toggleMenu(open) {
  $('sideMenu').classList.toggle('open', open);
  $('menuOverlay').classList.toggle('open', open);
  $('sideMenu').setAttribute('aria-hidden', String(!open));
  $('menuToggle').setAttribute('aria-expanded', String(open));
}

function showToast(message, warning = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${warning ? 'warning' : ''}`;
  toast.textContent = message;
  $('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function playTone(frequency, duration) {
  if (!state.sound) return;
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gain.gain.setValueAtTime(.035, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

$('clickButton').addEventListener('click', collect);
$('upgradeList').addEventListener('click', event => { const button = event.target.closest('[data-upgrade]'); if (button) buyUpgrade(button.dataset.upgrade); });
$('closeModal').addEventListener('click', () => $('offlineModal').classList.add('hidden'));
$('soundToggle').addEventListener('click', () => { state.sound = !state.sound; $('soundToggle').textContent = state.sound ? '♫' : '⌁'; showToast(state.sound ? '音效已開啟' : '音效已關閉'); saveGame(); });
$('resetButton').addEventListener('click', () => { if (!confirm('確定要清除所有玩家資料嗎？此操作無法復原。')) return; localStorage.removeItem(SAVE_KEY); state = defaultState(); sessionStarted = Date.now(); render(); showToast('已建立新的工坊。'); });
$('menuToggle').addEventListener('click', () => toggleMenu(true));
$('menuClose').addEventListener('click', () => toggleMenu(false));
$('menuOverlay').addEventListener('click', () => toggleMenu(false));
$('dailySupplyButton').addEventListener('click', claimDailySupply);
$('musicToggle').addEventListener('click', toggleMusic);
$('prestigeButton').addEventListener('click', prestige);
function switchView(view) {
  document.querySelector('.hero-grid').classList.toggle('view-hidden', view !== 'workshop');
  document.querySelector('.game-layout').classList.toggle('view-hidden', view !== 'workshop');
  document.querySelectorAll('.app-view').forEach(element => element.classList.toggle('hidden-view', element.id !== `${view}View`));
  document.querySelectorAll('.menu-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
}

document.querySelectorAll('.menu-item').forEach(item => item.addEventListener('click', () => { switchView(item.dataset.view); toggleMenu(false); }));
$('saveNameButton').addEventListener('click', () => { state.playerName = $('playerName').value.trim() || '星塵探勘員'; $('playerName').value = state.playerName; saveGame(); renderLeaderboard(); showToast('玩家名稱已保存'); });
$('recordScoreButton').addEventListener('click', recordLeaderboardScore);
switchView('workshop');
initRealtimeLeaderboard();

loadGame();
render();
setInterval(tick, 1000);
setInterval(saveGame, 10000);
window.addEventListener('beforeunload', saveGame);
