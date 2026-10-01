// --- GLOBAL VARIABLES ---
let co2Points = parseFloat(localStorage.getItem('co2_points')) || 5200;
let currentLevel = parseInt(localStorage.getItem('reward_level')) || 1;
let travelsInLevel = parseInt(localStorage.getItem('reward_travels')) || 0;
let travelPoints = parseInt(localStorage.getItem('travel_points')) || 0;
let rewardHistory = JSON.parse(localStorage.getItem('reward_history')) || [];

let fullInventory = JSON.parse(localStorage.getItem('rta_inventory')) || { unscratched: [], active: [], scratched: [] };

let pendingSettings = {
    bio: `"Eco-warrior & daily commuter. Let's save the planet one trip at a time!"`,
    titleClass: 'tag-commuter',
    titleHtml: '<i class="fa-solid fa-train-subway"></i> Daily Commuter',
    avatarHtml: 'VV',
    avatarBg: 'linear-gradient(135deg, #007bff, #06b6d4)',
    avatarAnimClass: '',
    bannerBg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    bannerAnimClass: ''
};

let currentUserAvatarHtml = 'VV';
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

const fakeFriendsList = [
    { name: "Rahul Verma", username: "@rahul_v89", co2: 4100, since: "Jan 2026", bio: "BMTC all the way.", bannerBg: "linear-gradient(0deg, #ff4e50, #f9d423, #ff4e50)", bannerAnimClass: "banner-inferno", avatarBg: "#ea580c", avatarHtml: "<i class='fa-solid fa-bus avatar-bg-icon'></i><span class='avatar-text'>RV</span>", animClass: "anim-wobble" },
    { name: "Sneha Reddy", username: "@sneha_r", co2: 2850, since: "Feb 2026", bio: "Carpooler and weekend walker.", bannerBg: "linear-gradient(180deg, #0ea5e9 0%, #06b6d4 50%, #ffffff 50%, #ffffff 100%)", bannerAnimClass: "banner-aurora", avatarBg: "rgba(0,20,40,0.8)", avatarHtml: "<i class='fa-solid fa-microchip'></i>", animClass: "anim-hologram" },
    { name: "Kiran Kumar", username: "@kiran_k", co2: 5020, since: "Dec 2025", bio: "Public transport is my second home.", bannerBg: "radial-gradient(circle, #ffffff 1px, transparent 1px) #0b0c10", bannerAnimClass: "banner-starlight", avatarBg: "linear-gradient(135deg, #10b981, #064e3b)", avatarHtml: "<i class='fa-solid fa-lungs'></i>", animClass: "anim-breathing" },
    { name: "Aditi Sharma", username: "@aditi_s", co2: 3200, since: "Mar 2025", bio: "Metro enthusiast.", bannerBg: "repeating-linear-gradient(45deg, #2b2b2b, #2b2b2b 10px, #1a1a1a 10px, #1a1a1a 20px)", bannerAnimClass: "banner-glitch", avatarBg: "linear-gradient(135deg, #f59e0b, #d97706)", avatarHtml: "<i class='fa-solid fa-person-walking-luggage'></i>", animClass: "" },
    { name: "Pooja Iyer", username: "@pooja_iyer", co2: 1900, since: "Apr 2026", bio: "Weekend traveler & clean energy fan.", bannerBg: "linear-gradient(135deg, #ff007f, #00d2ff, #7a00ff, #ff007f)", bannerAnimClass: "banner-prismatic", avatarBg: "#7c3aed", avatarHtml: "<i class='fa-solid fa-train avatar-bg-icon'></i> <span class='avatar-text'>PI</span>", animClass: "anim-float" },
    { name: "Arjun M", username: "@arjun_m", co2: 3750, since: "May 2026", bio: "Let's reduce our carbon footprint!", bannerBg: "linear-gradient(to right, #0f2027, #203a43, #2c5364)", bannerAnimClass: "", avatarBg: "rgba(0, 40, 40, 0.8)", avatarHtml: "<i class='fa-solid fa-satellite-dish' style='color:#0ff'></i>", animClass: "anim-radar" },
    { name: "Deepak S", username: "@deepak_s", co2: 2100, since: "Mar 2026", bio: "Always taking the Green Line.", bannerBg: "linear-gradient(to right, #134e5e, #71b280)", bannerAnimClass: "", avatarBg: "#10b981", avatarHtml: "<i class='fa-solid fa-train-subway avatar-bg-icon'></i><span class='avatar-text'>DS</span>", animClass: "" },
    { name: "Kavya N", username: "@kavya_n", co2: 4400, since: "Jan 2026", bio: "Sustainable living advocate.", bannerBg: "linear-gradient(90deg, #4c1d95, #a855f7)", bannerAnimClass: "", avatarBg: "linear-gradient(135deg, #ec4899, #be185d)", avatarHtml: "<i class='fa-solid fa-user-ninja'></i>", animClass: "" },
    { name: "Manoj Das", username: "@manoj_das", co2: 1200, since: "Jun 2026", bio: "Just started using RTA passes.", bannerBg: "linear-gradient(to right, #870000, #190a05)", bannerAnimClass: "", avatarBg: "#b45309", avatarHtml: "<span class='avatar-text'>MD</span>", animClass: "" },
    { name: "Nisha Patel", username: "@nisha_p", co2: 3300, since: "Feb 2026", bio: "Cycling and Metros.", bannerBg: "linear-gradient(to right, #2b5876, #4e4376)", bannerAnimClass: "", avatarBg: "linear-gradient(135deg, #10b981, #047857)", avatarHtml: "<i class='fa-solid fa-bicycle'></i>", animClass: "anim-float" }
];

