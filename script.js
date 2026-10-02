// ============================================================================
// 1. CONFIGURATION & DATABASE CONNECTIVITY
// ============================================================================
const API_BASE = "https://bmrta-backend.onrender.com/api";
const userEmail = localStorage.getItem("user_email");

// Authenticated fetch wrapper
async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = { 
        "Content-Type": "application/json",
        "X-User-Email": userEmail || ""
    };

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    if (response.status === 401 && !window.location.pathname.endsWith("login.html")) {
        localStorage.removeItem("user_email");
        localStorage.removeItem("bmrta_token");
        window.location.href = "login.html";
        return null;
    }
    return response;
}

if (!userEmail && !window.location.pathname.endsWith("login.html")) {
    window.location.href = "login.html";
}

// ============================================================================
// 2. CORE STATE VARIABLES
// ============================================================================
let currentUser = null;
let co2Points = 0;
let currentLevel = 1;
let travelsInLevel = 0;
let travelPoints = 0;
let rewardHistory = [];
let fullInventory = { unscratched: [], active: [], scratched: [] };

let pendingSettings = {
    bio: "",
    titleClass: 'tag-commuter',
    titleHtml: '<i class="fa-solid fa-train-subway"></i> Daily Commuter',
    avatarHtml: 'AV',
    avatarBg: 'linear-gradient(135deg, #007bff, #06b6d4)',
    avatarAnimClass: '',
    bannerBg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    bannerAnimClass: ''
};

let currentUserAvatarHtml = 'AV';
let currentUserAvatarBg = 'linear-gradient(135deg, #007bff, #06b6d4)';
let currentUserAvatarAnimClass = '';
let currentUserBannerBg = 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
let currentUserBannerAnimClass = '';

let currentLeaderboardTab = 'friends';
let currentInvTab = 'unscratched';
let pendingReward = "";
let pendingCardIndex = -1;
let isMoonMode = false;
let passToActivate = null;

// ALL 25 GLORY TAGS
const gloryTagsConfig = [
    { id: 'tag-commuter', name: 'Daily Commuter', icon: 'fa-train-subway', unlock: 1, class: 'tag-commuter' },
    { id: 'tag-earlybird', name: 'Early Bird', icon: 'fa-sun', unlock: 1, class: 'tag-earlybird' },
    { id: 'tag-busboss', name: 'Bus Boss', icon: 'fa-bus', unlock: 1, class: 'tag-busboss' },
    { id: 'tag-metromaster', name: 'Metro Master', icon: 'fa-train', unlock: 1, class: 'tag-metromaster' },
    { id: 'tag-co2', name: 'CO₂ Controller', icon: 'fa-leaf', unlock: 1, class: 'tag-co2' },
    { id: 'tag-mistress', name: 'Metro Mistress', icon: 'fa-gem', unlock: 1, class: 'tag-mistress' },
    { id: 'tag-traveller', name: 'Traveller', icon: 'fa-suitcase', unlock: 1, class: 'tag-traveller' },
    { id: 'tag-carpool', name: 'Carpool Captain', icon: 'fa-users', unlock: 3, class: 'tag-carpool' },
    { id: 'tag-trendsetter', name: 'Transit Trendsetter', icon: 'fa-fire', unlock: 5, class: 'tag-trendsetter' },
    { id: 'tag-voyager', name: 'Loyal Voyager', icon: 'fa-compass', unlock: 8, class: 'tag-voyager' },
    { id: 'tag-century', name: 'Century Club', icon: 'fa-star', unlock: 10, class: 'tag-century' },
    { id: 'tag-titan', name: 'Transit Titan', icon: 'fa-monument', unlock: 12, class: 'tag-titan' },
    { id: 'tag-purplepioneer', name: 'Purple Line Pioneer', icon: 'fa-train-subway', unlock: 15, class: 'tag-purplepioneer' },
    { id: 'tag-electric', name: 'Electric Explorer', icon: 'fa-plug', unlock: 18, class: 'tag-electric' },
    { id: 'tag-nightowl', name: 'Night Owl', icon: 'fa-moon', unlock: 19, class: 'tag-nightowl' },
    { id: 'tag-greenguru', name: 'Green Line Guru', icon: 'fa-train-subway', unlock: 20, class: 'tag-greenguru' },
    { id: 'tag-krideking', name: 'K-Ride King', icon: 'fa-crown', unlock: 1, class: 'tag-krideking' },
    { id: 'tag-kridequeen', name: 'K-Ride Queen', icon: 'fa-crown', unlock: 1, class: 'tag-kridequeen' },
    { id: 'tag-wanderer', name: 'Weekend Wanderer', icon: 'fa-map-location-dot', unlock: 20, class: 'tag-wanderer' },
    { id: 'tag-carboncrusher', name: 'Carbon Crusher', icon: 'fa-shield-halved', unlock: 1, class: 'tag-carboncrusher' },
    { id: 'tag-zenith', name: 'Zenith Rider', icon: 'fa-star', unlock: 25, class: 'tag-zenith' },
    { id: 'tag-quantum', name: 'Quantum Commuter', icon: 'fa-atom', unlock: 30, class: 'tag-quantum' },
    { id: 'tag-vanguard', name: 'Green Vanguard', icon: 'fa-shield', unlock: 35, class: 'tag-vanguard' },
    { id: 'tag-velocity', name: 'Velocity Master', icon: 'fa-gauge-high', unlock: 40, class: 'tag-velocity' },
    { id: 'tag-deity', name: 'Transit Deity', icon: 'fa-bolt', unlock: 50, class: 'tag-deity' }
];

