const SAVE_KEY = 'stardust-workshop-save-v1';
const MAX_OFFLINE_SECONDS = 60 * 60 * 8;

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

const defaultState = () => ({ coins: 0, totalCoins: 0, clicks: 0, level: 1, clickPower: 1, autoPower: 0, multiplier: 1, critChance: 0.05, bestClick: 1, criticalHits: 0, totalUpgrades: 0, totalOffline: 0, upgrades: { gloves: 0, drone: 0, lens: 0, luck: 0 }, startedAt: Date.now(), lastSaved: Date.now(), sound: true });
let state = defaultState();
let sessionStarted = Date.now();
let lastTick = Date.now();
let audioContext;

const $ = id => document.getElementById(id);
const format = value => Math.floor(value).toLocaleString('zh-TW');
const getLevelGoal = level => Math.floor(25 * Math.pow(level, 1.65));
const getUpgradeCost = upgrade => Math.floor(upgrade.baseCost * Math.pow(upgrade.growth, state.upgrades[upgrade.id]));

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return;
    state = { ...defaultState(), ...saved, upgrades: { ...defaultState().upgrades, ...(saved.upgrades || {}) } };
    const elapsed = Math.min(MAX_OFFLINE_SECONDS, Math.max(0, (Date.now() - state.lastSaved) / 1000));
    const offlineGain = Math.floor(elapsed * state.autoPower * state.multiplier);
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
  $('sessionTime').textContent = `${Math.max(1, Math.floor((Date.now() - sessionStarted) / 60000))}m`;
  renderUpgrades();
  renderMissions();
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

function renderMissions() {
  const completed = missionDefinitions.filter(mission => mission.get(state) >= mission.goal).length;
  $('achievementCount').textContent = `${completed} / ${missionDefinitions.length}`;
  $('missionList').innerHTML = missionDefinitions.map(mission => {
    const current = Math.min(mission.goal, mission.get(state));
    const done = current >= mission.goal;
    return `<article class="mission"><div class="mission-top"><span class="mission-name">${mission.name}</span><span class="mission-status">${done ? '✓' : '○'}</span></div><p>${mission.description} · ${format(current)} / ${format(mission.goal)}</p><div class="mission-bar"><span style="width:${(current / mission.goal) * 100}%"></span></div></article>`;
  }).join('');
}

function collect() {
  const isCritical = Math.random() < state.critChance;
  const amount = Math.max(1, Math.floor(state.clickPower * state.multiplier * (isCritical ? 3 : 1)));
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
  const gain = state.autoPower * state.multiplier * seconds;
  if (gain > 0) { state.coins += gain; state.totalCoins += gain; render(); }
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

loadGame();
render();
setInterval(tick, 1000);
setInterval(saveGame, 10000);
window.addEventListener('beforeunload', saveGame);