const fakeRequestsList = [
    { name: "Priya Sharma", username: "@priya_s", co2: 2100, since: "Pending", bio: "Waiting for approval...", bannerBg: "linear-gradient(to right, #870000, #190a05)", bannerAnimClass: "", avatarBg: "#eab308", avatarHtml: "<span class='avatar-text'>PS</span>", animClass: "" },
    { name: "Rohan Gupta", username: "@rohan_g", co2: 1800, since: "Pending", bio: "Waiting for approval...", bannerBg: "linear-gradient(to right, #2b5876, #4e4376)", bannerAnimClass: "", avatarBg: "linear-gradient(135deg, #10b981, #047857)", avatarHtml: "<i class='fa-solid fa-bicycle'></i>", animClass: "anim-float" }
];

const fakeAllUsersList = [
    { name: "Suresh Gowda", co2: 12500, bannerBg: "linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)", bannerAnimClass: "", avatarBg: "linear-gradient(135deg, #eab308, #ca8a04)", avatarHtml: "<i class='fa-solid fa-lightbulb'></i>", animClass: "anim-flicker" },
    { name: "Priya K", co2: 11200, bannerBg: "linear-gradient(90deg, #4c1d95, #a855f7)", bannerAnimClass: "", avatarBg: "#8b5cf6", avatarHtml: "<span class='avatar-text'>PK</span>", animClass: "anim-pulse-glow" },
    { name: "Amit Patel", co2: 9800, bannerBg: "linear-gradient(to right, #134e5e, #71b280)", bannerAnimClass: "", avatarBg: "linear-gradient(135deg, #10b981, #047857)", avatarHtml: "<i class='fa-solid fa-bicycle'></i>", animClass: "" },
    { name: "Anita S", co2: 8900, bannerBg: "linear-gradient(to right, #ff5f6d, #ffc371)", bannerAnimClass: "", avatarBg: "#ea580c", avatarHtml: "<span class='avatar-text'>AS</span>", animClass: "" },
    { name: "Vikram Rao", co2: 8500, bannerBg: "linear-gradient(135deg, #1e3a8a, #3b82f6)", bannerAnimClass: "", avatarBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", avatarHtml: "<i class='fa-solid fa-user-graduate'></i>", animClass: "" }
];

// --- NAVIGATION & DYNAMIC TAB SWITCHER ---
function switchTab(tabId, btnElement) {
    const wrapper = document.getElementById('profile-wrapper');
    if (wrapper) wrapper.setAttribute('data-tab', tabId);

    document.querySelectorAll('.dynamic-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.profile-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.mobile-menu-item').forEach(btn => btn.classList.remove('active'));

    const targetSection = document.getElementById('section-' + tabId);
    if (targetSection) targetSection.classList.add('active');

    // Sync Desktop Button
    const deskBtn = document.querySelector(`.profile-btn[onclick*="'${tabId}'"]`);
    if (deskBtn) deskBtn.classList.add('active');

    // Sync Mobile Drawer Item
    const mobBtn = document.querySelector(`.mobile-menu-item[onclick*="'${tabId}'"]`);
    if (mobBtn) mobBtn.classList.add('active');

    if (tabId === 'rewards') {
        renderTracker();
        renderInventory();
    }

    // Auto-close menu drawer when an item is selected
    const menu = document.getElementById('mobile-nav-menu');
    if (menu) menu.classList.remove('active');
}

// --- MOBILE MENU TOGGLE ---
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

// --- SETTINGS LOGIC ---
function openSettings() {
    document.getElementById('settings-modal').classList.add('active');
    document.getElementById('setting-moon-toggle').checked = isMoonMode;
    document.getElementById('setting-bio-input').value = document.getElementById('main-user-bio').innerText;
    renderGloryTags('all');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
}

function switchSettingsTab(tab, btn) {
    document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('set-' + tab).classList.add('active');
}

function renderGloryTags(filter, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.glory-filter-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }
    const grid = document.getElementById('glory-tags-grid');
    grid.innerHTML = '';

    gloryTagsConfig.forEach(tag => {
        const isOwned = currentLevel >= tag.unlock;
        if (filter === 'owned' && !isOwned) return;
        if (filter === 'locked' && isOwned) return;

        let div = document.createElement('div');
        div.className = `glory-card ${tag.class} ${pendingSettings.titleClass === tag.class ? 'selected' : ''} ${!isOwned ? 'locked' : ''}`;

        if (!isOwned) {
            div.setAttribute('data-unlock', tag.unlock);
        }
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

function saveSettings() {
    let bioText = document.getElementById('setting-bio-input').value;
    document.getElementById('main-user-bio').innerText = bioText;

    let toggleChecked = document.getElementById('setting-moon-toggle').checked;
    if (toggleChecked !== isMoonMode) toggleMoonMode();

    let tag = document.getElementById('main-user-tag');
    tag.className = 'user-tag ' + pendingSettings.titleClass;
    tag.innerHTML = pendingSettings.titleHtml;

    let av = document.getElementById('main-avatar-inner');
    av.innerHTML = pendingSettings.avatarHtml;
    av.style.background = pendingSettings.avatarBg;
    av.className = 'avatar-inner ' + pendingSettings.avatarAnimClass;

    let mb = document.getElementById('main-profile-banner');
    mb.style.background = pendingSettings.bannerBg;
    mb.className = 'profile-banner ' + (pendingSettings.bannerAnimClass || 'default-banner');

    currentUserAvatarHtml = pendingSettings.avatarHtml;
    currentUserAvatarBg = pendingSettings.avatarBg;
    currentUserAvatarAnimClass = pendingSettings.avatarAnimClass;
    currentUserBannerBg = pendingSettings.bannerBg;
    currentUserBannerAnimClass = pendingSettings.bannerAnimClass;

    renderLeaderboard(currentLeaderboardTab);
    closeSettings();
}

// --- MOON MODE LOGIC ---
function toggleMoonMode() {
    isMoonMode = !isMoonMode;
    const dot = document.getElementById('user-status-dot');
    const txt = document.getElementById('user-status-text');
    const icon = document.getElementById('moon-mode-icon');

    if (isMoonMode) {
        dot.className = 'status-dot offline';
        txt.innerText = 'Offline';
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
    document.getElementById('btn-tab-' + tab).classList.add('active');
    document.getElementById('impact-content-' + tab).style.display = 'block';
}

// --- THEME TOGGLE LOGIC ---
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = themeBtn.querySelector('i');
if (localStorage.getItem('bengaluru_theme') === 'dark') {
    document.body.classList.replace('light-theme', 'dark-theme');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}
themeBtn.addEventListener('click', () => {
    if (document.body.classList.contains('light-theme')) {
        document.body.classList.replace('light-theme', 'dark-theme');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('bengaluru_theme', 'dark');
    } else {
        document.body.classList.replace('dark-theme', 'light-theme');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('bengaluru_theme', 'light');
    }
    updateAvatarRing();
});

// --- FRIENDS SECTION LOGIC ---
function renderFriends() {
    const container = document.getElementById('friend-list-view');
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
    container.innerHTML = '';
    if (!fakeRequestsList || fakeRequestsList.length === 0) {
        container.innerHTML = '<div class="text-sm" style="text-align:center; padding: 20px;">No pending requests.</div>';
        document.getElementById('req-count').innerText = "0";
        return;
    }
    document.getElementById('req-count').innerText = fakeRequestsList.length;

    fakeRequestsList.forEach((req, index) => {
        let card = document.createElement('div');
        card.className = `friend-card ${req.bannerAnimClass || ''}`;
        card.style.background = req.bannerBg;

        card.innerHTML = `
            <div style="display: flex; align-items: center; width: 100%; cursor: pointer;" class="req-profile-click">
                <div class="friend-avatar ${req.animClass}" style="background: ${req.avatarBg}">${req.avatarHtml}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-family: 'Montserrat'; color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.9);">${req.name}</div>
                    <div class="text-sm" style="color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.9);">${req.username}</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="topup-btn req-accept-btn" style="padding: 6px 12px; font-size: 12px; background: #22c55e;"><i class="fa-solid fa-check"></i></button>
                <button class="topup-btn req-decline-btn" style="padding: 6px 12px; font-size: 12px; background: #ef4444;"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;

        card.querySelector('.req-profile-click').onclick = () => openFriendModal(req);
        card.querySelector('.req-accept-btn').onclick = (e) => acceptRequest(index, e);
        card.querySelector('.req-decline-btn').onclick = (e) => declineRequest(index, e);

        container.appendChild(card);
    });
}

function acceptRequest(index, e) {
    e.stopPropagation();
    alert("Friend request accepted!");
    fakeFriendsList.push(fakeRequestsList[index]);
    fakeRequestsList.splice(index, 1);
    renderRequests();
    renderFriends();
    if (currentLeaderboardTab === 'friends') renderLeaderboard('friends');
}

function declineRequest(index, e) {
    e.stopPropagation();
    fakeRequestsList.splice(index, 1);
    renderRequests();
}

function toggleFriendView(view, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.friend-tab-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }
    document.getElementById('friend-list-view').style.display = 'none';
    document.getElementById('friend-add-view').style.display = 'none';
    document.getElementById('friend-requests-view').style.display = 'none';

    if (view === 'list') {
        document.getElementById('friend-list-view').style.display = 'block';
    } else if (view === 'add') {
        document.getElementById('friend-add-view').style.display = 'block';
    } else if (view === 'requests') {
        document.getElementById('friend-requests-view').style.display = 'block';
        renderRequests();
    }
}

function openFriendModal(friend) {
    let banner = document.getElementById('modal-friend-banner');
    banner.style.background = friend.bannerBg;
    banner.className = `profile-banner ${friend.bannerAnimClass || ''}`;

    document.getElementById('modal-friend-avatar').innerHTML = friend.avatarHtml;
    document.getElementById('modal-friend-avatar').style.background = friend.avatarBg;
    document.getElementById('modal-friend-avatar').className = `avatar-large ${friend.animClass}`;
    document.getElementById('modal-friend-name').innerText = friend.name;
    document.getElementById('modal-friend-username').innerText = friend.username;
    document.getElementById('modal-friend-co2').innerText = friend.co2;
    document.getElementById('modal-friend-since').innerText = friend.since || "New Friend";
    document.getElementById('modal-friend-bio').innerText = `"${friend.bio || "No bio yet."}"`;
    document.getElementById('friend-profile-modal').classList.add('active');
}

function searchFriends() {
    const container = document.getElementById('search-results-view');
    container.innerHTML = '<div style="margin-bottom: 12px; font-weight: 600; color: #94a3b8; font-size: 13px;">Search Results</div>';
    const randomNames = ["Vikram Singh", "Ananya Rao", "Suresh G", "Neha K", "Tarun J", "Divya Menon"];
    const btnColor = document.body.classList.contains('light-theme') ? '#cbd5e1' : 'rgba(255,255,255,0.1)';

    for (let i = 0; i < 3; i++) {
        let name = randomNames[Math.floor(Math.random() * randomNames.length)] + " " + Math.floor(Math.random() * 100);
        let username = "@" + name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 99);
        let randCo2 = Math.floor(Math.random() * 3000) + 500;
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
                <div style="color: #22c55e; font-weight: bold; font-size: 13px;"><i class="fa-solid fa-leaf"></i> ${randCo2}</div>
                <button class="topup-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 6px;" onclick="alert('Friend Request Sent!')"><i class="fa-solid fa-user-plus"></i></button>
            </div>
        `;
        container.appendChild(card);
    }
}

// --- DYNAMIC LEADERBOARD LOGIC ---
function renderLeaderboard(type) {
    currentLeaderboardTab = type;

    document.querySelectorAll('.lb-btn').forEach(b => {
        if (!b.classList.contains('impact-tab-btn') && !b.classList.contains('inv-tab-btn')) {
            b.classList.remove('active');
            if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`('${type}')`)) {
                b.classList.add('active');
            }
        }
    });

    let list = [];
    let currentUser = {
        name: "Vignesh Vicky", co2: Math.floor(co2Points), color: "#3b82f6", isMe: true,
        bannerBg: currentUserBannerBg, bannerAnimClass: currentUserBannerAnimClass, avatarBg: currentUserAvatarBg, avatarHtml: currentUserAvatarHtml, animClass: currentUserAvatarAnimClass
    };

    if (type === 'friends') { list = [...fakeFriendsList, currentUser]; }
    else { list = [...fakeAllUsersList, currentUser]; }
    list.sort((a, b) => b.co2 - a.co2);

    const container = document.getElementById('leaderboard-list');
    container.innerHTML = '';
    let userRendered = false;

    for (let i = 0; i < list.length; i++) {
        let user = list[i];
        if (user.isMe) userRendered = true;
        container.appendChild(createLeaderboardItem(user, i + 1));
    }

    if (!userRendered) {
        let userRank = list.findIndex(u => u.isMe) + 1;
        let divider = document.createElement('div');
        divider.style = "text-align: center; color: #94a3b8; font-size: 14px; margin: -2px 0;";
        divider.innerText = "•••";
        container.appendChild(divider);
        container.appendChild(createLeaderboardItem(currentUser, userRank));
    }
}

function createLeaderboardItem(user, rank) {
    let item = document.createElement('div');
    item.className = `lb-item ${user.bannerAnimClass || ''} ${user.isMe ? 'is-me' : ''}`;

    item.style.background = user.bannerBg || '#1e293b';
    item.style.color = "white";

    let avatarHtmlToUse = user.avatarHtml || user.name.split(' ').map(n => n[0]).join('');
    let avatarBgToUse = user.avatarBg || '#1e293b';
    let animClass = user.animClass || '';
    let rankClass = rank === 1 ? 'top-1' : (rank === 2 ? 'top-2' : (rank === 3 ? 'top-3' : ''));

    item.innerHTML = `
        <div class="lb-rank ${rankClass}">${rank}</div>
        <div class="lb-user-info">
            <div class="lb-avatar ${animClass}" style="background: ${avatarBgToUse};">${avatarHtmlToUse}</div>
            <div class="lb-name" style="text-shadow: 0 1px 4px rgba(0,0,0,0.9);">${user.name} ${user.isMe ? '<span style="color:#3b82f6;">(You)</span>' : ''}</div>
        </div>
        <div class="lb-pts" style="background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px; color:#4ade80; border: 1px solid rgba(255,255,255,0.1);">${user.co2} Pts</div>
    `;
    return item;
}

function submitFeedback() {
    let subj = document.getElementById('support-subject').value;
    if (subj.trim() === "") return alert("Please enter a subject.");
    document.getElementById('feedback-modal').classList.add('active');
    setTimeout(() => {
        document.getElementById('feedback-modal').classList.remove('active');
        document.getElementById('support-subject').value = '';
        document.getElementById('support-message').value = '';
    }, 2500);
}

function initWallet() {
    let bal = localStorage.getItem('wallet_balance');
    if (!bal) { bal = 245.50; localStorage.setItem('wallet_balance', bal); }
    document.getElementById('display-wallet-balance').innerText = '₹ ' + parseFloat(bal).toFixed(2);
}

function addFunds(amountObj = null) {
    let amount = amountObj || parseFloat(document.getElementById('topup-amount').value);
    if (amount > 0) {
        let current = parseFloat(localStorage.getItem('wallet_balance')) || 0;
        let newBal = current + amount;
        localStorage.setItem('wallet_balance', newBal);
        document.getElementById('display-wallet-balance').innerText = '₹ ' + newBal.toFixed(2);
        if (!amountObj) {
            document.getElementById('topup-amount').value = '';
            let btn = document.querySelector('.topup-btn');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
            setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Funds'; }, 2000);
        }
    }
}
initWallet();

function getThreshold(level) {
    if (level === 1) return 1;
    if (level === 2) return 3;
    if (level === 3) return 5;
    return 10;
}

function updateAvatarRing() {
    let thresh = getThreshold(currentLevel);
    let percentage = (travelsInLevel / thresh) * 100;
    let emptyColor = document.body.classList.contains('light-theme') ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    document.getElementById('avatar-ring').style.background = `conic-gradient(#007bff ${percentage}%, ${emptyColor} ${percentage}% 100%)`;
}

function updateUI() {
    let thresh = getThreshold(currentLevel);
    document.getElementById('reward-level').innerText = currentLevel;
    document.getElementById('reward-status').innerText = `Travel ${thresh - travelsInLevel} more times to reach Level ${currentLevel + 1}!`;

    document.getElementById('nav-co2').innerText = Math.floor(co2Points);

    let kgSaved = (co2Points / 100).toFixed(1);
    let profileCo2Elem = document.getElementById('profile-co2');
    if (profileCo2Elem) profileCo2Elem.innerText = kgSaved + " kg";
    let menuCo2Elem = document.getElementById('menu-co2');
    if (menuCo2Elem) menuCo2Elem.innerText = kgSaved + " kg";

    let profileTravelPtsElem = document.getElementById('profile-travel-pts');
    if (profileTravelPtsElem) profileTravelPtsElem.innerText = travelPoints + " Pts";
    let menuTravelPtsElem = document.getElementById('menu-travel-pts');
    if (menuTravelPtsElem) menuTravelPtsElem.innerText = travelPoints + " Pts";

    let profileMoneyElem = document.getElementById('profile-money-saved');
    let menuMoneyElem = document.getElementById('menu-money');
    if (profileMoneyElem && menuMoneyElem) menuMoneyElem.innerText = profileMoneyElem.innerText;

    let redeemElem = document.getElementById('redeem-travel-pts');
    if (redeemElem) redeemElem.innerText = travelPoints.toLocaleString();

    let trees = (co2Points / 1000).toFixed(1);
    let impactTextElem = document.getElementById('impact-trees-text');
    if (impactTextElem) {
        impactTextElem.innerHTML = `Your transit choices <b>${Math.floor(co2Points)} PTS = ${kgSaved} KG</b> the cooling effect of <b>${trees} trees</b>. (Minimum)`;
    }

    renderLeaderboard(currentLeaderboardTab);
    renderTracker();
    updateAvatarRing();
    if (document.getElementById('section-rewards').classList.contains('active')) renderInventory();
}

function renderTracker() {
    let tracker = document.getElementById('reward-tracker-ui');
    let html = '';
    let totalNodes = 5;
    let startLevel = Math.max(1, currentLevel - 2);

    for (let i = 0; i < totalNodes; i++) {
        let lvl = startLevel + i;
        let stateClass = lvl < currentLevel ? 'completed' : (lvl === currentLevel ? 'current' : '');
        let icon = lvl < currentLevel ? '<i class="fa-solid fa-check"></i>' : (lvl % 5 === 0 ? '<i class="fa-solid fa-gift"></i>' : lvl);
        html += `<div class="tracker-node ${stateClass}">${icon}<div class="node-label">Lvl ${lvl}</div></div>`;
    }
    tracker.innerHTML = `<div class="tracker-line"></div><div class="tracker-progress" id="tracker-progress-line"></div>` + html;

    let progressLineElem = document.getElementById('tracker-progress-line');
    if (progressLineElem) {
        let perc = ((currentLevel - startLevel) / (totalNodes - 1)) * 100;
        progressLineElem.style.width = `calc(${perc}% - 30px)`;
    }
}

function simulateTravel() {
    let thresh = getThreshold(currentLevel);
    travelsInLevel++;
    co2Points += 100;

    if (travelsInLevel >= thresh) {
        currentLevel++;
        travelsInLevel = 0;
        travelPoints += 10;

        document.getElementById('popup-level').innerText = currentLevel;
        document.getElementById('levelup-modal').classList.add('active');

        setTimeout(() => {
            document.getElementById('levelup-modal').classList.remove('active');

            let rand = Math.random();
            let rewardText = "";
            if (rand < 0.05) { rewardText = "Free Daily Pass!"; }
            else if (rand < 0.35) { rewardText = "+ 25 Travel Pts"; }
            else {
                let cashbacks = [1, 2, 5, 10, 20, 50];
                let amt = cashbacks[Math.floor(Math.random() * cashbacks.length)];
                rewardText = `₹${amt} Cashback`;
            }

            pendingRewardObj = { id: Date.now(), text: rewardText, dateGen: new Date().toLocaleDateString(), isActivated: false };
            fullInventory.unscratched.push(pendingRewardObj);
            saveData();

            pendingReward = rewardText;
            pendingCardIndex = fullInventory.unscratched.length - 1;

            openScratchCard(rewardText);
        }, 3500);
    } else {
        saveData();
        updateUI();
    }
}

function redeemPass(type) {
    if (type === 'daily' && travelPoints >= 1000) {
        travelPoints -= 1000;
        fullInventory.active.push({ id: Date.now(), text: "Daily Pass", expiry: getExpiryDate(1), isActivated: false });
        alert("Success: Daily Pass Redeemed!");
    } else if (type === 'monthly' && travelPoints >= 10000) {
        travelPoints -= 10000;
        fullInventory.active.push({ id: Date.now(), text: "Monthly Pass", expiry: getExpiryDate(30), isActivated: false });
        alert("Success: Monthly Pass Redeemed!");
    } else {
        alert("Not enough Travel Points. Keep traveling to earn more!");
        return;
    }
    saveData();
    updateUI();
}

function getExpiryDate(daysToAdd) {
    let d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString();
}

function promptActivatePass(id) {
    passToActivate = id;
    document.getElementById('pass-activation-modal').classList.add('active');
}

function confirmActivatePass() {
    let pass = fullInventory.active.find(p => p.id === passToActivate);
    if (pass) {
        pass.isActivated = true;
        saveData();
        renderInventory();
    }
    document.getElementById('pass-activation-modal').classList.remove('active');
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
    document.getElementById('scratch-prize-text').innerText = rewardText;
    document.getElementById('pre-scratch-btns').style.display = 'flex';
    document.getElementById('btn-claim-reward').style.display = 'none';
    document.getElementById('scratch-modal').classList.add('active');

    const canvas = document.getElementById('scratch-canvas');
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
    document.getElementById('pre-scratch-btns').style.display = 'none';
    document.getElementById('btn-claim-reward').style.display = 'block';
}

function autoScratch() {
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    triggerScratchComplete(ctx, canvas);
}

function scratchLater() {
    document.getElementById('scratch-modal').classList.remove('active');
    pendingReward = "";
    pendingCardIndex = -1;
    updateUI();
}

function claimReward() {
    if (pendingCardIndex === -1) return;

    let d = new Date().toLocaleDateString();
    let rewardText = pendingReward;

    fullInventory.unscratched.splice(pendingCardIndex, 1);

    if (rewardText.includes("Cashback")) {
        let match = rewardText.match(/\d+/);
        if (match) addFunds(parseInt(match[0]));
        fullInventory.scratched.unshift({ id: Date.now(), text: rewardText, claimDate: d });
    }
    else if (rewardText.includes("Travel Pts")) {
        travelPoints += 25;
        fullInventory.scratched.unshift({ id: Date.now(), text: rewardText, claimDate: d });
    }
    else if (rewardText.includes("Pass")) {
        fullInventory.active.unshift({ id: Date.now(), text: rewardText, expiry: getExpiryDate(7), isActivated: false });
    }

    rewardHistory.unshift({ date: d, desc: rewardText });

    pendingReward = "";
    pendingCardIndex = -1;

    saveData();
    updateUI();
    document.getElementById('scratch-modal').classList.remove('active');

    if (rewardText.includes("Pass")) switchInvTab('active');
    else switchInvTab('scratched');
}

function switchInvTab(tabName) {
    currentInvTab = tabName;
    document.querySelectorAll('.inv-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-inv-' + tabName).classList.add('active');
    renderInventory();
}

function renderInventory() {
    let grid = document.getElementById('inventory-grid');
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
        }
        else if (currentInvTab === 'active') {
            card.className = 'inv-active-card';
            let isPass = item.text.includes("Pass");

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
        }
        else if (currentInvTab === 'scratched') {
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
    document.getElementById('history-modal').classList.add('active');
}

function resetRewardsTesting() {
    if (confirm("Reset all reward progress?")) {
        currentLevel = 1; travelsInLevel = 0; co2Points = 5200; travelPoints = 0;
        rewardHistory = [];
        fullInventory = { unscratched: [], active: [], scratched: [] };
        localStorage.removeItem('wallet_balance');
        initWallet(); saveData(); updateUI();
    }
}

function saveData() {
    localStorage.setItem('reward_level', currentLevel);
    localStorage.setItem('reward_travels', travelsInLevel);
    localStorage.setItem('co2_points', co2Points);
    localStorage.setItem('travel_points', travelPoints);
    localStorage.setItem('reward_history', JSON.stringify(rewardHistory));
    localStorage.setItem('rta_inventory', JSON.stringify(fullInventory));
}

// --- CALENDAR LOGIC ---
let calDate = new Date();
const todayReal = new Date();
todayReal.setHours(0, 0, 0, 0);

const travelTypes = [
    'c-metro-purple', 'c-metro-green', 'c-metro-yellow', 'c-metro-pink', 'c-metro-blue',
    'c-bus-bmtc', 'c-bus-ksrtc',
    'c-kride-sampige', 'c-kride-mallige', 'c-kride-parijata', 'c-kride-kanaka',
    'empty', 'empty', 'empty'
];

function getFakeTravelType(dateString) {
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
    return travelTypes[Math.abs(hash) % travelTypes.length];
}

function getFakeDetailsHtml(type, dateStr) {
    if (type === 'empty') return `<div style="text-align:center; color:#94a3b8;"><i class="fa-solid fa-house-chimney" style="font-size:20px; margin-bottom:10px;"></i><br>No travel on ${dateStr}.</div>`;

    let html = `<b><i class="fa-regular fa-calendar"></i> ${dateStr}</b><br><div style="margin-top:10px; font-size:13px; display:flex; flex-direction:column; gap:8px;">`;

    if (type === 'c-metro-purple') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train-subway" style="color:#8b5cf6;"></i> Purple Line (Whitefield to MG Road)</span> <b>₹45</b></div>`;
    else if (type === 'c-metro-green') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train-subway" style="color:#22c55e;"></i> Green Line (Peenya to Majestic)</span> <b>₹30</b></div>`;
    else if (type === 'c-metro-yellow') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train-subway" style="color:#eab308;"></i> Yellow Line (RV Road to Silk Board)</span> <b>₹25</b></div>`;
    else if (type === 'c-metro-pink') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train-subway" style="color:#ec4899;"></i> Pink Line (Nagawara to MG Road)</span> <b>₹35</b></div>`;
    else if (type === 'c-metro-blue') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train-subway" style="color:#3b82f6;"></i> Blue Line (Silk Board to KR Puram)</span> <b>₹40</b></div>`;
    else if (type === 'c-bus-bmtc') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-bus" style="color:#0ea5e9;"></i> BMTC City Bus (Route 335-E)</span> <b>₹25</b></div>`;
    else if (type === 'c-bus-ksrtc') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-bus-simple" style="color:#ef4444;"></i> KSRTC Intercity (Majestic to Mysuru)</span> <b>₹160</b></div>`;
    else if (type === 'c-kride-sampige') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train" style="color:#dc2626;"></i> K-Ride Sampige (Majestic to Yelahanka)</span> <b>₹20</b></div>`;
    else if (type === 'c-kride-mallige') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train" style="color:#db2777;"></i> K-Ride Mallige (Hebbal to Yeshwanthpur)</span> <b>₹15</b></div>`;
    else if (type === 'c-kride-parijata') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train" style="color:#06b6d4;"></i> K-Ride Parijata (Kengeri to Whitefield)</span> <b>₹35</b></div>`;
    else if (type === 'c-kride-kanaka') html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span><i class="fa-solid fa-train" style="color:#d97706;"></i> K-Ride Kanaka (Carmelaram to Rajanukunte)</span> <b>₹30</b></div>`;

    html += `<div style="text-align:right; color:#22c55e; margin-top:5px; font-weight:bold;">+ 12 CO₂ Pts</div></div>`;
    return html;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('calendar-month-year').innerText = `${monthNames[calDate.getMonth()]} ${calDate.getFullYear()}`;

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

        if (checkDate >= new Date(2025, 0, 1) && checkDate.getTime() <= todayReal.getTime()) {
            let type = getFakeTravelType(dateStr);
            if (type !== 'empty') cell.classList.add(type);
            if (checkDate.getTime() === todayReal.getTime()) cell.classList.add('today');

            cell.addEventListener('click', () => {
                document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                document.getElementById('travel-details-box').innerHTML = getFakeDetailsHtml(type, dateStr);
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
    if (newYear < 2025 || (newYear === todayReal.getFullYear() && newMonth > todayReal.getMonth())) return;
    calDate.setMonth(newMonth); calDate.setFullYear(newYear);
    renderCalendar();
    document.getElementById('travel-details-box').innerHTML = `<div style="text-align: center; color: #94a3b8;"><i class="fa-solid fa-hand-pointer" style="font-size: 24px; margin-bottom: 10px;"></i><br>Click a date to view travel details.</div>`;
}

renderCalendar();
renderFriends();
renderRequests();
renderLeaderboard('friends');
updateUI();

// --- ANIMATED LIVE ADVISORY LOGIC ---
const liveAdvisories = [
    { icon: '<i class="fa-solid fa-cloud-bolt" style="color: #f59e0b;"></i>', temp: "26°C", cond: "Scattered Storms", alert: "<b>Alert:</b> Heavy rain at 5 PM. Metro recommended over buses." },
    { icon: '<i class="fa-solid fa-sun" style="color: #eab308;"></i>', temp: "31°C", cond: "Sunny", alert: "<b>Update:</b> Clear routes on Outer Ring Road. Normal bus operations." },
    { icon: '<i class="fa-solid fa-smog" style="color: #94a3b8;"></i>', temp: "22°C", cond: "Morning Mist", alert: "<b>Tip:</b> Low visibility near airport. Suburban rail is on time." },
    { icon: '<i class="fa-solid fa-droplet" style="color: #3b82f6;"></i>', temp: "24°C", cond: "Light Rain", alert: "<b>Alert:</b> Purple line experiencing slight delays due to signal issues." },
    { icon: '<i class="fa-solid fa-wind" style="color: #cbd5e1;"></i>', temp: "25°C", cond: "Breezy", alert: "<b>Update:</b> Excellent weather for cycling to your nearest metro station." },
    { icon: '<i class="fa-solid fa-temperature-arrow-up" style="color: #ef4444;"></i>', temp: "34°C", cond: "Hot", alert: "<b>Alert:</b> High temperatures. All AC BMTC Vajra buses running at full capacity." },
    { icon: '<i class="fa-solid fa-cloud" style="color: #94a3b8;"></i>', temp: "28°C", cond: "Cloudy", alert: "<b>Update:</b> Green line operations are completely normal." },
    { icon: '<i class="fa-solid fa-cloud-showers-heavy" style="color: #3b82f6;"></i>', temp: "23°C", cond: "Heavy Rain", alert: "<b>Alert:</b> Waterlogging at Silk Board. Avoid road travel; use Metro." },
    { icon: '<i class="fa-solid fa-snowflake" style="color: #06b6d4;"></i>', temp: "19°C", cond: "Cool Night", alert: "<b>Tip:</b> Last metro departs Majestic at 11:30 PM." },
    { icon: '<i class="fa-solid fa-bolt" style="color: #eab308;"></i>', temp: "25°C", cond: "Thunderstorms", alert: "<b>Alert:</b> K-Ride services delayed by 15 mins due to weather." }
];

const advisoryContainer = document.getElementById('advisory-container');
let currentAdvisoryIndex = 0;

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

function startAdvisoryProgress() {
    let fill = document.getElementById('advisory-progress-fill');
    fill.style.transition = 'none';
    fill.style.width = '0%';
    void fill.offsetWidth;
    fill.style.transition = 'width 25s linear';
    fill.style.width = '100%';
}

startAdvisoryProgress();

setInterval(() => {
    let slides = document.querySelectorAll('.advisory-slide');
    slides[currentAdvisoryIndex].classList.remove('active');

    currentAdvisoryIndex = (currentAdvisoryIndex + 1) % liveAdvisories.length;
    slides[currentAdvisoryIndex].classList.add('active');

    startAdvisoryProgress();
}, 25000);

// --- ANIMATED TIPS LOGIC ---
const transitTips = [
    "Buying a <b>Monthly Pass</b> saves an average commuter ₹450 and reduces ticket queue time by 2.5 hours per month!",
    "Riding <b>Namma Metro</b> reduces your carbon footprint by up to 75% compared to driving a private car.",
    "The <b>NCMC</b> card can be used seamlessly across Metro, BMTC buses, and even retail shopping.",
    "BMTC operates one of the largest fleets of <b>Electric Buses</b> in India, saving tons of CO₂ daily.",
    "<b>K-Ride (Suburban Rail)</b> will soon connect the city's outskirts with 4 dedicated corridors.",
    "A single full <b>Metro train</b> can carry up to 1,000 passengers, removing roughly 800 cars from roads!",
    "You can carry your <b>bicycle</b> on Namma Metro during non-peak hours to solve last-mile connectivity.",
    "<b>Travel Points</b> earned on the RTA app can be redeemed directly for free Daily or Monthly passes.",
    "Standing on the <b>left side</b> of the metro escalator allows passengers in a hurry to walk on the right.",
    "BMTC’s <b>Vayu Vajra</b> (Airport buses) operate 24/7, providing safe and cost-effective travel to KIAL.",
    "Switching off your vehicle engine at traffic signals of 60+ seconds saves fuel and reduces pollution.",
    "The <b>Purple Line</b> is the first underground metro line in South India, stretching 4.8 km under the city center.",
    "Always let passengers <b>exit the train first</b> before boarding. It makes the boarding process much faster!",
    "Purchasing <b>QR Tickets</b> on your phone completely eliminates paper waste and saves you from standing in lines.",
    "The upcoming <b>Yellow Line</b> will feature driverless train technology (CBTC), a first for Namma Metro!",
    "<b>Carpooling</b> to a metro station with your neighbors can cut your daily commute costs by another 30%.",
    "Priority seating on buses and metros is strictly reserved for the elderly, pregnant women, and differently-abled.",
    "Using the <b>Smart Wallet</b> for your daily transit gives you a flat 5% discount on all Namma Metro fares.",
    "The upcoming <b>Blue Line</b> will directly connect Central Silk Board to Kempegowda International Airport.",
    "Public transport is historically up to <b>10 times safer</b> per mile than traveling in a personal two-wheeler."
];

const tipDisplay = document.getElementById('tip-text-display');
let currentTipIndex = 0;

tipDisplay.innerHTML = transitTips[0];

function startTipProgress() {
    let fill = document.getElementById('tip-progress-fill');
    fill.style.transition = 'none';
    fill.style.width = '0%';
    void fill.offsetWidth;
    fill.style.transition = 'width 10s linear';
    fill.style.width = '100%';
}

startTipProgress();

setInterval(() => {
    tipDisplay.classList.add('fade-out');
    setTimeout(() => {
        currentTipIndex = (currentTipIndex + 1) % transitTips.length;
        tipDisplay.innerHTML = transitTips[currentTipIndex];
        tipDisplay.classList.remove('fade-out');
        startTipProgress();
    }, 500);
}, 10000);

// Default to Status view on mobile initialization
if (window.innerWidth <= 768) {
    switchTab('status');
}