let fakeFriendsList = [
    { name: "Rahul Verma", username: "@rahul_v89", co2: 4100, since: "Jan 2026", bio: "BMTC all the way.", bannerBg: "linear-gradient(0deg, #ff4e50, #f9d423, #ff4e50)", bannerAnimClass: "banner-inferno", avatarBg: "#ea580c", avatarHtml: "<i class='fa-solid fa-bus avatar-bg-icon'></i><span class='avatar-text'>RV</span>", animClass: "anim-wobble" },
    { name: "Sneha Reddy", username: "@sneha_r", co2: 2850, since: "Feb 2026", bio: "Carpooler and weekend walker.", bannerBg: "linear-gradient(180deg, #0ea5e9 0%, #06b6d4 50%, #ffffff 50%, #ffffff 100%)", bannerAnimClass: "banner-aurora", avatarBg: "rgba(0,20,40,0.8)", avatarHtml: "<i class='fa-solid fa-microchip'></i>", animClass: "anim-hologram" },
    { name: "Kiran Kumar", username: "@kiran_k", co2: 5020, since: "Dec 2025", bio: "Public transport is my second home.", bannerBg: "radial-gradient(circle, #ffffff 1px, transparent 1px) #0b0c10", bannerAnimClass: "banner-starlight", avatarBg: "linear-gradient(135deg, #10b981, #064e3b)", avatarHtml: "<i class='fa-solid fa-lungs'></i>", animClass: "anim-breathing" },
    { name: "Aditi Sharma", username: "@aditi_s", co2: 3200, since: "Mar 2025", bio: "Metro enthusiast.", bannerBg: "repeating-linear-gradient(45deg, #2b2b2b, #2b2b2b 10px, #1a1a1a 10px, #1a1a1a 20px)", bannerAnimClass: "banner-glitch", avatarBg: "linear-gradient(135deg, #f59e0b, #d97706)", avatarHtml: "<i class='fa-solid fa-person-walking-luggage'></i>", animClass: "" }
];

let fakeRequestsList = [];

// ============================================================================
// 3. BACKEND HYDRATION FROM MONGODB ATLAS
// ============================================================================
async function syncProfileFromDatabase() {
    try {
        const res = await apiRequest("/user/me", "GET");
        if (!res || !res.ok) return;

        currentUser = await res.json();

        // 1. Core Profile Details Loaded Directly from MongoDB
        co2Points = currentUser.co2_points || 0;
        currentLevel = currentUser.reward_level || 1;
        travelsInLevel = currentUser.travels_in_level || 0;
        travelPoints = currentUser.travel_points || 0;
        fullInventory = currentUser.inventory || { unscratched: [], active: [], scratched: [] };
        isMoonMode = currentUser.moon_mode || false;

        // User Names & Handles
        const nameNode = document.getElementById("profile-user-name");
        if (nameNode) nameNode.innerText = currentUser.name || "Commuter";

        const handleNode = document.getElementById("profile-user-handle");
        if (handleNode) handleNode.innerText = currentUser.username || "@user";

        const ncmcName = document.getElementById("ncmc-user-name");
        if (ncmcName) ncmcName.innerText = (currentUser.name || "COMMUTER").toUpperCase();

        const bioNode = document.getElementById("main-user-bio");
        if (bioNode && currentUser.bio) bioNode.innerText = `"${currentUser.bio}"`;

        // Personal Information Grid (Real Data)
        const infoName = document.getElementById("info-name");
        if (infoName) infoName.innerText = currentUser.name || "--";

        const infoUser = document.getElementById("info-username");
        if (infoUser) infoUser.innerText = currentUser.username || "--";

        const infoEmail = document.getElementById("info-email");
        if (infoEmail) infoEmail.innerText = currentUser.email || "--";

        const infoLevel = document.getElementById("info-level");
        if (infoLevel) infoLevel.innerText = `Level ${currentLevel}`;

        // 2. Wallets & Balances (No Duplicate Values)
        const bal = parseFloat(currentUser.wallet_balance || 0).toFixed(2);
        const dispBal = document.getElementById("display-wallet-balance");
        if (dispBal) dispBal.innerText = "₹ " + bal;

        // Active pass check
        const hasActivePass = currentUser.inventory?.active?.some(p => p.isActivated);
        const passBadge = document.getElementById("wallet-active-pass-badge");
        if (passBadge) passBadge.style.display = hasActivePass ? "block" : "none";

        // 3. User Avatar
        if (currentUser.avatar) {
            currentUserAvatarHtml = currentUser.avatar.html || currentUser.name.slice(0, 2).toUpperCase();
            currentUserAvatarBg = currentUser.avatar.bg || "#007bff";
            currentUserAvatarAnimClass = currentUser.avatar.anim || '';

            const av = document.getElementById("main-avatar-inner");
            if (av) {
                av.innerHTML = currentUserAvatarHtml;
                av.style.background = currentUserAvatarBg;
                av.className = `avatar-inner ${currentUserAvatarAnimClass}`;
            }
            pendingSettings.avatarHtml = currentUserAvatarHtml;
            pendingSettings.avatarBg = currentUserAvatarBg;
            pendingSettings.avatarAnimClass = currentUserAvatarAnimClass;
        }

        // 4. User Banner
        if (currentUser.banner) {
            currentUserBannerBg = currentUser.banner.bg || "#1e3a8a";
            currentUserBannerAnimClass = currentUser.banner.anim || '';

            const mb = document.getElementById("main-profile-banner");
            if (mb) {
                mb.style.background = currentUserBannerBg;
                mb.className = `profile-banner ${currentUserBannerAnimClass || 'default-banner'}`;
            }
            pendingSettings.bannerBg = currentUserBannerBg;
            pendingSettings.bannerAnimClass = currentUserBannerAnimClass;
        }

        // 5. User Glory Title
        if (currentUser.glory_tag) {
            const tag = document.getElementById("main-user-tag");
            if (tag) {
                tag.className = `user-tag ${currentUser.glory_tag}`;
                tag.innerHTML = currentUser.glory_html || '<i class="fa-solid fa-train-subway"></i> Daily Commuter';
            }
            pendingSettings.titleClass = currentUser.glory_tag;
            pendingSettings.titleHtml = currentUser.glory_html;
        }

        // 6. User Theme
        if (currentUser.theme === "dark-theme") {
            document.body.classList.replace("light-theme", "dark-theme");
            const icon = document.querySelector("#theme-toggle i");
            if (icon) icon.classList.replace("fa-moon", "fa-sun");
        }

        syncMoonModeUI();
        updateUI();
        renderLeaderboard(currentLeaderboardTab);
    } catch (e) {
        console.error("Database sync error:", e);
    }
}

// ============================================================================
// 4. NAVIGATION, TABS & DRAWER
// ============================================================================
function switchTab(tabId, btnElement) {
    const wrapper = document.getElementById('profile-wrapper');
    if (wrapper) wrapper.setAttribute('data-tab', tabId);

    document.querySelectorAll('.dynamic-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.profile-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.mobile-menu-item').forEach(btn => btn.classList.remove('active'));

    const targetSection = document.getElementById('section-' + tabId);
    if (targetSection) targetSection.classList.add('active');

    const deskBtn = document.querySelector(`.profile-btn[onclick*="'${tabId}'"]`);
    if (deskBtn) deskBtn.classList.add('active');

    const mobBtn = document.querySelector(`.mobile-menu-item[onclick*="'${tabId}'"]`);
    if (mobBtn) mobBtn.classList.add('active');

    if (tabId === 'rewards') {
        renderTracker();
        renderInventory();
    }

    const menu = document.getElementById('mobile-nav-menu');
    if (menu) menu.classList.remove('active');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-nav-menu');
    if (menu) menu.classList.toggle('active');
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobile-nav-menu');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if (menu && toggleBtn && !menu.contains(e.target) && !toggleBtn.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// ============================================================================
// 5. WALLET TOP-UP WITH SERVER WRITE
// ============================================================================
async function addFunds(amountObj = null) {
    const input = document.getElementById('topup-amount');
    const amount = amountObj || parseFloat(input ? input.value : 0);
    if (!amount || amount <= 0) return alert("Please enter a valid amount.");

    try {
        const res = await apiRequest("/user/wallet/topup", "POST", { amount });
        if (res && res.ok) {
            const data = await res.json();
            const newBal = parseFloat(data.wallet_balance).toFixed(2);

            const dispBal = document.getElementById('display-wallet-balance');
            if (dispBal) dispBal.innerText = '₹ ' + newBal;

            if (input) input.value = '';

            const btn = document.querySelector('.topup-btn');
            if (btn && !amountObj) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
                setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Funds'; }, 2000);
            }
        }
    } catch (err) {
        console.error("Wallet update failed:", err);
    }
}

// ============================================================================
// 6. SETTINGS MODAL & PREFERENCE PERSISTENCE
// ============================================================================
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    modal.classList.add('active');
    
    const moon = document.getElementById('setting-moon-toggle');
    if (moon) moon.checked = isMoonMode;

    const bio = document.getElementById('setting-bio-input');
    const userBio = document.getElementById('main-user-bio');
    if (bio && userBio) bio.value = userBio.innerText.replace(/"/g, '');

    renderGloryTags('all');
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('active');
}

function switchSettingsTab(tab, btn) {
    document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const panel = document.getElementById('set-' + tab);
    if (panel) panel.classList.add('active');
}

function renderGloryTags(filter, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.glory-filter-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }
    const grid = document.getElementById('glory-tags-grid');
    if (!grid) return;
    grid.innerHTML = '';

    gloryTagsConfig.forEach(tag => {
        const isOwned = currentLevel >= tag.unlock;
        if (filter === 'owned' && !isOwned) return;
        if (filter === 'locked' && isOwned) return;

        let div = document.createElement('div');
        div.className = `glory-card ${tag.class} ${pendingSettings.titleClass === tag.class ? 'selected' : ''} ${!isOwned ? 'locked' : ''}`;

        if (!isOwned) div.setAttribute('data-unlock', tag.unlock);
        div.innerHTML = `<i class="fa-solid ${tag.icon}"></i> ${tag.name}`;
        div.onclick = () => selectGlory(div, tag.class, `<i class='fa-solid ${tag.icon}'></i> ${tag.name}`);

        grid.appendChild(div);
    });
}

function selectGlory(el, className, htmlContent) {
    document.querySelectorAll('.glory-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    pendingSettings.titleClass = className;
    pendingSettings.titleHtml = htmlContent;
}

function selectImage(el, htmlContent, bgValue, animClass) {
    document.querySelectorAll('.avatar-option').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    pendingSettings.avatarHtml = htmlContent;
    pendingSettings.avatarBg = bgValue;
    pendingSettings.avatarAnimClass = animClass;
}

function selectBanner(el, bgValue, animClass) {
    document.querySelectorAll('.banner-option').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    pendingSettings.bannerBg = bgValue;
    pendingSettings.bannerAnimClass = animClass;
}

async function saveSettings() {
    let bioText = document.getElementById('setting-bio-input')?.value || "";
    let toggleChecked = document.getElementById('setting-moon-toggle')?.checked || false;

    if (toggleChecked !== isMoonMode) toggleMoonMode();

    const payload = {
        bio: bioText,
        moon_mode: toggleChecked,
        glory_tag: pendingSettings.titleClass,
        glory_html: pendingSettings.titleHtml,
        avatar_html: pendingSettings.avatarHtml,
        avatar_bg: pendingSettings.avatarBg,
        avatar_anim: pendingSettings.avatarAnimClass,
        banner_bg: pendingSettings.bannerBg,
        banner_anim: pendingSettings.bannerAnimClass
    };

    try {
        const res = await apiRequest("/user/customize", "PUT", payload);
        if (res && res.ok) {
            closeSettings();
            await syncProfileFromDatabase();
        }
    } catch (e) {
        alert("Failed to save changes to database.");
    }
}

async function toggleMoonMode() {
    isMoonMode = !isMoonMode;
    syncMoonModeUI();

    try {
        await apiRequest("/user/customize", "PUT", { moon_mode: isMoonMode });
    } catch (e) {}
}

function syncMoonModeUI() {
    const dot = document.getElementById('user-status-dot');
    const txt = document.getElementById('user-status-text');
    const icon = document.getElementById('moon-mode-icon');
    if (!dot || !txt || !icon) return;

    if (isMoonMode) {
        dot.className = 'status-dot offline';
        txt.innerText = 'Offline (Ghost Mode)';
        icon.innerText = '🌑';
    } else {
        dot.className = 'status-dot';
        txt.innerText = 'Live: On Purple Line';
        icon.innerText = '🌕';
    }
}

function switchImpactTab(tab) {
    document.querySelectorAll('.impact-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.impact-content-panel').forEach(c => c.style.display = 'none');
    const tabBtn = document.getElementById('btn-tab-' + tab);
    if (tabBtn) tabBtn.classList.add('active');
    const impactPanel = document.getElementById('impact-content-' + tab);
    if (impactPanel) impactPanel.style.display = 'block';
}

// ============================================================================
// 7. REAL-TIME STATS, REWARDS & SCRATCH ENGINE
// ============================================================================
function getThreshold(level) {
    if (level === 1) return 1;
    if (level === 2) return 3;
    if (level === 3) return 5;
    return 10;
}

function updateAvatarRing() {
    const ring = document.getElementById('avatar-ring');
    if (!ring) return;
    const thresh = getThreshold(currentLevel);
    const percentage = (travelsInLevel / thresh) * 100;
    const emptyColor = document.body.classList.contains('light-theme') ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    ring.style.background = `conic-gradient(#007bff ${percentage}%, ${emptyColor} ${percentage}% 100%)`;
}

function updateUI() {
    const thresh = getThreshold(currentLevel);
    const lvlElem = document.getElementById('reward-level');
    if (lvlElem) lvlElem.innerText = currentLevel;

    const statElem = document.getElementById('reward-status');
    if (statElem) statElem.innerText = `Travel ${Math.max(0, thresh - travelsInLevel)} more times to reach Level ${currentLevel + 1}!`;

    // Real dynamic calculation: 100 PTS = 1.0 KG CO₂
    const navCo2 = document.getElementById('nav-co2');
    if (navCo2) navCo2.innerText = Math.floor(co2Points);

    const kgSaved = (co2Points / 100).toFixed(1);
    const moneySavedVal = Math.round((co2Points / 100) * 65); // Realistic saved cab fare per kg

    const profileCo2 = document.getElementById('profile-co2');
    if (profileCo2) profileCo2.innerText = `${kgSaved} kg`;

    const menuCo2 = document.getElementById('menu-co2');
    if (menuCo2) menuCo2.innerText = `${kgSaved} kg`;

    const profMoney = document.getElementById('profile-money-saved');
    if (profMoney) profMoney.innerText = `₹${moneySavedVal.toLocaleString()}`;

    const menuMoney = document.getElementById('menu-money');
    if (menuMoney) menuMoney.innerText = `₹${moneySavedVal.toLocaleString()}`;

    const thriftyMoney = document.getElementById('thrifty-savings-display');
    if (thriftyMoney) thriftyMoney.innerText = `₹${moneySavedVal.toLocaleString()}`;

    const profileTravelPts = document.getElementById('profile-travel-pts');
    if (profileTravelPts) profileTravelPts.innerText = `${travelPoints} Pts`;

    const menuTravelPts = document.getElementById('menu-travel-pts');
    if (menuTravelPts) menuTravelPts.innerText = `${travelPoints} Pts`;

    const redeemTravelPts = document.getElementById('redeem-travel-pts');
    if (redeemTravelPts) redeemTravelPts.innerText = travelPoints.toLocaleString();

    const impactText = document.getElementById('impact-trees-text');
    if (impactText) {
        const trees = (co2Points / 1000).toFixed(1);
        impactText.innerHTML = `Your transit choices <b>${Math.floor(co2Points)} PTS = ${kgSaved} KG</b> have the cooling effect of <b>${trees} trees</b>. (Minimum)`;
    }

    renderTracker();
    updateAvatarRing();
    if (document.getElementById('section-rewards')?.classList.contains('active')) {
        renderInventory();
    }
}

function renderTracker() {
    const tracker = document.getElementById('reward-tracker-ui');
    if (!tracker) return;

    let html = '';
    const totalNodes = 5;
    const startLevel = Math.max(1, currentLevel - 2);

    for (let i = 0; i < totalNodes; i++) {
        let lvl = startLevel + i;
        let stateClass = lvl < currentLevel ? 'completed' : (lvl === currentLevel ? 'current' : '');
        let icon = lvl < currentLevel ? '<i class="fa-solid fa-check"></i>' : (lvl % 5 === 0 ? '<i class="fa-solid fa-gift"></i>' : lvl);
        html += `<div class="tracker-node ${stateClass}">${icon}<div class="node-label">Lvl ${lvl}</div></div>`;
    }
    tracker.innerHTML = `<div class="tracker-line"></div><div class="tracker-progress" id="tracker-progress-line"></div>` + html;

    const progressLineElem = document.getElementById('tracker-progress-line');
    if (progressLineElem) {
        let perc = ((currentLevel - startLevel) / (totalNodes - 1)) * 100;
        progressLineElem.style.width = `calc(${perc}% - 30px)`;
    }
}

async function simulateTravel() {
    let thresh = getThreshold(currentLevel);
    travelsInLevel++;
    co2Points += 100;

    if (travelsInLevel >= thresh) {
        currentLevel++;
        travelsInLevel = 0;
        travelPoints += 10;

        const popLvl = document.getElementById('popup-level');
        if (popLvl) popLvl.innerText = currentLevel;

        const lvlModal = document.getElementById('levelup-modal');
        if (lvlModal) lvlModal.classList.add('active');

        setTimeout(() => {
            if (lvlModal) lvlModal.classList.remove('active');
            let rand = Math.random();
            let rewardText = rand < 0.05 ? "Free Daily Pass!" : (rand < 0.35 ? "+ 25 Travel Pts" : "₹20 Cashback");

            let pendingRewardObj = { id: Date.now(), text: rewardText, dateGen: new Date().toLocaleDateString(), isActivated: false };
            fullInventory.unscratched.push(pendingRewardObj);
            pendingReward = rewardText;
            pendingCardIndex = fullInventory.unscratched.length - 1;

            openScratchCard(rewardText);
            updateUI();
        }, 3000);
    } else {
        updateUI();
    }
}

function redeemPass(type) {
    const required = type === 'daily' ? 1000 : 10000;
    if (travelPoints < required) {
        alert("Not enough Travel Points. Keep traveling to earn more!");
        return;
    }

    travelPoints -= required;
    fullInventory.active.push({ 
        id: Date.now(), 
        text: type === 'daily' ? "Daily Pass" : "Monthly Pass", 
        expiry: getExpiryDate(type === 'daily' ? 1 : 30), 
        isActivated: false 
    });
    alert(`Success: ${type.toUpperCase()} Pass Redeemed!`);
    updateUI();
    renderInventory();
}

function getExpiryDate(daysToAdd) {
    let d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString();
}

function promptActivatePass(id) {
    passToActivate = id;
    const modal = document.getElementById('pass-activation-modal');
    if (modal) modal.classList.add('active');
}

function confirmActivatePass() {
    let pass = fullInventory.active.find(p => p.id === passToActivate);
    if (pass) {
        pass.isActivated = true;
        renderInventory();
    }
    const modal = document.getElementById('pass-activation-modal');
    if (modal) modal.classList.remove('active');
}

setInterval(() => {
    document.querySelectorAll('.pass-timer').forEach(el => {
        let now = new Date();
        let end = new Date();
        end.setHours(23, 59, 59, 999);
        let diff = end - now;
        if (diff <= 0) {
            el.innerText = "Expired";
            return;
        }
        let h = Math.floor(diff / (1000 * 60 * 60));
        let m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        let s = Math.floor((diff % (1000 * 60)) / 1000);
        el.innerText = `${h}h ${m}m ${s}s left`;
    });
}, 1000);

function openScratchCard(rewardText) {
    const prizeText = document.getElementById('scratch-prize-text');
    if (prizeText) prizeText.innerText = rewardText;

    const preScratch = document.getElementById('pre-scratch-btns');
    if (preScratch) preScratch.style.display = 'flex';

    const claimBtn = document.getElementById('btn-claim-reward');
    if (claimBtn) claimBtn.style.display = 'none';

    const scratchModal = document.getElementById('scratch-modal');
    if (scratchModal) scratchModal.classList.add('active');

    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 250;
    canvas.height = 150;

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 20px Montserrat';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 + 7);

    let isDrawing = false;
    let isRevealed = false;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 30;

    function getPos(e) {
        let rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function scratch(e) {
        if (!isDrawing || isRevealed) return;
        e.preventDefault();
        let pos = getPos(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    let scratchStrokes = 0;
    function trackScratch(e) {
        if (!isDrawing || isRevealed) return;
        scratch(e);
        scratchStrokes++;
        if (scratchStrokes > 40) {
            isRevealed = true;
            triggerScratchComplete(ctx, canvas);
        }
    }

    canvas.onmousedown = (e) => { isDrawing = true; let p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); scratch(e); };
    canvas.onmousemove = trackScratch;
    canvas.onmouseup = () => isDrawing = false;
    canvas.onmouseleave = () => isDrawing = false;

    canvas.ontouchstart = canvas.onmousedown;
    canvas.ontouchmove = trackScratch;
    canvas.ontouchend = () => isDrawing = false;
    canvas.style.pointerEvents = 'auto';
}

function triggerScratchComplete(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.pointerEvents = 'none';
    const preScratch = document.getElementById('pre-scratch-btns');
    if (preScratch) preScratch.style.display = 'none';

    const claimBtn = document.getElementById('btn-claim-reward');
    if (claimBtn) claimBtn.style.display = 'block';
}

function autoScratch() {
    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    triggerScratchComplete(ctx, canvas);
}

function scratchLater() {
    const modal = document.getElementById('scratch-modal');
    if (modal) modal.classList.remove('active');
    pendingReward = "";
    pendingCardIndex = -1;
    updateUI();
}

async function claimReward() {
    if (pendingCardIndex === -1) return;

    let d = new Date().toLocaleDateString();
    let rewardText = pendingReward;

    fullInventory.unscratched.splice(pendingCardIndex, 1);

    if (rewardText.includes("Cashback")) {
        let match = rewardText.match(/\d+/);
        if (match) await addFunds(parseInt(match[0]));
        fullInventory.scratched.unshift({ id: Date.now(), text: rewardText, claimDate: d });
    } else if (rewardText.includes("Travel Pts")) {
        travelPoints += 25;
        fullInventory.scratched.unshift({ id: Date.now(), text: rewardText, claimDate: d });
    } else if (rewardText.includes("Pass")) {
        fullInventory.active.unshift({ id: Date.now(), text: rewardText, expiry: getExpiryDate(7), isActivated: false });
    }

    rewardHistory.unshift({ date: d, desc: rewardText });
    pendingReward = "";
    pendingCardIndex = -1;

    updateUI();

    const modal = document.getElementById('scratch-modal');
    if (modal) modal.classList.remove('active');

    if (rewardText.includes("Pass")) switchInvTab('active');
    else switchInvTab('scratched');
}

function switchInvTab(tabName) {
    currentInvTab = tabName;
    document.querySelectorAll('.inv-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-inv-' + tabName);
    if (activeBtn) activeBtn.classList.add('active');
    renderInventory();
}

function renderInventory() {
    let grid = document.getElementById('inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';
    let dataList = fullInventory[currentInvTab] || [];

    if (dataList.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; color:#94a3b8; padding:20px;">No ${currentInvTab} rewards found.</div>`;
        return;
    }

    dataList.forEach((item, index) => {
        let card = document.createElement('div');

        if (currentInvTab === 'unscratched') {
            card.className = 'stored-scratch-card';
            card.innerHTML = `<i class="fa-solid fa-coins" style="font-size: 24px; margin-bottom:5px; color:#f59e0b;"></i>Tap to Scratch`;
            card.onclick = () => {
                pendingReward = item.text;
                pendingCardIndex = index;
                openScratchCard(pendingReward);
            };
        } else if (currentInvTab === 'active') {
            card.className = 'inv-active-card';
            let isPass = item.text && item.text.includes("Pass");

            if (isPass) {
                if (item.isActivated) {
                    card.innerHTML = `
                        <i class="fa-solid fa-ticket" style="font-size: 24px; margin-bottom:5px;"></i>
                        <div style="font-size:14px; margin-bottom: 5px; text-align:center;">${item.text}</div>
                        <div style="font-size:11px; font-weight: bold; color: #ef4444; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 4px;" class="pass-timer">Loading timer...</div>
                    `;
                } else {
                    card.innerHTML = `
                        <i class="fa-solid fa-ticket" style="font-size: 24px; margin-bottom:5px;"></i>
                        <div style="font-size:14px; margin-bottom: 5px; text-align:center;">${item.text}</div>
                        <button class="topup-btn" style="padding: 4px 10px; font-size: 11px;" onclick="promptActivatePass(${item.id})">Activate</button>
                    `;
                }
            } else {
                card.innerHTML = `
                    <i class="fa-solid fa-ticket" style="font-size: 24px; margin-bottom:5px;"></i>
                    <div style="font-size:14px; margin-bottom: 5px; text-align:center;">${item.text}</div>
                    <div style="font-size:10px; font-weight: 500; opacity: 0.8;">Expires: ${item.expiry}</div>
                `;
            }
        } else if (currentInvTab === 'scratched') {
            card.className = 'inv-scratched-card';
            card.innerHTML = `
                <i class="fa-solid fa-circle-check" style="font-size: 20px; margin-bottom:5px; color:#22c55e;"></i>
                <div style="font-size:12px; margin-bottom: 5px; text-align:center;">${item.text}</div>
                <div style="font-size:10px; font-weight: 500;">Claimed: ${item.claimDate}</div>
            `;
        }
        grid.appendChild(card);
    });
}

function openHistoryModal() {
    let list = document.getElementById('history-list');
    if (!list) return;
    list.innerHTML = '';
    if (rewardHistory.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:20px;">No rewards claimed yet. Keep traveling!</div>`;
    } else {
        rewardHistory.forEach(item => {
            list.innerHTML += `<div class="history-item">
                <div style="background:rgba(34,197,94,0.2); color:#22c55e; padding:8px; border-radius:6px;"><i class="fa-solid fa-check"></i></div>
                <div><b>${item.desc}</b><br><span style="font-size:11px; color:#94a3b8;">${item.date}</span></div>
            </div>`;
        });
    }
    const modal = document.getElementById('history-modal');
    if (modal) modal.classList.add('active');
}

function resetRewardsTesting() {
    if (confirm("Reset all reward progress?")) {
        currentLevel = 1; travelsInLevel = 0; co2Points = 0; travelPoints = 0;
        rewardHistory = [];
        fullInventory = { unscratched: [], active: [], scratched: [] };
        updateUI();
    }
}

// ============================================================================
// 8. REAL MONGODB LEADERBOARD
// ============================================================================
async function renderLeaderboard(type) {
    currentLeaderboardTab = type;
    document.querySelectorAll('.lb-btn').forEach(b => {
        if (!b.classList.contains('impact-tab-btn') && !b.classList.contains('inv-tab-btn')) {
            b.classList.remove('active');
            if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`('${type}')`)) {
                b.classList.add('active');
            }
        }
    });

    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    container.innerHTML = '';

    let list = [];
    try {
        const res = await apiRequest("/transit/leaderboard", "GET");
        if (res && res.ok) {
            list = await res.json();
        }
    } catch (e) {}

    if (list.length === 0) {
        let currentEntry = {
            name: currentUser?.name || "Commuter", 
            co2_points: Math.floor(co2Points), 
            isMe: true,
            banner: { bg: currentUserBannerBg, anim: currentUserBannerAnimClass },
            avatar: { bg: currentUserAvatarBg, html: currentUserAvatarHtml, anim: currentUserAvatarAnimClass }
        };
        list = [currentEntry];
    }

    list.forEach((u, idx) => {
        const item = document.createElement('div');
        const isMe = u.isMe || (currentUser && u.username === currentUser.username);
        item.className = `lb-item ${u.banner?.anim || ''} ${isMe ? 'is-me' : ''}`;
        item.style.background = u.banner?.bg || '#1e3a8a';

        let avatarHtmlToUse = u.avatar?.html || u.name.slice(0, 2).toUpperCase();
        let avatarBgToUse = u.avatar?.bg || '#007bff';
        let animClass = u.avatar?.anim || '';
        let rankClass = idx === 0 ? 'top-1' : (idx === 1 ? 'top-2' : (idx === 2 ? 'top-3' : ''));

        item.innerHTML = `
            <div class="lb-rank ${rankClass}">${idx + 1}</div>
            <div class="lb-user-info">
                <div class="lb-avatar ${animClass}" style="background: ${avatarBgToUse};">${avatarHtmlToUse}</div>
                <div class="lb-name" style="text-shadow: 0 1px 4px rgba(0,0,0,0.9);">${u.name} ${isMe ? '<span style="color:#3b82f6;">(You)</span>' : ''}</div>
            </div>
            <div class="lb-pts" style="background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px; color:#4ade80; border: 1px solid rgba(255,255,255,0.1);">${Math.floor(u.co2_points || 0)} Pts</div>
        `;
        container.appendChild(item);
    });
}

// ============================================================================
// 9. FRIENDS LIST
// ============================================================================
function renderFriends() {
    const container = document.getElementById('friend-list-view');
    if (!container) return;
    container.innerHTML = '';
    fakeFriendsList.forEach(friend => {
        let card = document.createElement('div');
        card.className = `friend-card ${friend.bannerAnimClass || ''}`;
        card.style.background = friend.bannerBg;

        card.innerHTML = `
            <div style="display: flex; align-items: center; width: 100%;">
                <div class="friend-avatar ${friend.animClass}" style="background: ${friend.avatarBg}">${friend.avatarHtml}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-family: 'Montserrat'; color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.9);">${friend.name}</div>
                    <div class="text-sm" style="color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.9);">${friend.username}</div>
                </div>
                <div style="color: #4ade80; font-weight: bold; font-size: 14px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                    <i class="fa-solid fa-leaf"></i> ${friend.co2} Pts
                </div>
            </div>
        `;
        card.onclick = () => openFriendModal(friend);
        container.appendChild(card);
    });
}

function renderRequests() {
    const container = document.getElementById('friend-requests-view');
    if (!container) return;
    container.innerHTML = '<div class="text-sm" style="text-align:center; padding: 20px;">No pending requests.</div>';
    const reqCount = document.getElementById('req-count');
    if (reqCount) reqCount.innerText = "0";
}

function toggleFriendView(view, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.friend-tab-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }
    const listV = document.getElementById('friend-list-view');
    const addV = document.getElementById('friend-add-view');
    const reqV = document.getElementById('friend-requests-view');

    if (listV) listV.style.display = 'none';
    if (addV) addV.style.display = 'none';
    if (reqV) reqV.style.display = 'none';

    if (view === 'list' && listV) listV.style.display = 'block';
    if (view === 'add' && addV) addV.style.display = 'block';
    if (view === 'requests' && reqV) {
        reqV.style.display = 'block';
        renderRequests();
    }
}

function openFriendModal(friend) {
    let banner = document.getElementById('modal-friend-banner');
    if (banner) {
        banner.style.background = friend.bannerBg;
        banner.className = `profile-banner ${friend.bannerAnimClass || ''}`;
    }

    const av = document.getElementById('modal-friend-avatar');
    if (av) {
        av.innerHTML = friend.avatarHtml;
        av.style.background = friend.avatarBg;
        av.className = `avatar-large ${friend.animClass || ''}`;
    }

    const name = document.getElementById('modal-friend-name');
    if (name) name.innerText = friend.name;

    const user = document.getElementById('modal-friend-username');
    if (user) user.innerText = friend.username;

    const co2 = document.getElementById('modal-friend-co2');
    if (co2) co2.innerText = friend.co2;

    const since = document.getElementById('modal-friend-since');
    if (since) since.innerText = friend.since || "New Friend";

    const bio = document.getElementById('modal-friend-bio');
    if (bio) bio.innerText = `"${friend.bio || "No bio yet."}"`;

    const modal = document.getElementById('friend-profile-modal');
    if (modal) modal.classList.add('active');
}

function searchFriends() {
    const container = document.getElementById('search-results-view');
    if (!container) return;
    container.innerHTML = '<div style="margin-bottom: 12px; font-weight: 600; color: #94a3b8; font-size: 13px;">Search Results</div>';
    const randomNames = ["Vikram Singh", "Ananya Rao", "Suresh G"];
    const btnColor = document.body.classList.contains('light-theme') ? '#cbd5e1' : 'rgba(255,255,255,0.1)';

    for (let i = 0; i < randomNames.length; i++) {
        let name = randomNames[i];
        let username = "@" + name.split(' ')[0].toLowerCase();
        let initials = name.split(' ').map(n => n[0]).join('');
        let card = document.createElement('div');
        card.className = 'friend-card';
        card.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="friend-avatar" style="background: ${btnColor}; color: inherit;">${initials}</div>
                <div>
                    <div style="font-weight: 600; font-family: 'Montserrat';">${name}</div>
                    <div class="text-sm">${username}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="color: #22c55e; font-weight: bold; font-size: 13px;"><i class="fa-solid fa-leaf"></i> 4,100</div>
                <button class="topup-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 6px;" onclick="alert('Friend Request Sent!')"><i class="fa-solid fa-user-plus"></i></button>
            </div>
        `;
        container.appendChild(card);
    }
}

// ============================================================================
// 10. CALENDAR ENGINE
// ============================================================================
let calDate = new Date();
const todayReal = new Date();
todayReal.setHours(0, 0, 0, 0);

const travelTypes = ['c-metro-purple', 'c-metro-green', 'c-bus-bmtc', 'empty'];

function getFakeTravelType(dateString) {
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
    return travelTypes[Math.abs(hash) % travelTypes.length];
}

function getFakeDetailsHtml(type, dateStr) {
    if (type === 'empty') return `<div style="text-align:center; color:#94a3b8;"><i class="fa-solid fa-house-chimney" style="font-size:20px; margin-bottom:10px;"></i><br>No travel on ${dateStr}.</div>`;
    return `<b><i class="fa-regular fa-calendar"></i> ${dateStr}</b><br><div style="margin-top:10px; font-size:13px;"><div style="display:flex; justify-content:space-between;"><span><i class="fa-solid fa-train-subway" style="color:#8b5cf6;"></i> Namma Metro Trip</span> <b>₹35</b></div><div style="text-align:right; color:#22c55e; margin-top:5px; font-weight:bold;">+ 12 CO₂ Pts</div></div>`;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthYear = document.getElementById('calendar-month-year');
    if (monthYear) monthYear.innerText = `${monthNames[calDate.getMonth()]} ${calDate.getFullYear()}`;

    grid.innerHTML = `<div class="cal-day-name">Sun</div><div class="cal-day-name">Mon</div><div class="cal-day-name">Tue</div><div class="cal-day-name">Wed</div><div class="cal-day-name">Thu</div><div class="cal-day-name">Fri</div><div class="cal-day-name">Sat</div>`;

    let firstDay = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();
    let daysInMonth = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.innerHTML += '<div class="cal-cell empty"></div>';

    for (let i = 1; i <= daysInMonth; i++) {
        let cell = document.createElement('div');
        cell.innerText = i;
        cell.className = 'cal-cell';
        let checkDate = new Date(calDate.getFullYear(), calDate.getMonth(), i);
        let dateStr = checkDate.toDateString();

        if (checkDate.getTime() <= todayReal.getTime()) {
            let type = getFakeTravelType(dateStr);
            if (type !== 'empty') cell.classList.add(type);
            if (checkDate.getTime() === todayReal.getTime()) cell.classList.add('today');

            cell.addEventListener('click', () => {
                document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                const box = document.getElementById('travel-details-box');
                if (box) box.innerHTML = getFakeDetailsHtml(type, dateStr);
            });
        } else {
            cell.classList.add('empty');
        }
        grid.appendChild(cell);
    }
}

function changeMonth(dir) {
    let newMonth = calDate.getMonth() + dir;
    let newYear = calDate.getFullYear();
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }

    calDate.setMonth(newMonth);
    calDate.setFullYear(newYear);
    renderCalendar();
}

// ============================================================================
// 11. FEEDBACK & THEME TOGGLE
// ============================================================================
async function submitFeedback() {
    const subjElem = document.getElementById('support-subject');
    const msgElem = document.getElementById('support-message');
    const subject = subjElem?.value.trim();
    const message = msgElem?.value.trim();

    if (!subject || !message) return alert("Please fill out both subject and message.");

    try {
        await apiRequest("/support/feedback", "POST", { subject, message });
    } catch (e) {}

    const modal = document.getElementById('feedback-modal');
    if (modal) modal.classList.add('active');
    setTimeout(() => {
        if (modal) modal.classList.remove('active');
        if (subjElem) subjElem.value = '';
        if (msgElem) msgElem.value = '';
    }, 2500);
}

// Theme Toggle with Mongo Persistence
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    const themeIcon = themeBtn.querySelector('i');
    themeBtn.addEventListener('click', async () => {
        let newTheme = "light-theme";
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.replace('light-theme', 'dark-theme');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            newTheme = "dark-theme";
        } else {
            document.body.classList.replace('dark-theme', 'light-theme');
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            newTheme = "light-theme";
        }

        try {
            await apiRequest("/user/customize", "PUT", { theme: newTheme });
        } catch (e) {}
    });
}

// Logout Handlers
document.querySelectorAll('.btn-logout').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await apiRequest("/logout", "POST");
        } catch (err) {}
        localStorage.removeItem("user_email");
        localStorage.removeItem("bmrta_token");
        window.location.href = 'login.html';
    });
});

// Live Advisory Rotation
const liveAdvisories = [
    { icon: '<i class="fa-solid fa-cloud-bolt" style="color: #f59e0b;"></i>', temp: "26°C", cond: "Scattered Storms", alert: "<b>Alert:</b> Heavy rain at 5 PM. Metro recommended over buses." },
    { icon: '<i class="fa-solid fa-sun" style="color: #eab308;"></i>', temp: "31°C", cond: "Sunny", alert: "<b>Update:</b> Clear routes on Outer Ring Road. Normal bus operations." },
    { icon: '<i class="fa-solid fa-smog" style="color: #94a3b8;"></i>', temp: "22°C", cond: "Morning Mist", alert: "<b>Tip:</b> Low visibility near airport. Suburban rail is on time." },
    { icon: '<i class="fa-solid fa-droplet" style="color: #3b82f6;"></i>', temp: "24°C", cond: "Light Rain", alert: "<b>Alert:</b> Purple line experiencing slight delays due to signal issues." },
    { icon: '<i class="fa-solid fa-wind" style="color: #cbd5e1;"></i>', temp: "25°C", cond: "Breezy", alert: "<b>Update:</b> Excellent weather for cycling to your nearest metro station." }
];

let currentAdvisoryIndex = 0;
function initAdvisories() {
    const advisoryContainer = document.getElementById('advisory-container');
    if (!advisoryContainer) return;
    advisoryContainer.innerHTML = '';

    liveAdvisories.forEach((adv, idx) => {
        let div = document.createElement('div');
        div.className = `advisory-slide ${idx === 0 ? 'active' : ''}`;
        div.innerHTML = `
            <div style="font-size: 28px; width: 40px; text-align: center;">${adv.icon}</div>
            <div>
                <div style="font-weight: 700; font-size: 16px;">${adv.temp} <span style="font-size:12px; font-weight:500; color:#94a3b8; font-family:'Inter';">${adv.cond}</span></div>
                <div class="text-sm" style="color:#ef4444; margin-top:2px;">${adv.alert}</div>
            </div>
        `;
        advisoryContainer.appendChild(div);
    });

    const fill = document.getElementById('advisory-progress-fill');
    if (fill) fill.style.width = '100%';
}

// Transit Tips Rotation
const transitTips = [
    "Buying a <b>Monthly Pass</b> saves an average commuter ₹450 and reduces ticket queue time by 2.5 hours per month!",
    "Riding <b>Namma Metro</b> reduces your carbon footprint by up to 75% compared to driving a private car.",
    "The <b>NCMC</b> card can be used seamlessly across Metro, BMTC buses, and even retail shopping.",
    "BMTC operates one of the largest fleets of <b>Electric Buses</b> in India, saving tons of CO₂ daily.",
    "A single full <b>Metro train</b> can carry up to 1,000 passengers, removing roughly 800 cars from roads!"
];

let currentTipIndex = 0;
function initTips() {
    const tipDisplay = document.getElementById('tip-text-display');
    if (!tipDisplay) return;
    tipDisplay.innerHTML = transitTips[0];
}

// Tab Initializer
function initActiveTab() {
    const hash = window.location.hash.replace('#', '').trim();
    const validTabs = ['status', 'travel', 'personal', 'wallet', 'rewards', 'friends', 'transit', 'support'];
    if (hash && validTabs.includes(hash)) {
        switchTab(hash);
    } else if (window.innerWidth <= 768) {
        switchTab('status');
    } else {
        switchTab('travel');
    }
}

// Bootstrapping
window.addEventListener('DOMContentLoaded', () => {
    syncProfileFromDatabase();
    initAdvisories();
    initTips();
    renderCalendar();
    renderFriends();
    renderRequests();
    initActiveTab();
});

window.addEventListener('hashchange', initActiveTab);