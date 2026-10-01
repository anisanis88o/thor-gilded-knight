"use strict";
(() => {
  const W = 960,
    H = 540,
    RS = 1.25,
    GROUND = 470,
    WORLD = 1800,
    DT = 1 / 60;
  let layerScale = RS;
  const GRAV = 2300,
    JUMPV = 900,
    PARRY_WIN = 0.28,
    RONIN_DEFLECT_WIN = 0.58,
    BEAM_H = 78;
  const HERO_SRC = "assets/hero.jpg",
    BOSS_SRC = "assets/boss.jpg",
    ART1_SRC = "assets/art1.png",
    ART2_SRC = "assets/art2.png",
    SHADOW_SRC = "assets/shadow.png",
    RONIN_SRC = "assets/red_ronin.jpg",
    REGAL_SRC = "assets/metal_regal.jpg",
    WIZARD_SRC = "assets/wizard.jpg",
    KILLNUX_SRC = "assets/killnux_portrait.png",
    SHOGUN_SRC = "assets/infernal_shogun.jpg",
    SHOGUN_P2_SRC = "assets/shogun_phase2.jpg",
    VOLTURUS1_SRC = "assets/volturus_phase1.png",
    VOLTURUS2_SRC = "assets/volturus_phase2.png",
    VOLTURUS3_SRC = "assets/volturus_phase3.png",
    VOLTURUS_MENU_SRC = "assets/boss5_selection.png",
    WRAITH_SRC = "assets/wraith_portrait.png",
    WRAITH_MENU_SRC = "assets/boss6_selection.png",
    WARDEN_SRC = "assets/warden_portrait.png",
    WARDEN_MENU_SRC = "assets/boss7_selection.png",
    WRAITH_KNIGHT_SRC = "assets/wraithspike_portrait.png",
    THOR_SRC = "assets/thor_hero.png",
    SPIRE_SRC = "assets/spire_knight_portrait.png",
    SPIRE_ARENA_SRC = "assets/gothic_eclipse_arena.png",
    ART_MENU_SRC = "assets/artorias_menu.png";
  const DEMON_FACE_SRC = "assets/demon_face_pixel.png";
  let heroType = "knight",
    heroType2 = "killnux",
    gameMode = "solo",
    activePlayerIndex = 0;
  const $ = (id) => document.getElementById(id);
  const cv = $("c"),
    ctx = cv.getContext("2d");
  cv.width = W * RS;
  cv.height = H * RS;
  const stage = $("stage");
  function fit() {
    stage.style.setProperty("--u", (stage.clientWidth / W).toFixed(4));
  }
  addEventListener("resize", fit);
  fit();

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - (1 - t) * (1 - t);
  const TAU = Math.PI * 2;
  const REVIVE_TIME = 2.4;
  const REVIVE_RANGE = 118;
  function sweptXHits(x0, x1, targetX, padding) {
    return (
      Math.max(x0, x1) + padding >= targetX &&
      Math.min(x0, x1) - padding <= targetX
    );
  }

  /* ================= PROFILE, RELICS, SHOP & VIDEO ================= */
  const RARITIES = [
    { id: "common", name: "Common", chance: 50, color: "Grey" },
    { id: "rare", name: "Rare", chance: 30, color: "Blue" },
    { id: "mythic", name: "Mythic", chance: 15, color: "Purple" },
    { id: "legendary", name: "Legendary", chance: 4, color: "Yellow" },
    { id: "anis", name: "Anis", chance: 1, color: "Red" },
  ];
  const RELICS = [
    {
      id: "attack",
      name: "Dull Fang",
      effect: "Attack damage +5%",
      rarity: "common",
      dropChance: 10,
      mods: { attack: 0.05 },
    },
    {
      id: "stamina",
      name: "Pale Current",
      effect: "Maximum stamina +10",
      rarity: "common",
      dropChance: 10,
      mods: { stamina: 10 },
    },
    {
      id: "defense",
      name: "Stone Veil",
      effect: "Defense +5%",
      rarity: "common",
      dropChance: 10,
      mods: { defense: 0.05 },
    },
    {
      id: "health",
      name: "Grey Heart",
      effect: "Maximum health +20",
      rarity: "common",
      dropChance: 10,
      mods: { health: 20 },
    },
    {
      id: "cooldown",
      name: "Quiet Hourglass",
      effect: "Skill recovery +5%",
      rarity: "common",
      dropChance: 10,
      mods: { cooldown: 0.05 },
    },
    {
      id: "skill_attack",
      name: "Ashen Sigil",
      effect: "Skill attack power +5%",
      rarity: "common",
      mods: { skillAttack: 0.05 },
    },
    {
      id: "stamina_recovery",
      name: "Wind Coil",
      effect: "Stamina recovery +5%",
      rarity: "common",
      mods: { staminaRecovery: 0.05 },
    },
    {
      id: "healing",
      name: "Pilgrim Chalice",
      effect: "Flask healing +5%",
      rarity: "common",
      mods: { healing: 0.05 },
    },
    {
      id: "rare_attack",
      name: "Azure Fang",
      effect: "Attack damage +15%",
      rarity: "rare",
      dropChance: 6,
      mods: { attack: 0.15 },
    },
    {
      id: "rare_defense",
      name: "Tideguard Veil",
      effect: "Defense +15%",
      rarity: "rare",
      dropChance: 6,
      mods: { defense: 0.15 },
    },
    {
      id: "rare_health",
      name: "Blue Heart",
      effect: "Maximum health +40",
      rarity: "rare",
      dropChance: 6,
      mods: { health: 40 },
    },
    {
      id: "rare_cooldown",
      name: "Swift Sapphire",
      effect: "Skill recovery +15%",
      rarity: "rare",
      dropChance: 6,
      mods: { cooldown: 0.15 },
    },
    {
      id: "rare_stamina",
      name: "Storm Current",
      effect: "Maximum stamina +30",
      rarity: "rare",
      dropChance: 6,
      mods: { stamina: 30 },
    },
    {
      id: "rare_skill_attack",
      name: "Azure Sigil",
      effect: "Skill attack power +15%",
      rarity: "rare",
      mods: { skillAttack: 0.15 },
    },
    {
      id: "rare_stamina_recovery",
      name: "Tempest Coil",
      effect: "Stamina recovery +15%",
      rarity: "rare",
      mods: { staminaRecovery: 0.15 },
    },
    {
      id: "rare_healing",
      name: "Moon Chalice",
      effect: "Flask healing +15%",
      rarity: "rare",
      mods: { healing: 0.15 },
    },
    {
      id: "mythic_attack",
      name: "Abyssal Claw",
      effect: "Attack damage +30%",
      rarity: "mythic",
      dropChance: 3,
      mods: { attack: 0.3 },
    },
    {
      id: "mythic_defense",
      name: "Violet Bastion",
      effect: "Defense +30%",
      rarity: "mythic",
      dropChance: 3,
      mods: { defense: 0.3 },
    },
    {
      id: "mythic_cooldown",
      name: "Chronomancer Shard",
      effect: "Skill recovery +30%",
      rarity: "mythic",
      dropChance: 3,
      mods: { cooldown: 0.3 },
    },
    {
      id: "mythic_health",
      name: "Amethyst Heart",
      effect: "Maximum health +80",
      rarity: "mythic",
      dropChance: 3,
      mods: { health: 80 },
    },
    {
      id: "mythic_stamina",
      name: "Astral Current",
      effect: "Maximum stamina +70",
      rarity: "mythic",
      dropChance: 3,
      mods: { stamina: 70 },
    },
    {
      id: "mythic_skill_attack",
      name: "Arcane Sigil",
      effect: "Skill attack power +30%",
      rarity: "mythic",
      mods: { skillAttack: 0.3 },
    },
    {
      id: "mythic_stamina_recovery",
      name: "Astral Coil",
      effect: "Stamina recovery +30%",
      rarity: "mythic",
      mods: { staminaRecovery: 0.3 },
    },
    {
      id: "mythic_healing",
      name: "Amethyst Chalice",
      effect: "Flask healing +30%",
      rarity: "mythic",
      mods: { healing: 0.3 },
    },
    {
      id: "legendary_attack",
      name: "Sunlord Fang",
      effect: "Attack damage +50%",
      rarity: "legendary",
      dropChance: 0.8,
      mods: { attack: 0.5 },
    },
    {
      id: "legendary_defense",
      name: "Golden Aegis",
      effect: "Defense +50%",
      rarity: "legendary",
      dropChance: 0.8,
      mods: { defense: 0.5 },
    },
    {
      id: "legendary_cooldown",
      name: "Eternal Hourglass",
      effect: "Skill recovery +50%",
      rarity: "legendary",
      dropChance: 0.8,
      mods: { cooldown: 0.5 },
    },
    {
      id: "legendary_health",
      name: "Radiant Heart",
      effect: "Maximum health +120",
      rarity: "legendary",
      dropChance: 0.8,
      mods: { health: 120 },
    },
    {
      id: "legendary_stamina",
      name: "Lion Current",
      effect: "Maximum stamina +100",
      rarity: "legendary",
      dropChance: 0.8,
      mods: { stamina: 100 },
    },
    {
      id: "legendary_skill_attack",
      name: "Solar Sigil",
      effect: "Skill attack power +50%",
      rarity: "legendary",
      mods: { skillAttack: 0.5 },
    },
    {
      id: "legendary_stamina_recovery",
      name: "Golden Coil",
      effect: "Stamina recovery +50%",
      rarity: "legendary",
      mods: { staminaRecovery: 0.5 },
    },
    {
      id: "legendary_healing",
      name: "Grail of Grace",
      effect: "Flask healing +50%",
      rarity: "legendary",
      mods: { healing: 0.5 },
    },
    {
      id: "anis_attack",
      name: "Anis Bloodfang",
      effect: "Attack damage +100%",
      rarity: "anis",
      dropChance: 0.2,
      mods: { attack: 1 },
    },
    {
      id: "anis_defense",
      name: "Anis Absolute",
      effect: "Defense +100%",
      rarity: "anis",
      dropChance: 0.2,
      mods: { defense: 1 },
    },
    {
      id: "anis_cooldown",
      name: "Anis Eternity",
      effect: "Skill recovery +100%",
      rarity: "anis",
      dropChance: 0.2,
      mods: { cooldown: 1 },
    },
    {
      id: "anis_health",
      name: "Anis Bloodheart",
      effect: "Maximum health +200",
      rarity: "anis",
      dropChance: 0.2,
      mods: { health: 200 },
    },
    {
      id: "anis_stamina",
      name: "Anis Red Current",
      effect: "Maximum stamina +150",
      rarity: "anis",
      dropChance: 0.2,
      mods: { stamina: 150 },
    },
    {
      id: "anis_skill_attack",
      name: "Bloodmoon Sigil",
      effect: "Skill attack power +100%",
      rarity: "anis",
      mods: { skillAttack: 1 },
    },
    {
      id: "anis_stamina_recovery",
      name: "Anis Vortex",
      effect: "Stamina recovery +100%",
      rarity: "anis",
      mods: { staminaRecovery: 1 },
    },
    {
      id: "anis_healing",
      name: "Crimson Grail",
      effect: "Flask healing +100%",
      rarity: "anis",
      mods: { healing: 1 },
    },
    {
      id: "hardy_relic",
      name: "Hardy Relic",
      effect: "All eight Anis powers in one relic",
      rarity: "anis",
      dropChance: 0.01,
      hardy: true,
      mods: {
        attack: 1,
        defense: 1,
        cooldown: 1,
        health: 200,
        stamina: 150,
        skillAttack: 1,
        staminaRecovery: 1,
        healing: 1,
      },
    },
  ];
  let profile = {
      coins: 0,
      inventory: {},
      slots: [null, null, null],
      resolution: "1280x720",
      graphics: "high",
      hero: "knight",
      consoleKey: "Backquote",
    },
    selectedRelic = null,
    spinLocked = false;
  function loadProfile() {
    try {
      const x = JSON.parse(localStorage.getItem("gilded_profile_v1") || "null");
      if (x && typeof x === "object")
        profile = {
          ...profile,
          ...x,
          inventory: { ...(x.inventory || {}) },
          slots: Array.isArray(x.slots)
            ? x.slots.slice(0, 3)
            : [null, null, null],
        };
    } catch (e) {}
    while (profile.slots.length < 3) profile.slots.push(null);
    profile.coins = Math.max(0, Math.floor(+profile.coins || 0));
    if (!["low", "medium", "high"].includes(profile.graphics))
      profile.graphics = "high";
    const validRes = [
      "800x600",
      "1152x864",
      "1280x1024",
      "1280x720",
      "1600x900",
      "1680x1050",
      "1280x800",
      "1920x1080",
    ];
    if (typeof profile.resolution === "number")
      profile.resolution = profile.resolution > 1 ? "1600x900" : "1280x720";
    if (!validRes.includes(profile.resolution)) profile.resolution = "1280x720";
    if (typeof profile.consoleKey !== "string")
      profile.consoleKey = "Backquote";
    if (["knight", "shadow", "ronin", "regal", "wizard", "killnux", "wraithknight", "thor"].includes(profile.hero))
      heroType = profile.hero;
  }
  function saveProfile() {
    try {
      localStorage.setItem("gilded_profile_v1", JSON.stringify(profile));
    } catch (e) {}
  }
  function relicById(id) {
    return RELICS.find((r) => r.id === id);
  }
  function rarityById(id) {
    return RARITIES.find((r) => r.id === id) || RARITIES[0];
  }
  function equippedCount(id) {
    return profile.slots.filter((x) => x === id).length;
  }
  function buildBonuses() {
    const out = {
      attack: 0,
      stamina: 0,
      defense: 0,
      health: 0,
      cooldown: 0,
      skillAttack: 0,
      staminaRecovery: 0,
      healing: 0,
    };
    for (const id of profile.slots) {
      const r = relicById(id);
      if (!r) continue;
      for (const k in r.mods) out[k] += r.mods[k] || 0;
    }
    return out;
  }
  function qualityFactor() {
    return profile.graphics === "low"
      ? 0.2
      : profile.graphics === "medium"
        ? 0.55
        : 1;
  }
  function applyVideoSettings() {
    const m = /^(\d+)x(\d+)$/.exec(profile.resolution) || ["", 1280, 720],
      rw = +m[1],
      rh = +m[2],
      requestedFactor =
        profile.graphics === "low"
          ? 0.5
          : profile.graphics === "medium"
            ? 0.75
            : 1,
      renderFactor = Math.max(requestedFactor, 480 / rw),
      internalW = Math.round(rw * renderFactor),
      internalH = Math.round(rh * renderFactor);
    cv.width = internalW;
    cv.height = internalH;
    layerScale =
      profile.graphics === "low"
        ? 0.45
        : profile.graphics === "medium"
          ? 0.8
          : 1.25;
    stage.style.setProperty("--aspect", String(rw / rh));
    stage.classList.remove("quality-low", "quality-medium", "quality-high");
    stage.classList.add("quality-" + profile.graphics);
    stage.classList.add("res-changing");
    setTimeout(() => stage.classList.remove("res-changing"), 320);
    fit();
    if ($("resolutionScale")) $("resolutionScale").value = profile.resolution;
    if ($("graphicsMode")) $("graphicsMode").value = profile.graphics;
    if ($("renderInfo"))
      $("renderInfo").textContent =
        "Display " +
        rw +
        " × " +
        rh +
        " · Internal render " +
        internalW +
        " × " +
        internalH +
        " (" +
        Math.round(renderFactor * 100) +
        "%)";
  }
  function updateCoinLabels() {
    if ($("menuCoins")) $("menuCoins").textContent = profile.coins + " COINS";
    if ($("shopCoins")) $("shopCoins").textContent = profile.coins;
  }
  function toast(msg) {
    const d = document.createElement("div");
    d.className = "relic-toast";
    d.textContent = msg;
    stage.appendChild(d);
    setTimeout(() => d.remove(), 1600);
  }
  function heroDisplayName() {
    return heroType === "shadow"
      ? "Shadow"
      : heroType === "ronin"
        ? "Crimson Ronin"
        : heroType === "regal"
          ? "Metal Regal"
          : heroType === "wizard"
            ? "The Arcane Wizard"
            : heroType === "killnux"
              ? "Killnux"
              : heroType === "wraithknight"
                ? "Purple Wraithspike Knight"
              : heroType === "thor"
                ? "Thor, the Stormbringer"
              : "The Gilded Knight";
  }
  function hideFrontScreens() {
    ["title", "bossSelect", "loadout", "shop", "multiplayerLobby"].forEach(
      (id) => $(id) && $(id).classList.add("hide"),
    );
  }
  function showFrontScreen(id) {
    hideFrontScreens();
    $(id).classList.remove("hide");
    phase = "title";
    updateCoinLabels();
    if (id === "loadout") renderLoadout();
    if (id === "shop") renderShop();
    if (id === "bossSelect" && $("bossHeroName"))
      $("bossHeroName").textContent = heroDisplayName();
  }
  function relicShape(r) {
    if (!r) return "shard";
    if (r.hardy) return "hardy";
    const m = r.mods || {};
    return m.skillAttack
      ? "sigil"
      : m.staminaRecovery
        ? "coil"
        : m.healing
          ? "chalice"
          : m.attack
            ? "shard"
            : m.defense
              ? "bastion"
              : m.health
                ? "heart"
                : m.cooldown
                  ? "hourglass"
                  : "current";
  }
  function crystalHTML(r) {
    return (
      '<span class="crystal rarity-' +
      (r ? r.rarity : "common") +
      " shape-" +
      relicShape(r) +
      '"><i></i></span>'
    );
  }
  function relicDropChance(r) {
    if (r.hardy) return "0.01%";
    const q = rarityById(r.rarity),
      n = RELICS.filter((x) => x.rarity === r.rarity && !x.hardy).length,
      v = q.chance / n;
    return Math.round(v * 1000) / 1000 + "%";
  }
  function renderLoadout() {
    const slots = $("relicSlots"),
      inv = $("relicInventory");
    if (!slots || !inv) return;
    slots.innerHTML = "";
    inv.innerHTML = "";
    profile.slots.forEach((id, i) => {
      const r = relicById(id),
        b = document.createElement("button");
      b.className = "relic-slot" + (r ? " filled rarity-" + r.rarity : "");
      b.innerHTML = r
        ? crystalHTML(r) +
          "<b>" +
          r.name +
          "</b><small>" +
          rarityById(r.rarity).name +
          "</small>"
        : "CASE " + (i + 1) + "<b>EMPTY</b>";
      b.onclick = () => {
        if (r) {
          profile.slots[i] = null;
          saveProfile();
          renderLoadout();
          return;
        }
        if (!selectedRelic) return;
        const owned = profile.inventory[selectedRelic] || 0,
          used = equippedCount(selectedRelic);
        if (used >= owned) {
          toast("No unequipped copy available");
          return;
        }
        profile.slots[i] = selectedRelic;
        saveProfile();
        renderLoadout();
      };
      slots.appendChild(b);
    });
    let any = false;
    for (const r of RELICS) {
      const n = profile.inventory[r.id] || 0;
      if (!n) continue;
      any = true;
      const used = equippedCount(r.id),
        b = document.createElement("button");
      b.className =
        "inv-relic rarity-" +
        r.rarity +
        (selectedRelic === r.id ? " selected" : "");
      b.innerHTML =
        crystalHTML(r) +
        "<span><b>" +
        r.name +
        "</b> <i>" +
        rarityById(r.rarity).name +
        "</i><br>" +
        r.effect +
        " · equipped " +
        used +
        "</span><strong>x" +
        n +
        "</strong>";
      b.onclick = () => {
        selectedRelic = r.id;
        renderLoadout();
      };
      inv.appendChild(b);
    }
    if (!any)
      inv.innerHTML =
        '<div class="empty-state">No relics yet. Visit the Relic Shop after earning coins.</div>';
    const q = buildBonuses();
    $("buildStats").innerHTML = [
      ["ATK", "+" + Math.round(q.attack * 100) + "%"],
      ["SKL", "+" + Math.round(q.skillAttack * 100) + "%"],
      ["STA", "+" + q.stamina],
      ["ST-R", "+" + Math.round(q.staminaRecovery * 100) + "%"],
      ["DEF", "+" + Math.round(q.defense * 100) + "%"],
      ["HP", "+" + q.health],
      ["HEAL", "+" + Math.round(q.healing * 100) + "%"],
      ["REC", "+" + Math.round(q.cooldown * 100) + "%"],
    ]
      .map(
        (x) => '<div class="build-stat">' + x[0] + "<b>" + x[1] + "</b></div>",
      )
      .join("");
  }
  function renderShop() {
    updateCoinLabels();
    const list = $("shopRelicList"),
      inv = $("shopInventory");
    if (!list || !inv) return;
    const listTop = list.scrollTop,
      invTop = inv.scrollTop;
    list.innerHTML = RARITIES.map(
      (q) =>
        '<div class="rarity-heading rarity-' +
        q.id +
        '"><b>' +
        q.name.toUpperCase() +
        "</b><span>" +
        q.chance +
        "% TOTAL</span></div>" +
        RELICS.filter((r) => r.rarity === q.id)
          .sort((a, b) => Number(!!b.hardy) - Number(!!a.hardy))
          .map(
            (r) =>
              '<div class="shop-relic rarity-' +
              r.rarity +
              '">' +
              crystalHTML(r) +
              "<span><b>" +
              r.name +
              "</b><br>" +
              r.effect +
              '</span><span class="chance">' +
              relicDropChance(r) +
              "</span></div>",
          )
          .join(""),
    ).join("");
    inv.innerHTML = "";
    let any = false;
    for (const r of RELICS) {
      const n = profile.inventory[r.id] || 0;
      if (!n) continue;
      any = true;
      const row = document.createElement("div");
      row.className = "shop-relic rarity-" + r.rarity;
      row.innerHTML =
        crystalHTML(r) +
        "<span><b>" +
        r.name +
        "</b> <i>" +
        rarityById(r.rarity).name +
        "</i><br>Owned x" +
        n +
        " · equipped " +
        equippedCount(r.id) +
        "</span>";
      if (r.rarity === "common") {
        const b = document.createElement("button");
        b.className = "sell-btn";
        b.textContent = "SELL +40";
        b.onclick = () => sellRelic(r.id);
        row.appendChild(b);
      } else if (h.kind === "portal") {
        if (h.t > h.life) wardenHazards.splice(i, 1);
      } else {
        const badge = document.createElement("span");
        badge.className = "keep-badge";
        badge.textContent = rarityById(r.rarity).name;
        row.appendChild(badge);
      }
      inv.appendChild(row);
    }
    if (!any)
      inv.innerHTML =
        '<div class="empty-state">Your collection is empty.</div>';
    $("spinRelic").disabled = profile.coins < 100 || spinLocked;
    requestAnimationFrame(() => {
      list.scrollTop = listTop;
      inv.scrollTop = invTop;
    });
  }
  function rollRelic() {
    const hardy = RELICS.find((r) => r.hardy);
    if (hardy && Math.random() < 0.0001) return hardy;
    let roll = Math.random() * 100,
      rarity = "common",
      sum = 0;
    for (const q of RARITIES) {
      sum += q.chance;
      if (roll < sum) {
        rarity = q.id;
        break;
      }
    }
    const pool = RELICS.filter((r) => r.rarity === rarity && !r.hardy);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function spinRelic() {
    if (spinLocked) return;
    if (profile.coins < 100) {
      toast("You need 100 coins");
      return;
    }
    profile.coins -= 100;
    spinLocked = true;
    saveProfile();
    renderShop();
    const crystal = $("spinCrystal");
    crystal.className = "spin-crystal spinning";
    $("spinResult").textContent = "The crystal is turning…";
    setTimeout(() => {
      const r = rollRelic(),
        q = rarityById(r.rarity);
      profile.inventory[r.id] = (profile.inventory[r.id] || 0) + 1;
      spinLocked = false;
      saveProfile();
      $("spinResult").innerHTML =
        '<strong class="rarity-text-' +
        r.rarity +
        '">' +
        q.name.toUpperCase() +
        "</strong><br><b>" +
        r.name +
        "</b><br>" +
        r.effect;
      crystal.className =
        "spin-crystal rarity-" + r.rarity + " spin-shape-" + relicShape(r);
      renderShop();
      toast(q.name + " relic acquired: " + r.name);
    }, 850);
  }
  function sellRelic(id) {
    const r = relicById(id);
    if (!r || r.rarity !== "common") {
      toast("Only Common relics can be sold right now");
      return;
    }
    const n = profile.inventory[id] || 0,
      used = equippedCount(id);
    if (n <= used) {
      toast("Unequip this relic before selling it");
      return;
    }
    profile.inventory[id] = n - 1;
    profile.coins += 40;
    saveProfile();
    renderShop();
    toast("Common relic sold for 40 coins");
  }
  function awardCoins(n) {
    profile.coins += n;
    saveProfile();
    updateCoinLabels();
  }
  loadProfile();

  const imgHero = new Image(),
    imgBoss = new Image();
  const imgArt = new Image();
  imgArt.src = ART1_SRC;
  const imgShadowHero = new Image();
  imgShadowHero.src = SHADOW_SRC;
  const imgRoninHero = new Image();
  imgRoninHero.src = RONIN_SRC;
  const imgRegalHero = new Image();
  imgRegalHero.src = REGAL_SRC;
  const imgWizardHero = new Image();
  imgWizardHero.src = WIZARD_SRC;
  const imgKillnuxHero = new Image();
  imgKillnuxHero.src = KILLNUX_SRC;
  const imgWraithKnightHero = new Image();
  imgWraithKnightHero.src = WRAITH_KNIGHT_SRC;
  const imgThorHero = new Image();
  imgThorHero.src = THOR_SRC;
  // If the supplied Thor artwork is not present in game/assets, fall back to a
  // procedurally drawn storm portrait so his card and HUD portrait always show.
  imgThorHero.onerror = () => {
    imgThorHero.onerror = null;
    imgThorHero.src = makeThorFallbackPortrait();
    if ($("cThor"))
      $("cThor").style.backgroundImage = "url('" + imgThorHero.src + "')";
  };
  const imgShogun = new Image();
  imgShogun.src = SHOGUN_SRC;
  const imgShogunP2 = new Image();
  imgShogunP2.src = SHOGUN_P2_SRC;
  const imgVolturus1 = new Image();
  imgVolturus1.src = VOLTURUS1_SRC;
  const imgVolturus2 = new Image();
  imgVolturus2.src = VOLTURUS2_SRC;
  const imgVolturus3 = new Image();
  imgVolturus3.src = VOLTURUS3_SRC;
  const imgWraith = new Image();
  imgWraith.src = WRAITH_SRC;
  const imgWarden = new Image();
  imgWarden.src = WARDEN_SRC;
  const imgSpire = new Image();
  imgSpire.src = SPIRE_SRC;
  const imgSpireArena = new Image();
  imgSpireArena.src = SPIRE_ARENA_SRC;
  imgSpireArena.onload = () => { LAY.spfar = null; ensureSpireBG(); };
  const imgDemonFace = new Image();
  imgDemonFace.src = DEMON_FACE_SRC;
  imgHero.src = HERO_SRC;
  imgBoss.src = BOSS_SRC;
  if ($("cSent")) {
    $("cSent").style.backgroundImage = "url('" + BOSS_SRC + "')";
    $("cArt").style.backgroundImage = "url('" + ART_MENU_SRC + "')";
    $("cShogun").style.backgroundImage = "url('" + SHOGUN_SRC + "')";
    $("cVolturus").style.backgroundImage = "url('" + VOLTURUS_MENU_SRC + "')";
    $("cWraith").style.backgroundImage = "url('" + WRAITH_MENU_SRC + "')";
    $("cWarden").style.backgroundImage = "url('" + WARDEN_MENU_SRC + "')";
    if ($("cSpire")) $("cSpire").style.backgroundImage = "url('" + SPIRE_SRC + "')";
  }
  if ($("cShadow")) {
    $("cShadow").style.backgroundImage = "url('" + SHADOW_SRC + "')";
    $("cKnight").style.backgroundImage = "url('" + HERO_SRC + "')";
    $("cRonin").style.backgroundImage = "url('" + RONIN_SRC + "')";
    $("cRegal").style.backgroundImage = "url('" + REGAL_SRC + "')";
    $("cWizard").style.backgroundImage = "url('" + WIZARD_SRC + "')";
    $("cKillnux").style.backgroundImage = "url('" + KILLNUX_SRC + "')";
    $("cWraithKnight").style.backgroundImage = "url('" + WRAITH_KNIGHT_SRC + "')";
    if ($("cThor")) $("cThor").style.backgroundImage = "url('" + THOR_SRC + "')";
  }

  /* ================= AUDIO ================= */
  let AC = null,
    muted = false;
  function ac() {
    if (!AC) {
      try {
        AC = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        AC = null;
      }
      if (AC) initAudioGraph(AC);
    }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  }
  function tone(f, d, type, v, slide, delay) {
    const a = AC;
    if (!a || muted) return;
    const t = a.currentTime + (delay || 0);
    const o = a.createOscillator(),
      g = a.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (slide)
      o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
    g.gain.setValueAtTime(v || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(sfxBus || a.destination);
    o.start(t);
    o.stop(t + d + 0.03);
  }
  function noise(d, v, f, kind, slide, delay) {
    const a = AC;
    if (!a || muted) return;
    const t = a.currentTime + (delay || 0);
    const s = a.createBufferSource();
    s.buffer = getNoise(a);
    s.loop = true;
    const fl = a.createBiquadFilter();
    fl.type = kind || "lowpass";
    fl.frequency.setValueAtTime(f || 1000, t);
    if (slide)
      fl.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + d);
    const g = a.createGain();
    g.gain.setValueAtTime(v || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl);
    fl.connect(g);
    g.connect(sfxBus || a.destination);
    s.start(t);
    s.stop(t + d + 0.03);
  }
  function sfx(n) {
    if (!AC || muted) return;
    switch (n) {
      case "swing":
        noise(0.16, 0.16, 2600, "bandpass", -1800);
        break;
      case "bswing":
        noise(0.28, 0.24, 900, "bandpass", -500);
        tone(90, 0.25, "sawtooth", 0.05, -40);
        break;
      case "hit":
        noise(0.12, 0.3, 1800, "lowpass", -1200);
        tone(160, 0.12, "square", 0.09, -90);
        break;
      case "hurt":
        noise(0.25, 0.35, 900, "lowpass", -600);
        tone(110, 0.3, "sawtooth", 0.12, -70);
        break;
      case "parry":
        tone(1500, 0.5, "triangle", 0.16, -300);
        tone(2300, 0.35, "sine", 0.1, -600);
        noise(0.08, 0.25, 4000, "highpass");
        tone(200, 0.2, "square", 0.08, -100);
        break;
      case "boom":
        noise(1.1, 0.55, 500, "lowpass", -380);
        tone(70, 0.9, "sine", 0.4, -45);
        break;
      case "charge":
        tone(110, 1.1, "sawtooth", 0.06, 520);
        tone(220, 1.1, "sine", 0.07, 700);
        break;
      case "beam":
        noise(0.6, 0.4, 3000, "bandpass", -2000);
        tone(180, 0.5, "sawtooth", 0.18, -80);
        tone(360, 0.5, "square", 0.06, -120);
        break;
      case "heal":
        tone(520, 0.5, "sine", 0.11, 260);
        tone(780, 0.5, "sine", 0.08, 300, 0.1);
        tone(1040, 0.5, "sine", 0.06, 200, 0.2);
        break;
      case "dodge":
        noise(0.2, 0.12, 1200, "bandpass", -700);
        break;
      case "jump":
        tone(200, 0.12, "sine", 0.05, 120);
        break;
      case "roar":
        noise(1.2, 0.4, 500, "lowpass", -300);
        tone(60, 1.2, "sawtooth", 0.18, 30);
        break;
      case "demonRoar":
        noise(2.0, 0.55, 620, "lowpass", -480);
        noise(1.4, 0.24, 1700, "bandpass", -1200, 0.12);
        tone(46, 1.9, "sawtooth", 0.26, 24);
        tone(72, 1.3, "square", 0.08, -30, 0.18);
        break;
      case "crack":
        noise(0.48, 0.42, 850, "lowpass", -650);
        tone(48, 0.55, "sine", 0.28, -18);
        break;
      case "knife":
        noise(0.13, 0.18, 3400, "highpass", -1800);
        tone(640, 0.12, "sawtooth", 0.05, -280);
        break;
      case "die":
        tone(300, 1.6, "sawtooth", 0.12, -250);
        noise(1.6, 0.3, 800, "lowpass", -700);
        break;
      case "win":
        tone(392, 1, "triangle", 0.1);
        tone(523, 1.2, "triangle", 0.1, 0, 0.25);
        tone(659, 1.6, "triangle", 0.1, 0, 0.5);
        break;
      case "plunge":
        noise(0.35, 0.2, 1500, "lowpass", -1000);
        break;
      case "skill1":
        tone(700, 0.05, "triangle", 0.05, 200);
        tone(1500, 0.3, "triangle", 0.13, 900);
        noise(0.22, 0.22, 4500, "highpass", -2200);
        tone(2600, 0.18, "sine", 0.07, -400, 0.04);
        break;
      case "skill2":
        noise(0.7, 0.5, 400, "lowpass", -260);
        tone(55, 1.1, "sawtooth", 0.4, -35);
        tone(140, 0.5, "square", 0.16, -90, 0.03);
        noise(0.3, 0.3, 3000, "bandpass", -2000, 0.02);
        break;
      case "shot":
        noise(0.09, 0.16, 3200, "bandpass", -1200);
        tone(1100, 0.08, "triangle", 0.07, 500);
        break;
      case "skill2rain":
        tone(500, 0.5, "triangle", 0.1, 700);
        noise(0.4, 0.22, 5000, "highpass");
        tone(900, 0.4, "sine", 0.07, 1200, 0.08);
        break;
      case "block":
        tone(240, 0.2, "square", 0.1, -110);
        noise(0.1, 0.25, 2500, "bandpass");
        tone(900, 0.15, "triangle", 0.05, -300);
        break;
      case "zap":
        tone(1500, 0.16, "sawtooth", 0.11, -1050);
        noise(0.09, 0.2, 3400, "highpass");
        tone(240, 0.14, "square", 0.06, -140);
        break;
      case "explode":
        noise(0.9, 0.5, 620, "lowpass", -320);
        tone(78, 0.7, "sine", 0.3, -42);
        break;
      case "land":
        noise(0.13, 0.26, 480, "lowpass", -220);
        tone(92, 0.15, "sine", 0.11, -32);
        break;
    }
  }
  $("mute").addEventListener("click", () => {
    muted = !muted;
    $("mute").textContent = muted ? "🔇" : "🔊";
    applyVolumes();
  });

  /* ================= MUSIC: dark-fantasy jazz ensemble ================= */
  // Original procedural score: upright bass, brushed kit, reeds, muted brass,
  // vibraphone and shadowy organ. No piano samples or piano voice are used.
  const audioCfg = { music: 0.8, sfx: 0.9 };
  let sfxBus = null,
    MG = null;
  const noiseCache = new WeakMap();
  function getNoise(a) {
    let b = noiseCache.get(a);
    if (!b) {
      b = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseCache.set(a, b);
    }
    return b;
  }
  function makeIR(a) {
    const secs = 3.6,
      len = Math.floor(a.sampleRate * secs),
      ir = a.createBuffer(2, len, a.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let y = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len,
          n = Math.random() * 2 - 1;
        y += (n - y) * (0.75 - 0.6 * t);
        d[i] = y * Math.pow(1 - t, 2.4) * (i < 400 ? i / 400 : 1);
      }
    }
    return ir;
  }
  function buildMusicGraph(a) {
    const comp = a.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 12;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.012;
    comp.release.value = 0.35;
    comp.connect(a.destination);
    const bus = a.createGain();
    bus.connect(comp);
    const conv = a.createConvolver();
    conv.buffer = makeIR(a);
    const send = a.createGain();
    send.gain.value = 0.5;
    send.connect(conv);
    const wet = a.createGain();
    wet.gain.value = 0.9;
    conv.connect(wet);
    wet.connect(bus);
    return { bus, send };
  }
  function initAudioGraph(a) {
    sfxBus = a.createGain();
    sfxBus.connect(a.destination);
    MG = buildMusicGraph(a);
    applyVolumes();
  }
  function applyVolumes() {
    if (!AC || !MG) return;
    const t = AC.currentTime;
    MG.bus.gain.setTargetAtTime(muted ? 0 : audioCfg.music, t, 0.05);
    sfxBus.gain.setTargetAtTime(muted ? 0 : audioCfg.sfx, t, 0.05);
  }

  /* --- jazz ensemble voices --- */
  const waveCache = new WeakMap();
  function reedWave(a, voice) {
    let m = waveCache.get(a);
    if (!m) {
      m = {};
      waveCache.set(a, m);
    }
    if (!m[voice]) {
      const n = 20,
        re = new Float32Array(n + 1),
        im = new Float32Array(n + 1);
      for (let h = 1; h <= n; h++) {
        const odd = h % 2 ? 1 : voice === "mutedBrass" ? 0.34 : 0.18;
        im[h] =
          odd *
          Math.exp(-h * (voice === "baritoneSax" ? 0.13 : 0.18)) /
          Math.pow(h, voice === "mutedBrass" ? 0.72 : 0.9);
      }
      m[voice] = a.createPeriodicWave(re, im);
    }
    return m[voice];
  }
  function jazzNote(a, dest, midi, when, durS, vel, release, voice, pan = 0) {
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    voice = voice || (midi < 52 ? "upright" : "mutedBrass");
    const total = Math.max(0.16, durS + Math.min(1.3, release || 0.3));
    const peak = vel * (voice === "upright" ? 0.2 : voice === "organ" ? 0.085 : 0.12);
    const t = Math.max(when, a.currentTime),
      g = a.createGain(),
      lp = a.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = voice === "mutedBrass" ? 2.8 : 0.8;
    lp.frequency.setValueAtTime(
      Math.min(9000, f * (voice === "upright" ? 5 : 10)),
      t,
    );
    lp.frequency.exponentialRampToValueAtTime(
      Math.max(260, f * (voice === "upright" ? 2.2 : 4.2)),
      t + Math.min(0.7, total),
    );
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(
      peak,
      t + (voice === "upright" || voice === "vibes" ? 0.008 : 0.035),
    );
    g.gain.exponentialRampToValueAtTime(peak * (voice === "organ" ? 0.72 : 0.42), t + Math.min(0.32, total * 0.4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + total);
    const oscillators = [];
    if (voice === "upright") {
      oscillators.push(["triangle", 0, 1], ["sine", -1200, 0.3]);
    } else if (voice === "vibes") {
      oscillators.push(["sine", 0, 1], ["sine", 1902, 0.24], ["sine", 2786, 0.1]);
    } else if (voice === "organ") {
      oscillators.push(["sine", 0, 1], ["square", 1200, 0.1], ["sine", 1902, 0.16]);
    } else {
      oscillators.push(["reed", -3, 0.75], ["reed", 3, 0.55]);
    }
    for (const [kind, detune, level] of oscillators) {
      const o = a.createOscillator();
      if (kind === "reed") o.setPeriodicWave(reedWave(a, voice));
      else o.type = kind;
      o.frequency.value = f;
      o.detune.value = detune;
      const og = a.createGain();
      og.gain.value = level;
      o.connect(og);
      og.connect(lp);
      o.start(t);
      o.stop(t + total + 0.05);
      if (voice === "mutedBrass" || voice === "baritoneSax") {
        const vib = a.createOscillator(),
          vg = a.createGain();
        vib.frequency.value = voice === "mutedBrass" ? 5.2 : 4.3;
        vg.gain.value = voice === "mutedBrass" ? 7 : 4;
        vib.connect(vg);
        vg.connect(o.detune);
        vib.start(t + 0.08);
        vib.stop(t + total);
      }
    }
    lp.connect(g);
    if (a.createStereoPanner) {
      const panner = a.createStereoPanner();
      panner.pan.setValueAtTime(clamp(pan, -0.85, 0.85), t);
      g.connect(panner);
      panner.connect(dest);
    } else g.connect(dest);
    if (voice === "upright" || voice === "baritoneSax") {
      const ns = a.createBufferSource(),
        nf = a.createBiquadFilter(),
        ng = a.createGain();
      ns.buffer = getNoise(a);
      nf.type = "bandpass";
      nf.frequency.value = voice === "upright" ? 900 : Math.min(3800, f * 4);
      nf.Q.value = 1.2;
      ng.gain.setValueAtTime(vel * 0.028, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
      ns.connect(nf);
      nf.connect(ng);
      if (a.createStereoPanner) {
        const panner = a.createStereoPanner();
        panner.pan.value = clamp(pan, -0.85, 0.85);
        ng.connect(panner);
        panner.connect(dest);
      } else ng.connect(dest);
      ns.start(t);
      ns.stop(t + 0.07);
    }
  }

  /* --- notes and chords --- */
  const NOTE_SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function nn(s) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(s);
    return (
      NOTE_SEMI[m[1]] +
      (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) +
      (parseInt(m[3], 10) + 1) * 12
    );
  }
  // b = bass, a = left-hand arpeggio notes, t = triad, ra = right-hand arpeggio notes
  const CH = {
    Dm: {
      b: 38,
      a: [45, 50, 53, 57, 62],
      t: [62, 65, 69],
      ra: [57, 62, 65, 69, 74],
    },
    Bb: { b: 34, a: [41, 46, 50, 53, 58], t: [58, 62, 65] },
    Gm: { b: 43, a: [50, 55, 58, 62, 67], t: [58, 62, 67] },
    A: { b: 33, a: [45, 52, 57, 61, 64], t: [57, 61, 64] },
    F: {
      b: 41,
      a: [48, 53, 57, 60, 65],
      t: [57, 60, 65],
      ra: [53, 57, 60, 65, 69],
    },
    C: {
      b: 36,
      a: [48, 52, 55, 60, 64],
      t: [60, 64, 67],
      ra: [55, 60, 64, 67, 72],
    },
    Am: {
      b: 33,
      a: [45, 52, 57, 60, 64],
      t: [57, 60, 64],
      ra: [57, 60, 64, 69, 72],
    },
    G: {
      b: 43,
      a: [50, 55, 59, 62, 67],
      t: [59, 62, 67],
      ra: [55, 59, 62, 67, 71],
    },
    E: {
      b: 40,
      a: [40, 47, 52, 56, 59],
      t: [56, 59, 64],
      ra: [56, 59, 64, 68, 71],
    },
    D: { b: 38, a: [50, 54, 57, 62, 66], t: [62, 66, 69] },
    Bm: { b: 35, a: [47, 54, 59, 62, 66], t: [59, 62, 66] },
  };
  const melBars = (arr) =>
    arr.map((bar) => bar.map((m) => [m[0], nn(m[1]), m[2]]));

  /* Title theme: slow, sparse and mournful (D minor) */
  const TITLE_A = ["Dm", "Bb", "Gm", "A", "Dm", "F", "Bb", "A"];
  const TITLE_B = ["Gm", "Dm", "Bb", "F", "Gm", "A", "Dm", "Dm"];
  const MEL_TA = melBars([
    [
      [0, "A4", 3],
      [3, "G4", 1],
    ],
    [
      [0, "F4", 2],
      [2, "G4", 1],
      [3, "A4", 1],
    ],
    [
      [0, "Bb4", 3],
      [3, "A4", 1],
    ],
    [
      [0, "G4", 2],
      [2, "E4", 2],
    ],
    [
      [0, "D5", 3],
      [3, "C5", 1],
    ],
    [
      [0, "A4", 2],
      [2, "C5", 2],
    ],
    [
      [0, "D5", 2],
      [2, "C5", 1],
      [3, "Bb4", 1],
    ],
    [
      [0, "C#5", 2],
      [2, "A4", 2],
    ],
  ]);
  const MEL_TB = melBars([
    [
      [0, "Bb4", 1],
      [1, "D5", 1],
      [2, "G5", 2],
    ],
    [
      [0, "F5", 3],
      [3, "E5", 1],
    ],
    [
      [0, "D5", 2],
      [2, "F5", 2],
    ],
    [
      [0, "A5", 3],
      [3, "G5", 1],
    ],
    [
      [0, "Bb5", 2],
      [2, "A5", 1],
      [3, "G5", 1],
    ],
    [
      [0, "E5", 2],
      [2, "A5", 2],
    ],
    [
      [0, "F5", 2],
      [2, "D5", 2],
    ],
    [[0, "D5", 4]],
  ]);
  function titleGen(b) {
    const sec = Math.floor(b / 8),
      i = b % 8,
      ch = CH[(sec === 1 ? TITLE_B : TITLE_A)[i]],
      ev = [];
    ev.push([0, ch.b, 4, 0.5]);
    if (sec === 2) ev.push([0, ch.b + 12, 4, 0.34]);
    const pat = [0, 2, 3, 4, 3, 2, 1, 2];
    for (let k = 0; k < 8; k++)
      ev.push([k * 0.5, ch.a[pat[k]], 0.5, k === 0 ? 0.3 : k % 2 ? 0.2 : 0.25]);
    for (const m of (sec === 1 ? MEL_TB : MEL_TA)[i]) {
      ev.push([m[0], m[1], m[2], 0.6]);
      if (sec === 2) ev.push([m[0], m[1] - 12, m[2], 0.32]);
    }
    return ev;
  }

  /* Battle theme 1: The Violet Sentinel (D minor, driving left hand) */
  const SENT_PROG = [
    "Dm",
    "Dm",
    "Bb",
    "C",
    "Dm",
    "Dm",
    "Gm",
    "A",
    "Dm",
    "F",
    "Bb",
    "C",
    "Gm",
    "A",
    "Dm",
    "A",
  ];
  const MEL_S = melBars([
    [
      [0, "D5", 1.5],
      [1.5, "F5", 0.5],
      [2, "A5", 2],
    ],
    [
      [0, "G5", 1],
      [1, "F5", 1],
      [2, "E5", 2],
    ],
    [
      [0, "D5", 1.5],
      [1.5, "F5", 0.5],
      [2, "Bb5", 2],
    ],
    [
      [0, "A5", 1],
      [1, "G5", 1],
      [2, "E5", 2],
    ],
    [
      [0, "F5", 1],
      [1, "A5", 1],
      [2, "D6", 2],
    ],
    [
      [0, "C6", 1],
      [1, "A5", 1],
      [2, "F5", 2],
    ],
    [
      [0, "G5", 1.5],
      [1.5, "Bb5", 0.5],
      [2, "D6", 2],
    ],
    [
      [0, "C#6", 1],
      [1, "E6", 1],
      [2, "A5", 2],
    ],
    [
      [0, "D6", 2],
      [2, "C6", 1],
      [3, "A5", 1],
    ],
    [
      [0, "A5", 1.5],
      [1.5, "C6", 0.5],
      [2, "F6", 2],
    ],
    [
      [0, "D6", 2],
      [2, "C6", 1],
      [3, "Bb5", 1],
    ],
    [
      [0, "G5", 1],
      [1, "A5", 1],
      [2, "G5", 2],
    ],
    [
      [0, "Bb5", 1],
      [1, "A5", 1],
      [2, "G5", 1],
      [3, "F5", 1],
    ],
    [
      [0, "E5", 1],
      [1, "G5", 1],
      [2, "A5", 2],
    ],
    [
      [0, "F5", 2],
      [2, "D5", 2],
    ],
    [
      [0, "E5", 2],
      [2, "C#5", 2],
    ],
  ]);
  function sentGen(b, hi) {
    const ch = CH[SENT_PROG[b]],
      ev = [],
      R = ch.b + 12;
    const pat = [R, R + 7, R + 12, R + 7, R, R + 7, R + 12, R + 7];
    for (let k = 0; k < 8; k++)
      ev.push([
        k * 0.5,
        pat[k],
        0.5,
        k % 4 === 0 ? 0.58 : k % 2 === 0 ? 0.46 : 0.34,
      ]);
    ev.push([0, ch.b, 2, 0.8]);
    ev.push([2, ch.b, 2, 0.66]);
    if (hi) {
      ev.push([1, ch.b, 1, 0.55]);
      ev.push([3, ch.b, 1, 0.55]);
    }
    for (const beat of hi ? [0, 1, 2, 3] : [0, 2])
      for (const n of ch.t) ev.push([beat, n, 1.6, 0.34]);
    for (const m of MEL_S[b]) {
      ev.push([m[0], m[1], m[2], 0.78]);
      if (hi) ev.push([m[0], m[1] - 12, m[2], 0.5]);
    }
    return ev;
  }

  /* Battle theme 2: Artorias (A minor, tolling bass and rising arpeggios) */
  const ART_PROG = [
    "Am",
    "F",
    "C",
    "G",
    "Am",
    "F",
    "Dm",
    "E",
    "Am",
    "F",
    "C",
    "G",
    "Dm",
    "Am",
    "E",
    "E",
  ];
  const MEL_A = melBars([
    [
      [0, "E5", 2],
      [2, "A5", 1],
      [3, "G5", 1],
    ],
    [
      [0, "F5", 2],
      [2, "A5", 2],
    ],
    [
      [0, "G5", 2],
      [2, "E5", 1],
      [3, "C5", 1],
    ],
    [
      [0, "D5", 2],
      [2, "B4", 2],
    ],
    [
      [0, "E5", 2],
      [2, "A5", 1],
      [3, "B5", 1],
    ],
    [
      [0, "C6", 2],
      [2, "A5", 2],
    ],
    [
      [0, "D6", 1.5],
      [1.5, "C6", 0.5],
      [2, "A5", 2],
    ],
    [
      [0, "G#5", 2],
      [2, "B5", 2],
    ],
    [
      [0, "A5", 2],
      [2, "C6", 1],
      [3, "E6", 1],
    ],
    [
      [0, "D6", 2],
      [2, "C6", 2],
    ],
    [
      [0, "E6", 2],
      [2, "D6", 1],
      [3, "C6", 1],
    ],
    [
      [0, "B5", 2],
      [2, "D6", 2],
    ],
    [
      [0, "F6", 2],
      [2, "E6", 1],
      [3, "D6", 1],
    ],
    [
      [0, "C6", 2],
      [2, "A5", 2],
    ],
    [
      [0, "B5", 2],
      [2, "G#5", 2],
    ],
    [[0, "E5", 4]],
  ]);
  function artGen(b, hi) {
    const ch = CH[ART_PROG[b]],
      ev = [];
    for (const beat of hi ? [0, 1, 2, 3] : [0, 2]) {
      ev.push([beat, ch.b, hi ? 1 : 2, 0.78]);
      ev.push([beat, ch.b + 12, hi ? 1 : 2, 0.6]);
    }
    const pat = [0, 1, 2, 3, 4, 3, 2, 1],
      steps = hi ? 16 : 8,
      sp = hi ? 0.25 : 0.5;
    for (let k = 0; k < steps; k++)
      ev.push([k * sp, ch.ra[pat[k % 8]], sp, 0.3 + (k % 4 === 0 ? 0.06 : 0)]);
    for (const m of MEL_A[b]) {
      ev.push([m[0], m[1], m[2], 0.8]);
      if (hi) ev.push([m[0], m[1] - 12, m[2], 0.5]);
    }
    return ev;
  }

  /* Victory: a warm D major resolution */
  const VICT_PROG = ["D", "A", "Bm", "G", "D", "A", "G", "D"];
  const MEL_V = melBars([
    [
      [0, "F#5", 2],
      [2, "A5", 2],
    ],
    [
      [0, "E5", 2],
      [2, "C#5", 2],
    ],
    [
      [0, "D5", 2],
      [2, "F#5", 2],
    ],
    [
      [0, "B4", 2],
      [2, "D5", 2],
    ],
    [
      [0, "A5", 2],
      [2, "F#5", 2],
    ],
    [
      [0, "E5", 2],
      [2, "A5", 2],
    ],
    [
      [0, "B5", 2],
      [2, "G5", 1],
      [3, "D5", 1],
    ],
    [[0, "D5", 4]],
  ]);
  function victGen(b) {
    const ch = CH[VICT_PROG[b]],
      ev = [],
      pat = [0, 2, 3, 4, 3, 2, 1, 2];
    ev.push([0, ch.b, 4, 0.5]);
    for (let k = 0; k < 8; k++)
      ev.push([k * 0.5, ch.a[pat[k]], 0.5, k === 0 ? 0.3 : 0.22]);
    for (const m of MEL_V[b]) {
      ev.push([m[0], m[1], m[2], 0.6]);
      ev.push([m[0], m[1] - 12, m[2], 0.3]);
    }
    return ev;
  }

  const DARK_JAZZ = {
    sentinel: {
      prog: ["Dm", "Bb", "Gm", "A", "Dm", "C", "Bb", "A"],
      motif: [0, 3, 7, 6, 3, 10, 7, 1],
      voice: "mutedBrass",
      chordVoice: "vibes",
      drums: "marchBrush",
    },
    art: {
      prog: ["Am", "F", "Dm", "E", "Am", "C", "Dm", "E"],
      motif: [7, 3, 0, 2, 7, 10, 8, 4],
      voice: "baritoneSax",
      chordVoice: "organ",
      drums: "slowRide",
    },
    demon: {
      prog: ["Dm", "Gm", "Bb", "A", "Dm", "Bb", "Gm", "A"],
      motif: [0, 1, 6, 3, 8, 7, 1, 0],
      voice: "baritoneSax",
      chordVoice: "organ",
      drums: "warBrush",
    },
    shogun: {
      prog: ["Am", "G", "Dm", "E", "Am", "F", "Dm", "E"],
      motif: [0, 2, 3, 7, 5, 3, 2, -1],
      voice: "mutedBrass",
      chordVoice: "vibes",
      drums: "bladeSwing",
    },
    volturus: {
      prog: ["Dm", "C", "Bb", "A", "Gm", "Dm", "Bb", "A"],
      motif: [0, 7, 10, 14, 12, 10, 7, 6],
      voice: "mutedBrass",
      chordVoice: "organ",
      drums: "stormRide",
    },
    wraith: {
      prog: ["Gm", "Bb", "Dm", "A", "Gm", "Dm", "Bb", "A"],
      motif: [0, 3, -2, 1, 6, 3, 1, -1],
      voice: "baritoneSax",
      chordVoice: "vibes",
      drums: "hollowBrush",
    },
    warden: {
      prog: ["Dm", "F", "E", "A", "Dm", "Bb", "E", "A"],
      motif: [0, 6, 7, 13, 10, 6, 1, 0],
      voice: "mutedBrass",
      chordVoice: "organ",
      drums: "crownRide",
    },
  };
  function darkJazzGen(theme) {
    const cfg = DARK_JAZZ[theme];
    return (bar, hi) => {
      const ch = CH[cfg.prog[bar % cfg.prog.length]],
        next = CH[cfg.prog[(bar + 1) % cfg.prog.length]],
        ev = [],
        swing = 0.66,
        root = ch.b + 24;
      // Walking upright bass with a chromatic approach into the next bar.
      ev.push([0, ch.b, 0.78, 0.72, "upright"]);
      ev.push([1, ch.b + 7, 0.72, 0.58, "upright"]);
      ev.push([2, ch.b + 12, 0.72, 0.66, "upright"]);
      ev.push([3, next.b - 1, 0.72, 0.58, "upright"]);
      // Short off-beat chord stabs create the jazz pulse without piano.
      for (const beat of hi ? [swing, 1 + swing, 2 + swing, 3 + swing] : [swing, 2 + swing])
        for (const n of ch.t)
          ev.push([beat, n, 0.28, hi ? 0.28 : 0.22, cfg.chordVoice]);
      const motifStart = (bar * 2) % cfg.motif.length,
        leadBeats = hi ? [0.25, 1, 1 + swing, 2.25, 3, 3 + swing] : [0.25, 1 + swing, 2.25, 3 + swing];
      for (let i = 0; i < leadBeats.length; i++) {
        const note = root + cfg.motif[(motifStart + i) % cfg.motif.length];
        ev.push([leadBeats[i], note, hi ? 0.48 : 0.68, hi ? 0.65 : 0.54, cfg.voice]);
      }
      if (theme === "warden" && bar % 2)
        ev.push([1.5, root + 19, 1.7, 0.34, "vibes"]);
      if (theme === "wraith")
        ev.push([0, root - 12, 3.6, 0.24, "organ"]);
      if (theme === "volturus" && hi)
        ev.push([3.5, root + 24, 0.35, 0.6, "mutedBrass"]);
      return ev;
    };
  }

  const TRACKS = {
    title: {
      bpm: 62,
      beats: 4,
      bars: 24,
      pedal: 1.2,
      voice: "vibes",
      drums: "noirBrush",
      gen: titleGen,
    },
    battleSent: {
      bpm: 92,
      beats: 4,
      bars: 8,
      pedal: 0.55,
      intenseTempo: 1.1,
      voice: DARK_JAZZ.sentinel.voice,
      drums: DARK_JAZZ.sentinel.drums,
      theme: "sentinel",
      gen: darkJazzGen("sentinel"),
    },
    battleArt: {
      bpm: 78,
      beats: 4,
      bars: 8,
      pedal: 0.75,
      intenseTempo: 1.12,
      voice: DARK_JAZZ.art.voice,
      drums: DARK_JAZZ.art.drums,
      theme: "art",
      gen: darkJazzGen("art"),
    },
    battleDemon: {
      bpm: 96,
      beats: 4,
      bars: 8,
      pedal: 0.62,
      intenseTempo: 1.12,
      voice: DARK_JAZZ.demon.voice,
      drums: DARK_JAZZ.demon.drums,
      theme: "demon",
      gen: darkJazzGen("demon"),
    },
    battleShogun: {
      bpm: 104,
      beats: 4,
      bars: 8,
      pedal: 0.48,
      intenseTempo: 1.1,
      voice: DARK_JAZZ.shogun.voice,
      drums: DARK_JAZZ.shogun.drums,
      theme: "shogun",
      gen: darkJazzGen("shogun"),
    },
    battleVolturus: {
      bpm: 112,
      beats: 4,
      bars: 8,
      pedal: 0.55,
      intenseTempo: 1.14,
      voice: DARK_JAZZ.volturus.voice,
      drums: DARK_JAZZ.volturus.drums,
      theme: "volturus",
      gen: darkJazzGen("volturus"),
    },
    battleWraith: {
      bpm: 72,
      beats: 4,
      bars: 8,
      pedal: 0.95,
      intenseTempo: 1.16,
      voice: DARK_JAZZ.wraith.voice,
      drums: DARK_JAZZ.wraith.drums,
      theme: "wraith",
      gen: darkJazzGen("wraith"),
    },
    battleWarden: {
      bpm: 118,
      beats: 4,
      bars: 8,
      pedal: 0.58,
      intenseTempo: 1.12,
      voice: DARK_JAZZ.warden.voice,
      drums: DARK_JAZZ.warden.drums,
      theme: "warden",
      gen: darkJazzGen("warden"),
    },
    victory: {
      bpm: 68,
      beats: 4,
      bars: 8,
      pedal: 1.1,
      voice: "mutedBrass",
      drums: "victoryBrush",
      gen: victGen,
    },
  };

  /* --- sequencer --- */
  const Music = { cur: null, timer: null, intense: false };
  function jazzKick(a, dest, when, vel) {
    const o = a.createOscillator(),
      g = a.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(105, when);
    o.frequency.exponentialRampToValueAtTime(46, when + 0.11);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.16 * vel, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
    o.connect(g);
    g.connect(dest);
    o.start(when);
    o.stop(when + 0.24);
  }
  function jazzNoiseHit(a, dest, when, vel, kind) {
    const src = a.createBufferSource(),
      filter = a.createBiquadFilter(),
      g = a.createGain();
    src.buffer = getNoise(a);
    filter.type = kind === "ride" ? "highpass" : "bandpass";
    filter.frequency.value = kind === "ride" ? 5200 : 1900;
    filter.Q.value = kind === "ride" ? 0.5 : 0.8;
    const life = kind === "ride" ? 0.34 : 0.13;
    g.gain.setValueAtTime(Math.max(0.0001, vel * (kind === "ride" ? 0.035 : 0.07)), when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + life);
    src.connect(filter);
    filter.connect(g);
    g.connect(dest);
    src.start(when);
    src.stop(when + life + 0.02);
  }
  function scheduleJazzDrums(a, dest, tr, when, beat, intense) {
    if (!tr.drums) return;
    const storm = /storm|crown|war/.test(tr.drums),
      sparse = /noir|hollow|slow/.test(tr.drums),
      swing = 0.66;
    for (const b of sparse ? [0, 2] : [0, 1, 2, 3])
      jazzNoiseHit(a, dest, when + (b + (b % 2 ? swing - 0.5 : 0)) * beat, intense ? 0.9 : 0.65, "ride");
    for (const b of [1, 3])
      jazzNoiseHit(a, dest, when + b * beat, intense ? 0.82 : 0.62, "brush");
    for (const b of storm || intense ? [0, 2, 3.5] : [0, 2])
      jazzKick(a, dest, when + b * beat, b === 0 ? 1 : 0.72);
    if (/blade/.test(tr.drums))
      for (const b of [0.66, 1.66, 2.66, 3.66])
        jazzNoiseHit(a, dest, when + b * beat, 0.42, "brush");
  }
  const THEME_ROOT = {
    sentinel: 38,
    art: 33,
    demon: 38,
    shogun: 33,
    volturus: 38,
    wraith: 31,
    warden: 38,
  };
  function scheduleThemeAtmosphere(a, dest, tr, when, beat, intense, bar) {
    const theme = tr.theme;
    if (!theme) return;
    const root = THEME_ROOT[theme],
      long = beat * 3.9;
    // A quiet stereo drone glues the ensemble to the arena without masking hits.
    jazzNote(a, dest, root - 12, when, long, intense ? 0.18 : 0.11, 0.7, "organ", -0.42);
    jazzNote(a, dest, root + 7, when + beat * 0.02, long, intense ? 0.12 : 0.075, 0.7, "organ", 0.42);
    if (theme === "sentinel" && bar % 4 === 0)
      jazzNote(a, dest, root + 31, when + beat * 3.15, beat * 0.7, 0.48, 0.35, "mutedBrass", 0.28);
    else if (theme === "art" && bar % 2 === 0)
      jazzNote(a, dest, root + 24, when + beat * 0.15, beat * 2.6, 0.34, 0.75, "baritoneSax", -0.3);
    else if (theme === "demon") {
      jazzNote(a, dest, root + 18, when + beat * 1.5, beat * 1.8, 0.25, 0.5, "organ", 0.35);
      if (intense) jazzNoiseHit(a, dest, when + beat * 3.75, 0.72, "brush");
    } else if (theme === "shogun" && bar % 2) {
      for (let i = 0; i < 4; i++)
        jazzNoiseHit(a, dest, when + beat * (3.2 + i * 0.18), 0.34 + i * 0.06, "brush");
    } else if (theme === "volturus") {
      for (let i = 0; i < (intense ? 4 : 2); i++)
        jazzNote(a, dest, root + 31 + i * 3, when + beat * (2.75 + i * 0.18), beat * 0.22, 0.36, 0.25, "vibes", i % 2 ? 0.62 : -0.62);
    } else if (theme === "wraith" && bar % 2 === 0)
      jazzNote(a, dest, root + 18, when + beat * 0.5, beat * 3, 0.22, 1.05, "baritoneSax", 0.45);
    else if (theme === "warden") {
      jazzNote(a, dest, root + (bar % 2 ? 30 : 31), when + beat * 2.5, beat * 1.2, 0.4, 0.45, bar % 2 ? "mutedBrass" : "vibes", bar % 2 ? 0.55 : -0.55);
    }
  }
  function scheduleThemeIntro(a, dest, tr, when) {
    if (!tr.theme) return;
    const root = THEME_ROOT[tr.theme],
      voice = tr.voice || "mutedBrass";
    jazzNote(a, dest, root, when, 0.7, 0.72, 0.5, "upright", -0.2);
    jazzNote(a, dest, root + 24, when + 0.07, 0.8, 0.58, 0.6, voice, 0.25);
    jazzNote(a, dest, root + (tr.theme === "wraith" ? 30 : 31), when + 0.2, 1.1, 0.5, 0.7, voice, -0.25);
    jazzNoiseHit(a, dest, when + 0.02, 0.62, "ride");
  }
  function scheduleNote(a, dest, tr, e, when, beat) {
    const durS = e[2] * beat,
      vel = clamp(e[3] * (1 + (Math.random() - 0.5) * 0.14), 0.05, 1);
    jazzNote(
      a,
      dest,
      e[1],
      when + (Math.random() - 0.5) * 0.02,
      durS,
      vel,
      tr.pedal,
      e[4] || tr.voice,
      e[5] == null ? ((e[1] % 5) - 2) * 0.13 : e[5],
    );
  }
  function musicTick() {
    const a = AC,
      c = Music.cur;
    if (!a || !c) return;
    while (c.next < a.currentTime + 1.4) {
      const tr = c.track,
        bpm = tr.bpm * (Music.intense && tr.intenseTempo ? tr.intenseTempo : 1),
        beat = 60 / bpm;
      for (const e of tr.gen(c.bar % tr.bars, Music.intense))
        scheduleNote(a, c.gain, tr, e, c.next + e[0] * beat, beat);
      scheduleJazzDrums(a, c.gain, tr, c.next, beat, Music.intense);
      scheduleThemeAtmosphere(a, c.gain, tr, c.next, beat, Music.intense, c.bar);
      c.next += tr.beats * beat;
      c.bar++;
    }
  }
  function musicPlay(name) {
    const a = ac();
    if (!a || !MG) return;
    if (Music.cur && Music.cur.name === name) return;
    musicStop(1.2);
    const tr = TRACKS[name];
    if (!tr) return;
    const gain = a.createGain();
    gain.gain.setValueAtTime(0.0001, a.currentTime);
    gain.gain.linearRampToValueAtTime(1, a.currentTime + 1.2);
    gain.connect(MG.bus);
    gain.connect(MG.send);
    Music.cur = { name, track: tr, gain, bar: 0, next: a.currentTime + 0.3 };
    Music.intense = false;
    scheduleThemeIntro(a, gain, tr, a.currentTime + 0.18);
    if (!Music.timer) Music.timer = setInterval(musicTick, 100);
    musicTick();
  }
  function musicStop(fade) {
    const a = AC,
      c = Music.cur;
    Music.cur = null;
    if (!a || !c) return;
    const t = a.currentTime;
    c.gain.gain.cancelScheduledValues(t);
    c.gain.gain.setValueAtTime(Math.max(0.0001, c.gain.gain.value), t);
    c.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
    setTimeout(
      () => {
        try {
          c.gain.disconnect();
        } catch (e) {}
      },
      (fade + 0.4) * 1000,
    );
  }
  function musicIntensify() {
    Music.intense = true;
  }
  function bossTrackName(type) {
    return {
      sentinel: "battleSent",
      art: "battleArt",
      demon: "battleDemon",
      shogun: "battleShogun",
      volturus: "battleVolturus",
      wraith: "battleWraith",
      warden: "battleWarden",
    }[type] || "battleSent";
  }
  // dev/test helper: render a track offline (used only when window.__TEST__ is set)
  async function renderTrackOffline(name, secs, intense) {
    const sr = 44100,
      oa = new OfflineAudioContext(2, Math.floor(sr * secs), sr),
      g = buildMusicGraph(oa),
      tr = TRACKS[name];
    const tg = oa.createGain();
    tg.connect(g.bus);
    tg.connect(g.send);
    const bpm = tr.bpm * (intense && tr.intenseTempo ? tr.intenseTempo : 1),
      beat = 60 / bpm;
    let t = 0,
      bar = 0;
    while (t < secs) {
      for (const e of tr.gen(bar % tr.bars, !!intense)) {
        const when = t + e[0] * beat;
        if (when < secs) scheduleNote(oa, tg, tr, e, when, beat);
      }
      scheduleJazzDrums(oa, tg, tr, t, beat, !!intense);
      scheduleThemeAtmosphere(oa, tg, tr, t, beat, !!intense, bar);
      t += tr.beats * beat;
      bar++;
    }
    return oa.startRendering();
  }

  /* ================= SETTINGS: key bindings, volume, pause ================= */
  const ACTIONS = [
    ["left", "Move left"],
    ["right", "Move right"],
    ["jump", "Jump"],
    ["down", "Down (plunge)"],
    ["attack", "Attack"],
    ["parry", "Parry"],
    ["block", "Block (hold)"],
    ["dodge", "Dodge / air dodge"],
    ["heal", "Healing flask"],
    ["skill1", "Sunray Slash (skill)"],
    ["skill2", "Cinder Bomb (skill)"],
  ];
  const DEFAULT_BINDS = {
    left: ["KeyA", "ArrowLeft", ""],
    right: ["KeyD", "ArrowRight", ""],
    jump: ["KeyW", "Space", "ArrowUp"],
    down: ["KeyS", "ArrowDown", ""],
    attack: ["KeyJ", "Mouse0", "KeyZ"],
    parry: ["KeyK", "Mouse2", "KeyX"],
    block: ["KeyB", "KeyI", ""],
    dodge: ["KeyL", "ShiftLeft", "KeyC"],
    heal: ["KeyQ", "KeyH", ""],
    skill1: ["KeyR", "", ""],
    skill2: ["KeyE", "", ""],
  };
  const DEFAULT_BINDS2 = {
    left: ["ArrowLeft", "", ""],
    right: ["ArrowRight", "", ""],
    jump: ["ArrowUp", "", ""],
    down: ["ArrowDown", "", ""],
    attack: ["Numpad1", "", ""],
    parry: ["Numpad2", "", ""],
    block: ["Numpad0", "", ""],
    dodge: ["Numpad3", "", ""],
    heal: ["Numpad4", "", ""],
    skill1: ["Numpad5", "", ""],
    skill2: ["Numpad6", "", ""],
  };
  const PAD_OPTIONS = [
    ["axis0-", "Left stick left"],
    ["axis0+", "Left stick right"],
    ["axis1-", "Left stick up"],
    ["axis1+", "Left stick down"],
    ["b0", "A / Cross"],
    ["b1", "B / Circle"],
    ["b2", "X / Square"],
    ["b3", "Y / Triangle"],
    ["b4", "LB / L1"],
    ["b5", "RB / R1"],
    ["b6", "LT / L2"],
    ["b7", "RT / R2"],
    ["b8", "View / Share"],
    ["b9", "Menu / Options"],
    ["b10", "Left stick press"],
    ["b11", "Right stick press"],
    ["b12", "D-pad up"],
    ["b13", "D-pad down"],
    ["b14", "D-pad left"],
    ["b15", "D-pad right"],
  ];
  const DEFAULT_PAD_MAP = {
    left: "axis0-",
    right: "axis0+",
    jump: "b0",
    down: "axis1+",
    attack: "b2",
    parry: "b3",
    block: "b6",
    dodge: "b1",
    heal: "b4",
    skill1: "b5",
    skill2: "b7",
  };
  const RESERVED = [
    "Escape",
    "Enter",
    "KeyF",
    "KeyM",
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
  ];
  let binds = {},
    binds2 = {},
    codeMap = {},
    codeMap2 = {},
    bindPlayer = 1,
    padMaps = [{ ...DEFAULT_PAD_MAP }, { ...DEFAULT_PAD_MAP }],
    padPrev = [{}, {}],
    padHeld = [{ left: 0, right: 0, down: 0, block: 0 }, { left: 0, right: 0, down: 0, block: 0 }],
    capturing = null,
    settingsFrom = "title",
    settingsOpen = false,
    paused = false,
    consoleOpen = false,
    consoleCapture = false,
    consoleWasPaused = false;
  function rebuildMap() {
    codeMap = {};
    for (const a in binds) for (const c of binds[a]) if (c) codeMap[c] = a;
    codeMap2 = {};
    for (const a in binds2)
      for (const c of binds2[a]) if (c) codeMap2[c] = a;
  }
  function resetBinds() {
    binds = {};
    for (const a in DEFAULT_BINDS) binds[a] = DEFAULT_BINDS[a].slice();
    binds2 = {};
    for (const a in DEFAULT_BINDS2) binds2[a] = DEFAULT_BINDS2[a].slice();
    padMaps = [{ ...DEFAULT_PAD_MAP }, { ...DEFAULT_PAD_MAP }];
    rebuildMap();
  }
  function normCode(c) {
    return (c || "").replace(/(Shift|Control|Alt|Meta)Right$/, "$1Left");
  }
  function keyLabel(c) {
    if (!c) return "-";
    if (/^Mouse\d$/.test(c))
      return (
        ["Left click", "Middle click", "Right click"][+c[5]] || "Mouse " + c[5]
      );
    if (/^Key[A-Z]$/.test(c)) return c[3];
    if (/^Digit\d$/.test(c)) return c[5];
    if (/^Numpad/.test(c)) return "Num " + c.slice(6);
    const map = {
      ArrowLeft: "Left",
      ArrowRight: "Right",
      ArrowUp: "Up",
      ArrowDown: "Down",
      Space: "Space",
      ShiftLeft: "Shift",
      ControlLeft: "Ctrl",
      AltLeft: "Alt",
      MetaLeft: "Meta",
      Tab: "Tab",
      CapsLock: "Caps",
      Backquote: "`",
      Minus: "-",
      Equal: "=",
      BracketLeft: "[",
      BracketRight: "]",
      Semicolon: ";",
      Quote: "'",
      Comma: ",",
      Period: ".",
      Slash: "/",
      Backslash: "\\",
    };
    return map[c] || c;
  }
  function labelOf(a) {
    const r = ACTIONS.find((x) => x[0] === a);
    return r ? r[1] : a;
  }
  function keysOf(a, player = 1) {
    const source = player === 2 ? binds2 : binds;
    return source[a].filter((x) => x).map(keyLabel);
  }
  function primaryKey(a) {
    const k = keysOf(a);
    return k.length ? k[0] : "unbound";
  }
  function primaryKey2(a) {
    const k = keysOf(a, 2);
    return k.length ? k[0] : "unbound";
  }
  function twoKeys(a) {
    const k = keysOf(a).slice(0, 2);
    return k.length ? k.join(" / ") : "unbound";
  }
  function loadSettings() {
    resetBinds();
    try {
      const b = JSON.parse(localStorage.getItem("gilded_binds_v1") || "null");
      if (b)
        for (const a in DEFAULT_BINDS)
          if (Array.isArray(b[a]))
            binds[a] = [0, 1, 2].map((i) =>
              typeof b[a][i] === "string" ? b[a][i] : "",
            );
      const b2 = JSON.parse(localStorage.getItem("gilded_binds_p2_v1") || "null");
      if (b2)
        for (const a in DEFAULT_BINDS2)
          if (Array.isArray(b2[a]))
            binds2[a] = [0, 1, 2].map((i) =>
              typeof b2[a][i] === "string" ? b2[a][i] : "",
            );
      const pm = JSON.parse(localStorage.getItem("gilded_pad_maps_v1") || "null");
      if (Array.isArray(pm))
        for (let p = 0; p < 2; p++)
          if (pm[p] && typeof pm[p] === "object")
            for (const a of Object.keys(DEFAULT_PAD_MAP))
              if (typeof pm[p][a] === "string") padMaps[p][a] = pm[p][a];
      const c = JSON.parse(localStorage.getItem("gilded_audio_v1") || "null");
      if (c) {
        audioCfg.music = clamp(+c.music, 0, 1);
        audioCfg.sfx = clamp(+c.sfx, 0, 1);
      }
    } catch (e) {}
    if (!(audioCfg.music >= 0)) audioCfg.music = 0.8;
    if (!(audioCfg.sfx >= 0)) audioCfg.sfx = 0.9;
    rebuildMap();
  }
  function saveSettings() {
    try {
      localStorage.setItem("gilded_binds_v1", JSON.stringify(binds));
      localStorage.setItem("gilded_binds_p2_v1", JSON.stringify(binds2));
      localStorage.setItem("gilded_pad_maps_v1", JSON.stringify(padMaps));
      localStorage.setItem("gilded_audio_v1", JSON.stringify(audioCfg));
    } catch (e) {}
    saveProfile();
  }
  function setMsg(t) {
    $("bindMsg").textContent = t;
  }
  function setConsoleBindLabel() {
    if ($("consoleBind"))
      $("consoleBind").textContent = consoleCapture
        ? "press a key..."
        : keyLabel(profile.consoleKey);
  }
  function toggleConsole(force) {
    const next = force === undefined ? !consoleOpen : !!force;
    if (next === consoleOpen) return;
    consoleOpen = next;
    if (next) {
      consoleWasPaused = paused;
      if (isPlaying()) paused = true;
      clearInputState();
      $("devConsole").classList.remove("hide");
      $("consoleInput").value = "";
      $("consoleInput").focus();
    } else {
      $("devConsole").classList.add("hide");
      if (isPlaying() && !consoleWasPaused) paused = false;
    }
  }
  function runConsoleCommand(raw) {
    const command = (raw || "").trim().toLowerCase();
    if (command === "allrelic" || command === "allrelics") {
      for (const relic of RELICS)
        profile.inventory[relic.id] = Math.max(
          3,
          profile.inventory[relic.id] || 0,
        );
      saveProfile();
      renderLoadout();
      updateCoinLabels();
      $("consoleOutput").textContent =
        "Granted every relic (3 copies each).";
    } else if (command === "moneyall") {
      profile.coins = 99999;
      saveProfile();
      updateCoinLabels();
      $("consoleOutput").textContent = "Coins set to 99,999.";
    } else if (command === "help") {
      $("consoleOutput").textContent =
        "allrelic — grant every relic\\nmoneyall — set coins to 99,999";
    } else if (command) {
      $("consoleOutput").textContent =
        'Unknown command: "' + command + '". Type help.';
    }
  }
  function renderTitleKeys() {
    const T = $("titleKeys");
    if (!T) return;
    T.innerHTML = "";
    const shared = [
      [
        "Move",
        keysOf("left")
          .slice(0, 1)
          .concat(keysOf("right").slice(0, 1))
          .join(" / ") || "unbound",
      ],
      ["Jump", twoKeys("jump")],
      ["Block (hold)", twoKeys("block") + ", takes 25% less damage"],
      ["Dodge slide", twoKeys("dodge")],
      ["Air dodge", "Jump, then " + primaryKey("dodge")],
      ["Healing flask", twoKeys("heal")],
    ];
    const rows =
      heroType === "wraithknight"
        ? [
            ["Move", shared[0][1]],
            ["Double jump", twoKeys("jump") + ", no stamina cost"],
            ["Wraith greatsword", twoKeys("attack") + ", 3-hit combo, 150 damage per hit"],
            ["Hand parry", twoKeys("parry") + ", parries normal close weapon swings"],
            ["Dodge roll", twoKeys("dodge") + ", 20 stamina"],
            shared[2], shared[5],
            ["Dark Sky Judgment", primaryKey("skill1") + ", 4 violet lightning strikes × 200, 40s cooldown"],
            ["Wraith Ascension", primaryKey("skill2") + ", team +40% attack and +20% armour for 30s, 90s cooldown"],
          ]
        : heroType === "thor"
        ? [
            ["Move", shared[0][1]],
            ["Storm-blade combo", twoKeys("attack") + ", 120 damage per hit, 20 stamina"],
            ["Storm Bolt", twoKeys("parry") + ", shoots lightning for 190 damage, 40 stamina, works in the air"],
            ["Dodge", twoKeys("dodge") + ", 20 stamina, also while jumping"],
            shared[2], shared[5],
            ["Thunder Sky Strike", primaryKey("skill1") + ", leaps into the sky and slams the boss with lightning, 600 damage, 45s cooldown"],
            ["Storm Ascension", primaryKey("skill2") + ", hammer form for 40s, 80s cooldown; parry throws the hammer for 220 and dodge becomes a lightning teleport"],
          ]
        : heroType === "killnux"
        ? [
            ["Move", shared[0][1]],
            ["Jump", shared[1][1]],
            ["Colossal sword", twoKeys("attack") + ", 200 damage, 30 stamina"],
            ["Super dodge", twoKeys("dodge") + ", 50% farther, 20 stamina"],
            ["Abyss Quake", primaryKey("skill1") + ", ground slam + black wave, 400 damage, 30s cooldown"],
            ["Black Armour", primaryKey("skill2") + ", +50% attack and +20% defense for 20s, 60s cooldown"],
            shared[2], shared[4], shared[5],
          ]
        : heroType === "shadow"
        ? [
            ["Move", shared[0][1]],
            ["Jump", shared[1][1]],
            [
              "Shoot",
              twoKeys("attack") +
                ", 20 stamina per arrow, usable in the air too",
            ],
            [
              "Umbral Dash",
              twoKeys("parry") + ", teleport, 50 stamina, only Shadow has this",
            ],
            shared[2],
            shared[3],
            shared[4],
            shared[5],
            [
              "Piercing Dive",
              primaryKey("skill1") +
                ", dash 100 dmg + 20 arrows for 400 dmg, 30s cooldown",
            ],
            [
              "Arrow Rain",
              primaryKey("skill2") +
                ", 15-20 falling arrows, 60 dmg each, 45s cooldown",
            ],
          ]
        : heroType === "ronin"
          ? [
              ["Move", shared[0][1]],
              ["Jump", shared[1][1]],
              [
                "Twin-katana attack",
                twoKeys("attack") + ", 100 damage, 20 stamina",
              ],
              [
                "Deflect",
                twoKeys("parry") +
                  ", forgiving timing; 15 deflects stagger and deal 600",
              ],
              ["Teleport dodge", twoKeys("dodge") + ", 20 stamina"],
              shared[4],
              shared[5],
              [
                "Scarlet Lunge",
                primaryKey("skill1") + ", 300 damage, 30s cooldown",
              ],
              [
                "Bloodflame",
                primaryKey("skill2") +
                  ", +50 attack damage for 20s, 60s cooldown",
              ],
            ]
          : heroType === "regal"
            ? [
                ["Move", shared[0][1]],
                ["Jump", shared[1][1]],
                ["Regal sword", twoKeys("attack") + ", 90 damage, 20 stamina"],
                ["Pistol shot", twoKeys("parry") + ", 70 damage, 20 stamina"],
                shared[2],
                shared[3],
                shared[4],
                shared[5],
                [
                  "Black Starfall",
                  primaryKey("skill1") +
                    ", 8 falling orbs × 80 damage, 30s cooldown",
                ],
                [
                  "Abyss Cannon",
                  primaryKey("skill2") +
                    ", fast black hand-beam, 800 damage, 80s cooldown",
                ],
              ]
            : heroType === "wizard"
              ? [
                  ["Move", shared[0][1]],
                  ["Jump", shared[1][1]],
                  [
                    "Arcane Missile",
                    twoKeys("attack") + ", 100 damage, 20 stamina",
                  ],
                  [
                    "Conjured Sword",
                    twoKeys("parry") + ", 70 damage, 10 stamina",
                  ],
                  ["Blue teleport dodge", twoKeys("dodge") + ", 20 stamina"],
                  shared[4],
                  shared[5],
                  [
                    "Graveguard Trio",
                    primaryKey("skill1") +
                      ", summon 3 skeletons (300 HP), 40s cooldown",
                  ],
                  [
                    "Astral Comet",
                    primaryKey("skill2") +
                      ", charged beam, 1000 damage, 99s cooldown",
                  ],
                ]
              : [
                  ["Move", shared[0][1]],
                  ["Jump", shared[1][1]],
                  ["Attack", twoKeys("attack")],
                  ["Parry", twoKeys("parry")],
                  shared[2],
                  shared[3],
                  shared[4],
                  [
                    "Plunge strike",
                    primaryKey("down") +
                      " + " +
                      primaryKey("attack") +
                      " in the air",
                  ],
                  shared[5],
                  [
                    "Sunray Slash",
                    primaryKey("skill1") + ", 300 dmg, 30s cooldown",
                  ],
                  [
                    "Cinder Bomb",
                    primaryKey("skill2") + ", 800 dmg up close, 80s cooldown",
                  ],
                ];
    for (const r of rows) {
      const b = document.createElement("b");
      b.textContent = r[0];
      const s = document.createElement("span");
      s.textContent = r[1];
      T.appendChild(b);
      T.appendChild(s);
    }
  }
  function renderKeyTable() {
    const T = $("keyTable");
    T.innerHTML = "";
    const source = bindPlayer === 2 ? binds2 : binds;
    for (const [a, label] of ACTIONS) {
      const row = document.createElement("div");
      row.className = "krow";
      const l = document.createElement("span");
      l.className = "kl";
      l.textContent = label;
      row.appendChild(l);
      for (let s = 0; s < 3; s++) {
        const on = capturing && capturing.a === a && capturing.s === s;
        const b = document.createElement("button");
        b.className = "slot" + (on ? " cap" : "");
        b.textContent = on ? "press a key..." : keyLabel(source[a][s]);
        b.setAttribute("aria-label", label + " key " + (s + 1));
        b.addEventListener("click", () => startCapture(a, s));
        row.appendChild(b);
      }
      T.appendChild(row);
    }
  }
  function renderPadTable() {
    const T = $("padTable");
    if (!T) return;
    T.innerHTML = "";
    const map = padMaps[bindPlayer - 1];
    for (const [action, label] of ACTIONS) {
      const row = document.createElement("label");
      row.className = "pad-row";
      const span = document.createElement("span");
      span.textContent = label;
      const select = document.createElement("select");
      for (const [value, name] of PAD_OPTIONS) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = name;
        select.appendChild(option);
      }
      select.value = map[action] || DEFAULT_PAD_MAP[action];
      select.addEventListener("change", () => {
        map[action] = select.value;
        saveSettings();
      });
      row.append(span, select);
      T.appendChild(row);
    }
  }
  function gamepadValue(gp, binding) {
    if (!gp || !binding) return 0;
    if (binding.startsWith("b")) {
      const b = gp.buttons[+binding.slice(1)];
      return b && (b.pressed || b.value > 0.55) ? 1 : 0;
    }
    const m = /^axis(\d+)([+-])$/.exec(binding);
    if (!m) return 0;
    const v = gp.axes[+m[1]] || 0;
    return m[2] === "+" ? (v > 0.35 ? 1 : 0) : v < -0.35 ? 1 : 0;
  }
  function pollGamepads() {
    const pads = navigator.getGamepads
      ? Array.from(navigator.getGamepads()).filter(Boolean)
      : [];
    if ($("gamepadStatus"))
      $("gamepadStatus").textContent = pads.length
        ? pads
            .slice(0, 2)
            .map((p, i) => "P" + (i + 1) + ": " + p.id.replace(/\s*\([^)]*\)\s*/g, "").slice(0, 28))
            .join(" · ")
        : "No controller detected";
    for (let player = 0; player < 2; player++) {
      const gp = pads[player],
        map = padMaps[player],
        targetBuf = player === 0 ? buf : buf2;
      for (const [action] of ACTIONS) {
        const now = !!gamepadValue(gp, map[action]),
          was = !!padPrev[player][action];
        if (HELD_KEYS.includes(action)) padHeld[player][action] = now ? 1 : 0;
        else if (now && !was) targetBuf[action] = BUF;
        padPrev[player][action] = now;
      }
    }
  }
  function startCapture(a, s) {
    capturing = { a, s, player: bindPlayer };
    renderKeyTable();
    $("capPad").classList.remove("hide");
    setMsg(
      'Now press the new key for "' +
        labelOf(a) +
        '". Esc cancels. Backspace clears this box.',
    );
  }
  function endCapture(msg) {
    capturing = null;
    $("capPad").classList.add("hide");
    renderKeyTable();
    renderTitleKeys();
    saveSettings();
    if (msg) setMsg(msg);
  }
  function assignKey(code) {
    const { a, s, player } = capturing,
      target = player === 2 ? binds2 : binds,
      other = player === 2 ? binds : binds2;
    let moved = "";
    for (const x in target)
      for (let i = 0; i < 3; i++)
        if (target[x][i] === code && !(x === a && i === s)) {
          target[x][i] = "";
          if (x !== a) moved = x;
        }
    for (const x in other)
      for (let i = 0; i < 3; i++)
        if (other[x][i] === code) other[x][i] = "";
    target[a][s] = code;
    rebuildMap();
    const empty = ACTIONS.filter((r) => !target[r[0]].some((x) => x)).map(
      (r) => r[1],
    );
    let msg =
      keyLabel(code) +
      ' is now set for Player ' +
      player +
      ' "' +
      labelOf(a) +
      '".';
    if (moved)
      msg =
        keyLabel(code) +
        ' moved from "' +
        labelOf(moved) +
        '" to "' +
        labelOf(a) +
        '".';
    if (empty.length)
      msg += " Warning, no key set for: " + empty.join(", ") + ".";
    endCapture(msg);
  }
  function openSettings(from, player = 1) {
    settingsFrom = from;
    settingsOpen = true;
    bindPlayer = player;
    capturing = null;
    if ($("bindPlayer")) $("bindPlayer").value = String(bindPlayer);
    renderKeyTable();
    renderPadTable();
    setConsoleBindLabel();
    $("capPad").classList.add("hide");
    setMsg(
      "Editing Player " +
        bindPlayer +
        ". Click a key box, then press the new key. Each action can have up to three keys.",
    );
    $("volMusic").value = Math.round(audioCfg.music * 100);
    $("volSfx").value = Math.round(audioCfg.sfx * 100);
    $("resolutionScale").value = String(profile.resolution);
    $("graphicsMode").value = profile.graphics;
    if (from === "pause") $("pause").classList.add("hide");
    $("settings").classList.remove("hide");
  }
  function closeSettings() {
    settingsOpen = false;
    capturing = null;
    saveSettings();
    $("settings").classList.add("hide");
    if (settingsFrom === "pause") $("pause").classList.remove("hide");
  }
  function clearInputState() {
    held.left = held.right = held.down = held.block = 0;
    for (const k in buf) buf[k] = 0;
    held2.left = held2.right = held2.down = held2.block = 0;
    for (const k in buf2) buf2[k] = 0;
    for (const p of padHeld)
      p.left = p.right = p.down = p.block = 0;
  }
  function openPause() {
    if (paused) return;
    paused = true;
    clearInputState();
    $("pause").classList.remove("hide");
  }
  function closePause() {
    paused = false;
    $("pause").classList.add("hide");
  }
  const isPlaying = () =>
    phase === "intro" ||
    phase === "fight" ||
    phase === "won" ||
    phase === "lost";

  /* ================= INPUT ================= */
  let held = { left: 0, right: 0, down: 0, block: 0 };
  const held2 = { left: 0, right: 0, down: 0, block: 0 };
  const HELD_KEYS = ["left", "right", "down", "block"];
  let buf = {
    attack: 0,
    parry: 0,
    dodge: 0,
    jump: 0,
    heal: 0,
    skill1: 0,
    skill2: 0,
  };
  const buf2 = {
    attack: 0,
    parry: 0,
    dodge: 0,
    jump: 0,
    heal: 0,
    skill1: 0,
    skill2: 0,
  };
  const BUF = 0.17;
  function toggleFS() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) document.exitFullscreen();
  }
  function press(a) {
    if (HELD_KEYS.includes(a)) held[a] = 1;
    else buf[a] = BUF;
  }
  function pressP2(a) {
    if (HELD_KEYS.includes(a)) held2[a] = 1;
    else buf2[a] = BUF;
  }
  function release(a) {
    if (HELD_KEYS.includes(a)) held[a] = 0;
  }
  function releaseP2(a) {
    if (HELD_KEYS.includes(a)) held2[a] = 0;
  }
  function isActionHeld(action) {
    return !!held[action] || !!padHeld[activePlayerIndex][action];
  }
  // While a key box is waiting for a key, this runs first and swallows the event.
  addEventListener(
    "keydown",
    (e) => {
      if (!capturing && !consoleCapture) return;
      e.preventDefault();
      e.stopPropagation();
      const code = normCode(e.code);
      if (consoleCapture) {
        if (code === "Escape") {
          consoleCapture = false;
          setConsoleBindLabel();
          setMsg("Console key change cancelled.");
          return;
        }
        if (code === "Enter") return;
        profile.consoleKey = code;
        consoleCapture = false;
        setConsoleBindLabel();
        saveProfile();
        setMsg("Command console is now bound to " + keyLabel(code) + ".");
        return;
      }
      if (code === "Escape") {
        endCapture("Cancelled.");
        return;
      }
      if (code === "Backspace" || code === "Delete") {
        const source = capturing.player === 2 ? binds2 : binds;
        source[capturing.a][capturing.s] = "";
        rebuildMap();
        endCapture("Cleared.");
        return;
      }
      if (RESERVED.includes(code)) {
        setMsg(
          keyLabel(code) +
            " is reserved for menus (Esc, Enter, F, M, 1, 2). Pick another key.",
        );
        return;
      }
      assignKey(code);
    },
    true,
  );
  addEventListener("keydown", (e) => {
    if (capturing || consoleCapture) return;
    const code = normCode(e.code);
    if (consoleOpen) {
      if (code === "Escape" || code === profile.consoleKey) {
        e.preventDefault();
        toggleConsole(false);
      }
      return;
    }
    if (!settingsOpen && code === profile.consoleKey) {
      e.preventDefault();
      toggleConsole(true);
      return;
    }
    if (code === "Escape") {
      e.preventDefault();
      if (settingsOpen) closeSettings();
      else if (paused) closePause();
      else if (
        phase === "title" &&
        (!$("bossSelect").classList.contains("hide") ||
          !$("loadout").classList.contains("hide") ||
          !$("shop").classList.contains("hide"))
      )
        showFrontScreen("title");
      else if (isPlaying()) openPause();
      return;
    }
    if (code === "KeyM") {
      $("mute").click();
      return;
    }
    if (settingsOpen) return;
    if (code === "KeyF") {
      e.preventDefault();
      toggleFS();
      return;
    }
    const onButton =
      document.activeElement && document.activeElement.tagName === "BUTTON";
    if (
      phase === "title" &&
      !$("bossSelect").classList.contains("hide") &&
      (code === "Digit1" ||
        code === "Digit2" ||
        code === "Digit3" ||
        code === "Digit5")
    ) {
      e.preventDefault();
      startGame(
        code === "Digit1"
          ? "sentinel"
          : code === "Digit2"
            ? "art"
            : code === "Digit3"
              ? "shogun"
              : "demon",
      );
      return;
    }
    if (
      phase === "title" &&
      !$("loadout").classList.contains("hide") &&
      (code === "Digit3" || code === "Digit4" || code === "Digit6")
    ) {
      e.preventDefault();
      pickHero(
        code === "Digit3" ? "knight" : code === "Digit4" ? "shadow" : "ronin",
      );
      renderLoadout();
      return;
    }
    if (
      code === "Enter" &&
      phase === "title" &&
      !$("title").classList.contains("hide") &&
      !onButton
    ) {
      e.preventDefault();
      showFrontScreen("bossSelect");
      return;
    }
    if (code === "KeyR" && (phase === "lostUI" || phase === "wonUI")) {
      e.preventDefault();
      startGame();
      return;
    }
    if (paused) return;
    if (gameMode !== "solo" && codeMap2[code]) {
      e.preventDefault();
      if (!e.repeat) {
        ac();
        pressP2(codeMap2[code]);
      }
      return;
    }
    const a = codeMap[code];
    if (!a) return;
    e.preventDefault();
    if (e.repeat) return;
    ac();
    press(a);
  });
  addEventListener("keyup", (e) => {
    const code = normCode(e.code);
    if (gameMode !== "solo" && codeMap2[code]) {
      e.preventDefault();
      releaseP2(codeMap2[code]);
      return;
    }
    const a = codeMap[code];
    if (a) {
      e.preventDefault();
      release(a);
    }
  });
  addEventListener("blur", () => {
    held.left = held.right = held.down = held.block = 0;
    held2.left = held2.right = held2.down = held2.block = 0;
    for (const p of padHeld)
      p.left = p.right = p.down = p.block = 0;
    if (phase === "intro" || phase === "fight") openPause();
  });
  cv.addEventListener("mousedown", (e) => {
    ac();
    e.preventDefault();
    if (paused || settingsOpen) return;
    const a = codeMap["Mouse" + e.button];
    if (a) press(a);
  });
  addEventListener("mouseup", (e) => {
    const a = codeMap["Mouse" + e.button];
    if (a) release(a);
  });
  stage.addEventListener("contextmenu", (e) => e.preventDefault());
  $("capPad").addEventListener("mousedown", (e) => {
    if (!capturing) return;
    e.preventDefault();
    assignKey("Mouse" + e.button);
  });
  document.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest && e.target.closest("button");
      if (e.detail > 0 && b) b.blur();
    },
    true,
  );
  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest && e.target.closest("button");
    if (!b || b.disabled || b.contains(e.relatedTarget)) return;
    tone(330, 0.035, "sine", 0.018, 90);
  });
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest && e.target.closest("button");
    if (!b || b.disabled) return;
    const r = b.getBoundingClientRect(),
      q = document.createElement("span");
    q.className = "ui-ripple";
    q.style.left = e.clientX - r.left + "px";
    q.style.top = e.clientY - r.top + "px";
    b.appendChild(q);
    setTimeout(() => q.remove(), 520);
    tone(190, 0.055, "triangle", 0.035, 150);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("button");
    if (b && !b.disabled) tone(520, 0.07, "sine", 0.04, 160);
  });
  document.querySelectorAll(".tb").forEach((b) => {
    const a = b.dataset.a;
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      ac();
      b.setPointerCapture(e.pointerId);
      b.classList.add("on");
      press(a);
    });
    const up = (e) => {
      e.preventDefault();
      b.classList.remove("on");
      release(a);
    };
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
    b.addEventListener("lostpointercapture", up);
  });
  if (matchMedia("(pointer:coarse)").matches || "ontouchstart" in window)
    $("touch").classList.remove("hide");
  // settings + pause buttons
  $("openSettings").addEventListener("click", () => openSettings("title"));
  $("consoleBind").addEventListener("click", () => {
    consoleCapture = true;
    setConsoleBindLabel();
    setMsg("Press the key that should open the command console. Esc cancels.");
  });
  $("consoleInput").addEventListener("keydown", (e) => {
    if (e.code === "Enter") {
      e.preventDefault();
      runConsoleCommand(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  });
  $("editP1Controls").addEventListener("click", () =>
    openSettings("multiplayer", 1),
  );
  $("editP2Controls").addEventListener("click", () =>
    openSettings("multiplayer", 2),
  );
  $("bindPlayer").addEventListener("change", (e) => {
    bindPlayer = +e.target.value === 2 ? 2 : 1;
    capturing = null;
    $("capPad").classList.add("hide");
    renderKeyTable();
    renderPadTable();
    setMsg("Editing Player " + bindPlayer + " controls.");
  });
  $("closeSettings").addEventListener("click", closeSettings);
  $("resetBinds").addEventListener("click", () => {
    resetBinds();
    capturing = null;
    $("capPad").classList.add("hide");
    renderKeyTable();
    renderPadTable();
    renderTitleKeys();
    saveSettings();
    setMsg("Controls reset to the defaults.");
  });
  $("volMusic").addEventListener("input", (e) => {
    audioCfg.music = clamp(+e.target.value / 100, 0, 1);
    applyVolumes();
  });
  $("volSfx").addEventListener("input", (e) => {
    audioCfg.sfx = clamp(+e.target.value / 100, 0, 1);
    applyVolumes();
  });
  $("volMusic").addEventListener("change", saveSettings);
  $("volSfx").addEventListener("change", saveSettings);
  $("resolutionScale").addEventListener("change", (e) => {
    profile.resolution = e.target.value;
    applyVideoSettings();
    saveProfile();
    buildBG();
    tone(620, 0.08, "sine", 0.045, 120);
    toast(
      "Resolution applied: " + e.target.options[e.target.selectedIndex].text,
    );
  });
  $("graphicsMode").addEventListener("change", (e) => {
    profile.graphics = e.target.value;
    applyVideoSettings();
    buildBG();
    saveProfile();
    toast(
      profile.graphics === "low"
        ? "Low: 50% render scale, minimal particles and no fog."
        : profile.graphics === "medium"
          ? "Medium: 75% render scale and reduced effects."
          : "High: full selected resolution and full effects.",
    );
  });
  $("pauseBtn").addEventListener("click", () => {
    if (isPlaying()) (paused ? closePause : openPause)();
  });
  $("resumeBtn").addEventListener("click", closePause);
  $("pauseSettings").addEventListener("click", () => openSettings("pause"));
  $("quitBtn").addEventListener("click", () => {
    closePause();
    toTitle();
  });
  loadSettings();
  renderTitleKeys();
  relabelTouch();
  // the browser only allows sound after a click or key press, so start the title music then
  function firstGesture() {
    ac();
    setTimeout(() => {
      if (phase === "title") musicPlay("title");
    }, 260);
  }
  addEventListener("pointerdown", firstGesture, { once: true, capture: true });
  addEventListener("keydown", firstGesture, { once: true, capture: true });

  /* ================= SHADOW (second hero): ranger with a bow ================= */
  const HERO_STATS = {
    knight: { hp: 500, st: 140, flasks: 7 },
    shadow: { hp: 400, st: 200, flasks: 6 },
    ronin: { hp: 500, st: 300, flasks: 6 },
    regal: { hp: 450, st: 250, flasks: 6 },
    wizard: { hp: 300, st: 200, flasks: 6 },
    killnux: { hp: 600, st: 300, flasks: 6 },
    wraithknight: { hp: 500, st: 300, flasks: 6 },
    thor: { hp: 500, st: 400, flasks: 6 },
  };
  const arrows = [],
    rain = [],
    regalShots = [],
    regalMeteors = [],
    regalBeams = [],
    wizardMissiles = [],
    skeletons = [],
    killWaves = [],
    wraithKnightBolts = [],
    thorBolts = [],
    thorHammers = [];
  const SHADOW_SKILL1_CD = 30,
    SHADOW_SKILL2_CD = 45,
    RONIN_SKILL1_CD = 30,
    RONIN_SKILL2_CD = 60,
    REGAL_SKILL1_CD = 30,
    REGAL_SKILL2_CD = 80,
    WIZARD_SKILL1_CD = 40,
    WIZARD_SKILL2_CD = 99,
    KILLNUX_SKILL1_CD = 30,
    KILLNUX_SKILL2_CD = 60,
    WRAITH_KNIGHT_SKILL1_CD = 40,
    WRAITH_KNIGHT_SKILL2_CD = 90,
    THOR_SKILL1_CD = 45,
    THOR_SKILL2_CD = 80;
  function skill1MaxCD() {
    return heroType === "shadow"
      ? SHADOW_SKILL1_CD
      : heroType === "ronin"
        ? RONIN_SKILL1_CD
        : heroType === "regal"
          ? REGAL_SKILL1_CD
          : heroType === "wizard"
            ? WIZARD_SKILL1_CD
            : heroType === "killnux"
              ? KILLNUX_SKILL1_CD
              : heroType === "wraithknight"
                ? WRAITH_KNIGHT_SKILL1_CD
              : heroType === "thor"
                ? THOR_SKILL1_CD
              : SKILL1_CD;
  }
  function skill2MaxCD() {
    return heroType === "shadow"
      ? SHADOW_SKILL2_CD
      : heroType === "ronin"
        ? RONIN_SKILL2_CD
        : heroType === "regal"
          ? REGAL_SKILL2_CD
          : heroType === "wizard"
            ? WIZARD_SKILL2_CD
            : heroType === "killnux"
              ? KILLNUX_SKILL2_CD
              : heroType === "wraithknight"
                ? WRAITH_KNIGHT_SKILL2_CD
              : heroType === "thor"
                ? THOR_SKILL2_CD
              : SKILL2_CD;
  }
  const PAL_SH = {
    dark: "#0d0c12",
    mid: "#232230",
    light: "#3c3a49",
    trim: "#5a5566",
    fur: "#5a5148",
    furLight: "#8a7d6e",
    leg: "#1c1b24",
    legFar: "#100f16",
    cloak: "#17151e",
    cloakDark: "#0a090e",
    strap: "#4a3a2a",
    glow: "#7ff0e6",
    glowCore: "#e8fffb",
    glowDark: "#0f6f6c",
    outline: "#020103",
  };

  function fireBasicArrow() {
    sfx("shot");
    const pb = GROUND - P.y;
    arrows.push({
      owner: activePlayerIndex,
      x: P.x + P.face * 30,
      y: P.y - 80,
      vx: P.face * 1500,
      life: 1.1,
      t: 0,
      hit: false,
      pb,
      dmg: 60,
      kind: "basic",
    });
    spark(P.x + P.face * 26, P.y - 80, 8, "#bdf3f0", 300, 0.28);
  }
  function startShot(dir) {
    P.state = "shot";
    P.t = 0;
    P.shotFired = false;
    if (dir) P.face = dir;
    P.vx *= 0.5;
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.5;
  }
  function startTeleport(dir) {
    P.state = "teleport";
    P.t = 0;
    P.rt = "wind";
    P.teleDir = dir || P.face;
    if (dir) P.face = dir;
    P.st = Math.max(0, P.st - 50);
    P.stDelay = 0.6;
    P.invuln = Math.max(P.invuln, 0.3);
    buf.parry = 0;
    P.vx = 0;
    P.vy = 0;
    spark(P.x, P.y - 55, 10, "#5a3aa8", 260, 0.3);
  }
  function startRoninDodge(dir) {
    P.state = "teleport";
    P.t = 0;
    P.rt = "wind";
    P.teleDir = dir || P.face;
    if (dir) P.face = dir;
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.5;
    P.invuln = Math.max(P.invuln, 0.34);
    buf.dodge = 0;
    P.vx = 0;
    P.vy = 0;
    const wizardDodge = heroType === "wizard";
    spark(P.x, P.y - 55, 18, wizardDodge ? "#258cff" : "#ff244c", 340, 0.38, 0);
    addRing(
      P.x,
      P.y - 58,
      6,
      62,
      0.3,
      wizardDodge ? "rgba(35,145,255,.85)" : "rgba(255,35,75,.8)",
      4,
    );
  }
  function startRoninSkill1() {
    P.state = "roninLunge";
    P.t = 0;
    P.skill1CD = RONIN_SKILL1_CD;
    buf.skill1 = 0;
    P.face = B.x >= P.x ? 1 : -1;
    P.roninStartX = P.x;
    P.roninTargetX = clamp(B.x - P.face * 72, 50, WORLD - 50);
    P.roninHit = false;
    P.invuln = Math.max(P.invuln, 0.28);
    sfx("skill1");
  }
  function startRoninSkill2() {
    P.state = "roninFlame";
    P.t = 0;
    P.skill2CD = RONIN_SKILL2_CD;
    buf.skill2 = 0;
    P.vx = 0;
    sfx("charge");
  }
  function startRegalSword(dir) {
    P.state = "regalSword";
    P.t = 0;
    P.regalHit = false;
    P.regalFx = false;
    if (dir) P.face = dir;
    P.vx *= 0.35;
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.65;
    buf.attack = 0;
  }
  function startRegalGun(dir) {
    P.state = "regalGun";
    P.t = 0;
    P.shotFired = false;
    if (dir) P.face = dir;
    P.vx *= 0.45;
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.55;
    buf.parry = 0;
  }
  function fireRegalShot() {
    sfx("shot");
    const pb = GROUND - P.y;
    regalShots.push({
      owner: activePlayerIndex,
      x: P.x + P.face * 36,
      y: P.y - 78,
      vx: P.face * 1450,
      t: 0,
      life: 1.15,
      hit: false,
      pb,
      dmg: 70,
    });
    spark(P.x + P.face * 38, P.y - 78, 16, "#ffd56b", 430, 0.32, 0);
    addRing(P.x + P.face * 38, P.y - 78, 3, 28, 0.16, "rgba(255,205,95,.9)", 3);
  }
  function startRegalSkill1() {
    P.state = "regalOrb";
    P.t = 0;
    P.skill1CD = REGAL_SKILL1_CD;
    P.regalOrbFired = false;
    buf.skill1 = 0;
    P.vx = 0;
    P.face = B.x >= P.x ? 1 : -1;
    sfx("charge");
  }
  function castRegalOrb() {
    const tx = clamp(B.x, 100, WORLD - 100),
      ty = 112;
    regalMeteors.push({
      owner: activePlayerIndex,
      kind: "carrier",
      x: P.x + P.face * 30,
      y: P.y - 88,
      sx: P.x + P.face * 30,
      sy: P.y - 88,
      tx,
      ty,
      t: 0,
      life: 0.46,
      burst: false,
    });
    spark(P.x + P.face * 30, P.y - 88, 28, "#8d61ff", 500, 0.5, 0);
  }
  function burstRegalOrb(o) {
    sfx("boom");
    doShake(12);
    doFlash(0.28, "80,25,130");
    addRing(o.x, o.y, 16, 150, 0.55, "rgba(120,75,220,.9)", 9);
    for (let i = 0; i < 8; i++)
      regalMeteors.push({
        owner: o.owner || 0,
        kind: "drop",
        x: o.x + (i - 3.5) * 34 + rnd(-10, 10),
        y: o.y + rnd(-18, 18),
        vy: 460 + rnd(0, 90),
        t: 0,
        life: 1.2,
        hit: false,
        dmg: 80,
      });
    addText(o.x, o.y - 25, "BLACK STARFALL", "#c7a7ff", 20, 1);
  }
  function startRegalSkill2() {
    P.state = "regalBeam";
    P.t = 0;
    P.skill2CD = REGAL_SKILL2_CD;
    P.regalBeamFired = false;
    buf.skill2 = 0;
    P.vx = 0;
    P.face = B.x >= P.x ? 1 : -1;
    sfx("charge");
  }
  function fireRegalBeam() {
    sfx("beam");
    doShake(16);
    doFlash(0.35, "55,15,90");
    regalBeams.push({
      owner: activePlayerIndex,
      x: P.x + P.face * 36,
      y: P.y - 72,
      vx: P.face * 980,
      face: P.face,
      t: 0,
      life: 1.35,
      hit: false,
      dmg: 800,
    });
    addRing(
      P.x + P.face * 34,
      P.y - 72,
      8,
      70,
      0.32,
      "rgba(180,110,255,.9)",
      7,
    );
  }
  function updateRegalProjectiles(dt) {
    for (let i = regalShots.length - 1; i >= 0; i--) {
      const a = regalShots[i];
      a.t += dt;
      const oldX = a.x;
      a.x += a.vx * dt;
      const target = projectileTarget(a);
      let dead = a.t > a.life || a.x < 0 || a.x > WORLD;
      if (
        !a.hit &&
        target.state !== "dead" &&
        target.state !== "intro" &&
        sweptXHits(oldX, a.x, target.x, target.hw + 22) &&
        a.pb + 125 > target.h &&
        a.pb - 20 < target.h + target.hh
      ) {
        a.hit = true;
        dead = true;
        hitProjectileTarget(a, a.dmg, 0.05, true, false);
        spark(a.x, a.y, 14, "#ffd56b", 420, 0.34);
        addRing(a.x, a.y, 4, 42, 0.22, "rgba(255,210,100,.9)", 3);
      }
      if (dead) regalShots.splice(i, 1);
    }
    for (let i = regalMeteors.length - 1; i >= 0; i--) {
      const o = regalMeteors[i];
      o.t += dt;
      if (o.kind === "carrier") {
        const k = clamp(o.t / o.life, 0, 1);
        o.x = lerp(o.sx, o.tx, easeOut(k));
        o.y = lerp(o.sy, o.ty, ease(k));
        if (Math.random() < 0.8)
          parts.push({
            k: "dot",
            x: o.x + rnd(-8, 8),
            y: o.y + rnd(-8, 8),
            vx: 0,
            vy: 0,
            life: 0.22,
            t: 0,
            col: "115,70,190",
            g: 0,
            drag: 1,
            sz: rnd(3, 7),
          });
        if (k >= 1) {
          burstRegalOrb(o);
          regalMeteors.splice(i, 1);
        }
      } else {
        o.y += o.vy * dt;
        o.vy += 620 * dt;
        const target = projectileTarget(o);
        if (Math.random() < 0.7)
          parts.push({
            k: "dot",
            x: o.x,
            y: o.y - 12,
            vx: 0,
            vy: 0,
            life: 0.18,
            t: 0,
            col: "115,65,190",
            g: 0,
            drag: 1,
            sz: rnd(3, 6),
          });
        let dead = o.t > o.life;
        if (
          !o.hit &&
          target.state !== "dead" &&
          target.state !== "intro" &&
          Math.abs(o.x - target.x) < target.hw + 34 &&
          o.y >= GROUND - target.h - 10
        ) {
          o.hit = true;
          dead = true;
          hitProjectileTarget(o, o.dmg, 0.04, true, true);
          spark(o.x, o.y, 18, "#a173ff", 480, 0.38);
          addRing(o.x, o.y, 5, 55, 0.25, "rgba(145,90,240,.9)", 5);
        }
        if (!dead && o.y >= GROUND) {
          dead = true;
          spark(o.x, GROUND, 10, "#68429b", 320, 0.3);
          dust(o.x, GROUND, 3);
        }
        if (dead) regalMeteors.splice(i, 1);
      }
    }
    for (let i = regalBeams.length - 1; i >= 0; i--) {
      const q = regalBeams[i];
      q.t += dt;
      const oldX = q.x;
      q.x += q.vx * dt;
      const target = projectileTarget(q);
      let dead = q.t > q.life || q.x < 0 || q.x > WORLD;
      if (
        !q.hit &&
        target.state !== "dead" &&
        target.state !== "intro" &&
        sweptXHits(oldX, q.x, target.x, target.hw + 90) &&
        q.y > GROUND - target.h - target.hh - 55 &&
        q.y < GROUND - target.h + 55
      ) {
        q.hit = true;
        dead = true;
        hitProjectileTarget(q, q.dmg, 0.16, true, true);
        spark(q.x, q.y, 36, "#b37aff", 700, 0.5);
        addRing(q.x, q.y, 12, 115, 0.4, "rgba(160,90,255,.95)", 10);
        doShake(20);
      }
      if (dead) regalBeams.splice(i, 1);
    }
  }
  function drawRegalProjectiles() {
    for (const a of regalShots) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.scale(Math.sign(a.vx), 1);
      ctx.shadowColor = "#ffd56b";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#fff1aa";
      ctx.fillRect(-18, -2, 36, 4);
      ctx.fillStyle = "#d59a35";
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(10, -6);
      ctx.lineTo(10, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    for (const o of regalMeteors) {
      ctx.save();
      ctx.translate(o.x, o.y);
      const r = o.kind === "carrier" ? 24 : 13;
      const g = ctx.createRadialGradient(-r * 0.25, -r * 0.3, 2, 0, 0, r);
      g.addColorStop(0, "#f4ddff");
      g.addColorStop(0.25, "#8c4fda");
      g.addColorStop(0.65, "#26123f");
      g.addColorStop(1, "rgba(0,0,0,.05)");
      ctx.fillStyle = g;
      ctx.shadowColor = "#8d58d8";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#d7adff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    for (const q of regalBeams) {
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.scale(q.face, 1);
      const pulse = 1 + Math.sin(time * 45) * 0.08;
      const g = ctx.createLinearGradient(-95, 0, 95, 0);
      g.addColorStop(0, "rgba(10,2,18,.15)");
      g.addColorStop(0.35, "#1a062a");
      g.addColorStop(0.7, "#6d2aa5");
      g.addColorStop(1, "rgba(210,160,255,.15)");
      ctx.fillStyle = g;
      ctx.shadowColor = "#7028ad";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.ellipse(0, 0, 100, 25 * pulse, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(245,225,255,.85)";
      ctx.beginPath();
      ctx.ellipse(18, 0, 78, 6 * pulse, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ================= ARCANE WIZARD ================= */
  function startWizardMissile(dir) {
    P.state = "wizardMissile";
    P.t = 0;
    P.shotFired = false;
    if (dir) P.face = dir;
    P.vx *= 0.35;
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.55;
    buf.attack = 0;
    sfx("charge");
  }
  function fireWizardMissile() {
    wizardMissiles.push({
      owner: activePlayerIndex,
      x: P.x + P.face * 36,
      y: P.y - 76,
      vx: P.face * 1080,
      t: 0,
      life: 1.65,
      hit: false,
      dmg: 100,
      trail: [],
    });
    spark(P.x + P.face * 35, P.y - 76, 24, "#63c9ff", 420, 0.42, 0);
    addRing(
      P.x + P.face * 34,
      P.y - 76,
      4,
      38,
      0.24,
      "rgba(105,210,255,.9)",
      3,
    );
    sfx("shot");
  }
  function startWizardSword(dir) {
    P.state = "wizardSword";
    P.t = 0;
    P.wizardHit = false;
    P.wizardFx = false;
    if (dir) P.face = dir;
    P.vx *= 0.3;
    P.st = Math.max(0, P.st - 10);
    P.stDelay = 0.45;
    buf.parry = 0;
    sfx("charge");
  }
  function startWizardSummon() {
    P.state = "wizardSummon";
    P.t = 0;
    P.vx = 0;
    P.skill1CD = WIZARD_SKILL1_CD;
    P.skill1Fired = false;
    P.invuln = Math.max(P.invuln, 0.72);
    buf.skill1 = 0;
    sfx("charge");
  }
  function summonSkeletons() {
    const owner = gameMode === "solo" ? 0 : activePlayerIndex;
    // Recasting replaces only this wizard's trio. In local multiplayer both
    // players can therefore keep their own summons active at the same time.
    for (let i = skeletons.length - 1; i >= 0; i--)
      if ((skeletons[i].owner || 0) === owner) skeletons.splice(i, 1);
    const target =
      gameMode === "pvp" ? players[owner === 0 ? 1 : 0] : B;
    const face = target.x >= P.x ? 1 : -1;
    for (let i = 0; i < 3; i++) {
      const x = clamp(P.x + face * (82 + i * 76), 45, WORLD - 45);
      skeletons.push({
        x,
        owner,
        rank: i,
        hp: 300,
        maxhp: 300,
        face,
        state: "spawn",
        t: 0,
        attackT: 0,
        stride: i * 1.8,
        flash: 0,
        alpha: 0,
      });
      addRing(x, GROUND - 4, 8, 48, 0.55, "rgba(85,190,255,.85)", 4);
      spark(x, GROUND - 45, 18, "#78d6ff", 260, 0.65, -60);
    }
    sfx("skill1");
  }
  function startWizardBeam() {
    P.state = "wizardBeam";
    P.t = 0;
    P.vx = 0;
    P.skill2CD = WIZARD_SKILL2_CD;
    P.skill2Fired = false;
    P.skill2Hit = false;
    P.invuln = Math.max(P.invuln, 1.75);
    P.face = B.x >= P.x ? 1 : -1;
    buf.skill2 = 0;
    sfx("charge");
  }
  function updateWizardSystems(dt) {
    for (let i = wizardMissiles.length - 1; i >= 0; i--) {
      const m = wizardMissiles[i],
        target = projectileTarget(m);
      m.t += dt;
      m.life -= dt;
      const oldX = m.x;
      m.trail.push({ x: m.x, y: m.y, a: 1 });
      if (m.trail.length > 10) m.trail.shift();
      for (const q of m.trail) q.a *= 0.8;
      const targetY =
        gameMode === "pvp"
          ? target.y - 72
          : GROUND - (target.type === "demon" ? 118 : 92);
      m.y += (targetY - m.y) * Math.min(1, dt * 3.5);
      m.x += m.vx * dt;
      if (
        !m.hit &&
        target.state !== "dead" &&
        sweptXHits(oldX, m.x, target.x, target.hw + 34) &&
        Math.abs(m.y - targetY) < target.hh * 0.7
      ) {
        m.hit = true;
        hitProjectileTarget(m, m.dmg, 0.07, true, false);
        spark(m.x, m.y, 30, "#80ddff", 520, 0.48, 0);
        addRing(m.x, m.y, 5, 58, 0.28, "rgba(110,220,255,.95)", 5);
        doShake(5);
        sfx("hit");
      }
      if (m.hit || m.life <= 0 || m.x < 0 || m.x > WORLD)
        wizardMissiles.splice(i, 1);
    }
    for (let i = skeletons.length - 1; i >= 0; i--) {
      const s = skeletons[i];
      const target =
        gameMode === "pvp"
          ? players[(s.owner || 0) === 0 ? 1 : 0]
          : B;
      s.t += dt;
      s.flash = Math.max(0, s.flash - dt);
      if (s.hp <= 0) {
        s.state = "dead";
        s.alpha -= dt * 1.5;
        if (s.alpha <= 0) skeletons.splice(i, 1);
        continue;
      }
      if (s.state === "spawn") {
        s.alpha = Math.min(1, s.alpha + dt * 2.6);
        if (s.t > 0.72) {
          s.state = "walk";
          s.t = 0;
        }
        continue;
      }
      if (phase !== "fight" || !target || target.state === "dead") continue;
      s.face = target.x >= s.x ? 1 : -1;
      const d = Math.abs(target.x - s.x);
      const desired =
        (gameMode === "pvp" ? 30 : target.hw) +
        58 +
        (s.rank || 0) * 46;
      if (s.state === "attack") {
        if (
          s.t >= 0.28 &&
          s.t - dt < 0.28 &&
          d < desired + 24 &&
          (gameMode !== "pvp" || target.y > GROUND - 125)
        ) {
          if (gameMode === "pvp")
            withPlayer(s.owner || 0, () => hitPvpOpponent(50, 0.025), true);
          else hitBoss(50, 0.025, false, false);
          addArc(
            s.x + s.face * 8,
            GROUND - 63,
            54,
            -1.9,
            0.8,
            s.face,
            0.16,
            "rgba(170,225,255,.85)",
            5,
          );
          sfx("hit");
        }
        if (s.t > 0.7) {
          s.state = "walk";
          s.t = 0;
          s.attackT = 0.42;
        }
      } else {
        s.attackT = Math.max(0, s.attackT - dt);
        if (d > desired) {
          s.x += s.face * 118 * dt;
          s.stride += dt * 8;
        } else if (s.attackT <= 0) {
          s.state = "attack";
          s.t = 0;
        }
      }
      if (
        (s.state === "walk" || s.state === "attack") &&
        Math.random() < dt * 5
      )
        parts.push({
          k: "dot",
          x: s.x + rnd(-12, 12),
          y: GROUND - rnd(22, 92),
          vx: rnd(-16, 16),
          vy: rnd(-45, -16),
          life: rnd(0.25, 0.5),
          t: 0,
          col: "90,205,255",
          g: -10,
          drag: 1,
          sz: rnd(1.5, 3),
        });
    }
  }
  function damageSkeleton(s, dmg) {
    if (!s || s.hp <= 0) return false;
    s.hp = Math.max(0, s.hp - dmg);
    s.flash = 0.18;
    spark(s.x, GROUND - 58, 14, "#dff4ff", 280, 0.4, 300);
    addText(s.x, GROUND - 116, "-" + Math.round(dmg), "#bdeaff", 13, 0.55);
    if (s.hp <= 0) {
      s.state = "dead";
      s.alpha = 1;
      sfx("hurt");
    }
    return true;
  }
  function drawWizardSystems() {
    for (const m of wizardMissiles) {
      ctx.save();
      const dir = Math.sign(m.vx) || 1;
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < m.trail.length; i++) {
        const q = m.trail[i];
        const k = (i + 1) / m.trail.length;
        ctx.globalAlpha = k * 0.42;
        ctx.fillStyle = i % 2 ? "#4b8dff" : "#79ddff";
        ctx.beginPath();
        ctx.ellipse(q.x, q.y, 3 + i * 0.45, 1.5 + i * 0.2, 0, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.translate(m.x, m.y);
      ctx.scale(dir, 1);
      ctx.rotate(Math.sin(m.t * 18) * 0.045);
      // spinning glyph halo makes the projectile read as sorcery, not a bullet
      ctx.strokeStyle = "rgba(140,225,255,.82)";
      ctx.lineWidth = 1.6;
      ctx.save();
      ctx.rotate(m.t * 11);
      ctx.beginPath();
      ctx.ellipse(-8, 0, 13, 22, 0, 0, TAU);
      ctx.stroke();
      for (let r = 0; r < 4; r++) {
        const a = (r * TAU) / 4;
        ctx.beginPath();
        ctx.moveTo(-8 + Math.cos(a) * 13, Math.sin(a) * 22);
        ctx.lineTo(-8 + Math.cos(a + 0.45) * 17, Math.sin(a + 0.45) * 26);
        ctx.stroke();
      }
      ctx.restore();
      ctx.shadowColor = "#62d5ff";
      ctx.shadowBlur = 22;
      const g = ctx.createLinearGradient(-20, 0, 28, 0);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, "#a9eeff");
      g.addColorStop(0.75, "#438fff");
      g.addColorStop(1, "#4937d8");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.quadraticCurveTo(5, -12, -22, -6);
      ctx.quadraticCurveTo(-10, 0, -22, 6);
      ctx.quadraticCurveTo(5, 12, 30, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#e7fcff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(27, 0);
      ctx.stroke();
      ctx.restore();
    }
    for (const s of skeletons) {
      if (s.state === "spawn") {
        const k = clamp(s.t / 0.72, 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.translate(s.x, GROUND - 2);
        ctx.scale(1, 0.32);
        ctx.rotate(time * 0.35);
        ctx.strokeStyle = "rgba(75,195,255," + (0.35 + 0.55 * (1 - k)) + ")";
        ctx.shadowColor = "#4ecbff";
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 43, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i * TAU) / 10;
          const r = i % 2 ? 22 : 36;
          const x = Math.cos(a) * r,
            y = Math.sin(a) * r;
          if (!i) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      drawSkeletonMinion(ctx, s);
    }
    if (heroType === "wizard" && P.state === "wizardBeam") {
      const charge = clamp(P.t / 1.0, 0, 1);
      const handX = P.x + P.face * 48,
        handY = P.y - 67;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(105,215,255," + (0.22 + charge * 0.5) + ")";
      ctx.lineWidth = 1.5 + charge * 1.5;
      for (let i = 0; i < 8; i++) {
        const a = time * (2.1 + i * 0.12) + (i * TAU) / 8;
        ctx.beginPath();
        ctx.arc(handX, handY, 14 + charge * (28 + i * 2), a, a + 0.85);
        ctx.stroke();
      }
      // large ritual seal behind the casting hand
      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(time * 0.45);
      ctx.strokeStyle = "rgba(120,225,255," + charge * 0.72 + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 34 * charge, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i * TAU) / 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 20 * charge, Math.sin(a) * 20 * charge);
        ctx.lineTo(Math.cos(a) * 34 * charge, Math.sin(a) * 34 * charge);
        ctx.stroke();
      }
      ctx.restore();
      if (P.t >= 1.0 && P.t <= 1.58) {
        const len = Math.abs(B.x - handX) + 130;
        const x0 = P.face > 0 ? handX : handX - len;
        const grad = ctx.createLinearGradient(
          handX,
          0,
          handX + P.face * len,
          0,
        );
        grad.addColorStop(0, "rgba(235,255,255,.98)");
        grad.addColorStop(0.22, "rgba(120,230,255,.96)");
        grad.addColorStop(0.62, "rgba(66,130,255,.82)");
        grad.addColorStop(0.88, "rgba(92,65,235,.55)");
        grad.addColorStop(1, "rgba(90,45,220,0)");
        ctx.shadowColor = "#5ed8ff";
        ctx.shadowBlur = 38;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x0, handY - 14);
        ctx.lineTo(x0 + len, handY - 42);
        ctx.lineTo(x0 + len, handY + 42);
        ctx.lineTo(x0, handY + 14);
        ctx.closePath();
        ctx.fill();
        const core = ctx.createLinearGradient(
          handX,
          0,
          handX + P.face * len,
          0,
        );
        core.addColorStop(0, "rgba(255,255,255,.98)");
        core.addColorStop(0.38, "rgba(205,250,255,.9)");
        core.addColorStop(0.82, "rgba(115,210,255,.68)");
        core.addColorStop(1, "rgba(100,120,255,0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.moveTo(x0, handY - 3);
        ctx.lineTo(x0 + len, handY - 8);
        ctx.lineTo(x0 + len, handY + 8);
        ctx.lineTo(x0, handY + 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(160,238,255,.75)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const yy = handY + Math.sin(time * 18 + i * 2.1) * (16 + i * 7);
          ctx.beginPath();
          ctx.moveTo(x0, yy);
          ctx.lineTo(x0 + len, yy + Math.sin(time * 9 + i) * 8);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  function startRangerSkill1() {
    P.state = "rskill1";
    P.t = 0;
    P.rPhase = "dash";
    P.skill1CD = SHADOW_SKILL1_CD;
    buf.skill1 = 0;
    P.face = B.x >= P.x ? 1 : -1;
    P.rHit100 = false;
    P.rArrows = 0;
    P.rNextArrow = 0;
    P.rDropped = false;
    P.rStartX = P.x;
    P.rTargetX = clamp(B.x - P.face * 70, 60, WORLD - 60);
    P.invuln = Math.max(P.invuln, 0.22);
    B.execMark = 0;
    sfx("dodge");
  }
  function startRangerSkill2() {
    P.state = "rain2";
    P.t = 0;
    P.skill2CD = SHADOW_SKILL2_CD;
    buf.skill2 = 0;
    P.face = B.x >= P.x ? 1 : -1;
    P.rainFired = false;
    P.vx = 0;
  }
  function launchRain() {
    sfx("skill2rain");
    const cx = clamp(
      B.state !== "dead" && B.state !== "intro" ? B.x : P.x + P.face * 400,
      100,
      WORLD - 100,
    );
    const n = 15 + Math.floor(Math.random() * 6),
      total = 1.7;
    for (let i = 0; i < n; i++)
      rain.push({
        owner: activePlayerIndex,
        x: cx + rnd(-90, 90),
        y: -60 - rnd(0, 80),
        vy: 1350,
        delay: (i / n) * total + rnd(0, 0.06),
        t: 0,
        started: false,
        hit: false,
        dmg: 60,
      });
    addText(cx, 90, "ARROW RAIN", "#8ef0ea", 20, 1);
  }
  function updateArrows(dt) {
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i],
        target = projectileTarget(a);
      a.t += dt;
      const oldX = a.x;
      a.x += a.vx * dt;
      if (Math.random() < 0.7)
        parts.push({
          k: "dot",
          x: a.x - Math.sign(a.vx) * 10,
          y: a.y + rnd(-3, 3),
          vx: -Math.sign(a.vx) * 26,
          vy: rnd(-5, 5),
          life: 0.15,
          t: 0,
          col: "150,235,230",
          g: 0,
          drag: 2,
          sz: rnd(1.6, 3.4),
        });
      let dead = a.t > a.life || a.x < -60 || a.x > WORLD + 60;
      if (!a.hit && target.state !== "dead" && target.state !== "intro") {
        if (
          sweptXHits(oldX, a.x, target.x, target.hw + 18) &&
          a.pb + 125 > target.h &&
          a.pb - 20 < target.h + target.hh
        ) {
          a.hit = true;
          dead = true;
          hitProjectileTarget(a, a.dmg, a.dmg >= 60 ? 0.05 : 0.02, true, a.kind === "barrage");
          spark(a.x, a.y, a.dmg >= 60 ? 12 : 7, "#bdf3f0", 380, 0.32);
          addRing(a.x, a.y, 4, 42, 0.22, "rgba(150,235,230,.85)", 3);
        }
      }
      if (dead) arrows.splice(i, 1);
    }
  }
  function updateRain(dt) {
    for (let i = rain.length - 1; i >= 0; i--) {
      const r = rain[i],
        target = projectileTarget(r);
      r.t += dt;
      if (!r.started) {
        if (r.t >= r.delay) r.started = true;
        else continue;
      }
      r.y += r.vy * dt;
      if (Math.random() < 0.55)
        parts.push({
          k: "dot",
          x: r.x,
          y: r.y - 16,
          vx: 0,
          vy: 0,
          life: 0.14,
          t: 0,
          col: "150,235,230",
          g: 0,
          drag: 1,
          sz: rnd(1.6, 3.2),
        });
      let dead = false;
      if (
        !r.hit &&
        target.state !== "dead" &&
        target.state !== "intro" &&
        Math.abs(r.x - target.x) < target.hw + 70
      ) {
        const landY = GROUND - target.h;
        if (r.y >= landY - 6) {
          r.hit = true;
          dead = true;
          hitProjectileTarget(r, r.dmg, 0.03, true, true);
          spark(r.x, landY, 10, "#bdf3f0", 340, 0.3);
          addRing(r.x, landY, 4, 40, 0.2, "rgba(150,235,230,.8)", 3);
        }
      }
      if (!dead && r.y >= GROUND) {
        dead = true;
        spark(r.x, GROUND, 5, "#6fa8a4", 200, 0.22);
        dust(r.x, GROUND, 2);
      }
      if (dead) rain.splice(i, 1);
    }
  }
  function drawArrowShape(c, x, y, rot, glow) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    if (glow) {
      c.shadowColor = "#7ff0e6";
      c.shadowBlur = glow;
    }
    c.strokeStyle = "#caa06a";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-16, 0);
    c.lineTo(8, 0);
    c.stroke();
    c.fillStyle = "#6a5636";
    c.beginPath();
    c.moveTo(-16, 0);
    c.lineTo(-10, -4);
    c.lineTo(-10, 4);
    c.closePath();
    c.fill();
    c.strokeStyle = "#bdf3f0";
    c.lineWidth = 1.4;
    c.shadowBlur = 0;
    const g = c.createLinearGradient(0, 0, 12, 0);
    g.addColorStop(0, "#0f6f6c");
    g.addColorStop(1, "#e8fffb");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(6, -3.4);
    c.lineTo(13, 0);
    c.lineTo(6, 3.4);
    c.lineTo(8, 0);
    c.closePath();
    c.fill();
    c.restore();
  }
  function drawArrows() {
    for (const a of arrows)
      drawArrowShape(ctx, a.x, a.y, a.vx >= 0 ? 0 : Math.PI, 8);
  }
  function drawRain() {
    for (const r of rain) {
      if (!r.started) continue;
      drawArrowShape(ctx, r.x, r.y, Math.PI / 2, 7);
    }
  }
  function drawExecMark() {
    if (B.execMark == null) return;
    const k = clamp(B.execMark, 0, 1),
      col = `rgb(255,${Math.round(255 - 195 * k)},${Math.round(255 - 205 * k)})`;
    const x = B.x,
      y = GROUND - (B.type === "art" ? 220 : 198) - B.h;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time * 9) * 0.07);
    const s = 12 + 2 * Math.sin(time * 13);
    ctx.strokeStyle = col;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.shadowColor = col;
    ctx.shadowBlur = 8 + 10 * k;
    ctx.beginPath();
    ctx.moveTo(-s, -s);
    ctx.lineTo(s, s);
    ctx.moveTo(s, -s);
    ctx.lineTo(-s, s);
    ctx.stroke();
    ctx.restore();
  }
  function drawBow(c, gx, gy, aimA, drawT, glow) {
    c.save();
    c.translate(gx, gy);
    c.rotate(aimA);
    const pull = 3 + drawT * 11;
    if (glow) {
      c.shadowColor = "#7ff0e6";
      c.shadowBlur = glow;
    }
    c.strokeStyle = "rgba(210,250,247,.95)";
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(0, -26);
    c.quadraticCurveTo(pull, 0, 0, 26);
    c.stroke();
    c.shadowBlur = 0;
    const limb = (sign) => {
      c.strokeStyle = PAL_SH.outline;
      c.lineWidth = 6.5;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(sign * 14, sign * 13 * 0, sign * 10, sign * 15);
      c.quadraticCurveTo(sign * 4, sign * 22, sign * 13, sign * 27);
      c.stroke();
      const g = c.createLinearGradient(0, 0, 0, sign * 27);
      g.addColorStop(0, PAL_SH.glowDark);
      g.addColorStop(0.6, PAL_SH.glow);
      g.addColorStop(1, PAL_SH.glowCore);
      c.strokeStyle = g;
      c.lineWidth = 3.4;
      c.shadowColor = PAL_SH.glow;
      c.shadowBlur = glow ? glow * 0.8 : 5;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(sign * 14, sign * 0, sign * 10, sign * 15);
      c.quadraticCurveTo(sign * 4, sign * 22, sign * 13, sign * 27);
      c.stroke();
      c.shadowBlur = 0;
    };
    limb(-1);
    limb(1);
    c.fillStyle = PAL_SH.mid;
    c.strokeStyle = PAL_SH.outline;
    c.lineWidth = 1;
    c.beginPath();
    c.ellipse(0, 0, 4.4, 7, 0, 0, TAU);
    c.fill();
    c.stroke();
    if (drawT > 0.05) {
      c.strokeStyle = "#caa06a";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(pull - 2, 0);
      c.lineTo(pull - 15, 0);
      c.stroke();
      drawArrowShape(c, pull + 4, 0, 0, 6);
    }
    c.restore();
  }
  function drawRanger(c, o) {
    const p = PAL_SH,
      t = o.t,
      run = o.run || 0,
      air = o.air,
      crouch = o.crouch || 0,
      lean = o.lean || 0;
    c.save();
    c.translate(o.x, o.y);
    c.scale(o.face * o.scale, o.scale);
    if (o.rot) c.rotate(o.rot);
    c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.flash) c.filter = "brightness(2.6) saturate(.4)";
    const hipY = -42 + crouch * 0.9;
    let fA, fB;
    if (air) {
      fA = { x: -7, y: -16 };
      fB = { x: 11, y: -26 };
    } else if (o.slide) {
      fA = { x: -19, y: -2 };
      fB = { x: 23, y: -1 };
    } else if (o.kneel) {
      fA = { x: -20, y: -2 };
      fB = { x: 13, y: 0 };
    } else {
      const ph = o.phase !== undefined ? o.phase : t * 9,
        rx = 16 * run;
      fA = {
        x: -9 * (1 - run) + Math.sin(ph) * rx,
        y: -Math.max(0, Math.cos(ph)) * 9 * run,
      };
      fB = {
        x: 9 * (1 - run) + Math.sin(ph + Math.PI) * rx,
        y: -Math.max(0, Math.cos(ph + Math.PI)) * 9 * run,
      };
    }
    const drawLeg = (hx, f, far) => {
      const k = ik(hx, hipY, f.x, f.y, 22, 22, -1);
      limb(
        c,
        [
          { x: hx, y: hipY },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        10,
        p.outline,
        far ? p.legFar : p.leg,
        p.light,
      );
      c.fillStyle = p.dark;
      c.strokeStyle = p.outline;
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(k.tx + 4, k.ty - 2, 9, 4.6, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = p.strap;
      c.beginPath();
      c.arc(k.x + 1, k.y - 4, 3, 0, TAU);
      c.fill();
    };
    drawLeg(-4, fA, true);
    drawLeg(4, fB, false);

    const sw = Math.sin(t * 1.6) * 2 + run * -8 + (o.clothSway || 0);
    poly(
      c,
      [
        [-9, hipY - 2],
        [10, hipY - 2],
        [15 + sw, hipY + 34],
        [10 + sw, hipY + 28],
        [4 + sw, hipY + 40],
        [-2 + sw, hipY + 30],
        [-8 + sw, hipY + 38],
        [-13 + sw, hipY + 30],
      ],
      p.cloak,
      p.outline,
      1.1,
    );
    c.fillStyle = "rgba(0,0,0,.4)";
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.arc(-4 + i * 4, hipY + 6, 1, 0, TAU);
      c.fill();
    }

    c.save();
    c.translate(0, crouch);
    c.translate(0, -42);
    c.rotate(lean);
    c.translate(0, 42);
    const w1 = Math.sin(t * 3) * 3 + run * 8 + (o.capeBack || 0),
      w2 = Math.sin(t * 3 + 1) * 4 + run * 11 + (o.capeBack || 0) * 1.3;
    poly(
      c,
      [
        [-4, -82],
        [-14, -70],
        [-19 - w1, -42],
        [-24 - w2, -6],
        [-19 - w2, 0],
        [-15 - w1, -8],
        [-10 - w2 * 0.7, 1],
        [-6 - w1 * 0.5, -7],
        [-2, -1],
        [1, -42],
      ],
      p.cloakDark,
      p.outline,
      1.2,
    );

    // quiver on the back
    c.save();
    c.translate(-13, -66);
    c.rotate(-0.3);
    c.fillStyle = p.strap;
    c.fillRect(-4, 0, 8, 22);
    c.strokeStyle = p.outline;
    c.lineWidth = 1;
    c.strokeRect(-4, 0, 8, 22);
    for (let i = -1; i <= 1; i++) {
      c.strokeStyle = "#8a8272";
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(i * 2.6, 0);
      c.lineTo(i * 3.6, -13);
      c.stroke();
      c.fillStyle = "#c8c0ae";
      c.beginPath();
      c.moveTo(i * 3.6, -13);
      c.lineTo(i * 3.6 - 2, -9);
      c.lineTo(i * 3.6 + 2, -9);
      c.closePath();
      c.fill();
    }
    c.restore();

    const tg = c.createLinearGradient(-11, 0, 13, 0);
    tg.addColorStop(0, p.dark);
    tg.addColorStop(0.5, p.mid);
    tg.addColorStop(1, p.light);
    c.beginPath();
    c.moveTo(-10, -78);
    c.quadraticCurveTo(1, -87, 11, -78);
    c.quadraticCurveTo(16, -62, 10, -45);
    c.lineTo(-9, -45);
    c.quadraticCurveTo(-14, -62, -10, -78);
    c.closePath();
    c.fillStyle = tg;
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.5;
    c.stroke();
    c.strokeStyle = p.strap;
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(-9, -76);
    c.lineTo(9, -50);
    c.stroke();
    c.strokeStyle = "rgba(0,0,0,.35)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-8, -68);
    c.quadraticCurveTo(2, -64, 11, -68);
    c.moveTo(-8, -57);
    c.quadraticCurveTo(2, -54, 10, -57);
    c.stroke();
    c.fillStyle = p.dark;
    c.fillRect(-10, -48, 21, 5);
    c.strokeStyle = p.outline;
    c.lineWidth = 1;
    c.strokeRect(-10, -48, 21, 5);
    c.fillStyle = p.strap;
    c.beginPath();
    c.arc(0, -45.5, 2.8, 0, TAU);
    c.fill();

    c.fillStyle = p.dark;
    c.fillRect(-2, -85, 7, 8);
    const hoodGrad = c.createLinearGradient(-10, -110, 12, -80);
    hoodGrad.addColorStop(0, p.light);
    hoodGrad.addColorStop(0.55, p.mid);
    hoodGrad.addColorStop(1, p.dark);
    c.beginPath();
    c.moveTo(-10, -84);
    c.quadraticCurveTo(-13, -104, 0, -112);
    c.quadraticCurveTo(13, -104, 12, -88);
    c.quadraticCurveTo(12, -80, 5, -78);
    c.quadraticCurveTo(-4, -78, -10, -84);
    c.closePath();
    c.fillStyle = hoodGrad;
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.5;
    c.stroke();
    poly(
      c,
      [
        [-9, -86],
        [-11, -98],
        [-2, -108],
        [8, -104],
        [11, -92],
        [4, -86],
        [-2, -90],
      ],
      p.dark,
      null,
    );
    c.fillStyle = "#04070a";
    c.beginPath();
    c.moveTo(-6, -92);
    c.quadraticCurveTo(1, -97, 8, -91);
    c.quadraticCurveTo(9, -83, 1, -80);
    c.quadraticCurveTo(-7, -83, -6, -92);
    c.closePath();
    c.fill();
    const eyeGlow = 6 + Math.sin(time * 3) * 1.5;
    c.fillStyle = p.glowCore;
    c.shadowColor = p.glow;
    c.shadowBlur = eyeGlow;
    c.beginPath();
    c.ellipse(-1.5, -90, 2.6, 1, -0.15, 0, TAU);
    c.fill();
    c.beginPath();
    c.ellipse(4.5, -89.5, 2.6, 1, -0.1, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = p.trim;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-10, -96);
    c.quadraticCurveTo(1, -100, 11, -95);
    c.stroke();

    const pr = 11.5,
      pg = c.createRadialGradient(-2, -80, 1, 2, -76, pr + 2);
    pg.addColorStop(0, p.light);
    pg.addColorStop(0.7, p.mid);
    pg.addColorStop(1, p.dark);
    c.fillStyle = pg;
    c.beginPath();
    c.arc(1, -76, pr, 0, TAU);
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.4;
    c.stroke();
    c.fillStyle = p.furLight;
    c.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.15 + (i / 6) * Math.PI * 1.3;
      c.moveTo(1 + Math.cos(a) * pr, -76 + Math.sin(a) * pr);
      c.arc(1 + Math.cos(a) * pr, -76 + Math.sin(a) * pr, 2.6, 0, TAU);
    }
    c.fill();
    c.strokeStyle = p.trim;
    c.lineWidth = 1;
    c.beginPath();
    c.arc(1, -76, pr - 4, 0.4, 2.6);
    c.stroke();

    if (o.offTarget) {
      const S = { x: 1, y: -76 },
        e = ik(S.x, S.y, o.offTarget.x, o.offTarget.y, 16, 16, -1);
      limb(
        c,
        [S, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
        9,
        p.outline,
        p.mid,
        p.light,
      );
      c.fillStyle = "#1a1720";
      c.strokeStyle = p.furLight;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(e.tx, e.ty, 4.6, 0, TAU);
      c.fill();
      c.stroke();
    }
    if (o.drink > 0) {
      const fx0 = 15,
        fy0 = -90;
      c.save();
      c.translate(fx0, fy0);
      c.rotate(-0.9 * Math.min(1, o.drink));
      c.fillStyle = "#8bf07a";
      c.strokeStyle = p.outline;
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(0, 4, 5, 6, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = "#d9d0b8";
      c.fillRect(-2, -5, 4, 5);
      c.strokeRect(-2, -5, 4, 5);
      c.fillStyle = "#7a4a22";
      c.fillRect(-2.6, -8, 5.2, 3.4);
      c.restore();
    }

    const S = { x: 2, y: -77 },
      R = 32,
      A = o.aimA;
    const gx = S.x + Math.cos(A) * R,
      gy = S.y + Math.sin(A) * R;
    if (!o.hideBow) drawBow(c, gx, gy, A, 0, o.glow || 0);
    const fel = ik(S.x, S.y, gx, gy, 17, 17, -1);
    limb(
      c,
      [S, { x: fel.x, y: fel.y }, { x: fel.tx, y: fel.ty }],
      9,
      p.outline,
      p.mid,
      p.light,
    );
    c.fillStyle = "#1a1720";
    c.strokeStyle = p.furLight;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(fel.tx, fel.ty, 4.8, 0, TAU);
    c.fill();
    c.stroke();

    if (!o.offTarget) {
      const drawT = o.draw || 0,
        backX = lerp(gx * 0.35, -7, drawT),
        backY = lerp(gy * 0.35 - 74, -92, drawT);
      const S2 = { x: -1, y: -76 },
        e2 = ik(S2.x, S2.y, backX, backY, 16, 16, 1);
      limb(
        c,
        [S2, { x: e2.x, y: e2.y }, { x: e2.tx, y: e2.ty }],
        9,
        p.outline,
        p.mid,
        p.light,
      );
      c.fillStyle = "#1a1720";
      c.strokeStyle = p.furLight;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(e2.tx, e2.ty, 4.6, 0, TAU);
      c.fill();
      c.stroke();
      if (!o.hideBow && drawT > 0.04) {
        c.save();
        c.translate(gx, gy);
        c.rotate(A);
        c.strokeStyle = "#caa06a";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(3 + drawT * 11, 0);
        c.lineTo(3 + drawT * 11 - 13, 0);
        c.stroke();
        drawArrowShape(c, 3 + drawT * 11 + 4, 0, 0, 6);
        c.restore();
      }
      if (!o.hideBow) {
        c.save();
        c.translate(gx, gy);
        c.rotate(A);
        const pull = 3 + drawT * 11;
        c.strokeStyle = "rgba(210,250,247,.95)";
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(0, -26);
        c.quadraticCurveTo(pull, 0, 0, 26);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
    c.restore();
  }
  function rangerObj() {
    const air = P.y < GROUND - 3;
    const o = {
      kind: "ranger",
      scale: 1.06,
      x: P.x,
      y: P.y,
      face: P.face,
      t: time,
      run: 0,
      air,
      aimA: -0.12,
      draw: 0,
      crouch: 0,
      lean: 0,
      flash: P.flash > 0,
      alpha: 1,
      glow: 5,
      runSpeed: 9,
      phase: P.stride,
    };
    o.run = P.state === "free" && !air ? Math.min(1, Math.abs(P.vx) / 240) : 0;
    o.aimA = -0.12 + Math.sin(time * 2) * 0.02 - o.run * 0.1;
    o.crouch = P.state === "free" && !air ? 9 * (P.landT / 0.14) : 0;
    o.lean = o.run * 0.08;
    if (
      P.invuln > 0 &&
      P.state !== "dodge" &&
      P.state !== "airdash" &&
      P.state !== "teleport" &&
      Math.floor(time * 30) % 2
    )
      o.alpha = 0.5;
    switch (P.state) {
      case "shot": {
        const k = clamp(P.t / 0.16, 0, 1);
        o.draw =
          k < 0.375 ? ease(k / 0.375) : Math.max(0, 1 - (k - 0.375) / 0.35);
        o.lean = -0.05 * Math.sin(k * Math.PI);
        o.glow = 6 + o.draw * 14;
        o.run = 0;
        break;
      }
      case "teleport": {
        const wind = P.rt === "wind";
        const k = wind ? P.t / 0.07 : P.t / 0.16;
        o.alpha = wind ? 1 - k : k;
        o.aimA = -0.3;
        o.lean = wind ? 0.1 : -0.1;
        o.glow = 18;
        o.run = 0;
        o.hideBow = false;
        break;
      }
      case "rskill1": {
        o.run = 0;
        if (P.rPhase === "dash") {
          o.slide = true;
          o.crouch = 14;
          o.lean = 0.5;
          o.aimA = -0.5;
          o.glow = 16;
        } else if (P.rPhase === "barrage") {
          const saw = (P.t % 0.045) / 0.045;
          o.draw = saw;
          o.lean = -0.03;
          o.aimA = -0.08;
          o.glow = 14;
        } else {
          const k = Math.min(1, P.t / 0.34);
          o.crouch = lerp(20, 6, k);
          o.lean = lerp(0.28, 0, k);
          o.aimA = lerp(-1.1, -0.12, k);
          o.glow = lerp(22, 5, k);
        }
        break;
      }
      case "rain2": {
        const k = clamp(P.t / 0.42, 0, 1);
        o.aimA = lerp(-0.3, -1.55, Math.min(1, k * 2.2));
        o.draw = k < 0.55 ? ease(k / 0.55) : Math.max(0, 1 - (k - 0.55) / 0.3);
        o.lean = -0.1;
        o.glow = 6 + 14 * k;
        o.run = 0;
        break;
      }
      case "dodge":
        o.slide = true;
        o.crouch = 20;
        o.lean = 0.5;
        o.run = 0;
        o.air = false;
        break;
      case "airdash":
        o.air = true;
        o.lean = 0.5;
        o.run = 0;
        break;
      case "block":
        o.crouch = 5;
        o.lean = 0.05;
        o.aimA = -0.02;
        o.glow = 4;
        o.run = Math.min(1, Math.abs(P.vx) / 120) * 0.4;
        break;
      case "hurt":
        o.lean = -0.25;
        o.run = 0;
        break;
      case "heal":
        o.drink = Math.min(1, P.t / 0.5);
        o.crouch = 5;
        o.lean = 0.1;
        o.offTarget = { x: 14, y: -88 };
        o.run = 0;
        break;
      case "dead":
        o.rot = -Math.min(1.5, P.deadT * 3.5);
        o.run = 0;
        o.alpha = clamp(1 - (P.deadT - 1) * 0.8, 0.25, 1);
        break;
      case "free":
        if (air) {
          o.aimA = -0.16;
          o.lean = 0.04;
        }
        break;
    }
    return o;
  }

  /* ================= CRIMSON RONIN (third hero): twin red katana ================= */
  function drawRoninKatana(c, x, y, a, flame, back) {
    c.save();
    c.translate(x, y);
    c.rotate(a);
    c.strokeStyle = "#050307";
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(-14, 0);
    c.lineTo(4, 0);
    c.stroke();
    c.strokeStyle = "#7c1b2c";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-13, 0);
    c.lineTo(5, 0);
    c.stroke();
    c.strokeStyle = "#b88b69";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(2, -7);
    c.lineTo(2, 7);
    c.stroke();
    const g = c.createLinearGradient(4, 0, 76, 0);
    g.addColorStop(0, back ? "#7c1025" : "#ff234c");
    g.addColorStop(0.55, "#ef2444");
    g.addColorStop(1, "#ffb0ba");
    c.shadowColor = "#ff234c";
    c.shadowBlur = flame ? 24 : 12;
    c.strokeStyle = g;
    c.lineWidth = back ? 5 : 6;
    c.beginPath();
    c.moveTo(5, 0);
    c.quadraticCurveTo(43, back ? 2 : -2, 76, -5);
    c.stroke();
    c.shadowBlur = 0;
    c.strokeStyle = "#ffd3d8";
    c.globalAlpha *= 0.75;
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(9, -1);
    c.quadraticCurveTo(45, -2, 70, -5);
    c.stroke();
    if (flame) {
      c.globalAlpha *= 0.9;
      c.fillStyle = "#ff3455";
      c.shadowColor = "#ff1d43";
      c.shadowBlur = 18;
      for (let i = 0; i < 6; i++) {
        const q = i / 5,
          xx = 12 + q * 60,
          h = 5 + Math.sin(time * 12 + i * 1.7) * 3;
        c.beginPath();
        c.moveTo(xx - 5, -3);
        c.quadraticCurveTo(xx, -9 - h, xx + 5, -3);
        c.quadraticCurveTo(xx, 1, xx - 5, -3);
        c.fill();
      }
    }
    c.restore();
  }
  function drawRonin(c, o) {
    c.save();
    c.translate(o.x, o.y);
    const roninStep = (o.run || 0) * Math.abs(Math.sin((o.phase || 0) * 0.5)) * 2.8;
    c.translate(0, -roninStep);
    c.scale(o.face * o.scale, o.scale);
    c.rotate((o.lean || 0) * 0.22 + Math.sin(o.phase || 0) * (o.run || 0) * 0.018);
    if (o.rot) c.rotate(o.rot);
    c.globalAlpha = o.alpha;
    if (o.flash) c.filter = "brightness(2.8) saturate(.5)";
    const run = o.run || 0,
      ph = o.phase || 0,
      crouch = o.crouch || 0,
      hip = -40 + crouch;
    // teleport after-image and bloodflame aura
    if (o.tele) {
      c.shadowColor = "#ff244c";
      c.shadowBlur = 24;
    }
    if (o.flame) {
      c.fillStyle = "rgba(255,25,60,.12)";
      c.beginPath();
      c.ellipse(0, -61, 43 + Math.sin(time * 9) * 4, 72, 0, 0, TAU);
      c.fill();
    }
    let f1 = {
        x: -9 + Math.sin(ph) * 16 * run,
        y: -Math.max(0, Math.cos(ph)) * 8 * run,
      },
      f2 = {
        x: 9 + Math.sin(ph + Math.PI) * 16 * run,
        y: -Math.max(0, Math.cos(ph + Math.PI)) * 8 * run,
      };
    if (o.slide) {
      f1 = { x: -23, y: -2 };
      f2 = { x: 24, y: -1 };
    }
    if (o.kneel) {
      f1 = { x: -18, y: -1 };
      f2 = { x: 12, y: 0 };
    }
    const leg = (hx, f, far) => {
      const k = ik(hx, hip, f.x, f.y, 22, 22, -1);
      limb(
        c,
        [
          { x: hx, y: hip },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        10,
        "#030205",
        far ? "#111016" : "#1d1b22",
        "#37323b",
      );
      c.fillStyle = "#0a090d";
      c.beginPath();
      c.ellipse(k.tx + 4, k.ty - 2, 10, 4.5, 0, 0, TAU);
      c.fill();
    };
    leg(-4, f1, true);
    leg(4, f2, false);
    const sway = Math.sin(time * 2.1) * 3 - run * 10;
    poly(
      c,
      [
        [-10, hip - 4],
        [11, hip - 4],
        [18 + sway, hip + 39],
        [9 + sway, hip + 31],
        [3 + sway, hip + 43],
        [-4 + sway, hip + 32],
        [-12 + sway, hip + 40],
        [-17 + sway, hip + 26],
      ],
      "#15131a",
      "#030205",
      1.3,
    );
    c.save();
    c.translate(0, crouch);
    c.rotate(o.lean || 0);
    // torn cloak / layered robe
    poly(
      c,
      [
        [-8, -80],
        [-17, -69],
        [-22 - sway * 0.4, -31],
        [-30 - sway * 0.8, -5],
        [-21 - sway, 0],
        [-15 - sway * 0.4, -11],
        [-8 - sway * 0.8, 2],
        [-1, -42],
      ],
      "#0a090d",
      "#020103",
      1.4,
    );
    poly(
      c,
      [
        [-11, -78],
        [12, -78],
        [15, -44],
        [9, -35],
        [-10, -38],
        [-15, -52],
      ],
      "#1e1a20",
      "#030205",
      1.4,
    );
    c.strokeStyle = "#64202b";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-10, -67);
    c.lineTo(11, -45);
    c.stroke();
    // masked head and scarf
    c.fillStyle = "#050407";
    c.beginPath();
    c.arc(1, -91, 12, 0, TAU);
    c.fill();
    poly(
      c,
      [
        [-11, -96],
        [-4, -106],
        [8, -104],
        [13, -94],
        [8, -82],
        [-7, -83],
      ],
      "#111016",
      "#020103",
      1.2,
    );
    c.fillStyle = "#0a090d";
    c.beginPath();
    c.moveTo(-10, -91);
    c.quadraticCurveTo(1, -96, 11, -91);
    c.lineTo(8, -84);
    c.lineTo(-8, -85);
    c.closePath();
    c.fill();
    c.strokeStyle = "#ff405e";
    c.shadowColor = "#ff244c";
    c.shadowBlur = 8;
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(-5, -92);
    c.lineTo(6, -91);
    c.stroke();
    c.shadowBlur = 0;
    // broad kasa hat
    c.fillStyle = "#21191a";
    c.strokeStyle = "#050305";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-37, -104);
    c.quadraticCurveTo(0, -128, 39, -103);
    c.quadraticCurveTo(1, -94, -37, -104);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#6f2a32";
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(-31, -103);
    c.quadraticCurveTo(0, -119, 33, -102);
    c.moveTo(-19, -106);
    c.quadraticCurveTo(0, -116, 21, -105);
    c.stroke();
    c.fillStyle = "#2d2323";
    c.beginPath();
    c.moveTo(-7, -112);
    c.lineTo(1, -126);
    c.lineTo(10, -111);
    c.closePath();
    c.fill();
    // back katana/scabbard silhouette
    c.save();
    c.translate(-13, -55);
    c.rotate(-2.28);
    c.strokeStyle = "#050305";
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(-10, 0);
    c.lineTo(64, 0);
    c.stroke();
    c.strokeStyle = "#5e1725";
    c.lineWidth = 3;
    c.stroke();
    c.restore();
    // arms and twin blades
    const pose = o.pose || 0,
      a1 = o.a1 === undefined ? -0.22 : o.a1,
      a2 = o.a2 === undefined ? 0.42 : o.a2;
    const shoulder = { x: 3, y: -71 };
    const h1 = {
      x: shoulder.x + Math.cos(a1) * 29,
      y: shoulder.y + Math.sin(a1) * 29,
    };
    const h2 = { x: -3 + Math.cos(a2) * 27, y: -69 + Math.sin(a2) * 27 };
    let e = ik(shoulder.x, shoulder.y, h1.x, h1.y, 16, 16, -1);
    limb(
      c,
      [shoulder, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
      9,
      "#030205",
      "#201c22",
      "#38323a",
    );
    e = ik(-3, -69, h2.x, h2.y, 16, 16, 1);
    limb(
      c,
      [
        { x: -3, y: -69 },
        { x: e.x, y: e.y },
        { x: e.tx, y: e.ty },
      ],
      9,
      "#030205",
      "#17151b",
      "#302b33",
    );
    drawRoninKatana(c, h2.x, h2.y, a2, o.flame, true);
    drawRoninKatana(c, h1.x, h1.y, a1, o.flame, false);
    c.restore();
    c.restore();
  }
  function roninObj() {
    const air = P.y < GROUND - 3,
      o = {
        kind: "ronin",
        scale: 1.08,
        x: P.x,
        y: P.y,
        face: P.face,
        t: time,
        run: 0,
        air,
        phase: P.stride,
        crouch: 0,
        lean: 0,
        a1: -0.22,
        a2: 0.42,
        flash: P.flash > 0,
        alpha: 1,
        flame: P.flameT > 0,
        tele: false,
      };
    o.run = P.state === "free" && !air ? Math.min(1, Math.abs(P.vx) / 240) : 0;
    o.lean = o.run * 0.08;
    o.crouch = P.state === "free" && !air ? 9 * (P.landT / 0.14) : 0;
    if (P.state === "attack") {
      const A = ATK[P.combo],
        k = clamp(P.t / (A.w + A.a + A.r), 0, 1),
        sw = k < 0.55 ? ease(k / 0.55) : easeOut((k - 0.55) / 0.45);
      if (P.combo === 0) {
        o.a1 = lerp(-2.25, 0.72, sw);
        o.a2 = lerp(1.25, -1.45, sw);
      } else if (P.combo === 1) {
        o.a1 = lerp(2.1, -0.65, sw);
        o.a2 = lerp(-1.2, 1.45, sw);
      } else {
        o.a1 = 0.02;
        o.a2 = 0.1;
        o.lean = 0.34;
      }
      o.run = 0;
    } else if (P.state === "parry") {
      o.a1 = -0.85;
      o.a2 = 0.82;
      o.lean = -0.08;
      o.run = 0;
      if (P.t < RONIN_DEFLECT_WIN && !P.parrySucc) {
        o.flame = true;
      }
    } else if (P.state === "teleport") {
      o.tele = true;
      o.slide = true;
      o.crouch = 15;
      o.lean = 0.55;
      o.a1 = -0.1;
      o.a2 = 0.2;
      o.alpha =
        P.rt === "wind"
          ? Math.max(0.12, 1 - P.t / 0.07)
          : Math.min(1, P.t / 0.16);
      o.run = 0;
    } else if (P.state === "roninLunge") {
      o.slide = true;
      o.crouch = 10;
      o.lean = 0.52;
      o.a1 = 0.02;
      o.a2 = 0.12;
      o.flame = true;
      o.run = 0;
    } else if (P.state === "roninFlame") {
      const k = clamp(P.t / 0.72, 0, 1);
      o.a1 = lerp(-0.2, -1.75, ease(k));
      o.a2 = lerp(0.4, 1.8, ease(k));
      o.flame = true;
      o.run = 0;
    } else if (P.state === "dodge" || P.state === "airdash") {
      o.slide = !air;
      o.lean = 0.5;
      o.run = 0;
    } else if (P.state === "block") {
      o.a1 = -0.65;
      o.a2 = 0.65;
      o.crouch = 4;
      o.run = Math.min(1, Math.abs(P.vx) / 120) * 0.4;
    } else if (P.state === "hurt") {
      o.lean = -0.3;
      o.run = 0;
    } else if (P.state === "heal") {
      o.crouch = 6;
      o.a1 = 1.65;
      o.a2 = 1.3;
      o.run = 0;
    } else if (P.state === "dead") {
      o.rot = -Math.min(1.5, P.deadT * 3.5);
      o.run = 0;
      o.alpha = clamp(1 - (P.deadT - 1) * 0.8, 0.25, 1);
    }
    return o;
  }

  /* ================= METAL REGAL (fourth hero): ornate gunblade duelist ================= */
  const PAL_RG = {
    black: "#08080c",
    dark: "#121119",
    mid: "#241f29",
    red: "#68152a",
    red2: "#a52840",
    gold: "#b89043",
    gold2: "#f0d079",
    steel: "#aaa4a9",
    outline: "#020204",
  };
  /* ================= ARCANE WIZARD — articulated character art ================= */
  function drawArcaneBlade(c, x, y, a, size = 1, alpha = 1) {
    c.save();
    c.translate(x, y);
    c.rotate(a);
    c.scale(size, size);
    c.globalAlpha *= alpha;
    const g = c.createLinearGradient(3, 0, 82, 0);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.25, "#9eeaff");
    g.addColorStop(0.7, "#3e9eff");
    g.addColorStop(1, "rgba(80,70,255,.1)");
    c.shadowColor = "#45c8ff";
    c.shadowBlur = 18;
    c.strokeStyle = g;
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(4, 0);
    c.quadraticCurveTo(48, -3, 82, -9);
    c.stroke();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(245,255,255,.95)";
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(8, -2);
    c.quadraticCurveTo(48, -4, 76, -9);
    c.stroke();
    c.strokeStyle = "#79dfff";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(1, -9);
    c.lineTo(1, 9);
    c.moveTo(-7, 0);
    c.lineTo(8, 0);
    c.stroke();
    c.restore();
  }
  function drawWizardStaff(c, x, y, a, power = 0) {
    c.save();
    c.translate(x, y);
    c.rotate(a);
    const wood = c.createLinearGradient(-4, 0, 6, 0);
    wood.addColorStop(0, "#24182b");
    wood.addColorStop(0.5, "#79573f");
    wood.addColorStop(1, "#2c1c31");
    c.strokeStyle = "#09060d";
    c.lineWidth = 9;
    c.beginPath();
    c.moveTo(0, -102);
    c.quadraticCurveTo(4, 40, 1, 105);
    c.stroke();
    c.strokeStyle = wood;
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(0, -102);
    c.quadraticCurveTo(4, 40, 1, 105);
    c.stroke();
    c.strokeStyle = "#a07a4d";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, -94);
    c.quadraticCurveTo(-23, -106, -18, -123);
    c.quadraticCurveTo(-7, -114, 0, -105);
    c.quadraticCurveTo(12, -124, 27, -119);
    c.quadraticCurveTo(18, -104, 4, -94);
    c.stroke();
    const pulse = 1 + Math.sin(time * 9) * 0.08 + power * 0.3;
    const g = c.createRadialGradient(1, -112, 1, 1, -112, 18 * pulse);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.18, "#b9f2ff");
    g.addColorStop(0.5, "#6b6cff");
    g.addColorStop(1, "rgba(100,35,220,0)");
    c.fillStyle = g;
    c.shadowColor = power > 0.3 ? "#50d7ff" : "#8b5cff";
    c.shadowBlur = 16 + power * 22;
    c.beginPath();
    c.arc(1, -112, 17 * pulse, 0, TAU);
    c.fill();
    c.fillStyle = "#bfefff";
    c.beginPath();
    c.moveTo(1, -126);
    c.lineTo(10, -112);
    c.lineTo(1, -99);
    c.lineTo(-8, -112);
    c.closePath();
    c.fill();
    c.restore();
  }
  function drawSkeletonMinion(c, s) {
    const spawnK = s.state === "spawn" ? easeOut(clamp(s.t / 0.72, 0, 1)) : 1;
    const dead = s.state === "dead";
    const run = s.state === "walk" ? 1 : 0;
    const ph = s.stride || 0;
    const crouch = dead ? 22 : (1 - spawnK) * 18;
    const hip = -35 + crouch;
    const scale = 0.92;
    const attackK = s.state === "attack" ? clamp(s.t / 0.7, 0, 1) : 0,
      attackLunge = Math.sin(attackK * Math.PI) * 19,
      bodyBob = run * Math.abs(Math.sin(ph)) * 3.5,
      bodyLean =
        s.state === "attack"
          ? -0.11 + attackK * 0.2
          : run
            ? Math.sin(ph) * 0.035
            : Math.sin(time * 2.4 + (s.rank || 0)) * 0.012;
    c.save();
    c.translate(s.x, GROUND + (1 - spawnK) * 52);
    c.scale(s.face * scale, scale);
    c.translate(attackLunge, -bodyBob);
    c.rotate(bodyLean);
    c.globalAlpha = Math.max(0, s.alpha) * (0.45 + 0.55 * spawnK);
    if (s.flash > 0) c.filter = "brightness(3) saturate(.3)";
    if (dead) c.rotate(-1.18 * clamp((1 - s.alpha) * 1.5, 0, 1));
    if (s.state === "spawn") {
      c.fillStyle = "rgba(70,180,255,.13)";
      c.shadowColor = "#53cfff";
      c.shadowBlur = 22;
      c.beginPath();
      c.ellipse(0, -48, 31 + Math.sin(time * 8) * 3, 62, 0, 0, TAU);
      c.fill();
      c.shadowBlur = 0;
    }
    let f1 = {
      x: -8 + Math.sin(ph) * 13 * run,
      y: -Math.max(0, Math.cos(ph)) * 7 * run,
    };
    let f2 = {
      x: 8 + Math.sin(ph + Math.PI) * 13 * run,
      y: -Math.max(0, Math.cos(ph + Math.PI)) * 7 * run,
    };
    if (dead) {
      f1 = { x: -18, y: 0 };
      f2 = { x: 17, y: 0 };
    }
    const boneLimb = (pts, w, far = false) =>
      limb(c, pts, w, "#26303a", far ? "#9cabb0" : "#d9e2df", "#f5fbf7");
    const leg = (hx, f, far) => {
      const k = ik(hx, hip, f.x, f.y, 20, 21, -1);
      boneLimb(
        [
          { x: hx, y: hip },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        7,
        far,
      );
      c.fillStyle = far ? "#89979d" : "#dce6e4";
      c.strokeStyle = "#2b3540";
      c.lineWidth = 1.5;
      c.beginPath();
      c.ellipse(k.tx + 4, k.ty - 1, 10, 3.8, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = "#7390a5";
      c.beginPath();
      c.arc(k.x, k.y, 5, 0, TAU);
      c.fill();
    };
    leg(-5, f1, true);
    leg(5, f2, false);
    // torn spectral tabard behind the bones
    const sway = Math.sin(time * 3 + s.stride) * 2 - run * 5;
    poly(
      c,
      [
        [-10, hip - 5],
        [10, hip - 5],
        [18 + sway, hip + 35],
        [8 + sway, hip + 27],
        [2 + sway, hip + 39],
        [-5 + sway, hip + 27],
        [-15 + sway, hip + 33],
      ],
      "#23364e",
      "#07101c",
      1.4,
    );
    c.save();
    c.translate(0, crouch);
    // pelvis and spine
    c.fillStyle = "#cbd8d7";
    c.strokeStyle = "#26313a";
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-12, -39);
    c.quadraticCurveTo(0, -31, 12, -39);
    c.lineTo(8, -29);
    c.lineTo(-8, -29);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#e1e9e5";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(0, -38);
    c.lineTo(0, -77);
    c.stroke();
    // armored rib cage with visible individual ribs
    c.strokeStyle = "#dbe5e2";
    c.lineWidth = 3.2;
    for (let r = 0; r < 4; r++) {
      const yy = -70 + r * 8,
        ww = 18 - r * 2;
      c.beginPath();
      c.moveTo(0, yy);
      c.quadraticCurveTo(-ww, yy - 2, -ww + 2, yy + 8);
      c.moveTo(0, yy);
      c.quadraticCurveTo(ww, yy - 2, ww - 2, yy + 8);
      c.stroke();
    }
    poly(
      c,
      [
        [-20, -76],
        [-12, -85],
        [12, -85],
        [20, -76],
        [14, -68],
        [-14, -68],
      ],
      "#60758b",
      "#18222e",
      1.8,
    );
    c.strokeStyle = "#a9d9ee";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-13, -78);
    c.lineTo(13, -78);
    c.stroke();
    // ragged cape
    poly(
      c,
      [
        [-14, -81],
        [-26, -72],
        [-31 + sway, -26],
        [-21 + sway, -33],
        [-15 + sway, -19],
        [-8, -64],
      ],
      "#1b293e",
      "#08101c",
      1.3,
    );
    // sword arm, fully jointed
    let swordA = -0.72;
    if (s.state === "attack") {
      const k = clamp(s.t / 0.34, 0, 1);
      swordA = lerp(-2.35, 0.72, ease(k));
    } else if (run) swordA = -0.5 + Math.sin(ph + Math.PI) * 0.18;
    const sh = { x: 15, y: -77 },
      hand = {
        x: sh.x + Math.cos(swordA) * 34,
        y: sh.y + Math.sin(swordA) * 34,
      };
    const elbow = ik(sh.x, sh.y, hand.x, hand.y, 18, 18, -1);
    boneLimb(
      [
        { x: sh.x, y: sh.y },
        { x: elbow.x, y: elbow.y },
        { x: hand.x, y: hand.y },
      ],
      7,
      false,
    );
    c.fillStyle = "#7793aa";
    c.strokeStyle = "#172331";
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(sh.x, sh.y, 9, 0, TAU);
    c.fill();
    c.stroke();
    c.strokeStyle = "#c5d4d5";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(sh.x, sh.y, 5, 0, TAU);
    c.stroke();
    c.save();
    c.translate(hand.x, hand.y);
    c.rotate(swordA + 0.05);
    c.strokeStyle = "#181d25";
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(-8, 0);
    c.lineTo(5, 0);
    c.stroke();
    c.strokeStyle = "#a88645";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(1, -7);
    c.lineTo(1, 7);
    c.stroke();
    const bladeLen = 68 + (s.rank || 0) * 18;
    const sg = c.createLinearGradient(5, 0, bladeLen, 0);
    sg.addColorStop(0, "#dff7ff");
    sg.addColorStop(0.5, "#8ccff0");
    sg.addColorStop(1, "#efffff");
    c.strokeStyle = sg;
    c.shadowColor = "#55c7ff";
    c.shadowBlur = 8;
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(5, 0);
    c.lineTo(bladeLen, -5);
    c.stroke();
    c.shadowBlur = 0;
    c.restore();
    // free arm and small engraved buckler
    const sh2 = { x: -15, y: -76 },
      h2 = { x: -26 + Math.sin(ph) * 4 * run, y: -49 };
    const e2 = ik(sh2.x, sh2.y, h2.x, h2.y, 17, 18, 1);
    boneLimb(
      [
        { x: sh2.x, y: sh2.y },
        { x: e2.x, y: e2.y },
        { x: h2.x, y: h2.y },
      ],
      7,
      true,
    );
    c.fillStyle = "#3e566f";
    c.strokeStyle = "#a5d8ee";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(h2.x - 2, h2.y, 13, 0, TAU);
    c.fill();
    c.stroke();
    c.strokeStyle = "#6fbce1";
    c.lineWidth = 1.2;
    for (let q = 0; q < 6; q++) {
      let a = (q * TAU) / 6;
      c.beginPath();
      c.moveTo(h2.x - 2, h2.y);
      c.lineTo(h2.x - 2 + Math.cos(a) * 10, h2.y + Math.sin(a) * 10);
      c.stroke();
    }
    // detailed skull, jaw and crown-like helm
    c.fillStyle = "#dde6e2";
    c.strokeStyle = "#26313a";
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(-13, -103);
    c.quadraticCurveTo(-15, -119, 0, -123);
    c.quadraticCurveTo(16, -119, 13, -102);
    c.lineTo(8, -92);
    c.lineTo(-8, -92);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#111a24";
    c.beginPath();
    c.ellipse(-5, -108, 4, 5.5, -0.1, 0, TAU);
    c.ellipse(5, -108, 4, 5.5, 0.1, 0, TAU);
    c.fill();
    c.fillStyle = "#62cfff";
    c.shadowColor = "#55c8ff";
    c.shadowBlur = 7;
    c.beginPath();
    c.arc(-5, -108, 1.5, 0, TAU);
    c.arc(5, -108, 1.5, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    c.fillStyle = "#cbd6d4";
    c.strokeStyle = "#26313a";
    c.beginPath();
    c.moveTo(-8, -93);
    c.lineTo(8, -93);
    c.lineTo(6, -85);
    c.lineTo(-6, -85);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#506b82";
    c.lineWidth = 1;
    for (let q = -4; q <= 4; q += 2) {
      c.beginPath();
      c.moveTo(q, -92);
      c.lineTo(q, -86);
      c.stroke();
    }
    poly(
      c,
      [
        [-15, -121],
        [-10, -132],
        [-4, -124],
        [0, -136],
        [5, -124],
        [12, -132],
        [15, -119],
      ],
      "#546d83",
      "#18232f",
      1.5,
    );
    c.restore();
    if (s.hp < s.maxhp && !dead) {
      c.scale(s.face, 1);
      c.fillStyle = "rgba(3,7,12,.82)";
      c.fillRect(-24, -144, 48, 5);
      c.fillStyle = "#67cfff";
      c.fillRect(-23, -143, 46 * clamp(s.hp / s.maxhp, 0, 1), 3);
    }
    c.restore();
  }
  function wizardObj() {
    const air = P.y < GROUND - 3;
    const o = {
      x: P.x,
      y: P.y,
      face: P.face,
      scale: 0.83,
      run: 0,
      phase: P.stride,
      crouch: 0,
      lean: 0,
      alpha: 1,
      flash: P.flash > 0,
      staffA: 1.45,
      staffRot: 0.03,
      handA: 1.25,
      magic: 0,
      sword: false,
      tele: false,
      beam: false,
      summon: false,
    };
    o.run = P.state === "free" && !air ? Math.min(1, Math.abs(P.vx) / 240) : 0;
    o.crouch = P.state === "free" && !air ? 8 * (P.landT / 0.14) : 0;
    if (P.state === "wizardMissile") {
      const k = clamp(P.t / 0.11, 0, 1);
      o.handA = lerp(1.25, -0.38, ease(k));
      o.staffA = lerp(1.45, 0.45, ease(k));
      o.staffRot = -0.08;
      o.magic = 1;
      o.lean = -0.08;
    } else if (P.state === "wizardSword") {
      const k = clamp(P.t / 0.22, 0, 1);
      o.handA = lerp(-2.25, 0.72, ease(k));
      o.sword = true;
      o.lean = 0.12;
      o.magic = 0.7;
    } else if (P.state === "wizardSummon") {
      o.staffA = lerp(1.45, -1.12, ease(clamp(P.t / 0.34, 0, 1)));
      o.staffRot = -0.58;
      o.handA = -1.55;
      o.magic = 1;
      o.summon = true;
      o.crouch = 5;
    } else if (P.state === "wizardBeam") {
      o.staffA = 0.72;
      o.staffRot = -0.12;
      o.handA = -0.06;
      o.magic = clamp(P.t / 1.0, 0, 1);
      o.beam = true;
      o.lean = -0.16;
    } else if (P.state === "teleport") {
      o.tele = true;
      o.alpha = 0.28 + 0.18 * Math.sin(time * 42) ** 2;
      o.lean = 0.42;
    } else if (P.state === "dodge" || P.state === "airdash") {
      o.lean = 0.48;
      o.crouch = 10;
    } else if (P.state === "block") {
      o.staffA = -0.65;
      o.staffRot = -0.36;
      o.handA = -0.75;
      o.magic = 0.55;
      o.crouch = 5;
    } else if (P.state === "hurt") {
      o.lean = -0.32;
    } else if (P.state === "heal") {
      o.staffA = 1.15;
      o.staffRot = 0.06;
      o.handA = -1.2;
      o.crouch = 7;
    } else if (P.state === "dead") {
      o.rot = -Math.min(1.5, P.deadT * 3.4);
      o.alpha = clamp(1 - (P.deadT - 1) * 0.8, 0.2, 1);
    }
    return o;
  }
  function drawWizard(c, o = wizardObj()) {
    c.save();
    c.translate(o.x, o.y);
    c.scale(o.face * o.scale, o.scale);
    if (o.rot) c.rotate(o.rot);
    c.globalAlpha = o.alpha;
    if (o.flash) c.filter = "brightness(2.8) saturate(.5)";
    const run = o.run || 0,
      ph = o.phase || 0,
      crouch = o.crouch || 0,
      hip = -40 + crouch;
    if (o.tele) {
      c.globalCompositeOperation = "lighter";
      for (let i = 3; i >= 1; i--) {
        c.globalAlpha = 0.07 * i;
        c.fillStyle = "#4abaff";
        c.beginPath();
        c.ellipse(-P.teleDir * i * 14, -67, 24, 64, 0, 0, TAU);
        c.fill();
      }
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = o.alpha;
    }
    let f1 = {
        x: -9 + Math.sin(ph) * 16 * run,
        y: -Math.max(0, Math.cos(ph)) * 8 * run,
      },
      f2 = {
        x: 9 + Math.sin(ph + Math.PI) * 16 * run,
        y: -Math.max(0, Math.cos(ph + Math.PI)) * 8 * run,
      };
    const bootLeg = (hx, f, far) => {
      const k = ik(hx, hip, f.x, f.y, 22, 22, -1);
      limb(
        c,
        [
          { x: hx, y: hip },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        11,
        "#070610",
        far ? "#171526" : "#29243a",
        "#49405b",
      );
      c.fillStyle = "#0b0912";
      c.beginPath();
      c.ellipse(k.tx + 4, k.ty - 2, 11, 4.5, 0, 0, TAU);
      c.fill();
      c.strokeStyle = "#a78a4d";
      c.lineWidth = 1.3;
      c.stroke();
    };
    bootLeg(-4, f1, true);
    bootLeg(4, f2, false);
    const sway = Math.sin(time * 2.2) * 3 - run * 10;
    // long layered robe tails
    poly(
      c,
      [
        [-12, hip - 5],
        [12, hip - 5],
        [22 + sway, hip + 43],
        [12 + sway, hip + 34],
        [5 + sway, hip + 47],
        [-2 + sway, hip + 35],
        [-12 + sway, hip + 44],
        [-20 + sway, hip + 29],
      ],
      "#241b35",
      "#05040a",
      1.5,
    );
    c.strokeStyle = "#6f45a1";
    c.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(-9 + i * 6, hip);
      c.quadraticCurveTo(-7 + i * 6, hip + 21, 2 + i * 4, hip + 38);
      c.stroke();
    }
    c.save();
    c.translate(0, crouch);
    c.rotate(o.lean || 0);
    // split traveling cloak with purple inner lining
    poly(
      c,
      [
        [-10, -82],
        [-21, -72],
        [-30 - sway * 0.3, -39],
        [-39 - sway * 0.7, -4],
        [-27 - sway, 1],
        [-19 - sway * 0.5, -12],
        [-11 - sway, 3],
        [-2, -45],
      ],
      "#0b0912",
      "#030207",
      1.5,
    );
    poly(
      c,
      [
        [8, -79],
        [19, -68],
        [25 + sway * 0.2, -36],
        [34 + sway * 0.6, -3],
        [24 + sway, 2],
        [16 + sway * 0.5, -12],
        [9 + sway * 0.8, 3],
        [1, -44],
      ],
      "#2d2043",
      "#05030a",
      1.4,
    );
    c.strokeStyle = "#7548a5";
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(14, -65);
    c.quadraticCurveTo(20, -34, 24 + sway, -5);
    c.stroke();
    // tailored torso, sash, belt and potion pouches
    const tg = c.createLinearGradient(-16, -88, 15, -43);
    tg.addColorStop(0, "#171322");
    tg.addColorStop(0.5, "#3c304e");
    tg.addColorStop(1, "#100c18");
    c.fillStyle = tg;
    c.strokeStyle = "#05030a";
    c.lineWidth = 1.7;
    c.beginPath();
    c.moveTo(-14, -83);
    c.quadraticCurveTo(0, -93, 15, -82);
    c.lineTo(12, -44);
    c.lineTo(-12, -44);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#aa8b4c";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-10, -77);
    c.quadraticCurveTo(0, -61, 11, -52);
    c.stroke();
    c.fillStyle = "#856b39";
    c.fillRect(-15, -50, 31, 5);
    c.fillStyle = "#c4a65d";
    c.fillRect(-3, -52, 7, 8);
    c.fillStyle = "#39283f";
    for (const px of [-12, 12]) {
      c.beginPath();
      c.roundRect(px - 5, -45, 10, 12, 3);
      c.fill();
      c.strokeStyle = "#a88848";
      c.lineWidth = 1;
      c.stroke();
    }
    // back arm holds articulated staff
    const s0 = { x: -9, y: -76 },
      staffHand = {
        x: s0.x + Math.cos(o.staffA) * 31,
        y: s0.y + Math.sin(o.staffA) * 31,
      };
    let e0 = ik(s0.x, s0.y, staffHand.x, staffHand.y, 18, 18, 1);
    limb(
      c,
      [
        { x: s0.x, y: s0.y },
        { x: e0.x, y: e0.y },
        { x: staffHand.x, y: staffHand.y },
      ],
      12,
      "#05030a",
      "#21182d",
      "#463756",
    );
    c.fillStyle = "#b09255";
    c.strokeStyle = "#392817";
    c.lineWidth = 1.5;
    c.beginPath();
    c.ellipse(s0.x, s0.y, 11, 8, -0.2, 0, TAU);
    c.fill();
    c.stroke();
    drawWizardStaff(c, staffHand.x - 8, staffHand.y, o.staffRot, o.magic);
    // front casting/sword arm with IK
    const s1 = { x: 10, y: -76 },
      hand = {
        x: s1.x + Math.cos(o.handA) * 37,
        y: s1.y + Math.sin(o.handA) * 37,
      };
    let e1 = ik(s1.x, s1.y, hand.x, hand.y, 19, 19, -1);
    limb(
      c,
      [
        { x: s1.x, y: s1.y },
        { x: e1.x, y: e1.y },
        { x: hand.x, y: hand.y },
      ],
      12,
      "#05030a",
      "#2a2039",
      "#514162",
    );
    c.fillStyle = "#c2a18a";
    c.strokeStyle = "#3b2630";
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(hand.x, hand.y, 6, 0, TAU);
    c.fill();
    c.stroke();
    if (o.sword) drawArcaneBlade(c, hand.x, hand.y, o.handA, 0.96);
    else if (o.magic > 0) {
      const rr = 6 + o.magic * 5 + Math.sin(time * 12) * 1.5;
      c.fillStyle = "#d9fbff";
      c.shadowColor = "#55cfff";
      c.shadowBlur = 12 + o.magic * 15;
      c.beginPath();
      c.arc(hand.x, hand.y, rr, 0, TAU);
      c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = "rgba(110,220,255,.85)";
      c.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        let a = time * (2 + i * 0.4) + i * 2;
        c.beginPath();
        c.arc(hand.x, hand.y, rr + 5 + i * 3, a, a + 2.2);
        c.stroke();
      }
    }
    // neck, lined hood, face and long layered beard
    c.fillStyle = "#15101e";
    c.strokeStyle = "#05030a";
    c.lineWidth = 1.5;
    c.beginPath();
    c.ellipse(0, -91, 18, 16, 0, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = "#8b7264";
    c.strokeStyle = "#3b2930";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-10, -112);
    c.quadraticCurveTo(4, -119, 12, -109);
    c.lineTo(18, -103);
    c.lineTo(11, -99);
    c.quadraticCurveTo(6, -86, -8, -91);
    c.quadraticCurveTo(-14, -101, -10, -112);
    c.closePath();
    c.fill();
    c.stroke();
    // one readable profile eye and brow: local +X is always forward
    c.strokeStyle = "#37242e";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(3, -109);
    c.lineTo(11, -108);
    c.stroke();
    c.fillStyle = "#69d8ff";
    c.shadowColor = "#50caff";
    c.shadowBlur = 6;
    c.beginPath();
    c.ellipse(8, -106, 2.2, 1.6, 0, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    c.fillStyle = "#6f584f";
    c.beginPath();
    c.ellipse(-11, -103, 3, 5, 0, 0, TAU);
    c.fill();
    c.fillStyle = "#b7b7c5";
    c.beginPath();
    c.moveTo(-12, -100);
    c.quadraticCurveTo(-18, -77, -8, -66);
    c.quadraticCurveTo(0, -59, 6, -72);
    c.quadraticCurveTo(13, -81, 13, -99);
    c.quadraticCurveTo(6, -91, 1, -81);
    c.quadraticCurveTo(-4, -91, -12, -100);
    c.fill();
    c.strokeStyle = "#77788a";
    c.lineWidth = 1.2;
    for (let i = -8; i <= 8; i += 4) {
      c.beginPath();
      c.moveTo(i, -94);
      c.quadraticCurveTo(i - 3, -76, i, -66);
      c.stroke();
    }
    // crooked, layered sorcerer hat
    c.fillStyle = "#0c0913";
    c.strokeStyle = "#05030a";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, -119, 34, 8, -0.08, 0, TAU);
    c.fill();
    c.stroke();
    const hg = c.createLinearGradient(-15, -160, 20, -118);
    hg.addColorStop(0, "#171222");
    hg.addColorStop(0.55, "#322443");
    hg.addColorStop(1, "#0c0913");
    c.fillStyle = hg;
    c.beginPath();
    c.moveTo(-18, -121);
    c.quadraticCurveTo(-12, -157, 5, -166);
    c.quadraticCurveTo(20, -163, 26, -150);
    c.quadraticCurveTo(16, -151, 11, -142);
    c.quadraticCurveTo(24, -138, 21, -123);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#8251b2";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-25, -119);
    c.quadraticCurveTo(0, -113, 27, -121);
    c.stroke();
    c.fillStyle = "#b89b58";
    c.beginPath();
    c.arc(10, -120, 3, 0, TAU);
    c.fill();
    // summoned spell circle beneath both hands
    if (o.summon) {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.strokeStyle = "rgba(80,195,255,.75)";
      c.lineWidth = 2;
      const r = 34 + Math.sin(time * 9) * 3;
      c.beginPath();
      c.ellipse(0, -3, r, 9, 0, 0, TAU);
      c.stroke();
      for (let i = 0; i < 8; i++) {
        let a = (i * TAU) / 8 + time * 0.5;
        c.beginPath();
        c.moveTo(Math.cos(a) * r * 0.65, -3 + Math.sin(a) * 5);
        c.lineTo(Math.cos(a) * r, -3 + Math.sin(a) * 9);
        c.stroke();
      }
      c.restore();
    }
    c.restore();
    c.restore();
  }

  function drawRegalSword(c, x, y, a) {
    c.save();
    c.translate(x, y);
    c.rotate(a);
    c.strokeStyle = PAL_RG.outline;
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(-13, 0);
    c.lineTo(7, 0);
    c.stroke();
    c.strokeStyle = PAL_RG.gold;
    c.lineWidth = 3;
    c.stroke();
    c.fillStyle = PAL_RG.gold2;
    c.fillRect(3, -7, 4, 14);
    const g = c.createLinearGradient(7, 0, 79, 0);
    g.addColorStop(0, "#5e5960");
    g.addColorStop(0.5, "#d9d1d4");
    g.addColorStop(1, "#fff4e0");
    c.strokeStyle = g;
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(7, 0);
    c.lineTo(75, -4);
    c.stroke();
    c.strokeStyle = "#4b333b";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(12, 1);
    c.lineTo(69, -3);
    c.stroke();
    c.restore();
  }
  function drawRegalGun(c, x, y, a, flash) {
    c.save();
    c.translate(x, y);
    c.rotate(a);
    c.fillStyle = PAL_RG.outline;
    c.fillRect(-10, -6, 57, 12);
    c.fillStyle = "#2c2930";
    c.fillRect(-6, -4, 49, 8);
    c.fillStyle = PAL_RG.gold;
    c.fillRect(4, -5, 5, 10);
    c.fillRect(25, -5, 4, 10);
    c.fillStyle = "#17141b";
    c.beginPath();
    c.moveTo(2, 5);
    c.lineTo(15, 5);
    c.lineTo(10, 22);
    c.lineTo(2, 19);
    c.closePath();
    c.fill();
    c.strokeStyle = PAL_RG.gold2;
    c.lineWidth = 1.5;
    c.stroke();
    c.fillStyle = "#5a1729";
    c.fillRect(31, -2, 18, 4);
    if (flash) {
      const g = c.createRadialGradient(53, 0, 1, 53, 0, 25);
      g.addColorStop(0, "#fffbd0");
      g.addColorStop(0.3, "#ffc554");
      g.addColorStop(1, "rgba(255,120,20,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(53, 0, 25, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  function drawRegal(c, o) {
    const p = PAL_RG,
      run = o.run || 0,
      ph = o.phase || 0,
      crouch = o.crouch || 0,
      hip = -40 + crouch;
    c.save();
    c.translate(o.x, o.y);
    const regalStep = (o.run || 0) * Math.abs(Math.sin((o.phase || 0) * 0.5)) * 2.5;
    c.translate(0, -regalStep);
    c.scale(o.face * o.scale, o.scale);
    c.rotate((o.lean || 0) * 0.2 + Math.sin(o.phase || 0) * (o.run || 0) * 0.016);
    if (o.rot) c.rotate(o.rot);
    c.globalAlpha = o.alpha;
    if (o.flash) c.filter = "brightness(2.6) saturate(.5)";
    let f1 = {
        x: -9 + Math.sin(ph) * 17 * run,
        y: -Math.max(0, Math.cos(ph)) * 9 * run,
      },
      f2 = {
        x: 9 + Math.sin(ph + Math.PI) * 17 * run,
        y: -Math.max(0, Math.cos(ph + Math.PI)) * 9 * run,
      };
    if (o.slide) {
      f1 = { x: -23, y: -2 };
      f2 = { x: 24, y: -1 };
    }
    const leg = (hx, f, far) => {
      const k = ik(hx, hip, f.x, f.y, 22, 22, -1);
      limb(
        c,
        [
          { x: hx, y: hip },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        10,
        p.outline,
        far ? "#111017" : p.mid,
        "#443b46",
      );
      c.fillStyle = p.black;
      c.beginPath();
      c.ellipse(k.tx + 4, k.ty - 2, 10, 4.5, 0, 0, TAU);
      c.fill();
      c.strokeStyle = p.gold;
      c.lineWidth = 1;
      c.stroke();
    };
    leg(-4, f1, true);
    leg(4, f2, false);
    const sway = Math.sin(time * 2.2) * 3 - run * 11;
    poly(
      c,
      [
        [-11, hip - 5],
        [12, hip - 5],
        [20 + sway, hip + 41],
        [10 + sway, hip + 32],
        [4 + sway, hip + 45],
        [-3 + sway, hip + 34],
        [-12 + sway, hip + 42],
        [-19 + sway, hip + 28],
      ],
      p.red,
      p.outline,
      1.5,
    );
    c.strokeStyle = p.gold;
    c.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(-8 + i * 5, hip);
      c.quadraticCurveTo(-5 + i * 5, hip + 19, 4 + i * 4, hip + 36);
      c.stroke();
    }
    c.save();
    c.translate(0, crouch);
    c.rotate(o.lean || 0);
    // sweeping black/red coat and gold chains
    poly(
      c,
      [
        [-10, -82],
        [-21, -70],
        [-29 - sway * 0.3, -38],
        [-39 - sway * 0.7, -4],
        [-28 - sway, 2],
        [-20 - sway * 0.6, -12],
        [-12 - sway, 3],
        [-2, -45],
      ],
      "#09090d",
      p.outline,
      1.5,
    );
    poly(
      c,
      [
        [8, -78],
        [18, -66],
        [24 + sway * 0.2, -35],
        [32 + sway * 0.6, -4],
        [23 + sway, 1],
        [16 + sway * 0.5, -13],
        [9 + sway * 0.8, 2],
        [1, -44],
      ],
      p.red,
      p.outline,
      1.4,
    );
    const tg = c.createLinearGradient(-14, -80, 15, -45);
    tg.addColorStop(0, "#100f15");
    tg.addColorStop(0.55, "#2b242d");
    tg.addColorStop(1, "#0a090d");
    c.fillStyle = tg;
    c.beginPath();
    c.moveTo(-13, -80);
    c.quadraticCurveTo(1, -91, 14, -79);
    c.lineTo(11, -45);
    c.lineTo(-10, -45);
    c.closePath();
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.5;
    c.stroke();
    c.strokeStyle = p.gold;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-9, -75);
    c.quadraticCurveTo(0, -60, 11, -52);
    c.stroke();
    c.fillStyle = p.gold2;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.arc(-7 + i * 6, -72 + i * 6, 2.1, 0, TAU);
      c.fill();
    }
    // mask and extravagant bicorne hat
    c.fillStyle = "#050507";
    c.beginPath();
    c.arc(1, -94, 12, 0, TAU);
    c.fill();
    poly(
      c,
      [
        [-10, -100],
        [-5, -109],
        [7, -108],
        [13, -98],
        [9, -84],
        [-7, -85],
      ],
      "#17151a",
      p.outline,
      1.3,
    );
    c.fillStyle = "#030305";
    c.beginPath();
    c.moveTo(-8, -98);
    c.quadraticCurveTo(2, -102, 11, -96);
    c.lineTo(8, -88);
    c.lineTo(-7, -89);
    c.closePath();
    c.fill();
    c.strokeStyle = p.gold2;
    c.shadowColor = p.gold;
    c.shadowBlur = 6;
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(-4, -96);
    c.lineTo(7, -95);
    c.stroke();
    c.shadowBlur = 0;
    c.fillStyle = "#09080d";
    c.strokeStyle = p.gold;
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(-42, -109);
    c.quadraticCurveTo(-17, -132, 0, -116);
    c.quadraticCurveTo(18, -137, 43, -107);
    c.quadraticCurveTo(5, -97, -42, -109);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#755326";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-35, -108);
    c.quadraticCurveTo(-14, -125, 0, -113);
    c.quadraticCurveTo(17, -128, 36, -107);
    c.stroke();
    // ornate pauldron
    const pg = c.createRadialGradient(-3, -81, 1, 2, -77, 15);
    pg.addColorStop(0, p.gold2);
    pg.addColorStop(0.55, p.gold);
    pg.addColorStop(1, "#4c3416");
    c.fillStyle = pg;
    c.beginPath();
    c.arc(2, -77, 14, 0, TAU);
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.5;
    c.stroke();
    c.strokeStyle = "#f3d681";
    c.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      c.beginPath();
      c.moveTo(2, -77);
      c.lineTo(2 + Math.cos(a) * 12, -77 + Math.sin(a) * 12);
      c.stroke();
    }
    const s1 = { x: 3, y: -74 },
      h1 = {
        x: s1.x + Math.cos(o.swordA) * 30,
        y: s1.y + Math.sin(o.swordA) * 30,
      },
      s2 = { x: -4, y: -72 },
      h2 = { x: s2.x + Math.cos(o.gunA) * 28, y: s2.y + Math.sin(o.gunA) * 28 };
    let e = ik(s1.x, s1.y, h1.x, h1.y, 17, 17, -1);
    limb(
      c,
      [s1, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
      9,
      p.outline,
      p.red2,
      "#7c3343",
    );
    e = ik(s2.x, s2.y, h2.x, h2.y, 16, 16, 1);
    limb(
      c,
      [s2, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
      9,
      p.outline,
      p.mid,
      "#493f4b",
    );
    drawRegalSword(c, h1.x, h1.y, o.swordA);
    drawRegalGun(c, h2.x, h2.y, o.gunA, o.muzzle);
    if (o.magic) {
      const g = c.createRadialGradient(h2.x, h2.y, 1, h2.x, h2.y, 22);
      g.addColorStop(0, "#f2d9ff");
      g.addColorStop(0.3, "#7d3fac");
      g.addColorStop(1, "rgba(20,0,35,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(h2.x, h2.y, 22, 0, TAU);
      c.fill();
    }
    c.restore();
    c.restore();
  }
  function regalObj() {
    const air = P.y < GROUND - 3,
      o = {
        kind: "regal",
        scale: 1.06,
        x: P.x,
        y: P.y,
        face: P.face,
        run: 0,
        phase: P.stride,
        crouch: 0,
        lean: 0,
        swordA: 0.55,
        gunA: -0.16,
        flash: P.flash > 0,
        alpha: 1,
        muzzle: false,
        magic: false,
      };
    o.run = P.state === "free" && !air ? Math.min(1, Math.abs(P.vx) / 240) : 0;
    o.lean = o.run * 0.08;
    o.crouch = P.state === "free" && !air ? 9 * (P.landT / 0.14) : 0;
    if (P.state === "regalSword") {
      const k = clamp(P.t / 0.38, 0, 1),
        sw = k < 0.55 ? ease(k / 0.55) : easeOut((k - 0.55) / 0.45);
      o.swordA = lerp(-2.25, 1.05, sw);
      o.gunA = 0.45;
      o.lean = 0.12;
      o.run = 0;
    } else if (P.state === "regalGun") {
      o.gunA = -0.03;
      o.swordA = 1.2;
      o.muzzle = P.shotFired && P.t < 0.14;
      o.lean = -0.08;
      o.run = 0;
    } else if (P.state === "regalOrb") {
      o.gunA = lerp(0.3, -1.35, clamp(P.t / 0.28, 0, 1));
      o.swordA = 1.35;
      o.magic = true;
      o.lean = -0.1;
      o.run = 0;
    } else if (P.state === "regalBeam") {
      o.gunA = 0.02;
      o.swordA = 1.35;
      o.magic = true;
      o.lean = -0.16;
      o.run = 0;
    } else if (P.state === "dodge" || P.state === "airdash") {
      o.slide = !air;
      o.lean = 0.5;
      o.run = 0;
    } else if (P.state === "block") {
      o.swordA = -0.7;
      o.gunA = 0.6;
      o.crouch = 5;
      o.run = Math.min(1, Math.abs(P.vx) / 120) * 0.4;
    } else if (P.state === "hurt") {
      o.lean = -0.3;
      o.run = 0;
    } else if (P.state === "heal") {
      o.swordA = 1.65;
      o.gunA = 1.4;
      o.crouch = 6;
      o.run = 0;
    } else if (P.state === "dead") {
      o.rot = -Math.min(1.5, P.deadT * 3.5);
      o.run = 0;
      o.alpha = clamp(1 - (P.deadT - 1) * 0.8, 0.25, 1);
    }
    return o;
  }

  /* ================= KILLNUX — colossal-sword berserker ================= */
  const KILL_ATK = [
    { w: 0.3, a: 0.17, r: 0.34, reach: 168, lunge: 58, a0: -2.18, a1: 0.82 },
    { w: 0.25, a: 0.17, r: 0.36, reach: 172, lunge: 62, a0: 2.15, a1: -0.72 },
    { w: 0.38, a: 0.19, r: 0.52, reach: 184, lunge: 74, a0: -1.72, a1: 1.12 },
  ];
  function startKillAttack(idx = 0) {
    const A = KILL_ATK[idx];
    P.state = "killAttack";
    P.t = 0;
    P.combo = idx;
    P.hitDone = false;
    P.fxDone = false;
    P.st = Math.max(0, P.st - 30);
    P.stDelay = P.st <= 0 ? 1.15 : 0.76;
    const dir = (isActionHeld("right") ? 1 : 0) - (isActionHeld("left") ? 1 : 0);
    if (dir) P.face = dir;
    P.vx *= 0.28;
    buf.attack = 0;
  }
  function killnuxStrike(A) {
    if (P.hitDone || B.state === "dead" || B.state === "intro") return;
    const lo = Math.min(P.x - P.face * 28, P.x + P.face * (A.reach + 28)),
      hi = Math.max(P.x - P.face * 28, P.x + P.face * (A.reach + 28)),
      pb = GROUND - P.y;
    if (B.x + B.hw + 8 > lo && B.x - B.hw - 8 < hi && pb + 160 > B.h && pb - 38 < B.h + B.hh) {
      P.hitDone = true;
      hitBoss(200 * (P.killArmorT > 0 ? 1.5 : 1), 0.1);
      doShake(8);
      spark(B.x, GROUND - B.h - Math.min(95, B.hh * .55), 18, "#dbe1e8", 420, .4, 180);
    }
  }
  function startKillDodge(dir) {
    P.state = "killDodge";
    P.t = 0;
    P.dodgeDir = dir || P.face;
    P.face = P.dodgeDir;
    P.invuln = Math.max(P.invuln, 0.34);
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.55;
    buf.dodge = 0;
    sfx("dodge");
    dust(P.x, GROUND, 8);
  }
function startKillSkill1(dir) {
    P.state = "killSkill1";
    P.t = 0;
    P.killSkillFired = false;
    P.skill1CD = KILLNUX_SKILL1_CD;
    if (dir) P.face = dir;
    P.vx = 0;
    buf.skill1 = 0;
    sfx("charge");
  }
  function releaseKillWave() {
    const powered = P.killArmorT > 0;
    killWaves.push({
      owner: activePlayerIndex,
      x: P.x + P.face * 52,
      y: GROUND - 20,
      vx: P.face * 760,
      face: P.face,
      t: 0,
      life: 1.65,
      hit: false,
      dmg: 400 * (powered ? 1.5 : 1),
      powered,
    });
    sfx("boom"); doShake(16); doFlash(.24, "35,25,50");
    dust(P.x + P.face * 42, GROUND, 24);
    spark(P.x + P.face * 48, GROUND - 12, 30, powered ? "#8c65b2" : "#292633", 620, .6, 180);
    addRing(P.x + P.face * 42, GROUND - 4, 10, 155, .4, "rgba(40,34,52,.92)", 9);
  }
  function startKillSkill2() {
    P.state = "killTransform";
    P.t = 0;
    P.killSkillFired = false;
    P.skill2CD = KILLNUX_SKILL2_CD;
    P.vx = 0;
    buf.skill2 = 0;
    sfx("charge");
  }
  function updateKillWaves(dt) {
    for (let i = killWaves.length - 1; i >= 0; i--) {
      const w = killWaves[i],
        target = projectileTarget(w);
      const oldX = w.x;
      w.t += dt; w.x += w.vx * dt;
      if (Math.random() < .8) parts.push({k:"dot",x:w.x-rnd(0,45)*w.face,y:GROUND-rnd(4,42),vx:-w.face*rnd(15,80),vy:rnd(-35,5),life:rnd(.18,.38),t:0,col:w.powered?"85,55,110":"25,23,31",g:0,drag:2,sz:rnd(3,8)});
      let dead = w.t > w.life || w.x < -80 || w.x > WORLD + 80;
      if (!w.hit && target.state !== "dead" && target.state !== "intro" && sweptXHits(oldX, w.x, target.x, target.hw + 62) && target.h < 135) {
        w.hit = true; dead = true;
        hitProjectileTarget(w, w.dmg, .14, true, true);
        doShake(13); spark(w.x, GROUND - 48, 28, w.powered ? "#9b6fc5" : "#40394d", 520, .5, 120);
        addRing(w.x, GROUND - 38, 10, 105, .34, "rgba(55,45,70,.9)", 8);
      }
      if (dead) killWaves.splice(i, 1);
    }
  }
  function drawKillWaves() {
    for (const w of killWaves) {
      const k = clamp(w.t / w.life, 0, 1), pulse = 1 + Math.sin(time * 18) * .08;
      ctx.save(); ctx.translate(w.x, w.y); ctx.scale(w.face, 1); ctx.globalAlpha = 1 - k * .45;
      ctx.shadowColor = w.powered ? "#6d428f" : "#09080d"; ctx.shadowBlur = 20;
      const g = ctx.createLinearGradient(-45, 0, 58, -74);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.25, w.powered ? "rgba(52,31,70,.95)" : "rgba(5,5,8,.96)"); g.addColorStop(.72, w.powered ? "rgba(117,72,145,.9)" : "rgba(35,31,43,.9)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-72, 15); ctx.quadraticCurveTo(12, -132 * pulse, 96, 4); ctx.quadraticCurveTo(15, -24, -72, 15); ctx.fill();
      ctx.strokeStyle = w.powered ? "rgba(185,130,225,.72)" : "rgba(120,112,135,.5)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-48, 7); ctx.quadraticCurveTo(14, -108 * pulse, 82, 0); ctx.stroke();
      ctx.restore();
    }
  }
  function drawKillnuxSword(c, x, y, A, glow = 0) {
    const enchanted = heroType === "killnux" && P && P.killArmorT > 0;
    c.save(); c.translate(x, y); c.rotate(A);
    c.strokeStyle = "#030406"; c.lineWidth = 16; c.lineCap = "round";
    c.beginPath(); c.moveTo(-17,0); c.lineTo(6,0); c.stroke();
    c.strokeStyle = "#3a2a25"; c.lineWidth = 8; c.beginPath(); c.moveTo(-17,0); c.lineTo(7,0); c.stroke();
    c.lineCap = "butt";
    c.fillStyle = "#9ba1a8"; c.strokeStyle = "#08090b"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0,-11); c.lineTo(10,-13); c.lineTo(14,-7); c.lineTo(14,7); c.lineTo(10,13); c.lineTo(0,11); c.closePath(); c.fill(); c.stroke();
    const g=c.createLinearGradient(12,-16,112,16); g.addColorStop(0,"#d8dce0");g.addColorStop(.12,"#60656c");g.addColorStop(.5,"#171a1f");g.addColorStop(.86,"#484e55");g.addColorStop(1,"#d7dce1");
    c.shadowColor=enchanted?"#513164":"#d9e2eb";c.shadowBlur=glow;
    c.fillStyle=g;c.strokeStyle="#050608";c.lineWidth=2.4;
    c.beginPath();c.moveTo(12,-15);c.lineTo(106,-13);c.lineTo(122,0);c.lineTo(106,13);c.lineTo(12,15);c.closePath();c.fill();c.stroke();
    c.shadowBlur=0;c.strokeStyle=enchanted?"rgba(151,103,181,.9)":"rgba(245,248,250,.72)";c.lineWidth=1.4;c.beginPath();c.moveTo(18,-12);c.lineTo(104,-10);c.lineTo(116,0);c.stroke();
    if(enchanted){
      c.globalCompositeOperation="screen";c.fillStyle="rgba(47,28,58,.78)";c.shadowColor="#5d3970";c.shadowBlur=13;
      for(let i=0;i<7;i++){const xx=22+i*14,h=5+Math.sin(time*11+i*1.4)*3;c.beginPath();c.moveTo(xx-6,-12);c.quadraticCurveTo(xx,-21-h,xx+6,-11);c.quadraticCurveTo(xx,-7,xx-6,-12);c.fill();}
      c.shadowBlur=0;
    }
    c.restore();
  }
  function killnuxObj() {
    const air=P.y<GROUND-3, st=P.state;
    const o={x:P.x,y:P.y,face:P.face,scale:.9,phase:P.stride,run:0,air,crouch:0,lean:.025,swordA:-1.15,handR:31,alpha:1,flash:P.flash>0,rot:0,cloak:0,armored:P.killArmorT>0};
    o.run=st==="free"&&!air?Math.min(1,Math.abs(P.vx)/250):0;
    o.lean=.025+o.run*.09; o.cloak=-o.run*12; o.crouch=st==="free"&&!air?9*(P.landT/.14):0;
    if(st==="killAttack"){
      const A=KILL_ATK[P.combo];
      if(P.t<A.w){const k=easeOut(P.t/A.w);o.swordA=lerp(-1.15,A.a0,k);o.lean=-.14*k;o.crouch=6*k;}
      else if(P.t<A.w+A.a){const k=ease((P.t-A.w)/A.a);o.swordA=lerp(A.a0,A.a1,k);o.handR=lerp(27,45,k);o.lean=lerp(-.12,.34,k);o.crouch=7;}
      else{const k=clamp((P.t-A.w-A.a)/A.r,0,1);o.swordA=lerp(A.a1,-1.15,easeOut(k));o.handR=lerp(45,28,k);o.lean=.26*(1-k);}
      o.run=0;o.cloak=-18;
    }else if(st==="killSkill1"){
      if(P.t<.38){const k=easeOut(P.t/.38);o.swordA=lerp(-1.15,-1.72,k);o.handR=lerp(31,26,k);o.crouch=8*k;o.lean=-.16*k;}
      else if(P.t<.56){const k=ease((P.t-.38)/.18);o.swordA=lerp(-1.72,1.34,k);o.handR=lerp(26,47,k);o.crouch=lerp(8,17,k);o.lean=lerp(-.16,.38,k);}
      else{const k=clamp((P.t-.56)/.6,0,1);o.swordA=lerp(1.34,-1.15,easeOut(k));o.handR=lerp(47,31,k);o.crouch=17*(1-k);o.lean=.3*(1-k);}
      o.run=0;o.cloak=-22;
    }else if(st==="killTransform"){
      const k=clamp(P.t/1.35,0,1);o.swordA=lerp(-1.15,-1.48,ease(Math.min(1,k*1.8)));o.handR=35;o.crouch=10*Math.sin(k*Math.PI);o.lean=-.12*Math.sin(k*Math.PI);o.cloak=-28*Math.sin(k*Math.PI);o.armored=P.killSkillFired||k>.46;o.run=0;
    }else if(st==="killDodge"){o.crouch=23;o.lean=.64;o.swordA=2.75;o.run=0;o.cloak=-24;}
    else if(st==="block"){o.crouch=7;o.lean=-.08;o.swordA=-.18;o.handR=40;o.run=Math.min(1,Math.abs(P.vx)/120)*.35;}
    else if(st==="hurt"){o.lean=-.3;o.swordA=1.8;o.run=0;}
    else if(st==="heal"){o.crouch=6;o.swordA=1.45;o.run=0;}
    else if(st==="dead"){o.rot=-Math.min(1.35,P.deadT*2.7);o.alpha=clamp(1-(P.deadT-1)*.8,.25,1);o.run=0;}
    else if(air){o.swordA=-1.18;o.lean=.08;}
    // Blend the important pose channels between rendered frames. Each player
    // owns a separate cache, so local co-op never mixes their animation state.
    if(P.killVisualPose){
      const q=P.killVisualPose,k=.34;
      for(const key of ["swordA","handR","lean","crouch","cloak","run"])
        o[key]=lerp(q[key],o[key],k);
    }
    P.killVisualPose={
      swordA:o.swordA,handR:o.handR,lean:o.lean,crouch:o.crouch,
      cloak:o.cloak,run:o.run
    };
    return o;
  }
  function drawKillnux(c,o=killnuxObj()){
    const run=o.run||0,ph=o.phase||0,crouch=o.crouch||0,hip=-48+crouch;
    const ink="#020304",black=o.armored?"#020205":"#080a0d",mid=o.armored?"#090a10":"#171a1f",steel=o.armored?"#333741":"#626a73",edge="#c7ced5",skin="#bd8d72";
    const breathe=run<.08&&P.state==="free"?Math.sin(time*2.35)*.85:0;
    c.save();c.translate(o.x,o.y-run*Math.abs(Math.sin(ph))*2.8+breathe);c.scale(o.face*o.scale,o.scale);c.rotate((o.rot||0)+(o.lean||0)*.22+Math.sin(ph)*run*.018);c.globalAlpha=o.alpha;if(o.flash)c.filter="brightness(2.5) saturate(.4)";
    if(o.armored){
      c.save();c.globalCompositeOperation="screen";c.fillStyle="rgba(45,30,62,"+(.1+.04*Math.sin(time*8))+")";c.shadowColor="#4c315f";c.shadowBlur=24;c.beginPath();c.ellipse(0,-67,42,76,0,0,TAU);c.fill();c.restore();
    }
    // broad wind-reactive cloak
    const sway=Math.sin(time*2.2+ph*.12)*4+(o.cloak||0);
    const cg=c.createLinearGradient(-10,-102,-45,0);cg.addColorStop(0,"#20242a");cg.addColorStop(.45,"#0c0e12");cg.addColorStop(1,"#030405");
    c.fillStyle=cg;c.strokeStyle=ink;c.lineWidth=1.7;c.beginPath();c.moveTo(-18,-94);c.quadraticCurveTo(-38+sway,-72,-34+sway,-25);c.lineTo(-25+sway,3);c.lineTo(-14+sway,-5);c.lineTo(-4+sway,7);c.lineTo(7+sway,-5);c.lineTo(18+sway,1);c.lineTo(24+sway,-49);c.lineTo(17,-94);c.closePath();c.fill();c.stroke();
    c.strokeStyle="rgba(115,125,138,.3)";c.lineWidth=1;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-14+i*7,-90);c.quadraticCurveTo(-27+sway+i*9,-48,-19+sway+i*8,-2);c.stroke();}
    let f1={x:-13+Math.sin(ph)*18*run,y:-Math.max(0,Math.cos(ph))*9*run},f2={x:14+Math.sin(ph+Math.PI)*18*run,y:-Math.max(0,Math.cos(ph+Math.PI))*9*run};
    if(o.air){f1={x:-14,y:-16};f2={x:18,y:-25};}if(P.state==="killDodge"){f1={x:-24,y:-2};f2={x:25,y:-1};}
    const leg=(hx,f,far)=>{const k=ik(hx,hip,f.x,f.y,24,25,-1);limb(c,[{x:hx,y:hip},{x:k.x,y:k.y},{x:k.tx,y:k.ty}],8.5,ink,far?"#0a0b0e":mid,steel);poly(c,[[k.tx-8,k.ty-4],[k.tx+12,k.ty-4],[k.tx+18,k.ty],[k.tx+9,k.ty+3],[k.tx-8,k.ty+2]],black,ink,1);};leg(-6,f1,true);leg(6,f2,false);
    c.save();c.translate(0,crouch*.6);
    // layered dark plate and belts
    c.fillStyle=mid;c.strokeStyle=ink;c.lineWidth=1.8;c.beginPath();c.moveTo(-19,-86);c.quadraticCurveTo(0,-101,20,-85);c.lineTo(14,-45);c.quadraticCurveTo(0,-38,-14,-46);c.closePath();c.fill();c.stroke();
    c.strokeStyle=steel;c.lineWidth=1.4;for(let y=-79;y<-48;y+=8){c.beginPath();c.moveTo(-15,y);c.lineTo(15,y+2);c.stroke();}
    c.fillStyle="#35271f";c.fillRect(-15,-50,30,6);c.strokeStyle=ink;c.strokeRect(-15,-50,30,6);c.fillStyle=steel;for(let x=-11;x<13;x+=8)c.fillRect(x,-49,2.5,4);
    poly(c,[[-13,-44],[13,-44],[12,-18],[6,-25],[1,-14],[-5,-26],[-11,-18]],black,ink,1.3);
    if(o.armored){
      c.strokeStyle="#3c3449";c.lineWidth=1.2;
      for(let yy=-82;yy<-44;yy+=7)for(let xx=-15;xx<16;xx+=10){c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+5,yy+4);c.lineTo(xx,yy+8);c.stroke();}
      poly(c,[[-25,-89],[-13,-101],[-4,-89],[-13,-78]],"#0b0c12",ink,1.2);poly(c,[[25,-89],[13,-101],[4,-89],[13,-78]],"#0b0c12",ink,1.2);
    }
    // asymmetric pauldrons
    const pauldron=(x,y,big)=>{c.fillStyle=big?"#262a30":"#171a1f";c.strokeStyle=ink;c.lineWidth=1.6;c.beginPath();c.ellipse(x,y,big?14:11,big?10:8,x<0?-.25:.25,0,TAU);c.fill();c.stroke();c.strokeStyle=steel;c.lineWidth=1;c.beginPath();c.arc(x,y,big?10:8,.2,2.8);c.stroke();};pauldron(-21,-82,true);pauldron(22,-81,false);
    // neck scarf and a narrower, human face with a defined jaw
    c.fillStyle="#050608";c.beginPath();c.ellipse(0,-96,15,10,0,0,TAU);c.fill();
    const face=c.createLinearGradient(-9,-125,9,-101);
    face.addColorStop(0,"#d4a187");face.addColorStop(.48,skin);face.addColorStop(1,"#805747");
    c.fillStyle=face;c.strokeStyle=ink;c.lineWidth=1.25;c.beginPath();
    c.moveTo(-8,-122);c.quadraticCurveTo(-7,-130,1,-131);c.quadraticCurveTo(9,-129,10,-121);
    c.lineTo(7,-106);c.quadraticCurveTo(4,-100,0,-98);c.quadraticCurveTo(-5,-101,-8,-107);c.closePath();c.fill();c.stroke();
    // brows, focused eyes, nose, mouth and the diagonal scar
    c.strokeStyle="#2b1d1b";c.lineWidth=1.35;c.beginPath();c.moveTo(-7,-118);c.lineTo(-1,-119);c.moveTo(2,-119);c.lineTo(8,-117);c.stroke();
    c.fillStyle="#17181b";c.beginPath();c.ellipse(-4.2,-115.5,2.4,1.05,-.12,0,TAU);c.ellipse(4.8,-114.8,2.4,1.05,.12,0,TAU);c.fill();
    c.strokeStyle="rgba(76,43,35,.9)";c.lineWidth=1;c.beginPath();c.moveTo(.4,-115);c.lineTo(-.8,-109);c.lineTo(1.6,-108);c.moveTo(-3,-104.5);c.quadraticCurveTo(1,-102.8,4.5,-104.8);c.stroke();
    c.strokeStyle="#533029";c.lineWidth=1.15;c.beginPath();c.moveTo(-7,-121);c.lineTo(5,-103);c.moveTo(-6,-112);c.lineTo(7,-113.5);c.stroke();
    // layered spiky hair instead of a flat rectangular crown
    c.fillStyle="#08090c";c.beginPath();c.ellipse(0,-124,10.5,7.5,0,Math.PI,TAU);c.fill();
    for(let i=0;i<11;i++){const x=-10.5+i*2.05,h=4.5+((i*5)%4)*1.35,lean=(i-5)*.14;poly(c,[[x,-122],[x+lean,-128-h],[x+2.8,-121]],i%2?"#050608":"#15171c",ink,.55);}
    if(o.armored){
      poly(c,[[-15,-125],[-10,-139],[-3,-134],[2,-145],[8,-134],[16,-138],[13,-119],[8,-102],[0,-96],[-9,-103]],"#090a0e",ink,1.4);
      poly(c,[[-11,-133],[-20,-144],[-14,-121]],"#171922",ink,1);poly(c,[[10,-134],[20,-145],[14,-121]],"#171922",ink,1);
      c.fillStyle="#b84b45";c.shadowColor="#7b2434";c.shadowBlur=8;c.beginPath();c.ellipse(6,-119,3.2,1.8,-.15,0,TAU);c.fill();c.shadowBlur=0;
      c.strokeStyle="#4d5260";c.lineWidth=1;c.beginPath();c.moveTo(-6,-112);c.lineTo(8,-109);c.lineTo(4,-101);c.stroke();
    }
    const shoulder={x:17,y:-80},A=o.swordA,R=o.handR,hand={x:shoulder.x+Math.cos(A)*R,y:shoulder.y+Math.sin(A)*R},el=ik(shoulder.x,shoulder.y,hand.x,hand.y,19,20,1);
    limb(c,[shoulder,{x:el.x,y:el.y},{x:el.tx,y:el.ty}],9.5,ink,mid,steel);
    // second hand follows the huge grip on heavy swings
    const grip2={x:hand.x-Math.cos(A)*18,y:hand.y-Math.sin(A)*18},s2={x:-16,y:-80},e2=ik(s2.x,s2.y,grip2.x,grip2.y,19,20,-1);
    limb(c,[s2,{x:e2.x,y:e2.y},{x:e2.tx,y:e2.ty}],9,ink,"#12151a",steel);
    drawKillnuxSword(c,hand.x,hand.y,A,o.armored?22:(P.state==="killSkill1"?12:2));
    c.fillStyle=steel;c.beginPath();c.arc(hand.x,hand.y,5,0,TAU);c.fill();c.restore();c.restore();
  }

  /* ================= COMBAT DATA ================= */
  const ATK = [
    {
      w: 0.02,
      a: 0.08,
      r: 0.09,
      cost: 20,
      reach: 122,
      lunge: 40,
      a0: -2.3,
      a1: 1.05,
    },
    {
      w: 0.02,
      a: 0.08,
      r: 0.09,
      cost: 20,
      reach: 128,
      lunge: 40,
      a0: 1.35,
      a1: -1.6,
    },
    {
      w: 0.03,
      a: 0.09,
      r: 0.17,
      cost: 20,
      reach: 160,
      lunge: 80,
      a0: -0.5,
      a1: 0.05,
      thrust: true,
    },
  ];
  // Purple Wraithspike Knight uses the authored three-hit greatsword cadence.
  // Damage remains 150 per hit to preserve the game balance in v6.3.
  const WRAITH_ATK = [
    { w: 0.114, a: 0.106, r: 0.160, cost: 20, reach: 132, lunge: 49.4, a0: -2.25, a1: 0.78 },
    { w: 0.101, a: 0.108, r: 0.151, cost: 20, reach: 136, lunge: 39.6, a0: 1.42, a1: -0.82 },
    { w: 0.346, a: 0.144, r: 0.230, cost: 20, reach: 172, lunge: 83.3, a0: -2.35, a1: 1.12 },
  ];
  // Thor uses an authored three-hit storm-blade cadence: 120 damage per hit, 20 stamina.
  const THOR_ATK = [
    { w: 0.1, a: 0.1, r: 0.14, cost: 20, reach: 130, lunge: 46, a0: -2.3, a1: 0.8 },
    { w: 0.1, a: 0.1, r: 0.14, cost: 20, reach: 136, lunge: 42, a0: 1.4, a1: -0.9 },
    { w: 0.16, a: 0.12, r: 0.2, cost: 20, reach: 168, lunge: 78, a0: -2.4, a1: 1.1 },
  ];
  function basicAttackData(idx) {
    return heroType === "wraithknight"
      ? WRAITH_ATK[idx]
      : heroType === "thor"
        ? THOR_ATK[idx]
        : ATK[idx];
  }
  const RECT = {
    sweep: { x0: 8, x1: 190, h0: 0, h1: 62 },
    over: { x0: 8, x1: 165, h0: 0, h1: 155 },
    thrust: { x0: 8, x1: 225, h0: 30, h1: 118 },
    rise: { x0: -10, x1: 170, h0: 0, h1: 155 },
  };
  const STOP = { sweep: 105, over: 100, thrust: 135, rise: 100 };
  const mkA = (type, w, a, r, lunge) => ({
    type,
    w,
    a,
    r,
    lunge,
    rect: RECT[type],
    stop: STOP[type],
  });
  const COMBOS = [
    {
      name: "Twin Cut",
      atks: [
        mkA("sweep", 0.62, 0.12, 0.28, 70),
        mkA("over", 0.55, 0.13, 1.0, 50),
      ],
    },
    {
      name: "Triple Reaver",
      atks: [
        mkA("thrust", 0.56, 0.12, 0.3, 90),
        mkA("sweep", 0.42, 0.12, 0.28, 60),
        mkA("rise", 0.5, 0.13, 1.0, 50),
      ],
    },
    {
      name: "Crescent Fall",
      atks: [
        mkA("rise", 0.66, 0.13, 0.34, 70),
        mkA("over", 0.36, 0.12, 0.3, 60),
        mkA("thrust", 0.78, 0.12, 1.05, 110),
      ],
    },
    {
      name: "Requiem",
      atks: [
        mkA("sweep", 0.5, 0.12, 0.26, 70),
        mkA("sweep", 0.36, 0.12, 0.3, 60),
        mkA("over", 0.6, 0.13, 0.34, 60),
        mkA("thrust", 0.7, 0.12, 1.1, 90),
      ],
    },
  ];
  const BK = {
    over: { aw: -2.1, a1: 1.25, wl: -0.12, sl: 0.22, rw: 26, rs: 28 },
    sweep: { aw: 2.9, a1: 0.05, wl: -0.2, sl: 0.25, rw: 26, rs: 34 },
    thrust: { aw: -0.15, a1: 0.02, wl: -0.22, sl: 0.3, rw: 12, rs: 40 },
    rise: { aw: 1.7, a1: -1.9, wl: 0.15, sl: -0.1, rw: 28, rs: 26 },
  };

  /* ================= STATE ================= */
  let phase = "title",
    phaseT = 0,
    time = 0,
    hitstop = 0,
    shake = 0,
    screenFlash = 0,
    screenFlashCol = "255,255,255",
    impactMuteT = 0,
    cam = 0;
  let pvpWinner = 0;
  let P, P2 = null, B;
  let players = [];
  let playerHeroes = ["knight", "killnux"];
  const parts = [],
    fx = [],
    motes = [];
  const orbs = [];
  const slashes = [];
  const demonHazards = [];
  const shogunHazards = [];
  const volturusHazards = [];
  const wraithHazards = [];
  const wardenHazards = [];
  const spireHazards = [];
  let shogunMinion = null;
  const SKILL1_CD = 30,
    SKILL2_CD = 80;
  let bossType = "sentinel";
  function bossHP() {
    return bossType === "art"
      ? 12000
      : bossType === "demon"
        ? 16000
        : bossType === "spire"
          ? 30000
        : bossType === "warden"
          ? 25000
        : bossType === "shogun" || bossType === "volturus" || bossType === "wraith"
          ? 15000
          : 4000;
  }
  const prev = {
    bh: 0,
    px: 0,
    py: 0,
    bx: 0,
    cam: 0,
    pt: 0,
    bpt: 0,
    ps: "",
    bs: "",
    bph: "",
    time: 0,
    pst: 0,
    bst: 0,
  };
  function savePrev() {
    prev.px = P.x;
    prev.py = P.y;
    prev.bx = B.x;
    prev.cam = cam;
    prev.pt = P.t;
    prev.bpt = B.pt;
    prev.ps = P.state;
    prev.bs = B.state;
    prev.bph = B.phase;
    prev.pst = P.stride;
    prev.bst = B.stride;
    prev.bh = B.h;
  }
  function reset() {
    const rb = buildBonuses(),
      maxHp = HERO_STATS[heroType].hp + rb.health,
      maxSt = HERO_STATS[heroType].st + rb.stamina;
    P = {
      x: 560,
      y: GROUND,
      vx: 0,
      vy: 0,
      face: 1,
      hp: maxHp,
      maxhp: maxHp,
      ghost: maxHp,
      ghostDelay: 0,
      st: maxSt,
      maxst: maxSt,
      stDelay: 0,
      flasks: HERO_STATS[heroType].flasks,
      maxFlasks: HERO_STATS[heroType].flasks,
      state: "free",
      t: 0,
      combo: 0,
      hitDone: false,
      fxDone: false,
      invuln: 0,
      flash: 0,
      parrySucc: false,
      endT: 0.62,
      healed: false,
      plungeHit: false,
      deadT: 0,
      reviveT: 0,
      dodgeDir: 1,
      airAtk: false,
      parryFlash: 0,
      airDodged: false,
      landT: 0,
      stride: 0,
      blockFlash: 0,
      skill1CD: 0,
      skill2CD: 0,
      skill1Fired: false,
      skill2Fired: false,
      skill2Hit: false,
      shotFired: false,
      rt: "",
      teleDir: 1,
      rPhase: "",
      rHit100: false,
      rArrows: 0,
      rNextArrow: 0,
      rDropped: false,
      rStartX: 0,
      rTargetX: 0,
      rainFired: false,
      regalHit: false,
      regalFx: false,
      regalOrbFired: false,
      regalBeamFired: false,
      wizardHit: false,
      wizardFx: false,
      flameT: 0,
      killArmorT: 0,
      killSkillFired: false,
      wraithBuffT: 0,
      wraithSkillFired: false,
      wraithTeleportDone: false,
      wraithTeleportStartX: 0,
      thorBuffT: 0,
      thorSkillFired: false,
      thorTeleportDone: false,
      thorTeleportStartX: 0,
      thorDivePhase: "",
      thorDiveHit: false,
      thorDiveTargetX: 0,
      jumpCount: 0,
      deflects: 0,
      roninStartX: 0,
      roninTargetX: 0,
      roninHit: false,
      attackMult: 1 + rb.attack,
      skillAttackMult: 1 + rb.skillAttack,
      defenseMult: Math.max(0, 1 - rb.defense),
      skillRate: 1 + rb.cooldown,
      staminaRegenMult: 1 + rb.staminaRecovery,
      healMult: 1 + rb.healing,
    };
    B = {
      type: bossType,
      hw:
        bossType === "demon"
          ? 58
          : bossType === "art" || bossType === "shogun" || bossType === "volturus" || bossType === "wraith" || bossType === "warden" || bossType === "spire" || bossType === "spire"
            ? 38
            : 34,
      hh:
        bossType === "demon"
          ? 205
          : bossType === "volturus" || bossType === "wraith" || bossType === "warden"
            ? 190
          : bossType === "art" || bossType === "shogun"
            ? 165
            : 148,
      h: 0,
      jn: 0,
      rn: 0,
      jx0: 0,
      jx1: 0,
      rdir: 1,
      rdist: 0,
      rmoved: 0,
      jfirst: true,
      rfirst: true,
      x: 1230,
      y: GROUND,
      face: -1,
      hp: bossHP(),
      maxhp: bossHP(),
      ghost: bossHP(),
      ghostDelay: 0,
      state: "intro",
      t: 0,
      cool: 1,
      last: "",
      lastCombo: -1,
      flash: 0,
      stunT: 0,
      combo: null,
      ci: 0,
      atk: null,
      phase: "",
      pt: 0,
      hitDone: false,
      rage: false,
      moving: false,
      beamHit: false,
      dieT: 0,
      roared: false,
      expR: 0,
      introFill: 0,
      stride: 0,
      execMark: null,
      dphase: 1,
      transformed2: false,
      transformed3: false,
      shots: 0,
      shotNext: 0,
      mode: "",
      teleX: 0,
      parryT: 0,
      prevDPhase: 1,
      sphase: 1,
      sparryT: 0,
      sIndex: 0,
      sCount: 0,
      sNext: 0,
      sMode: "",
      sFly: 0,
      moveV: 0,
      moveLean: 0,
      bowDraw: 0,
      vphase: 1,
      revived: false,
      vattack: "",
      vNext: 0,
      vCount: 0,
      vTargetX: 0,
      vStarted: false,
      vDashPass: 0,
      vDashPasses: 0,
      vDashPhase: "",
      vDashPhaseT: 0,
      vDashStartX: 0,
      vDashDistance: 0,
      vDashDir: 1,
      vAura: 0,
      wphase: 1,
      wattack: "",
      wCount: 0,
      wHits: 0,
      wNext: 0,
      wStarted: false,
      wTargetX: 0,
      wStartX: 0,
      ephase: 1,
      eattack: "",
      eCount: 0,
      eHits: 0,
      eNext: 0,
      eStarted: false,
      eTargetX: 0,
      eStartX: 0,
      eAffinity: "magic",
      eAura: 0,
      spAttack: "",
      spHits: 0,
      spIndex: 0,
      spHitDone: false,
      spStartX: 0,
      spTargetX: 0,
      spTrail: [],
      spStunStarted: false,
      spNext: 0,
      spSpawned: 0,
      spBaseX: 0,
    };
    const flaskLimit = gameMode === "pvp" ? 4 : gameMode === "coop" ? 5 : null;
    if (flaskLimit !== null) {
      playerHeroes = [heroType, heroType2];
      P.flasks = P.maxFlasks = flaskLimit;
      P.x = gameMode === "pvp" ? 510 : 470;
      P.face = 1;
      P2 = JSON.parse(JSON.stringify(P));
      const stats2 = HERO_STATS[heroType2];
      P2.x = gameMode === "pvp" ? 1290 : 650;
      P2.face = gameMode === "pvp" ? -1 : 1;
      P2.hp = P2.maxhp = P2.ghost = stats2.hp;
      P2.st = P2.maxst = stats2.st;
      P2.flasks = P2.maxFlasks = flaskLimit;
      P2.state = "free";
      P2.t = 0;
      players = [P, P2];
      if (gameMode === "coop") {
        // Two heroes deal much more combined damage, so co-op bosses get 2× HP.
        B.hp = B.maxhp = B.ghost = bossHP() * 2;
      }
      if (gameMode === "pvp") {
        B.type = "pvp";
        B.state = "idle";
        B.x = WORLD / 2;
        B.hp = B.maxhp = B.ghost = 1;
        B.introFill = 1;
      }
    } else {
      P2 = null;
      players = [P];
    }
    parts.length = 0;
    fx.length = 0;
    orbs.length = 0;
    slashes.length = 0;
    demonHazards.length = 0;
    shogunHazards.length = 0;
    volturusHazards.length = 0;
    wraithHazards.length = 0;
    wardenHazards.length = 0;
    spireHazards.length = 0;
    wraithKnightBolts.length = 0;
    thorBolts.length = 0;
    thorHammers.length = 0;
    shogunMinion = null;
    arrows.length = 0;
    rain.length = 0;
    regalShots.length = 0;
    regalMeteors.length = 0;
    regalBeams.length = 0;
    wizardMissiles.length = 0;
    skeletons.length = 0;
    killWaves.length = 0;
    cam = gameMode === "pvp"
      ? clamp((P.x + P2.x) * 0.5 - W / 2, 0, WORLD - W)
      : clamp(P.x * 0.6 + B.x * 0.4 - W / 2, 0, WORLD - W);
    hitstop = 0;
    shake = 0;
    screenFlash = 0;
    savePrev();
  }
  function pvpTargetFor(attackerIndex, sourceX, direction = 0) {
    const defenderIndex = attackerIndex === 0 ? 1 : 0,
      defender = players[defenderIndex];
    let entity = defender,
      targetSkeleton = null,
      best = defender ? Math.abs(defender.x - sourceX) : Infinity;
    for (const s of skeletons) {
      if (
        (s.owner || 0) !== defenderIndex ||
        s.hp <= 0 ||
        s.state === "dead" ||
        s.state === "spawn"
      )
        continue;
      const dx = s.x - sourceX;
      if (direction && dx * direction < -25) continue;
      const d = Math.abs(dx);
      if (d < best) {
        best = d;
        entity = s;
        targetSkeleton = s;
      }
    }
    return { entity, targetSkeleton };
  }
  function pvpProxy(target, targetSkeleton = null) {
    return {
      type: "pvp",
      x: target.x,
      y: targetSkeleton ? GROUND : target.y,
      h: targetSkeleton ? 0 : Math.max(0, GROUND - target.y),
      hw: targetSkeleton ? 24 : 30,
      hh: targetSkeleton ? 118 : 138,
      hp: target.hp,
      maxhp: target.maxhp,
      ghost: target.ghost,
      state: target.state === "dead" ? "dead" : "idle",
      targetSkeleton,
      phase: "",
      flash: target.flash,
      stunT: 0,
      combo: null,
      hitDone: false,
      execMark: null,
    };
  }
  function withPlayer(index, fn, usePvpTarget = false) {
    if (!players[index]) return;
    const oldP = P,
      oldHero = heroType,
      oldHeld = held,
      oldBuf = buf,
      oldB = B;
    activePlayerIndex = index;
    P = players[index];
    heroType = playerHeroes[index];
    held = index === 0 ? held : held2;
    buf = index === 0 ? buf : buf2;
    if (usePvpTarget && gameMode === "pvp") {
      const target = pvpTargetFor(index, P.x, P.face);
      B = pvpProxy(target.entity, target.targetSkeleton);
    }
    try {
      return fn();
    } finally {
      players[index] = P;
      P = oldP;
      heroType = oldHero;
      held = oldHeld;
      buf = oldBuf;
      B = oldB;
      activePlayerIndex = 0;
    }
  }
  for (let i = 0; i < 46; i++)
    motes.push({
      x: rnd(0, WORLD),
      y: rnd(80, 520),
      vx: rnd(-10, 6),
      vy: rnd(-4, 6),
      s: rnd(1, 2.6),
      ph: rnd(0, 7),
      petal: Math.random() < 0.35,
    });
  const inputOn = () =>
    phase === "fight" || phase === "won" || phase === "lost";

  /* ================= EFFECT HELPERS ================= */
  function spark(x, y, n, col, spd, life, grav) {
    if (impactMuteT > 0) return;
    n = Math.max(1, Math.round(n * qualityFactor()));
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU),
        s = rnd(0.3, 1) * spd;
      parts.push({
        k: "spark",
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rnd(0.5, 1) * life,
        t: 0,
        col,
        g: grav === undefined ? 700 : grav,
        drag: 1.5,
        sz: rnd(1.2, 2.6),
      });
    }
  }
  function dust(x, y, n) {
    n = Math.max(1, Math.round(n * qualityFactor()));
    for (let i = 0; i < n; i++)
      parts.push({
        k: "dot",
        x: x + rnd(-14, 14),
        y: y - 2,
        vx: rnd(-60, 60),
        vy: rnd(-60, -10),
        life: rnd(0.3, 0.6),
        t: 0,
        col: "150,140,170",
        g: 0,
        drag: 2,
        sz: rnd(3, 6),
      });
  }
  function petals(x, y, n, spd) {
    n = Math.max(1, Math.round(n * qualityFactor()));
    for (let i = 0; i < n; i++) {
      const a = rnd(-Math.PI, 0),
        s = rnd(0.2, 1) * spd;
      parts.push({
        k: "petal",
        x: x + rnd(-30, 30),
        y: y - rnd(0, 20),
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rnd(1.4, 2.8),
        t: 0,
        g: 60,
        drag: 0.6,
        rot: rnd(0, 7),
        vr: rnd(-6, 6),
        sz: rnd(2.5, 4.5),
      });
    }
  }
  function addArc(x, y, r, a0, a1, face, life, col, w) {
    fx.push({ k: "arc", x, y, r, a0, a1, face, life, t: 0, col, w });
  }
  function addStreak(x, y, len, col, life) {
    fx.push({ k: "streak", x, y, len, life: life || 0.13, t: 0, col });
  }
  function addRing(x, y, r0, r1, life, col, w) {
    if (impactMuteT > 0) return;
    fx.push({ k: "ring", x, y, r0, r1, life, t: 0, col, w });
  }
  function addText(x, y, txt, col, size, life) {
    fx.push({ k: "text", x, y, txt, col, size, life: life || 1, t: 0 });
  }
  function doShake(v) {
    // Camera jiggle is intentionally disabled for stable frame pacing.
    shake = 0;
  }
  function doFlash(v, col) {
    // Full-screen impact flashes are disabled to avoid white flicker and stalls.
    screenFlash = 0;
  }

  /* ================= PLAYER ================= */
  function startAttack(idx) {
    const A = basicAttackData(idx);
    P.state = "attack";
    P.t = 0;
    P.combo = idx;
    P.hitDone = false;
    P.fxDone = false;
    P.airAtk = P.y < GROUND - 2;
    P.st = Math.max(0, P.st - A.cost);
    P.stDelay = P.st <= 0 ? 1.1 : 0.7;
    const dir = (isActionHeld("right") ? 1 : 0) - (isActionHeld("left") ? 1 : 0);
    if (dir) P.face = dir;
    buf.attack = 0;
  }
  function heroHit(A) {
    if (P.hitDone || B.state === "dead" || B.state === "intro") return;
    const lo = Math.min(P.x - P.face * 20, P.x + P.face * (A.reach + 22)),
      hi = Math.max(P.x - P.face * 20, P.x + P.face * (A.reach + 22));
    const pb = GROUND - P.y;
    const bb = B.h;
    if (
      B.x + B.hw + 6 > lo &&
      B.x - B.hw - 6 < hi &&
      pb + 145 > bb &&
      pb - 34 < bb + B.hh
    ) {
      P.hitDone = true;
      const dmg =
        heroType === "wraithknight"
          ? 150
          : heroType === "ronin"
            ? P.flameT > 0
              ? 150
              : 100
            : 120;
      hitBoss(dmg, P.combo === 2 ? 0.08 : 0.04);
    }
  }
  function hitPvpOpponent(dmg, stop) {
    const targetIndex = activePlayerIndex === 0 ? 1 : 0,
      target = players[targetIndex];
    if (!target || target.state === "dead" || target.invuln > 0) return;
    const targetHero = playerHeroes[targetIndex],
      parryWindow = targetHero === "ronin" ? RONIN_DEFLECT_WIN : PARRY_WIN;
    if (
      target.state === "parry" &&
      !target.parrySucc &&
      target.t < parryWindow &&
      (targetHero === "ronin" || target.face === -P.face)
    ) {
      target.parrySucc = true;
      target.endT = target.t + 0.24;
      target.st = Math.min(target.maxst, target.st + (targetHero === "ronin" ? 18 : 30));
      target.parryFlash = 0.3;
      target.invuln = 0.18;
      P.vx = -P.face * 260;
      addText(target.x, target.y - 130, "PARRIED", "#d9b5ff", 24, 1);
      spark((P.x + target.x) / 2, target.y - 68, 26, "#c38cff", 560, 0.5);
      addRing((P.x + target.x) / 2, target.y - 68, 5, 76, 0.3, "rgba(170,95,255,.92)", 5);
      sfx("parry");
      return;
    }
    impactMuteT = 0.12;
    // PvP damage is reduced by 50% so local duels last longer.
    dmg = Math.max(1, Math.round(dmg * (P.attackMult || 1) * (P.wraithBuffT > 0 ? 1.4 : 1) * 0.5));
    if (target.state === "block") dmg = Math.round(dmg * 0.75);
    target.hp = Math.max(0, target.hp - dmg);
    target.ghostDelay = 0.55;
    target.flash = 0;
    target.invuln = target.state === "block" ? 0.28 : 0.48;
    target.vx = P.face * Math.min(520, 160 + dmg * 0.8);
    if (target.state !== "block") {
      target.state = "hurt";
      target.t = 0;
    }
    addText(target.x, target.y - 125, String(dmg), targetIndex ? "#8bc5ff" : "#ffd277", 21, 0.8);
    sfx(target.state === "block" ? "block" : "hit");
    if (target.hp <= 0) {
      target.state = "dead";
      target.deadT = 0;
      pvpWinner = activePlayerIndex + 1;
      phase = "won";
      phaseT = 0;
      doShake(18);
      sfx("die");
    }
  }
  function hitPvpSkeleton(s, dmg, skill, owner = activePlayerIndex) {
    if (!s || s.hp <= 0 || s.state === "dead" || s.state === "spawn")
      return false;
    const attacker = players[owner] || P;
    dmg = Math.max(
      1,
      Math.round(
        dmg *
          (attacker.attackMult || 1) *
          (skill ? attacker.skillAttackMult || 1 : 1) *
          0.5,
      ),
    );
    damageSkeleton(s, dmg);
    impactMuteT = 0.12;
    sfx("hit");
    return true;
  }
  function projectileTarget(projectile) {
    if (gameMode !== "pvp") return B;
    const owner = projectile.owner || 0,
      picked = pvpTargetFor(
        owner,
        projectile.x,
        Math.sign(projectile.vx || 0),
      );
    projectile.pvpTargetSkeleton = picked.targetSkeleton;
    return pvpProxy(picked.entity, picked.targetSkeleton);
  }
  function hitProjectileTarget(projectile, dmg, stop, ranged, skill) {
    if (gameMode !== "pvp") return hitBoss(dmg, stop, ranged, skill);
    if (
      projectile.pvpTargetSkeleton &&
      hitPvpSkeleton(
        projectile.pvpTargetSkeleton,
        dmg,
        skill,
        projectile.owner || 0,
      )
    )
      return;
    const oldIndex = activePlayerIndex;
    activePlayerIndex = projectile.owner || 0;
    hitPvpOpponent(dmg, stop);
    activePlayerIndex = oldIndex;
  }
  function hitBoss(dmg, stop, ranged, skill) {
    if (gameMode === "pvp") {
      if (B.targetSkeleton) {
        hitPvpSkeleton(B.targetSkeleton, dmg, skill);
        return;
      }
      hitPvpOpponent(dmg, stop);
      return;
    }
    if (
      B.state === "dead" ||
      B.state === "intro" ||
      B.state === "transform" ||
      B.state === "stransform" ||
      B.state === "vtransform" ||
      B.state === "vrevive"
    )
      return;
    dmg = Math.max(
      1,
      Math.round(
        dmg * (P.attackMult || 1) * (P.wraithBuffT > 0 ? 1.4 : 1) * (skill ? P.skillAttackMult || 1 : 1),
      ),
    );
    if (B.type === "shogun" && B.sparryT <= 0 && Math.random() < 0.1) {
      B.sparryT = 0.34;
      sfx("parry");
      doFlash(0.18, B.sphase === 2 ? "80,45,100" : "255,105,35");
      addText(
        B.x,
        GROUND - 225,
        "DEFLECTED",
        B.sphase === 2 ? "#c58cff" : "#ffb16b",
        18,
        0.8,
      );
      addArc(
        B.x,
        GROUND - 105 - B.h,
        105,
        -2.4,
        0.45,
        B.face,
        0.16,
        B.sphase === 2 ? "rgba(130,70,180,.96)" : "rgba(255,105,35,.96)",
        11,
      );
      return;
    }
    if (
      B.type === "shogun" &&
      shogunMinion &&
      shogunMinion.hp > 0 &&
      shogunMinion.state !== "dead" &&
      Math.abs(shogunMinion.x - B.x) < 300
    ) {
      damageShogunMinion(dmg);
      return;
    }
    if (ranged && B.type === "demon" && B.dphase === 3 && Math.random() < 0.1) {
      B.parryT = 0.34;
      sfx("parry");
      doFlash(0.22, "255,70,45");
      addText(B.x, GROUND - 245, "PROJECTILE PARRIED", "#ff8d75", 18, 1);
      addArc(
        B.x,
        GROUND - 110,
        95,
        -2.4,
        0.5,
        B.face,
        0.18,
        "rgba(255,70,45,.95)",
        10,
      );
      return;
    }
    B.hp = Math.max(0, B.hp - dmg);
    impactMuteT = 0.12;
    B.flash = 0;
    B.ghostDelay = 0.6;
    hitstop = Math.max(hitstop, stop || 0.06);
    doShake(5);
    sfx("hit");
    const sx = B.x - B.face * 26,
      sy = GROUND - rnd(70, 110);
    spark(sx, sy, 14, "#ffe2a0", 420, 0.45);
    spark(sx, sy, 6, "#c68bff", 260, 0.5);
    addText(B.x + rnd(-20, 20), GROUND - 165, String(dmg), "#ffd98a", 22, 0.8);
    if (B.type === "volturus" && B.hp > 0 && !B.revived) {
      if (B.vphase === 1 && B.hp <= B.maxhp * (2 / 3)) beginVolturusPhase(2);
    } else if (B.type === "demon" && B.hp > 0) {
      if (B.dphase === 1 && B.hp <= B.maxhp * 0.7) beginDemonPhase(2);
      else if (B.dphase === 2 && B.hp <= B.maxhp * 0.3) beginDemonPhase(3);
    } else if (
      B.type === "warden" &&
      B.ephase === 1 &&
      B.hp <= B.maxhp * 0.6 &&
      B.hp > 0
    ) {
      beginWardenPhase2();
    } else if (
      B.type === "wraith" &&
      B.wphase === 1 &&
      B.hp <= B.maxhp * 0.5 &&
      B.hp > 0
    ) {
      beginWraithPhase2();
    } else if (
      B.type === "shogun" &&
      B.sphase === 1 &&
      B.hp <= B.maxhp * 0.5 &&
      B.hp > 0
    ) {
      beginShogunPhase2();
    } else if (
      B.type !== "shogun" &&
      B.type !== "volturus" &&
      B.type !== "wraith" &&
      B.type !== "warden" &&
      !B.rage &&
      B.hp <= B.maxhp * 0.5 &&
      B.hp > 0
    ) {
      B.rage = true;
      musicIntensify();
      const art = B.type === "art";
      doFlash(0.5, art ? "120,170,255" : "170,80,255");
      doShake(16);
      sfx("roar");
      addText(
        B.x,
        GROUND - 200 - (art ? 30 : 0),
        art ? "PHASE TWO  +40% DAMAGE" : "THE SENTINEL IS ENRAGED",
        art ? "#a9cdff" : "#d9a8ff",
        20,
        2,
      );
      addRing(
        B.x,
        GROUND - 70,
        20,
        300,
        0.7,
        art ? "rgba(140,190,255,.9)" : "rgba(190,120,255,.9)",
        8,
      );
    }
    if (B.hp <= 0) bossDie();
  }
  function bossDie() {
    if (B.type === "volturus" && !B.revived) {
      volturusHazards.length = 0;
      B.hp = 0;
      B.ghost = 0;
      B.state = "vrevive";
      B.phase = "";
      B.pt = 0;
      B.vCount = 0;
      B.h = 0;
      B.vAura = 1;
      musicIntensify();
      doShake(28);
      doFlash(0.8, "120,205,255");
      sfx("demonRoar");
      addText(B.x, GROUND - 250, "THE STORMLORD WILL NOT DIE", "#bff4ff", 23, 2.5);
      return;
    }
    awardCoins(200);
    orbs.length = 0;
    demonHazards.length = 0;
    shogunHazards.length = 0;
    volturusHazards.length = 0;
    wraithHazards.length = 0;
    wardenHazards.length = 0;
    spireHazards.length = 0;
    wraithKnightBolts.length = 0;
    thorBolts.length = 0;
    thorHammers.length = 0;
    shogunMinion = null;
    B.state = "dead";
    B.dieT = 0;
    B.phase = "";
    hitstop = 0.35;
    doShake(20);
    doFlash(0.7, "255,255,255");
    sfx("die");
    phase = "won";
    phaseT = 0;
  }
  function startDodge(dir) {
    P.state = "dodge";
    P.t = 0;
    P.dodgeDir = dir || P.face;
    P.face = P.dodgeDir;
    P.invuln = Math.max(P.invuln, 0.27);
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.55;
    buf.dodge = 0;
    sfx("dodge");
    dust(P.x, GROUND, 5);
  }
  function startAirDodge(dir) {
    P.state = "airdash";
    P.t = 0;
    P.airDodged = true;
    P.dodgeDir = dir || P.face;
    P.face = P.dodgeDir;
    P.invuln = Math.max(P.invuln, 0.24);
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.55;
    buf.dodge = 0;
    P.vy = 0;
    sfx("dodge");
    spark(P.x, P.y - 55, 10, "#ffe2a0", 300, 0.3, 0);
  }
  function startParry() {
    P.state = "parry";
    P.t = 0;
    P.parrySucc = false;
    P.endT = heroType === "ronin" ? 0.72 : 0.62;
    P.st = Math.max(0, P.st - 8);
    P.stDelay = 0.5;
    buf.parry = 0;
    P.vx *= 0.3;
    const dir = (isActionHeld("right") ? 1 : 0) - (isActionHeld("left") ? 1 : 0);
    if (dir) P.face = dir;
    tone(700, 0.1, "triangle", 0.06, 200);
  }
  function startPlunge() {
    P.state = "plunge";
    P.t = 0;
    P.vy = 1050;
    P.vx = 0;
    P.plungeHit = false;
    P.st = Math.max(0, P.st - 18);
    P.stDelay = 0.7;
    buf.attack = 0;
    sfx("plunge");
  }
  function startHeal() {
    P.state = "heal";
    P.t = 0;
    P.healed = false;
    buf.heal = 0;
  }
  function startSkill1(dir) {
    P.state = "skill1";
    P.t = 0;
    P.skill1Fired = false;
    P.skill1CD = SKILL1_CD;
    buf.skill1 = 0;
    if (dir) P.face = dir;
    P.vx *= 0.3;
  }
  function fireSlash() {
    sfx("skill1");
    const pb = GROUND - P.y;
    slashes.push({
      owner: activePlayerIndex,
      x: P.x + P.face * 30,
      y: P.y - 78,
      face: P.face,
      vx: P.face * 1500,
      life: 1.1,
      t: 0,
      hit: false,
      pb,
      rot: 0,
    });
    addArc(
      P.x,
      P.y - 82,
      92,
      P.face > 0 ? -2.3 : -0.85,
      P.face > 0 ? 0.85 : 2.3,
      P.face,
      0.16,
      "rgba(255,232,140,.95)",
      10,
    );
    spark(P.x + P.face * 26, P.y - 78, 16, "#fff3b0", 460, 0.4);
  }
  function startSkill2(dir) {
    P.state = "skill2";
    P.t = 0;
    P.skill2Fired = false;
    P.skill2Hit = false;
    P.skill2CD = SKILL2_CD;
    buf.skill2 = 0;
    if (dir) P.face = dir;
    P.vx = 0;
    sfx("charge");
  }
  function startWraithKnightRoll(dir) {
    const transformed = P.wraithBuffT > 0;
    const cost = transformed ? 18 : 22;
    if (P.st < cost) {
      buf.dodge = 0;
      return;
    }
    P.state = transformed ? "wraithTeleport" : "wraithRoll";
    P.t = 0;
    P.dodgeDir = dir || P.face;
    P.face = P.dodgeDir;
    P.invuln = Math.max(P.invuln, transformed ? 0.3 : 0.36);
    P.st = Math.max(0, P.st - cost);
    P.stDelay = 0.55;
    P.wraithTeleportDone = false;
    P.wraithTeleportStartX = P.x;
    if (!transformed && P.y < GROUND - 1) {
      P.airDodged = true;
      P.vy *= 0.25;
    }
    buf.dodge = 0;
    sfx("dodge");
    if (transformed) {
      addRing(P.x, P.y - 58, 5, 68, 0.32, "rgba(185,115,255,.92)", 6);
      spark(P.x, P.y - 58, 22, "#c79bff", 430, 0.42, 0);
    } else dust(P.x, GROUND, 8);
  }

  function startWraithKnightStorm() {
    P.state = "wraithStorm";
    P.t = 0;
    P.vx = 0;
    P.wraithSkillFired = false;
    P.skill1CD = WRAITH_KNIGHT_SKILL1_CD;
    buf.skill1 = 0;
    sfx("charge");
  }
  function releaseWraithKnightStorm() {
    const target = projectileTarget({ owner: activePlayerIndex, x: P.x, vx: P.face });
    for (let i = 0; i < 4; i++)
      wraithKnightBolts.push({
        owner: activePlayerIndex,
        x: clamp(target.x + (i - 1.5) * 28, 45, WORLD - 45),
        t: 0,
        delay: 0.35 + i * 0.18,
        life: 0.72 + i * 0.18,
        hit: false,
        dmg: 200,
      });
    doFlash(0.28, "105,45,180");
    sfx("charge");
  }
  function startWraithKnightTransform() {
    P.state = "wraithTransform";
    P.t = 0;
    P.vx = 0;
    P.wraithSkillFired = false;
    P.skill2CD = WRAITH_KNIGHT_SKILL2_CD;
    buf.skill2 = 0;
    sfx("charge");
  }
  function activateWraithKnightForm() {
    P.wraithBuffT = 30;
    if (gameMode === "coop")
      for (const ally of players) ally.wraithBuffT = Math.max(ally.wraithBuffT || 0, 30);
    doShake(18);
    doFlash(0.48, "115,55,190");
    addRing(P.x, P.y - 72, 14, 175, 0.62, "rgba(155,95,255,.92)", 11);
    spark(P.x, P.y - 72, 54, "#c79bff", 650, 0.85, -80);
    addText(P.x, P.y - 150, "WRAITH ASCENSION  +40% ATTACK  +20% ARMOUR", "#d9baff", 18, 1.5);
    sfx("demonRoar");
  }
  function updateWraithKnightBolts(dt) {
    for (let i = wraithKnightBolts.length - 1; i >= 0; i--) {
      const q = wraithKnightBolts[i];
      q.t += dt;
      if (!q.hit && q.t >= q.delay) {
        q.hit = true;
        const target = projectileTarget(q);
        if (target.state !== "dead" && Math.abs(target.x - q.x) < target.hw + 70)
          hitProjectileTarget(q, q.dmg, 0.1, true, true);
        doShake(8);
        spark(q.x, GROUND - 70, 30, "#b36cff", 620, 0.45, 0);
        addRing(q.x, GROUND - 5, 8, 78, 0.3, "rgba(180,105,255,.9)", 6);
        sfx("crack");
      }
      if (q.t > q.life) wraithKnightBolts.splice(i, 1);
    }
  }

  /* ============ THOR, THE STORMBRINGER (v6.6) ============ */
  // 500 HP · 400 stamina · 3-hit storm-blade combo (120 per hit, 20 stamina)
  // Parry binding: Storm Bolt — 190 damage, 40 stamina (ground or air)
  // Dodge: 20 stamina, works on the ground and in the air
  // Skill 1 (R): Thunder Sky Strike — leaps into the sky, flies to the boss and
  //   slams it with a lightning charge for 600 damage. 45-second cooldown.
  // Skill 2 (E): Storm Ascension — 2.35s lightning transformation, 40s duration,
  //   80-second cooldown. Transformed: he wields the glowing hammer, the parry
  //   binding throws it (220 damage, 40 stamina) and dodge becomes a lightning
  //   teleport that also works mid-air.
  const THOR_PAL = {
    out: "#05070c",
    dk: "#12161f",
    md: "#1c2331",
    lt: "#2c384c",
    hi: "#3d4f6b",
    cape: "#7e1622",
    capeDark: "#4d0d16",
    skin: "#c99b74",
    hair: "#4a3220",
    glow: "#7fd0ff",
    glowCore: "#eaf7ff",
  };
  function makeThorFallbackPortrait() {
    const cv = document.createElement("canvas");
    cv.width = 480;
    cv.height = 640;
    const g = cv.getContext("2d"),
      K = THOR_PAL;
    const sky = g.createLinearGradient(0, 0, 0, 640);
    sky.addColorStop(0, "#05070d");
    sky.addColorStop(0.55, "#0b1322");
    sky.addColorStop(1, "#141d2e");
    g.fillStyle = sky;
    g.fillRect(0, 0, 480, 640);
    g.strokeStyle = "rgba(140,205,255,.8)";
    g.shadowColor = K.glow;
    g.shadowBlur = 18;
    for (let b = 0; b < 4; b++) {
      let x = 60 + b * 110 + rnd(-20, 20);
      g.lineWidth = b % 2 ? 2 : 3.5;
      g.beginPath();
      g.moveTo(x, 0);
      for (let y = 12; y < 300; y += 34) {
        x += rnd(-22, 22);
        g.lineTo(x, y);
      }
      g.stroke();
    }
    g.shadowBlur = 0;
    g.save();
    g.translate(240, 360);
    g.fillStyle = K.capeDark;
    g.beginPath();
    g.moveTo(-16, -150);
    g.quadraticCurveTo(-120, -60, -95, 190);
    g.quadraticCurveTo(-30, 160, 0, 170);
    g.quadraticCurveTo(60, 150, 100, 185);
    g.quadraticCurveTo(122, -50, 20, -148);
    g.closePath();
    g.fill();
    const tg = g.createLinearGradient(-46, -110, 46, 90);
    tg.addColorStop(0, "#232c3e");
    tg.addColorStop(0.5, "#161d2a");
    tg.addColorStop(1, "#0d121c");
    poly(g, [[-46, -108], [46, -108], [40, 60], [-40, 60]], tg, K.out, 2);
    g.shadowColor = K.glow;
    g.shadowBlur = 16;
    g.fillStyle = K.glowCore;
    [[-18, -60], [18, -60], [0, -30], [-14, 4], [14, 4]].forEach(([x, y]) => {
      g.beginPath();
      g.arc(x, y, 7, 0, TAU);
      g.fill();
    });
    g.strokeStyle = "rgba(150,215,255,.85)";
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(-18, -60);
    g.lineTo(0, -30);
    g.lineTo(18, -60);
    g.moveTo(0, -30);
    g.lineTo(0, 4);
    g.stroke();
    g.shadowBlur = 0;
    g.fillStyle = K.skin;
    g.beginPath();
    g.ellipse(0, -138, 24, 30, 0, 0, TAU);
    g.fill();
    g.fillStyle = K.hair;
    g.beginPath();
    g.ellipse(0, -158, 26, 18, 0, Math.PI, TAU);
    g.fill();
    g.beginPath();
    g.ellipse(0, -116, 16, 16, 0, 0, Math.PI);
    g.fill();
    g.shadowColor = "#bfeaff";
    g.shadowBlur = 12;
    g.fillStyle = K.glowCore;
    g.fillRect(-13, -144, 9, 3.4);
    g.fillRect(5, -144, 9, 3.4);
    g.shadowBlur = 0;
    poly(g, [[-46, -112], [-84, -96], [-74, -58], [-42, -70]], "#1a2231", K.out, 2);
    poly(g, [[46, -112], [84, -96], [74, -58], [42, -70]], "#1a2231", K.out, 2);
    g.save();
    g.translate(88, 60);
    g.rotate(-0.5);
    g.fillStyle = "#241a12";
    g.fillRect(-6, -120, 12, 190);
    const hg = g.createLinearGradient(-26, -160, 26, -110);
    hg.addColorStop(0, "#f2fbff");
    hg.addColorStop(0.5, "#7ec8ff");
    hg.addColorStop(1, "#274a6d");
    g.shadowColor = K.glow;
    g.shadowBlur = 26;
    poly(g, [[-28, -158], [28, -150], [28, -108], [-28, -100]], hg, "#0a1018", 2);
    g.restore();
    g.restore();
    const vg = g.createRadialGradient(240, 300, 160, 240, 320, 430);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,.55)");
    g.fillStyle = vg;
    g.fillRect(0, 0, 480, 640);
    return cv.toDataURL("image/png");
  }
  function startThorBolt(dir) {
    P.state = "thorBolt";
    P.t = 0;
    P.shotFired = false;
    if (dir) P.face = dir;
    P.vx *= 0.45;
    P.st = Math.max(0, P.st - 40);
    P.stDelay = 0.55;
    buf.parry = 0;
  }
  function fireThorBolt() {
    sfx("zap");
    const pb = GROUND - P.y;
    thorBolts.push({
      owner: activePlayerIndex,
      x: P.x + P.face * 36,
      y: P.y - 78,
      vx: P.face * 1500,
      t: 0,
      life: 1.15,
      hit: false,
      pb,
      dmg: 190,
    });
    spark(P.x + P.face * 40, P.y - 78, 18, "#bfe6ff", 460, 0.34, 0);
    addRing(P.x + P.face * 40, P.y - 78, 3, 30, 0.18, "rgba(120,190,255,.92)", 3);
  }
  function startThorHammer(dir) {
    P.state = "thorHammer";
    P.t = 0;
    P.shotFired = false;
    if (dir) P.face = dir;
    P.vx *= 0.4;
    P.st = Math.max(0, P.st - 40);
    P.stDelay = 0.55;
    buf.parry = 0;
  }
  function fireThorHammer() {
    sfx("zap");
    const pb = GROUND - P.y;
    thorHammers.push({
      owner: activePlayerIndex,
      x: P.x + P.face * 36,
      y: P.y - 80,
      vx: P.face * 1150,
      vy: 0,
      rot: 0,
      t: 0,
      life: 1.5,
      hit: false,
      pb,
      dmg: 220,
    });
    spark(P.x + P.face * 42, P.y - 80, 22, "#bfe6ff", 520, 0.4, 0);
    addRing(P.x + P.face * 42, P.y - 80, 4, 38, 0.2, "rgba(130,200,255,.95)", 4);
  }
  function startThorTeleport(dir) {
    P.state = "thorTeleport";
    P.t = 0;
    P.dodgeDir = dir || P.face;
    P.face = P.dodgeDir;
    P.invuln = Math.max(P.invuln, 0.3);
    P.st = Math.max(0, P.st - 20);
    P.stDelay = 0.55;
    P.thorTeleportDone = false;
    P.thorTeleportStartX = P.x;
    if (P.y < GROUND - 1) P.airDodged = true;
    buf.dodge = 0;
    sfx("dodge");
    addRing(P.x, P.y - 58, 5, 68, 0.32, "rgba(120,190,255,.92)", 6);
    spark(P.x, P.y - 58, 22, "#9fd8ff", 430, 0.42, 0);
  }
  function startThorDodge(dir) {
    if (P.st < 20) {
      buf.dodge = 0;
      return;
    }
    if (P.thorBuffT > 0) {
      startThorTeleport(dir);
      return;
    }
    if (P.y >= GROUND - 0.5) startDodge(dir);
    else startAirDodge(dir);
  }
  function startThorDive() {
    P.state = "thorDive";
    P.t = 0;
    P.thorDivePhase = "charge";
    P.thorDiveHit = false;
    P.skill1CD = THOR_SKILL1_CD;
    buf.skill1 = 0;
    P.vx = 0;
    P.face = B.x >= P.x ? 1 : -1;
    sfx("charge");
  }
  function startThorTransform() {
    P.state = "thorTransform";
    P.t = 0;
    P.vx = 0;
    P.thorSkillFired = false;
    P.skill2CD = THOR_SKILL2_CD;
    buf.skill2 = 0;
    sfx("charge");
  }
  function activateThorForm() {
    P.thorBuffT = 40;
    doShake(18);
    doFlash(0.48, "80,170,255");
    addRing(P.x, P.y - 72, 14, 175, 0.62, "rgba(110,190,255,.92)", 11);
    addRing(P.x, GROUND - 8, 20, 245, 0.7, "rgba(95,175,255,.9)", 13);
    spark(P.x, P.y - 72, 54, "#9fd8ff", 650, 0.85, -80);
    for (let i = 0; i < 7; i++)
      thorBolts.push({
        owner: activePlayerIndex,
        x: clamp(P.x + (i - 3) * 34, 45, WORLD - 45),
        y: -20,
        t: 0,
        delay: 0.05 + i * 0.06,
        life: 0.62 + i * 0.06,
        hit: false,
        dmg: 0,
        noHit: true,
      });
    addText(P.x, P.y - 150, "STORM ASCENSION — HAMMER AWAKENED", "#bfe3ff", 18, 1.5);
    sfx("demonRoar");
  }
  function updateThorSystems(dt) {
    for (let i = thorBolts.length - 1; i >= 0; i--) {
      const a = thorBolts[i];
      a.t += dt;
      const oldX = a.x;
      if (a.vx) a.x += a.vx * dt;
      const target = projectileTarget(a);
      let dead = a.t > a.life || a.x < 0 || a.x > WORLD;
      if (
        !a.noHit &&
        !a.hit &&
        target.state !== "dead" &&
        target.state !== "intro" &&
        sweptXHits(oldX, a.x, target.x, target.hw + 26) &&
        a.pb + 130 > target.h &&
        a.pb - 24 < target.h + target.hh
      ) {
        a.hit = true;
        dead = true;
        hitProjectileTarget(a, a.dmg, 0.06, true, false);
        spark(a.x, a.y, 22, "#bfe6ff", 560, 0.4);
        addRing(a.x, a.y, 5, 60, 0.26, "rgba(120,190,255,.92)", 5);
        doShake(5);
      }
      if (dead) thorBolts.splice(i, 1);
    }
    for (let i = thorHammers.length - 1; i >= 0; i--) {
      const h = thorHammers[i];
      h.t += dt;
      h.rot += dt * 22;
      const oldX = h.x;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      if (Math.random() < 0.75)
        parts.push({
          k: "dot",
          x: h.x - Math.sign(h.vx) * 14,
          y: h.y + rnd(-9, 9),
          vx: 0,
          vy: 0,
          life: 0.26,
          t: 0,
          col: Math.random() < 0.4 ? "235,248,255" : "110,185,255",
          g: 0,
          drag: 2,
          sz: rnd(2, 5),
        });
      const target = projectileTarget(h);
      let dead = h.t > h.life || h.x < -60 || h.x > WORLD + 60;
      if (
        !h.hit &&
        target.state !== "dead" &&
        target.state !== "intro" &&
        sweptXHits(oldX, h.x, target.x, target.hw + 34) &&
        h.pb + 140 > target.h &&
        h.pb - 30 < target.h + target.hh
      ) {
        h.hit = true;
        dead = true;
        hitProjectileTarget(h, h.dmg, 0.12, true, false);
        spark(h.x, h.y, 30, "#bfe6ff", 660, 0.5);
        addRing(h.x, h.y, 8, 92, 0.32, "rgba(120,190,255,.95)", 7);
        doShake(9);
      }
      if (dead) thorHammers.splice(i, 1);
    }
  }
  function drawThorBoltShape(c, len) {
    c.save();
    c.shadowColor = "#6fc0ff";
    c.shadowBlur = 14;
    const g = c.createLinearGradient(-len, 0, len, 0);
    g.addColorStop(0, "rgba(120,190,255,0)");
    g.addColorStop(0.55, "rgba(150,215,255,.9)");
    g.addColorStop(1, "rgba(245,252,255,1)");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-len, -3);
    c.lineTo(len * 0.45, -5);
    c.lineTo(len, 0);
    c.lineTo(len * 0.45, 5);
    c.lineTo(-len, 3);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(220,242,255,.9)";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-len * 0.7, 0);
    for (let x = -len * 0.7; x < len * 0.7; x += 12)
      c.lineTo(x + 6, rnd(-4, 4));
    c.stroke();
    c.restore();
  }
  function drawThorSystems() {
    for (const a of thorBolts) {
      if (a.noHit) {
        // decorative vertical sky bolt used by Storm Ascension
        if (a.t < a.delay) continue;
        ctx.save();
        const fade = clamp((a.life - a.t) / 0.22, 0, 1);
        ctx.globalAlpha = clamp(fade, 0, 1);
        ctx.shadowColor = "#6fc0ff";
        ctx.shadowBlur = 22;
        for (let j = 0; j < 3; j++) {
          ctx.strokeStyle = j === 0 ? "#f3faff" : "rgba(90,165,255,.9)";
          ctx.lineWidth = j === 0 ? 5 : 2;
          ctx.beginPath();
          let x = a.x + (j - 1) * 5;
          ctx.moveTo(x, 0);
          for (let y = 0; y < GROUND; y += 35) {
            x = a.x + (j - 1) * 5 + Math.sin(y * 0.08 + a.t * 60 + j) * 15;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
        continue;
      }
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.scale(Math.sign(a.vx) || 1, 1);
      drawThorBoltShape(ctx, 26);
      ctx.restore();
    }
    for (const h of thorHammers) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot * Math.sign(h.vx));
      ctx.shadowColor = "#7fd0ff";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#241a12";
      ctx.fillRect(-30, -3.2, 62, 6.4);
      const g = ctx.createLinearGradient(-26, -16, 26, 16);
      g.addColorStop(0, "#f2fbff");
      g.addColorStop(0.45, "#7ec8ff");
      g.addColorStop(1, "#274a6d");
      poly(ctx, [[-28, -17], [34, -12], [36, 12], [-28, 17]], g, "#0a1018", 1.6);
      ctx.strokeStyle = "rgba(210,240,255,.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, -8);
      ctx.lineTo(24, -6);
      ctx.moveTo(-20, 6);
      ctx.lineTo(24, 7);
      ctx.stroke();
      ctx.restore();
    }
  }
  function drawThorTransformBeam() {
    if (heroType !== "thor" || P.state !== "thorTransform") return;
    const k = clamp(P.t / 2.35, 0, 1),
      pulse = 0.78 + 0.22 * Math.sin(time * 46),
      fade = k < 0.08 ? k / 0.08 : k > 0.9 ? (1 - k) / 0.1 : 1,
      width = 84 + 64 * Math.sin(Math.PI * k);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = clamp(fade, 0, 1);
    const g = ctx.createLinearGradient(P.x - width, 0, P.x + width, 0);
    g.addColorStop(0, "rgba(20,70,190,0)");
    g.addColorStop(0.2, "rgba(45,120,235,.55)");
    g.addColorStop(0.42, "rgba(120,195,255,.78)");
    g.addColorStop(0.5, `rgba(245,251,255,${pulse})`);
    g.addColorStop(0.58, "rgba(120,195,255,.78)");
    g.addColorStop(0.8, "rgba(45,120,235,.55)");
    g.addColorStop(1, "rgba(20,70,190,0)");
    ctx.fillStyle = g;
    ctx.fillRect(P.x - width, -40, width * 2, GROUND + 48);
    ctx.fillStyle = "rgba(240,250,255,.85)";
    ctx.shadowColor = "#6fc0ff";
    ctx.shadowBlur = 34;
    ctx.fillRect(P.x - 14 * pulse, -40, 28 * pulse, GROUND + 45);
    for (let i = 0; i < 7; i++) {
      let x = P.x + rnd(-width * 0.72, width * 0.72);
      ctx.strokeStyle = i % 2 ? "rgba(190,230,255,.95)" : "rgba(90,165,255,.95)";
      ctx.lineWidth = i % 2 ? 3 : 5;
      ctx.beginPath();
      ctx.moveTo(x, -20);
      for (let y = 18; y < GROUND; y += 34) {
        x += rnd(-25, 25);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(70,140,235,.48)";
    ctx.beginPath();
    ctx.ellipse(P.x, GROUND + 2, width * 1.5, 27, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(200,235,255,.92)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(P.x, GROUND, width * (0.72 + 0.2 * pulse), 16, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  function drawThorBlade(c, strength) {
    const glow = 0.35 + strength * 0.65;
    c.save();
    c.shadowColor = "#6fc0ff";
    c.shadowBlur = 14 * strength;
    c.fillStyle = "#151312";
    c.fillRect(-4, -3, 22, 6);
    const g = c.createLinearGradient(0, -6, 0, 6);
    g.addColorStop(0, "#eaf7ff");
    g.addColorStop(0.5, `rgba(130,200,255,${glow})`);
    g.addColorStop(1, "#1c3a5c");
    poly(c, [[18, -5], [66, -3.4], [76, 0], [66, 3.4], [18, 5]], g, "#0a1018", 1.4);
    if (strength > 0.45) {
      c.strokeStyle = `rgba(190,235,255,${0.5 + strength * 0.5})`;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(22, -3);
      for (let x = 30; x < 70; x += 9) c.lineTo(x, -3 + rnd(-3.2, 3.2));
      c.stroke();
    }
    c.restore();
  }
  function drawThorHammerWeapon(c, strength) {
    c.save();
    c.shadowColor = "#7fd0ff";
    c.shadowBlur = 16 * strength;
    c.fillStyle = "#241a12";
    c.fillRect(-16, -3.2, 62, 6.4);
    c.strokeStyle = "#0a0806";
    c.lineWidth = 1.2;
    c.strokeRect(-16, -3.2, 62, 6.4);
    const g = c.createLinearGradient(42, -17, 42, 17);
    g.addColorStop(0, "#f2fbff");
    g.addColorStop(0.45, `rgba(126,200,255,${0.75 + strength * 0.25})`);
    g.addColorStop(1, "#274a6d");
    poly(c, [[42, -17], [72, -12], [74, 12], [42, 17]], g, "#0a1018", 1.6);
    poly(c, [[74, -4], [94, 0], [74, 4]], "#cfe9ff", "#0a1018", 1.2);
    c.strokeStyle = `rgba(210,240,255,${0.55 + strength * 0.45})`;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(46, -8);
    c.lineTo(68, -6);
    c.moveTo(46, 6);
    c.lineTo(68, 7);
    c.stroke();
    c.restore();
  }
  function drawThor(c) {
    const K = THOR_PAL,
      form = P.thorBuffT > 0 || P.state === "thorTransform",
      run = clamp(Math.abs(P.vx) / 250, 0, 1),
      attacking = P.state === "attack",
      shooting = P.state === "thorBolt" || P.state === "thorHammer",
      casting = P.state === "thorDive" || P.state === "thorTransform",
      parrying = P.state === "parry",
      teleporting = P.state === "thorTeleport",
      Adata = attacking ? basicAttackData(P.combo) : null;
    let alpha = 1;
    if (teleporting) alpha = P.t < 0.1 ? 1 - P.t / 0.1 : Math.min(1, (P.t - 0.1) / 0.15);
    let armA = 0.55,
      trail = false,
      strength = form ? 1 : 0.3;
    if (attacking) {
      const t = P.t,
        A = Adata;
      if (t < A.w) armA = lerp(0.55, A.a0, ease(t / A.w));
      else if (t < A.w + A.a) {
        armA = lerp(A.a0, A.a1, ((t - A.w) / A.a) ** 2);
        trail = true;
      } else armA = lerp(A.a1, 0.55, ease(clamp((t - A.w - A.a) / A.r, 0, 1)));
      strength = 0.7 + (form ? 0.6 : 0);
    } else if (casting) armA = -1.5 + Math.sin(time * 9) * 0.06;
    else if (shooting) armA = -0.12;
    else if (parrying) armA = 0.9;
    const crouch = attacking
        ? Math.sin(clamp(P.t / (Adata.w + Adata.a), 0, 1) * Math.PI) * 6
        : Math.sin(time * 1.8) * 1.2,
      hipY = -48 + crouch,
      sy = hipY - 40;
    c.save();
    c.globalAlpha = alpha;
    c.translate(P.x, P.y);
    c.scale(P.face * 0.96, 0.96);
    c.translate(0, -45);
    if (form) {
      const pulse = 0.3 + Math.sin(time * 11) * 0.12,
        ag = c.createRadialGradient(0, -70, 5, 0, -70, 120);
      ag.addColorStop(0, `rgba(140,205,255,${pulse})`);
      ag.addColorStop(0.5, "rgba(70,140,235,.16)");
      ag.addColorStop(1, "rgba(20,60,140,0)");
      c.fillStyle = ag;
      c.fillRect(-132, -198, 264, 264);
      c.save();
      c.globalCompositeOperation = "lighter";
      c.strokeStyle = "rgba(170,225,255,.6)";
      c.shadowColor = "#6fc0ff";
      c.shadowBlur = 12;
      c.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        let ax = rnd(-36, 8),
          ay = -30 - i * 26;
        c.beginPath();
        c.moveTo(ax, ay);
        for (let s = 0; s < 3; s++) {
          ax += rnd(-14, 14);
          ay += rnd(-9, 9);
          c.lineTo(ax, ay);
        }
        c.stroke();
      }
      c.restore();
    }
    const gait = (off, base) => {
        const a = P.stride + off,
          q = {
            x: base * (1 - run) + Math.sin(a) * 22 * run,
            y: -Math.max(0, Math.cos(a)) * 16 * run,
          };
        return q;
      },
      leg = (hx, ft, far) => {
        const q = ik(hx, hipY, ft.x, ft.y, 25, 25, -1),
          col = far ? K.dk : K.md;
        limb(c, [{ x: hx, y: hipY }, { x: q.x, y: q.y }, { x: q.tx, y: q.ty }], far ? 11 : 13.5, K.out, col, K.lt);
        poly(c, [[q.tx - 9, q.ty - 9], [q.tx + 6, q.ty - 10], [q.tx + 17, q.ty - 1], [q.tx + 17, q.ty + 1], [q.tx - 9, q.ty + 1]], K.dk, K.out, 1.4);
      },
      sway = Math.sin(time * 2.1) * 2 - run * 7 - P.vx * P.face * 0.012;
    leg(-5, gait(Math.PI + 0.3, -10), true);
    poly(c, [[-8, sy - 6], [-26, sy + 6], [-30 + sway, hipY + 22], [-20 + sway * 1.3, hipY + 40], [-8 + sway * 1.2, hipY + 34], [-2, hipY + 10]], K.capeDark, K.out, 1.4);
    poly(c, [[-6, sy - 4], [-20, sy + 8], [-22 + sway, hipY + 26], [-10 + sway, hipY + 38], [-2 + sway * 0.6, hipY + 28], [0, hipY + 8]], K.cape, K.out, 1.3);
    const S = { x: 5, y: sy + 3 + Math.sin(time * 1.6) * 0.6 };
    const torso = c.createLinearGradient(-16, sy, 16, hipY);
    torso.addColorStop(0, K.lt);
    torso.addColorStop(0.55, K.md);
    torso.addColorStop(1, K.dk);
    c.beginPath();
    c.moveTo(-15, sy + 3);
    c.lineTo(16, sy + 1);
    c.quadraticCurveTo(18, hipY - 20, 12, hipY + 3);
    c.lineTo(-12, hipY + 3);
    c.quadraticCurveTo(-18, hipY - 20, -15, sy + 3);
    c.closePath();
    c.fillStyle = torso;
    c.fill();
    c.strokeStyle = K.out;
    c.lineWidth = 1.9;
    c.stroke();
    c.save();
    c.shadowColor = K.glow;
    c.shadowBlur = 9;
    c.strokeStyle = "rgba(140,205,255,.8)";
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-6, sy + 10);
    c.lineTo(2, sy + 20);
    c.lineTo(-4, hipY - 12);
    c.moveTo(6, sy + 8);
    c.lineTo(9, sy + 22);
    c.stroke();
    c.fillStyle = K.glowCore;
    [[-6, sy + 14], [7, sy + 13], [0, hipY - 14]].forEach(([x, y]) => {
      c.beginPath();
      c.arc(x, y, 2.2, 0, TAU);
      c.fill();
    });
    c.restore();
    poly(c, [[-12, hipY - 8], [14, hipY - 14], [16, hipY - 7], [-12, hipY + 1]], K.dk, K.out, 1.3);
    const hg = c.createLinearGradient(-8, sy - 28, 14, sy - 2);
    hg.addColorStop(0, K.hi);
    hg.addColorStop(0.5, K.md);
    hg.addColorStop(1, K.dk);
    poly(c, [[-8, sy - 5], [-10, sy - 17], [-5, sy - 25], [3, sy - 29], [11, sy - 25], [14, sy - 15], [12, sy - 6], [6, sy - 1]], hg, K.out, 1.8);
    c.fillStyle = K.skin;
    c.beginPath();
    c.ellipse(2, sy - 17, 6.5, 8, 0, 0, TAU);
    c.fill();
    c.fillStyle = K.hair;
    c.beginPath();
    c.ellipse(2, sy - 23, 7.5, 5, 0, Math.PI, TAU);
    c.fill();
    c.beginPath();
    c.ellipse(3, sy - 11, 5, 4.5, 0, 0, Math.PI);
    c.fill();
    c.save();
    c.shadowColor = "#bfeaff";
    c.shadowBlur = 8;
    c.fillStyle = K.glowCore;
    c.fillRect(4, sy - 20, 4, 1.6);
    c.restore();
    const H = shooting
        ? { x: S.x + 34, y: S.y - 2 }
        : { x: S.x + 30 * Math.cos(armA * 0.9), y: S.y + 30 * Math.sin(armA * 0.9) },
      Hf = { x: H.x - Math.cos(armA) * 11, y: H.y - Math.sin(armA) * 11 },
      S2 = { x: -5, y: sy + 4 },
      e2 = ik(S2.x, S2.y, Hf.x, Hf.y, 20, 20, 1);
    limb(c, [S2, { x: e2.x, y: e2.y }, { x: e2.tx, y: e2.ty }], 9, K.out, "#1a1826", K.md);
    if (trail) {
      c.save();
      c.strokeStyle = "rgba(150,215,255,.5)";
      c.shadowColor = "#6fc0ff";
      c.shadowBlur = 16;
      c.lineWidth = 12;
      c.lineCap = "round";
      c.beginPath();
      c.arc(S.x, S.y, 86, armA - 0.8, armA + 0.25);
      c.stroke();
      c.restore();
    }
    c.save();
    c.translate(H.x, H.y);
    c.rotate(shooting ? -0.2 : armA);
    if (form) drawThorHammerWeapon(c, strength);
    else drawThorBlade(c, strength);
    c.restore();
    if (shooting || parrying) {
      const glow = c.createRadialGradient(H.x, H.y, 2, H.x, H.y, 30);
      glow.addColorStop(0, "rgba(245,252,255,.95)");
      glow.addColorStop(0.3, "rgba(110,190,255,.7)");
      glow.addColorStop(1, "rgba(30,90,190,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(H.x, H.y, 30, 0, TAU);
      c.fill();
    }
    const pg = c.createRadialGradient(-2, sy - 2, 1, 4, sy + 4, 16);
    pg.addColorStop(0, K.hi);
    pg.addColorStop(0.6, K.md);
    pg.addColorStop(1, K.dk);
    poly(c, [[-5, sy], [-16, sy - 32], [4, sy - 5]], K.lt, K.out, 1.4);
    poly(c, [[8, sy + 1], [27, sy - 3], [24, sy + 3], [11, sy + 9]], K.md, K.out, 1.3);
    poly(c, [[-10, sy + 3], [-24, sy - 4], [-8, sy + 9]], K.md, K.out, 1.3);
    c.fillStyle = pg;
    c.beginPath();
    c.ellipse(2, sy + 3, 14, 9, -0.15, 0, TAU);
    c.fill();
    c.strokeStyle = K.out;
    c.lineWidth = 1.7;
    c.stroke();
    const e = ik(S.x, S.y, H.x, H.y, 20, 20, 1);
    limb(c, [S, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }], 10.5, K.out, K.md, K.lt);
    leg(6, gait(0, 10), false);
    c.restore();
  }
  function releaseSkill2() {
    sfx("skill2");
    doShake(22);
    doFlash(0.6, "255,170,90");
    const ox = P.x + P.face * 34,
      oy = P.y - 46,
      R = 200;
    addRing(ox, oy, 16, R, 0.5, "rgba(255,200,120,.95)", 11);
    addRing(ox, oy, 8, R * 0.7, 0.4, "rgba(255,90,40,.85)", 15);
    spark(ox, oy, 46, "#ffcf7a", 700, 0.7, 260);
    spark(ox, oy, 22, "#ff5a30", 520, 0.55, 300);
    dust(ox, GROUND, 20);
    petals(ox, GROUND, 30, 500);
    const reach = B.hw + 150,
      bb = B.h;
    const pb = GROUND - P.y;
    if (
      B.state !== "dead" &&
      B.state !== "intro" &&
      Math.abs(B.x - ox) < reach &&
      pb + 140 > bb &&
      pb - 30 < bb + B.hh
    ) {
      P.skill2Hit = true;
      hitBoss(800, 0.16, false, true);
      if (B.state !== "dead") {
        B.state = "stunned";
        B.stunT = 2.2;
        B.phase = "";
        B.combo = null;
        B.hitDone = true;
      }
      addText(
        B.x,
        GROUND - (B.type === "art" ? 195 : 175),
        "STAGGERED",
        "#ffcf7a",
        24,
        1.1,
      );
    }
  }
  function hurtPlayer(dmg, srcX, heavy) {
    if (P.state === "dead" || P.invuln > 0) return false;
    impactMuteT = 0.12;
    if (
      heroType === "ronin" &&
      P.state === "parry" &&
      !P.parrySucc &&
      P.t < RONIN_DEFLECT_WIN
    ) {
      roninDeflectSuccess(P.x + P.face * 24, P.y - 68);
      return true;
    }
    if (heroType === "wizard" && skeletons.length) {
      let guard = null,
        best = Infinity;
      for (const s of skeletons) {
        if (
          s.hp <= 0 ||
          s.state === "spawn" ||
          (gameMode !== "solo" && (s.owner || 0) !== activePlayerIndex)
        )
          continue;
        const d = Math.abs(s.x - srcX);
        if (d < best && d < 145) {
          guard = s;
          best = d;
        }
      }
      if (guard) {
        damageSkeleton(guard, dmg);
        return true;
      }
    }
    dmg = Math.max(
      0,
      Math.round(dmg * (P.defenseMult == null ? 1 : P.defenseMult) * (heroType === "killnux" && P.killArmorT > 0 ? 0.8 : 1) * (P.wraithBuffT > 0 ? 0.8 : 1)),
    );
    if (P.state === "block") {
      dmg = Math.round(dmg * 0.75);
      P.hp = Math.max(0, P.hp - dmg);
      P.ghostDelay = 0.6;
      P.invuln = heavy ? 0.6 : 0.35;
      P.blockFlash = 0.2;
      P.vx = (P.x < srcX ? -1 : 1) * (heavy ? 420 : 200);
      sfx("block");
      addText(P.x, P.y - 118, String(dmg), "#9fd0ff", 22, 0.8);
      if (P.hp <= 0) {
        P.state = "dead";
        P.deadT = 0;
        P.reviveT = 0;
        sfx("die");
        if (!(gameMode === "coop" && players.some((p) => p !== P && p.hp > 0))) {
          phase = "lost";
          phaseT = 0;
        }
      }
      return true;
    }
    P.hp = Math.max(0, P.hp - dmg);
    P.flash = 0;
    P.ghostDelay = 0.6;
    P.invuln = heavy ? 0.8 : 0.5;
    if (P.state === "rskill1") B.execMark = null;
    P.state = "hurt";
    P.t = 0;
    P.vx = (P.x < srcX ? -1 : 1) * (heavy ? 520 : 280);
    if (heavy) P.vy = -330;
    sfx("hurt");
    addText(P.x, P.y - 118, String(dmg), "#ff6a5a", 24, 0.9);
    if (P.hp <= 0) {
      P.state = "dead";
      P.deadT = 0;
      P.reviveT = 0;
      sfx("die");
      if (!(gameMode === "coop" && players.some((p) => p !== P && p.hp > 0))) {
        phase = "lost";
        phaseT = 0;
      }
    }
    return true;
  }
  function tryBasicMeleeParry(srcX, hx, hy) {
    if (
      P.state !== "parry" ||
      P.parrySucc ||
      P.t >= (heroType === "ronin" ? RONIN_DEFLECT_WIN : PARRY_WIN) ||
      (heroType !== "ronin" && P.face !== (srcX >= P.x ? 1 : -1))
    )
      return false;
    if (heroType === "ronin")
      roninDeflectSuccess(hx == null ? P.x + P.face * 24 : hx, hy == null ? P.y - 68 : hy);
    else parrySuccess(hx == null ? P.x + P.face * 24 : hx, hy == null ? P.y - 68 : hy);
    return true;
  }
  function updateCoopRevive(dt) {
    if (gameMode !== "coop" || phase !== "fight" || players.length < 2) return;
    for (let downIndex = 0; downIndex < 2; downIndex++) {
      const down = players[downIndex],
        rescuerIndex = downIndex === 0 ? 1 : 0,
        rescuer = players[rescuerIndex];
      if (!down || down.state !== "dead") continue;
      down.reviveT = down.reviveT || 0;
      const close =
          rescuer &&
          rescuer.state !== "dead" &&
          Math.abs(rescuer.x - down.x) <= REVIVE_RANGE &&
          Math.abs(rescuer.y - down.y) < 80,
        holding =
          rescuerIndex === 0
            ? !!held.block || !!padHeld[0].block
            : !!held2.block || !!padHeld[1].block;
      if (close && holding) {
        down.reviveT = Math.min(REVIVE_TIME, down.reviveT + dt);
        rescuer.vx *= 0.72;
        if (Math.random() < dt * 14)
          parts.push({
            k: "gather",
            sx: down.x + rnd(-58, 58),
            sy: GROUND - rnd(10, 95),
            tx: down.x,
            ty: GROUND - 66,
            life: 0.45,
            t: 0,
            gc: "132,96,255",
          });
        if (down.reviveT >= REVIVE_TIME) {
          down.hp = Math.max(1, Math.round(down.maxhp * 0.45));
          down.ghost = down.hp;
          down.ghostDelay = 0;
          down.state = "free";
          down.t = 0;
          down.deadT = 0;
          down.reviveT = 0;
          down.invuln = 2;
          down.vx = (down.x < rescuer.x ? -1 : 1) * 120;
          down.vy = -170;
          down.y = Math.min(down.y, GROUND - 4);
          sfx("heal");
          doFlash(0.28, "145,105,255");
          addRing(down.x, GROUND - 58, 10, 105, 0.5, "rgba(151,112,255,.95)", 7);
          spark(down.x, GROUND - 65, 34, "#b89cff", 480, 0.65, -80);
          addText(down.x, GROUND - 142, "REVIVED", "#d9c8ff", 24, 1.25);
        }
      } else {
        down.reviveT = Math.max(0, down.reviveT - dt * 0.35);
      }
    }
  }
  function roninDeflectSuccess(hx, hy) {
    P.parrySucc = true;
    P.endT = P.t + 0.24;
    P.st = Math.min(P.maxst, P.st + 18);
    P.parryFlash = 0.3;
    P.invuln = Math.max(P.invuln, 0.18);
    P.deflects = (P.deflects || 0) + 1;
    hitstop = 0.14;
    doShake(8);
    doFlash(0.25, "255,65,85");
    sfx("parry");
    spark(hx, hy, 30, "#ffb2bc", 620, 0.55);
    spark(hx, hy, 18, "#ff244c", 460, 0.5);
    addRing(hx, hy, 5, 82, 0.3, "rgba(255,55,85,.95)", 5);
    if (P.deflects >= 15) {
      P.deflects = 0;
      hitBoss(600, 0.2);
      if (B.state !== "dead") {
        B.state = "stunned";
        B.stunT = 2.5;
        B.phase = "";
        B.combo = null;
        B.hitDone = true;
      }
      addText(
        B.x,
        GROUND - (B.type === "art" ? 205 : B.type === "demon" ? 245 : 180),
        "15 DEFLECTS — 600",
        "#ff697f",
        24,
        1.25,
      );
      doShake(18);
    } else
      addText(
        P.x,
        P.y - 132,
        "DEFLECT " + P.deflects + " / 15",
        "#ff91a2",
        21,
        0.9,
      );
  }
  function parrySuccess(hx, hy) {
    P.parrySucc = true;
    P.endT = P.t + 0.22;
    P.st = Math.min(P.maxst, P.st + 30);
    P.parryFlash = 0.25;
    B.state = "stunned";
    B.stunT = 2.0;
    B.phase = "";
    B.combo = null;
    B.hitDone = true;
    hitstop = 0.17;
    doShake(11);
    doFlash(0.4, "255,235,190");
    sfx("parry");
    spark(hx, hy, 30, "#fff2c8", 620, 0.6);
    spark(hx, hy, 14, "#ffb84a", 420, 0.5);
    addRing(hx, hy, 6, 90, 0.35, "rgba(255,240,190,.95)", 5);
    addText(P.x, P.y - 130, "PARRIED", "#ffe9a8", 26, 1.1);
  }
  function updatePlayer(dt) {
    const live = inputOn();
    const dir = live ? (isActionHeld("right") ? 1 : 0) - (isActionHeld("left") ? 1 : 0) : 0;
    if (!live) {
      buf.attack = buf.parry = buf.dodge = buf.jump = buf.heal = 0;
    }
    if (P.state === "dead") {
      P.deadT += dt;
      P.vx *= 0.9;
      physics(dt);
      return;
    }
    P.t += dt;
    P.invuln = Math.max(0, P.invuln - dt);
    P.flash = Math.max(0, P.flash - dt);
    P.parryFlash = Math.max(0, P.parryFlash - dt);
    P.blockFlash = Math.max(0, P.blockFlash - dt);
    P.landT = Math.max(0, P.landT - dt);
    const grounded = P.y >= GROUND - 0.5;
    P.stride += (grounded ? Math.abs(P.vx) : 0) * dt * 0.05;
    if (P.stDelay > 0) P.stDelay -= dt;
    else if (
      P.state !== "dodge" &&
      P.state !== "attack" &&
      P.state !== "airdash" &&
      P.state !== "wraithRoll" &&
      P.state !== "wraithTeleport" &&
      P.state !== "thorTeleport"
    )
      P.st = Math.min(
        P.maxst,
        P.st +
          (P.state === "free" ? 40 : P.state === "block" ? 32 : 22) *
            (P.staminaRegenMult || 1) *
            dt,
      );
    const cdStep = dt * (P.skillRate || 1);
    P.skill1CD = Math.max(0, P.skill1CD - cdStep);
    P.skill2CD = Math.max(0, P.skill2CD - cdStep);
    P.flameT = Math.max(0, (P.flameT || 0) - dt);
    P.killArmorT = Math.max(0, (P.killArmorT || 0) - dt);
    P.wraithBuffT = Math.max(0, (P.wraithBuffT || 0) - dt);
    P.thorBuffT = Math.max(0, (P.thorBuffT || 0) - dt);
    if (
      heroType === "wraithknight" &&
      P.wraithBuffT > 0 &&
      P.y >= GROUND - 1 &&
      Math.abs(P.vx) > 45 &&
      P.state === "free" &&
      Math.random() < 0.58
    ) {
      parts.push({ k: "dot", x: P.x - P.face * rnd(8, 30), y: P.y - rnd(12, 118), vx: -P.face * rnd(35, 110), vy: rnd(-55, 15), life: rnd(0.28, 0.55), t: 0, col: Math.random() < 0.3 ? "235,210,255" : "180,105,255", g: -18, drag: 2.4, sz: rnd(2, 5) });
    }
    if (
      heroType === "thor" &&
      P.thorBuffT > 0 &&
      P.y >= GROUND - 1 &&
      Math.abs(P.vx) > 45 &&
      P.state === "free" &&
      Math.random() < 0.55
    ) {
      parts.push({ k: "dot", x: P.x - P.face * rnd(8, 30), y: P.y - rnd(12, 118), vx: -P.face * rnd(35, 110), vy: rnd(-55, 15), life: rnd(0.28, 0.55), t: 0, col: Math.random() < 0.35 ? "235,248,255" : "110,185,255", g: -18, drag: 2.4, sz: rnd(2, 5) });
    }
    if (
      heroType === "wraithknight" &&
      buf.jump > 0 &&
      !grounded &&
      (P.jumpCount || 0) < 2 &&
      (P.state === "free" || P.state === "block")
    ) {
      P.vy = -JUMPV * 0.92;
      P.jumpCount = 2;
      buf.jump = 0;
      spark(P.x, P.y - 40, 22, "#c79bff", 420, 0.45, 0);
      addRing(P.x, P.y - 25, 5, 58, 0.3, "rgba(170,95,255,.9)", 5);
      sfx("jump");
    }

    switch (P.state) {
      case "free": {
        const target = dir * 250;
        P.vx += (target - P.vx) * Math.min(1, dt * (grounded ? 16 : 7));
        if (dir) P.face = dir;
        if (buf.jump > 0 && grounded) {
          P.vy = -JUMPV;
          P.jumpCount = 1;
          buf.jump = 0;
          sfx("jump");
          dust(P.x, GROUND, 4);
        }
        if (buf.dodge > 0 && P.st > 0 && heroType !== "thor" && (heroType === "wraithknight" ? (P.wraithBuffT > 0 || grounded || !P.airDodged) : (grounded || !P.airDodged))) {
          if (heroType === "wraithknight") startWraithKnightRoll(dir);
          else if (heroType === "killnux" && grounded) startKillDodge(dir);
          else if (heroType === "ronin" || heroType === "wizard") startRoninDodge(dir);
          else if (grounded) startDodge(dir);
          else startAirDodge(dir);
        } else if (heroType === "thor") {
          if (buf.dodge > 0 && P.st > 0 && (P.thorBuffT > 0 || grounded || !P.airDodged)) startThorDodge(dir);
          else if (buf.parry > 0 && P.st >= 40) {
            if (P.thorBuffT > 0) startThorHammer(dir);
            else startThorBolt(dir);
          }
          else if (buf.attack > 0 && P.st > 0) startAttack(0);
          else if (buf.heal > 0 && grounded && P.flasks > 0 && P.hp < P.maxhp) startHeal();
          else if (buf.skill1 > 0 && grounded && P.skill1CD <= 0) startThorDive();
          else if (buf.skill2 > 0 && grounded && P.skill2CD <= 0) startThorTransform();
          else if (isActionHeld("block") && grounded) { P.state = "block"; P.t = 0; }
        } else if (heroType === "wraithknight") {
          if (buf.parry > 0 && grounded) startParry();
          else if (buf.attack > 0 && P.st > 0) startAttack(0);
          else if (buf.heal > 0 && grounded && P.flasks > 0 && P.hp < P.maxhp) startHeal();
          else if (buf.skill1 > 0 && grounded && P.skill1CD <= 0) startWraithKnightStorm();
          else if (buf.skill2 > 0 && grounded && P.skill2CD <= 0) startWraithKnightTransform();
          else if (isActionHeld("block") && grounded) { P.state = "block"; P.t = 0; }
        } else if (heroType === "killnux") {
          if (buf.attack > 0 && grounded && P.st >= 30) startKillAttack(0);
          else if (buf.heal > 0 && grounded && P.flasks > 0 && P.hp < P.maxhp) startHeal();
          else if (buf.skill1 > 0 && grounded && P.skill1CD <= 0) startKillSkill1(dir);
          else if (buf.skill2 > 0 && grounded && P.skill2CD <= 0) startKillSkill2();
          else if (isActionHeld("block") && grounded) { P.state = "block"; P.t = 0; }
        } else if (heroType === "shadow") {
          if (buf.parry > 0 && grounded && P.st > 0) startTeleport(dir);
          else if (buf.attack > 0 && P.st > 0) startShot(dir);
          else if (buf.heal > 0 && grounded && P.flasks > 0 && P.hp < P.maxhp)
            startHeal();
          else if (buf.skill1 > 0 && grounded && P.skill1CD <= 0)
            startRangerSkill1();
          else if (buf.skill2 > 0 && grounded && P.skill2CD <= 0)
            startRangerSkill2();
          else if (isActionHeld("block") && grounded) {
            P.state = "block";
            P.t = 0;
          }
        } else if (heroType === "ronin") {
          if (buf.parry > 0 && grounded) startParry();
          else if (buf.attack > 0 && P.st > 0) startAttack(0);
          else if (buf.heal > 0 && grounded && P.flasks > 0 && P.hp < P.maxhp)
            startHeal();
          else if (buf.skill1 > 0 && grounded && P.skill1CD <= 0)
            startRoninSkill1();
          else if (buf.skill2 > 0 && grounded && P.skill2CD <= 0)
            startRoninSkill2();
          else if (isActionHeld("block") && grounded) {
            P.state = "block";
            P.t = 0;
          }
        } else if (heroType === "regal") {
          if (buf.parry > 0 && P.st >= 20) startRegalGun(dir);
          else if (buf.attack > 0 && P.st >= 20) startRegalSword(dir);
          else if (buf.heal > 0 && grounded && P.flasks > 0 && P.hp < P.maxhp)
            startHeal();
          else if (buf.skill1 > 0 && grounded && P.skill1CD <= 0)
            startRegalSkill1();
          else if (buf.skill2 > 0 && grounded && P.skill2CD <= 0)
            startRegalSkill2();
          else if (isActionHeld("block") && grounded) {
            P.state = "block";
            P.t = 0;
          }
        } else if (heroType === "wizard") {
          if (buf.parry > 0 && grounded && P.st >= 10) startWizardSword(dir);
          else if (buf.attack > 0 && P.st >= 20) startWizardMissile(dir);
          else if (buf.heal > 0 && grounded && P.flasks > 0 && P.hp < P.maxhp)
            startHeal();
          else if (buf.skill1 > 0 && grounded && P.skill1CD <= 0)
            startWizardSummon();
          else if (buf.skill2 > 0 && grounded && P.skill2CD <= 0)
            startWizardBeam();
          else if (isActionHeld("block") && grounded) {
            P.state = "block";
            P.t = 0;
          }
        } else {
          if (buf.parry > 0 && grounded && P.st > 0) startParry();
          else if (buf.attack > 0 && P.st > 0) {
            if (!grounded && isActionHeld("down")) startPlunge();
            else startAttack(0);
          } else if (buf.heal > 0 && grounded && P.flasks > 0 && P.hp < P.maxhp)
            startHeal();
          else if (buf.skill1 > 0 && grounded && P.skill1CD <= 0)
            startSkill1(dir);
          else if (buf.skill2 > 0 && grounded && P.skill2CD <= 0)
            startSkill2(dir);
          else if (isActionHeld("block") && grounded) {
            P.state = "block";
            P.t = 0;
          }
        }
        break;
      }
      case "attack": {
        const A = basicAttackData(P.combo),
          tot = A.w + A.a + A.r;
        if (P.t < A.w + A.a)
          P.vx = P.airAtk ? P.vx * 0.98 : (P.face * A.lunge) / (A.w + A.a);
        else P.vx *= 0.8;
        if (
          !P.airAtk &&
          B.state !== "dead" &&
          (B.x - P.x) * P.face > 0 &&
          Math.abs(B.x - P.x) < 62
        )
          P.vx = 0;
        if (!P.fxDone && P.t >= A.w) {
          P.fxDone = true;
          sfx("swing");
          const roninFx = heroType === "ronin";
          if (A.thrust)
            addStreak(
              P.x + P.face * 24,
              P.y - 64,
              P.face * (A.reach - 20),
              roninFx ? "rgba(255,35,70,.98)" : "rgba(255,232,170,.95)",
            );
          else {
            addArc(
              P.x,
              P.y - 82,
              84,
              A.a0,
              A.a1,
              P.face,
              0.13,
              roninFx ? "rgba(255,35,70,.96)" : "rgba(255,214,140,.9)",
              9,
            );
            if (roninFx)
              addArc(
                P.x,
                P.y - 70,
                72,
                -A.a1,
                -A.a0,
                P.face,
                0.13,
                "rgba(255,115,135,.85)",
                7,
              );
          }
        }
        if (P.t >= A.w && P.t < A.w + A.a) heroHit(A);
        if (
          P.t >= A.w + A.a + A.r * 0.6 &&
          buf.attack > 0 &&
          P.st > 0 &&
          P.combo < 2
        ) {
          startAttack(P.combo + 1);
          break;
        }
        if (
          P.t >= A.w + A.a &&
          buf.dodge > 0 &&
          P.st > 0 &&
          (heroType === "wraithknight"
            ? (P.wraithBuffT > 0 || grounded || !P.airDodged)
            : heroType === "thor"
              ? (P.thorBuffT > 0 || grounded || !P.airDodged)
              : (grounded || !P.airDodged))
        ) {
          if (heroType === "wraithknight") startWraithKnightRoll(dir);
          else if (heroType === "thor") startThorDodge(dir);
          else if (heroType === "ronin") startRoninDodge(dir);
          else if (grounded) startDodge(dir);
          else startAirDodge(dir);
          break;
        }
        if (P.t >= A.w + A.a && buf.parry > 0 && grounded && P.st > 0) {
          startParry();
          break;
        }
        if (P.t >= tot) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "wraithRoll": {
        const k = clamp(P.t / 0.42, 0, 1);
        P.vx = P.dodgeDir * 1300 * (1 - k) * (1 - k);
        if (Math.random() < 0.7)
          parts.push({ k: "dot", x: P.x, y: P.y - rnd(20, 100), vx: -P.dodgeDir * 50, vy: 0, life: 0.25, t: 0, col: "150,85,220", g: 0, drag: 2, sz: rnd(2, 5) });
        if (P.t >= 0.42) { P.state = "free"; P.t = 0; P.vx *= 0.2; }
        break;
      }
      case "wraithTeleport": {
        P.vx = 0;
        if (!P.wraithTeleportDone && P.t >= 0.1) {
          P.wraithTeleportDone = true;
          P.x = clamp(P.wraithTeleportStartX + P.dodgeDir * 250, 40, WORLD - 40);
          addRing(P.x, P.y - 58, 5, 68, 0.32, "rgba(185,115,255,.92)", 6);
          spark(P.x, P.y - 58, 24, "#c79bff", 460, 0.44, 0);
          sfx("dodge");
        }
        if (P.t >= 0.3) { P.state = "free"; P.t = 0; }
        break;
      }
      case "wraithStorm":
        P.vx *= 0.72;
        if (!P.wraithSkillFired && P.t >= 0.48) {
          P.wraithSkillFired = true;
          releaseWraithKnightStorm();
        }
        if (P.t >= 1.35) { P.state = "free"; P.t = 0; }
        break;
      case "thorBolt": {
        P.vx *= 0.86;
        if (!P.shotFired && P.t >= 0.09) {
          P.shotFired = true;
          fireThorBolt();
        }
        if (P.t >= 0.3) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "thorHammer": {
        P.vx *= 0.8;
        if (!P.shotFired && P.t >= 0.12) {
          P.shotFired = true;
          fireThorHammer();
        }
        if (P.t >= 0.36) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "thorTeleport": {
        P.vx = 0;
        if (!P.thorTeleportDone && P.t >= 0.1) {
          P.thorTeleportDone = true;
          P.x = clamp(P.thorTeleportStartX + P.dodgeDir * 260, 40, WORLD - 40);
          addRing(P.x, P.y - 58, 5, 68, 0.32, "rgba(120,190,255,.92)", 6);
          spark(P.x, P.y - 58, 24, "#9fd8ff", 460, 0.44, 0);
          sfx("dodge");
        }
        if (P.t >= 0.3) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "thorTransform":
        P.vx = 0;
        P.invuln = Math.max(P.invuln, 0.08);
        if (Math.random() < 0.95)
          parts.push({ k: "gather", sx: P.x + rnd(-160, 160), sy: P.y - rnd(15, 230), tx: P.x, ty: P.y - 75, life: 0.5, t: 0, gc: Math.random() < 0.3 ? "225,242,255" : "90,170,255" });
        if (!P.thorSkillFired && P.t >= 1.18) {
          P.thorSkillFired = true;
          activateThorForm();
          spark(P.x, P.y - 78, 86, "#bfe6ff", 820, 1.0, -120);
        }
        if (P.t >= 2.35) {
          P.state = "free";
          P.t = 0;
        }
        break;
      case "thorDive": {
        if (P.thorDivePhase === "charge") {
          P.vx = 0;
          P.face = B.x >= P.x ? 1 : -1;
          if (Math.random() < 0.85)
            parts.push({ k: "gather", sx: P.x + rnd(-80, 80), sy: P.y - rnd(10, 120), tx: P.x, ty: P.y - 72, life: 0.3, t: 0, gc: "110,190,255" });
          if (P.t >= 0.42) {
            P.thorDivePhase = "rise";
            P.t = 0;
            P.vy = -880;
            P.thorDiveTargetX = clamp(B.x - P.face * 26, 45, WORLD - 45);
            dust(P.x, GROUND, 8);
            sfx("jump");
          }
        } else if (P.thorDivePhase === "rise") {
          P.vx = 0;
          P.vy = -880;
          if (Math.random() < 0.6) spark(P.x, P.y - 40, 3, "#9fd8ff", 200, 0.3, 0);
          if (P.y < GROUND - 250 || P.t >= 0.55) {
            P.thorDivePhase = "fly";
            P.t = 0;
            P.vy = 0;
            P.y = Math.min(P.y, GROUND - 240);
            sfx("zap");
            doFlash(0.14, "90,180,255");
          }
        } else if (P.thorDivePhase === "fly") {
          P.vy = 0;
          const dx = P.thorDiveTargetX - P.x;
          P.vx = clamp(dx * 6, -1350, 1350);
          if (Math.random() < 0.85)
            parts.push({ k: "dot", x: P.x - P.face * rnd(6, 30), y: P.y - rnd(20, 95), vx: -P.face * rnd(60, 160), vy: rnd(-30, 30), life: rnd(0.25, 0.5), t: 0, col: Math.random() < 0.4 ? "235,248,255" : "110,185,255", g: 0, drag: 2.2, sz: rnd(2, 5) });
          if (Math.abs(dx) < 46 || P.t >= 1.6) {
            P.thorDivePhase = "slam";
            P.t = 0;
            P.vx = 0;
            P.vy = 620;
            if (!P.thorDiveHit && B.state !== "dead" && B.state !== "intro" && Math.abs(B.x - P.x) < B.hw + 150) {
              P.thorDiveHit = true;
              hitBoss(600, 0.22, false, true);
              spark(B.x, GROUND - 90, 60, "#cfeaff", 850, 0.9, 0);
              addRing(B.x, GROUND - 90, 16, 190, 0.6, "rgba(130,200,255,.95)", 12);
              addRing(B.x, GROUND - 5, 14, 170, 0.55, "rgba(90,170,255,.9)", 10);
              doShake(20);
              doFlash(0.4, "120,200,255");
              sfx("explode");
            }
          }
        } else {
          if (P.y >= GROUND - 0.5) {
            P.state = "free";
            P.t = 0;
            dust(P.x, GROUND, 14);
            addRing(P.x, GROUND - 6, 10, 120, 0.4, "rgba(120,190,255,.85)", 8);
            sfx("land");
          }
        }
        break;
      }
      case "wraithTransform":
        P.vx = 0;
        P.invuln = Math.max(P.invuln, 0.08);
        if (Math.random() < 0.95)
          parts.push({ k: "gather", sx: P.x + rnd(-150, 150), sy: P.y - rnd(15, 220), tx: P.x, ty: P.y - 75, life: 0.52, t: 0, gc: Math.random() < .25 ? "225,190,255" : "145,75,220" });
        if (!P.wraithSkillFired && P.t >= 1.18) {
          P.wraithSkillFired = true;
          activateWraithKnightForm();
          addRing(P.x, GROUND - 8, 20, 245, 0.7, "rgba(190,115,255,.95)", 13);
          spark(P.x, P.y - 78, 86, "#d6a7ff", 820, 1.0, -120);
        }
        if (P.t >= 2.35) { P.state = "free"; P.t = 0; }
        break;
      case "killSkill1": {
        P.vx *= .75;
        if (!P.killSkillFired && P.t >= .52) { P.killSkillFired = true; releaseKillWave(); }
        if (P.t >= 1.16) { P.state = "free"; P.t = 0; }
        break;
      }
      case "killTransform": {
        P.vx = 0;
        if (Math.random() < .85) {
          const a=rnd(0,TAU), rr=rnd(35,95);
          parts.push({k:"gather",sx:P.x+Math.cos(a)*rr,sy:P.y-70+Math.sin(a)*rr,tx:P.x,ty:P.y-72,life:.38,t:0,x:0,y:0,gc:"45,35,60"});
        }
        if (!P.killSkillFired && P.t >= .65) {
          P.killSkillFired = true; P.killArmorT = 20;
          doShake(18); doFlash(.5,"25,20,35"); sfx("demonRoar");
          addRing(P.x,P.y-72,12,150,.55,"rgba(55,45,70,.9)",10);
          spark(P.x,P.y-70,48,"#51455f",600,.8,-60);
          addText(P.x,P.y-145,"BLACK ARMOUR","#c7b9d6",22,1.2);
        }
        if (P.t >= 1.35) { P.state = "free"; P.t = 0; }
        break;
      }
      case "killAttack": {
        const A = KILL_ATK[P.combo], total = A.w + A.a + A.r;
        if (P.t < A.w) P.vx *= 0.84;
        else if (P.t < A.w + A.a) P.vx = P.face * A.lunge / A.a;
        else P.vx *= 0.76;
        if (!P.fxDone && P.t >= A.w) {
          P.fxDone = true; sfx("swing"); doShake(5);
          addArc(P.x + P.face * 10, P.y - 82, 122, A.a0, A.a1, P.face, .2, "rgba(210,220,230,.9)", 15);
          addArc(P.x + P.face * 8, P.y - 82, 104, A.a0, A.a1, P.face, .16, "rgba(75,82,92,.75)", 7);
        }
        if (P.t >= A.w && P.t < A.w + A.a) killnuxStrike(A);
        if (P.t >= A.w + A.a + A.r * .62 && buf.attack > 0 && P.combo < 2 && P.st >= 30) {
          startKillAttack(P.combo + 1); break;
        }
        if (P.t >= A.w + A.a && buf.dodge > 0 && P.st >= 20) { startKillDodge(dir); break; }
        if (P.t >= total) { P.state = "free"; P.t = 0; }
        break;
      }
      case "killDodge": {
        const k = clamp(P.t / .4, 0, 1);
        P.vx = P.dodgeDir * 840 * (1 - k * .4);
        if (Math.random() < .7) dust(P.x - P.dodgeDir * 16, GROUND, 1);
        if (P.t >= .4) { P.state = "free"; P.t = 0; P.vx *= .28; }
        break;
      }
case "airdash": {
        const k = P.t / 0.26;
        P.vx = P.dodgeDir * 680 * (1 - k * 0.45);
        P.vy = 0;
        parts.push({
          k: "dot",
          x: P.x,
          y: P.y - rnd(30, 80),
          vx: 0,
          vy: 0,
          life: 0.28,
          t: 0,
          col: "255,224,160",
          g: 0,
          drag: 1,
          sz: rnd(4, 8),
        });
        if (P.t >= 0.26) {
          P.state = "free";
          P.t = 0;
          P.vx *= 0.45;
          P.vy = 80;
        }
        break;
      }
      case "wizardMissile": {
        P.vx *= 0.84;
        if (!P.shotFired && P.t >= 0.11) {
          P.shotFired = true;
          fireWizardMissile();
        }
        if (P.t >= 0.3) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "wizardSword": {
        P.vx *= 0.8;
        if (!P.wizardFx && P.t >= 0.07) {
          P.wizardFx = true;
          addArc(
            P.x + P.face * 12,
            P.y - 70,
            95,
            -2.1,
            0.75,
            P.face,
            0.22,
            "rgba(100,215,255,.95)",
            10,
          );
          sfx("swing");
        }
        if (
          !P.wizardHit &&
          P.t >= 0.12 &&
          Math.abs(B.x - P.x) < B.hw + 105 &&
          B.state !== "dead"
        ) {
          P.wizardHit = true;
          hitBoss(70, 0.055, false, false);
          spark(B.x, P.y - 72, 16, "#8de7ff", 360, 0.38, 0);
        }
        if (P.t >= 0.36) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "wizardSummon": {
        P.vx = 0;
        if (!P.skill1Fired && P.t >= 0.4) {
          P.skill1Fired = true;
          summonSkeletons();
        }
        if (P.t >= 0.82) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "wizardBeam": {
        P.vx = 0;
        P.face = B.x >= P.x ? 1 : -1;
        if (!P.skill2Hit && P.t >= 1.05) {
          P.skill2Hit = true;
          hitBoss(1000, 0.18, true, true);
          spark(B.x, GROUND - 95, 55, "#69d9ff", 720, 0.62, 0);
          addRing(B.x, GROUND - 95, 12, 105, 0.45, "rgba(100,220,255,.95)", 8);
          doShake(14);
          doFlash(0.26, "90,190,255");
          sfx("explode");
        }
        if (P.t >= 1.65) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "regalSword": {
        P.vx *= 0.82;
        if (!P.regalFx && P.t >= 0.1) {
          P.regalFx = true;
          sfx("swing");
          addArc(
            P.x,
            P.y - 76,
            92,
            -2.4,
            0.9,
            P.face,
            0.18,
            "rgba(255,210,105,.96)",
            10,
          );
        }
        if (
          !P.regalHit &&
          P.t >= 0.12 &&
          P.t < 0.27 &&
          B.state !== "dead" &&
          B.state !== "intro" &&
          Math.abs(B.x - (P.x + P.face * 55)) < B.hw + 76
        ) {
          P.regalHit = true;
          hitBoss(90, 0.07, false, false);
        }
        if (P.t >= 0.38) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "regalGun": {
        P.vx *= 0.86;
        if (!P.shotFired && P.t >= 0.09) {
          P.shotFired = true;
          fireRegalShot();
        }
        if (P.t >= 0.28) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "regalOrb": {
        P.vx = 0;
        if (P.t < 0.28 && Math.random() < 0.8)
          parts.push({
            k: "gather",
            sx: P.x + rnd(-80, 80),
            sy: P.y - rnd(30, 130),
            tx: P.x + P.face * 28,
            ty: P.y - 88,
            life: 0.3,
            t: 0,
            gc: "120,70,190",
          });
        if (!P.regalOrbFired && P.t >= 0.28) {
          P.regalOrbFired = true;
          castRegalOrb();
        }
        if (P.t >= 0.6) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "regalBeam": {
        P.vx = 0;
        if (P.t < 0.18 && Math.random() < 0.9)
          parts.push({
            k: "gather",
            sx: P.x + rnd(-100, 100),
            sy: P.y - rnd(15, 145),
            tx: P.x + P.face * 30,
            ty: P.y - 72,
            life: 0.2,
            t: 0,
            gc: "95,40,150",
          });
        if (!P.regalBeamFired && P.t >= 0.18) {
          P.regalBeamFired = true;
          fireRegalBeam();
        }
        if (P.t >= 0.55) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "shot": {
        P.vx *= 0.85;
        if (!P.shotFired && P.t >= 0.06) {
          P.shotFired = true;
          fireBasicArrow();
        }
        if (P.t >= 0.16) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "teleport": {
        P.vx = 0;
        P.vy = 0;
        if (P.rt === "wind") {
          if (P.t >= 0.07) {
            P.rt = "jump";
            const oldX = P.x,
              dist = 260 * P.teleDir;
            P.x = clamp(P.x + dist, 40, WORLD - 40);
            const rc = heroType === "ronin",
              wc = heroType === "wizard";
            spark(
              oldX,
              P.y - 55,
              20,
              rc ? "#ff244c" : wc ? "#258cff" : "#5a3aa8",
              380,
              0.5,
              0,
            );
            spark(
              P.x,
              P.y - 55,
              16,
              rc ? "#ff9aaa" : wc ? "#9ce8ff" : "#bdf3f0",
              420,
              0.45,
              0,
            );
            addRing(
              oldX,
              P.y - 58,
              6,
              70,
              0.35,
              rc
                ? "rgba(255,25,65,.75)"
                : wc
                  ? "rgba(35,145,255,.85)"
                  : "rgba(90,50,180,.7)",
              4,
            );
            addRing(
              P.x,
              P.y - 58,
              6,
              82,
              0.35,
              rc
                ? "rgba(255,110,135,.9)"
                : wc
                  ? "rgba(145,230,255,.95)"
                  : "rgba(150,240,235,.9)",
              5,
            );
            sfx("dodge");
            P.t = 0;
          }
        } else if (P.t >= 0.16) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "rskill1": {
        if (P.rPhase === "dash") {
          const k = Math.min(1, P.t / 0.22);
          P.x = lerp(P.rStartX, P.rTargetX, easeOut(k));
          P.vx = 0;
          if (Math.random() < 0.8)
            parts.push({
              k: "dot",
              x: P.x,
              y: P.y - rnd(20, 70),
              vx: 0,
              vy: 0,
              life: 0.22,
              t: 0,
              col: "120,80,200",
              g: 0,
              drag: 1,
              sz: rnd(3, 7),
            });
          if (
            !P.rHit100 &&
            k >= 0.5 &&
            B.state !== "dead" &&
            B.state !== "intro"
          ) {
            P.rHit100 = true;
            hitBoss(100, 0.08, false, true);
            spark(B.x, GROUND - 90, 16, "#bdf3f0", 420, 0.4);
          }
          if (k >= 1) {
            P.rPhase = "barrage";
            P.t = 0;
            P.rArrows = 0;
            P.rNextArrow = 0;
          }
        } else if (P.rPhase === "barrage") {
          P.vx = 0;
          if (P.rArrows < 20 && P.t >= P.rNextArrow) {
            P.rArrows++;
            P.rNextArrow = P.t + 0.045;
            if (B.state !== "dead" && B.state !== "intro") {
              const pb = GROUND - P.y;
              arrows.push({
                owner: activePlayerIndex,
                x: P.x + P.face * 26,
                y: P.y - 82 + rnd(-8, 8),
                vx: P.face * 1500,
                life: 0.6,
                t: 0,
                hit: false,
                pb,
                dmg: 20,
                kind: "barrage",
              });
            }
            B.execMark = P.rArrows / 20;
            sfx("shot");
          }
          if (P.rArrows >= 20 && P.t >= P.rNextArrow + 0.05) {
            P.rPhase = "drop";
            P.t = 0;
          }
        } else if (P.rPhase === "drop") {
          if (P.t >= 0.18 && !P.rDropped) {
            P.rDropped = true;
            if (B.state !== "dead" && B.state !== "intro") {
              B.state = "stunned";
              B.stunT = 2.2;
              B.phase = "";
              B.combo = null;
              B.hitDone = true;
              addText(
                B.x,
                GROUND - (B.type === "art" ? 195 : 175),
                "EXPOSED",
                "#8ef0ea",
                24,
                1.1,
              );
            }
            B.execMark = null;
            doShake(14);
            doFlash(0.4, "140,230,225");
          }
          if (P.t >= 0.34) {
            P.state = "free";
            P.t = 0;
            P.rPhase = "";
          }
        }
        break;
      }
      case "rain2": {
        P.vx *= 0.7;
        if (!P.rainFired && P.t >= 0.3) {
          P.rainFired = true;
          launchRain();
        }
        if (P.t >= 0.42) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "roninLunge": {
        const k = Math.min(1, P.t / 0.34);
        P.x = lerp(P.roninStartX, P.roninTargetX, easeOut(k));
        P.vx = 0;
        if (Math.random() < 0.9)
          parts.push({
            k: "dot",
            x: P.x - P.face * rnd(5, 48),
            y: P.y - rnd(25, 95),
            vx: -P.face * rnd(80, 220),
            vy: rnd(-20, 20),
            life: 0.24,
            t: 0,
            col: "255,35,70",
            g: 0,
            drag: 1,
            sz: rnd(2, 6),
          });
        if (
          !P.roninHit &&
          k >= 0.48 &&
          B.state !== "dead" &&
          B.state !== "intro"
        ) {
          P.roninHit = true;
          if (Math.abs(B.x - P.x) < B.hw + 150) hitBoss(300, 0.14, false, true);
          addStreak(
            P.x - P.face * 35,
            P.y - 78,
            P.face * 190,
            "rgba(255,40,75,.98)",
            0.2,
          );
          addArc(
            B.x,
            GROUND - 100,
            120,
            -2.5,
            0.55,
            P.face,
            0.2,
            "rgba(255,70,95,.95)",
            13,
          );
        }
        if (k >= 1) {
          P.state = "free";
          P.t = 0;
          P.vx = P.face * 80;
        }
        break;
      }
      case "roninFlame": {
        P.vx = 0;
        const k = clamp(P.t / 0.72, 0, 1);
        if (Math.random() < 0.9)
          spark(
            P.x + rnd(-22, 22),
            P.y - rnd(35, 100),
            1,
            Math.random() < 0.5 ? "#ff244c" : "#ff9a45",
            150,
            0.35,
            -80,
          );
        if (P.t >= 0.48 && P.flameT <= 0) {
          P.flameT = 20;
          doFlash(0.38, "255,35,65");
          doShake(10);
          sfx("skill2");
          addText(
            P.x,
            P.y - 140,
            "BLOODFLAME — +50 DAMAGE",
            "#ff657d",
            20,
            1.2,
          );
        }
        if (P.t >= 0.72) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "skill1": {
        P.vx *= 0.8;
        if (!P.skill1Fired && P.t >= 0.1) {
          P.skill1Fired = true;
          fireSlash();
        }
        if (P.t >= 0.3) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "skill2": {
        P.vx *= 0.7;
        if (P.t < 0.55 && Math.random() < 0.7)
          parts.push({
            k: "dot",
            x: P.x + P.face * 14 + rnd(-6, 6),
            y: P.y - 62 + rnd(-8, 8),
            vx: rnd(-8, 8),
            vy: rnd(-32, -6),
            life: 0.35,
            t: 0,
            col: "255,150,60",
            g: 0,
            drag: 1,
            sz: rnd(2, 5),
          });
        if (!P.skill2Fired && P.t >= 0.55) {
          P.skill2Fired = true;
          releaseSkill2();
        }
        if (P.t >= 0.82) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "block": {
        if (dir) P.face = dir;
        P.vx += (dir * 90 - P.vx) * Math.min(1, dt * 14);
        if (buf.jump > 0 && grounded) {
          P.vy = -JUMPV;
          buf.jump = 0;
          sfx("jump");
          dust(P.x, GROUND, 4);
          P.state = "free";
          P.t = 0;
          break;
        }
        if (buf.dodge > 0 && P.st > 0) {
          if (heroType === "wraithknight") startWraithKnightRoll(dir);
          else if (heroType === "thor") startThorDodge(dir);
          else if (heroType === "killnux") startKillDodge(dir);
          else if (heroType === "ronin" || heroType === "wizard") startRoninDodge(dir);
          else startDodge(dir);
          break;
        }
        if (heroType === "thor") {
          if (buf.parry > 0 && P.st >= 40) { if (P.thorBuffT > 0) startThorHammer(dir); else startThorBolt(dir); break; }
          if (buf.attack > 0 && P.st > 0) { startAttack(0); break; }
          if (buf.heal > 0 && P.flasks > 0 && P.hp < P.maxhp) { startHeal(); break; }
          if (buf.skill1 > 0 && P.skill1CD <= 0) { startThorDive(); break; }
          if (buf.skill2 > 0 && P.skill2CD <= 0) { startThorTransform(); break; }
        } else if (heroType === "wraithknight") {
          if (buf.parry > 0) { startParry(); break; }
          if (buf.attack > 0 && P.st > 0) { startAttack(0); break; }
          if (buf.heal > 0 && P.flasks > 0 && P.hp < P.maxhp) { startHeal(); break; }
          if (buf.skill1 > 0 && P.skill1CD <= 0) { startWraithKnightStorm(); break; }
          if (buf.skill2 > 0 && P.skill2CD <= 0) { startWraithKnightTransform(); break; }
        } else if (heroType === "killnux") {
          if (buf.attack > 0 && P.st >= 30) { startKillAttack(0); break; }
          if (buf.heal > 0 && P.flasks > 0 && P.hp < P.maxhp) { startHeal(); break; }
          if (buf.skill1 > 0 && P.skill1CD <= 0) { startKillSkill1(dir); break; }
          if (buf.skill2 > 0 && P.skill2CD <= 0) { startKillSkill2(); break; }
        } else if (heroType === "shadow") {
          if (buf.parry > 0 && P.st > 0) {
            startTeleport(dir);
            break;
          }
          if (buf.attack > 0 && P.st > 0) {
            startShot(dir);
            break;
          }
          if (buf.heal > 0 && P.flasks > 0 && P.hp < P.maxhp) {
            startHeal();
            break;
          }
          if (buf.skill1 > 0 && P.skill1CD <= 0) {
            startRangerSkill1();
            break;
          }
          if (buf.skill2 > 0 && P.skill2CD <= 0) {
            startRangerSkill2();
            break;
          }
        } else if (heroType === "ronin") {
          if (buf.parry > 0) {
            startParry();
            break;
          }
          if (buf.attack > 0 && P.st > 0) {
            startAttack(0);
            break;
          }
          if (buf.heal > 0 && P.flasks > 0 && P.hp < P.maxhp) {
            startHeal();
            break;
          }
          if (buf.skill1 > 0 && P.skill1CD <= 0) {
            startRoninSkill1();
            break;
          }
          if (buf.skill2 > 0 && P.skill2CD <= 0) {
            startRoninSkill2();
            break;
          }
        } else if (heroType === "regal") {
          if (buf.parry > 0 && P.st >= 20) {
            startRegalGun(dir);
            break;
          }
          if (buf.attack > 0 && P.st >= 20) {
            startRegalSword(dir);
            break;
          }
          if (buf.heal > 0 && P.flasks > 0 && P.hp < P.maxhp) {
            startHeal();
            break;
          }
          if (buf.skill1 > 0 && P.skill1CD <= 0) {
            startRegalSkill1();
            break;
          }
          if (buf.skill2 > 0 && P.skill2CD <= 0) {
            startRegalSkill2();
            break;
          }
        } else if (heroType === "wizard") {
          if (buf.parry > 0 && P.st >= 10) {
            startWizardSword(dir);
            break;
          }
          if (buf.attack > 0 && P.st >= 20) {
            startWizardMissile(dir);
            break;
          }
          if (buf.heal > 0 && P.flasks > 0 && P.hp < P.maxhp) {
            startHeal();
            break;
          }
          if (buf.skill1 > 0 && P.skill1CD <= 0) {
            startWizardSummon();
            break;
          }
          if (buf.skill2 > 0 && P.skill2CD <= 0) {
            startWizardBeam();
            break;
          }
        } else {
          if (buf.parry > 0 && P.st > 0) {
            startParry();
            break;
          }
          if (buf.attack > 0 && P.st > 0) {
            startAttack(0);
            break;
          }
          if (buf.heal > 0 && P.flasks > 0 && P.hp < P.maxhp) {
            startHeal();
            break;
          }
          if (buf.skill1 > 0 && P.skill1CD <= 0) {
            startSkill1(dir);
            break;
          }
          if (buf.skill2 > 0 && P.skill2CD <= 0) {
            startSkill2(dir);
            break;
          }
        }
        if (!isActionHeld("block") || !grounded) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "dodge": {
        const k = P.t / 0.34;
        P.vx = P.dodgeDir * 720 * (1 - k * 0.55);
        if (Math.random() < 0.5) dust(P.x - P.dodgeDir * 10, GROUND, 1);
        if (P.t >= 0.34) {
          P.state = "free";
          P.t = 0;
          P.vx *= 0.3;
        }
        break;
      }
      case "parry": {
        P.vx *= 0.8;
        if (P.t >= P.endT) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "plunge": {
        P.vx = 0;
        P.vy = 1050;
        const pb = GROUND - P.y;
        if (
          !P.plungeHit &&
          B.state !== "dead" &&
          B.state !== "intro" &&
          Math.abs(P.x - B.x) < B.hw + 18 &&
          pb < B.h + B.hh + 4 &&
          pb > B.h + 10
        ) {
          P.plungeHit = true;
          hitBoss(120, 0.09);
          P.state = "free";
          P.t = 0;
          P.vy = -560;
          P.vx = -P.face * 120;
          spark(P.x, P.y, 10, "#ffe2a0", 400, 0.4);
        }
        break;
      }
      case "hurt": {
        P.vx *= 0.92;
        if (P.t > 0.3) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
      case "heal": {
        P.vx = dir * 60;
        if (!P.healed && P.t >= 0.5) {
          P.healed = true;
          P.flasks--;
          const before = P.hp;
          P.hp = Math.min(
            P.maxhp,
            P.hp + Math.round(P.maxhp * 0.7 * (P.healMult || 1)),
          );
          sfx("heal");
          addText(
            P.x,
            P.y - 125,
            "+" + Math.round(P.hp - before),
            "#8ef07a",
            24,
            1,
          );
          for (let i = 0; i < 26; i++)
            parts.push({
              k: "dot",
              x: P.x + rnd(-16, 16),
              y: P.y - rnd(10, 80),
              vx: rnd(-20, 20),
              vy: rnd(-90, -30),
              life: rnd(0.6, 1.1),
              t: 0,
              col: "140,240,120",
              g: 0,
              drag: 1,
              sz: rnd(2, 4),
            });
        }
        if (P.t >= 0.85) {
          P.state = "free";
          P.t = 0;
        }
        break;
      }
    }
    physics(dt);
    if (P.state === "plunge" && P.y >= GROUND) {
      P.y = GROUND;
      P.vy = 0;
      sfx("boom");
      doShake(9);
      dust(P.x, GROUND, 14);
      petals(P.x, GROUND, 14, 300);
      addRing(P.x, GROUND - 4, 8, 110, 0.3, "rgba(255,225,160,.8)", 4);
      if (
        !P.plungeHit &&
        B.state !== "dead" &&
        B.state !== "intro" &&
        Math.abs(P.x - B.x) < 120
      ) {
        P.plungeHit = true;
        hitBoss(120, 0.09);
      }
      P.state = "free";
      P.t = 0;
    }
  }
  function physics(dt) {
    const wasAir = P.y < GROUND - 1;
    if (
      P.state !== "plunge" &&
      P.state !== "airdash" &&
      P.state !== "teleport" &&
      P.state !== "thorDive" &&
      !(P.state === "rskill1" && P.rPhase === "dash")
    )
      P.vy += GRAV * dt;
    P.y += P.vy * dt;
    P.x = clamp(P.x + P.vx * dt, 40, WORLD - 40);
    if (P.y >= GROUND) {
      if (wasAir && P.vy > 300) {
        dust(P.x, GROUND, 6);
        P.landT = 0.14;
      }
      if (wasAir) {
        P.airDodged = false;
        P.jumpCount = 0;
      }
      P.y = GROUND;
      P.vy = 0;
    }
  }
  const WRAITH_PAL = { dk:"#0b0a13", md:"#2b2a3d", lt:"#6d7096", hi:"#b4b8dc", vio:"#8f7fd0", glow:"#c79bff", crim:"#8c1238", crim2:"#c72a56", navy:"#141b5c", out:"#04030a" };
  function wraithGrad(c,x1,y1,x2,y2,a,b){const g=c.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g}
  function drawWraithWings(c, sy, flap) {
    const K=WRAITH_PAL, u=(flap+1)/2;
    [[.8,"#130e21",-.14,"rgba(40,24,80,.55)"],[1,"#241a3c",0,"rgba(84,50,150,.55)"]].forEach(([scale,col,off,mem])=>{
      c.save(); c.translate(-7,sy+17); const base=lerp(-2.96,-2.18,u)+off+.16,tips=[],angles=[];
      for(let i=0;i<7;i++){const a=base+i*.19,L=(96-Math.abs(i-2.5)*9)*scale*(1+Math.sin(time*2+i)*.02);angles.push([a,L]);tips.push([Math.cos(a)*L,Math.sin(a)*L])}
      poly(c,[[0,0],...tips],mem,null);
      const rootGlow=c.createRadialGradient(0,0,2,0,0,30);rootGlow.addColorStop(0,"rgba(205,155,255,.28)");rootGlow.addColorStop(1,"rgba(80,40,130,0)");c.fillStyle=rootGlow;c.beginPath();c.arc(0,0,30,0,TAU);c.fill();
      for(let j=0;j<4;j++){const ca=base+.28+j*.2,CL=(38-j*3)*scale;poly(c,[[0,0],[Math.cos(ca)*CL-4,Math.sin(ca)*CL],[Math.cos(ca)*CL,Math.sin(ca)*CL+6],[Math.cos(ca)*CL*.42,Math.sin(ca)*CL*.42+7]],j%2?"#392653":"#2b1c43",K.out,1.2)}
      angles.forEach(([a,L],i)=>{const px=-Math.sin(a)*(5.5-i*.3),py=Math.cos(a)*(5.5-i*.3);
        poly(c,[[px*.4,py*.4],[Math.cos(a)*L*.55+px*2,Math.sin(a)*L*.55+py*2],[Math.cos(a)*L,Math.sin(a)*L],[Math.cos(a)*L*.55-px*2,Math.sin(a)*L*.55-py*2],[-px*.4,-py*.4]],col,K.out,1.5);
        c.strokeStyle=`rgba(199,155,255,${.6-i*.05})`;c.lineWidth=1.2;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*L*.93,Math.sin(a)*L*.93);c.stroke()});
      c.strokeStyle=K.out;c.lineWidth=6;c.lineCap="round";c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(tips[6][0]*.4-6,tips[6][1]*.5-8,tips[6][0],tips[6][1]);c.stroke();c.strokeStyle=K.lt;c.lineWidth=3;c.stroke();
      c.save();c.shadowColor=K.glow;c.shadowBlur=10;c.fillStyle=K.glow;tips.forEach((q,i)=>{c.beginPath();c.arc(q[0],q[1],1.8+Math.sin(time*5+i)*.5,0,TAU);c.fill()});c.restore();c.restore();
    });
  }
  function drawWraithGreatsword(c,strength){
    const K=WRAITH_PAL;c.save();c.fillStyle="#1a1526";c.fillRect(-20,-2.6,26,5.2);c.strokeStyle=K.out;c.lineWidth=1.2;c.strokeRect(-20,-2.6,26,5.2);
    c.strokeStyle=K.vio;c.lineWidth=1;for(let i=0;i<6;i++){c.beginPath();c.moveTo(-18+i*4,-2.6);c.lineTo(-15.5+i*4,2.6);c.stroke()}
    poly(c,[[-22,-3],[-31,0],[-22,3]],K.lt,K.out,1.2);c.fillStyle=K.md;c.beginPath();c.arc(-21,0,3.4,0,TAU);c.fill();c.stroke();
    poly(c,[[4,-4],[8,-9],[17,-16],[14,-7],[12,-3],[12,3],[14,7],[17,16],[8,9],[4,4]],wraithGrad(c,4,-16,4,16,K.hi,K.md),K.out,1.5);
    c.fillStyle=K.glow;c.shadowColor=K.glow;c.shadowBlur=8;c.beginPath();c.arc(9,0,2.2,0,TAU);c.fill();c.shadowBlur=0;
    const bg=c.createLinearGradient(0,-6,0,6);bg.addColorStop(0,"#5a5f82");bg.addColorStop(.5,"#2e3150");bg.addColorStop(1,"#15172a");poly(c,[[12,-5.6],[72,-5.2],[84,-2],[94,0],[84,2],[72,5.2],[12,5.6]],bg,K.out,1.5);
    c.strokeStyle="rgba(190,200,240,.5)";c.lineWidth=1;c.beginPath();c.moveTo(14,-3.6);c.lineTo(86,-.6);c.stroke();c.fillStyle="rgba(199,155,255,.5)";for(let i=0;i<4;i++)c.fillRect(24+i*14,-1.4,5,2.8);
    c.shadowColor=K.glow;c.shadowBlur=10+strength*14;c.lineCap="round";for(let i=0;i<3;i++){c.strokeStyle=i?"rgba(215,180,255,.85)":"rgba(240,225,255,.95)";c.lineWidth=i?1.6:2.2;c.beginPath();for(let xx=14;xx<=90;xx+=4){const fade=1-(xx-14)/90,yy=Math.sin(xx*.17+time*4.2+i*2.1)*(5+i)*fade*(1+strength*.6)+(i-1)*2.4*fade;xx===14?c.moveTo(xx,yy):c.lineTo(xx,yy)}c.stroke()}c.shadowBlur=0;c.restore();
  }
  function drawWraithKnight(c) {
    const K=WRAITH_PAL, form=P.wraithBuffT>0, run=clamp(Math.abs(P.vx)/250,0,1), attacking=P.state==="attack", parrying=P.state==="parry", rolling=P.state==="wraithRoll", teleporting=P.state==="wraithTeleport", casting=P.state==="wraithStorm"||P.state==="wraithTransform", Adata=attacking?basicAttackData(P.combo):null;
    let alpha=1;if(teleporting)alpha=P.t<.1?1-P.t/.1:Math.min(1,(P.t-.1)/.15);
    let swordA=.55, trail=false, strength=form?1:.25;
    if(attacking){const t=P.t,A=Adata;if(t<A.w)swordA=lerp(.55,A.a0,ease(t/A.w));else if(t<A.w+A.a){swordA=lerp(A.a0,A.a1,((t-A.w)/A.a)**2);trail=true}else swordA=lerp(A.a1,.55,ease(clamp((t-A.w-A.a)/A.r,0,1)));strength=.7+(form?.6:0)}else if(casting)swordA=-1.25+Math.sin(time*8)*.04;
    const crouch=rolling?12:attacking?Math.sin(clamp(P.t/(Adata.w+Adata.a),0,1)*Math.PI)*(P.combo===2?10:5):Math.sin(time*1.8)*1.2, hipY=-48+crouch, sy=hipY-40;
    c.save();c.globalAlpha=alpha;c.translate(P.x,P.y);c.scale(P.face*.94,.94);c.translate(0,-45);if(rolling)c.rotate(P.face*easeOut(clamp(P.t/.42,0,1))*TAU);c.translate(0,45);
    if(form||P.state==="wraithTransform"){const walkGlow=form&&run>.12?(0.34+Math.sin(time*10)*.1):.24,ag=c.createRadialGradient(0,-70,5,0,-70,112);ag.addColorStop(0,`rgba(205,145,255,${walkGlow})`);ag.addColorStop(.48,"rgba(150,75,240,.18)");ag.addColorStop(1,"rgba(70,18,135,0)");c.fillStyle=ag;c.fillRect(-125,-190,250,250);if(form&&run>.12){c.save();c.globalCompositeOperation="lighter";c.strokeStyle="rgba(218,175,255,.55)";c.shadowColor="#b05cff";c.shadowBlur=14;c.lineWidth=2;for(let i=0;i<4;i++){const yy=-25-i*31,xx=-28-Math.sin(time*9+i)*8;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-P.face*(15+run*18),yy+Math.sin(time*7+i)*5);c.stroke()}c.restore()}const flap=P.vy<0?Math.sin(time*16)*.72:Math.sin(time*2.4)*.22;drawWraithWings(c,sy,flap)}
    const gait=(off,base)=>{const a=P.stride+off,q={x:base*(1-run)+Math.sin(a)*22*run,y:-Math.max(0,Math.cos(a))*16*run};return{x:lerp(q.x,base*.4,rolling?1:0),y:lerp(q.y,-26,rolling?1:0)}};
    const leg=(hx,ft,far)=>{const q=ik(hx,hipY,ft.x,ft.y,25,25,-1),col=far?"#171522":K.md;limb(c,[{x:hx,y:hipY},{x:q.x,y:q.y},{x:q.tx,y:q.ty}],far?11:13.5,K.out,col,K.lt);poly(c,[[q.x-3,q.y-6],[q.x+13,q.y-1],[q.x+4,q.y+8]],far?K.md:K.lt,K.out,1.3);poly(c,[[q.tx-8,q.ty-9],[q.tx+5,q.ty-10],[q.tx+16,q.ty-1],[q.tx+17,q.ty+1],[q.tx-8,q.ty+1]],K.dk,K.out,1.4);poly(c,[[q.tx+10,q.ty-3],[q.tx+21,q.ty+1],[q.tx+10,q.ty+1]],K.lt,K.out,1)};
    const cloth=run*11+Math.sin(time*3)*3;poly(c,[[-6,hipY-4],[-13-cloth,hipY+16],[-24-cloth*1.4,hipY+26],[-16-cloth,hipY+34],[-8-cloth*.4,hipY+22],[-2,hipY+30]],K.crim,K.out,1.3);leg(-5,gait(Math.PI+.3,-10),true);
    const lean=attacking?.12:0,pivot={x:0,y:hipY};c.save();c.translate(pivot.x,pivot.y);c.rotate(lean);c.translate(-pivot.x,-pivot.y);const S={x:5,y:sy+3+Math.sin(time*1.6)*.6};
    poly(c,[[-12,sy+2],[-24,sy-20],[-6,sy-2]],K.dk,K.out,1.3);const H=parrying?{x:S.x+34,y:S.y+2}:{x:S.x+32*Math.cos(swordA*.85),y:S.y+32*Math.sin(swordA*.85)},Hf={x:H.x-Math.cos(swordA)*11,y:H.y-Math.sin(swordA)*11},S2={x:-5,y:sy+4},e2=ik(S2.x,S2.y,Hf.x,Hf.y,20,20,1);limb(c,[S2,{x:e2.x,y:e2.y},{x:e2.tx,y:e2.ty}],9,K.out,"#1a1826",K.md);
    c.beginPath();c.moveTo(-14,sy+3);c.lineTo(15,sy+1);c.quadraticCurveTo(17,hipY-20,11,hipY+3);c.lineTo(-11,hipY+3);c.quadraticCurveTo(-17,hipY-20,-14,sy+3);c.closePath();c.fillStyle=wraithGrad(c,-14,sy,15,hipY,K.lt,K.dk);c.fill();c.strokeStyle=K.out;c.lineWidth=1.9;c.stroke();
    c.strokeStyle="rgba(200,205,240,.5)";c.lineWidth=1.2;for(let i=0;i<4;i++){const y=sy+8+i*7;c.beginPath();c.moveTo(-11,y);c.lineTo(2,y+5);c.lineTo(13,y-1);c.stroke()}
    poly(c,[[-12,hipY-8],[14,hipY-14],[16,hipY-7],[-12,hipY+1]],K.crim2,K.out,1.3);const sway=Math.sin(time*2)*1.5-run*6;poly(c,[[-7,hipY],[12,hipY-1],[15+sway,hipY+24],[10+sway,hipY+20],[7+sway,hipY+30],[2+sway,hipY+22],[-3+sway,hipY+29],[-8+sway,hipY+18]],wraithGrad(c,0,hipY,0,hipY+30,K.crim2,K.crim),K.out,1.4);
    poly(c,[[-13,sy+1],[-9,sy-14],[1,sy-12],[3,sy+1]],K.navy,K.out,1.4);poly(c,[[-2,sy-22],[-13,sy-42],[-4,sy-27]],K.md,K.out,1.3);poly(c,[[6,sy-24],[14,sy-46],[12,sy-22]],K.lt,K.out,1.3);const hg=c.createLinearGradient(-8,sy-28,14,sy-2);hg.addColorStop(0,K.hi);hg.addColorStop(.5,K.md);hg.addColorStop(1,K.dk);poly(c,[[-8,sy-5],[-10,sy-17],[-5,sy-25],[3,sy-29],[11,sy-25],[14,sy-15],[12,sy-6],[6,sy-1]],hg,K.out,1.8);c.fillStyle="#07060c";c.beginPath();c.moveTo(1,sy-16);c.lineTo(14,sy-17);c.lineTo(13,sy-13);c.lineTo(2,sy-12);c.closePath();c.fill();c.save();c.shadowColor=K.glow;c.shadowBlur=9;c.fillStyle=K.glow;c.fillRect(8,sy-16,6,2);c.restore();
    if(trail){c.save();c.strokeStyle="rgba(180,140,255,.5)";c.shadowColor=K.glow;c.shadowBlur=16;c.lineWidth=13;c.lineCap="round";c.beginPath();c.arc(S.x,S.y,88,swordA-.8,swordA+.25);c.stroke();c.restore()}
    if(!parrying){c.save();c.translate(H.x,H.y);c.rotate(swordA);drawWraithGreatsword(c,strength);c.restore()}else{const glow=c.createRadialGradient(H.x,H.y,2,H.x,H.y,32);glow.addColorStop(0,"rgba(245,225,255,.95)");glow.addColorStop(.3,"rgba(170,80,255,.75)");glow.addColorStop(1,"rgba(70,15,130,0)");c.fillStyle=glow;c.beginPath();c.arc(H.x,H.y,32,0,TAU);c.fill()}
    const pg=c.createRadialGradient(-2,sy-2,1,4,sy+4,16);pg.addColorStop(0,K.hi);pg.addColorStop(.6,K.md);pg.addColorStop(1,K.dk);poly(c,[[-5,sy],[-16,sy-32],[4,sy-5]],K.lt,K.out,1.4);poly(c,[[8,sy+1],[27,sy-3],[24,sy+3],[11,sy+9]],K.md,K.out,1.3);poly(c,[[-10,sy+3],[-24,sy-4],[-8,sy+9]],K.md,K.out,1.3);c.fillStyle=pg;c.beginPath();c.ellipse(2,sy+3,14,9,-.15,0,TAU);c.fill();c.strokeStyle=K.out;c.lineWidth=1.7;c.stroke();const e=ik(S.x,S.y,H.x,H.y,20,20,1);limb(c,[S,{x:e.x,y:e.y},{x:e.tx,y:e.ty}],10.5,K.out,K.md,K.lt);c.restore();leg(6,gait(0,10),false);c.restore();
  }

  /* ================= BOSS AI ================= */
  function bossCombatTarget() {
    let target = P,
      best = Infinity;
    if (heroType === "wizard") {
      for (const s of skeletons) {
        if (s.hp <= 0 || s.state === "spawn") continue;
        const d = Math.abs(s.x - B.x);
        if (d < best) {
          best = d;
          target = s;
        }
      }
    }
    B.targetSkeleton = target === P ? null : target;
    return target;
  }
  function damageSkeletonsInRange(x, radius, dmg) {
    let hit = false;
    if (heroType !== "wizard") return hit;
    for (const s of skeletons) {
      if (s.hp > 0 && s.state !== "spawn" && Math.abs(s.x - x) <= radius) {
        damageSkeleton(s, dmg);
        hit = true;
      }
    }
    return hit;
  }
  function bossFace() {
    const target = bossCombatTarget();
    B.face = target.x >= B.x ? 1 : -1;
  }
  function startBossAtk() {
    B.atk = B.combo.atks[B.ci];
    B.phase = "wind";
    B.pt = 0;
    B.hitDone = false;
  }
  function bossChoose() {
    const d = Math.abs(bossCombatTarget().x - B.x),
      r = Math.random();
    let pick;
    if (d > 430) pick = r < 0.55 ? "kame" : "walk";
    else if (d > 210)
      pick =
        r < 0.55 ? "combo" : r < 0.75 ? "kame" : r < 0.87 ? "explode" : "walk";
    else pick = r < 0.65 ? "combo" : r < 0.9 ? "explode" : "kame";
    if (pick === B.last && pick !== "walk" && Math.random() < 0.75)
      pick = pick === "combo" ? (d > 300 ? "kame" : "explode") : "combo";
    B.last = pick;
    if (pick === "walk") {
      B.cool = rnd(0.3, 0.6);
      return;
    }
    if (pick === "combo") {
      let i;
      do {
        i = Math.floor(Math.random() * COMBOS.length);
      } while (i === B.lastCombo);
      B.lastCombo = i;
      B.combo = COMBOS[i];
      B.ci = 0;
      B.state = "combo";
      startBossAtk();
    } else if (pick === "kame") {
      B.state = "kame";
      B.phase = "charge";
      B.pt = 0;
      B.beamHit = false;
      sfx("charge");
    } else {
      B.state = "explode";
      B.phase = "charge";
      B.pt = 0;
      B.expR = 0;
      sfx("charge");
    }
  }
  function bossStrike(a) {
    if (B.hitDone) return;
    const f = B.face,
      R = a.rect;
    const lo = Math.min(B.x + f * R.x0, B.x + f * R.x1),
      hi = Math.max(B.x + f * R.x0, B.x + f * R.x1);
    if (heroType === "wizard") {
      for (const s of skeletons) {
        if (s.hp > 0 && s.x + 14 > lo && s.x - 14 < hi) {
          damageSkeleton(s, a.dmg ? bd(a.dmg) : 75);
          B.hitDone = true;
          return;
        }
      }
    }
    const pb = GROUND - P.y,
      pt = pb + 100;
    const overY = pt > R.h0 && pb < R.h1;
    const parryWindow = heroType === "ronin" ? RONIN_DEFLECT_WIN : PARRY_WIN;
    if (
      P.state === "parry" &&
      !P.parrySucc &&
      P.t < parryWindow &&
      (heroType === "ronin" || P.face === -f)
    ) {
      const pl = Math.min(P.x - 16, P.x + P.face * 34),
        pr = Math.max(P.x + 16, P.x + P.face * 34);
      if (pr > lo && pl < hi && overY) {
        if (heroType === "ronin")
          roninDeflectSuccess((B.x + P.x) / 2 + P.face * 6, P.y - 66);
        else parrySuccess((B.x + P.x) / 2 + P.face * 6, P.y - 66);
        return;
      }
    }
    if (P.x + 15 > lo && P.x - 15 < hi && overY) {
      if (P.invuln > 0) return;
      if (hurtPlayer(a.dmg ? bd(a.dmg) : 75, B.x, false)) B.hitDone = true;
    }
  }
  function bossSlashFx(a) {
    const f = B.face,
      art = B.type === "art",
      demon = B.type === "demon",
      sc = demon ? 1.58 : art ? 1.5 : 1.42,
      sy = GROUND - 79 * sc;
    const col = demon
      ? "rgba(255,72,38,.96)"
      : art
        ? "rgba(150,195,255,.92)"
        : "rgba(184,110,255,.9)";
    if (a.type === "thrust")
      addStreak(
        B.x + f * 30,
        GROUND - ((80 * sc) / 1.42) * 1.1,
        f * (demon ? 235 : 200),
        col,
        0.16,
      );
    else {
      const K = BK[a.type];
      addArc(
        B.x,
        sy,
        demon ? 158 : art ? 170 : 138,
        K.aw,
        K.a1,
        f,
        0.2,
        col,
        demon ? 16 : 14,
      );
    }
    sfx("bswing");
  }
  /* ================= BLACK SPIRE KNIGHT ================= */
  const SPIRE_PAL={blk:"#06060a",dk:"#12131a",md:"#262830",lt:"#5d626c",hi:"#a9b0ba",crm:"#4a0b17",crm2:"#9c1a30",out:"#020204"};
  function spireTarget(){return bossCombatTarget()}
  // v6.6 hitbox fix: Spire melee now only connects in front of him and each range
  // matches the visible weapon arc. Damage values are unchanged.
  function spireHit(dmg,range,parryable=true){const t=spireTarget();if(t!==P){if(t.hp>0&&Math.abs(t.x-B.x)<range+35)damageSkeleton(t,bd(dmg));return}const dx=P.x-B.x;if(dx*B.face<-34)return;if(Math.abs(dx)<range&&GROUND-P.y<190&&P.invuln<=0&&(!parryable||!tryBasicMeleeParry(B.x,(B.x+P.x)/2,P.y-72)))hurtPlayer(bd(dmg),B.x,true)}
  function spireEnd(cd=1.15){B.state="idle";B.cool=cd;B.pt=0;B.h=0;B.spHitDone=false;B.spSpawned=0}
  function startSpireAttack(k){B.state="spireAttack";B.spAttack=k;B.pt=0;B.spIndex=0;B.spHitDone=false;B.spNext=0;B.spSpawned=0;B.spStartX=B.x;B.spTargetX=spireTarget().x;B.spStunStarted=false;const r=Math.random();B.spHits=k==="combo"?(r<.5?3:4):k==="rush"?(r<.5?2:3):k==="jump"?(r<.5?3:4):k==="orbit"?(r<.5?2:3):k==="void"?(8+Math.floor(r*5)):k==="sky"?5:k==="slashes"||k==="spears"?3:1;sfx(k==="rush"||k==="tele"?"dodge":"charge")}
  function spireChoose(){const d=Math.abs(spireTarget().x-B.x),pool=d>420?["rush","sky","slashes","orbit","void","spears","jump"]:["combo","thrust","jump","slashes","orbit","tele","sky","void","spears"],choices=pool.filter(x=>x!==B.last),k=choices[Math.floor(Math.random()*choices.length)];B.last=k;startSpireAttack(k)}
  function spireHaz(k,o){spireHazards.push(Object.assign({kind:k,t:0,life:2,hit:false},o))}
  function updateSpireHazards(dt){for(let i=spireHazards.length-1;i>=0;i--){const h=spireHazards[i];h.t+=dt;let dead=h.t>h.life;
    if(h.kind==="sky"||h.kind==="groundOrb"){if(!h.hit&&h.t>=h.delay){h.hit=true;doShake(h.kind==="sky"?11:7);sfx("crack");const dmg=h.kind==="sky"?300:200,rad=h.kind==="sky"?58:50;damageSkeletonsInRange(h.x,rad,bd(dmg));if(Math.abs(P.x-h.x)<rad&&GROUND-P.y<190&&P.invuln<=0)hurtPlayer(bd(dmg),h.x,true);spark(h.x,GROUND-30,h.kind==="sky"?34:24,h.kind==="sky"?"#ff3658":"#d22143",580,.55,80)}}
    else {h.x+=h.vx*dt;h.y+=h.vy*dt;if(!h.hit&&P.invuln<=0&&P.state!=="dead"&&Math.hypot(P.x-h.x,P.y-65-h.y)<h.r+32){h.hit=true;hurtPlayer(bd(h.dmg),h.x,h.kind!=="voidBall");dead=true;spark(h.x,h.y,18,"#ff294b",420,.4)}if(h.x<0||h.x>WORLD||h.y>H+80)dead=true}
    if(dead)spireHazards.splice(i,1)}}
  function updateSpire(dt){for(let i=B.spTrail.length-1;i>=0;i--){const q=B.spTrail[i];q.t+=dt;if(q.t>q.life)B.spTrail.splice(i,1)}
    if(B.state==="intro"){B.introFill=Math.min(1,phaseT/1.7);return}if(B.state==="dead"){B.dieT+=dt;return}
    if(B.state==="stunned"){if(!B.spStunStarted){B.spStunStarted=true;B.stunT=5;B.pt=0;B.h=0;addText(B.x,GROUND-205,"DOWNED — 5 SECONDS","#ffb0bd",20,1.2)}B.stunT-=dt;B.pt+=dt;if(B.stunT<=0){B.spStunStarted=false;B.state="idle";B.cool=.65;B.pt=0;addRing(B.x,GROUND-80,10,105,.35,"rgba(210,35,65,.85)",6);sfx("charge")}return}
    if(B.state==="idle"){B.spStunStarted=false;const t=spireTarget(),dx=t.x-B.x,ad=Math.abs(dx);B.face=dx>=0?1:-1;B.moving=false;B.cool-=dt;if(ad>230){B.x+=B.face*105*dt;B.moving=true;B.stride+=dt*7.3}else if(ad<105)B.x-=B.face*38*dt;if(B.cool<=0&&phase==="fight")spireChoose();return}
    if(B.state!=="spireAttack")return;B.moving=false;B.pt+=dt;const k=B.spAttack,t=spireTarget();
    if(k==="combo"){const per=.78,n=Math.min(B.spHits-1,Math.floor(B.pt/per)),q=(B.pt-n*per)/per;if(n!==B.spIndex){B.spIndex=n;B.spHitDone=false}B.face=t.x>=B.x?1:-1;if(q>.43&&q<.61&&!B.spHitDone){B.spHitDone=true;spireHit(170,195,true);addArc(B.x,GROUND-120,155,n%2?-2.6:-2.95,n%2?.7:1,B.face,.2,"rgba(210,220,232,.78)",14);spark(B.x+B.face*105,GROUND-115,14,"#b21f3c",380,.4);sfx("bswing")}if(B.pt>=B.spHits*per+.22)spireEnd(rnd(1,2))}
    else if(k==="thrust"){const q=B.pt/1.35;if(q<.4)B.face=t.x>=B.x?1:-1;else if(q<.58){B.x=lerp(B.spStartX,clamp(B.spStartX+B.face*170,70,WORLD-70),ease((q-.4)/.18));if(!B.spHitDone){B.spHitDone=true;spireHit(190,205,true);addStreak(B.x-B.face*80,GROUND-112,B.face*210,"rgba(225,232,240,.88)",.18)}}if(q>=1)spireEnd(rnd(1,2))}
    else if(k==="rush"){const per=.68,n=Math.min(B.spHits-1,Math.floor(B.pt/per)),q=(B.pt-n*per)/per;if(n!==B.spIndex){B.spIndex=n;B.spHitDone=false;B.spStartX=B.x;B.face=t.x>=B.x?1:-1;B.spTargetX=clamp(t.x-B.face*28,70,WORLD-70)}if(q<.18)B.x=B.spStartX;else if(q<.58){B.x=lerp(B.spStartX,B.spTargetX,ease((q-.18)/.4));B.spTrail.push({x:B.x-B.face*rnd(30,95),y:GROUND-rnd(35,145),life:.34,t:0});if(!B.spHitDone&&q>.31){B.spHitDone=true;spireHit(200,190,false);addArc(B.x,GROUND-118,170,-2.65,.75,B.face,.24,"rgba(190,20,50,.92)",20);doShake(8)}}if(B.pt>=B.spHits*per+.3)spireEnd(rnd(1.25,2))}
    else if(k==="sky"){if(B.pt<.7)B.h=18*Math.sin(B.pt/.7*Math.PI);while(B.spSpawned<5&&B.pt>=.35+B.spSpawned*.18){const n=B.spSpawned++,x=clamp(t.x+rnd(-260,260),70,WORLD-70);spireHaz("sky",{x,delay:.9,life:1.35,index:n});addText(x,GROUND-12,"!","#ff4864",18,.7)}if(B.pt>2.1)spireEnd(1.25)}
    else if(k==="jump"){const per=.92,n=Math.min(B.spHits-1,Math.floor(B.pt/per)),q=(B.pt-n*per)/per;if(n!==B.spIndex){B.spIndex=n;B.spHitDone=false;B.spStartX=B.x;B.spTargetX=clamp(t.x,65,WORLD-65);B.face=B.spTargetX>=B.x?1:-1}if(q<.7){const z=q/.7;B.x=lerp(B.spStartX,B.spTargetX,ease(z));B.h=Math.sin(z*Math.PI)*205}else{B.h=0;if(!B.spHitDone){B.spHitDone=true;spireHit(250,145,false);addRing(B.x,GROUND-5,10,125,.35,"rgba(220,25,55,.92)",10);spark(B.x,GROUND-20,32,"#d31c3e",580,.55,100);doShake(13)}}if(B.pt>=B.spHits*per+.25)spireEnd(1.3)}
    else if(k==="slashes"){if(B.spSpawned<3&&B.pt>=.35+B.spSpawned*.42){const n=B.spSpawned++,sx=B.x+B.face*70,sy=GROUND-105-n*12,dx=t.x-sx,dy=t.y-65-sy,L=Math.hypot(dx,dy)||1;spireHaz("slash",{x:sx,y:sy,vx:dx/L*520,vy:dy/L*520,r:30,dmg:200,life:2});addArc(B.x,GROUND-120,145,-2.7,.65,B.face,.2,"rgba(240,35,70,.9)",16);sfx("bswing")}if(B.pt>2)spireEnd(1.1)}
    else if(k==="orbit"){const per=1.05,n=Math.min(B.spHits-1,Math.floor(B.pt/per)),q=B.pt-n*per;if(n!==B.spIndex){B.spIndex=n;B.spHitDone=false}if(!B.spHitDone&&q>.18){B.spHitDone=true;for(let j=0;j<6;j++)spireHaz("groundOrb",{x:clamp(t.x+(j-2.5)*86+rnd(-18,18),55,WORLD-55),delay:.7+j*.035,life:1.2,index:j})}if(B.pt>B.spHits*per+.2)spireEnd(1.4)}
    else if(k==="tele"){if(B.pt<.32){B.spTrail.push({x:B.x,y:GROUND-90,life:.38,t:0});B.h=8*Math.sin(B.pt*18)}else if(!B.spHitDone){B.spHitDone=true;B.face=t.face||1;B.x=clamp(t.x-(t.face||1)*105,65,WORLD-65);B.face=t.x>=B.x?1:-1;addRing(B.x,GROUND-85,5,85,.26,"rgba(190,15,45,.9)",8);spireHit(100,175,false);addStreak(B.x,GROUND-108,B.face*190,"rgba(255,35,70,.9)",.22);doShake(7)}if(B.pt>.95)spireEnd(1.1)}
    else if(k==="void"){const fireEnd=1+B.spHits*.18;if(B.pt<=fireEnd+1)B.h=Math.min(190,B.pt/.7*190);if(!B.spHitDone&&B.pt>.75){B.spHitDone=true;addRing(B.x,82,18,145,.7,"rgba(190,15,50,.9)",18)}while(B.spSpawned<B.spHits&&B.pt>=1+B.spSpawned*.18){B.spSpawned++;const sx=B.x+rnd(-90,90),sy=82+rnd(-22,22),tx=t.x+rnd(-120,120),ty=t.y-55,dx=tx-sx,dy=ty-sy,L=Math.hypot(dx,dy)||1;spireHaz("voidBall",{x:sx,y:sy,vx:dx/L*430,vy:dy/L*430,r:13,dmg:50,life:2.4})}if(B.pt>fireEnd+1){B.h=Math.max(0,B.h-dt*260);if(B.h<=0)spireEnd(1.6)}}
    else if(k==="spears"){if(B.spSpawned<3&&B.pt>=.42+B.spSpawned*.5){B.spSpawned++;const sx=B.x+B.face*45,sy=GROUND-165,tx=t.x,ty=t.y-65,dx=tx-sx,dy=ty-sy,L=Math.hypot(dx,dy)||1;spireHaz("spear",{x:sx,y:sy,vx:dx/L*610,vy:dy/L*610,r:16,dmg:200,life:2});addStreak(sx,sy,B.face*110,"rgba(255,55,80,.8)",.2);sfx("bswing")}if(B.pt>2.35)spireEnd(1.2)}
  }
  function drawSpireHazards(){for(const h of spireHazards){const warn=h.kind==="sky"||h.kind==="groundOrb";ctx.save();if(warn){const q=Math.min(1,h.t/h.delay),r=h.kind==="sky"?44:38;ctx.translate(h.x,GROUND-4);ctx.strokeStyle=h.kind==="sky"?"rgba(255,50,80,.95)":"rgba(210,28,60,.9)";ctx.lineWidth=3+q*4;ctx.shadowColor="#ff183f";ctx.shadowBlur=14;ctx.beginPath();ctx.ellipse(0,0,r*(.7+.3*q),12*(.7+.3*q),0,0,TAU);ctx.stroke();for(let j=0;j<6;j++){const a=time*2+j*TAU/6;ctx.fillStyle="#ff4765";ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*9,2.5,0,TAU);ctx.fill()}if(h.t>=h.delay){const g=ctx.createLinearGradient(0,-GROUND,0,0);g.addColorStop(0,"rgba(255,30,65,0)");g.addColorStop(.3,"rgba(255,25,60,.7)");g.addColorStop(1,"rgba(255,190,200,.95)");ctx.fillStyle=g;ctx.globalAlpha=Math.max(0,1-(h.t-h.delay)/.35);ctx.fillRect(-(h.kind==="sky"?28:18),-GROUND,h.kind==="sky"?56:36,GROUND)}}else{ctx.translate(h.x,h.y);const ang=Math.atan2(h.vy,h.vx);ctx.rotate(ang);ctx.shadowColor="#ff173e";ctx.shadowBlur=18;if(h.kind==="spear"){ctx.fillStyle="#a90f2e";poly(ctx,[[-42,-5],[22,-5],[42,0],[22,5],[-42,5]],"#b71436","#ff6b82",2)}else if(h.kind==="slash"){ctx.strokeStyle="#ff3158";ctx.lineWidth=13;ctx.beginPath();ctx.arc(0,0,34,-1.15,1.15);ctx.stroke();ctx.strokeStyle="#ffd5dc";ctx.lineWidth=3;ctx.stroke()}else{const g=ctx.createRadialGradient(0,0,2,0,0,h.r);g.addColorStop(0,"#fff0f3");g.addColorStop(.25,"#ff3156");g.addColorStop(1,"rgba(90,0,20,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,h.r,0,TAU);ctx.fill();ctx.strokeStyle="rgba(255,40,70,.35)";ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-70,0);ctx.lineTo(-8,0);ctx.stroke()}}ctx.restore()}}
  function drawSpireSword(c,len=120){const C=SPIRE_PAL;c.fillStyle="#14151b";c.fillRect(-24,-3,30,6);c.strokeStyle=C.out;c.lineWidth=1.3;c.strokeRect(-24,-3,30,6);[-1,1].forEach(m=>poly(c,[[5,m*3],[11,m*3],[13,m*10],[19,m*19],[12,m*17],[7,m*10]],C.lt,C.out,1.5));const g=c.createLinearGradient(0,-8,0,8);g.addColorStop(0,"#b5bec4");g.addColorStop(.5,"#8d979e");g.addColorStop(1,"#4b555b");poly(c,[[8,-6.5],[len-18,-5.5],[len,0],[len-18,5.5],[8,6.5]],g,C.out,1.7);c.strokeStyle="rgba(245,250,255,.75)";c.beginPath();c.moveTo(10,-4.6);c.lineTo(len-20,-4);c.stroke()}
  function drawSpire(c){const C=SPIRE_PAL,k=B.spAttack,t=B.pt,run=B.moving?1:0;let A=.62+Math.sin(time*1.6)*.025,cr=Math.sin(time*1.8)*1.4,lean=run?.1:.04,trail=false,streak=false,hand=null,cb=0;
    if(B.state==="stunned"){A=.25;cr=28;lean=-.58}else if(B.state==="spireAttack"&&k==="combo"){const p=(t%.78)/.78,n=Math.floor(t/.78);A=p<.43?lerp(.62,n%2?-2.5:-2.9,ease(p/.43)):p<.61?lerp(n%2?-2.5:-2.9,n%2?.7:1,ease((p-.43)/.18)):lerp(n%2?.7:1,.62,ease((p-.61)/.39));trail=p>.38&&p<.68;cr=8;lean=p<.43?-.1:.2;cb=10}else if(B.state==="spireAttack"&&k==="thrust"){const p=t/1.35;if(p<.4){const z=ease(p/.4);hand=[lerp(27,-4,z),lerp(20,12,z)];A=lerp(.62,-.05,z)}else if(p<.58){hand=[66,-2];A=-.02;lean=.2;streak=true}}else if(B.state==="spireAttack"&&k==="rush"){const p=(t%.68)/.68;A=p<.18?lerp(.62,-2.55,ease(p/.18)):p<.58?lerp(-2.55,.65,ease((p-.18)/.4)):lerp(.65,.62,ease((p-.58)/.42));trail=p>.16&&p<.65;lean=.3;cb=22}else if(B.state==="spireAttack"&&k==="jump"){const p=(t%.92)/.92;A=p<.68?-1.15:1.35;lean=p<.68?.12:.42;trail=p>.52&&p<.82}else if(B.state==="spireAttack"&&(k==="slashes"||k==="tele")){A=-2.45+Math.sin(t*9)*1.6;trail=true;lean=.22}else if(B.state==="spireAttack"&&(k==="sky"||k==="orbit"||k==="void"||k==="spears")){A=-1.52+Math.sin(t*5)*.06;cr=10;lean=-.08;cb=18}else if(B.state==="dead"){cr=35;lean=-.48;A=.9}
    c.save();c.translate(B.x,GROUND-B.h);c.scale(B.face*1.22,1.22);for(const g of B.spTrail){c.globalAlpha=Math.max(0,1-g.t/g.life)*.3;c.fillStyle="#650918";c.beginPath();c.ellipse((g.x-B.x)*B.face,g.y-GROUND,38,85,-.25,0,TAU);c.fill()}c.globalAlpha=1;const hip=-62+cr,sy=hip-62,w1=Math.sin(time*2.2)*4+run*14+cb,w2=Math.sin(time*1.7+1)*5+run*22+cb*1.4;poly(c,[[-6,sy+4],[14,sy+4],[14,sy+40],[10,hip+20],[-18-w1,4],[-60-w2,-8],[-50-w1,hip+10],[-34-w1*.7,sy+34],[-18,sy+8]],"#08080d",C.out,2);poly(c,[[10,hip+20],[2,hip+46],[-45-w2,-6],[-55-w2,-16]],C.crm,C.out,1.4);const gait=(o,b)=>({x:b*(1-run)+Math.sin(B.stride+o)*24*run,y:-Math.max(0,Math.cos(B.stride+o))*18*run}),leg=(hx,ft,far)=>{const q=ik(hx,hip,ft.x,ft.y,33,33,-1);limb(c,[{x:hx,y:hip},{x:q.x,y:q.y},{x:q.tx,y:q.ty}],far?13:16,C.out,far?"#0b0b10":C.md,C.lt);poly(c,[[q.x-4,q.y-8],[q.x+16,q.y-2],[q.x+4,q.y+10]],far?C.md:C.lt,C.out,1.4);poly(c,[[q.tx-9,q.ty-11],[q.tx+6,q.ty-12],[q.tx+23,q.ty+1],[q.tx-9,q.ty+1]],C.dk,C.out,1.5)};leg(-5,gait(Math.PI,-10),true);c.save();c.translate(0,hip);c.rotate(lean);c.translate(0,-hip);const S={x:5,y:sy+8},S2={x:-7,y:sy+8},Hh=hand?{x:S.x+hand[0],y:S.y+hand[1]}:{x:S.x+40*Math.cos(A*.85),y:S.y+40*Math.sin(A*.85)},Hf={x:Hh.x-Math.cos(A)*13,y:Hh.y-Math.sin(A)*13},e2=ik(S2.x,S2.y,Hf.x,Hf.y,26,26,1);limb(c,[S2,{x:e2.x,y:e2.y},{x:e2.tx,y:e2.ty}],11,C.out,"#0e0e13",C.md);poly(c,[[-17,sy+4],[18,sy+2],[14,hip+4],[-14,hip+4]],C.md,C.out,2);c.strokeStyle="rgba(175,182,194,.5)";for(let i=0;i<5;i++){const y=sy+14+i*9;c.beginPath();c.moveTo(-14,y);c.lineTo(2,y+6);c.lineTo(15,y-1);c.stroke()}poly(c,[[-22,sy+2],[20,sy-1],[27,sy+18],[16,sy+44],[3,sy+48],[-16,sy+30],[-23,sy+22]],"#0b0b10",C.out,1.8);poly(c,[[-7,sy-18],[-3,sy-26],[-10,sy-62]],C.dk,C.out,1.5);poly(c,[[-1,sy-28],[5,sy-28],[3,sy-52]],"#1d1e26",C.out,1.4);poly(c,[[6,sy-26],[11,sy-22],[12,sy-46]],C.md,C.out,1.4);poly(c,[[-9,sy-2],[-11,sy-14],[-7,sy-26],[1,sy-31],[10,sy-27],[14,sy-15],[12,sy-4],[6,sy+1]],C.md,C.out,1.9);c.fillStyle="#030305";c.fillRect(1,sy-17,13,11);c.fillStyle="#e0304a";c.shadowColor="#e0203c";c.shadowBlur=8;c.fillRect(7,sy-14,6,2);c.shadowBlur=0;if(trail){c.strokeStyle=k==="rush"?"rgba(190,20,50,.72)":"rgba(222,35,68,.65)";c.shadowColor="#a01830";c.shadowBlur=18;c.lineWidth=k==="rush"?21:14;c.beginPath();c.arc(S.x,S.y,150,-2.9,A);c.stroke();c.shadowBlur=0}if(streak){c.strokeStyle="rgba(230,238,246,.72)";c.lineWidth=11;c.beginPath();c.moveTo(Hh.x+70,Hh.y);c.lineTo(Hh.x-80,Hh.y+3);c.stroke()}c.save();c.translate(Hh.x,Hh.y);c.rotate(A);drawSpireSword(c);c.restore();poly(c,[[-6,sy+2],[-15,sy-22],[5,sy-3]],C.lt,C.out,1.4);c.fillStyle=C.md;c.beginPath();c.ellipse(3,sy+8,16,11,-.15,0,TAU);c.fill();c.stroke();const e=ik(S.x,S.y,Hh.x,Hh.y,26,26,1);limb(c,[S,{x:e.x,y:e.y},{x:e.tx,y:e.ty}],12,C.out,C.md,C.lt);c.restore();leg(6,gait(0,10),false);c.restore();
  }
  function updateBoss(dt) {
    B.flash = Math.max(0, B.flash - dt);
    if (B.ghostDelay > 0) B.ghostDelay -= dt;
    else if (B.ghost > B.hp) B.ghost = Math.max(B.hp, B.ghost - 700 * dt);
    if (P.ghostDelay > 0) P.ghostDelay -= dt;
    else if (P.ghost > P.hp) P.ghost = Math.max(P.hp, P.ghost - 260 * dt);
    else P.ghost = P.hp;
    B.moving = false;
    if (B.type === "volturus") {
      updateVolturus(dt);
      B.x = clamp(B.x, 70, WORLD - 70);
      return;
    }
    if (B.type === "wraith") {
      updateWraith(dt);
      B.x = clamp(B.x, 70, WORLD - 70);
      return;
    }
    if (B.type === "spire") {
      updateSpire(dt);
      B.x = clamp(B.x, 70, WORLD - 70);
      return;
    }
    if (B.type === "warden") {
      updateWarden(dt);
      B.x = clamp(B.x, 70, WORLD - 70);
      return;
    }
    if (B.type === "shogun") {
      updateShogun(dt);
      B.x = clamp(B.x, 60, WORLD - 60);
      return;
    }
    if (B.type === "art") {
      updateArt(dt);
      B.x = clamp(B.x, 60, WORLD - 60);
      return;
    }
    if (B.type === "demon") {
      updateDemon(dt);
      B.x = clamp(B.x, 80, WORLD - 80);
      return;
    }
    const rage = B.rage,
      spd = rage ? 130 : 96;
    switch (B.state) {
      case "intro":
        B.introFill = Math.min(1, phaseT / 1.6);
        if (!B.roared && phaseT > 0.5) {
          B.roared = true;
          sfx("roar");
          doShake(14);
          addRing(B.x, GROUND - 60, 10, 280, 0.8, "rgba(180,110,255,.8)", 6);
          petals(B.x, GROUND, 40, 420);
        }
        break;
      case "idle": {
        bossFace();
        const dx = Math.abs(bossCombatTarget().x - B.x);
        if (dx > 118 && B.cool > -5) {
          B.x += B.face * spd * dt;
          B.moving = true;
          B.stride += spd * dt * 0.06;
        }
        B.cool -= dt;
        if (B.cool <= 0 && phase === "fight" && P.state !== "dead")
          bossChoose();
        break;
      }
      case "combo": {
        const a = B.atk;
        B.pt += dt;
        const wS = a.w * (rage ? 0.86 : 1);
        if (B.phase === "wind") {
          if (B.pt < wS * 0.5) bossFace();
          if (B.pt > wS * 0.3 && Math.abs(bossCombatTarget().x - B.x) > a.stop)
            B.x += B.face * (a.lunge / (wS * 0.7)) * dt;
          if (B.pt >= wS) {
            B.phase = "act";
            B.pt = 0;
            B.hitDone = false;
            bossSlashFx(a);
          }
        } else if (B.phase === "act") {
          bossStrike(a);
          if (B.state !== "combo") break;
          if (B.pt >= a.a) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else {
          if (B.pt >= a.r * (rage ? 0.85 : 1)) {
            B.ci++;
            if (B.ci >= B.combo.atks.length) {
              B.state = "idle";
              B.cool = rnd(0.55, 1.05) * (rage ? 0.65 : 1);
            } else startBossAtk();
          }
        }
        B.x = clamp(B.x, 60, WORLD - 60);
        break;
      }
      case "kame": {
        B.pt += dt;
        const charge = rage ? 0.95 : 1.15,
          fireT = 0.36,
          rec = 0.85;
        const hx = B.x + B.face * 51,
          hy = GROUND - 51;
        if (B.phase === "charge") {
          if (B.pt < charge * 0.65) bossFace();
          if (Math.random() < 0.9) {
            const a = rnd(0, TAU),
              rr = rnd(60, 110);
            parts.push({
              k: "gather",
              sx: hx + Math.cos(a) * rr,
              sy: hy + Math.sin(a) * rr,
              tx: hx,
              ty: hy,
              life: 0.4,
              t: 0,
              x: 0,
              y: 0,
            });
          }
          if (B.pt >= charge) {
            B.phase = "fire";
            B.pt = 0;
            B.beamHit = false;
            sfx("beam");
            doShake(10);
          }
        } else if (B.phase === "fire") {
          doShake(6);
          const reach = Math.min(WORLD * 1.2, 4200 * B.pt + 40),
            f = B.face;
          const x0 = B.x + f * 40,
            x1 = x0 + f * reach;
          const lo = Math.min(x0, x1),
            hi = Math.max(x0, x1);
          if (!B.beamHit && heroType === "wizard") {
            for (const s of skeletons) {
              if (
                s.hp > 0 &&
                s.state !== "spawn" &&
                s.x + 12 > lo &&
                s.x - 12 < hi
              ) {
                damageSkeleton(s, 200);
                B.beamHit = true;
                break;
              }
            }
          }
          if (
            !B.beamHit &&
            P.x + 12 > lo &&
            P.x - 12 < hi &&
            GROUND - P.y < BEAM_H &&
            P.invuln <= 0 &&
            P.state !== "dead"
          ) {
            if (hurtPlayer(200, B.x, true)) B.beamHit = true;
          }
          if (Math.random() < 0.8)
            spark(
              x0 + f * rnd(0, Math.min(reach, 900)),
              GROUND - rnd(0, 10),
              1,
              "#d9b8ff",
              260,
              0.35,
              300,
            );
          if (B.pt >= fireT) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.pt >= rec) {
          B.state = "idle";
          B.cool = rnd(0.7, 1.2) * (rage ? 0.7 : 1);
        }
        break;
      }
      case "explode": {
        B.pt += dt;
        const charge = rage ? 1.0 : 1.2,
          burstT = 0.55,
          rec = 0.9;
        if (B.phase === "charge") {
          B.expR = 250 * Math.min(1, B.pt / charge);
          if (Math.random() < 0.8) {
            const a = rnd(0, TAU),
              rr = rnd(100, 200);
            parts.push({
              k: "gather",
              sx: B.x + Math.cos(a) * rr,
              sy: GROUND - 70 + Math.sin(a) * rr * 0.8,
              tx: B.x,
              ty: GROUND - 70,
              life: 0.45,
              t: 0,
              x: 0,
              y: 0,
            });
          }
          if (B.pt >= charge) {
            B.phase = "burst";
            B.pt = 0;
            sfx("boom");
            doShake(24);
            doFlash(0.65, "220,180,255");
            hitstop = 0.08;
            addRing(
              B.x,
              GROUND - 70,
              20,
              270,
              0.5,
              "rgba(230,200,255,.95)",
              10,
            );
            addRing(B.x, GROUND - 70, 10, 200, 0.4, "rgba(160,90,255,.8)", 14);
            spark(B.x, GROUND - 70, 60, "#e6c8ff", 800, 0.9, 200);
            petals(B.x, GROUND, 90, 700);
            dust(B.x, GROUND, 24);
            const dist = Math.hypot(P.x - B.x, P.y - 50 - (GROUND - 70));
            damageSkeletonsInRange(B.x, 250, 200);
            if (dist <= 250 && P.invuln <= 0 && P.state !== "dead")
              hurtPlayer(200, B.x, true);
          }
        } else if (B.phase === "burst") {
          if (B.pt >= burstT) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.pt >= rec) {
          B.state = "idle";
          B.cool = rnd(0.7, 1.2) * (rage ? 0.7 : 1);
        }
        break;
      }
      case "stunned":
        B.stunT -= dt;
        if (B.stunT <= 0) {
          B.state = "idle";
          B.cool = 0.5;
        }
        break;
      case "dead":
        B.dieT += dt;
        if (B.dieT > 0.8 && Math.random() < 0.9) {
          parts.push({
            k: "dot",
            x: B.x + rnd(-40, 40),
            y: GROUND - rnd(0, 140),
            vx: rnd(-20, 20),
            vy: rnd(-120, -40),
            life: rnd(0.8, 1.6),
            t: 0,
            col: "190,120,255",
            g: -20,
            drag: 0.5,
            sz: rnd(2, 5),
          });
        }
        if (B.dieT > 1 && Math.random() < 0.3) petals(B.x, GROUND - 60, 2, 200);
        break;
    }
    B.x = clamp(B.x, 60, WORLD - 60);
  }

  /* ================= FX UPDATE ================= */
  function updateFx(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += dt;
      if (p.t >= p.life) {
        parts.splice(i, 1);
        continue;
      }
      if (p.k === "gather") continue;
      p.vy += (p.g || 0) * dt;
      if (p.drag) {
        const d = Math.max(0, 1 - p.drag * dt);
        p.vx *= d;
        p.vy *= d;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.rot !== undefined) p.rot += p.vr * dt;
    }
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      f.t += dt;
      if (f.t >= f.life) fx.splice(i, 1);
    }
    for (const m of motes) {
      m.x += (m.vx + Math.sin(time * 0.6 + m.ph) * 6) * dt;
      m.y += (m.vy + Math.cos(time * 0.5 + m.ph) * 4) * dt;
      if (m.x < 0) m.x += WORLD;
      if (m.x > WORLD) m.x -= WORLD;
      if (m.y < 60) m.y = 520;
      if (m.y > 525) m.y = 70;
    }
  }

  /* ================= MAIN STEP ================= */
  function step(dt) {
    savePrev();
    if (paused) return;
    time += dt;
    impactMuteT = Math.max(0, impactMuteT - dt);
    hitstop = 0;
    if (phase === "title") {
      updateFx(dt);
      cam = clamp(P.x * 0.6 + B.x * 0.4 - W / 2, 0, WORLD - W);
      return;
    }
    phaseT += dt;
    for (const k in buf) buf[k] = Math.max(0, buf[k] - dt);
    if (gameMode !== "solo")
      for (const k in buf2) buf2[k] = Math.max(0, buf2[k] - dt);
    if (phase === "intro" && phaseT > 2.8) {
      phase = "fight";
      phaseT = 0;
      B.state = "idle";
      B.cool = 0.9;
      musicPlay(bossTrackName(bossType));
    }
    if (gameMode === "solo") {
      updatePlayer(dt);
      updateBoss(dt);
      updateSpireHazards(dt);
      updateDemonHazards(dt);
      updateShogunHazards(dt);
      updateShogunMinion(dt);
    } else {
      withPlayer(0, () => updatePlayer(dt), gameMode === "pvp");
      withPlayer(1, () => updatePlayer(dt), gameMode === "pvp");
      P = players[0];
      if (gameMode === "coop") {
        updateCoopRevive(dt);
        let target = players[0].state === "dead" ? 1 : 0;
        if (
          players[1].state !== "dead" &&
          Math.abs(players[1].x - B.x) < Math.abs(players[target].x - B.x)
        )
          target = 1;
        withPlayer(target, () => {
          updateBoss(dt);
          updateSpireHazards(dt);
          updateDemonHazards(dt);
          updateShogunHazards(dt);
          updateShogunMinion(dt);
        });
      }
    }
    updateOrbs(dt);
    updateSlashes(dt);
    updateKillWaves(dt);
    updateArrows(dt);
    updateRain(dt);
    updateRegalProjectiles(dt);
    updateWizardSystems(dt);
    updateWraithKnightBolts(dt);
    updateThorSystems(dt);
    updateFx(dt);
    let focusX = P.x * 0.62 + B.x * 0.38;
    if (gameMode === "coop")
      focusX = (players[0].x + players[1].x + B.x) / 3;
    else if (gameMode === "pvp")
      focusX = (players[0].x + players[1].x) / 2;
    const tx = clamp(focusX - W / 2, 0, WORLD - W);
    cam += (tx - cam) * Math.min(1, dt * 4);
    shake *= 0.88;
    if (shake < 0.2) shake = 0;
    screenFlash = Math.max(0, screenFlash - dt * 1.6);
    if ((phase === "lost" || phase === "won") && !B.musicCut) {
      B.musicCut = true;
      musicStop(phase === "won" ? 1.6 : 2.4);
    }
    if (phase === "lost" && phaseT > 2.0) {
      phase = "lostUI";
      showEnd(false);
      musicPlay("title");
    }
    if (phase === "won" && phaseT > 4.2) {
      phase = "wonUI";
      showEnd(true);
      sfx("win");
      musicPlay("victory");
    }
  }
  function showEnd(win) {
    $("pauseBtn").classList.add("hide");
    if (gameMode === "pvp") {
      $("endTitle").textContent = "PLAYER " + pvpWinner + " WINS";
      $("endSub").textContent =
        "Local duel complete. Four flasks each. Change champions in the multiplayer lobby for the next match.";
      $("endBtn").textContent = "Rematch";
      $("end").className = "ov win";
      return;
    }
    const art = B.type === "art",
      demon = B.type === "demon",
      shogun = B.type === "shogun",
      volturus = B.type === "volturus",
      wraith = B.type === "wraith",
      warden = B.type === "warden";
    $("endTitle").textContent = win
      ? warden
        ? "THE EMBERCROWN IS EXTINGUISHED"
        : wraith
        ? "THE WRAITH RETURNS TO DARKNESS"
        : volturus
        ? "THE STORMLORD IS SILENCED"
        : demon
        ? "THE DEMON IS SHATTERED"
        : shogun
          ? "THE SHOGUN HAS FALLEN"
        : art
          ? "ARTORIAS HAS FALLEN"
          : "THE SENTINEL HAS FALLEN"
      : "THOU HAST FALLEN";
    $("endSub").textContent = win
      ? (warden
          ? "Fire and moonlight fade from the Iridescent Warden."
          : wraith
          ? "The living abyss releases its grip on the moonlit wastes."
          : volturus
          ? "Even the reborn god of thunder has fallen."
          : demon
          ? "The ruin beneath the volcano is silent."
          : shogun
            ? "Black flame fades beneath the moon."
          : art
            ? "The Abysswalker rests at last."
            : "The lilies bloom once more in the moonlit nave.") +
        "  +200 coins earned."
      : warden
        ? "The Nightlord's twin blades claim another challenger."
        : wraith
        ? "The symbiote drinks the last of the light. Rise and fight again."
        : volturus
        ? "The heavens answer his command. Rise before the storm."
        : demon
        ? "The shattered flame consumes another challenger."
        : shogun
          ? "The moon-winged bowmaster claims another challenger."
        : art
          ? "The abyss claims another. Rise and try again."
          : "The violet moon watches. Rise and try again.";
    $("endBtn").textContent = win ? "Duel again" : "Try again";
    $("end").className = "ov " + (win ? "win" : "lose");
  }

  /* ================= SPRITE RENDERER ================= */
  const PAL_H = {
    dark: "#3b2410",
    mid: "#a8743a",
    light: "#f0c47f",
    trim: "#ffd98f",
    cloth: "#e3dac2",
    cloth2: "#b9ac8d",
    outline: "#150c06",
    leg: "#8a5a2c",
    legFar: "#5e3d1e",
    blade: "#e7dcc0",
    bladeD: "#a8926a",
    grip: "#5b3a1c",
    guard: "#c9903e",
  };
  const PAL_B = {
    dark: "#070a18",
    mid: "#1b2647",
    light: "#42568f",
    trim: "#d1a94c",
    cloak: "#43206f",
    cloakDark: "#1e0d3a",
    outline: "#03040a",
    leg: "#141c38",
    legFar: "#0b1124",
    blade: "#b06aff",
    bladeD: "#4a1aa0",
    grip: "#2a1746",
    guard: "#c9a24a",
  };

  function ik(sx, sy, tx, ty, l1, l2, dir) {
    let dx = tx - sx,
      dy = ty - sy,
      d = Math.hypot(dx, dy);
    const maxd = l1 + l2 - 0.01;
    if (d > maxd) {
      dx *= maxd / d;
      dy *= maxd / d;
      d = maxd;
      tx = sx + dx;
      ty = sy + dy;
    }
    if (d < 0.001) d = 0.001;
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d),
      h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const mx = sx + (dx * a) / d,
      my = sy + (dy * a) / d;
    return { x: mx + dir * h * (-dy / d), y: my + dir * h * (dx / d), tx, ty };
  }
  function strokePoly(c, p) {
    c.beginPath();
    c.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length; i++) c.lineTo(p[i].x, p[i].y);
    c.stroke();
  }
  function limb(c, pts, w, dark, mid, light) {
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = dark;
    c.lineWidth = w + 3;
    strokePoly(c, pts);
    c.strokeStyle = mid;
    c.lineWidth = w;
    strokePoly(c, pts);
    c.strokeStyle = light;
    c.lineWidth = w * 0.28;
    c.save();
    c.translate(-w * 0.16, -w * 0.16);
    strokePoly(c, pts);
    c.restore();
  }
  function poly(c, pts, fill, stroke, lw) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = lw || 1.4;
      c.stroke();
    }
  }
  function drawSword(c, hx, hy, A, len, p, boss, glow) {
    c.save();
    c.translate(hx, hy);
    c.rotate(A);
    c.fillStyle = p.grip;
    c.fillRect(-12, -2, 13, 4);
    c.fillStyle = p.guard;
    c.beginPath();
    c.arc(-13, 0, 3.2, 0, TAU);
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, -10);
    c.quadraticCurveTo(4, -6, 4, 0);
    c.quadraticCurveTo(4, 6, 0, 10);
    c.lineTo(-2, 7);
    c.lineTo(-2, -7);
    c.closePath();
    c.fillStyle = p.guard;
    c.fill();
    c.stroke();
    if (boss) {
      c.fillStyle = "#7d3ff0";
      c.beginPath();
      c.arc(1.5, 0, 2.2, 0, TAU);
      c.fill();
    }
    const bw = boss ? 4.8 : 3.8;
    if (glow) {
      c.shadowColor = boss ? "#b46bff" : "#ffd28a";
      c.shadowBlur = glow;
    }
    const g = c.createLinearGradient(0, -bw, 0, bw);
    g.addColorStop(0, p.bladeD);
    g.addColorStop(0.5, p.blade);
    g.addColorStop(1, p.bladeD);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(4, -bw);
    c.lineTo(len - 14, -bw);
    c.lineTo(len, 0);
    c.lineTo(len - 14, bw);
    c.lineTo(4, bw);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = p.outline;
    c.lineWidth = 1;
    c.stroke();
    c.globalAlpha *= 0.65;
    c.strokeStyle = boss ? "#ecd2ff" : "#fff4d6";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(9, 0);
    c.lineTo(len - 22, 0);
    c.stroke();
    if (boss) {
      c.globalAlpha *= 0.7;
      c.strokeStyle = "#2a0e58";
      for (let i = 0; i < 6; i++) {
        const x = 16 + i * 10;
        c.beginPath();
        c.moveTo(x, -2.4);
        c.lineTo(x + 3, 2.4);
        c.stroke();
      }
    }
    c.restore();
  }
  function drawShield(c, x, y, r, k, glowing) {
    c.save();
    c.translate(x, y);
    c.scale(lerp(0.95, 0.5, k), 1);
    const g = c.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    g.addColorStop(0, "#f2cf98");
    g.addColorStop(0.6, "#b37a3c");
    g.addColorStop(1, "#6a4220");
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, r, 0, TAU);
    c.fill();
    c.strokeStyle = "#2a170a";
    c.lineWidth = 1.8;
    c.stroke();
    c.strokeStyle = "#ffe0a0";
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(0, 0, r * 0.82, 0, TAU);
    c.stroke();
    c.strokeStyle = "#5a3616";
    c.lineWidth = 1.3;
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * TAU,
        r1 = r * 0.86,
        r2 = r * 0.96;
      c.beginPath();
      c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      c.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      c.stroke();
    }
    c.fillStyle = "#93622f";
    c.beginPath();
    c.arc(0, 0, r * 0.56, 0, TAU);
    c.fill();
    c.strokeStyle = "#ffe0a0";
    c.lineWidth = 1;
    c.stroke();
    c.strokeStyle = "#ffe6b0";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      c.beginPath();
      c.moveTo(Math.cos(a) * r * 0.22, Math.sin(a) * r * 0.22);
      c.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
      c.stroke();
    }
    c.fillStyle = "#e9b866";
    c.beginPath();
    c.arc(0, 0, r * 0.2, 0, TAU);
    c.fill();
    if (glowing) {
      const gc = typeof glowing === "string" ? glowing : "#ffd97a";
      c.strokeStyle = gc;
      c.lineWidth = 3;
      c.shadowColor = gc;
      c.shadowBlur = 16;
      c.beginPath();
      c.arc(0, 0, r * 1.1, 0, TAU);
      c.stroke();
    }
    c.restore();
  }

  function drawKnight(c, o) {
    const p = o.pal,
      boss = o.kind === "boss",
      t = o.t,
      run = o.run || 0,
      air = o.air,
      crouch = o.crouch || 0,
      lean = o.lean || 0;
    c.save();
    c.translate(o.x, o.y);
    c.scale(o.face * o.scale, o.scale);
    if (o.rot) c.rotate(o.rot);
    c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.flash) c.filter = "brightness(2.6) saturate(.35)";
    const hipY = -44 + crouch * 0.9;
    let fA, fB;
    if (air) {
      fA = { x: -7, y: -16 };
      fB = { x: 11, y: -26 };
    } else if (o.slide) {
      fA = { x: -16, y: -2 };
      fB = { x: 22, y: -1 };
    } else if (o.kneel) {
      fA = { x: -22, y: -2 };
      fB = { x: 12, y: 0 };
    } else {
      const ph = o.phase !== undefined ? o.phase : t * (o.runSpeed || 9),
        rx = 17 * run;
      fA = {
        x: -9 * (1 - run) + Math.sin(ph) * rx,
        y: -Math.max(0, Math.cos(ph)) * 10 * run,
      };
      fB = {
        x: 9 * (1 - run) + Math.sin(ph + Math.PI) * rx,
        y: -Math.max(0, Math.cos(ph + Math.PI)) * 10 * run,
      };
    }
    const drawLeg = (hx, f, far) => {
      const k = ik(hx, hipY, f.x, f.y, 23, 23, -1);
      limb(
        c,
        [
          { x: hx, y: hipY },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        11,
        p.outline,
        far ? p.legFar : p.leg,
        p.light,
      );
      c.fillStyle = p.dark;
      c.strokeStyle = p.outline;
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(k.tx + 4, k.ty - 2, 9, 4.6, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = boss ? p.trim : p.light;
      c.beginPath();
      c.arc(k.x + 2, k.y, 4.2, 0, TAU);
      c.fill();
      c.strokeStyle = p.outline;
      c.stroke();
    };
    drawLeg(-4, fA, true);
    drawLeg(4, fB, false);

    // lower cloth
    const sw = Math.sin(t * 1.7) * 1.5 + run * -6 + (o.clothSway || 0);
    if (!boss) {
      poly(
        c,
        [
          [-9, hipY - 2],
          [-6, hipY - 2],
          [-13 + sw, hipY + 30],
          [-18 + sw, hipY + 34],
        ],
        p.cloth2,
        p.outline,
        1,
      );
      poly(
        c,
        [
          [-7, hipY - 3],
          [12, hipY - 3],
          [15 + sw, hipY + 34],
          [-5 + sw, hipY + 38],
        ],
        p.cloth,
        p.outline,
        1.2,
      );
      c.strokeStyle = p.trim;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(3, hipY);
      c.lineTo(5 + sw, hipY + 36);
      c.stroke();
      c.strokeStyle = "rgba(150,120,70,.6)";
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(-3, hipY + 2);
      c.lineTo(-2 + sw, hipY + 34);
      c.moveTo(9, hipY + 2);
      c.lineTo(11 + sw, hipY + 34);
      c.stroke();
    } else {
      poly(
        c,
        [
          [-8, hipY - 3],
          [11, hipY - 3],
          [13 + sw, hipY + 30],
          [8 + sw, hipY + 27],
          [3 + sw, hipY + 33],
          [-3 + sw, hipY + 27],
          [-8 + sw, hipY + 32],
        ],
        p.cloak,
        p.outline,
        1.2,
      );
      c.fillStyle = "rgba(0,0,0,.35)";
      for (let i = 0; i < 5; i++)
        for (let j = 0; j < 3; j++) {
          c.beginPath();
          c.arc(-5 + i * 4, hipY - 1 + j * 5, 0.9, 0, TAU);
          c.fill();
        }
    }

    // upper body
    c.save();
    c.translate(0, crouch);
    c.translate(0, -44);
    c.rotate(lean);
    c.translate(0, 44);

    if (boss) {
      const w1 = Math.sin(t * 3) * 3 + run * 9 + (o.capeBack || 0),
        w2 = Math.sin(t * 3 + 1) * 4 + run * 12 + (o.capeBack || 0) * 1.4;
      poly(
        c,
        [
          [-4, -85],
          [-15, -72],
          [-21 - w1, -46],
          [-27 - w2, -8],
          [-22 - w2, -1],
          [-18 - w1, -9],
          [-13 - w2 * 0.7, 0],
          [-8 - w1 * 0.5, -8],
          [-3, -2],
          [1, -44],
        ],
        p.cloak,
        p.outline,
        1.4,
      );
      poly(
        c,
        [
          [-4, -80],
          [-12, -66],
          [-16 - w1 * 0.8, -40],
          [-20 - w2 * 0.8, -14],
          [-8, -10],
          [-2, -44],
        ],
        p.cloakDark,
        null,
      );
      // far arm (off hand) rests behind body
      if (!o.offTarget) {
        const S = { x: -5, y: -78 },
          tgt = { x: -8 + Math.sin(t * 2) * 0.6, y: -52 };
        const e = ik(S.x, S.y, tgt.x, tgt.y, 17, 17, 1);
        limb(
          c,
          [S, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
          9.5,
          p.outline,
          p.mid,
          p.light,
        );
        c.fillStyle = p.dark;
        c.beginPath();
        c.arc(e.tx, e.ty, 4.6, 0, TAU);
        c.fill();
      }
    }
    if (!boss && o.shieldK === -1) drawShield(c, -12, -60, 19, 0, false);

    // torso
    const tg = c.createLinearGradient(-12, 0, 14, 0);
    tg.addColorStop(0, p.dark);
    tg.addColorStop(0.5, p.mid);
    tg.addColorStop(1, p.light);
    c.beginPath();
    c.moveTo(-10, -80);
    c.quadraticCurveTo(1, -89, 11, -80);
    c.quadraticCurveTo(16, -64, 10, -46);
    c.lineTo(-9, -46);
    c.quadraticCurveTo(-14, -64, -10, -80);
    c.closePath();
    c.fillStyle = tg;
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.5;
    c.stroke();
    c.strokeStyle = "rgba(0,0,0,.35)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-9, -70);
    c.quadraticCurveTo(2, -66, 12, -70);
    c.moveTo(-9, -58);
    c.quadraticCurveTo(2, -55, 11, -58);
    c.stroke();
    if (boss) {
      c.fillStyle = p.trim;
      c.beginPath();
      c.arc(6, -71, 4.6, 0, TAU);
      c.fill();
      c.strokeStyle = p.outline;
      c.lineWidth = 1;
      c.stroke();
      c.fillStyle = "#b877ff";
      c.beginPath();
      c.arc(6, -71, 2.6, 0, TAU);
      c.fill();
      c.fillStyle = p.trim;
      for (let i = 0; i < 5; i++) {
        c.beginPath();
        c.arc(-5 + i * 3.8, -62, 0.9, 0, TAU);
        c.fill();
      }
    } else {
      c.strokeStyle = p.trim;
      c.lineWidth = 1.3;
      c.beginPath();
      c.arc(5, -66, 4.5, 0, TAU);
      c.moveTo(1, -66);
      c.lineTo(9, -66);
      c.moveTo(5, -70.5);
      c.lineTo(5, -61.5);
      c.stroke();
      c.strokeStyle = "rgba(255,217,143,.55)";
      c.beginPath();
      c.moveTo(-7, -76);
      c.quadraticCurveTo(0, -72, 9, -76);
      c.stroke();
    }
    // belt
    c.fillStyle = boss ? "#1a1030" : p.dark;
    c.fillRect(-10, -50, 21, 5.5);
    c.strokeStyle = p.outline;
    c.lineWidth = 1;
    c.strokeRect(-10, -50, 21, 5.5);
    c.fillStyle = p.trim;
    c.beginPath();
    c.arc(1, -47.3, 3.4, 0, TAU);
    c.fill();
    c.stroke();

    // neck + head
    c.fillStyle = p.dark;
    c.fillRect(-2, -87, 7, 8);
    if (!boss) {
      c.strokeStyle = p.trim;
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(0, -105, 14, Math.PI * 1.02, Math.PI * 1.98);
      c.stroke();
      for (let i = 0; i < 7; i++) {
        const a = Math.PI * 1.08 + i * ((0.82 * Math.PI) / 6);
        c.beginPath();
        c.moveTo(Math.cos(a) * 14, -105 + Math.sin(a) * 14);
        c.lineTo(Math.cos(a) * 19.5, -105 + Math.sin(a) * 19.5);
        c.stroke();
      }
      const hg = c.createLinearGradient(-9, -110, 13, -84);
      hg.addColorStop(0, p.light);
      hg.addColorStop(0.55, p.mid);
      hg.addColorStop(1, p.dark);
      c.beginPath();
      c.moveTo(-9, -87);
      c.quadraticCurveTo(-11, -107, 2, -109);
      c.quadraticCurveTo(14, -107, 14, -93);
      c.lineTo(12, -84);
      c.lineTo(-6, -84);
      c.closePath();
      c.fillStyle = hg;
      c.fill();
      c.strokeStyle = p.outline;
      c.lineWidth = 1.5;
      c.stroke();
      c.fillStyle = "#0a0705";
      c.fillRect(3, -96, 11, 2.8);
      c.fillStyle = "rgba(0,0,0,.6)";
      for (let i = 0; i < 3; i++) c.fillRect(6 + i * 2.6, -91, 1.2, 4);
      c.strokeStyle = p.trim;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-8, -100);
      c.quadraticCurveTo(3, -102, 14, -98);
      c.stroke();
      c.strokeStyle = p.light;
      c.beginPath();
      c.moveTo(-6, -105);
      c.quadraticCurveTo(2, -109, 10, -106);
      c.stroke();
    } else {
      poly(
        c,
        [
          [-13, -78],
          [-14, -104],
          [-2, -115],
          [10, -114],
          [15, -98],
          [10, -88],
          [-2, -82],
        ],
        p.cloakDark,
        p.outline,
        1.5,
      );
      poly(
        c,
        [
          [-11, -80],
          [-11, -102],
          [-3, -111],
          [4, -108],
          [-2, -90],
        ],
        "#2b1352",
        null,
      );
      poly(
        c,
        [
          [3, -104],
          [12, -105],
          [21, -96],
          [23, -89],
          [14, -88],
          [5, -88],
        ],
        "#080b1a",
        p.outline,
        1.2,
      );
      c.fillStyle = "#e0b3ff";
      c.shadowColor = "#c07bff";
      c.shadowBlur = 9;
      c.beginPath();
      c.ellipse(9.5, -98, 2.8, 1.5, -0.15, 0, TAU);
      c.fill();
      c.beginPath();
      c.ellipse(15, -96.5, 2.2, 1.2, -0.15, 0, TAU);
      c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = p.trim;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-12, -84);
      c.quadraticCurveTo(0, -80, 11, -87);
      c.stroke();
    }
    // pauldron
    const pr = boss ? 13 : 10.5,
      pg = c.createRadialGradient(-2, -83, 1, 2, -78, pr + 2);
    pg.addColorStop(0, p.light);
    pg.addColorStop(0.7, p.mid);
    pg.addColorStop(1, p.dark);
    c.fillStyle = pg;
    c.beginPath();
    c.arc(1, -78, pr, 0, TAU);
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.5;
    c.stroke();
    c.strokeStyle = p.trim;
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(1, -78, pr - 3, 0.3, 2.6);
    c.stroke();
    if (boss) {
      c.fillStyle = p.trim;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        c.beginPath();
        c.arc(
          1 + Math.cos(a) * (pr - 1.6),
          -78 + Math.sin(a) * (pr - 1.6),
          0.9,
          0,
          TAU,
        );
        c.fill();
      }
    }

    // shield (hero)
    if (!boss && o.shieldK !== -1) {
      const k = o.shieldK || 0;
      drawShield(
        c,
        lerp(11, 27, k),
        lerp(-58, -68, k),
        lerp(19, 22, k),
        k,
        o.shieldGlow,
      );
    }
    // off-hand arm (front)
    if (o.offTarget) {
      const S = { x: 2, y: -78 },
        e = ik(S.x, S.y, o.offTarget.x, o.offTarget.y, 17, 17, 1);
      limb(
        c,
        [S, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
        9.5,
        p.outline,
        p.mid,
        p.light,
      );
      c.fillStyle = p.dark;
      c.beginPath();
      c.arc(e.tx, e.ty, 5, 0, TAU);
      c.fill();
      c.strokeStyle = p.trim;
      c.lineWidth = 1;
      c.stroke();
    }
    if (o.drink > 0) {
      const fx0 = 16,
        fy0 = -92;
      c.save();
      c.translate(fx0, fy0);
      c.rotate(-0.9 * Math.min(1, o.drink));
      c.fillStyle = "#8bf07a";
      c.strokeStyle = p.outline;
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(0, 4, 5, 6, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = "#d9d0b8";
      c.fillRect(-2, -5, 4, 5);
      c.strokeRect(-2, -5, 4, 5);
      c.fillStyle = "#7a4a22";
      c.fillRect(-2.6, -8, 5.2, 3.4);
      c.restore();
    }
    // sword arm + sword
    const S = { x: 3, y: -79 },
      R = o.handR === undefined ? 28 : o.handR,
      A = o.swordA;
    const hand = { x: S.x + Math.cos(A) * R, y: S.y + Math.sin(A) * R };
    const el = ik(S.x, S.y, hand.x, hand.y, 17, 17, 1);
    limb(
      c,
      [S, { x: el.x, y: el.y }, { x: el.tx, y: el.ty }],
      9.5,
      p.outline,
      p.mid,
      p.light,
    );
    drawSword(c, el.tx, el.ty, A, boss ? 86 : 64, p, boss, o.glow || 0);
    c.fillStyle = p.dark;
    c.strokeStyle = p.trim;
    c.lineWidth = 1;
    c.beginPath();
    c.arc(el.tx, el.ty, 5, 0, TAU);
    c.fill();
    c.stroke();
    c.restore();
    c.restore();
  }

  function heroObj() {
    const air = P.y < GROUND - 3;
    const o = {
      kind: "hero",
      pal: PAL_H,
      scale: 1.05,
      x: P.x,
      y: P.y,
      face: P.face,
      t: time,
      run: 0,
      air,
      swordA: 1.3,
      handR: 28,
      crouch: 0,
      lean: 0,
      shieldK: 0,
      flash: P.flash > 0,
      alpha: 1,
      glow: 0,
      runSpeed: 10,
      clothSway: 0,
      phase: P.stride,
    };
    o.run = P.state === "free" && !air ? Math.min(1, Math.abs(P.vx) / 240) : 0;
    o.swordA = 1.3 + Math.sin(time * 2) * 0.03 - o.run * 0.35;
    o.lean = o.run * 0.09;
    o.crouch = P.state === "free" && !air ? 9 * (P.landT / 0.14) : 0;
    switch (P.state) {
      case "attack": {
        const A = ATK[P.combo],
          t = P.t;
        let a;
        if (t < A.w) a = lerp(1.3, A.a0, easeOut(t / A.w));
        else if (t < A.w + A.a) {
          const k = (t - A.w) / A.a;
          a = lerp(A.a0, A.a1, ease(k));
          o.lean = 0.16 * ease(k);
          if (A.thrust) o.handR = lerp(12, 38, k);
          o.glow = 14;
        } else {
          const k = Math.min(1, (t - A.w - A.a) / A.r);
          a = lerp(A.a1, 1.3, k * k);
          o.lean = 0.16 * (1 - k);
          if (A.thrust) o.handR = lerp(38, 28, k);
        }
        o.swordA = a;
        o.run = 0;
        break;
      }
      case "dodge":
        o.slide = true;
        o.crouch = 22;
        o.lean = 0.6;
        o.swordA = 2.7;
        o.run = 0;
        o.air = false;
        break;
      case "parry":
        o.shieldK = Math.min(1, P.t / 0.07);
        o.swordA = 2.3;
        o.lean = 0.06;
        o.shieldGlow = (P.t < PARRY_WIN && !P.parrySucc) || P.parryFlash > 0;
        o.run = 0;
        break;
      case "hurt":
        o.lean = -0.28;
        o.swordA = 1.9;
        o.run = 0;
        break;
      case "airdash":
        o.air = true;
        o.lean = 0.55;
        o.swordA = 2.6;
        o.run = 0;
        o.clothSway = -8;
        break;
      case "block":
        o.shieldK = 0.8;
        o.swordA = 2.2;
        o.lean = 0.04;
        o.crouch = 4;
        o.run = Math.min(1, Math.abs(P.vx) / 120) * 0.5;
        o.shieldGlow = P.blockFlash > 0 ? "#bfe0ff" : false;
        break;
      case "heal":
        o.drink = Math.min(1, P.t / 0.5);
        o.crouch = 5;
        o.lean = 0.1;
        o.shieldK = -1;
        o.offTarget = { x: 14, y: -88 };
        o.swordA = 1.55;
        o.run = 0;
        break;
      case "skill1": {
        const k = clamp(P.t / 0.3, 0, 1);
        o.swordA =
          k < 0.33
            ? lerp(1.3, -2.1, easeOut(k / 0.33))
            : k < 0.5
              ? lerp(-2.1, 0.9, (k - 0.33) / 0.17)
              : lerp(0.9, 1.3, (k - 0.5) / 0.5);
        o.lean = 0.1 * Math.sin(k * Math.PI);
        o.glow = k < 0.5 ? 16 : 0;
        o.run = 0;
        break;
      }
      case "skill2": {
        const chargeT = 0.55,
          k = Math.min(1, P.t / chargeT);
        if (P.t < chargeT) {
          o.crouch = 6 * k;
          o.lean = -0.08 * k;
          o.swordA = lerp(1.3, 1.05, k);
          o.shieldK = -1;
          o.offTarget = { x: lerp(6, -8, k), y: lerp(-70, -56, k) };
          o.glow = 4 + 14 * k;
        } else {
          const k2 = Math.min(1, (P.t - chargeT) / 0.27);
          o.lean = 0.28 * (1 - k2);
          o.swordA = lerp(-0.3, 1.3, k2);
          o.offTarget = { x: 10, y: -60 };
          o.glow = 18 * (1 - k2);
        }
        o.run = 0;
        break;
      }
      case "plunge":
        o.swordA = 1.5;
        o.lean = 0.12;
        o.handR = 30;
        o.air = true;
        break;
      case "dead":
        o.rot = -Math.min(1.5, P.deadT * 3.5);
        o.run = 0;
        o.alpha = clamp(1 - (P.deadT - 1) * 0.8, 0.25, 1);
        break;
      case "free":
        if (air) {
          o.swordA = 1.1;
          o.lean = 0.05;
        }
        break;
    }
    return o;
  }
  function bossObj() {
    const o = {
      kind: "boss",
      pal: PAL_B,
      scale: 1.42,
      x: B.x,
      y: B.y,
      face: B.face,
      t: time,
      run: B.moving ? 0.5 : 0,
      air: false,
      swordA: 1.35 + Math.sin(time * 1.6) * 0.03,
      handR: 28,
      crouch: 0,
      lean: 0,
      flash: B.flash > 0,
      alpha: 1,
      glow: B.rage ? 10 : 3,
      runSpeed: 7,
      phase: B.stride,
    };
    if (B.moving) o.runSpeed = B.rage ? 9 : 7;
    switch (B.state) {
      case "intro": {
        const k =
          clamp((phaseT - 0.4) / 0.5, 0, 1) *
          (1 - clamp((phaseT - 1.9) / 0.6, 0, 1));
        o.swordA = lerp(1.5, -1.9, k);
        o.lean = -0.2 * k;
        o.offTarget =
          k > 0.05 ? { x: lerp(-8, 20, k), y: lerp(-52, -118, k) } : null;
        o.capeBack = 8 * k;
        o.glow = 8 + 14 * k;
        break;
      }
      case "combo": {
        const a = B.atk,
          K = BK[a.type],
          wS = a.w * (B.rage ? 0.86 : 1);
        let ang;
        if (B.phase === "wind") {
          const k = Math.min(1, B.pt / wS);
          ang = lerp(1.35, K.aw, easeOut(k));
          o.lean = K.wl * k;
          o.handR = lerp(28, K.rw, k);
          o.glow = 6 + k * 10;
          o.capeBack = 5 * k;
        } else if (B.phase === "act") {
          const k = Math.min(1, B.pt / a.a);
          ang = lerp(K.aw, K.a1, ease(k));
          o.lean = lerp(K.wl, K.sl, k);
          o.handR = lerp(K.rw, K.rs, k);
          o.glow = 22;
          o.capeBack = 10;
        } else {
          const k = Math.min(1, B.pt / a.r);
          ang = lerp(K.a1, 1.35, k * k);
          o.lean = K.sl * (1 - k);
          o.handR = lerp(K.rs, 28, k);
        }
        o.swordA = ang;
        o.run = 0;
        break;
      }
      case "kame": {
        const charge = B.rage ? 0.95 : 1.15,
          k = B.phase === "charge" ? B.pt / charge : 1;
        o.crouch = 26 * Math.min(1, k * 1.6);
        o.lean = B.phase === "fire" ? 0.28 : lerp(-0.1, 0.12, k);
        o.swordA = 1.55;
        o.handR = 28;
        o.offTarget = { x: 36, y: -62 + o.crouch * 0 };
        o.glow = 8 + 10 * k;
        o.capeBack = 8 + 8 * k;
        o.run = 0;
        break;
      }
      case "explode": {
        const charge = B.rage ? 1.0 : 1.2;
        if (B.phase === "charge") {
          const k = B.pt / charge;
          o.swordA = lerp(1.35, -1.75, easeOut(Math.min(1, k * 2)));
          o.offTarget = {
            x: lerp(-8, 8, k),
            y: lerp(-52, -126, easeOut(Math.min(1, k * 2))),
          };
          o.crouch = 8 * k;
          o.lean = -0.12;
          o.glow = 8 + 16 * k;
          o.capeBack = 10 * k;
          o.shakeX = Math.sin(time * 70) * 1.2 * k;
        } else {
          const k = Math.min(1, B.pt / 0.5);
          o.swordA = lerp(-1.75, 0.5, easeOut(Math.min(1, k * 4)));
          o.offTarget = { x: -14, y: -80 };
          o.lean = 0.25 * (1 - k);
          o.glow = 20;
          o.capeBack = 14;
        }
        o.run = 0;
        break;
      }
      case "stunned":
        o.kneel = true;
        o.crouch = 26;
        o.lean = 0.32;
        o.swordA = 1.75;
        o.handR = 26;
        o.glow = 0;
        o.run = 0;
        o.shakeX = Math.sin(time * 40) * 0.8;
        break;
      case "dead": {
        const k = Math.min(1, B.dieT / 1.2);
        o.kneel = k < 1;
        o.crouch = 26 * Math.min(1, k * 3);
        o.lean = 0.32 + k * 0.3;
        o.swordA = 1.75;
        o.glow = 0;
        o.run = 0;
        o.alpha = clamp(1 - (B.dieT - 1.2) / 2.4, 0, 1);
        if (B.dieT > 1.2) o.flash = Math.floor(time * 20) % 2 === 0;
        break;
      }
    }
    if (o.shakeX) o.x += o.shakeX;
    return o;
  }

  /* ================= ARTORIAS (boss 2) ================= */
  const PAL_A = {
    dark: "#2a2d3a",
    mid: "#7d8395",
    light: "#cfd3e0",
    trim: "#a9b0c6",
    outline: "#090a11",
    leg: "#6a7081",
    legFar: "#43485a",
    cloak: "#2b58cf",
    cloakDark: "#173080",
    hair: "#121716",
    belt: "#7a4a2a",
    gold: "#c9a45a",
  };
  const RECT_A = {
    sweep: { x0: 8, x1: 215, h0: 0, h1: 65 },
    over: { x0: 8, x1: 190, h0: 0, h1: 170 },
    rise: { x0: -10, x1: 195, h0: 0, h1: 170 },
  };
  const STOP_A = { sweep: 120, over: 112, rise: 112 };
  const mkAA = (type, w, a, r, lunge) => ({
    type,
    w,
    a,
    r,
    lunge,
    rect: RECT_A[type],
    stop: STOP_A[type],
    dmg: 100,
  });
  const COMBOS_A = [
    {
      name: "Twin Swing",
      atks: [
        mkAA("over", 0.6, 0.13, 0.3, 80),
        mkAA("sweep", 0.46, 0.13, 0.95, 70),
      ],
    },
    {
      name: "Cross Swing",
      atks: [
        mkAA("sweep", 0.55, 0.13, 0.28, 80),
        mkAA("rise", 0.48, 0.13, 0.95, 60),
      ],
    },
    {
      name: "Triple Swing",
      atks: [
        mkAA("sweep", 0.52, 0.13, 0.26, 70),
        mkAA("over", 0.4, 0.13, 0.28, 70),
        mkAA("rise", 0.56, 0.13, 1.0, 60),
      ],
    },
    {
      name: "Abyss Triple",
      atks: [
        mkAA("over", 0.58, 0.13, 0.3, 80),
        mkAA("rise", 0.36, 0.13, 0.26, 60),
        mkAA("sweep", 0.66, 0.13, 1.05, 80),
      ],
    },
  ];
  // Phase 2 (below half health) raises every Artorias damage number by 40%.
  function bd(base) {
    return Math.round(
      base *
        (B.type === "art" && B.rage
          ? 1.4
          : B.type === "demon" && B.dphase === 3
            ? 1.3
            : B.type === "shogun" && B.sphase === 2
              ? 1.2
              : 1),
    );
  }
  function cropFrac(img, fx, fy, fw, fh, x, y, s) {
    if (img.complete && img.naturalWidth) {
      const w = img.naturalWidth,
        h = img.naturalHeight;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, fx * w, fy * h, fw * w, fh * h, x, y, s, s);
      ctx.imageSmoothingEnabled = true;
    } else {
      ctx.fillStyle = "#221a2a";
      ctx.fillRect(x, y, s, s);
    }
  }
  function artChoose() {
    const d = Math.abs(bossCombatTarget().x - B.x),
      r = Math.random();
    let pick;
    if (d > 420)
      pick =
        r < 0.35 ? "rush" : r < 0.65 ? "jump" : r < 0.8 ? "explode" : "walk";
    else if (d > 190)
      pick =
        r < 0.3 ? "combo" : r < 0.55 ? "jump" : r < 0.78 ? "rush" : "explode";
    else
      pick =
        r < 0.48 ? "combo" : r < 0.68 ? "explode" : r < 0.84 ? "jump" : "rush";
    if (pick === B.last && pick !== "walk" && Math.random() < 0.7)
      pick = pick === "combo" ? (d > 300 ? "jump" : "explode") : "combo";
    B.last = pick;
    if (pick === "walk") {
      B.cool = rnd(0.3, 0.6);
      return;
    }
    if (pick === "combo") {
      const three = Math.random() < 0.5;
      let i;
      do {
        i = (three ? 2 : 0) + Math.floor(Math.random() * 2);
      } while (i === B.lastCombo);
      B.lastCombo = i;
      B.combo = COMBOS_A[i];
      B.ci = 0;
      B.state = "combo";
      startBossAtk();
    } else if (pick === "jump") {
      B.state = "jump";
      B.phase = "crouch";
      B.pt = 0;
      B.jn = Math.random() < 0.45 ? 2 : 1;
      B.jfirst = true;
      B.h = 0;
    } else if (pick === "rush") {
      B.state = "rush";
      B.phase = "wind";
      B.pt = 0;
      B.rn = Math.random() < 0.5 ? 2 : 1;
      B.rfirst = true;
    } else {
      B.state = "explode";
      B.phase = "charge";
      B.pt = 0;
      B.expR = 0;
      sfx("charge");
    }
  }
  function artSlam() {
    sfx("boom");
    doShake(15);
    dust(B.x, GROUND, 14);
    petals(B.x, GROUND, 24, 420);
    addRing(B.x, GROUND - 4, 10, 190, 0.4, "rgba(160,200,255,.9)", 7);
    spark(B.x + B.face * 100, GROUND - 10, 20, "#bcd8ff", 500, 0.5);
    const f = B.face,
      lo = Math.min(B.x - f * 40, B.x + f * 205),
      hi = Math.max(B.x - f * 40, B.x + f * 205);
    if (heroType === "wizard") {
      for (const s of skeletons)
        if (s.hp > 0 && s.x + 14 > lo && s.x - 14 < hi)
          damageSkeleton(s, bd(200));
    }
    if (
      P.x + 15 > lo &&
      P.x - 15 < hi &&
      GROUND - P.y < 170 &&
      P.invuln <= 0 &&
      P.state !== "dead"
    )
      hurtPlayer(bd(200), B.x, true);
  }
  function artBlast() {
    sfx("boom");
    doShake(24);
    doFlash(0.65, "190,215,255");
    hitstop = 0.08;
    addRing(B.x, GROUND - 70, 20, 270, 0.5, "rgba(210,230,255,.95)", 10);
    addRing(B.x, GROUND - 70, 10, 200, 0.4, "rgba(90,140,255,.8)", 14);
    spark(B.x, GROUND - 70, 60, "#cfe2ff", 800, 0.9, 200);
    petals(B.x, GROUND, 90, 700);
    dust(B.x, GROUND, 24);
    const dist = Math.hypot(P.x - B.x, P.y - 50 - (GROUND - 70));
    damageSkeletonsInRange(B.x, 250, bd(300));
    if (dist <= 250 && P.invuln <= 0 && P.state !== "dead")
      hurtPlayer(bd(300), B.x, true);
    // small energy balls flying off in different directions (50 damage each)
    const n = B.rage ? 18 : 14;
    for (let i = 0; i < n; i++) {
      let o;
      if (i < 4) {
        const dir = i % 2 ? 1 : -1;
        o = {
          x: B.x,
          y: GROUND - 26 - (i > 1 ? 24 : 0),
          vx: dir * rnd(430, 540),
          vy: 0,
          g: 0,
        };
      } else {
        const a = -rnd(0.12, Math.PI - 0.12),
          s = rnd(300, 620);
        o = {
          x: B.x,
          y: GROUND - 70,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          g: 800,
        };
      }
      o.r = 12;
      o.life = 4;
      o.t = 0;
      o.dmg = bd(50);
      orbs.push(o);
    }
  }
  function updateArtCombo(dt) {
    const a = B.atk,
      rage = B.rage;
    B.pt += dt;
    const wS = a.w * (rage ? 0.86 : 1);
    if (B.phase === "wind") {
      if (B.pt < wS * 0.5) bossFace();
      if (B.pt > wS * 0.3 && Math.abs(bossCombatTarget().x - B.x) > a.stop)
        B.x += B.face * (a.lunge / (wS * 0.7)) * dt;
      if (B.pt >= wS) {
        B.phase = "act";
        B.pt = 0;
        B.hitDone = false;
        bossSlashFx(a);
      }
    } else if (B.phase === "act") {
      bossStrike(a);
      if (B.state !== "combo") return;
      if (B.pt >= a.a) {
        B.phase = "rec";
        B.pt = 0;
      }
    } else if (B.pt >= a.r * (rage ? 0.85 : 1)) {
      B.ci++;
      if (B.ci >= B.combo.atks.length) {
        B.state = "idle";
        B.cool = rnd(0.5, 0.95) * (rage ? 0.65 : 1);
      } else startBossAtk();
    }
  }
  function updateArt(dt) {
    const rage = B.rage,
      spd = rage ? 150 : 112;
    if (rage && B.state !== "dead" && Math.random() < 0.5)
      parts.push({
        k: "dot",
        x: B.x + rnd(-30, 30),
        y: GROUND - B.h - rnd(0, 150),
        vx: rnd(-15, 15),
        vy: rnd(-90, -30),
        life: rnd(0.5, 1),
        t: 0,
        col: "130,180,255",
        g: 0,
        drag: 1,
        sz: rnd(2, 4),
      });
    switch (B.state) {
      case "intro":
        B.introFill = Math.min(1, phaseT / 1.6);
        if (!B.roared && phaseT > 0.5) {
          B.roared = true;
          sfx("roar");
          doShake(14);
          addRing(B.x, GROUND - 60, 10, 280, 0.8, "rgba(140,190,255,.8)", 6);
          petals(B.x, GROUND, 40, 420);
        }
        break;
      case "idle":
        bossFace();
        if (Math.abs(bossCombatTarget().x - B.x) > 130) {
          B.x += B.face * spd * dt;
          B.moving = true;
          B.stride += spd * dt * 0.06;
        }
        B.cool -= dt;
        if (B.cool <= 0 && phase === "fight" && P.state !== "dead") artChoose();
        break;
      case "combo":
        updateArtCombo(dt);
        break;
      case "jump": {
        // Lion's Claw style leap-and-slam, once or twice in a row
        B.pt += dt;
        const durC = B.jfirst ? (rage ? 0.45 : 0.55) : 0.26;
        if (B.phase === "crouch") {
          if (B.pt < durC * 0.75) bossFace();
          if (B.pt >= durC) {
            B.phase = "air";
            B.pt = 0;
            B.jx0 = B.x;
            B.jx1 = clamp(bossCombatTarget().x - B.face * 75, 80, WORLD - 80);
            sfx("roar");
            dust(B.x, GROUND, 10);
          }
        } else if (B.phase === "air") {
          const T = rage ? 0.52 : 0.62,
            k = Math.min(1, B.pt / T);
          B.x = lerp(B.jx0, B.jx1, k);
          B.h = 4 * 240 * k * (1 - k);
          if (k >= 1) {
            B.phase = "slam";
            B.pt = 0;
            B.h = 0;
            artSlam();
          }
        } else if (B.phase === "slam") {
          if (B.pt >= 0.22) {
            B.jn--;
            B.jfirst = false;
            if (B.jn > 0) {
              B.phase = "crouch";
              B.pt = 0;
            } else {
              B.phase = "rec";
              B.pt = 0;
            }
          }
        } else if (B.pt >= (rage ? 0.65 : 0.85)) {
          B.state = "idle";
          B.cool = rnd(0.6, 1.1) * (rage ? 0.65 : 1);
          B.h = 0;
        }
        break;
      }
      case "rush": {
        // sword-first charge, once or twice in a row
        B.pt += dt;
        const windT = B.rfirst ? (rage ? 0.42 : 0.55) : 0.24;
        if (B.phase === "wind") {
          if (B.pt < windT * 0.8) bossFace();
          if (B.pt >= windT) {
            B.phase = "dash";
            B.pt = 0;
            B.hitDone = false;
            B.rdir = B.face;
            B.rdist = Math.max(420, Math.abs(bossCombatTarget().x - B.x) + 160);
            B.rmoved = 0;
            sfx("bswing");
            doShake(6);
          }
        } else if (B.phase === "dash") {
          const stepD = 1250 * dt;
          B.x += B.rdir * stepD;
          B.rmoved += stepD;
          parts.push({
            k: "dot",
            x: B.x,
            y: GROUND - rnd(20, 140),
            vx: 0,
            vy: 0,
            life: 0.3,
            t: 0,
            col: "150,195,255",
            g: 0,
            drag: 1,
            sz: rnd(6, 12),
          });
          if (!B.hitDone && P.state !== "dead") {
            const lo = Math.min(B.x - B.rdir * 20, B.x + B.rdir * 165),
              hi = Math.max(B.x - B.rdir * 20, B.x + B.rdir * 165);
            if (heroType === "wizard") {
              for (const s of skeletons) {
                if (s.hp > 0 && s.x + 14 > lo && s.x - 14 < hi) {
                  damageSkeleton(s, bd(150));
                  B.hitDone = true;
                  break;
                }
              }
            }
            const pb = GROUND - P.y;
            if (
              !B.hitDone &&
              P.x + 15 > lo &&
              P.x - 15 < hi &&
              pb < 112 &&
              P.invuln <= 0
            ) {
              if (hurtPlayer(bd(150), B.x, true)) B.hitDone = true;
            }
          }
          if (
            B.rmoved >= B.rdist ||
            B.pt > 0.5 ||
            B.x <= 70 ||
            B.x >= WORLD - 70
          ) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else {
          const recT = B.rn > 1 ? 0.12 : 0.8;
          if (B.pt >= recT) {
            B.rn--;
            B.rfirst = false;
            if (B.rn > 0) {
              B.phase = "wind";
              B.pt = 0;
            } else {
              B.state = "idle";
              B.cool = rnd(0.6, 1.1) * (rage ? 0.65 : 1);
            }
          }
        }
        break;
      }
      case "explode": {
        // blast (300) followed by energy balls (50 each)
        B.pt += dt;
        const charge = rage ? 0.95 : 1.15,
          burstT = 0.5,
          rec = 0.9;
        if (B.phase === "charge") {
          B.expR = 250 * Math.min(1, B.pt / charge);
          if (Math.random() < 0.8) {
            const a = rnd(0, TAU),
              rr = rnd(100, 200);
            parts.push({
              k: "gather",
              sx: B.x + Math.cos(a) * rr,
              sy: GROUND - 70 + Math.sin(a) * rr * 0.8,
              tx: B.x,
              ty: GROUND - 70,
              life: 0.45,
              t: 0,
              x: 0,
              y: 0,
              gc: "170,205,255",
            });
          }
          if (B.pt >= charge) {
            B.phase = "burst";
            B.pt = 0;
            artBlast();
          }
        } else if (B.phase === "burst") {
          if (B.pt >= burstT) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.pt >= rec) {
          B.state = "idle";
          B.cool = rnd(0.7, 1.2) * (rage ? 0.65 : 1);
        }
        break;
      }
      case "stunned":
        B.stunT -= dt;
        if (B.stunT <= 0) {
          B.state = "idle";
          B.cool = 0.5;
        }
        break;
      case "dead":
        B.dieT += dt;
        if (B.dieT > 0.8 && Math.random() < 0.9)
          parts.push({
            k: "dot",
            x: B.x + rnd(-40, 40),
            y: GROUND - rnd(0, 150),
            vx: rnd(-20, 20),
            vy: rnd(-120, -40),
            life: rnd(0.8, 1.6),
            t: 0,
            col: "150,195,255",
            g: -20,
            drag: 0.5,
            sz: rnd(2, 5),
          });
        if (B.dieT > 1 && Math.random() < 0.3) petals(B.x, GROUND - 60, 2, 200);
        break;
    }
  }
  /* ================= VOLTURUS, THE STORMLORD ================= */
  const VOLTURUS_ATTACKS = [
    "slash",
    "double",
    "combo3",
    "combo4",
    "combo5",
    "thrust",
    "skybolt",
    "dash",
    "teleportDash",
    "chain",
    "pillars",
    "orbs",
    "lightningBalls",
    "dive",
    "wave",
    "leapWave",
    "cage",
    "spearRain",
    "skyWrath",
    "thunderClap",
    "judgment",
    "godstorm",
    "rushBarrage",
    "megaBalls",
    "stormBomb",
    "stormNova",
  ];
  function volturusDamage(base) {
    const mult = B.revived ? 1.5 : B.vphase === 2 ? 1.18 : 1;
    return Math.round(base * mult);
  }
  function beginVolturusPhase(n) {
    B.vphase = n;
    B.state = "vtransform";
    B.pt = 0;
    B.h = 0;
    B.vAura = 1;
    volturusHazards.length = 0;
    musicIntensify();
    doShake(22);
    doFlash(0.65, n === 2 ? "70,155,255" : "170,225,255");
    sfx("demonRoar");
    addText(
      B.x,
      GROUND - 250,
      n === 2 ? "LIGHTNING UNLEASHED" : "VOLTURUS, STORMLORD",
      n === 2 ? "#86caff" : "#d5f8ff",
      25,
      2,
    );
  }
  function vHaz(kind, extra = {}) {
    const h = Object.assign(
      {
        kind,
        x: B.x,
        y: GROUND,
        vx: 0,
        vy: 0,
        t: 0,
        life: 1.2,
        delay: 0.5,
        dmg: 100,
        radius: 45,
        hit: false,
      },
      extra,
    );
    // Every damaging sky strike gets a readable warning window.  Earlier
    // builds used a very flat, faint ellipse and several bolts landed in
    // under half a second, which made the storm feel random rather than fair.
    if (kind === "bolt" && h.dmg > 0) h.delay = Math.max(0.72, h.delay);
    volturusHazards.push(h);
    return h;
  }
  function volturusHitAt(x, radius, dmg, allowAir = true) {
    if (heroType === "wizard") {
      for (const s of skeletons) {
        if (s.hp > 0 && s.state !== "spawn" && Math.abs(s.x - x) < radius + 18) {
          damageSkeleton(s, dmg);
          return true;
        }
      }
    }
    if (
      P.state !== "dead" &&
      P.invuln <= 0 &&
      Math.abs(P.x - x) < radius &&
      (allowAir || P.y > GROUND - 95)
    )
      return hurtPlayer(dmg, x, dmg >= 160);
    return false;
  }
  function volturusMelee(dmg, reach, airHeight = 165, parryable = false) {
    if (B.hitDone) return;
    const target = bossCombatTarget(),
      ahead = (target.x - B.x) * B.face;
    if (ahead > -25 && ahead < reach && GROUND - (target.y || GROUND) < airHeight) {
      if (B.targetSkeleton) damageSkeleton(B.targetSkeleton, volturusDamage(dmg));
      else if (!parryable || !tryBasicMeleeParry(B.x, (B.x + P.x) / 2, P.y - 68))
        hurtPlayer(volturusDamage(dmg), B.x, dmg >= 130);
      B.hitDone = true;
    }
  }
  function startVolturusAttack(name) {
    B.state = "vattack";
    B.vattack = name;
    B.pt = 0;
    B.hitDone = false;
    B.vCount = 0;
    B.vNext = 0;
    B.vStarted = false;
    B.vTargetX = bossCombatTarget().x;
    B.vOriginX = B.x;
    B.vRushDir = B.face;
    if (name === "dash") {
      // Storm Dash is Volturus's long, chained sword charge. Each form adds
      // another pass, while every pass travels exactly 3x the old dash range.
      B.vDashPass = 0;
      B.vDashPasses = B.revived ? 4 : B.vphase === 2 ? 3 : 2;
      B.vDashPhase = "wind";
      B.vDashPhaseT = 0;
      B.vDashStartX = B.x;
      B.vDashDistance = 0;
      B.vDashDir = B.face;
    }
    B.last = name;
    bossFace();
    sfx(
      ["orbs", "judgment", "godstorm", "megaBalls", "stormBomb", "stormNova"].includes(name)
        ? "charge"
        : "bswing",
    );
  }
  function volturusChoose() {
    const d = Math.abs(bossCombatTarget().x - B.x),
      phaseIndex = B.revived ? 3 : B.vphase;
    let pool =
      phaseIndex === 1
        ? ["slash", "double", "combo3", "thrust", "skybolt", "dash", "wave", "rushBarrage"]
        : phaseIndex === 2
          ? ["double", "combo3", "combo4", "thrust", "skybolt", "dash", "chain", "pillars", "orbs", "lightningBalls", "megaBalls", "wave", "leapWave", "rushBarrage", "stormNova"]
          : VOLTURUS_ATTACKS.slice();
    if (d < 170) pool = pool.concat(["combo3", "combo4", "combo5", "thrust", "thunderClap"]);
    else if (d > 430)
      pool = pool.concat([
        "teleportDash",
        "skybolt",
        "lightningBalls",
        "megaBalls",
        "stormBomb",
        "skyWrath",
        "judgment",
      ]);
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick === B.last) pick = pool[(pool.indexOf(pick) + 3) % pool.length];
    startVolturusAttack(pick);
  }
  function finishVolturusAttack(extra = 0) {
    B.state = "idle";
    const base = B.revived ? 0.18 : B.vphase === 2 ? 0.48 : 0.72;
    B.cool = base + rnd(0.08, 0.28) + extra;
    B.h = B.revived ? 62 : 0;
  }
  function updateVolturusHazards(dt) {
    const target = bossCombatTarget();
    for (let i = volturusHazards.length - 1; i >= 0; i--) {
      const h = volturusHazards[i],
        before = h.t;
      h.t += dt;
      if (h.kind === "orb") {
        const tx = target.x,
          ty = (target.y || GROUND) - 70,
          a = Math.atan2(ty - h.y, tx - h.x);
        h.vx += Math.cos(a) * dt * (B.revived ? 520 : 360);
        h.vy += Math.sin(a) * dt * (B.revived ? 520 : 360);
        const sp = Math.hypot(h.vx, h.vy) || 1,
          cap = B.revived ? 610 : 470;
        if (sp > cap) {
          h.vx = (h.vx / sp) * cap;
          h.vy = (h.vy / sp) * cap;
        }
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        if (!h.hit && Math.hypot(h.x - target.x, h.y - ((target.y || GROUND) - 65)) < h.radius) {
          h.hit = true;
          volturusHitAt(target.x, 42, volturusDamage(h.dmg), true);
          spark(h.x, h.y, 18, "#8ee8ff", 420, 0.4, 0);
        }
      } else if (h.kind === "wave") {
        if (h.t > h.delay) h.x += h.vx * dt;
        if (
          h.t > h.delay &&
          !h.hit &&
          Math.abs(target.x - h.x) < h.radius &&
          (target.y || GROUND) > GROUND - 105
        ) {
          h.hit = true;
          volturusHitAt(h.x, h.radius, volturusDamage(h.dmg), false);
        }
      } else if (h.kind === "bomb") {
        if (h.t >= h.delay && !h.exploded) {
          const q = clamp((h.t - h.delay) / h.flight, 0, 1),
            arc = Math.sin(q * Math.PI) * 135;
          h.x = lerp(h.sx, h.tx, q);
          h.y = lerp(h.sy, GROUND - 8, q) - arc;
          if (q >= 1) {
            h.exploded = true;
            h.hit = true;
            h.x = h.tx;
            h.y = GROUND - 8;
            volturusHitAt(h.x, h.radius, volturusDamage(h.dmg), true);
            vHaz("field", {
              x: h.x,
              delay: 0.01,
              life: 0.62,
              dmg: 175,
              radius: h.radius,
            });
            const stormOffsets = [-330, -220, -110, 0, 110, 220, 330];
            stormOffsets.forEach((off, j) =>
              vHaz("bolt", {
                x: clamp(h.x + off, 50, WORLD - 50),
                delay: 0.76 + j * 0.1,
                life: 1.75,
                dmg: 105,
                radius: 43,
              }),
            );
            addRing(h.x, GROUND - 5, 25, h.radius * 1.15, 0.55, "rgba(155,235,255,.98)", 18);
            spark(h.x, GROUND - 55, 52, "#b9f7ff", 820, 0.75, 180);
            doShake(24);
            doFlash(0.3, "125,220,255");
            sfx("boom");
          }
        }
      } else if (h.kind === "spear") {
        if (h.t > h.delay) {
          h.y += h.vy * dt;
          h.vy += 900 * dt;
          if (!h.hit && h.y >= GROUND - 8) {
            h.hit = true;
            h.y = GROUND;
            volturusHitAt(h.x, h.radius, volturusDamage(h.dmg), false);
            addRing(h.x, GROUND - 3, 8, 75, 0.28, "rgba(100,210,255,.9)", 6);
            doShake(5);
          }
        }
      } else if (
        (h.kind === "bolt" || h.kind === "chain" || h.kind === "field") &&
        !h.hit &&
        before < h.delay &&
        h.t >= h.delay
      ) {
        h.hit = true;
        volturusHitAt(h.x, h.radius, volturusDamage(h.dmg), h.kind !== "bolt");
        spark(h.x, h.kind === "bolt" ? GROUND - 80 : GROUND - 65, 24, "#a9efff", 560, 0.5, 0);
        doShake(h.kind === "field" ? 15 : 8);
        sfx("boom");
      } else if (h.kind === "beam" && !h.hit && before < h.delay && h.t >= h.delay) {
        h.hit = true;
        const dir = h.vx || B.face,
          dx = (target.x - h.x) * dir;
        if (dx > 0 && dx < h.radius && (target.y || GROUND) > GROUND - 150)
          volturusHitAt(target.x, 38, volturusDamage(h.dmg), true);
        doShake(18);
        sfx("beam");
      }
      if (
        h.hit &&
        h.kind !== "orb" &&
        h.kind !== "wave" &&
        h.kind !== "spear" &&
        h.kind !== "bomb"
      )
        h.life = Math.min(h.life, h.t + 0.28);
      if (
        h.t > h.life ||
        h.x < -200 ||
        h.x > WORLD + 200 ||
        h.y > H + 200 ||
        (h.hit &&
          (h.kind === "orb" ||
            h.kind === "wave" ||
            h.kind === "spear" ||
            (h.kind === "bomb" && h.t > h.delay + h.flight + 0.45)))
      )
        volturusHazards.splice(i, 1);
    }
  }
  function updateVolturusAttack(dt) {
    B.pt += dt;
    const t = B.pt,
      target = bossCombatTarget(),
      a = B.vattack;
    bossFace();
    if (a === "slash") {
      if (t < 0.3) B.x += B.face * 120 * dt;
      if (!B.hitDone && t >= 0.3) {
        addArc(B.x, GROUND - 105, 150, -2.2, 0.85, B.face, 0.2, "rgba(110,220,255,.95)", 15);
        volturusMelee(105, 175, 165, true);
      }
      if (t > 0.72) finishVolturusAttack();
    } else if (a === "double") {
      if (B.vCount === 0 && t >= 0.22) {
        B.hitDone = false;
        volturusMelee(82, 165, 165, true);
        addArc(B.x, GROUND - 105, 145, -2.4, 0.55, B.face, 0.18, "rgba(90,205,255,.95)", 13);
        B.vCount = 1;
      }
      if (B.vCount === 1 && t >= 0.52) {
        B.hitDone = false;
        volturusMelee(105, 190, 165, true);
        addArc(B.x, GROUND - 92, 170, 2.4, -0.35, B.face, 0.2, "rgba(170,240,255,.98)", 16);
        B.vCount = 2;
      }
      if (t > 0.88) finishVolturusAttack();
    } else if (a === "combo3" || a === "combo4" || a === "combo5") {
      const hits = Number(a.slice(-1)),
        interval = B.revived ? 0.16 : B.vphase === 2 ? 0.2 : 0.24,
        first = 0.2;
      if (B.vCount < hits && t >= first + B.vCount * interval) {
        B.hitDone = false;
        const n = B.vCount,
          heavy = n === hits - 1,
          sweepUp = n % 2 === 0;
        volturusMelee(heavy ? 132 : 72, heavy ? 215 : 175, 165, true);
        addArc(
          B.x,
          GROUND - B.h - (sweepUp ? 104 : 88),
          heavy ? 190 : 150,
          sweepUp ? -2.35 : 2.45,
          sweepUp ? 0.7 : -0.45,
          B.face,
          0.16,
          heavy ? "rgba(225,250,255,.98)" : "rgba(85,205,255,.92)",
          heavy ? 17 : 12,
        );
        B.x += B.face * (heavy ? 38 : 24);
        B.vCount++;
        sfx(heavy ? "boom" : "bswing");
      }
      if (t > first + hits * interval + 0.38) finishVolturusAttack();
    } else if (a === "thrust") {
      if (t < 0.34) B.x += B.face * 420 * dt;
      if (!B.hitDone && t >= 0.28) {
        addStreak(B.x, GROUND - 92, B.face * 230, "rgba(145,235,255,.98)", 0.18);
        volturusMelee(135, 245);
      }
      if (t > 0.7) finishVolturusAttack();
    } else if (a === "dash") {
      // A readable wind-up, a smoothly accelerated long charge, then a short
      // planted recovery. Volturus reacquires the target before every pass so
      // distant players can still be pursued after he crosses them.
      B.vDashPhaseT += dt;
      if (B.vDashPhase === "wind") {
        const windT = B.vDashPass === 0 ? 0.28 : 0.18;
        bossFace();
        B.vTargetX = target.x;
        B.x -= B.face * 34 * dt;
        if (B.vDashPhaseT >= windT) {
          const oldDashTime = 0.58 - 0.24,
            oldDashSpeed = B.revived ? 1120 : 850;
          B.vDashPhase = "dash";
          B.vDashPhaseT = 0;
          B.vDashDir = B.face;
          B.vDashStartX = B.x;
          B.vDashDistance = oldDashSpeed * oldDashTime * 3;
          B.hitDone = false;
          sfx("bswing");
          doShake(6);
          addStreak(
            B.x,
            GROUND - B.h - 94,
            -B.vDashDir * 165,
            "rgba(105,225,255,.8)",
            0.2,
          );
        }
      } else if (B.vDashPhase === "dash") {
        const dashT = B.revived ? 0.46 : B.vphase === 2 ? 0.52 : 0.56,
          k = clamp(B.vDashPhaseT / dashT, 0, 1),
          smoothK = k * k * (3 - 2 * k),
          oldX = B.x;
        B.face = B.vDashDir;
        B.x = B.vDashStartX + B.vDashDir * B.vDashDistance * smoothK;
        B.stride += Math.abs(B.x - oldX) * 0.085;
        volturusMelee(B.vDashPass === B.vDashPasses - 1 ? 165 : 145, 175);
        if (Math.random() < 0.9)
          addStreak(
            B.x,
            GROUND - B.h - rnd(45, 150),
            -B.vDashDir * rnd(90, 185),
            "rgba(80,200,255,.68)",
            0.17,
          );
        if (
          k >= 1 ||
          B.x <= 70 ||
          B.x >= WORLD - 70
        ) {
          B.vDashPhase = "rec";
          B.vDashPhaseT = 0;
          addArc(
            B.x,
            GROUND - B.h - 92,
            180,
            -2.35,
            0.72,
            B.vDashDir,
            0.2,
            "rgba(195,248,255,.98)",
            16,
          );
        }
      } else {
        const recT = B.vDashPass < B.vDashPasses - 1 ? 0.14 : 0.34;
        if (B.vDashPhaseT >= recT) {
          B.vDashPass++;
          if (B.vDashPass < B.vDashPasses) {
            B.vDashPhase = "wind";
            B.vDashPhaseT = 0;
          } else finishVolturusAttack(0.12);
        }
      }
    } else if (a === "rushBarrage") {
      // Alternating full-body sword rushes.  Later forms perform more passes:
      // two in Form I, three in Form II and five after the resurrection.
      const passes = B.revived ? 5 : B.vphase === 2 ? 3 : 2,
        passTime = 0.48,
        pass = Math.min(passes - 1, Math.floor(t / passTime)),
        q = (t - pass * passTime) / passTime,
        dir = B.vRushDir * (pass % 2 === 0 ? 1 : -1);
      B.face = dir;
      if (B.vNext !== pass) {
        B.vNext = pass;
        B.hitDone = false;
        addStreak(B.x, GROUND - B.h - 94, -dir * 120, "rgba(90,205,255,.52)", 0.16);
      }
      if (q < 0.18) {
        B.x -= dir * 55 * dt;
      } else if (q < 0.72) {
        B.x += dir * (B.revived ? 1120 : B.vphase === 2 ? 980 : 850) * dt;
        volturusMelee(pass === passes - 1 ? 155 : 102, 175);
        if (Math.random() < 0.65)
          addStreak(
            B.x,
            GROUND - B.h - rnd(55, 145),
            -dir * rnd(80, 155),
            "rgba(105,225,255,.72)",
            0.14,
          );
      } else if (q < 0.88 && B.hitDone) {
        addArc(
          B.x,
          GROUND - B.h - 92,
          170,
          pass % 2 ? 2.5 : -2.35,
          pass % 2 ? -0.45 : 0.7,
          dir,
          0.18,
          "rgba(190,245,255,.96)",
          15,
        );
      }
      if (t > passes * passTime + 0.16) finishVolturusAttack(0.12);
    } else if (a === "teleportDash") {
      if (t < 0.28) {
        B.vTargetX = target.x;
        if (Math.random() < 0.8)
          spark(B.x + rnd(-35, 35), GROUND - B.h - rnd(35, 180), 1, "#8eeaff", 230, 0.25, 0);
      } else if (!B.vStarted) {
        B.vStarted = true;
        const oldX = B.x;
        B.x = clamp(target.x - B.face * 125, 70, WORLD - 70);
        B.face = target.x >= B.x ? 1 : -1;
        vHaz("bolt", { x: oldX, delay: 0.02, life: 0.42, dmg: 85, radius: 50 });
        vHaz("bolt", { x: B.x, delay: 0.08, life: 0.5, dmg: 110, radius: 58 });
        addStreak(oldX, GROUND - 100, B.x - oldX, "rgba(85,205,255,.85)", 0.24);
        B.hitDone = false;
        volturusMelee(165, 190);
        doShake(12);
      }
      if (t > 0.72) finishVolturusAttack();
    } else if (a === "skybolt") {
      if (!B.vStarted) {
        B.vStarted = true;
        vHaz("bolt", { x: target.x, delay: 0.58, life: 0.95, dmg: 125, radius: 48 });
      }
      if (t > 0.85) finishVolturusAttack();
    } else if (a === "chain") {
      if (!B.vStarted) {
        B.vStarted = true;
        vHaz("chain", { x: target.x, delay: 0.48, life: 0.9, dmg: 135, radius: 70 });
        vHaz("chain", { x: target.x + B.face * 120, delay: 0.68, life: 1.05, dmg: 110, radius: 58 });
      }
      if (t > 1.0) finishVolturusAttack();
    } else if (a === "pillars") {
      if (B.vCount < 5 && t >= 0.12 + B.vCount * 0.13) {
        const offsets = [-180, 180, -85, 85, 0];
        vHaz("bolt", { x: clamp(B.vTargetX + offsets[B.vCount], 60, WORLD - 60), delay: 0.55, life: 1.0, dmg: 105, radius: 42 });
        B.vCount++;
      }
      if (t > 1.45) finishVolturusAttack();
    } else if (a === "orbs") {
      if (B.vCount < (B.revived ? 8 : 5) && t >= 0.2 + B.vCount * 0.1) {
        const ang = -0.8 + (B.vCount % 5) * 0.4;
        vHaz("orb", {
          x: B.x + B.face * 45,
          y: GROUND - 135 + Math.sin(B.vCount) * 35,
          vx: B.face * (210 + Math.cos(ang) * 80),
          vy: Math.sin(ang) * 170,
          life: 3,
          dmg: 70,
          radius: 26,
        });
        B.vCount++;
      }
      if (t > 1.4) finishVolturusAttack();
    } else if (a === "lightningBalls") {
      if (B.vCount < (B.revived ? 10 : 7) && t >= 0.18 + B.vCount * 0.085) {
        const spread = (B.vCount - 3) * 0.13;
        vHaz("orb", {
          x: B.x + B.face * 55,
          y: GROUND - B.h - 118 + Math.sin(B.vCount * 1.7) * 48,
          vx: B.face * (330 + Math.cos(spread) * 120),
          vy: Math.sin(spread) * 260,
          life: 3.2,
          dmg: 78,
          radius: 29,
        });
        B.vCount++;
        sfx("shot");
      }
      if (t > 1.35) finishVolturusAttack();
    } else if (a === "megaBalls") {
      // Large, slower storm spheres force deliberate dodges rather than
      // duplicating the small rapid-fire volley.
      const total = B.revived ? 6 : 4;
      if (B.vCount < total && t >= 0.35 + B.vCount * 0.22) {
        const row = B.vCount,
          y = GROUND - B.h - 125 - (row % 2) * 72;
        vHaz("orb", {
          x: B.x + B.face * 62,
          y,
          vx: B.face * (210 + row * 18),
          vy: (row - (total - 1) / 2) * 42,
          life: 4.2,
          dmg: 115,
          radius: 48,
          mega: true,
        });
        B.vCount++;
        sfx("shot");
      }
      if (t > 1.85) finishVolturusAttack(0.08);
    } else if (a === "dive") {
      if (t < 0.42) B.h = easeOut(t / 0.42) * 190;
      else if (t < 0.72) {
        B.x += Math.sign(B.vTargetX - B.x) * 620 * dt;
        B.h = lerp(190, 0, (t - 0.42) / 0.3);
      } else if (!B.vStarted) {
        B.vStarted = true;
        B.h = 0;
        vHaz("field", { x: B.x, delay: 0.02, life: 0.55, dmg: 175, radius: 230 });
        vHaz("wave", { x: B.x, vx: -560, life: 1.8, dmg: 95, radius: 48 });
        vHaz("wave", { x: B.x, vx: 560, life: 1.8, dmg: 95, radius: 48 });
      }
      if (t > 1.1) finishVolturusAttack();
    } else if (a === "wave") {
      if (!B.vStarted) {
        B.vStarted = true;
        vHaz("wave", { x: B.x, vx: B.face * 620, life: 2.3, dmg: 120, radius: 52 });
        vHaz("wave", { x: B.x, vx: B.face * 430, life: 2.8, dmg: 95, radius: 44 });
      }
      if (t > 0.8) finishVolturusAttack();
    } else if (a === "leapWave") {
      if (t < 0.38) {
        B.h = easeOut(t / 0.38) * 125;
        B.x += B.face * 230 * dt;
      } else if (t < 0.62) {
        B.h = lerp(125, 0, (t - 0.38) / 0.24);
        B.x += B.face * 360 * dt;
      } else if (!B.vStarted) {
        B.vStarted = true;
        B.h = 0;
        [-1, 1].forEach((dir) =>
          vHaz("wave", { x: B.x, vx: dir * 690, life: 2.2, dmg: 125, radius: 54 }),
        );
        vHaz("field", { x: B.x, delay: 0.03, life: 0.55, dmg: 145, radius: 175 });
        doShake(17);
        sfx("boom");
      }
      if (t > 1.05) finishVolturusAttack();
    } else if (a === "cage") {
      if (!B.vStarted) {
        B.vStarted = true;
        [-95, 0, 95].forEach((o, i) =>
          vHaz("bolt", { x: clamp(target.x + o, 50, WORLD - 50), delay: 0.62 + i * 0.08, life: 1.2, dmg: 120, radius: 38 }),
        );
      }
      if (t > 1.25) finishVolturusAttack();
    } else if (a === "spearRain") {
      if (B.vCount < 9 && t >= 0.12 + B.vCount * 0.1) {
        vHaz("spear", {
          x: clamp(B.vTargetX + rnd(-260, 260), 45, WORLD - 45),
          y: 40,
          vy: 520 + rnd(0, 160),
          delay: rnd(0.05, 0.3),
          life: 1.8,
          dmg: 92,
          radius: 34,
        });
        B.vCount++;
      }
      if (t > 1.45) finishVolturusAttack();
    } else if (a === "skyWrath") {
      B.h = 90 + Math.sin(t * 5) * 12;
      if (B.vCount < 10 && t >= 0.18 + B.vCount * 0.12) {
        const spread = [-240, 160, -80, 260, 0, -170, 90, 220, -30, 130];
        vHaz("bolt", {
          x: clamp(B.vTargetX + spread[B.vCount], 55, WORLD - 55),
          delay: 0.45,
          life: 1.0,
          dmg: 112,
          radius: 42,
        });
        B.vCount++;
      }
      if (t > 1.65) finishVolturusAttack();
    } else if (a === "thunderClap") {
      if (!B.vStarted && t >= 0.42) {
        B.vStarted = true;
        vHaz("field", { x: B.x, delay: 0.03, life: 0.5, dmg: 185, radius: 260 });
        addRing(B.x, GROUND - 80, 20, 280, 0.45, "rgba(150,235,255,.95)", 14);
      }
      if (t > 0.95) finishVolturusAttack();
    } else if (a === "judgment") {
      if (!B.vStarted) {
        B.vStarted = true;
        vHaz("beam", {
          x: B.x,
          y: GROUND - B.h - 105,
          vx: B.face,
          delay: 0.82,
          life: 1.42,
          dmg: 235,
          radius: 1120,
          thickness: 96,
        });
      }
      if (t > 1.58) finishVolturusAttack(0.12);
    } else if (a === "stormBomb") {
      // Charges a huge sphere overhead, throws it into the player's recorded
      // position, explodes across the floor, then calls down seven sky bolts.
      B.h = B.revived ? 92 + Math.sin(t * 4) * 8 : Math.sin(clamp(t / 0.52, 0, 1) * Math.PI) * 55;
      if (!B.vStarted) {
        B.vStarted = true;
        vHaz("bomb", {
          x: B.x,
          y: GROUND - B.h - 255,
          sx: B.x,
          sy: GROUND - B.h - 255,
          tx: clamp(B.vTargetX, 120, WORLD - 120),
          delay: 0.78,
          flight: 0.68,
          life: 3.2,
          dmg: 210,
          radius: 285,
        });
      }
      if (t > 2.55) finishVolturusAttack(0.18);
    } else if (a === "stormNova") {
      // Point-blank detonation followed by three crawling thunder waves and
      // three matching sky strikes on each side.
      if (!B.vStarted && t >= 0.55) {
        B.vStarted = true;
        vHaz("field", { x: B.x, delay: 0.03, life: 0.7, dmg: 195, radius: 275 });
        [1, 2, 3].forEach((rank) => {
          [-1, 1].forEach((dir) => {
            vHaz("wave", {
              x: B.x,
              vx: dir * (430 + rank * 105),
              delay: 0.08 + rank * 0.12,
              life: 2.5,
              dmg: 105 + rank * 8,
              radius: 50,
              rank,
            });
            vHaz("bolt", {
              x: clamp(B.x + dir * rank * 150, 50, WORLD - 50),
              delay: 0.78 + rank * 0.16,
              life: 1.65,
              dmg: 112,
              radius: 42,
            });
          });
        });
        addRing(B.x, GROUND - 70, 25, 330, 0.55, "rgba(175,245,255,.98)", 18);
        doShake(24);
        sfx("boom");
      }
      if (t > 2.05) finishVolturusAttack(0.16);
    } else if (a === "godstorm") {
      if (B.vCount < 12 && t >= B.vCount * 0.14) {
        const x = clamp(target.x + rnd(-360, 360), 50, WORLD - 50);
        vHaz("bolt", { x, delay: 0.48, life: 1.0, dmg: 105, radius: 42 });
        if (B.vCount % 3 === 0)
          vHaz("orb", { x: B.x, y: GROUND - 150, vx: B.face * 280, vy: rnd(-120, 120), life: 3, dmg: 72, radius: 25 });
        B.vCount++;
      }
      if (!B.vStarted && t > 1.05) {
        B.vStarted = true;
        vHaz("field", { x: B.x, delay: 0.35, life: 0.9, dmg: 190, radius: 285 });
      }
      if (t > 2.15) finishVolturusAttack(0.1);
    }
    B.x = clamp(B.x, 70, WORLD - 70);
  }
  function updateVolturus(dt) {
    updateVolturusHazards(dt);
    B.vAura = Math.max(0, B.vAura - dt * 0.55);
    switch (B.state) {
      case "intro":
        B.introFill = Math.min(1, phaseT / 1.6);
        if (!B.roared && phaseT > 0.45) {
          B.roared = true;
          doShake(18);
          sfx("demonRoar");
          addRing(B.x, GROUND - 95, 15, 260, 0.8, "rgba(85,190,255,.9)", 8);
        }
        break;
      case "idle": {
        bossFace();
        const target = bossCombatTarget(),
          dx = Math.abs(target.x - B.x),
          spd = B.revived ? 235 : B.vphase === 2 ? 162 : 124;
        if (B.revived) B.h = 64 + Math.sin(time * 4.2) * 13;
        if (dx > 155) {
          B.x += B.face * spd * dt;
          B.moving = true;
          B.stride += spd * dt * 0.075;
        } else if (dx < 95) B.x -= B.face * spd * 0.36 * dt;
        B.cool -= dt;
        if (B.cool <= 0 && phase === "fight" && P.state !== "dead") volturusChoose();
        break;
      }
      case "vattack":
        updateVolturusAttack(dt);
        break;
      case "vtransform":
        B.pt += dt;
        B.h = Math.sin(clamp(B.pt / 1.65, 0, 1) * Math.PI) * 72;
        if (Math.random() < 0.8)
          spark(B.x + rnd(-85, 85), GROUND - rnd(25, 230), 1, "#8ce9ff", 260, 0.45, -80);
        if (B.pt > 1.65) {
          B.h = 0;
          B.state = "idle";
          B.cool = 0.28;
          vHaz("field", { x: B.x, delay: 0.05, life: 0.55, dmg: 125, radius: 220 });
        }
        break;
      case "vrevive":
        B.pt += dt;
        B.h = B.pt < 1.45 ? 0 : easeOut(clamp((B.pt - 1.45) / 1.15, 0, 1)) * 82;
        if (B.vCount === 0 && B.pt >= 0.55) {
          B.vCount = 1;
          vHaz("bolt", { x: B.x, delay: 0.12, life: 1.05, dmg: 0, radius: 80 });
          doFlash(0.55, "150,225,255");
          doShake(20);
        }
        if (B.vCount === 1 && B.pt >= 1.45) {
          B.vCount = 2;
          B.vphase = 3;
          vHaz("bolt", { x: B.x, delay: 0.08, life: 1.1, dmg: 0, radius: 105 });
          addRing(B.x, GROUND - 115, 20, 330, 0.75, "rgba(190,245,255,.98)", 15);
          doFlash(0.9, "225,250,255");
          doShake(30);
        }
        if (Math.random() < 0.95)
          spark(B.x + rnd(-120, 120), GROUND - rnd(5, 280), 2, "#d9faff", 520, 0.65, -120);
        if (B.pt > 2.85) {
          B.revived = true;
          B.vphase = 3;
          B.maxhp = 10000;
          B.hp = B.ghost = 10000;
          B.h = 64;
          B.state = "idle";
          B.cool = 0.2;
          B.vAura = 2;
          doShake(32);
          doFlash(1, "220,250,255");
          sfx("boom");
          addText(B.x, GROUND - 285, "PHASE THREE  —  ZEUS-BORN STORMLORD", "#ffffff", 24, 2.5);
          for (let j = -3; j <= 3; j++)
            vHaz("bolt", { x: clamp(B.x + j * 95, 50, WORLD - 50), delay: 0.3 + Math.abs(j) * 0.08, life: 1.1, dmg: 115, radius: 38 });
        }
        break;
      case "stunned":
        B.stunT -= dt;
        if (B.stunT <= 0) {
          B.state = "idle";
          B.cool = 0.3;
        }
        break;
      case "dead":
        B.dieT += dt;
        B.h = Math.min(45, B.dieT * 12);
        break;
    }
  }
  function drawVolturusSword(c, x, y, A, phaseN, power = 1) {
    const len = phaseN === 3 ? 126 : 112;
    c.save();
    c.translate(x, y);
    c.rotate(A);
    c.shadowColor = "#61d8ff";
    c.shadowBlur = 8 + power * 8;
    c.strokeStyle = "#07111f";
    c.lineWidth = 13;
    c.beginPath();
    c.moveTo(-24, 0);
    c.lineTo(len, 0);
    c.stroke();
    const blade = c.createLinearGradient(0, -8, len, 7);
    blade.addColorStop(0, phaseN === 1 ? "#d5b66d" : "#528ec4");
    blade.addColorStop(0.28, "#d9f9ff");
    blade.addColorStop(0.65, "#83dcff");
    blade.addColorStop(1, "#f6ffff");
    c.fillStyle = blade;
    c.beginPath();
    c.moveTo(0, -7);
    c.lineTo(len - 15, -5);
    c.lineTo(len, 0);
    c.lineTo(len - 15, 6);
    c.lineTo(0, 8);
    c.lineTo(12, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = "#223b68";
    c.lineWidth = 2.5;
    c.stroke();
    c.fillStyle = phaseN === 1 ? "#b9964c" : "#17365c";
    c.fillRect(-7, -17, 8, 34);
    c.fillStyle = "#121827";
    c.fillRect(-28, -4, 23, 8);
    c.strokeStyle = "rgba(225,252,255,.95)";
    c.lineWidth = 2 + power;
    for (let i = 0; i < 3 + power; i++) {
      const sy = (i - 1.5) * 3;
      c.beginPath();
      c.moveTo(6, sy);
      for (let j = 1; j <= 5; j++)
        c.lineTo((len * j) / 5, sy + Math.sin(time * 24 + i * 2.7 + j * 3.1) * (5 + power * 2));
      c.stroke();
    }
    c.restore();
  }
  function volturusPose() {
    const phaseN = B.revived ? 3 : B.vphase,
      moving = B.moving ? 1 : 0,
      ph = B.stride,
      o = {
        phaseN,
        run: moving,
        lean: moving ? 0.055 : 0,
        crouch: 0,
        swordA: 0.18,
        handR: 43,
        wing: phaseN === 3 ? 0.35 + Math.sin(time * 5.5) * 0.16 : 0,
        alpha: B.state === "dead" ? clamp(1 - Math.max(0, B.dieT - 1.1) / 1.8, 0, 1) : 1,
        stride: ph,
        step: moving ? Math.sin(ph) : 0,
        brace: 0,
      };
    if (B.state === "vattack") {
      const t = B.pt,
        a = B.vattack;
      if (a === "slash") o.swordA = lerp(-2.15, 0.9, ease(clamp(t / 0.58, 0, 1)));
      else if (a === "double") {
        o.swordA = t < 0.4
          ? lerp(-2.2, 0.75, ease(clamp(t / 0.34, 0, 1)))
          : lerp(2.45, -0.55, ease(clamp((t - 0.4) / 0.34, 0, 1)));
      } else if (a.startsWith("combo")) {
        const hits = Number(a.slice(-1)),
          interval = B.revived ? 0.16 : B.vphase === 2 ? 0.2 : 0.24,
          k = clamp((t - 0.14) / interval, 0, hits),
          idx = Math.min(hits - 1, Math.floor(k)),
          q = k - idx;
        o.swordA = idx % 2 === 0 ? lerp(-2.25, 0.82, ease(q)) : lerp(2.55, -0.62, ease(q));
        o.lean = 0.08 + Math.sin(k * Math.PI) * 0.07;
      } else if (a === "dash") {
        const q =
          B.vDashPhase === "wind"
            ? clamp(B.vDashPhaseT / (B.vDashPass === 0 ? 0.28 : 0.18), 0, 1)
            : B.vDashPhase === "dash"
              ? clamp(B.vDashPhaseT / (B.revived ? 0.46 : B.vphase === 2 ? 0.52 : 0.56), 0, 1)
              : clamp(B.vDashPhaseT / 0.34, 0, 1);
        if (B.vDashPhase === "wind") {
          o.swordA = lerp(0.18, -0.28, ease(q));
          o.handR = lerp(43, 54, ease(q));
          o.lean = lerp(0, -0.18, ease(q));
          o.crouch = lerp(0, 0.38, ease(q));
        } else if (B.vDashPhase === "dash") {
          o.swordA = -0.03;
          o.handR = 60;
          o.lean = 0.34 + Math.sin(q * Math.PI) * 0.12;
          o.crouch = 0.31;
          o.brace = 1;
        } else {
          o.swordA = lerp(-0.03, 0.18, ease(q));
          o.handR = lerp(60, 43, ease(q));
          o.lean = lerp(0.3, 0.04, ease(q));
          o.crouch = lerp(0.3, 0.06, ease(q));
          o.brace = 1 - q;
        }
      } else if (
        a === "thrust" ||
        a === "teleportDash" ||
        a === "rushBarrage"
      ) {
        o.swordA = -0.03;
        o.handR = 55;
        o.lean = 0.16;
        o.crouch = 0.22;
        o.brace = 1;
      } else if (a === "dive" || a === "leapWave") {
        o.swordA = 1.2;
        o.lean = 0.11;
        o.crouch = t > 0.58 ? 0.32 : 0;
        o.brace = 0.8;
      } else if (a === "thunderClap") {
        o.swordA = -1.6 + Math.sin(clamp(t / 0.45, 0, 1) * Math.PI) * 0.5;
        o.crouch = 0.18;
        o.brace = 1;
      } else if (
        a === "judgment" ||
        a === "skyWrath" ||
        a === "godstorm" ||
        a === "stormBomb"
      ) {
        o.swordA = -1.25;
        o.handR = 52;
        o.wing = 0.85 + Math.sin(time * 7) * 0.12;
      } else if (
        a === "orbs" ||
        a === "lightningBalls" ||
        a === "megaBalls" ||
        a === "pillars" ||
        a === "chain" ||
        a === "cage" ||
        a === "spearRain"
      ) {
        o.swordA = -0.8;
        o.handR = 48;
      } else if (a === "wave" || a === "stormNova") {
        o.swordA = 0.95;
        o.crouch = a === "stormNova" ? 0.34 : 0.2;
        o.brace = 1;
      }
    } else if (B.state === "vtransform") {
      o.swordA = -1.1;
      o.lean = Math.sin(B.pt * 18) * 0.035;
    } else if (B.state === "vrevive") {
      o.swordA = -1.35;
      o.wing = B.pt > 1.4 ? ease(clamp((B.pt - 1.4) / 0.8, 0, 1)) : 0;
      o.lean = Math.sin(B.pt * 22) * 0.045;
    } else if (B.state === "stunned") {
      o.swordA = 0.75;
      o.lean = -0.12;
      o.crouch = 0.18;
    } else if (B.state === "dead") {
      o.swordA = 0.9;
      o.lean = -0.35;
      o.crouch = 0.42;
      o.wing = 0.08;
    }
    return o;
  }
  const VOLTURUS_MODEL_PAL=[
  {dark:'#0d0e15',mid:'#2a2c3c',light:'#6b6f86',trim:'#d1a94c',cloak:'#171a2a',cloakDark:'#0a0b12',outline:'#03040a',leg:'#232636',legFar:'#12131c',glow:'#6fd0ff',belt:'#5a3a1a'},
  {dark:'#050818',mid:'#141f45',light:'#3a58a8',trim:'#5aa8ff',cloak:'#0d1638',cloakDark:'#050a1a',outline:'#02030a',leg:'#121c40',legFar:'#080e22',glow:'#9fe6ff',belt:'#1a2a5a'},
  {dark:'#0a1a24',mid:'#2a6a80',light:'#9ff8ff',trim:'#c9a24a',cloak:'#0b0d18',cloakDark:'#05060c',outline:'#02080c',leg:'#2a6a80',legFar:'#164050',glow:'#5ff0ff',belt:'#123'}];
  function volturusModelBolt(c,x1,y1,x2,y2,col,w,j){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);for(let i=1;i<8;i++){const t=i/8;c.lineTo(x1+(x2-x1)*t+(Math.random()-.5)*j,y1+(y2-y1)*t+(Math.random()-.5)*j)}c.lineTo(x2,y2);c.stroke()}
  function drawVolturusModelBlade(c,hx,hy,A,len,P,f){c.save();c.translate(hx,hy);c.rotate(A);
   c.fillStyle='#23262f';c.fillRect(-27,-2.8,29,5.6);c.strokeStyle='#4b5166';c.lineWidth=1;for(let i=0;i<6;i++){c.beginPath();c.moveTo(-25+i*4.6,-2.8);c.lineTo(-23+i*4.6,2.8);c.stroke()}
   poly(c,[[-27,-4.5],[-27,4.5],[-42,0]],P.trim,P.outline,1);
   poly(c,[[1,-15],[6,-12],[7,-6],[7,6],[6,12],[1,15],[-2,9],[-2,-9]],P.trim,P.outline,1.2);
   c.shadowColor=P.glow;c.shadowBlur=f==0?10:20;
   const g=c.createLinearGradient(0,-6,0,6);g.addColorStop(0,'#5b7099');g.addColorStop(.5,'#e6f4ff');g.addColorStop(1,'#5b7099');
   c.fillStyle=g;c.beginPath();c.moveTo(7,-6);c.lineTo(len-18,-5);c.lineTo(len,0);c.lineTo(len-18,5);c.lineTo(7,6);c.closePath();c.fill();
   c.shadowBlur=0;c.strokeStyle=P.outline;c.lineWidth=1.2;c.stroke();
   if(f==2){poly(c,[[len-36,-4],[len-24,-19],[len-4,-22],[len-18,-8]],'#dff',P.outline,1.3);poly(c,[[len-36,4],[len-22,13],[len-6,11],[len-18,3]],'#dff',P.outline,1.3)}
   c.shadowColor=P.glow;c.shadowBlur=12;volturusModelBolt(c,8,0,len+4,0,P.glow,f?2.4:1.6,f?9:5);if(f)volturusModelBolt(c,30,0,len-10,0,'#fff',1,6);
   c.restore()}
  // ---- boss rig ----
  function drawVolturusModel(c,o){const P=VOLTURUS_MODEL_PAL[o.f],t=o.t,run=o.run,f=o.f,cr=o.cr,A=o.A;
   c.save();c.translate(o.x,o.y);c.scale(o.face*o.s,o.s);
   const S={x:4,y:-80+cr*.6};
   if(f<2){
    const hipY=-46+cr*.9,ph=o.ph,rx=17*run;
    const fa={x:-10*(1-run)+Math.sin(ph)*rx-(f?8:0),y:-Math.max(0,Math.cos(ph))*10*run},fb={x:10*(1-run)+Math.sin(ph+Math.PI)*rx+(f?10:0),y:-Math.max(0,Math.cos(ph+Math.PI))*10*run};
    const leg=(hx,ft,far)=>{const k=ik(hx,hipY,ft.x,ft.y,24,24,-1);limb(c,[{x:hx,y:hipY},{x:k.x,y:k.y},{x:k.tx,y:k.ty}],13,P.outline,far?P.legFar:P.leg,P.light);
     c.fillStyle=P.dark;c.strokeStyle=P.outline;c.lineWidth=1;c.beginPath();c.ellipse(k.tx+5,k.ty-2,11,5.5,0,0,TAU);c.fill();c.stroke();
     c.fillStyle=P.trim;c.beginPath();c.arc(k.x+2,k.y,5.5,0,TAU);c.fill();c.stroke();
     c.strokeStyle=P.outline;c.lineWidth=1.2;for(const [a,b] of [[{x:hx,y:hipY},k],[k,{x:k.tx,y:k.ty}]])for(const u of [.3,.55,.8]){const px=lerp(a.x,b.x,u),py=lerp(a.y,b.y,u);c.beginPath();c.moveTo(px-6,py-1);c.lineTo(px+6,py+1);c.stroke()}};
    leg(-4,fa,true);leg(4,fb,false);
    const sw=Math.sin(t*1.7)*1.8-run*7;
    poly(c,[[-11,hipY-3],[13,hipY-3],[17+sw,hipY+34],[9+sw,hipY+28],[3+sw,hipY+38],[-4+sw,hipY+28],[-12+sw,hipY+36]],P.cloakDark,P.outline,1.2);
    c.save();c.translate(0,cr);c.translate(0,-44);c.rotate(o.lean);c.translate(0,44);
    const w1=Math.sin(t*3)*3+run*10+o.cb,w2=Math.sin(t*3+1)*4+run*14+o.cb*1.4,L=f?1.5:1;
    poly(c,[[-4,-88],[-18,-74],[-26-w1,-44],[-34*L-w2,-6],[-28*L-w2,2],[-22-w1,-10],[-15-w2*.7,2],[-9-w1*.5,-9],[-3,-2],[1,-44]],P.cloak,P.outline,1.4);
    c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-8-i*3,-80);c.quadraticCurveTo(-18-w1-i*4,-40,-26*L-w2*(.6+i*.1)-i*2,-6);c.stroke()}
    // far arm
    {const e=ik(-4,-78,-8+Math.sin(t*1.4)*1.4-run*3,-48,17,17,1);limb(c,[{x:-4,y:-78},{x:e.x,y:e.y},{x:e.tx,y:e.ty}],10,P.outline,P.legFar,P.light);c.fillStyle=P.dark;c.beginPath();c.arc(e.tx,e.ty,5,0,TAU);c.fill()}
    // torso
    const tg=c.createLinearGradient(-13,0,15,0);tg.addColorStop(0,P.dark);tg.addColorStop(.5,P.mid);tg.addColorStop(1,P.light);
    c.beginPath();c.moveTo(-13,-82);c.quadraticCurveTo(1,-93,14,-82);c.quadraticCurveTo(19,-64,13,-46);c.lineTo(-12,-46);c.quadraticCurveTo(-17,-64,-13,-82);c.closePath();c.fillStyle=tg;c.fill();c.strokeStyle=P.outline;c.lineWidth=1.7;c.stroke();
    const ao=c.createLinearGradient(0,-70,0,-46);ao.addColorStop(0,'rgba(0,0,0,0)');ao.addColorStop(1,'rgba(0,0,0,.5)');c.fillStyle=ao;c.fillRect(-12,-70,26,24);
    c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=1.6;c.beginPath();c.moveTo(14,-80);c.quadraticCurveTo(19,-64,13,-48);c.stroke();
    c.fillStyle=P.trim;for(let i=0;i<5;i++){c.beginPath();c.arc(-8+i*5,-79+Math.abs(i-2)*-1.2,.9,0,TAU);c.fill()}
    c.strokeStyle=P.trim;c.lineWidth=1.2;c.beginPath();c.moveTo(1,-88);c.lineTo(1,-48);c.moveTo(-10,-70);c.quadraticCurveTo(2,-65,13,-70);c.moveTo(-10,-60);c.quadraticCurveTo(2,-55,12,-60);c.stroke();
    if(f){c.strokeStyle=P.glow;c.shadowColor=P.glow;c.shadowBlur=8;c.lineWidth=1.4;c.beginPath();c.moveTo(-8,-78);c.lineTo(-3,-68);c.lineTo(-9,-60);c.moveTo(9,-76);c.lineTo(5,-66);c.lineTo(10,-56);c.stroke();c.shadowBlur=0}
    c.fillStyle=P.belt;c.fillRect(-12,-50,26,6);c.strokeStyle=P.outline;c.lineWidth=1;c.strokeRect(-12,-50,26,6);
    c.fillStyle=P.trim;c.beginPath();c.arc(1,-47,3.4,0,TAU);c.fill();c.stroke();
    poly(c,[[-13,-86],[14,-85],[19,-72],[5,-63],[-12,-72]],P.cloak,P.outline,1.2);
    poly(c,[[-12,-48],[14,-48],[20,-28],[1,-22],[-14,-28]],P.mid,P.outline,1.3);
    // head + horns
    poly(c,[[8,-108],[17,-122],[16,-142],[5,-114]],P.trim,P.outline,1.2);
    poly(c,[[-6,-108],[-16,-120],[-15,-140],[-2,-114]],P.trim,P.outline,1.2);
    c.fillStyle=P.dark;c.fillRect(-3,-90,9,9);
    const hg=c.createLinearGradient(-10,-116,15,-84);hg.addColorStop(0,P.light);hg.addColorStop(.55,P.mid);hg.addColorStop(1,P.dark);
    c.beginPath();c.moveTo(-10,-86);c.quadraticCurveTo(-13,-104,-3,-112);c.quadraticCurveTo(9,-116,15,-102);c.lineTo(14,-88);c.quadraticCurveTo(5,-83,-7,-84);c.closePath();c.fillStyle=hg;c.fill();c.strokeStyle=P.outline;c.lineWidth=1.7;c.stroke();
    poly(c,[[-1,-113],[-4,-128],[4,-114]],P.trim,P.outline,1);
    c.shadowColor=P.glow;c.shadowBlur=10;c.fillStyle=P.glow;c.fillRect(4,-101,11,3);c.shadowBlur=0;c.fillStyle='#06070c';c.fillRect(9,-105,2.4,12);
    // pauldron
    const pg=c.createRadialGradient(-2,-86,1,3,-78,18);pg.addColorStop(0,P.light);pg.addColorStop(.7,P.mid);pg.addColorStop(1,P.dark);
    c.fillStyle=pg;c.beginPath();c.arc(3,-78,15,0,TAU);c.fill();c.strokeStyle=P.outline;c.lineWidth=1.7;c.stroke();c.strokeStyle=P.trim;c.lineWidth=2;c.beginPath();c.arc(3,-78,11,.3,4);c.stroke();c.fillStyle=P.trim;for(let i=0;i<7;i++){c.beginPath();c.arc(3+13*Math.cos(i*.9+.4),-78+13*Math.sin(i*.9+.4),1.1,0,TAU);c.fill()}c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(-3,-86,5,2.5,-.6,0,TAU);c.fill();
    if(f){poly(c,[[-6,-88],[-10,-104],[0,-92]],P.trim,P.outline,1);poly(c,[[8,-90],[14,-104],[16,-88]],P.trim,P.outline,1)}
    c.restore();
   }else{
    const fl=Math.sin(t*3),by=-36+Math.sin(t*2)*6,B1='#8af0f6',B2='#38a6bd',B3='#0e4b5d',O=P.outline,jw=o.jaw||0,sw=Math.sin(t*2.4)*5;
    c.save();c.translate(0,by);
    // wings (dark membrane, bone spars, cyan lightning on the edge)
    [[1,0],[.72,1]].forEach(([k,i])=>{const w=fl*(i?-.7:1),o0=[-4,-92];
     const T=[[-48*k,-205*k-26*w],[-112*k,-180*k-24*w],[-152*k,-124*k-12*w],[-142*k,-58*k+6*w]];
     c.beginPath();c.moveTo(o0[0],o0[1]);T.forEach(q=>c.lineTo(q[0],q[1]));
     const bot=[[-98*k,-92*k],[-64*k,-74*k],[-30*k,-66]];bot.forEach((q,j)=>{const a=j?bot[j-1]:T[3];c.quadraticCurveTo((a[0]+q[0])/2,(a[1]+q[1])/2+18,q[0],q[1])});
     c.lineTo(o0[0],-64);c.closePath();
     const mg=c.createLinearGradient(0,-200,-150,-60);mg.addColorStop(0,i?'#111a3c':'#1b2758');mg.addColorStop(1,'#060a1c');c.fillStyle=mg;c.fill();c.strokeStyle=O;c.lineWidth=2.4;c.stroke();
     c.lineCap='round';T.forEach(q=>{c.strokeStyle=O;c.lineWidth=7;c.beginPath();c.moveTo(o0[0],o0[1]);c.lineTo(q[0],q[1]);c.stroke();c.strokeStyle=B2;c.lineWidth=3.4;c.stroke();c.strokeStyle=B1;c.lineWidth=1.2;c.stroke();
      c.fillStyle=B1;c.strokeStyle=O;c.lineWidth=1;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]-6,q[1]-13);c.lineTo(q[0]+5,q[1]-3);c.closePath();c.fill();c.stroke()});
     c.shadowColor=P.glow;c.shadowBlur=10;for(let j=0;j<3;j++)volturusModelBolt(c,j?T[j-1][0]:o0[0],j?T[j-1][1]:o0[1],T[j][0],T[j][1],'#aef',1.5,8);c.shadowBlur=0});
    // boots peeking from the robe
    poly(c,[[-14,16],[-2,16],[0,30],[-20,30]],'#0b0c14',O,1.4);poly(c,[[4,16],[16,16],[20,30],[2,30]],'#0b0c14',O,1.4);
    // tattered robe
    const rg=c.createLinearGradient(0,-70,0,30);rg.addColorStop(0,'#1a1c2c');rg.addColorStop(1,'#04050a');
    poly(c,[[-26,-70],[28,-72],[38,-30],[42+sw,10],[30,0],[26+sw,28],[14,6],[8,32+sw],[0,6],[-10,30],[-20,4],[-30+sw,22],[-34,-12],[-32,-42]],rg,O,1.9);
    c.strokeStyle='rgba(90,140,200,.18)';c.lineWidth=1.6;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-18+i*10,-56);c.quadraticCurveTo(-22+i*10+sw*.4,-14,-20+i*10+sw,18);c.stroke()}
    // ribcage: cyan bone with dark outline
    poly(c,[[-17,-92],[19,-93],[20,-60],[-17,-60]],'#07141b',O,1.4);
    c.lineCap='round';for(let i=0;i<5;i++){const y=-88+i*6.5,wd=15-i*1.3;
     [[1,-1],[1,1]].forEach(([_,d])=>{c.beginPath();c.moveTo(1,y);c.quadraticCurveTo(1+d*(wd+3),y+3,1+d*(wd-2),y+9);c.strokeStyle=O;c.lineWidth=6;c.stroke();c.strokeStyle=B2;c.lineWidth=3.6;c.stroke();c.strokeStyle=B1;c.lineWidth=1.4;c.stroke()})}
    c.fillStyle=B1;c.strokeStyle=O;c.lineWidth=1;for(let i=0;i<6;i++){c.beginPath();c.arc(1,-91+i*6,2.7,0,TAU);c.fill();c.stroke()}
    // belt + pelvis
    c.fillStyle='#161826';c.fillRect(-18,-62,38,6);c.strokeStyle=O;c.strokeRect(-18,-62,38,6);c.fillStyle=P.trim;c.beginPath();c.arc(1,-59,3.4,0,TAU);c.fill();c.stroke();
    // pauldrons (dark armor, teal edge, spikes)
    poly(c,[[-19,-88],[-32,-100],[-26,-112],[-14,-96],[-6,-90]],'#10131f',O,1.6);
    poly(c,[[6,-92],[10,-112],[20,-102],[28,-118],[36,-96],[30,-82],[8,-82]],'#11141f',O,1.8);
    c.strokeStyle=B1;c.lineWidth=1.3;c.shadowColor=P.glow;c.shadowBlur=7;c.beginPath();c.moveTo(8,-84);c.lineTo(20,-104);c.lineTo(28,-116);c.lineTo(35,-96);c.stroke();volturusModelBolt(c,12,-90,28,-90,'#aef',1.3,5);c.shadowBlur=0;
    // neck + skull
    c.fillStyle=B2;c.strokeStyle=O;c.lineWidth=1;for(let i=0;i<3;i++){c.beginPath();c.arc(3,-96-i*3.6,3.3,0,TAU);c.fill();c.stroke()}
    const sg=c.createRadialGradient(0,-116,2,4,-110,22);sg.addColorStop(0,'#d9ffff');sg.addColorStop(.6,B1);sg.addColorStop(1,B2);
    c.fillStyle=sg;c.beginPath();c.ellipse(4,-115,14.5,16,0,0,TAU);c.fill();c.strokeStyle=O;c.lineWidth=2;c.stroke();
    poly(c,[[-4,-104],[16,-105],[14,-97],[-3,-97]],B1,O,1.4);
    poly(c,[[-3,-97],[14,-97],[12,-88+jw],[1,-86+jw]],B2,O,1.4);
    c.fillStyle='#f4ffff';for(let i=0;i<5;i++){c.fillRect(-1+i*3.2,-99,1.8,3.4);c.fillRect(0+i*2.8,-97+jw*.7-3,1.6,3)}
    c.fillStyle='#03151c';c.beginPath();c.ellipse(11,-118,5.2,6.6,.15,0,TAU);c.ellipse(-1,-118,4.6,6.2,-.15,0,TAU);c.fill();
    poly(c,[[6,-110],[9,-103],[4,-105]],'#03151c',null);
    c.shadowColor=P.glow;c.shadowBlur=10;c.fillStyle='#e8ffff';c.beginPath();c.arc(11.5,-118,1.6,0,TAU);c.arc(-.5,-118,1.5,0,TAU);c.fill();c.shadowBlur=0;
    // spiked dark crown with teal edges
    poly(c,[[-11,-124],[19,-125],[18,-117],[-10,-116]],'#181b2c',O,1.6);
    [[-10,12,-6],[-5,19,-3],[0,26,0],[5,31,2],[10,26,4],[15,19,6],[19,12,8]].forEach(([a,h,lean])=>poly(c,[[a-3,-123],[a+3.5,-124],[a+lean,-124-h]],'#1b1e30',O,1.5));
    c.strokeStyle=B1;c.lineWidth=1;c.shadowColor=P.glow;c.shadowBlur=6;[[-5,19,-3],[5,31,2],[15,19,6]].forEach(([a,h,l])=>{c.beginPath();c.moveTo(a-2,-123);c.lineTo(a+l,-124-h);c.stroke()});c.shadowBlur=0;
    c.restore();S.y=-90+by;S.x=10;
   }
   // sword arm (near)
   const g=A*.76,H={x:S.x+30*Math.cos(g),y:S.y+30*Math.sin(g)},e=ik(S.x,S.y,H.x,H.y,17,17,1);
   if(o.trail){c.save();c.strokeStyle='rgba(140,210,255,.55)';c.shadowColor=P.glow;c.shadowBlur=16;c.lineWidth=14;c.lineCap='round';c.beginPath();c.arc(S.x,S.y,f==2?120:105,-2.5,A);c.stroke();c.restore()}
   limb(c,[S,{x:e.x,y:e.y},{x:H.x,y:H.y}],f==2?7:10.5,P.outline,f==2?'#38a6bd':P.mid,f==2?'#d8ffff':P.light);
   c.fillStyle=f==2?'#8af0f6':P.dark;c.beginPath();c.arc(H.x,H.y,f==2?4.6:5.4,0,TAU);c.fill();
   if(f==2){c.fillStyle='#e9fdff';for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(H.x+4,H.y+i*4);c.lineTo(H.x+11,H.y+i*5+2);c.lineTo(H.x+4,H.y+i*4+2);c.fill()}}
   drawVolturusModelBlade(c,H.x,H.y,A,f==2?118:100,P,f);
   c.restore()}

  function drawVolturus(c) {
    const pose = volturusPose(),
      form = B.revived || (B.state === "vrevive" && B.pt >= 1.45) ? 2 : Math.max(0, B.vphase - 1),
      melee = ["slash", "double", "combo3", "combo4", "combo5", "thrust", "dash", "teleportDash", "rushBarrage", "dive", "leapWave", "wave"].includes(B.vattack),
      attacking = B.state === "vattack",
      run =
        B.moving ||
        (attacking &&
          ["thrust", "dash", "teleportDash", "rushBarrage", "dive", "leapWave"].includes(
            B.vattack,
          )),
      strikeTrail =
        attacking &&
        melee &&
        (B.vattack === "dash"
          ? B.vDashPhase === "dash"
          : B.pt > 0.16 && B.pt < 0.72),
      scale = form === 2 ? 1.32 : 1.76,
      alpha = pose.alpha === undefined ? 1 : pose.alpha;
    c.save();
    c.globalAlpha *= alpha;
    if (B.flash > 0) c.filter = "brightness(2.2) saturate(.5)";
    if (B.state === "vtransform" || B.state === "vrevive") {
      const pulse = 1 + Math.sin(B.pt * 20) * 0.025;
      c.translate(B.x, GROUND - B.h);
      c.scale(pulse, pulse);
      c.translate(-B.x, -(GROUND - B.h));
    }
    drawVolturusModel(c, {
      x: B.x,
      y: GROUND - B.h,
      s: scale,
      face: B.face,
      t: time,
      f: form,
      run: run ? 1 : 0,
      ph: B.stride,
      A: pose.swordA,
      cr: pose.crouch * 34 + (form === 1 ? 7 : 0),
      lean: pose.lean + (B.state === "stunned" ? 0.18 : 0),
      cb: run ? 9 : 0,
      trail: strikeTrail,
      jaw: form === 2 ? 2 + Math.sin(time * 4) * 2 + (attacking ? 4 : 0) : 0,
    });
    c.restore();
    if (form === 2) {
      for (let i = 0; i < 10; i++) {
        const u = (time * 0.34 + i * 0.1) % 1;
        c.globalAlpha = (1 - u) * 0.72 * alpha;
        c.fillStyle = "#aef";
        c.fillRect(B.x + Math.sin(time * 1.5 + i * 2.2) * 88, GROUND - B.h - 30 - u * 245, 2, 2);
      }
      c.globalAlpha = 1;
    }
    // Phase-change sky cannon: a broad blue Kamehameha-like thunder column,
    // drawn only for Volturus and layered with jagged electrical filaments.
    if (B.state === "vtransform") {
      const k = clamp(B.pt / 0.48, 0, 1),
        fade = clamp((1.65 - B.pt) / 0.35, 0, 1),
        width = 34 + 88 * k;
      c.save();
      c.globalAlpha = fade;
      c.shadowColor = "#53cfff";
      c.shadowBlur = 30;
      const beam = c.createLinearGradient(B.x - width, 0, B.x + width, 0);
      beam.addColorStop(0, "rgba(40,140,255,0)");
      beam.addColorStop(0.22, "rgba(65,185,255,.55)");
      beam.addColorStop(0.5, "rgba(238,254,255,.98)");
      beam.addColorStop(0.78, "rgba(65,185,255,.55)");
      beam.addColorStop(1, "rgba(40,140,255,0)");
      c.fillStyle = beam;
      c.fillRect(B.x - width, 0, width * 2, GROUND - 5);
      c.lineWidth = 5;
      c.strokeStyle = "#dffcff";
      for (let j = 0; j < 5; j++) {
        c.beginPath();
        let x = B.x + (j - 2) * width * 0.2,
          y = 0;
        c.moveTo(x, y);
        while (y < GROUND - 8) {
          y += 32;
          x = B.x + (j - 2) * width * 0.2 + Math.sin(y * 0.16 + time * 24 + j) * 18;
          c.lineTo(x, y);
        }
        c.stroke();
      }
      c.restore();
    }
    // First death is answered by a sustained sky bolt that reveals Phase 3.
    if (B.state === "vrevive" && B.pt > 0.48 && B.pt < 2.5) {
      c.save();
      c.strokeStyle = "rgba(240,254,255," + (0.7 + Math.sin(time * 32) * 0.2) + ")";
      c.shadowColor = "#62d8ff";
      c.shadowBlur = 26;
      c.lineWidth = 16;
      c.beginPath();
      let x = B.x, y = 0;
      c.moveTo(x, y);
      while (y < GROUND - B.h - 72) {
        y += 38;
        x = B.x + Math.sin(y * 0.19 + time * 20) * 21;
        c.lineTo(x, y);
      }
      c.stroke();
      c.restore();
    }
  }

  function drawVolturusHazards() {
    for (const h of volturusHazards) {
      const pre = h.t < h.delay,
        k = clamp(h.t / Math.max(0.01, h.delay), 0, 1);
      ctx.save();
      if (h.kind === "bolt" || h.kind === "chain") {
        if (pre) {
          const pulse = 0.72 + Math.sin(time * 20) * 0.18,
            rr = h.radius * (1.26 - k * 0.26);
          ctx.fillStyle = "rgba(65,155,255," + (0.1 + 0.16 * k) + ")";
          ctx.beginPath();
          ctx.ellipse(h.x, GROUND - 4, rr, rr * 0.3, 0, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "rgba(190,242,255," + pulse + ")";
          ctx.shadowColor = "#56cfff";
          ctx.shadowBlur = 18;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.ellipse(h.x, GROUND - 4, rr, rr * 0.3, 0, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([8, 6]);
          ctx.strokeStyle = "rgba(255,255,255," + (0.42 + 0.48 * k) + ")";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(h.x, GROUND - 4, h.radius * k, h.radius * 0.3 * k, 0, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgba(120,220,255," + (0.18 + 0.45 * k) + ")";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(h.x, 42);
          ctx.lineTo(h.x, GROUND - 12);
          ctx.stroke();
          if (h.kind === "bolt") {
            ctx.shadowBlur = 8;
            ctx.fillStyle = "rgba(225,252,255," + (0.55 + 0.4 * k) + ")";
            ctx.font = "700 11px Cinzel, Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillText("STRIKE", h.x, GROUND - 21);
          }
        } else {
          ctx.strokeStyle = "#e9fdff";
          ctx.shadowColor = "#55cfff";
          ctx.shadowBlur = 20;
          ctx.lineWidth = h.kind === "bolt" ? 8 : 5;
          ctx.beginPath();
          let x = h.x,
            y = h.kind === "bolt" ? 30 : GROUND - 235;
          ctx.moveTo(x, y);
          while (y < GROUND - 8) {
            y += 30;
            x = h.x + rnd(-18, 18);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (h.kind === "orb") {
        const orbR = h.mega ? h.radius * (0.72 + Math.sin(time * 8) * 0.06) : 11 + Math.sin(time * 18) * 2;
        if (h.mega) {
          const aura = ctx.createRadialGradient(h.x, h.y, 4, h.x, h.y, orbR * 1.65);
          aura.addColorStop(0, "rgba(255,255,255,.98)");
          aura.addColorStop(0.28, "rgba(105,225,255,.9)");
          aura.addColorStop(0.7, "rgba(45,115,255,.38)");
          aura.addColorStop(1, "rgba(45,90,255,0)");
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(h.x, h.y, orbR * 1.65, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = "#dffbff";
        ctx.shadowColor = "#36bfff";
        ctx.shadowBlur = h.mega ? 34 : 22;
        ctx.beginPath();
        ctx.arc(h.x, h.y, orbR, 0, TAU);
        ctx.fill();
        if (h.mega) {
          ctx.strokeStyle = "#8cecff";
          ctx.lineWidth = 3;
          for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            ctx.arc(h.x, h.y, orbR * (0.45 + j * 0.18), time * 3 + j, time * 3 + j + Math.PI);
            ctx.stroke();
          }
        }
      } else if (h.kind === "wave") {
        if (h.t >= h.delay) {
          const dir = Math.sign(h.vx) || 1,
            len = 100 + (h.rank || 0) * 14;
          ctx.shadowColor = "#3fc5ff";
          ctx.shadowBlur = 22;
          ctx.lineCap = "round";
          // Main ground-crawling thunder path.
          for (let layer = 0; layer < 3; layer++) {
            ctx.strokeStyle = layer === 2 ? "#f4ffff" : layer === 1 ? "#83e8ff" : "rgba(55,125,255,.55)";
            ctx.lineWidth = layer === 2 ? 2 : layer === 1 ? 6 : 13;
            ctx.beginPath();
            ctx.moveTo(h.x - dir * len * 0.55, GROUND - 5);
            for (let j = 1; j <= 7; j++) {
              const px = h.x - dir * len * 0.55 + dir * (len * j) / 7,
                py = GROUND - 7 - Math.abs(Math.sin(j * 2.4 + time * 18)) * (22 + (j % 3) * 12);
              ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
          // Short forks make the wave resemble lightning walking along stone.
          ctx.strokeStyle = "rgba(205,250,255,.9)";
          ctx.lineWidth = 2;
          for (let j = 1; j < 7; j += 2) {
            const px = h.x - dir * len * 0.5 + dir * (len * j) / 7,
              py = GROUND - 22 - (j % 3) * 9;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px - dir * 15, py - 22);
            ctx.lineTo(px - dir * 5, py - 36);
            ctx.stroke();
          }
        }
      } else if (h.kind === "bomb") {
        const charging = h.t < h.delay,
          q = charging ? clamp(h.t / h.delay, 0, 1) : 1,
          r = h.radius * 0.22 * (0.24 + q * 0.76);
        if (!h.exploded) {
          const aura = ctx.createRadialGradient(h.x, h.y, 3, h.x, h.y, r * 1.7);
          aura.addColorStop(0, "#ffffff");
          aura.addColorStop(0.24, "#aaf5ff");
          aura.addColorStop(0.62, "rgba(65,145,255,.72)");
          aura.addColorStop(1, "rgba(65,100,255,0)");
          ctx.fillStyle = aura;
          ctx.shadowColor = "#5ddaff";
          ctx.shadowBlur = 36;
          ctx.beginPath();
          ctx.arc(h.x, h.y, r * 1.7, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#eaffff";
          ctx.lineWidth = 4;
          for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.arc(h.x, h.y, r * (0.62 + j * 0.11), time * 4 + j, time * 4 + j + 2.2);
            ctx.stroke();
          }
        }
      } else if (h.kind === "spear") {
        if (pre) {
          ctx.fillStyle = "rgba(120,220,255,.28)";
          ctx.fillRect(h.x - 2, 45, 4, GROUND - 45);
        } else {
          ctx.translate(h.x, h.y);
          ctx.rotate(1.55);
          ctx.fillStyle = "#e8fdff";
          ctx.shadowColor = "#4dc7ff";
          ctx.shadowBlur = 18;
          ctx.fillRect(-48, -3, 96, 6);
        }
      } else if (h.kind === "beam") {
        const thick = h.thickness || 48,
          endX = h.x + h.vx * h.radius;
        ctx.shadowColor = "#44c7ff";
        ctx.shadowBlur = pre ? 10 : 34;
        if (pre) {
          ctx.strokeStyle = "rgba(120,225,255,.48)";
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(h.x, h.y);
          ctx.lineTo(endX, h.y);
          ctx.stroke();
        } else {
          [
            [thick + 34, "rgba(45,105,255,.28)"],
            [thick, "rgba(55,190,255,.72)"],
            [thick * 0.62, "rgba(190,248,255,.96)"],
            [thick * 0.27, "#ffffff"],
          ].forEach(([w, col]) => {
            ctx.strokeStyle = col;
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(h.x, h.y);
            ctx.lineTo(endX, h.y);
            ctx.stroke();
          });
          ctx.strokeStyle = "#dffcff";
          ctx.lineWidth = 3;
          for (let j = -2; j <= 2; j++) {
            ctx.beginPath();
            let x = h.x,
              y = h.y + j * thick * 0.14;
            ctx.moveTo(x, y);
            for (let n = 1; n <= 10; n++) {
              x = lerp(h.x, endX, n / 10);
              y = h.y + j * thick * 0.14 + Math.sin(n * 2.6 + time * 28 + j) * 8;
              ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
      } else if (h.kind === "field") {
        const r = pre ? h.radius * k : h.radius;
        ctx.strokeStyle = pre ? "rgba(100,215,255,.55)" : "rgba(225,252,255,.95)";
        ctx.shadowColor = "#4bcaff";
        ctx.shadowBlur = 24;
        ctx.lineWidth = pre ? 5 : 15;
        ctx.beginPath();
        ctx.ellipse(h.x, GROUND - 5, r, r * 0.22, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /* ================= OBSIDIAN TENDRIL WRAITH (boss 6) ================= */
  function wraithDamage(base) {
    return Math.round(base * (B.wphase === 2 ? 1.4 : 1));
  }
  function wraithHitAt(x, radius, dmg, airHeight = 190) {
    const target = bossCombatTarget();
    if (
      Math.abs(target.x - x) <= radius &&
      GROUND - (target.y || GROUND) < airHeight
    ) {
      if (B.targetSkeleton) damageSkeleton(B.targetSkeleton, dmg);
      else hurtPlayer(dmg, x, dmg >= 200);
      return true;
    }
    return false;
  }
  function wraithMelee(dmg, reach = 175, parryable = true) {
    if (B.hitDone) return;
    const target = bossCombatTarget(),
      ahead = (target.x - B.x) * B.face;
    if (ahead > -30 && ahead < reach && GROUND - (target.y || GROUND) < 185) {
      if (B.targetSkeleton) damageSkeleton(B.targetSkeleton, wraithDamage(dmg));
      else if (!parryable || !tryBasicMeleeParry(B.x, (B.x + P.x) / 2, P.y - 68))
        hurtPlayer(wraithDamage(dmg), B.x, dmg >= 180);
      B.hitDone = true;
    }
  }
  function wraithHazard(kind, data) {
    wraithHazards.push(Object.assign({ kind, t: 0, hit: false }, data));
  }
  function beginWraithPhase2() {
    if (B.wphase === 2 || B.hp <= 0) return;
    B.wphase = 2;
    B.rage = true;
    B.state = "wtransform";
    B.pt = 0;
    B.h = 0;
    B.wCount = 0;
    wraithHazards.length = 0;
    musicIntensify();
    doShake(24);
    doFlash(0.62, "22,28,52");
    sfx("demonRoar");
    addText(B.x, GROUND - 245, "DARK SYMBIOTE AWAKENED  —  +40% DAMAGE", "#b9c9ee", 22, 2.4);
  }
  function startWraithAttack(name) {
    B.state = "wattack";
    B.wattack = name;
    B.pt = 0;
    B.hitDone = false;
    B.wCount = 0;
    B.wNext = -1;
    B.wStarted = false;
    B.wTargetX = bossCombatTarget().x;
    B.wStartX = B.x;
    B.wHits =
      name === "combo"
        ? 2 + Math.floor(Math.random() * 3)
        : name === "pounce"
          ? 3 + Math.floor(Math.random() * 2)
          : name === "darkSpear"
            ? B.wphase === 2
              ? 4 + Math.floor(Math.random() * 2)
              : 2 + Math.floor(Math.random() * 2)
          : name === "tendrilWave"
            ? 2 + Math.floor(Math.random() * 2)
            : 0;
    B.last = name;
    bossFace();
    sfx(name === "darkSpear" || name === "pillars" ? "charge" : "bswing");
  }
  function wraithChoose() {
    const d = Math.abs(bossCombatTarget().x - B.x);
    let pool = ["combo", "lash", "darkSpear", "tendrilWave", "pillars", "pounce"];
    if (d > 420) pool = pool.concat(["darkSpear", "pounce", "lash"]);
    if (d < 190) pool = pool.concat(["combo", "combo", "tendrilWave"]);
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick === B.last) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
    startWraithAttack(pick);
  }
  function finishWraithAttack(extra = 0) {
    B.state = "idle";
    B.cool = (B.wphase === 2 ? 0.42 : 0.68) + rnd(0.12, 0.3) + extra;
    B.h = 0;
  }
  function updateWraithHazards(dt) {
    for (let i = wraithHazards.length - 1; i >= 0; i--) {
      const h = wraithHazards[i];
      h.t += dt;
      if (h.kind === "orb") {
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        if (!h.hit) {
          const target = bossCombatTarget();
          if (Math.hypot(target.x - h.x, (target.y || GROUND) - 70 - h.y) < h.radius + 18) {
            h.hit = true;
            if (B.targetSkeleton) damageSkeleton(B.targetSkeleton, wraithDamage(h.dmg));
            else hurtPlayer(wraithDamage(h.dmg), h.x, false);
          }
        }
        if (h.t > h.life || h.x < -80 || h.x > WORLD + 80) wraithHazards.splice(i, 1);
      } else if (h.kind === "wave") {
        if (h.t >= h.delay) {
          h.x += h.vx * dt;
          if (!h.hit && wraithHitAt(h.x, h.radius, wraithDamage(h.dmg), 150)) h.hit = true;
        }
        if (h.t > h.life || h.x < -120 || h.x > WORLD + 120) wraithHazards.splice(i, 1);
      } else {
        if (!h.hit && h.t >= h.delay) {
          h.hit = true;
          wraithHitAt(h.x, h.radius, wraithDamage(h.dmg), h.airHeight || 210);
          sfx("boom");
          doShake(h.kind === "pillar" ? 12 : 8);
        }
        if (h.t > h.delay + h.life) wraithHazards.splice(i, 1);
      }
    }
  }
  function updateWraithAttack(dt) {
    B.pt += dt;
    const t = B.pt,
      target = bossCombatTarget(),
      a = B.wattack;
    if (a === "combo") {
      const interval = B.wphase === 2 ? 0.34 : 0.42,
        first = 0.32;
      if (B.wCount < B.wHits && t >= first + B.wCount * interval) {
        bossFace();
        B.hitDone = false;
        B.x += B.face * 34;
        wraithMelee(120, 185);
        addArc(B.x, GROUND - 108, 150, -2.45, 0.62, B.face, 0.18, "rgba(125,145,205,.78)", 15);
        spark(B.x + B.face * 95, GROUND - 105, 8, "#ff8a27", 280, 0.3);
        sfx("bswing");
        B.wCount++;
      }
      if (t > first + B.wHits * interval + 0.38) finishWraithAttack();
    } else if (a === "lash") {
      if (t < 0.48) {
        bossFace();
        B.wTargetX = target.x;
      }
      if (!B.wStarted && t >= 0.58) {
        B.wStarted = true;
        wraithHazard("lash", {
          x: clamp(B.wTargetX, 70, WORLD - 70),
          delay: 0.18,
          life: 0.55,
          dmg: 250,
          radius: 105,
        });
        sfx("bswing");
      }
      if (t > 1.35) finishWraithAttack(0.08);
    } else if (a === "darkSpear") {
      const first = 0.48,
        interval = B.wphase === 2 ? 0.36 : 0.5;
      if (t < first || t - first > (B.wCount - 1) * interval + 0.18) bossFace();
      if (B.wCount < B.wHits && t >= first + B.wCount * interval) {
        const count = 8,
          tx = target.x,
          ty = (target.y || GROUND) - 70,
          ox = B.x + B.face * 62,
          oy = GROUND - 128;
        for (let i = 0; i < count; i++) {
          const angle = Math.atan2(ty - oy, tx - ox) + (i - (count - 1) / 2) * 0.075,
            speed = 500 + i * 18;
          wraithHazard("orb", {
            x: ox,
            y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            dmg: 100,
            radius: 16,
            life: 4,
          });
        }
        addRing(B.x + B.face * 42, GROUND - 128, 8, 72, 0.24, "rgba(50,60,100,.9)", 8);
        spark(B.x + B.face * 62, GROUND - 128, 12, "#7885ad", 260, 0.32);
        sfx("shoot");
        B.wCount++;
      }
      if (t > first + B.wHits * interval + 0.42) finishWraithAttack();
    } else if (a === "tendrilWave") {
      const first = 0.42,
        interval = 0.5;
      if (B.wCount < B.wHits && t >= first + B.wCount * interval) {
        bossFace();
        wraithHazard("wave", {
          x: B.x + B.face * 45,
          y: GROUND - 12,
          vx: B.face * (B.wphase === 2 ? 720 : 610),
          delay: 0.08,
          life: 2.8,
          dmg: 250,
          radius: 72,
          rank: B.wCount,
        });
        addRing(B.x, GROUND - 70, 15, 145, 0.35, "rgba(30,38,65,.9)", 12);
        sfx("boom");
        B.wCount++;
      }
      if (t > first + B.wHits * interval + 0.45) finishWraithAttack();
    } else if (a === "pillars") {
      if (!B.wStarted && t >= 0.38) {
        B.wStarted = true;
        for (let i = 0; i < 8; i++)
          wraithHazard("pillar", {
            x: clamp((WORLD * (i + 0.5)) / 8 + rnd(-34, 34), 55, WORLD - 55),
            delay: 0.78 + (i % 2) * 0.08,
            life: 0.58,
            dmg: 300,
            radius: 48,
          });
      }
      if (t > 1.8) finishWraithAttack(0.12);
    } else if (a === "pounce") {
      const passTime = 0.78,
        pass = Math.min(B.wHits - 1, Math.floor(t / passTime)),
        q = (t - pass * passTime) / passTime;
      if (B.wNext !== pass) {
        B.wNext = pass;
        B.wStartX = B.x;
        bossFace();
        B.wTargetX = clamp(target.x - B.face * 24, 75, WORLD - 75);
        B.hitDone = false;
      }
      if (q < 0.22) {
        bossFace();
        B.h = 0;
      } else if (q < 0.68) {
        const k = (q - 0.22) / 0.46,
          sk = k * k * (3 - 2 * k);
        B.x = lerp(B.wStartX, B.wTargetX, sk);
        B.h = 4 * 155 * k * (1 - k);
      } else {
        B.h = 0;
        if (!B.hitDone) {
          B.hitDone = true;
          wraithHitAt(B.x, 118, wraithDamage(200), 220);
          addRing(B.x, GROUND - 5, 18, 210, 0.42, "rgba(255,122,28,.72)", 7);
          addArc(B.x + B.face * 35, GROUND - 8, 115, -2.85, -0.28, B.face, 0.24, "rgba(70,82,125,.9)", 18);
          spark(B.x + B.face * 48, GROUND - 14, 18, "#8290b8", 380, 0.4);
          dust(B.x, GROUND, 16);
          doShake(14);
          sfx("boom");
        }
      }
      if (t > B.wHits * passTime + 0.28) finishWraithAttack(0.12);
    }
    B.x = clamp(B.x, 70, WORLD - 70);
  }
  function updateWraith(dt) {
    updateWraithHazards(dt);
    switch (B.state) {
      case "intro":
        B.introFill = Math.min(1, phaseT / 1.6);
        if (!B.roared && phaseT > 0.48) {
          B.roared = true;
          sfx("demonRoar");
          doShake(17);
          addRing(B.x, GROUND - 90, 15, 260, 0.75, "rgba(35,42,70,.9)", 10);
        }
        break;
      case "idle": {
        bossFace();
        const target = bossCombatTarget(),
          dx = Math.abs(target.x - B.x),
          spd = B.wphase === 2 ? 168 : 126;
        if (dx > 190) {
          B.x += B.face * spd * dt;
          B.moving = true;
          B.stride += spd * dt * 0.075;
        } else if (dx < 105) B.x -= B.face * spd * 0.3 * dt;
        B.cool -= dt;
        if (B.cool <= 0 && phase === "fight" && P.state !== "dead") wraithChoose();
        break;
      }
      case "wattack":
        updateWraithAttack(dt);
        break;
      case "wtransform":
        B.pt += dt;
        if (Math.random() < 0.9)
          parts.push({
            k: "dot",
            x: B.x + rnd(-95, 95),
            y: GROUND - rnd(0, Math.min(235, B.pt * 115)),
            vx: rnd(-35, 35),
            vy: rnd(-180, -60),
            life: rnd(0.4, 0.9),
            t: 0,
            col: "25,32,58",
            g: -80,
            drag: 1,
            sz: rnd(3, 8),
          });
        if (B.pt > 2.4) {
          B.state = "idle";
          B.cool = 0.3;
          doFlash(0.75, "58,68,105");
          doShake(28);
          addRing(B.x, GROUND - 90, 24, 340, 0.72, "rgba(45,55,92,.95)", 18);
          sfx("boom");
        }
        break;
      case "stunned":
        B.stunT -= dt;
        if (B.stunT <= 0) {
          B.state = "idle";
          B.cool = 0.35;
        }
        break;
      case "dead":
        B.dieT += dt;
        B.h = Math.min(38, B.dieT * 10);
        break;
    }
  }

  function wraithTendril(c, x0, y0, a0, len, width, seed, depth, color) {
    const pts = [{ x: x0, y: y0 }];
    let x = x0, y = y0, a = a0;
    for (let i = 0; i < 8; i++) {
      a += 0.045 + Math.sin(time * 1.8 + seed + i * 0.62) * 0.075;
      x += Math.cos(a) * len / 8;
      y += Math.sin(a) * len / 8;
      pts.push({ x, y });
      if (depth && (i === 3 || i === 6))
        wraithTendril(c, x, y, a + (i === 3 ? 0.72 : -0.68), len * 0.42, width * 0.52, seed + i, depth - 1, color);
    }
    c.lineCap = c.lineJoin = "round";
    limb(c, pts, width, "#03050a", color || "#111827", "#3c4965");
    return pts[pts.length - 1];
  }
  function wraithClaw(c, x, y, angle, spread) {
    c.fillStyle = "#111827";
    c.beginPath();
    c.ellipse(x, y, 7, 5, angle, 0, TAU);
    c.fill();
    for (let i = 0; i < 4; i++) {
      const a = angle + (i - 1.5) * 0.28 + spread * (i - 1.5) * 0.08,
        len = 22 + (i % 2) * 7;
      c.strokeStyle = "#05070d";
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.stroke();
      c.strokeStyle = "#34435f";
      c.lineWidth = 2;
      c.stroke();
      poly(c, [
        [x + Math.cos(a) * len, y + Math.sin(a) * len],
        [x + Math.cos(a) * (len + 9), y + Math.sin(a) * (len + 9)],
        [x + Math.cos(a + 0.45) * (len + 2), y + Math.sin(a + 0.45) * (len + 2)],
      ], "#eef3fb", null);
    }
  }
  function drawWraith(c) {
    const attacking = B.state === "wattack",
      a = B.wattack,
      t = B.pt,
      dark = B.wphase === 2,
      run = B.moving ? 1 : 0;
    let lean = 0.13 + (run ? 0.14 : 0),
      crouch = run ? 7 : Math.sin(time * 1.8) * 2,
      armA = 1.38 + Math.sin(time * 1.7) * 0.06,
      mouth = 0,
      spread = 0,
      tuck = 0,
      whip = 0,
      pounceQ = -1,
      landK = 0;
    if (attacking && a === "combo") {
      const interval = dark ? 0.34 : 0.42,
        k = Math.max(0, (t - 0.2) / interval),
        q = k - Math.floor(k);
      armA = q < 0.48 ? lerp(-2.35, 0.58, ease(q / 0.48)) : lerp(0.58, 1.38, ease((q - 0.48) / 0.52));
      crouch = 10;
      lean = 0.24;
      mouth = q < 0.62 ? Math.sin(q / 0.62 * Math.PI) : 0;
      spread = 1.1;
    } else if (attacking && a === "lash") {
      whip = clamp((t - 0.35) / 0.28, 0, 1) * clamp((1.15 - t) / 0.25, 0, 1);
      crouch = 9 * clamp(t / 0.4, 0, 1);
      lean = 0.1 + 0.25 * whip;
      mouth = clamp((t - 0.22) / 0.24, 0, 1) * clamp((1.15 - t) / 0.3, 0, 1);
      armA = lerp(1.38, -0.6, whip);
    } else if (attacking && a === "pounce") {
      const q = (t % 0.78) / 0.78;
      pounceQ = q;
      landK =
        q < 0.54
          ? 0
          : q < 0.68
            ? ease((q - 0.54) / 0.14)
            : q < 0.92
              ? 1 - ease((q - 0.68) / 0.24)
              : 0;
      crouch = q < 0.22 ? lerp(0, 26, ease(q / 0.22)) : lerp(4, 38, landK);
      tuck = q > 0.22 && q < 0.62 ? Math.sin(((q - 0.22) / 0.4) * Math.PI) : 0;
      lean = 0.28 + landK * 0.42;
      armA = lerp(-0.25, 1.18, landK);
      mouth = q > 0.18 && q < 0.76 ? 1 : 0;
      spread = 1.4;
    } else if (attacking && a === "darkSpear") {
      const interval = dark ? 0.36 : 0.5,
        first = 0.48,
        volleyT = t < first ? t / first : ((t - first) % interval) / interval,
        cast = t < first ? ease(volleyT) : Math.sin(clamp(volleyT / 0.72, 0, 1) * Math.PI);
      crouch = 8 + cast * 5;
      lean = -0.05 + cast * 0.18;
      armA = lerp(-1.55, -0.2, cast);
      mouth = clamp((t - 0.12) / 0.24, 0, 1) * clamp((first + B.wHits * interval + 0.24 - t) / 0.28, 0, 1);
      spread = 0.8 + cast * 0.6;
    } else if (attacking && (a === "pillars" || a === "tendrilWave")) {
      crouch = 12;
      lean = -0.12;
      armA = -1.7;
      mouth = 0.65;
      spread = 1;
    } else if (B.state === "wtransform") {
      crouch = 15;
      lean = Math.sin(B.pt * 22) * 0.05;
      armA = -1.55;
      mouth = 1;
      spread = 1.4;
    } else if (B.state === "dead") {
      crouch = 34;
      lean = -0.48;
      armA = 0.7;
    }
    c.save();
    c.translate(B.x, GROUND - B.h);
    c.scale(B.face * 1.42, 1.42);
    const hipY = -88 + crouch,
      ph = B.stride,
      foot = (off, base) => ({
        x: lerp(lerp(base, -2, tuck) + Math.sin(ph + off) * 22 * run, base * 1.9, landK),
        y: lerp(lerp(-Math.max(0, Math.cos(ph + off)) * 18 * run, -40, tuck), 0, landK),
      }),
      leg = (hx, far, off, base) => {
        const ft = foot(off, base),
          ank = { x: ft.x - 13, y: ft.y - 31 },
          k = ik(hx, hipY, ank.x, ank.y, 45, 45, -1),
          col = far ? "#070a12" : dark ? "#171326" : "#121828";
        limb(c, [{ x: hx, y: hipY }, { x: k.x, y: k.y }, { x: k.tx, y: k.ty }, { x: ft.x + 6, y: ft.y - 3 }], far ? 10 : 13, "#03050a", col, "#34435f");
        for (let j = -1; j <= 1; j++)
          poly(c, [[ft.x, ft.y - 4 + j * 3], [ft.x + 27, ft.y + j * 4], [ft.x + 7, ft.y + 2 + j * 3]], "#111827", "#03050a", 1);
      };
    wraithTendril(c, -20, hipY - 50, Math.PI - 0.4, 92, 11, 1, 2, "#090d18");
    wraithTendril(c, -16, hipY - 34, Math.PI - 0.05, 102, 12, 2, 2, "#090d18");
    leg(-9, true, Math.PI, -13);
    // Far arm stays visible during the pounce and joins the two-handed landing smash.
    {
      const sx = 12,
        sy = hipY - 50,
        airReach = pounceQ >= 0.22 && pounceQ < 0.54,
        hx =
          pounceQ >= 0
            ? lerp(airReach ? 62 : -8, 34, landK)
            : sx + Math.cos(armA + 0.24) * 64,
        hy =
          pounceQ >= 0
            ? lerp(airReach ? hipY - 34 : hipY + 45, -3, landK)
            : sy + Math.sin(armA + 0.24) * 64,
        armLen = pounceQ >= 0 && landK > 0.05 ? 52 : 35,
        elbow = ik(sx, sy, hx, hy, armLen, armLen, -1);
      limb(c, [{ x: sx, y: sy }, { x: elbow.x, y: elbow.y }, { x: elbow.tx, y: elbow.ty }], 8.5, "#03050a", dark ? "#0e0b18" : "#080c15", "#29344d");
      wraithClaw(c, elbow.tx, elbow.ty, Math.atan2(hy - sy, hx - sx), spread * 0.8);
    }
    c.save();
    c.translate(-5, hipY);
    c.rotate(lean);
    c.translate(5, -hipY);
    const grad = c.createLinearGradient(-35, hipY - 72, 35, hipY + 5);
    grad.addColorStop(0, dark ? "#21152f" : "#1a2236");
    grad.addColorStop(1, "#03050a");
    c.fillStyle = grad;
    c.strokeStyle = "#020309";
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(-28, hipY + 4);
    c.bezierCurveTo(-43, hipY - 32, -32, hipY - 70, 1, hipY - 73);
    c.bezierCurveTo(31, hipY - 78, 45, hipY - 60, 35, hipY - 27);
    c.lineTo(19, hipY + 7);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "rgba(125,145,195,.3)";
    c.lineWidth = 1.4;
    for (let j = 0; j < 7; j++) {
      c.beginPath();
      c.moveTo(-24 + j, hipY - 62 + j * 10);
      c.quadraticCurveTo(4, hipY - 67 + j * 10, 31 - j, hipY - 64 + j * 10);
      c.stroke();
    }
    leg(5, false, 0, 13);
    [-2.3, -1.72, -1.05].forEach((ang, j) =>
      wraithTendril(c, -7 + j * 10, hipY - 63, ang, 92 + j * 8, 11, 6 + j, 2, dark ? "#171326" : "#121828"),
    );
    [-0.72, -0.32, 0.02].forEach((ang, j) =>
      wraithTendril(c, -20, hipY - 42 + j * 15, Math.PI + ang, 88 - j * 4, 12 - j, 12 + j, 1, dark ? "#171326" : "#101624"),
    );
    if (whip > 0) {
      const tx = (B.wTargetX - B.x) / (B.face * 1.42);
      for (let j = 0; j < 4; j++) {
        const ox = 5, oy = hipY - 62 + j * 4, ty = -5 + j * 5,
          ex = lerp(-40 - j * 8, tx, ease(whip)),
          mx = (ox + ex) / 2,
          my = Math.min(oy, ty) - 62 + Math.sin(time * 9 + j) * 6;
        [[10, "#03050a"], [7, "#121828"], [2, "#40506d"]].forEach(([w, col]) => {
          c.strokeStyle = col;
          c.lineWidth = w;
          c.beginPath();
          c.moveTo(ox, oy);
          c.quadraticCurveTo(mx, my, ex, ty);
          c.stroke();
        });
      }
    }
    const hx = 50, hy = hipY - 86;
    c.save();
    c.translate(hx, hy);
    c.rotate(0.25 + Math.sin(time * 1.3) * 0.03);
    const skull = c.createRadialGradient(-5, -10, 2, 2, -2, 24);
    skull.addColorStop(0, "#fff");
    skull.addColorStop(0.62, "#eef3fb");
    skull.addColorStop(1, "#7d8ea8");
    c.fillStyle = skull;
    c.beginPath();
    c.ellipse(0, 0, 14, 19, 0, 0, TAU);
    c.fill();
    c.strokeStyle = "#03050a";
    c.lineWidth = 2;
    c.stroke();
    c.shadowColor = "#ff7a1c";
    c.shadowBlur = 13;
    c.fillStyle = "#ff7a1c";
    c.beginPath();
    c.ellipse(5, 3, 5.5, 2.2, 0.25, 0, TAU);
    c.ellipse(-4, 3, 4.7, 2.1, 0.25, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    if (mouth > 0.05) {
      c.fillStyle = "#010207";
      c.beginPath();
      c.ellipse(3, 11 + mouth * 5, 10, 3 + mouth * 10, 0.1, 0, TAU);
      c.fill();
      c.fillStyle = "#fff";
      for (let j = 0; j < 6; j++)
        poly(c, [[-4 + j * 3, 10], [-3 + j * 3, 15 + mouth * 5], [-2 + j * 3, 10]], "#fff", null);
      c.strokeStyle = "#8a1030";
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(5, 15);
      c.quadraticCurveTo(28 * mouth, 25 + Math.sin(time * 12) * 4, 58 * mouth, 18);
      c.stroke();
    }
    for (let j = 0; j < 7; j++)
      wraithTendril(c, -6 + j * 2, 14, 1.45 + j * 0.035, 26 + (j % 3) * 7, 3.5, 30 + j, 0, "#0d1220");
    c.restore();
    c.restore();
    const sx = 23,
      sy = hipY - 57,
      airReach = pounceQ >= 0.22 && pounceQ < 0.54,
      handX =
        pounceQ >= 0
          ? lerp(airReach ? 72 : -12, 58, landK)
          : sx + Math.cos(armA) * 70,
      handY =
        pounceQ >= 0
          ? lerp(airReach ? hipY - 38 : hipY + 45, -2, landK)
          : sy + Math.sin(armA) * 70,
      armLen = pounceQ >= 0 && landK > 0.05 ? 54 : 36,
      elbow = ik(sx, sy, handX, handY, armLen, armLen, 1);
    limb(c, [{ x: sx, y: sy }, { x: elbow.x, y: elbow.y }, { x: elbow.tx, y: elbow.ty }], 10, "#03050a", dark ? "#171326" : "#121828", "#34435f");
    wraithClaw(c, elbow.tx, elbow.ty, armA, spread);
    c.restore();
    if (B.state === "wtransform") {
      const k = clamp(B.pt / 2.1, 0, 1),
        top = GROUND - k * 260;
      c.save();
      const aura = c.createLinearGradient(0, GROUND, 0, top);
      aura.addColorStop(0, "rgba(3,4,10,.96)");
      aura.addColorStop(1, "rgba(28,20,50,0)");
      c.fillStyle = aura;
      c.beginPath();
      c.moveTo(B.x - 105 - k * 45, GROUND);
      for (let j = 0; j <= 12; j++) {
        const xx = B.x - 105 - k * 45 + j * (210 + k * 90) / 12,
          yy = top + Math.sin(j * 2.2 + time * 8) * 28;
        c.lineTo(xx, yy);
      }
      c.lineTo(B.x + 150, GROUND);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(105,115,170,.55)";
      c.lineWidth = 3;
      for (let j = 0; j < 8; j++) {
        c.beginPath();
        c.moveTo(B.x + rnd(-75, 75), GROUND);
        c.quadraticCurveTo(B.x + rnd(-120, 120), GROUND - 120 * k, B.x + rnd(-80, 80), top + rnd(0, 80));
        c.stroke();
      }
      c.restore();
    }
  }
  function drawWraithHazards() {
    for (const h of wraithHazards) {
      ctx.save();
      if (h.kind === "orb") {
        const r = h.radius * (1 + Math.sin(time * 15 + h.t * 5) * 0.12);
        ctx.shadowColor = "#10162d";
        ctx.shadowBlur = 22;
        const g = ctx.createRadialGradient(h.x - 4, h.y - 5, 2, h.x, h.y, r * 1.5);
        g.addColorStop(0, "#9eaccd");
        g.addColorStop(0.25, "#252d49");
        g.addColorStop(0.75, "#070a13");
        g.addColorStop(1, "rgba(2,3,7,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(h.x, h.y, r * 1.5, 0, TAU);
        ctx.fill();
        for (let j = 0; j < 3; j++)
          wraithTendril(ctx, h.x, h.y, time * 2 + j * TAU / 3, 24, 4, j + h.t, 0, "#11182a");
      } else if (h.kind === "wave") {
        if (h.t >= h.delay) {
          const dir = Math.sign(h.vx) || 1;
          for (let j = 0; j < 6; j++) {
            const bx = h.x - dir * j * 22,
              ht = 34 + j * 7 + Math.sin(time * 10 + j) * 8;
            poly(ctx, [[bx - 12, GROUND + 3], [bx, GROUND - ht], [bx + 12, GROUND + 3]], "#0a0e1a", "#34435f", 2);
          }
        }
      } else {
        const pre = h.t < h.delay,
          k = clamp(h.t / h.delay, 0, 1),
          fade = clamp((h.delay + h.life - h.t) / 0.25, 0, 1);
        if (pre) {
          ctx.strokeStyle = "rgba(255,122,28," + (0.35 + k * 0.5) + ")";
          ctx.lineWidth = 3;
          ctx.setLineDash([7, 5]);
          ctx.beginPath();
          ctx.ellipse(h.x, GROUND - 4, h.radius * (1.3 - k * 0.3), h.radius * 0.24, 0, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.globalAlpha = fade;
          const count = h.kind === "pillar" ? 5 : 7;
          for (let j = 0; j < count; j++) {
            const bx = h.x + (j - (count - 1) / 2) * (h.kind === "pillar" ? 10 : 16),
              height = h.kind === "pillar" ? 410 - Math.abs(j - 2) * 28 : 78 - Math.abs(j - 3) * 7;
            poly(ctx, [[bx - 9, GROUND + 3], [bx + Math.sin(time * 10 + j) * 4, GROUND - height], [bx + 9, GROUND + 3]], "#080b15", "#48536f", 2);
          }
        }
      }
      ctx.restore();
    }
  }


  /* ================= EMBERCROWN IRIDESCENT WARDEN (boss 7) ================= */
  const WARDEN_ATTACKS = [
    "meleeCombo", "doubleThrust", "dashChain", "groundStab", "moonWaves",
    "swordDrag", "shadowVolley", "swordThrow", "skySlam", "ruptureCombo", "affinityRift",
    "teleportStrike", "cardinalStorm",
  ];
  function wardenDamage(base) { return Math.round(base); }
  function wardenHitAt(x, radius, dmg, airHeight = 190) {
    const target = bossCombatTarget();
    if (Math.abs(target.x - x) <= radius && GROUND - (target.y || GROUND) < airHeight) {
      if (B.targetSkeleton) damageSkeleton(B.targetSkeleton, wardenDamage(dmg));
      else hurtPlayer(wardenDamage(dmg), x, dmg >= 220);
      return true;
    }
    return false;
  }
  function wardenMelee(dmg, reach = 190, parryable = false) {
    if (B.hitDone) return;
    const target = bossCombatTarget(), ahead = (target.x - B.x) * B.face;
    if (ahead > -35 && ahead < reach && GROUND - (target.y || GROUND) < 185) {
      if (B.targetSkeleton) damageSkeleton(B.targetSkeleton, wardenDamage(dmg));
      else if (!parryable || !tryBasicMeleeParry(B.x, (B.x + P.x) / 2, P.y - 68))
        hurtPlayer(wardenDamage(dmg), B.x, dmg >= 200);
      B.hitDone = true;
    }
  }
  function wardenHazard(kind, data) {
    wardenHazards.push(Object.assign({ kind, t: 0, hit: false }, data));
  }
  function beginWardenPhase2() {
    if (B.ephase === 2 || B.hp <= 0) return;
    B.ephase = 2; B.state = "etransform"; B.pt = 0; B.h = 0; B.eCount = 0; B.eAura = 1;
    B.eAffinity = Math.random() < .5 ? "fire" : "magic";
    wardenHazards.length = 0; musicIntensify(); doShake(25); doFlash(.7, "120,105,190"); sfx("demonRoar");
    addText(B.x, GROUND - 245, "NIGHTLORD AWAKENED — IRIDESCENT RUPTURE", "#dfd2ff", 23, 2.5);
  }
  function startWardenAttack(name) {
    B.state = "eattack"; B.eattack = name; B.pt = 0; B.hitDone = false; B.eCount = 0;
    B.eNext = -1; B.eStarted = false; B.eTargetX = bossCombatTarget().x; B.eStartX = B.x;
    B.eHits = name === "meleeCombo" ? 4 + Math.floor(Math.random() * 3)
      : name === "dashChain" ? 3 + Math.floor(Math.random() * 3) : 0;
    B.last = name; bossFace();
    sfx(["moonWaves", "swordDrag", "shadowVolley", "affinityRift"].includes(name) ? "charge" : "bswing");
  }
  function finishWardenAttack(extra = 0) {
    B.state = "idle"; B.cool = (B.ephase === 2 ? .38 : .62) + rnd(.12, .3) + extra; B.h = 0;
  }
  function wardenChoose() {
    const d = Math.abs(bossCombatTarget().x - B.x);
    let pool = B.ephase === 1
      ? ["meleeCombo", "doubleThrust", "dashChain", "groundStab", "moonWaves", "swordDrag", "shadowVolley", "swordThrow", "skySlam"]
      : WARDEN_ATTACKS.slice();
    if (d < 210) pool = pool.concat(["meleeCombo", "doubleThrust", "groundStab", "ruptureCombo"]);
    if (d > 440) pool = pool.concat(["dashChain", "moonWaves", "shadowVolley", "swordThrow"]);
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick === B.last) pick = pool[(pool.indexOf(pick) + 2) % pool.length];
    startWardenAttack(pick);
  }
  function updateWardenHazards(dt) {
    for (let i = wardenHazards.length - 1; i >= 0; i--) {
      const h = wardenHazards[i]; h.t += dt;
      if (h.kind === "wave" || h.kind === "orb" || h.kind === "thrownSword") {
        if (h.kind === "orb" && h.home) {
          const target = bossCombatTarget(), dx = target.x - h.x, dy = (target.y || GROUND) - 70 - h.y,
            d = Math.hypot(dx, dy) || 1, s = Math.hypot(h.vx, h.vy);
          h.vx = lerp(h.vx, dx / d * s, Math.min(1, dt * 2.4));
          h.vy = lerp(h.vy, dy / d * s, Math.min(1, dt * 2.4));
        }
        if (h.kind === "thrownSword" && h.t > h.life * .5 && !h.returned) { h.returned = true; h.vx *= -1; h.hit = false; }
        h.x += h.vx * dt; h.y += h.vy * dt;
        if (!h.hit) {
          const target = bossCombatTarget(), ty = (target.y || GROUND) - 70;
          if (Math.hypot(target.x - h.x, ty - h.y) < h.radius + 18) {
            h.hit = true;
            if (B.targetSkeleton) damageSkeleton(B.targetSkeleton, h.dmg);
            else hurtPlayer(h.dmg, h.x, h.dmg >= 180);
          }
        }
        if (h.t > h.life || h.x < -180 || h.x > WORLD + 180) wardenHazards.splice(i, 1);
      } else {
        if (!h.hit && h.t >= h.delay) {
          h.hit = true; wardenHitAt(h.x, h.radius, h.dmg, h.airHeight || 220);
          sfx("boom"); doShake(h.kind === "slam" ? 16 : 8);
        }
        if (h.t > h.delay + h.life) wardenHazards.splice(i, 1);
      }
    }
  }
  function spawnWardenFissures(center, count, dmg, spread = 520) {
    for (let i = 0; i < count; i++) wardenHazard("fissure", {
      x: clamp(center + lerp(-spread, spread, count === 1 ? .5 : i / (count - 1)) + rnd(-35, 35), 55, WORLD - 55),
      delay: .62 + (i % 3) * .1, life: .56, dmg, radius: 55,
      col: B.eAffinity === "fire" ? "fire" : "magic",
    });
  }
  function wardenPortal(x, y, life = .55) {
    wardenHazard("portal", { x, y, delay: 0, life, dmg: 0, radius: 0 });
  }
  function wardenTeleportBehindTarget(strike = false) {
    const target = bossCombatTarget(),
      oldX = B.x,
      side = target.face || (target.x >= B.x ? 1 : -1);
    wardenPortal(oldX, GROUND - B.h - 95, .62);
    B.x = clamp(target.x - side * 125, 75, WORLD - 75);
    B.h = 0;
    bossFace();
    wardenPortal(B.x, GROUND - 95, .62);
    addStreak(oldX, GROUND - 105, B.x - oldX, "rgba(130,185,255,.72)", .28);
    spark(oldX, GROUND - 100, 20, "#8ecbff", 420, .4);
    spark(B.x, GROUND - 100, 24, "#d7f2ff", 460, .45);
    if (strike) {
      B.hitDone = false;
      wardenMelee(150, 190);
      addArc(B.x, GROUND - 105, 175, -2.5, .68, B.face, .2, "rgba(175,225,255,.96)", 16);
      sfx("bswing");
    }
  }
  function updateWardenAttack(dt) {
    B.pt += dt; const t = B.pt, target = bossCombatTarget(), a = B.eattack;
    if (a === "meleeCombo") {
      const interval = B.ephase === 2 ? .27 : .33, first = .34;
      if (B.eCount < B.eHits && t >= first + B.eCount * interval) {
        bossFace(); B.hitDone = false; B.x += B.face * (B.eCount % 2 ? 25 : 34);
        wardenMelee(B.eCount === B.eHits - 1 ? 185 : 135, B.eCount === B.eHits - 1 ? 225 : 190, true);
        const fire = B.eCount % 2 === 1;
        addArc(B.x, GROUND - 105, fire ? 178 : 165, fire ? 2.5 : -2.4, fire ? -.45 : .72, B.face, .18, fire ? "rgba(255,105,30,.92)" : "rgba(170,220,255,.94)", 16);
        if (B.ephase === 2) wardenHazard("wave", { x:B.x+B.face*55, y:GROUND-72, vx:B.face*(fire?600:680), vy:0, dmg:95, radius:42, life:2.7, fire });
        sfx("bswing"); B.eCount++;
      }
      if (t > first + B.eHits * interval + .42) finishWardenAttack();
    } else if (a === "doubleThrust") {
      if (t < .34) {
        bossFace();
        B.eStartX = B.x;
        B.eTargetX = B.face;
      }
      if (t >= .34 && t < .68) {
        const k = ease((t - .34) / .34),
          baseDistance = 360,
          rushDistance = baseDistance * (B.ephase === 2 ? 3 : 1);
        B.face = B.eTargetX;
        B.x = B.eStartX + B.face * rushDistance * k;
        if (B.eCount === 0) { B.hitDone=false; wardenMelee(180,250); B.eCount=1; }
      }
      if (t >= .62 && B.eCount === 1) { B.hitDone=false; wardenMelee(210,250); addStreak(B.x,GROUND-105,B.face*250,"rgba(185,225,255,.95)",.2); B.eCount=2; }
      if (t > 1.12) finishWardenAttack();
    } else if (a === "dashChain") {
      const passTime=.43, pass=Math.min(B.eHits-1,Math.floor(t/passTime)), q=(t-pass*passTime)/passTime;
      if(B.eNext!==pass){
        B.eNext=pass;
        if(B.ephase===2&&pass>0&&pass%2===1)wardenTeleportBehindTarget(false);
        bossFace();B.eStartX=B.x;B.hitDone=false;
      }
      if(q<.18) bossFace(); else if(q<.7){B.x+=B.face*(B.ephase===2?1850:1100)*dt;wardenMelee(pass===B.eHits-1?210:150,225);}
      if(t>B.eHits*passTime+.3)finishWardenAttack(.08);
    } else if (a === "groundStab") {
      if(t<.42){bossFace();B.eTargetX=target.x;}
      if(!B.eStarted&&t>=.48){B.eStarted=true;B.x+=B.face*105;B.hitDone=false;wardenMelee(190,245);addStreak(B.x,GROUND-105,B.face*250,"rgba(160,210,255,.9)",.2);}
      if(B.eCount===0&&t>=.9){B.eCount=1;wardenHazard("slam",{x:B.x+B.face*35,delay:.05,life:.55,dmg:320,radius:185});if(B.ephase===2)spawnWardenFissures(B.eTargetX,5,170,360);}
      if(t>1.55)finishWardenAttack(.1);
    } else if (a === "moonWaves") {
      if(B.eCount<3&&t>=.42+B.eCount*.34){bossFace();wardenHazard("wave",{x:B.x+B.face*65,y:GROUND-105+B.eCount*18,vx:B.face*(680+B.eCount*55),vy:0,dmg:125,radius:46,life:3,fire:false});addArc(B.x,GROUND-110,175,-2.5,.65,B.face,.2,"rgba(175,225,255,.95)",15);B.eCount++;sfx("shoot");}
      if(t>1.75)finishWardenAttack();
    } else if (a === "swordDrag") {
      if(t<.5){bossFace();B.eTargetX=target.x;}
      if(B.eCount<7&&t>=.5+B.eCount*.13){const ox=B.x+B.face*45,oy=GROUND-35,dx=target.x-ox,dy=(target.y||GROUND)-70-oy,d=Math.hypot(dx,dy)||1,s=540+B.eCount*18;wardenHazard("orb",{x:ox,y:oy,vx:dx/d*s,vy:dy/d*s,dmg:105,radius:13,life:4,fire:B.eCount%2===1});B.eCount++;sfx("shoot");}
      if(t>1.8)finishWardenAttack(.05);
    } else if (a === "shadowVolley") {
      if(!B.eStarted&&t>=.62){B.eStarted=true;const n=B.ephase===2?12:9;for(let i=0;i<n;i++){const ang=-Math.PI*.92+(Math.PI*.84)*(i/(n-1));wardenHazard("orb",{x:B.x,y:GROUND-150,vx:Math.cos(ang)*330,vy:Math.sin(ang)*330,dmg:90,radius:15,life:5,home:true,fire:false});}sfx("charge");}
      if(t>1.55)finishWardenAttack(.1);
    } else if (a === "swordThrow") {
      if(t<.38)bossFace();
      if(!B.eStarted&&t>=.42){B.eStarted=true;wardenHazard("thrownSword",{x:B.x+B.face*70,y:GROUND-118,vx:B.face*760,vy:0,dmg:220,radius:35,life:1.7,fire:true});sfx("shoot");}
      if(t>1.5)finishWardenAttack();
    } else if (a === "skySlam") {
      if(t<.36){bossFace();B.eTargetX=target.x;}
      else if(t<.82){const k=(t-.36)/.46;B.h=Math.sin(k*Math.PI)*190;B.x=lerp(B.eStartX,clamp(B.eTargetX,80,WORLD-80),ease(k));}
      else if(!B.eStarted){B.eStarted=true;B.h=0;wardenHazard("slam",{x:B.x,delay:.02,life:.62,dmg:340,radius:210});spawnWardenFissures(B.x,7,185,620);}
      if(t>1.62)finishWardenAttack(.12);
    } else if (a === "ruptureCombo") {
      const interval=.29;
      if(B.eCount<4&&t>=.3+B.eCount*interval){bossFace();B.hitDone=false;B.x+=B.face*30;wardenMelee(145,205);addArc(B.x,GROUND-105,170,B.eCount%2?-2.5:2.5,B.eCount%2?.68:-.45,B.face,.17,B.eCount%2?"rgba(170,220,255,.95)":"rgba(255,105,30,.94)",15);B.eCount++;}
      if(t>=1.48&&t<1.9){const k=(t-1.48)/.42;B.h=Math.sin(k*Math.PI)*175;B.x=lerp(B.x,clamp(target.x,80,WORLD-80),Math.min(1,dt*5));}
      if(!B.eStarted&&t>=1.9){B.eStarted=true;B.h=0;wardenHazard("slam",{x:B.x,delay:.02,life:.65,dmg:380,radius:230});spawnWardenFissures(target.x,8,210,700);}
      if(t>2.7)finishWardenAttack(.16);
    } else if (a === "affinityRift") {
      if(!B.eStarted&&t>=.58){B.eStarted=true;B.eAffinity=B.eAffinity==="fire"?"magic":"fire";spawnWardenFissures(target.x,11,240,800);doFlash(.45,B.eAffinity==="fire"?"255,90,25":"120,155,255");}
      if(t>1.75)finishWardenAttack(.14);
    } else if (a === "teleportStrike") {
      if (t < .34) {
        bossFace();
        if (Math.random() < .35)
          spark(B.x + rnd(-40, 40), GROUND - rnd(35, 175), 1, "#9fd8ff", 220, .24);
      }
      if (!B.eStarted && t >= .36) {
        B.eStarted = true;
        wardenTeleportBehindTarget(false);
      }
      if (B.eCount === 0 && t >= .5) {
        B.eCount = 1;
        bossFace();
        B.hitDone = false;
        wardenMelee(150, 190);
        addArc(B.x, GROUND - 105, 175, -2.5, .68, B.face, .2, "rgba(175,225,255,.96)", 16);
        sfx("bswing");
      }
      if (t > 1.02) finishWardenAttack(.06);
    } else if (a === "cardinalStorm") {
      const riseEnd = .82,
        fireEvery = .078,
        fireStart = .9,
        fireEnd = fireStart + 60 * fireEvery;
      if (t < riseEnd) {
        B.h = ease(t / riseEnd) * 225;
        B.x += Math.sin(t * 5) * 42 * dt;
      } else if (t < fireEnd + .55) {
        B.h = 225 + Math.sin(t * 4.8) * 24;
        B.x = clamp(B.x + Math.sin(t * 2.2) * 165 * dt, 190, WORLD - 190);
        while (B.eCount < 60 && t >= fireStart + B.eCount * fireEvery) {
          const side = B.eCount % 4,
            index = Math.floor(B.eCount / 4),
            targetNow = bossCombatTarget(),
            span = lerp(-520, 520, index / 14),
            fire = B.eCount % 2 === 0;
          let x, y, vx, vy;
          if (side === 0) {
            x = clamp(targetNow.x + span, 45, WORLD - 45); y = 15; vx = rnd(-30, 30); vy = rnd(360, 445);
          } else if (side === 1) {
            x = clamp(targetNow.x + span, 45, WORLD - 45); y = GROUND + 75; vx = rnd(-30, 30); vy = -rnd(360, 445);
          } else if (side === 2) {
            x = clamp(targetNow.x - 650, 20, WORLD - 20); y = GROUND - 40 - index * 24; vx = rnd(390, 475); vy = rnd(-35, 35);
          } else {
            x = clamp(targetNow.x + 650, 20, WORLD - 20); y = GROUND - 40 - index * 24; vx = -rnd(390, 475); vy = rnd(-35, 35);
          }
          wardenHazard("orb", { x, y, vx, vy, dmg: 92, radius: 14, life: 5.2, fire, storm: true });
          B.eCount++;
          if (B.eCount % 4 === 0) sfx("shoot");
        }
      } else {
        if (!B.eStarted) {
          B.eStarted = true;
          const oldX = B.x;
          wardenPortal(oldX, GROUND - B.h - 95, .75);
          B.x = clamp(bossCombatTarget().x + (Math.random() < .5 ? -1 : 1) * 240, 80, WORLD - 80);
          B.h = 0;
          wardenPortal(B.x, GROUND - 95, .75);
          doFlash(.38, "120,185,255");
        }
        if (t > fireEnd + 1.25) finishWardenAttack(.18);
      }
    }
    B.x=clamp(B.x,70,WORLD-70);
  }
  function updateWarden(dt) {
    updateWardenHazards(dt); B.eAura=Math.max(0,B.eAura-dt*.4);
    switch(B.state){
      case "intro": B.introFill=Math.min(1,phaseT/1.6); if(!B.roared&&phaseT>.45){B.roared=true;sfx("demonRoar");doShake(18);addRing(B.x,GROUND-95,18,285,.8,"rgba(150,120,220,.85)",10);} break;
      case "idle": {bossFace();const target=bossCombatTarget(),dx=Math.abs(target.x-B.x),spd=B.ephase===2?174:132;if(dx>175){B.x+=B.face*spd*dt;B.moving=true;B.stride+=spd*dt*.075;}else if(dx<95)B.x-=B.face*spd*.32*dt;B.cool-=dt;if(B.cool<=0&&phase==="fight"&&P.state!=="dead")wardenChoose();break;}
      case "eattack": updateWardenAttack(dt); break;
      case "etransform": {
        B.pt += dt;
        const rise = 1.05,
          hoverEnd = 2.05,
          landEnd = 2.72;
        if (B.pt < rise) B.h = ease(B.pt / rise) * 235;
        else if (B.pt < hoverEnd) {
          B.h = 235 + Math.sin(B.pt * 7) * 16;
          B.x += Math.sin(B.pt * 3.4) * 45 * dt;
        } else if (B.pt < landEnd) {
          const k = ease((B.pt - hoverEnd) / (landEnd - hoverEnd));
          B.h = lerp(235, 0, k);
        } else B.h = 0;
        if (Math.random() < .96) {
          const fire = Math.random() < .5;
          spark(
            B.x + rnd(-125, 125),
            GROUND - B.h - rnd(5, 250),
            2,
            fire ? "#ff7a2a" : "#a9d9ff",
            520,
            .62,
            -125,
          );
        }
        if (B.pt >= landEnd && B.eCount === 0) {
          B.eCount = 1;
          wardenHazard("slam", { x: B.x, delay: .03, life: .82, dmg: 320, radius: 255, dual: true });
          for (let i = 0; i < 12; i++)
            wardenHazard("fissure", {
              x: clamp(B.x + lerp(-820, 820, i / 11), 55, WORLD - 55),
              delay: .5 + (i % 3) * .1,
              life: .68,
              dmg: 185,
              radius: 58,
              col: i % 2 ? "fire" : "magic",
            });
          doShake(34);
          doFlash(.95, "175,145,230");
          addRing(B.x, GROUND - 8, 20, 390, .8, "rgba(255,115,35,.75)", 18);
          addRing(B.x, GROUND - 10, 30, 470, .92, "rgba(125,185,255,.72)", 13);
          sfx("boom");
        }
        if (B.pt > 3.65) {
          B.state = "idle";
          B.cool = .3;
          B.h = 0;
          B.eAura = 2;
        }
        break;
      }
      case "stunned": B.stunT-=dt;if(B.stunT<=0){B.state="idle";B.cool=.35;}break;
      case "dead": B.dieT+=dt;B.h=Math.min(42,B.dieT*11);break;
    }
  }
  function wardenCrack(c, pts, seed, width = 2) {
    c.save();
    c.globalAlpha = .7 + Math.sin(time * 4 + seed) * .25;
    c.lineCap = c.lineJoin = "round";
    c.shadowColor = "#ff4a14";
    c.shadowBlur = 9;
    c.strokeStyle = "#ff531a";
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.stroke();
    c.shadowBlur = 0;
    c.strokeStyle = "#ffd49a";
    c.lineWidth = width * .35;
    c.stroke();
    c.restore();
  }
  function drawWardenSword(c, fire, hx, hy, A, len = 120, power = 1) {
    c.save();
    c.translate(hx, hy);
    c.rotate(A);
    c.translate(-11, 0);
    // Wrapped grip and jeweled ring pommel.
    c.fillStyle = fire ? "#1d1013" : "#24283d";
    c.strokeStyle = "#050408";
    c.lineWidth = 1.5;
    c.fillRect(-34, -4, 31, 8);
    c.strokeRect(-34, -4, 31, 8);
    c.strokeStyle = fire ? "#ff7a2a" : "#9ebdff";
    c.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      c.beginPath(); c.moveTo(-32 + i * 4, -4); c.lineTo(-29 + i * 4, 4); c.stroke();
    }
    c.shadowColor = fire ? "#ff5218" : "#70baff";
    c.shadowBlur = 12 + power * 8;
    c.strokeStyle = fire ? "#ff6b22" : "#bfe7ff";
    c.lineWidth = 4;
    c.beginPath(); c.arc(-39, 0, 6, 0, TAU); c.stroke();
    c.shadowBlur = 0;
    // Distinct guards: flame curls for Cinder, crystalline crescent for Moonlight.
    if (fire) {
      poly(c, [[-4,-8],[-10,-20],[-3,-34],[4,-22],[9,-10],[9,10],[4,22],[-3,34],[-10,20],[-4,8]], "#2b171b", "#ff6b22", 1.6);
      wardenCrack(c, [[-6,-18],[0,-11],[4,-24]], 4, 1.4);
      wardenCrack(c, [[-6,18],[0,11],[4,24]], 7, 1.4);
    } else {
      poly(c, [[-5,-7],[-13,-18],[-10,-31],[-3,-22],[7,-10],[7,10],[-3,22],[-10,31],[-13,18],[-5,7]], "#d7e2f5", "#304d88", 1.5);
      c.strokeStyle = "#8eb7ff"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-8,-18); c.lineTo(-5,-27); c.moveTo(-8,18); c.lineTo(-5,27); c.stroke();
    }
    c.shadowColor = fire ? "#ff4a14" : "#68b7ff";
    c.shadowBlur = (fire ? 18 : 28) * power;
    if (fire) {
      const blade = c.createLinearGradient(0, -10, 0, 10);
      blade.addColorStop(0, "#49272b"); blade.addColorStop(.5, "#160d10"); blade.addColorStop(1, "#49272b");
      poly(c, [[8,-9],[len-22,-10],[len+5,0],[len-22,10],[8,9]], blade, "#ff6d24", 1.8);
      c.strokeStyle = "#ff561d"; c.lineWidth = 3;
      c.beginPath();
      for (let x = 13; x < len - 9; x += 4) {
        const y = Math.sin(x * .23 - time * 9) * 2.2;
        x === 13 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
      c.strokeStyle = "#ffe0a5"; c.lineWidth = 1; c.stroke();
      // Layered, moving flame tongues along both edges.
      for (const side of [-1, 1]) {
        for (let i = 0; i < 12; i++) {
          const x = 17 + i * (len - 38) / 11,
            h = 5 + Math.sin(time * 13 + i * 1.7) * 3 + power * 2,
            sway = Math.sin(time * 9 + i * 2.1) * 3;
          poly(c, [[x-5,side*9],[x+sway,side*(9+h)],[x+6,side*9]], "#ff641e", null);
          poly(c, [[x-2,side*9],[x+sway*.65,side*(9+h*.58)],[x+3,side*9]], "#ffe18a", null);
        }
      }
    } else {
      const blade = c.createLinearGradient(0, -11, 0, 11);
      blade.addColorStop(0, "#557fd8"); blade.addColorStop(.32, "#bce5ff"); blade.addColorStop(.5, "#ffffff"); blade.addColorStop(.68, "#bce5ff"); blade.addColorStop(1, "#557fd8");
      poly(c, [[7,-7],[42,-10],[len-27,-11],[len+6,0],[len-27,11],[42,10],[7,7]], blade, "#315995", 1.6);
      c.strokeStyle = "rgba(255,255,255,.72)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(11,0); c.lineTo(len-5,0);
      for (let i = 0; i < 7; i++) { const x=29+i*(len-55)/7; c.moveTo(x,-9); c.lineTo(x+12,-3); c.moveTo(x,9); c.lineTo(x+12,3); }
      c.stroke();
      for (let i = 0; i < 7; i++) {
        const u = (time * .6 + i * .16) % 1,
          x = 18 + u * (len - 28), y = Math.sin(i * 4.7 + time * 4) * 6,
          r = 1.5 + Math.sin(u * Math.PI) * 2;
        c.fillStyle = `rgba(255,255,255,${Math.sin(u*Math.PI)})`;
        poly(c, [[x-r*2,y],[x,y-r],[x+r*2,y],[x,y+r]], "rgba(255,255,255,.86)", null);
      }
    }
    c.shadowBlur = 0;
    c.restore();
  }
  function drawWardenCape(c, run, flare, phase2) {
    const w1 = Math.sin(time * 3) * 4 + run * 13 + flare * 18,
      w2 = Math.sin(time * 2.4 + 1) * 6 + run * 20 + flare * 26;
    c.save();
    c.beginPath();
    c.moveTo(4, -130); c.lineTo(-7, -131);
    c.quadraticCurveTo(-22-w1*.3,-104,-34-w1*.65,-78);
    c.quadraticCurveTo(-46-w1,-46,-70-w2,-8);
    for (let i=1;i<=11;i++) { const u=i/11; c.lineTo(lerp(-70-w2,3,u)+(i%2?5:-4), (i%2?-15:5)+Math.sin(time*3+i)*3); }
    c.lineTo(5,-60); c.closePath();
    const g=c.createLinearGradient(0,-135,0,8);
    g.addColorStop(0,"#35174f"); g.addColorStop(.52,"#6a2f96"); g.addColorStop(.78,phase2?"#ba4b4e":"#8a345f"); g.addColorStop(1,"#f06b1d");
    c.fillStyle=g;c.fill();c.strokeStyle="#050408";c.lineWidth=2;c.stroke();
    c.save();c.clip();
    const ir=c.createLinearGradient(-75,-120,10,0);ir.addColorStop(0,"rgba(65,235,225,0)");ir.addColorStop(.3,"rgba(65,235,225,.24)");ir.addColorStop(.58,"rgba(255,95,215,.2)");ir.addColorStop(.82,"rgba(145,120,255,.2)");ir.addColorStop(1,"rgba(255,150,55,0)");c.fillStyle=ir;c.fillRect(-100,-145,125,160);
    c.fillStyle="#160922";[[-48-w1,-30,6,11],[-29-w1*.5,-16,5,8],[-60-w2*.7,-40,4,8],[-16,-35,3,6]].forEach(q=>{c.beginPath();c.ellipse(q[0],q[1],q[2],q[3],.3,0,TAU);c.fill();});c.restore();
    wardenCrack(c,[[-60-w2,-18],[-50-w2*.8,-31],[-41-w1,-22],[-31-w1,-35]],1,1.8);
    wardenCrack(c,[[-31-w1,-63],[-25-w1,-50],[-33-w1,-44]],9,1.4);
    if (phase2 || flare > .2) {
      c.globalCompositeOperation="lighter"; c.globalAlpha=.45+.2*Math.sin(time*8);
      c.strokeStyle="#ff7628";c.shadowColor="#ff4a14";c.shadowBlur=18;c.lineWidth=3;c.stroke();
      c.strokeStyle="#8ed5ff";c.shadowColor="#67b8ff";c.shadowBlur=20;c.lineWidth=1.8;c.beginPath();c.moveTo(-7,-130);c.quadraticCurveTo(-35-w1,-80,-70-w2,-8);c.stroke();
    }
    c.restore();
  }
  function drawWarden(c) {
    const attacking=B.state==="eattack",a=B.eattack,t=B.pt,phase2=B.ephase===2,run=B.moving?1:0;
    let A=.84+Math.sin(time*2)*.025,A2=.14+Math.sin(time*2+1)*.025,cr=Math.sin(time*1.8)*1.2,
      lean=run?.055:0,trail=false,trail2=false,streak=false,hand=null,hand2=null,flare=0,power=phase2?1.2:1;
    if(attacking&&a==="meleeCombo"){
      const int=phase2?.27:.33,k=Math.max(0,(t-.2)/int),idx=Math.floor(k),q=k-idx;
      if(idx%2===0){A=q<.45?lerp(-2.58,.96,ease(q/.45)):lerp(.96,.84,ease((q-.45)/.55));trail=q>.2&&q<.7;A2=.14;}
      else{A=.84;A2=q<.45?lerp(-2.42,.9,ease(q/.45)):lerp(.9,.14,ease((q-.45)/.55));trail2=q>.2&&q<.7;}
      cr=8;lean=.18+Math.sin(q*Math.PI)*.08;flare=.35;
    } else if(attacking&&(a==="doubleThrust"||a==="dashChain")){
      const q=a==="doubleThrust"?clamp((t-.22)/.52,0,1):(t%.43)/.43;
      A=lerp(-.35,.03,ease(q));A2=lerp(-.62,-.2,ease(q));lean=.25;cr=8;streak=true;hand=[60,-2];hand2=[57,-16];flare=.8;
    } else if(attacking&&(a==="groundStab"||a==="skySlam"||a==="ruptureCombo")){
      const slam=a==="groundStab"?clamp((t-.55)/.42,0,1):clamp((t-.45)/.5,0,1);
      A=lerp(-1.62,1.5,ease(slam));A2=lerp(-1.35,1.28,ease(slam));cr=lerp(7,20,slam);lean=lerp(-.15,.4,slam);trail=trail2=slam>.15&&slam<.88;flare=.7;
    } else if(attacking&&(a==="moonWaves"||a==="swordDrag"||a==="shadowVolley"||a==="affinityRift")){
      const pulse=.5+.5*Math.sin(t*11);A=-1.28+pulse*.2;A2=-1.78-pulse*.16;cr=10;lean=-.09;flare=.7;power=1.45;
    } else if(attacking&&a==="swordThrow"){
      A=.42;A2=lerp(-2.25,.18,ease(clamp(t/.58,0,1)));trail2=t>.16&&t<.7;flare=.5;
    } else if(attacking&&a==="teleportStrike"){
      const q=clamp((t-.34)/.4,0,1);A=lerp(-2.5,.94,ease(q));A2=lerp(-2.2,.72,ease(q));trail=trail2=q>.12&&q<.86;lean=.22;cr=7;flare=1;power=1.55;
    } else if(attacking&&a==="cardinalStorm"){
      A=-.62+Math.sin(t*4)*.12;A2=-2.48-Math.sin(t*4)*.12;cr=5;lean=Math.sin(t*3)*.04;flare=1.4;power=1.65;
    } else if(B.state==="etransform"){
      A=-1.48;A2=-1.82;cr=12;lean=Math.sin(t*22)*.045;flare=1.5;power=1.8;
    } else if(B.state==="dead"){A=.72;A2=.38;cr=33;lean=-.46;}
    c.save();c.translate(B.x,GROUND-B.h);c.scale(B.face*1.42,1.42);
    drawWardenCape(c,run,flare,phase2||B.state==="etransform");
    const hip=-70+cr*.9,ph=B.stride,
      fa={x:-8*(1-run)+Math.sin(ph)*19*run,y:-Math.max(0,Math.cos(ph))*12*run},
      fb={x:8*(1-run)+Math.sin(ph+Math.PI)*19*run,y:-Math.max(0,Math.cos(ph+Math.PI))*12*run};
    const leg=(hx,ft,far)=>{
      const k=ik(hx,hip,ft.x,ft.y,35,35,-1),mid=far?"#201e28":"#3a3743",light=far?"#575361":"#9a96a8";
      limb(c,[{x:hx,y:hip},{x:k.x,y:k.y},{x:k.tx,y:k.ty}],15,"#050408",mid,light);
      c.strokeStyle="#0a0910";c.lineWidth=1.2;
      for(const [p1,p2] of [[{x:hx,y:hip},k],[k,{x:k.tx,y:k.ty}]])for(const u of [.3,.58,.82]){c.beginPath();c.moveTo(lerp(p1.x,p2.x,u)-7,lerp(p1.y,p2.y,u));c.lineTo(lerp(p1.x,p2.x,u)+7,lerp(p1.y,p2.y,u)+1);c.stroke();}
      poly(c,[[k.x-7,k.y-8],[k.x+9,k.y-5],[k.x+15,k.y+2],[k.x+3,k.y+11],[k.x-8,k.y+6]],far?"#5f5a69":"#aaa6b7","#050408",1.4);
      poly(c,[[k.x+7,k.y-2],[k.x+20,k.y-8],[k.x+10,k.y+6]],"#c1bdcc","#050408",1.1);
      poly(c,[[k.tx-10,k.ty-11],[k.tx+5,k.ty-11],[k.tx+24,k.ty-2],[k.tx+27,k.ty+1],[k.tx-11,k.ty+2]],"#17161d","#050408",1.4);
      if(!far)wardenCrack(c,[[k.x-1,k.y+11],[k.x+4,k.y+19],[k.x,k.y+27]],3,1.4);
    };
    leg(-4,fa,true);leg(4,fb,false);
    // Layered tassets over the hips.
    for(let i=0;i<3;i++){const y=hip-6+i*9;poly(c,[[-16,y],[17,y],[20,y+13],[2,y+19],[-18,y+13]],i===1?"#484451":"#85818f","#050408",1.4);}
    c.save();c.translate(0,cr);c.translate(0,-70);c.rotate(lean);c.translate(0,70);
    const drawArm=(near,ang,hp)=>{
      const S={x:near?6:-3,y:-120},H=hp?{x:S.x+hp[0],y:S.y+hp[1]}:{x:S.x+30*Math.cos(ang*.76),y:S.y+30*Math.sin(ang*.76)},e=ik(S.x,S.y,H.x,H.y,24,24,near?1:-1),hasTrail=near?trail:trail2;
      if(hasTrail){c.save();const fire=!near,g=c.createRadialGradient(S.x,S.y,25,S.x,S.y,155);g.addColorStop(0,fire?"rgba(255,225,160,.1)":"rgba(255,255,255,.12)");g.addColorStop(.55,fire?"rgba(255,95,25,.58)":"rgba(130,205,255,.6)");g.addColorStop(1,"rgba(0,0,0,0)");c.strokeStyle=g;c.shadowColor=fire?"#ff4a14":"#6dbbff";c.shadowBlur=22;c.lineWidth=18;c.lineCap="round";c.beginPath();c.arc(S.x,S.y,145,-2.55,ang);c.stroke();c.restore();}
      limb(c,[S,{x:e.x,y:e.y},H],12,"#050408",near?"#3a3743":"#211f29",near?"#aaa6b7":"#676270");
      poly(c,[[e.x-5,e.y-4],[e.x-12,e.y-11],[e.x+1,e.y-6],[e.x+7,e.y]],near?"#aaa6b7":"#696472","#050408",1.1);
      drawWardenSword(c,!near,H.x,H.y,ang,near?124:120,power);
    };
    drawArm(false,A2,hand2);
    // Broad segmented breastplate and V sternum plate.
    const tg=c.createLinearGradient(-19,-130,21,-72);tg.addColorStop(0,"#15141b");tg.addColorStop(.48,"#47434f");tg.addColorStop(1,"#928e9f");
    c.fillStyle=tg;c.strokeStyle="#050408";c.lineWidth=2;c.beginPath();c.moveTo(-18,-124);c.quadraticCurveTo(2,-138,20,-123);c.quadraticCurveTo(26,-99,17,-72);c.lineTo(-15,-72);c.quadraticCurveTo(-23,-99,-18,-124);c.closePath();c.fill();c.stroke();
    for(let i=0;i<5;i++){const y=-101+i*7;c.strokeStyle="#09080e";c.lineWidth=1.5;c.beginPath();c.moveTo(-17,y+2);c.quadraticCurveTo(3,y+7,20,y+1);c.stroke();c.strokeStyle="rgba(225,220,240,.42)";c.lineWidth=.8;c.beginPath();c.moveTo(-15,y);c.quadraticCurveTo(3,y+5,18,y-1);c.stroke();}
    poly(c,[[-8,-123],[12,-123],[6,-104],[2,-95],[-2,-104]],"#706b7a","#050408",1.4);
    wardenCrack(c,[[-9,-115],[-2,-110],[6,-114],[14,-106]],4,2.2);wardenCrack(c,[[1,-94],[8,-86],[2,-79]],6,1.8);
    // Tall layered pauldrons and up-swept spike.
    poly(c,[[-10,-130],[-17,-161],[2,-138]],"#aaa6b7","#050408",1.4);
    for(let i=0;i<3;i++){c.fillStyle=i===2?"#777381":i?"#47434f":"#292731";c.beginPath();c.ellipse(5,-110-i*7,18+i*2,8+i*3,-.15,0,TAU);c.fill();c.strokeStyle="#050408";c.lineWidth=1.6;c.stroke();}
    poly(c,[[-10,-129],[-18,-150],[-9,-142]],"#928e9f","#050408",1.2);
    // Great helm and five-spike crown.
    const hg=c.createLinearGradient(-12,-168,18,-132);hg.addColorStop(0,"#b1adbd");hg.addColorStop(.5,"#47434f");hg.addColorStop(1,"#17161d");
    c.fillStyle=hg;c.strokeStyle="#050408";c.lineWidth=2;c.beginPath();c.moveTo(-10,-134);c.lineTo(-12,-151);c.quadraticCurveTo(-10,-166,3,-168);c.quadraticCurveTo(16,-167,18,-152);c.lineTo(16,-137);c.lineTo(11,-131);c.lineTo(-6,-131);c.closePath();c.fill();c.stroke();
    c.fillStyle="#06050a";c.fillRect(9,-158,3,25);c.fillRect(2,-151,16,3);c.shadowColor="#ff5a1e";c.shadowBlur=10;c.fillStyle="#ff6a22";c.fillRect(10,-153,1.3,11);c.shadowBlur=0;
    poly(c,[[-10,-164],[17,-166],[17,-159],[-10,-158]],"#706b7a","#050408",1.4);
    [[-8,10,-4],[-2,16,-1],[4,24,0],[10,16,2],[16,11,5]].forEach(([x,h,leanX])=>poly(c,[[x-3,-161],[x+3,-162],[x+leanX,-162-h]],"#b6b2c2","#050408",1.3));
    drawArm(true,A,hand);
    c.restore();
    if(streak){c.save();const g=c.createLinearGradient(35,-105,160,-105);g.addColorStop(0,"rgba(255,255,255,.9)");g.addColorStop(.45,"rgba(135,205,255,.65)");g.addColorStop(1,"rgba(75,130,255,0)");c.strokeStyle=g;c.shadowColor="#75bcff";c.shadowBlur=22;c.lineWidth=12;c.beginPath();c.moveTo(32,-105);c.lineTo(162,-105);c.stroke();c.restore();}
    // Mixed fire and moonlight aura, strongest while flying/transformed.
    const aura=(B.state==="etransform"||a==="cardinalStorm")?1:phase2?.32:0;
    if(aura>0){c.save();c.globalCompositeOperation="lighter";for(let i=0;i<18;i++){const u=(time*(.5+aura*.2)+i/18)%1,x=Math.sin(i*5.9+time*2)*72,y=-u*235,r=1.5+aura*2.2*(1-u);c.globalAlpha=(1-u)*(.45+aura*.35);c.fillStyle=i%2?"#ff7a2a":"#a9ddff";c.shadowColor=c.fillStyle;c.shadowBlur=10+aura*14;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}c.restore();}
    c.restore();
    if(attacking&&a==="shadowVolley"){c.save();c.globalAlpha=clamp((t-.15)/.5,0,.48)*clamp((1.5-t)/.35,0,1);c.fillStyle="#02030a";c.fillRect(cam,0,W,H);c.restore();}
  }
  function drawWardenHazards() {
    for (const h of wardenHazards) {
      ctx.save();
      if (h.kind === "wave") {
        const fire = !!h.fire, pulse = 1 + Math.sin(time * 14 + h.t * 6) * .08;
        ctx.translate(h.x, h.y);
        ctx.scale(Math.sign(h.vx) || 1, 1);
        ctx.lineCap = "round";
        const layers = fire
          ? [[30,"rgba(255,65,10,.16)"],[18,"rgba(255,105,20,.5)"],[9,"#ffb24a"],[3,"#fff1b5"]]
          : [[32,"rgba(65,105,255,.14)"],[19,"rgba(95,170,255,.5)"],[9,"#9ddcff"],[3,"#ffffff"]];
        for (const [w,col] of layers) {
          ctx.strokeStyle=col;ctx.lineWidth=w*pulse;ctx.shadowColor=fire?"#ff4a14":"#5bbcff";ctx.shadowBlur=w*.7;
          ctx.beginPath();ctx.arc(0,0,54,-1.12,1.12);ctx.stroke();
        }
        ctx.shadowBlur=0;
        for(let i=0;i<7;i++){const u=(h.t*3+i/7)%1;ctx.globalAlpha=(1-u)*.7;ctx.fillStyle=fire?(i%2?"#ff6b22":"#ffe19a"):(i%2?"#78bfff":"#e8fbff");ctx.beginPath();ctx.arc(-u*75,Math.sin(i*3.1+time*8)*18,2.8*(1-u),0,TAU);ctx.fill();}
      } else if (h.kind === "orb") {
        const fire=!!h.fire,r=h.radius*(1+Math.sin(time*16+h.t*7)*.12),speed=Math.hypot(h.vx,h.vy)||1,ux=h.vx/speed,uy=h.vy/speed;
        // Long luminous motion tail.
        const tail=ctx.createLinearGradient(h.x-ux*70,h.y-uy*70,h.x,h.y);
        tail.addColorStop(0,"rgba(0,0,0,0)");tail.addColorStop(1,fire?"rgba(255,110,25,.7)":"rgba(110,185,255,.75)");
        ctx.strokeStyle=tail;ctx.lineWidth=r*1.1;ctx.lineCap="round";ctx.shadowColor=fire?"#ff4a14":"#58b7ff";ctx.shadowBlur=20;
        ctx.beginPath();ctx.moveTo(h.x-ux*70,h.y-uy*70);ctx.lineTo(h.x,h.y);ctx.stroke();
        const aura=ctx.createRadialGradient(h.x-r*.25,h.y-r*.25,1,h.x,h.y,r*2.3);
        if(fire){aura.addColorStop(0,"#fff7c9");aura.addColorStop(.2,"#ffd05a");aura.addColorStop(.48,"#ff671e");aura.addColorStop(.75,"rgba(180,20,4,.5)");aura.addColorStop(1,"rgba(90,5,0,0)");}
        else{aura.addColorStop(0,"#ffffff");aura.addColorStop(.2,"#dff6ff");aura.addColorStop(.48,"#69bfff");aura.addColorStop(.75,"rgba(65,75,210,.48)");aura.addColorStop(1,"rgba(25,25,100,0)");}
        ctx.fillStyle=aura;ctx.beginPath();ctx.arc(h.x,h.y,r*2.3,0,TAU);ctx.fill();
        ctx.fillStyle=fire?"#fff2a6":"#f1fdff";ctx.beginPath();ctx.arc(h.x,h.y,r*.58,0,TAU);ctx.fill();
        ctx.globalCompositeOperation="lighter";
        for(let j=0;j<5;j++){const ang=time*(fire?5:-4)+j*TAU/5,rr=r*(1.05+j*.12);ctx.strokeStyle=fire?"rgba(255,125,35,.6)":"rgba(125,205,255,.65)";ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(h.x,h.y,rr,ang,ang+1.15);ctx.stroke();}
      } else if (h.kind === "thrownSword") {
        ctx.translate(h.x,h.y);ctx.rotate(h.t*14*Math.sign(h.vx||1));
        ctx.shadowColor="#ff4a14";ctx.shadowBlur=30;drawWardenSword(ctx,true,0,0,0,88,1.45);ctx.shadowBlur=0;
      } else if (h.kind === "portal") {
        const k=clamp(h.t/Math.max(.01,h.life),0,1),fade=Math.sin(k*Math.PI);
        ctx.globalCompositeOperation="lighter";ctx.globalAlpha=fade;
        for(let j=0;j<4;j++){const rr=18+j*12+Math.sin(time*9+j)*4;ctx.strokeStyle=j%2?"rgba(125,205,255,.72)":"rgba(185,135,255,.62)";ctx.shadowColor=j%2?"#63bfff":"#a65cff";ctx.shadowBlur=20;ctx.lineWidth=4-j*.6;ctx.beginPath();ctx.ellipse(h.x,h.y,rr*.45,rr*1.65,0,0,TAU);ctx.stroke();}
        for(let j=0;j<14;j++){const a=j*TAU/14+time*4,r=20+(j%4)*9;ctx.fillStyle=j%2?"#c9f3ff":"#d5a9ff";ctx.fillRect(h.x+Math.cos(a)*r,h.y+Math.sin(a)*r*2,2,6);}
      } else {
        const pre=h.t<h.delay,k=clamp(h.t/Math.max(.01,h.delay),0,1),fade=clamp((h.delay+h.life-h.t)/.3,0,1),fire=h.col==="fire"||h.kind==="firecol",dual=!!h.dual;
        if(pre){
          const rr=h.radius*(1.35-k*.35);
          ctx.fillStyle=fire?`rgba(255,75,18,${.05+k*.16})`:`rgba(100,135,255,${.05+k*.15})`;
          ctx.beginPath();ctx.ellipse(h.x,GROUND-4,rr,rr*.25,0,0,TAU);ctx.fill();
          for(const [w,col] of [[7,fire?"rgba(255,95,22,.5)":"rgba(105,155,255,.5)"],[3,fire?"#ffd080":"#dff5ff"]]){ctx.strokeStyle=col;ctx.shadowColor=fire?"#ff4a14":"#68b8ff";ctx.shadowBlur=18;ctx.lineWidth=w;ctx.setLineDash([10,7]);ctx.beginPath();ctx.ellipse(h.x,GROUND-4,rr,rr*.25,0,0,TAU);ctx.stroke();ctx.setLineDash([]);}
        }else{
          const age=h.t-h.delay,grow=clamp(age/.2,0,1),collapse=fade;
          ctx.globalAlpha=collapse;ctx.globalCompositeOperation="lighter";
          // Expanding shock rings make the ground explosion read smoothly.
          for(let j=0;j<3;j++){const rr=h.radius*grow*(.55+j*.28);ctx.strokeStyle=dual?(j%2?"rgba(255,105,25,.65)":"rgba(115,185,255,.65)"):(fire?"rgba(255,105,25,.7)":"rgba(115,165,255,.7)");ctx.shadowColor=fire?"#ff4a14":"#669dff";ctx.shadowBlur=22;ctx.lineWidth=10-j*2;ctx.beginPath();ctx.ellipse(h.x,GROUND-5,rr,rr*.2,0,0,TAU);ctx.stroke();}
          const count=h.kind==="slam"?13:8;
          for(let j=0;j<count;j++){const bx=h.x+(j-(count-1)/2)*(h.radius*1.75/count),height=(55+Math.sin(j*2.3+time*7)*25+(j%3)*28)*grow,flameFire=dual?j%2===0:fire;
            const grad=ctx.createLinearGradient(0,GROUND,0,GROUND-height);grad.addColorStop(0,flameFire?"rgba(255,55,10,.92)":"rgba(55,85,220,.88)");grad.addColorStop(.5,flameFire?"rgba(255,155,35,.78)":"rgba(95,185,255,.75)");grad.addColorStop(1,flameFire?"rgba(255,245,175,0)":"rgba(225,250,255,0)");ctx.fillStyle=grad;ctx.shadowColor=flameFire?"#ff4a14":"#67bfff";ctx.shadowBlur=24;ctx.beginPath();ctx.moveTo(bx-14,GROUND+3);ctx.quadraticCurveTo(bx-5,GROUND-height*.55,bx+Math.sin(time*11+j)*6,GROUND-height);ctx.quadraticCurveTo(bx+8,GROUND-height*.48,bx+14,GROUND+3);ctx.closePath();ctx.fill();}
          ctx.globalCompositeOperation="source-over";
        }
      }
      ctx.restore();
    }
  }


  /* ================= INFERNAL SHOGUN (boss 4) ================= */
  const SHOGUN_COMBOS = [
    { name: "Blazing Cross", count: 2 },
    { name: "Ember Trinity", count: 3 },
    { name: "Fourfold Judgment", count: 4 },
  ];
  function shogunHaz(kind, x, y, vx, vy, dmg, extra = {}) {
    shogunHazards.push({
      kind,
      x,
      y,
      vx,
      vy,
      dmg,
      t: 0,
      life: extra.life || 3,
      r: extra.r || 16,
      g: extra.g || 0,
      delay: extra.delay || 0,
      hit: false,
      index: extra.index || 0,
    });
  }
  function shogunTarget() {
    return bossCombatTarget();
  }
  function shogunDirectHit(dmg, range = 170, parryable = false) {
    const target = shogunTarget();
    if (target !== P) {
      if (target.hp > 0 && Math.abs(target.x - B.x) < range + 35)
        damageSkeleton(target, bd(dmg));
      return;
    }
    if (Math.abs(P.x - B.x) < range && GROUND - P.y < 155 && P.invuln <= 0) {
      if (!parryable || !tryBasicMeleeParry(B.x, (B.x + P.x) / 2, P.y - 68))
        hurtPlayer(bd(dmg), B.x, true);
    }
  }
  function beginShogunPhase2() {
    B.sphase = 2;
    B.state = "stransform";
    B.phase = "rise";
    B.pt = 0;
    B.h = 0;
    B.cool = 1;
    shogunHazards.length = 0;
    musicIntensify();
    sfx("demonRoar");
    doShake(24);
    doFlash(0.7, "35,10,45");
    addText(
      B.x,
      GROUND - 245,
      "BLACK-FLAME ASCENSION  +20% DAMAGE",
      "#c58cff",
      20,
      2.5,
    );
    addRing(B.x, GROUND - 85, 18, 360, 0.85, "rgba(70,20,95,.96)", 12);
    spark(B.x, GROUND - 90, 75, "#56206f", 850, 1.2, -60);
  }
  function damageShogunMinion(dmg) {
    if (!shogunMinion || shogunMinion.hp <= 0) return;
    shogunMinion.hp = Math.max(0, shogunMinion.hp - dmg);
    shogunMinion.flash = 0.16;
    addText(
      shogunMinion.x,
      GROUND - 130,
      "-" + Math.round(dmg),
      "#ff8f79",
      14,
      0.6,
    );
    spark(shogunMinion.x, GROUND - 70, 12, "#ff4c38", 300, 0.4, 220);
    if (shogunMinion.hp <= 0) {
      shogunMinion.state = "dead";
      shogunMinion.t = 0;
      sfx("hurt");
    }
  }
  function summonShogunMinion() {
    const side = B.face > 0 ? -1 : 1;
    shogunMinion = {
      x: clamp(B.x + side * 95, 50, WORLD - 50),
      hp: 500,
      maxhp: 500,
      face: -side,
      state: "spawn",
      t: 0,
      stride: 0,
      flash: 0,
      attackCD: 0.4,
      alpha: 0,
    };
    addRing(shogunMinion.x, GROUND - 3, 8, 58, 0.6, "rgba(255,45,30,.85)", 5);
    spark(shogunMinion.x, GROUND - 55, 28, "#ff4930", 360, 0.8, -80);
    sfx("skill1");
  }
  function shogunChoose() {
    const r = Math.random(),
      ph = B.sphase,
      d = Math.abs(shogunTarget().x - B.x);
    let pick;
    if (ph === 1) {
      if (d > 430) pick = r < 0.58 ? "arrows" : r < 0.78 ? "lunge" : r < 0.9 ? "lightning" : "rush";
      else pick = r < 0.34 ? "arrows" : ["combo2", "combo3", "lunge", "wave", "lightning", "rush"][Math.floor((r - 0.34) / 0.66 * 6)];
    } else {
      pick = r < 0.30 ? "arrows" : r < 0.45 ? "flyrain" : ["combo3", "combo4", "lunge", "wave", "lightning", "rush", "tele", "darkwaves", "summon"][Math.floor((r - 0.45) / 0.55 * 9)];
      if (pick === "summon" && shogunMinion && shogunMinion.hp > 0) pick = "darkwaves";
    }
    if (pick === B.last && Math.random() < 0.7) pick = d > 300 ? "arrows" : "combo3";
    B.last = pick;
    B.pt = 0;
    B.hitDone = false;
    B.sIndex = 0;
    B.sNext = 0;
    if (pick.startsWith("combo")) {
      B.state = "scombo";
      B.phase = "wind";
      B.sCount = Number(pick.slice(-1));
    } else if (pick === "lunge") {
      B.state = "slunge";
      B.phase = "wind";
      B.sCount = 1 + Math.floor(Math.random() * 2);
    } else if (pick === "wave") {
      B.state = "swave";
      B.phase = "charge";
    } else if (pick === "lightning") {
      B.state = "slightning";
      B.phase = "cast";
      B.sCount = 5;
    } else if (pick === "arrows") {
      B.state = "sarrows";
      B.phase = "draw";
      B.sCount = ph === 2 ? 8 : 6;
    } else if (pick === "rush") {
      B.state = "srush";
      B.phase = "vanish";
    } else if (pick === "tele") {
      B.state = "stele";
      B.phase = "vanish";
    } else if (pick === "flyrain") {
      B.state = "sflyrain";
      B.phase = "rise";
      B.sCount = 8;
    } else if (pick === "darkwaves") {
      B.state = "sdarkwaves";
      B.phase = "cast";
      B.sCount = 6;
    } else {
      B.state = "ssummon";
      B.phase = "cast";
    }
    sfx(pick === "rush" || pick === "tele" ? "dodge" : "charge");
  }
  function updateShogunMinion(dt) {
    const m = shogunMinion;
    if (!m) return;
    m.t += dt;
    m.flash = Math.max(0, m.flash - dt);
    if (m.state === "dead") {
      m.alpha -= dt * 0.75;
      if (m.alpha <= 0) shogunMinion = null;
      return;
    }
    if (m.state === "spawn") {
      m.alpha = Math.min(1, m.alpha + dt * 2.2);
      if (m.t > 0.75) {
        m.state = "walk";
        m.t = 0;
      }
      return;
    }
    m.face = P.x >= m.x ? 1 : -1;
    const d = Math.abs(P.x - m.x);
    m.attackCD = Math.max(0, m.attackCD - dt);
    if (m.state === "attack") {
      if (m.t >= 0.22 && m.t - dt < 0.22 && d < 92 && P.invuln <= 0) {
        hurtPlayer(70, m.x, false);
        addArc(
          m.x,
          GROUND - 70,
          75,
          -2.1,
          0.75,
          m.face,
          0.17,
          "rgba(255,55,40,.9)",
          7,
        );
      }
      if (m.t > 0.58) {
        m.state = "walk";
        m.t = 0;
        m.attackCD = 0.5;
      }
    } else if (d > 72) {
      m.x += m.face * 145 * dt;
      m.stride += dt * 9;
    } else if (m.attackCD <= 0) {
      m.state = "attack";
      m.t = 0;
    }
  }
  function updateShogunHazards(dt) {
    for (let i = shogunHazards.length - 1; i >= 0; i--) {
      const h = shogunHazards[i];
      h.t += dt;
      let dead = h.t > h.life;
      if (h.kind === "lightning") {
        if (h.t >= h.delay && h.t - dt < h.delay) {
          doShake(7);
          sfx("crack");
          spark(
            h.x,
            GROUND - 60,
            28,
            h.index % 2 ? "#b882ff" : "#ffd36b",
            520,
            0.45,
            0,
          );
          damageSkeletonsInRange(h.x, 48, bd(200));
          if (Math.abs(P.x - h.x) < 45 && GROUND - P.y < 170 && P.invuln <= 0)
            hurtPlayer(bd(200), h.x, true);
        }
      } else {
        h.vy += h.g * dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        if (h.kind === "rain" && h.y >= GROUND - 8) {
          damageSkeletonsInRange(h.x, 55, bd(100));
          if (Math.abs(P.x - h.x) < 48 && GROUND - P.y < 110 && P.invuln <= 0)
            hurtPlayer(bd(100), h.x, true);
          spark(h.x, GROUND - 10, 18, "#7d3a9b", 420, 0.4, 120);
          dead = true;
        }
        if (!dead && !h.hit && heroType === "wizard") {
          for (const s of skeletons) {
            if (
              s.hp > 0 &&
              Math.abs(s.x - h.x) < h.r + 15 &&
              Math.abs(GROUND - 60 - h.y) < h.r + 55
            ) {
              damageSkeleton(s, h.dmg);
              h.hit = true;
              dead = true;
              break;
            }
          }
        }
        if (!dead && !h.hit && P.invuln <= 0 && P.state !== "dead") {
          const dx = Math.abs(P.x - h.x),
            dy = Math.abs(P.y - 55 - h.y);
          let hit = dx < h.r + 15 && dy < h.r + 52;
          if (h.kind === "firewave" || h.kind === "darklow")
            hit = dx < h.r + 18 && GROUND - P.y < 78;
          if (h.kind === "darkhigh")
            hit = dx < h.r + 18 && GROUND - P.y > 55 && GROUND - P.y < 155;
          if (hit) {
            hurtPlayer(
              h.dmg,
              h.x,
              h.kind.includes("wave") || h.kind.includes("dark"),
            );
            h.hit = true;
            dead = true;
          }
        }
        if (h.x < -80 || h.x > WORLD + 80 || h.y > GROUND + 80) dead = true;
      }
      if (dead) shogunHazards.splice(i, 1);
    }
  }
  function updateShogun(dt) {
    B.sparryT = Math.max(0, B.sparryT - dt);
    B.moving = false;
    const target = shogunTarget(),
      spd = B.sphase === 2 ? 165 : 125;
    if (B.sphase === 2 && B.state !== "dead" && Math.random() < dt * 24)
      parts.push({
        k: "dot",
        x: B.x + rnd(-35, 35),
        y: GROUND - B.h - rnd(35, 175),
        vx: rnd(-25, 25),
        vy: rnd(-100, -30),
        life: rnd(0.4, 0.9),
        t: 0,
        col: "65,20,85",
        g: -20,
        drag: 1,
        sz: rnd(2, 5),
      });
    switch (B.state) {
      case "intro":
        B.introFill = Math.min(1, phaseT / 1.6);
        if (!B.roared && phaseT > 0.5) {
          B.roared = true;
          sfx("roar");
          doShake(14);
          addRing(B.x, GROUND - 70, 10, 280, 0.8, "rgba(255,85,35,.85)", 7);
        }
        break;
      case "idle": {
        bossFace();
        const dist = Math.abs(target.x - B.x),
          desired = dist > 360 ? B.face * spd : dist < 220 ? -B.face * spd * 0.55 : 0;
        B.moveV += (desired - B.moveV) * Math.min(1, dt * 6.2);
        if (!desired) B.moveV *= Math.max(0, 1 - dt * 8);
        B.x += B.moveV * dt;
        B.moving = Math.abs(B.moveV) > 7;
        B.stride += Math.abs(B.moveV) * dt * 0.047;
        B.moveLean += ((B.moveV / Math.max(1, spd)) * 0.12 - B.moveLean) * Math.min(1, dt * 8);
        if ((B.cool -= dt) <= 0 && phase === "fight" && P.state !== "dead") shogunChoose();
        break;
      }
      case "stransform":
        B.pt += dt;
        B.h = 55 * Math.sin(Math.min(1, B.pt / 2.3) * Math.PI);
        if (Math.random() < 0.8)
          spark(
            B.x + rnd(-45, 45),
            GROUND - B.h - rnd(20, 180),
            1,
            "#4d175f",
            380,
            0.5,
            -80,
          );
        if (B.pt >= 2.65) {
          B.h = 0;
          B.state = "idle";
          B.cool = 0.6;
        }
        break;
      case "scombo": {
        B.pt += dt;
        const wind = B.sIndex === 0 ? 0.56 : 0.46,
          act = 0.18,
          rec = B.sIndex === B.sCount - 1 ? 0.68 : 0.31;
        if (B.phase === "wind") {
          bossFace();
          if (Math.abs(target.x - B.x) > 145) B.x += B.face * 155 * dt;
          if (B.pt >= wind) {
            B.phase = "act";
            B.pt = 0;
            B.hitDone = false;
            sfx("bswing");
            addArc(
              B.x,
              GROUND - 105,
              155,
              B.sIndex % 2 ? -2.5 : 2.5,
              B.sIndex % 2 ? 0.55 : -0.45,
              B.face,
              0.2,
              B.sphase === 2 ? "rgba(90,35,120,.95)" : "rgba(255,90,30,.95)",
              13,
            );
          }
        } else if (B.phase === "act") {
          if (!B.hitDone && B.pt > 0.075) {
            B.hitDone = true;
            shogunDirectHit(130, 185, true);
          }
          if (B.pt >= act) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.pt >= rec) {
          if (++B.sIndex >= B.sCount) {
            B.state = "idle";
            B.cool = 0.62;
          } else {
            B.phase = "wind";
            B.pt = 0;
          }
        }
        break;
      }
      case "slunge":
        B.pt += dt;
        if (B.phase === "wind") {
          bossFace();
          if (B.pt > 0.42) {
            B.phase = "dash";
            B.pt = 0;
            B.hitDone = false;
            sfx("bswing");
          }
        } else if (B.phase === "dash") {
          B.x += B.face * 950 * dt;
          addStreak(
            B.x - B.face * 70,
            GROUND - 92,
            B.face * 150,
            B.sphase === 2 ? "rgba(90,30,120,.9)" : "rgba(255,95,30,.9)",
            0.14,
          );
          if (!B.hitDone && Math.abs(target.x - B.x) < 150) {
            B.hitDone = true;
            shogunDirectHit(150, 170);
          }
          if (B.pt > 0.22) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.pt > 0.26) {
          if (++B.sIndex < B.sCount) {
            B.phase = "wind";
            B.pt = 0;
          } else {
            B.state = "idle";
            B.cool = 0.5;
          }
        }
        break;
      case "swave":
        B.pt += dt;
        bossFace();
        if (B.phase === "charge" && B.pt > 0.6) {
          B.phase = "rec";
          B.pt = 0;
          shogunHaz(
            "firewave",
            B.x + B.face * 70,
            GROUND - 28,
            B.face * 570,
            0,
            bd(200),
            { r: 30, life: 3 },
          );
          sfx("boom");
          addRing(B.x, GROUND - 25, 8, 95, 0.3, "rgba(255,80,25,.9)", 7);
        } else if (B.phase === "rec" && B.pt > 0.65) {
          B.state = "idle";
          B.cool = 0.55;
        }
        break;
      case "sballs":
        B.pt += dt;
        bossFace();
        if (B.phase === "charge" && B.pt > 0.42) {
          B.phase = "fire";
          B.pt = 0;
          B.sNext = 0;
        } else if (
          B.phase === "fire" &&
          B.sIndex < B.sCount &&
          B.pt >= B.sNext
        ) {
          B.sNext += 0.2;
          B.sIndex++;
          const t = shogunTarget(),
            ox = B.x + B.face * 58,
            oy = GROUND - B.h - 118,
            a = Math.atan2((t === P ? P.y - 55 : GROUND - 60) - oy, t.x + (t === P ? P.vx * 0.12 : 0) - ox);
          shogunHaz(
            "fireball",
            ox,
            oy,
            Math.cos(a) * 600,
            Math.sin(a) * 600,
            bd(100),
            { r: 16, life: 3 },
          );
          sfx("beam");
        } else if (
          B.phase === "fire" &&
          B.sIndex >= B.sCount &&
          B.pt > B.sNext + 0.25
        ) {
          B.state = "idle";
          B.cool = 0.5;
        }
        break;
      case "slightning":
        B.pt += dt;
        if (B.phase === "cast" && B.pt > 0.35) {
          const tx = target.x;
          for (let i = 0; i < 5; i++)
            shogunHaz(
              "lightning",
              clamp(tx + rnd(-380, 380), 50, WORLD - 50),
              GROUND,
              0,
              0,
              bd(200),
              { delay: 1.5 + i * 0.08, life: 2, index: i },
            );
          B.phase = "rec";
          B.pt = 0;
          sfx("charge");
        } else if (B.phase === "rec" && B.pt > 2) {
          B.state = "idle";
          B.cool = 0.65;
        }
        break;
      case "sarrows":
        B.pt += dt;
        bossFace();
        if (B.phase === "draw" && B.pt > 0.62) {
          B.phase = "fire";
          B.pt = 0;
          B.sNext = 0;
        } else if (B.phase === "fire" && B.sIndex < B.sCount && B.pt >= B.sNext) {
          B.sNext += 0.16;
          B.sIndex++;
          const t = shogunTarget(),
            ox = B.x + B.face * 48,
            oy = GROUND - 128,
            a = Math.atan2((t === P ? P.y - 55 : GROUND - 60) - oy, t.x - ox);
          shogunHaz(
            "arrow",
            ox,
            oy,
            Math.cos(a) * 820,
            Math.sin(a) * 820,
            bd(80),
            { r: 8, life: 2.8 },
          );
          sfx("shot");
        } else if (
          B.phase === "fire" &&
          B.sIndex >= B.sCount &&
          B.pt > B.sNext + 0.25
        ) {
          B.state = "idle";
          B.cool = 0.48;
        }
        break;
      case "srush":
        B.pt += dt;
        if (B.phase === "vanish" && B.pt > 0.18) {
          B.x = clamp(target.x - B.face * 135, 60, WORLD - 60);
          B.face = target.x >= B.x ? 1 : -1;
          B.phase = "appear";
          B.pt = 0;
          sfx("dodge");
          addRing(B.x, GROUND - 75, 6, 85, 0.25, "rgba(255,75,25,.8)", 5);
        } else if (B.phase === "appear" && B.pt > 0.24) {
          B.state = "idle";
          B.cool = 0.25;
        }
        break;
      case "stele":
        B.pt += dt;
        if (B.phase === "vanish" && B.pt > 0.28) {
          B.x = clamp(
            target.x + (target === P ? -P.face : -B.face) * 105,
            60,
            WORLD - 60,
          );
          B.face = target.x >= B.x ? 1 : -1;
          B.phase = "slash";
          B.pt = 0;
          B.hitDone = false;
          doFlash(0.2, "45,10,60");
        } else if (B.phase === "slash" && !B.hitDone && B.pt > 0.16) {
          B.hitDone = true;
          shogunDirectHit(150, 175);
          addArc(
            B.x,
            GROUND - 105,
            165,
            -2.4,
            0.7,
            B.face,
            0.2,
            "rgba(90,35,125,.98)",
            15,
          );
        } else if (B.phase === "slash" && B.pt > 0.58) {
          B.state = "idle";
          B.cool = 0.45;
        }
        break;
      case "sflyrain":
        B.pt += dt;
        if (B.phase === "rise") {
          B.h = Math.min(185, B.h + 300 * dt);
          if (B.h >= 185) {
            B.phase = "rain";
            B.pt = 0;
            B.sIndex = 0;
            B.sNext = 0;
          }
        } else if (B.phase === "rain" && B.sIndex < 8 && B.pt >= B.sNext) {
          B.sNext += 0.18;
          B.sIndex++;
          shogunHaz(
            "rain",
            clamp(target.x + rnd(-270, 270), 45, WORLD - 45),
            -80 - rnd(0, 100),
            rnd(-30, 30),
            rnd(340, 440),
            bd(100),
            { r: 18, g: 180, life: 4 },
          );
          sfx("beam");
        } else if (
          B.phase === "rain" &&
          B.sIndex >= 8 &&
          B.pt > B.sNext + 0.25
        ) {
          B.phase = "land";
          B.pt = 0;
        } else if (B.phase === "land") {
          B.h = Math.max(0, B.h - 380 * dt);
          if (B.h <= 0) {
            dust(B.x, GROUND, 12);
            B.state = "idle";
            B.cool = 0.6;
          }
        }
        break;
      case "sdarkwaves":
        B.pt += dt;
        bossFace();
        if (B.sIndex < 6 && B.pt >= B.sNext) {
          B.sNext += 0.42;
          const high = B.sIndex % 2 === 1;
          B.sIndex++;
          shogunHaz(
            high ? "darkhigh" : "darklow",
            B.x + B.face * 72,
            high ? GROUND - 118 : GROUND - 28,
            B.face * 510,
            0,
            bd(100),
            { r: high ? 34 : 38, life: 3 },
          );
          sfx("beam");
        } else if (B.sIndex >= 6 && B.pt > B.sNext + 0.35) {
          B.state = "idle";
          B.cool = 0.6;
        }
        break;
      case "ssummon":
        B.pt += dt;
        if (B.pt > 0.58 && !shogunMinion) {
          summonShogunMinion();
        }
        if (B.pt > 1) {
          B.state = "idle";
          B.cool = 0.6;
        }
        break;
      case "stunned":
        if ((B.stunT -= dt) <= 0) {
          B.state = "idle";
          B.cool = 0.5;
        }
        break;
      case "dead":
        B.dieT += dt;
        break;
    }
    B.x = clamp(B.x, 60, WORLD - 60);
  }
  function drawShogunKatana(c, x, y, a, dark = false, size = 1) {
    c.save();
    c.translate(x, y);
    c.rotate(a);
    c.scale(size, size);
    c.strokeStyle = "#120a0b";
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(-15, 0);
    c.lineTo(6, 0);
    c.stroke();
    c.strokeStyle = "#d0a14d";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(1, -8);
    c.lineTo(1, 8);
    c.stroke();
    const g = c.createLinearGradient(5, 0, 100, 0);
    g.addColorStop(0, "#fff7dc");
    g.addColorStop(0.35, dark ? "#74358d" : "#ffbb55");
    g.addColorStop(0.75, dark ? "#1c102b" : "#ff4d22");
    g.addColorStop(1, "rgba(255,255,255,.2)");
    c.strokeStyle = g;
    c.shadowColor = dark ? "#6e2c91" : "#ff5525";
    c.shadowBlur = 18;
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(5, 0);
    c.quadraticCurveTo(58, -4, 100, -12);
    c.stroke();
    c.shadowBlur = 0;
    c.strokeStyle = "#fff6d5";
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(9, -2);
    c.quadraticCurveTo(58, -5, 94, -12);
    c.stroke();
    c.restore();
  }
  function shogunObj() {
    const st = B.state,
      idleA = 0.92;
    const o = {
      x: B.x,
      y: GROUND - B.h,
      face: B.face,
      scale: 1.43,
      run: B.moving ? 0.78 : 0,
      phase: B.stride,
      swordA: idleA + Math.sin(time * 1.7) * 0.025,
      offA: 1.42,
      handR: 31,
      crouch: 5,
      lean: B.moveLean || 0,
      cast: 0,
      bow: false,
      bowDraw: 0,
      wingSpread: B.sphase === 2 ? 0.34 : 0.13,
      dark: B.sphase === 2,
      alpha: (st === "srush" || st === "stele") && B.phase === "vanish" ? 0.22 : 1,
      flash: B.flash > 0 || B.sparryT > 0,
      rot: 0,
    };
    if (st === "scombo") {
      const first = B.sIndex === 0,
        wind = first ? 0.56 : 0.46,
        rec = B.sIndex === B.sCount - 1 ? 0.68 : 0.31,
        windA = [-2.08, 2.42, -1.72, 2.72][B.sIndex % 4],
        hitA = [0.72, -0.58, 1.02, -0.78][B.sIndex % 4];
      if (B.phase === "wind") {
        const k = easeOut(clamp(B.pt / wind, 0, 1));
        o.swordA = lerp(idleA, windA, k);
        o.handR = lerp(31, 25, k);
        o.crouch = 5 + 8 * k;
        o.lean -= 0.16 * k;
      } else if (B.phase === "act") {
        const k = ease(clamp(B.pt / 0.18, 0, 1));
        o.swordA = lerp(windA, hitA, k);
        o.handR = lerp(25, 43, k);
        o.crouch = 10 - 4 * k;
        o.lean += lerp(-0.1, 0.3, k);
      } else {
        const k = easeOut(clamp(B.pt / rec, 0, 1));
        o.swordA = lerp(hitA, idleA, k);
        o.handR = lerp(43, 31, k);
        o.lean += 0.19 * (1 - k);
      }
      o.run = 0;
    } else if (st === "slunge") {
      const k = B.phase === "wind" ? ease(clamp(B.pt / 0.42, 0, 1)) : 1;
      o.swordA = lerp(idleA, -0.04, k);
      o.handR = lerp(31, 48, k);
      o.crouch = B.phase === "dash" ? 17 : 5 + 10 * k;
      o.lean += B.phase === "dash" ? 0.46 : -0.14 * k;
      o.run = 0;
      o.wingSpread += B.phase === "dash" ? 0.22 : 0;
    } else if (st === "sarrows") {
      o.bow = true;
      o.bowDraw = B.phase === "draw"
        ? ease(clamp(B.pt / 0.62, 0, 1))
        : Math.max(0.08, 1 - (B.pt % 0.16) / 0.1);
      o.crouch = 7;
      o.lean -= 0.08 + o.bowDraw * 0.04;
      o.run = 0;
    } else if (st === "sflyrain") {
      o.bow = true;
      o.bowDraw = B.phase === "rain" ? 0.82 : 0.35;
      o.crouch = 2;
      o.lean += 0.06;
      o.wingSpread = 1;
      o.run = 0;
    } else if (st === "stele") {
      o.swordA = B.phase === "slash" ? lerp(-2.35, 0.72, ease(clamp(B.pt / 0.25, 0, 1))) : -1.6;
      o.handR = 42;
      o.crouch = 10;
      o.lean += 0.28;
      o.run = 0;
      o.wingSpread += 0.25;
    } else if (st === "swave" || st === "sdarkwaves") {
      o.swordA = -1.28;
      o.offA = -0.72;
      o.cast = 1;
      o.crouch = 8;
      o.lean -= 0.1;
      o.run = 0;
    } else if (st === "slightning" || st === "ssummon" || st === "sballs") {
      o.offA = -1.12;
      o.swordA = 1.3;
      o.cast = 1;
      o.crouch = 7;
      o.run = 0;
    } else if (st === "stransform") {
      o.swordA = -1.55;
      o.offA = -1.72;
      o.crouch = 10;
      o.lean -= 0.12;
      o.wingSpread = ease(clamp(B.pt / 1.4, 0, 1));
      o.cast = 1;
      o.run = 0;
    } else if (st === "stunned") {
      o.swordA = 1.68;
      o.offA = 0.8;
      o.crouch = 27;
      o.lean += 0.34;
      o.run = 0;
    } else if (st === "dead") {
      o.swordA = 1.65;
      o.crouch = 28;
      o.lean += 0.42;
      o.rot = -Math.min(1.15, B.dieT * 0.65);
      o.alpha *= clamp(1 - (B.dieT - 1.1) / 2.2, 0, 1);
      o.run = 0;
    }
    return o;
  }
  function drawShogun(c, o = shogunObj()) {
    const run = o.run || 0,
      ph = o.phase || 0,
      crouch = o.crouch || 0,
      hipY = -43 + crouch * 0.72,
      stepBob = run * Math.abs(Math.sin(ph)) * 2.7,
      p = {
        ink: "#040507",
        black: o.dark ? "#070812" : "#0a0b0f",
        lacquer: o.dark ? "#171426" : "#25151a",
        red: o.dark ? "#421449" : "#771d24",
        red2: o.dark ? "#713066" : "#b13638",
        gold: "#bc8f47",
        gold2: "#f0ce82",
        silver: "#d9d7ca",
        steel: "#77808b",
      };
    c.save();
    c.translate(o.x, o.y - stepBob);
    c.scale(o.face * o.scale, o.scale);
    c.rotate((o.lean || 0) + (o.rot || 0) + Math.sin(ph) * run * 0.014);
    c.globalAlpha = o.alpha;
    if (o.flash) c.filter = "brightness(2.25) saturate(.45)";

    // Articulated feathered wings. Folded in neutral poses, fully opened only in flight/phase actions.
    const ws = clamp(o.wingSpread || 0, 0, 1),
      beat = Math.sin(time * (ws > 0.7 ? 6.2 : 2.15) + ph * 0.18),
      lift = beat * (4 + ws * 12);
    c.save();
    c.globalAlpha *= 0.66 + ws * 0.25;
    for (const side of [-1, 1]) {
      const root = { x: side * 9, y: -92 },
        elbow = { x: side * (17 + ws * 47), y: -118 - lift * side },
        tip = { x: side * (26 + ws * 95), y: -66 - ws * 48 - lift * side };
      c.strokeStyle = p.ink;
      c.lineWidth = 8;
      c.beginPath(); c.moveTo(root.x, root.y); c.quadraticCurveTo(elbow.x, elbow.y, tip.x, tip.y); c.stroke();
      c.strokeStyle = o.dark ? "#515672" : "#69303a";
      c.lineWidth = 4;
      c.stroke();
      for (let i = 0; i < 8; i++) {
        const q = i / 7,
          bx = lerp(root.x, tip.x, q),
          by = lerp(root.y, tip.y, q) + Math.sin(q * Math.PI) * -18,
          len = (17 + i * 4.5) * (0.48 + ws * 0.52),
          tx = bx + side * len,
          ty = by + 23 + i * 3.5 + lift * side * q;
        c.fillStyle = i % 2 ? p.black : p.lacquer;
        c.strokeStyle = p.ink;
        c.lineWidth = 1.1;
        c.beginPath();
        c.moveTo(bx, by);
        c.quadraticCurveTo(bx + side * len * .58, by - 7, tx, ty);
        c.quadraticCurveTo(bx + side * len * .42, by + 9, bx, by);
        c.fill(); c.stroke();
        c.strokeStyle = "rgba(179,72,78,.28)";
        c.beginPath(); c.moveTo(bx + side * 4, by + 1); c.lineTo(tx - side * 4, ty - 1); c.stroke();
      }
    }
    c.restore();

    // Torn crimson scarf/cape responds to locomotion and attacks.
    const cloth = Math.sin(time * 2.7 + ph * 0.1) * 4 - run * 12 - (B.state === "slunge" ? 18 : 0);
    c.save();
    const cg = c.createLinearGradient(-8, -97, -55, -18);
    cg.addColorStop(0, p.red2); cg.addColorStop(.52, p.red); cg.addColorStop(1, "#18070b");
    c.fillStyle = cg; c.strokeStyle = p.ink; c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-11, -94); c.lineTo(12, -92); c.lineTo(18 + cloth, -52);
    c.lineTo(30 + cloth, -11); c.lineTo(17 + cloth, 2); c.lineTo(7 + cloth, -7);
    c.lineTo(-3 + cloth, 5); c.lineTo(-12 + cloth, -8); c.lineTo(-25 + cloth, -1);
    c.lineTo(-27 + cloth, -49); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = "rgba(238,88,82,.36)"; c.lineWidth = 1;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-5 + i * 7, -88); c.quadraticCurveTo(-8 + cloth, -45, -10 + cloth + i * 9, -8); c.stroke(); }
    c.restore();

    // Legs use the same IK system as Heroes 3 and 4.
    let f1 = { x: -9 + Math.sin(ph) * 17 * run, y: -Math.max(0, Math.cos(ph)) * 9 * run },
      f2 = { x: 9 + Math.sin(ph + Math.PI) * 17 * run, y: -Math.max(0, Math.cos(ph + Math.PI)) * 9 * run };
    if (B.h > 5) { f1 = { x: -15, y: -16 }; f2 = { x: 18, y: -25 }; }
    if (B.state === "slunge" && B.phase === "dash") { f1 = { x: -24, y: -2 }; f2 = { x: 23, y: -1 }; }
    const leg = (hx, f, far) => {
      const k = ik(hx, hipY, f.x, f.y, 25, 26, -1);
      limb(c, [{x:hx,y:hipY},{x:k.x,y:k.y},{x:k.tx,y:k.ty}], 12, p.ink, far ? "#111117" : p.lacquer, p.steel);
      // layered greave
      c.save(); c.translate(k.x,k.y); c.rotate(Math.atan2(k.ty-k.y,k.tx-k.x));
      poly(c,[[-5,-7],[17,-7],[23,0],[17,7],[-5,7]],far?"#17131a":"#2c1a20",p.ink,1.2);
      c.strokeStyle=p.gold; c.lineWidth=1; for(let x=2;x<18;x+=6){c.beginPath();c.moveTo(x,-6);c.lineTo(x,6);c.stroke();}
      c.restore();
      c.fillStyle=p.black; c.strokeStyle=p.ink; c.lineWidth=1;
      c.beginPath(); c.ellipse(k.tx+4,k.ty-2,12,4.7,0,0,TAU); c.fill(); c.stroke();
    };
    leg(-6,f1,true); leg(6,f2,false);

    // Hakama and plated waist move independently from the legs.
    const skirtSway = Math.sin(time * 2.2 + ph * .1) * 2 - run * 5;
    poly(c,[[-18,hipY-5],[18,hipY-5],[27+skirtSway,1],[14+skirtSway,-5],[6+skirtSway,4],[-3+skirtSway,-6],[-14+skirtSway,3],[-27+skirtSway,-5]],p.black,p.ink,1.5);
    for(let i=-2;i<=2;i++) poly(c,[[i*8-5,hipY-3],[i*8+4,hipY-3],[i*8+7,-17],[i*8,-11],[i*8-7,-18]],i%2?p.lacquer:p.red,p.gold,1);

    c.save();
    c.translate(0,crouch*.55);
    // Layered black-lacquer torso with red lacing and gold trim.
    const armorG=c.createLinearGradient(-22,-92,23,-43);
    armorG.addColorStop(0,p.black); armorG.addColorStop(.45,p.lacquer); armorG.addColorStop(1,"#09090d");
    c.fillStyle=armorG; c.strokeStyle=p.ink; c.lineWidth=1.8;
    c.beginPath(); c.moveTo(-23,-82); c.quadraticCurveTo(0,-100,24,-82); c.lineTo(18,-45); c.quadraticCurveTo(0,-35,-18,-46); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle=p.gold; c.lineWidth=1.5;
    for(let y=-80;y<=-50;y+=8){c.beginPath();c.moveTo(-18,y);c.quadraticCurveTo(0,y+5,18,y);c.stroke();}
    c.strokeStyle=p.red2; c.lineWidth=2;
    for(let x=-12;x<=12;x+=8){c.beginPath();c.moveTo(x-4,-84);c.lineTo(x+4,-47);c.stroke();}
    c.fillStyle=p.gold2; c.beginPath(); c.arc(0,-45,4.5,0,TAU); c.fill(); c.strokeStyle=p.ink; c.stroke();

    // Multi-layer shoulder armor creates a stronger samurai silhouette.
    const shoulderPlate=(x,y,far)=>{
      for(let i=0;i<3;i++){
        const yy=y+i*7, out=x+(x<0?-i*4:i*4);
        poly(c,[[out-14,yy-6],[out+14,yy-5],[out+12,yy+5],[out-12,yy+6]],i===0?p.gold:(far?p.lacquer:p.red),p.ink,1.2);
        c.strokeStyle=i===0?p.gold2:p.gold; c.lineWidth=.9; c.beginPath();c.moveTo(out-10,yy-3);c.lineTo(out+10,yy-2);c.stroke();
      }
    };
    shoulderPlate(-23,-82,true); shoulderPlate(23,-82,false);

    // Hair knot and wind-reactive black mane behind the mask.
    c.fillStyle="#050609"; c.beginPath(); c.ellipse(-2,-116,21,25,0,0,TAU); c.fill();
    const hairWind=Math.sin(time*3+ph*.12)*3-run*8-(B.state==="slunge"?10:0);
    c.lineCap="round";
    for(let i=0;i<6;i++){c.strokeStyle=i%2?"#08090d":"#15131a";c.lineWidth=5-i*.45;c.beginPath();c.moveTo(-8,-118+i*4);c.bezierCurveTo(-22,-125+i*4,-30+hairWind,-110+i*6,-40+hairWind-i*2,-99+i*8);c.stroke();}
    c.lineCap="butt";
    c.fillStyle=p.black; c.strokeStyle=p.ink; c.lineWidth=1.3;
    c.beginPath(); c.ellipse(1,-139,6.5,11,-0.12,0,TAU); c.fill(); c.stroke();
    c.strokeStyle=p.red2; c.lineWidth=2.4; c.beginPath(); c.moveTo(-5,-135); c.lineTo(7,-137); c.stroke();
    c.strokeStyle="#15131a"; c.lineWidth=5; c.lineCap="round"; c.beginPath(); c.moveTo(2,-147); c.quadraticCurveTo(11,-157,5,-164); c.stroke(); c.lineCap="butt";

    // Silver-gold oni mask based on the supplied reference, with readable eyes and jaw.
    const mg=c.createLinearGradient(-16,-124,17,-91); mg.addColorStop(0,"#fff7dc");mg.addColorStop(.45,p.silver);mg.addColorStop(1,"#706b61");
    c.fillStyle=mg;c.strokeStyle=p.ink;c.lineWidth=1.7;
    c.beginPath();c.moveTo(-16,-121);c.lineTo(-9,-130);c.lineTo(0,-126);c.lineTo(10,-130);c.lineTo(17,-119);c.lineTo(14,-102);c.lineTo(7,-91);c.lineTo(0,-86);c.lineTo(-8,-92);c.lineTo(-15,-103);c.closePath();c.fill();c.stroke();
    // brow horns and engraved curls
    poly(c,[[-12,-122],[-23,-133],[-16,-113]],p.gold2,p.ink,1); poly(c,[[12,-122],[23,-133],[16,-113]],p.gold2,p.ink,1);
    c.strokeStyle=p.gold;c.lineWidth=1.4;
    c.beginPath();c.moveTo(0,-125);c.lineTo(0,-89);c.moveTo(-12,-105);c.quadraticCurveTo(0,-97,12,-105);c.moveTo(-10,-115);c.quadraticCurveTo(-4,-121,0,-113);c.quadraticCurveTo(5,-121,11,-114);c.stroke();
    poly(c,[[-14,-108],[-5,-104],[-7,-97],[-15,-101]],"#aaa99f",p.ink,.9);
    poly(c,[[14,-108],[5,-104],[7,-97],[15,-101]],"#8f8d84",p.ink,.9);
    poly(c,[[-3,-113],[3,-113],[5,-101],[0,-96],[-5,-101]],p.gold2,p.ink,.9);
    c.fillStyle=o.dark?"#cf83ef":"#ff3b31";c.shadowColor=c.fillStyle;c.shadowBlur=9;
    c.beginPath();c.ellipse(-6,-111,3.4,2.2,-.15,0,TAU);c.ellipse(7,-111,3.4,2.2,.15,0,TAU);c.fill();c.shadowBlur=0;
    c.fillStyle="#171016";c.beginPath();c.moveTo(-8,-98);c.quadraticCurveTo(0,-90,9,-98);c.lineTo(5,-89);c.lineTo(0,-86);c.lineTo(-5,-90);c.closePath();c.fill();
    c.fillStyle="#eee7d5"; for(let i=0;i<4;i++){const xx=-5+i*3.2;c.beginPath();c.moveTo(xx,-96);c.lineTo(xx+1.2,-91);c.lineTo(xx+2.1,-96);c.fill();}

    const frontS={x:20,y:-80}, backS={x:-20,y:-79};
    const drawArm=(S,T,far)=>{const e=ik(S.x,S.y,T.x,T.y,19,20,far?-1:1);limb(c,[S,{x:e.x,y:e.y},{x:e.tx,y:e.ty}],12,p.ink,far?p.black:p.lacquer,p.steel);c.fillStyle=p.gold;c.beginPath();c.arc(T.x,T.y,4.5,0,TAU);c.fill();return e;};
    if(o.bow){
      const draw=clamp(o.bowDraw||0,0,1), bowHand={x:40,y:-91}, stringHand={x:5-draw*24,y:-91};
      drawArm(backS,stringHand,true); drawArm(frontS,bowHand,false);
      drawDemonBow(c,bowHand.x+2,bowHand.y,0,draw,o.dark?12:7);
    }else{
      const swordHand={x:frontS.x+Math.cos(o.swordA)*o.handR,y:frontS.y+Math.sin(o.swordA)*o.handR};
      drawArm(backS,{x:backS.x+Math.cos(o.offA)*27,y:backS.y+Math.sin(o.offA)*27},true);
      drawArm(frontS,swordHand,false);
      drawShogunKatana(c,swordHand.x,swordHand.y,o.swordA,o.dark,1.02);
      if(o.cast){const gg=c.createRadialGradient(backS.x,backS.y,1,backS.x,backS.y,24);gg.addColorStop(0,"#fff");gg.addColorStop(.25,o.dark?"#b77bdd":"#ffb75b");gg.addColorStop(1,"rgba(80,20,100,0)");c.fillStyle=gg;c.beginPath();c.arc(backS.x+Math.cos(o.offA)*27,backS.y+Math.sin(o.offA)*27,24,0,TAU);c.fill();}
    }
    c.restore();
    c.restore();
  }
  function drawShogunMinion(c, m) {
    if (!m) return;
    const spawn = m.state === "spawn" ? ease(clamp(m.t / 0.75, 0, 1)) : 1,
      dead = m.state === "dead",
      run = m.state === "walk" ? 1 : 0,
      atk = m.state === "attack" ? clamp(m.t / 0.35, 0, 1) : 0;
    c.save();
    c.translate(m.x, GROUND + (1 - spawn) * 55);
    c.scale(m.face * 0.82, 0.82);
    c.globalAlpha = m.alpha;
    if (m.flash > 0) c.filter = "brightness(3)";
    if (dead) c.rotate(-1.2 * clamp(m.t / 0.6, 0, 1));
    c.translate(
      Math.sin(atk * Math.PI) * 15,
      -run * Math.abs(Math.sin(m.stride)) * 3,
    );
    let f1 = { x: -8 + Math.sin(m.stride) * 14 * run, y: 0 },
      f2 = { x: 8 + Math.sin(m.stride + Math.PI) * 14 * run, y: 0 };
    const leg = (hx, f) => {
      const k = ik(hx, -35, f.x, f.y, 20, 21, -1);
      limb(
        c,
        [
          { x: hx, y: -35 },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        9,
        "#08070a",
        "#24171d",
        "#4d2831",
      );
    };
    leg(-4, f1);
    leg(4, f2);
    poly(
      c,
      [
        [-12, -40],
        [12, -40],
        [20, -2],
        [8, -10],
        [2, 2],
        [-7, -9],
        [-17, -1],
      ],
      "#17131a",
      "#050407",
      1.4,
    );
    poly(
      c,
      [
        [-17, -85],
        [17, -85],
        [20, -47],
        [-18, -47],
      ],
      "#28212a",
      "#080609",
      1.5,
    );
    c.strokeStyle = "#8c2630";
    for (let y = -79; y < -50; y += 8) {
      c.beginPath();
      c.moveTo(-15, y);
      c.lineTo(15, y);
      c.stroke();
    }
    const a = m.state === "attack" ? lerp(-2.2, 0.7, ease(atk)) : -0.6,
      sh = { x: 14, y: -75 },
      h = { x: sh.x + Math.cos(a) * 35, y: sh.y + Math.sin(a) * 35 },
      e = ik(sh.x, sh.y, h.x, h.y, 18, 18, -1);
    limb(
      c,
      [
        { x: sh.x, y: sh.y },
        { x: e.x, y: e.y },
        { x: h.x, y: h.y },
      ],
      10,
      "#080609",
      "#2a2028",
      "#59404b",
    );
    drawShogunKatana(c, h.x, h.y, a, false, 0.72);
    c.fillStyle = "#d8d0bd";
    c.strokeStyle = "#25232a";
    c.lineWidth = 1.6;
    c.beginPath();
    c.ellipse(0, -101, 14, 17, 0, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = "#111018";
    c.beginPath();
    c.ellipse(-5, -105, 3, 4, 0, 0, TAU);
    c.ellipse(5, -105, 3, 4, 0, 0, TAU);
    c.fill();
    poly(
      c,
      [
        [-18, -119],
        [-8, -128],
        [0, -122],
        [10, -129],
        [18, -117],
      ],
      "#211820",
      "#080609",
      1.4,
    );
    c.scale(m.face, 1);
    if (m.hp < m.maxhp && !dead) {
      c.fillStyle = "rgba(0,0,0,.8)";
      c.fillRect(-25, -142, 50, 5);
      c.fillStyle = "#ef4738";
      c.fillRect(-24, -141, (48 * m.hp) / m.maxhp, 3);
    }
    c.restore();
  }
  function drawShogunHazards() {
    for (const h of shogunHazards) {
      ctx.save();
      if (h.kind === "lightning") {
        const k = clamp(h.t / h.delay, 0, 1);
        ctx.strokeStyle = k > 0.75 ? "#ffe49a" : "rgba(255,100,55,.8)";
        ctx.lineWidth = 2 + 3 * k;
        ctx.setLineDash([10, 7]);
        ctx.beginPath();
        ctx.ellipse(h.x, GROUND, lerp(65, 18, k), 10, 0, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        if (h.t >= h.delay && h.t < h.delay + 0.18) {
          ctx.strokeStyle = h.index % 2 ? "#c999ff" : "#fff0a5";
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 20;
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.moveTo(h.x + rnd(-8, 8), 0);
          ctx.lineTo(h.x - 12, 160);
          ctx.lineTo(h.x + 9, 285);
          ctx.lineTo(h.x, GROUND);
          ctx.stroke();
        }
      } else if (h.kind === "arrow") {
        ctx.translate(h.x, h.y);
        ctx.rotate(Math.atan2(h.vy, h.vx));
        ctx.strokeStyle = "#ff6338";
        ctx.shadowColor = "#ff421f";
        ctx.shadowBlur = 9;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(15, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(8, -5);
        ctx.lineTo(8, 5);
        ctx.closePath();
        ctx.fillStyle = "#ffd080";
        ctx.fill();
      } else if (
        h.kind === "firewave" ||
        h.kind === "darklow" ||
        h.kind === "darkhigh"
      ) {
        const dark = h.kind !== "firewave";
        ctx.fillStyle = dark ? "rgba(55,18,78,.8)" : "rgba(255,70,25,.8)";
        ctx.shadowColor = dark ? "#6f2b91" : "#ff4c22";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(h.x - h.vx * 0.07, h.y + 25);
        ctx.quadraticCurveTo(
          h.x,
          h.y - 68 - Math.sin(time * 14) * 12,
          h.x + h.vx * 0.065,
          h.y + 22,
        );
        ctx.closePath();
        ctx.fill();
      } else {
        const dark = h.kind === "rain";
        const g = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, h.r * 1.8);
        g.addColorStop(0, "#fff");
        g.addColorStop(0.28, dark ? "#a569c8" : "#ffb45c");
        g.addColorStop(1, dark ? "rgba(45,10,65,0)" : "rgba(255,45,20,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r * 1.8, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Shared bow renderer retained for the Infernal Shogun.
  function drawDemonBow(c, x, y, A, draw = 0, glow = 0) {
    c.save();
    c.translate(x, y);
    c.rotate(A);
    const pull = 13 + clamp(draw, 0, 1) * 25;
    c.shadowColor = "#9fd7ff";
    c.shadowBlur = glow + 4;
    c.strokeStyle = "#05070b";
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(0, -48);
    c.quadraticCurveTo(24, 0, 0, 48);
    c.stroke();
    const metal = c.createLinearGradient(-3, -48, 12, 48);
    metal.addColorStop(0, "#dceaf2");
    metal.addColorStop(0.35, "#536779");
    metal.addColorStop(0.7, "#111923");
    metal.addColorStop(1, "#a9c5d7");
    c.strokeStyle = metal;
    c.lineWidth = 4.5;
    c.beginPath();
    c.moveTo(0, -48);
    c.quadraticCurveTo(22, 0, 0, 48);
    c.stroke();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(220,240,255,.9)";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(0, -48);
    c.lineTo(-pull, 0);
    c.lineTo(0, 48);
    c.stroke();
    c.strokeStyle = "#d6efff";
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(-pull - 9, 0);
    c.lineTo(69, 0);
    c.stroke();
    c.fillStyle = "#d6efff";
    c.beginPath();
    c.moveTo(73, 0);
    c.lineTo(62, -4);
    c.lineTo(64, 0);
    c.lineTo(62, 4);
    c.closePath();
    c.fill();
    c.fillStyle = "#111722";
    c.fillRect(-pull - 13, -5, 8, 10);
    c.restore();
  }
  /* ================= SHATTERED DEMON (boss 3) ================= */
  const PAL_D = {
    flesh: "#5b211f",
    flesh2: "#8f4034",
    bone: "#d2bea3",
    bone2: "#8a7767",
    dark: "#1b0b0d",
    lava: "#ff3b18",
    iron: "#34292b",
    edge: "#ff9b75",
  };
  const RECT_D = {
    sweep: { x0: 10, x1: 225, h0: 0, h1: 105 },
    over: { x0: 0, x1: 205, h0: 0, h1: 195 },
    rise: { x0: -12, x1: 205, h0: 0, h1: 190 },
    thrust: { x0: 0, x1: 220, h0: 20, h1: 165 },
  };
  const dAtk = (
    type,
    dmg,
    w = 0.52,
    a = 0.15,
    r = 0.3,
    lunge = 76,
    weapon = "hammer",
  ) => ({ type, w, a, r, lunge, rect: RECT_D[type], stop: 125, dmg, weapon });
  const DCOMBOS = [
    {
      name: "Fist Pair",
      atks: [
        dAtk("thrust", 80, 0.42, 0.13, 0.23, 72, "fist"),
        dAtk("over", 80, 0.38, 0.14, 0.72, 65, "fist"),
      ],
    },
    {
      name: "Hammer Pair",
      atks: [
        dAtk("over", 100, 0.58, 0.15, 0.26, 75),
        dAtk("sweep", 100, 0.48, 0.15, 0.8, 72),
      ],
    },
    {
      name: "Ruin Triple",
      atks: [
        dAtk("sweep", 100, 0.48),
        dAtk("over", 100, 0.38),
        dAtk("rise", 100, 0.44, 0.14, 0.82),
      ],
    },
    {
      name: "Fivefold Sentence",
      atks: [
        dAtk("over", 100, 0.48),
        dAtk("sweep", 100, 0.33),
        dAtk("rise", 100, 0.32),
        dAtk("thrust", 100, 0.31),
        dAtk("over", 100, 0.43, 0.15, 0.9),
      ],
    },
  ];
  const DBLADES = [
    {
      name: "Twin Blades",
      atks: [
        dAtk("sweep", 100, 0.38, 0.12, 0.22, 88, "blade"),
        dAtk("rise", 100, 0.31, 0.12, 0.72, 82, "blade"),
      ],
    },
    {
      name: "Tri-Cut",
      atks: [
        dAtk("over", 100, 0.38, 0.12, 0.2, 88, "blade"),
        dAtk("sweep", 100, 0.28, 0.12, 0.2, 80, "blade"),
        dAtk("rise", 100, 0.3, 0.12, 0.7, 75, "blade"),
      ],
    },
    {
      name: "Fivefold Rend",
      atks: [0, 1, 2, 3, 4].map((_, i) =>
        dAtk(
          ["sweep", "over", "rise", "thrust", "sweep"][i],
          100,
          0.27,
          0.11,
          i === 4 ? 0.75 : 0.17,
          78,
          "blade",
        ),
      ),
    },
  ];
  function beginDemonPhase(n) {
    B.prevDPhase = B.dphase;
    B.dphase = n;
    B.rage = n > 1;
    B.state = "transform";
    B.phase = "grow";
    B.pt = 0;
    B.combo = null;
    B.h = 0;
    B.hitDone = true;
    musicIntensify();
    demonHazards.length = 0;
    doShake(n === 2 ? 22 : 28);
    doFlash(0.65, n === 2 ? "180,25,15" : "255,45,20");
    sfx("demonRoar");
    addRing(B.x, GROUND - 100, 20, 360, 0.9, "rgba(255,55,25,.9)", 12);
    spark(
      B.x,
      GROUND - 110,
      70,
      n === 2 ? "#ff5a32" : "#ffb08e",
      850,
      1.1,
      100,
    );
    addText(
      B.x,
      GROUND - 260,
      n === 2 ? "WE DIDN'T EVEN START YET" : "YOU ARE NO MATCH FOR ME",
      "#ffd1bd",
      22,
      2.4,
    );
  }
  function demonDamage(n) {
    return Math.round(n * (B.dphase === 3 ? 1.3 : 1));
  }
  function dHaz(kind, x, y, vx, vy, dmg, extra = {}) {
    demonHazards.push(
      Object.assign(
        { kind, x, y, vx, vy, dmg, t: 0, life: 4, r: 15, g: 0, hit: false },
        extra,
      ),
    );
  }
  function demonChoose() {
    const d = Math.abs(bossCombatTarget().x - B.x),
      r = Math.random(),
      ph = B.dphase;
    let pick;
    if (ph === 1)
      pick =
        d > 320 ? (r < 0.6 ? "cast" : "combo") : r < 0.67 ? "combo" : "cast";
    else if (ph === 2)
      pick = ["combo", "cast", "rush", "quake", "laser", "jump", "sky"][
        Math.floor(r * 7)
      ];
    else
      pick = [
        "combo",
        "cast",
        "rush",
        "quake",
        "laser",
        "jump",
        "sky",
        "knives",
        "teleport",
      ][Math.floor(r * 9)];
    if (pick === B.last && Math.random() < 0.65) pick = "combo";
    B.last = pick;
    if (pick === "combo") {
      const pool = ph === 3 ? DBLADES : DCOMBOS;
      let choices = ph === 1 ? pool : pool;
      let i = Math.floor(Math.random() * choices.length);
      B.combo = choices[i];
      B.ci = 0;
      B.state = "combo";
      startBossAtk();
    } else if (pick === "cast") {
      B.state = "dcast";
      B.phase = "charge";
      B.pt = 0;
      B.mode = Math.random() < 0.5 ? "orb" : "wave";
      B.shots = ph === 1 ? 1 : 3;
      B.shotNext = 0;
      sfx("charge");
    } else if (pick === "rush") {
      B.state = "drush";
      B.phase = "wind";
      B.pt = 0;
      B.rn = 3;
      B.rfirst = true;
    } else if (pick === "quake") {
      B.state = "dquake";
      B.phase = "wind";
      B.pt = 0;
      B.shots = 3;
      B.shotNext = 1.5;
    } else if (pick === "laser") {
      B.state = "dlaser";
      B.phase = "charge";
      B.pt = 0;
      B.shots = 3 + Math.floor(Math.random() * 2);
      B.shotNext = 0.7;
      sfx("charge");
    } else if (pick === "jump") {
      B.state = "djump";
      B.phase = "crouch";
      B.pt = 0;
      B.jn = 2 + Math.floor(Math.random() * 2);
      B.jfirst = true;
    } else if (pick === "sky") {
      B.state = "dsky";
      B.phase = "charge";
      B.pt = 0;
      B.shots = 4 + Math.floor(Math.random() * 5);
      sfx("charge");
    } else if (pick === "knives") {
      B.state = "dknives";
      B.phase = "throw";
      B.pt = 0;
      B.shots = 7 + Math.floor(Math.random() * 5);
      B.shotNext = 0.28;
    } else {
      B.state = "dtele";
      B.phase = "vanish";
      B.pt = 0;
    }
  }
  function demonMelee(dt) {
    const a = B.atk;
    B.pt += dt;
    const w = a.w * (B.dphase === 3 ? 0.78 : B.dphase === 2 ? 0.9 : 1);
    if (B.phase === "wind") {
      if (B.pt < w * 0.55) bossFace();
      if (B.pt > w * 0.28 && Math.abs(bossCombatTarget().x - B.x) > a.stop)
        B.x += B.face * (a.lunge / (w * 0.72)) * dt;
      if (B.pt >= w) {
        B.phase = "act";
        B.pt = 0;
        B.hitDone = false;
        bossSlashFx(a);
      }
    } else if (B.phase === "act") {
      bossStrike(a);
      if (B.state !== "combo") return;
      if (B.pt >= a.a) {
        B.phase = "rec";
        B.pt = 0;
      }
    } else if (B.pt >= a.r * (B.dphase === 3 ? 0.78 : 0.9)) {
      if (++B.ci >= B.combo.atks.length) {
        B.state = "idle";
        B.cool = rnd(0.42, 0.75);
      } else startBossAtk();
    }
  }
  function demonImpact(x, dmg, wave) {
    sfx("crack");
    doShake(18);
    dust(x, GROUND, 20);
    spark(x, GROUND - 12, 28, "#ff5a32", 650, 0.55, 260);
    addRing(x, GROUND - 4, 12, 230, 0.48, "rgba(255,70,30,.95)", 9);
    if (wave) {
      const dir = P.x >= x ? 1 : -1;
      dHaz("wave", x + dir * 35, GROUND - 9, dir * 520, 0, dmg, {
        life: 3,
        r: 24,
      });
      fx.push({ k: "groundburst", x, y: GROUND, life: 0.48, t: 0, r1: 260 });
    } else {
      damageSkeletonsInRange(x, 230, demonDamage(dmg));
      if (Math.abs(P.x - x) < 230 && GROUND - P.y < 76 && P.invuln <= 0)
        hurtPlayer(demonDamage(dmg), x, true);
    }
  }
  function demonGroundQuake(dmg) {
    sfx("crack");
    doShake(25);
    doFlash(0.28, "255,70,30");
    dust(B.x, GROUND, 28);
    spark(B.x, GROUND - 8, 42, "#ff5a32", 760, 0.65, 260);
    addRing(B.x, GROUND - 2, 18, 720, 0.62, "rgba(255,72,28,.95)", 13);
    addRing(B.x, GROUND - 2, 12, 1150, 0.78, "rgba(255,165,70,.72)", 7);
    fx.push({
      k: "groundburst",
      x: B.x,
      y: GROUND,
      life: 0.82,
      t: 0,
      r1: 1100,
    });
    for (
      let x = Math.max(20, B.x - 700);
      x < Math.min(WORLD - 20, B.x + 700);
      x += 85
    )
      parts.push({
        k: "dot",
        x,
        y: GROUND - rnd(0, 8),
        vx: rnd(-80, 80),
        vy: rnd(-240, -90),
        life: rnd(0.45, 0.8),
        t: 0,
        col: "255,70,30",
        g: 520,
        drag: 1,
        sz: rnd(3, 7),
      });
    damageSkeletonsInRange(B.x, 1200, demonDamage(dmg));
    if (GROUND - P.y < 82 && P.invuln <= 0 && P.state !== "dead")
      hurtPlayer(demonDamage(dmg), B.x, true);
  }
  function updateDemon(dt) {
    B.parryT = Math.max(0, (B.parryT || 0) - dt);
    if (B.ghostDelay > 0) B.ghostDelay -= dt;
    else if (B.ghost > B.hp) B.ghost = Math.max(B.hp, B.ghost - 700 * dt);
    const spd = B.dphase === 3 ? 175 : B.dphase === 2 ? 145 : 105;
    if (B.dphase > 1 && B.state !== "dead" && Math.random() < 0.45)
      parts.push({
        k: "dot",
        x: B.x + rnd(-48, 48),
        y: GROUND - B.h - rnd(20, 205),
        vx: rnd(-20, 20),
        vy: rnd(-110, -35),
        life: rnd(0.5, 1.1),
        t: 0,
        col: B.dphase === 3 ? "255,70,30" : "170,45,30",
        g: 0,
        drag: 1,
        sz: rnd(2, 5),
      });
    switch (B.state) {
      case "intro":
        B.introFill = Math.min(1, phaseT / 1.6);
        if (!B.roared && phaseT > 0.5) {
          B.roared = true;
          sfx("demonRoar");
          doShake(20);
          addRing(B.x, GROUND - 90, 10, 330, 0.85, "rgba(255,65,30,.85)", 9);
        }
        break;
      case "transform":
        B.pt += dt;
        if (Math.random() < 0.8)
          spark(
            B.x + rnd(-60, 60),
            GROUND - rnd(10, 210),
            1,
            "#ff5a32",
            300,
            0.45,
            -60,
          );
        if (B.pt >= 2.65) {
          B.state = "idle";
          B.phase = "";
          B.cool = 0.65;
        }
        break;
      case "idle":
        bossFace();
        if (Math.abs(bossCombatTarget().x - B.x) > 155) {
          B.x += B.face * spd * dt;
          B.moving = true;
          B.stride += spd * dt * 0.055;
        }
        if ((B.cool -= dt) <= 0 && phase === "fight" && P.state !== "dead")
          demonChoose();
        break;
      case "combo":
        demonMelee(dt);
        break;
      case "dcast": {
        B.pt += dt;
        const charge = 0.82;
        if (B.phase === "charge") {
          bossFace();
          if (Math.random() < 0.8) {
            const a = rnd(0, TAU),
              rr = rnd(55, 115);
            parts.push({
              k: "gather",
              sx: B.x + Math.cos(a) * rr,
              sy: GROUND - 115 + Math.sin(a) * rr,
              tx: B.x + B.face * 58,
              ty: GROUND - 118,
              life: 0.4,
              t: 0,
              x: 0,
              y: 0,
              gc: "255,65,35",
            });
          }
          if (B.pt >= charge) {
            B.phase = "fire";
            B.pt = 0;
            B.shotNext = 0;
          }
        } else if (B.phase === "fire" && B.shots > 0 && B.pt >= B.shotNext) {
          B.shotNext += 0.31;
          B.shots--;
          if (B.mode === "orb") {
            const target = bossCombatTarget(),
              tx = target.x,
              ty = target === P ? P.y - 52 : GROUND - 58,
              ox = B.x + B.face * 62,
              oy = GROUND - 118,
              ang = Math.atan2(ty - oy, tx - ox);
            dHaz(
              "orb",
              ox,
              oy,
              Math.cos(ang) * 560,
              Math.sin(ang) * 560,
              demonDamage(100),
              { r: 17, life: 3 },
            );
            sfx("beam");
          } else {
            demonImpact(B.x, 100, true);
          }
          if (B.shots <= 0) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.phase === "rec" && B.pt > 0.72) {
          B.state = "idle";
          B.cool = 0.45;
        }
        break;
      }
      case "drush": {
        B.pt += dt;
        if (B.phase === "wind") {
          bossFace();
          if (B.pt > 0.42) {
            B.phase = "dash";
            B.pt = 0;
            B.rdir = B.face;
            B.rmoved = 0;
            B.rdist = Math.max(520, Math.abs(bossCombatTarget().x - B.x) + 200);
            B.hitDone = false;
            sfx("bswing");
          }
        } else if (B.phase === "dash") {
          const q = 1550 * dt;
          B.x += B.rdir * q;
          B.rmoved += q;
          addStreak(
            B.x - B.rdir * 110,
            GROUND - 95,
            B.rdir * 150,
            "rgba(255,60,35,.75)",
            0.13,
          );
          if (!B.hitDone && heroType === "wizard") {
            for (const s of skeletons) {
              if (s.hp > 0 && Math.abs(s.x - B.x) < 125) {
                damageSkeleton(s, demonDamage(150));
                B.hitDone = true;
                break;
              }
            }
          }
          if (
            !B.hitDone &&
            Math.abs(P.x - B.x) < 120 &&
            GROUND - P.y < 140 &&
            P.invuln <= 0
          ) {
            hurtPlayer(demonDamage(150), B.x, true);
            B.hitDone = true;
          }
          if (
            B.rmoved >= B.rdist ||
            B.pt > 0.5 ||
            B.x < 85 ||
            B.x > WORLD - 85
          ) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.pt > 0.16) {
          if (--B.rn > 0) {
            B.phase = "wind";
            B.pt = 0;
          } else {
            B.state = "dair";
            B.phase = "up";
            B.pt = 0;
            B.jx0 = B.x;
            B.jx1 = clamp(bossCombatTarget().x - B.face * 55, 100, WORLD - 100);
          }
        }
        break;
      }
      case "dair":
        B.pt += dt;
        if (B.phase === "up") {
          const k = Math.min(1, B.pt / 0.72);
          B.x = lerp(B.jx0, B.jx1, k);
          B.h = 4 * 270 * k * (1 - k);
          if (k >= 1) {
            B.h = 0;
            demonGroundQuake(200);
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.pt > 0.82) {
          B.state = "idle";
          B.cool = 0.55;
        }
        break;
      case "dquake":
        B.pt += dt;
        if (B.shots > 0 && B.pt >= B.shotNext) {
          B.shots--;
          demonGroundQuake(200);
          if (B.shots > 0) {
            B.pt = 0;
            B.shotNext = 1.5;
            B.phase = "wind";
          } else {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.phase === "rec" && B.pt > 0.8) {
          B.state = "idle";
          B.cool = 0.5;
        }
        break;
      case "dlaser":
        B.pt += dt;
        if (B.shots > 0 && B.pt >= B.shotNext) {
          B.shotNext += 0.56;
          B.shots--;
          const target = bossCombatTarget(),
            ox = B.x + B.face * 70,
            oy = GROUND - 145,
            tx = target.x,
            ty = target === P ? P.y - 55 : GROUND - 58,
            ang = Math.atan2(ty - oy, tx - ox);
          dHaz(
            "laser",
            ox,
            oy,
            Math.cos(ang) * 390,
            Math.sin(ang) * 390,
            demonDamage(100),
            { r: 11, life: 4 },
          );
          sfx("beam");
          if (B.shots === 0) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.phase === "rec" && B.pt > 0.65) {
          B.state = "idle";
          B.cool = 0.5;
        }
        break;
      case "djump":
        B.pt += dt;
        if (B.phase === "crouch") {
          bossFace();
          if (B.pt > 0.38) {
            B.phase = "air";
            B.pt = 0;
            B.jx0 = B.x;
            B.jx1 = clamp(bossCombatTarget().x, 100, WORLD - 100);
          }
        } else if (B.phase === "air") {
          const k = Math.min(1, B.pt / 0.55);
          B.x = lerp(B.jx0, B.jx1, k);
          B.h = 4 * 230 * k * (1 - k);
          if (k >= 1) {
            B.h = 0;
            demonImpact(B.x, 200, false);
            if (--B.jn > 0) {
              B.phase = "crouch";
              B.pt = 0;
            } else {
              B.phase = "rec";
              B.pt = 0;
            }
          }
        } else if (B.pt > 0.6) {
          B.state = "idle";
          B.cool = 0.48;
        }
        break;
      case "dsky":
        B.pt += dt;
        if (B.phase === "charge" && B.pt > 0.9) {
          const target = bossCombatTarget();
          for (let i = 0; i < B.shots; i++)
            dHaz(
              "sky",
              clamp(target.x + rnd(-330, 330), 45, WORLD - 45),
              rnd(-180, -30),
              rnd(-30, 30),
              rnd(260, 390),
              demonDamage(60),
              { g: 220, r: 14, life: 4 },
            );
          B.phase = "rec";
          B.pt = 0;
          sfx("demonRoar");
        } else if (B.phase === "rec" && B.pt > 0.8) {
          B.state = "idle";
          B.cool = 0.5;
        }
        break;
      case "dknives":
        B.pt += dt;
        if (B.shots > 0 && B.pt >= B.shotNext) {
          B.shotNext += 0.13;
          B.shots--;
          const target = bossCombatTarget(),
            ox = B.x + B.face * 65,
            oy = GROUND - 120 + rnd(-45, 45),
            tx = target.x,
            ty = target === P ? P.y - 55 : GROUND - 58,
            ang = Math.atan2(ty + rnd(-35, 35) - oy, tx - ox);
          dHaz(
            "knife",
            ox,
            oy,
            Math.cos(ang) * 720,
            Math.sin(ang) * 720,
            demonDamage(60),
            { r: 9, life: 2.8 },
          );
          sfx("knife");
          if (!B.shots) {
            B.phase = "rec";
            B.pt = 0;
          }
        } else if (B.phase === "rec" && B.pt > 0.62) {
          B.state = "idle";
          B.cool = 0.45;
        }
        break;
      case "dtele":
        B.pt += dt;
        if (B.phase === "vanish" && B.pt > 0.32) {
          const target = bossCombatTarget();
          B.x = clamp(target.x - B.face * 105, 85, WORLD - 85);
          B.face = target.x >= B.x ? 1 : -1;
          B.phase = "slash";
          B.pt = 0;
          doFlash(0.25, "255,45,20");
          sfx("knife");
        } else if (B.phase === "slash" && B.pt > 0.22 && !B.hitDone) {
          B.hitDone = true;
          addArc(
            B.x,
            GROUND - 115,
            160,
            -2.5,
            0.7,
            B.face,
            0.2,
            "rgba(255,80,45,.95)",
            16,
          );
          damageSkeletonsInRange(B.x, 175, demonDamage(200));
          if (Math.abs(P.x - B.x) < 175 && P.invuln <= 0)
            hurtPlayer(demonDamage(200), B.x, true);
        } else if (B.phase === "slash" && B.pt > 0.65) {
          B.state = "idle";
          B.cool = 0.55;
          B.hitDone = false;
        }
        break;
      case "stunned":
        if ((B.stunT -= dt) <= 0) {
          B.state = "idle";
          B.cool = 0.5;
        }
        break;
      case "dead":
        B.dieT += dt;
        if (Math.random() < 0.8)
          parts.push({
            k: "dot",
            x: B.x + rnd(-60, 60),
            y: GROUND - rnd(0, 210),
            vx: rnd(-40, 40),
            vy: rnd(-150, -40),
            life: rnd(0.7, 1.5),
            t: 0,
            col: "255,60,30",
            g: -20,
            drag: 0.5,
            sz: rnd(3, 7),
          });
        break;
    }
  }
  function updateDemonHazards(dt) {
    for (let i = demonHazards.length - 1; i >= 0; i--) {
      const h = demonHazards[i];
      h.t += dt;
      h.vy += h.g * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      let dead = h.t > h.life || h.x < -50 || h.x > WORLD + 50;
      if (h.kind === "wave") h.y = GROUND - 9;
      if (h.kind === "sky" && h.y >= GROUND - 8) {
        h.y = GROUND - 8;
        demonImpact(h.x, 60, false);
        dead = true;
      }
      if (!dead && !h.hit && heroType === "wizard") {
        for (const s of skeletons) {
          const dx = Math.abs(s.x - h.x),
            dy = Math.abs(GROUND - 58 - h.y);
          let hit = dx < h.r + 15 && dy < h.r + 55;
          if (h.kind === "wave") hit = dx < h.r + 18;
          if (s.hp > 0 && s.state !== "spawn" && hit) {
            damageSkeleton(s, h.dmg);
            h.hit = true;
            dead = true;
            break;
          }
        }
      }
      if (!dead && !h.hit && P.state !== "dead" && P.invuln <= 0) {
        const dy = Math.abs(P.y - 52 - h.y),
          dx = Math.abs(P.x - h.x);
        let hit = dx < h.r + 15 && dy < h.r + 52;
        if (h.kind === "wave") hit = dx < h.r + 18 && GROUND - P.y < 75;
        if (hit) {
          hurtPlayer(h.dmg, h.x, h.kind === "wave" || h.kind === "sky");
          h.hit = true;
          dead = true;
        }
      }
      if (Math.random() < 0.55)
        parts.push({
          k: "dot",
          x: h.x,
          y: h.y,
          vx: -h.vx * 0.04,
          vy: -h.vy * 0.04,
          life: 0.24,
          t: 0,
          col: "255,65,30",
          g: 0,
          drag: 2,
          sz: h.kind === "knife" ? 2 : 5,
        });
      if (dead) {
        spark(h.x, Math.min(h.y, GROUND - 6), 7, "#ff6a3d", 300, 0.32);
        demonHazards.splice(i, 1);
      }
    }
  }
  function drawDemonSmashWarning() {
    if (
      B.type !== "demon" ||
      B.state !== "dquake" ||
      B.phase !== "wind" ||
      B.shots <= 0
    )
      return;
    const k = clamp(B.pt / 1.5, 0, 1),
      remain = Math.max(0, 1.5 - B.pt),
      r = lerp(90, 720, easeOut(k));
    ctx.save();
    ctx.globalAlpha = 0.28 + 0.34 * k + 0.12 * Math.sin(time * 12);
    ctx.fillStyle = "rgba(180,18,8,.18)";
    ctx.fillRect(cam, GROUND - 22, W, 26);
    ctx.strokeStyle = k > 0.72 ? "#ffd080" : "#ff4b28";
    ctx.lineWidth = 3 + 4 * k;
    ctx.setLineDash([18, 12]);
    ctx.lineDashOffset = -time * 70;
    ctx.beginPath();
    ctx.ellipse(B.x, GROUND + 1, r, 16 + r * 0.014, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = -3; i <= 3; i++) {
      const x = B.x + (i * r) / 7;
      ctx.strokeStyle = "rgba(255,72,35," + (0.35 + 0.45 * k) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, GROUND);
      ctx.lineTo(x + (i % 2 ? 18 : -18) * k, GROUND - 10 - 18 * k);
      ctx.lineTo(x + (i % 2 ? -8 : 8) * k, GROUND - 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.9;
    ctx.textAlign = "center";
    ctx.font = "900 14px Cinzel, Georgia, serif";
    ctx.fillStyle = k > 0.72 ? "#ffe2a0" : "#ff9275";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 5;
    ctx.fillText("JUMP  " + remain.toFixed(1) + "s", P.x, P.y - 132);
    ctx.restore();
  }
  function drawDemonHazards() {
    if (
      B.type === "demon" &&
      B.state === "dair" &&
      B.phase === "up" &&
      B.h > 25
    ) {
      const x = B.x,
        y = GROUND - B.h - 142,
        r = 18 + Math.sin(time * 24) * 3;
      const g = ctx.createRadialGradient(x, y, 2, x, y, r * 2.3);
      g.addColorStop(0, "#fff4d6");
      g.addColorStop(0.28, "#ff5b2b");
      g.addColorStop(1, "rgba(180,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,180,100,.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.stroke();
    }
    for (const h of demonHazards) {
      ctx.save();
      ctx.translate(h.x, h.y);
      const ang = Math.atan2(h.vy, h.vx);
      ctx.rotate(ang);
      ctx.shadowColor = "#ff2d14";
      ctx.shadowBlur = 16;
      if (h.kind === "wave") {
        ctx.rotate(-ang);
        ctx.fillStyle = "rgba(255,55,25,.78)";
        ctx.beginPath();
        ctx.moveTo(-24, 8);
        ctx.lineTo(0, -42);
        ctx.lineTo(24, 8);
        ctx.closePath();
        ctx.fill();
      } else if (h.kind === "knife") {
        ctx.fillStyle = "#f3c0aa";
        ctx.beginPath();
        ctx.moveTo(-22, -4);
        ctx.lineTo(18, 0);
        ctx.lineTo(-22, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ff4b2a";
        ctx.stroke();
      } else if (h.kind === "laser") {
        ctx.fillStyle = "rgba(255,80,40,.9)";
        ctx.fillRect(-30, -5, 60, 10);
        ctx.fillStyle = "#fff0dc";
        ctx.fillRect(-22, -1.5, 44, 3);
      } else {
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, h.r * 1.8);
        g.addColorStop(0, "#fff4db");
        g.addColorStop(0.3, "#ff5b2b");
        g.addColorStop(1, "rgba(150,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, h.r * 1.8, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawDemonHammer(c, cx, cy, A, glow) {
    c.save();
    c.translate(cx, cy);
    c.rotate(A);
    c.lineCap = "round";
    // Wrapped, slightly crooked haft — closer to the organic weapons used by the other bosses.
    c.strokeStyle = "#100609";
    c.lineWidth = 9;
    c.beginPath();
    c.moveTo(-48, 3);
    c.quadraticCurveTo(18, -4, 88, 1);
    c.stroke();
    const sg = c.createLinearGradient(-45, -4, 88, 5);
    sg.addColorStop(0, "#241114");
    sg.addColorStop(0.48, "#704137");
    sg.addColorStop(1, "#2a1215");
    c.strokeStyle = sg;
    c.lineWidth = 5.5;
    c.stroke();
    c.strokeStyle = "#c18064";
    c.lineWidth = 1.2;
    for (let x = -38; x < 70; x += 12) {
      c.beginPath();
      c.moveTo(x, -3);
      c.lineTo(x + 5, 4);
      c.stroke();
    }
    if (glow) {
      c.shadowColor = "#ff3b18";
      c.shadowBlur = glow;
    }
    // Asymmetric bone-and-stone head: a hooked upper horn and a heavy striking face.
    const hg = c.createLinearGradient(60, -30, 118, 28);
    hg.addColorStop(0, "#b58b72");
    hg.addColorStop(0.35, "#6d3b34");
    hg.addColorStop(0.72, "#35161a");
    hg.addColorStop(1, "#14080b");
    c.fillStyle = hg;
    c.strokeStyle = "#0e0507";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(61, -11);
    c.lineTo(73, -26);
    c.lineTo(92, -23);
    c.lineTo(108, -34);
    c.lineTo(104, -17);
    c.lineTo(118, -7);
    c.lineTo(112, 16);
    c.lineTo(94, 27);
    c.lineTo(70, 21);
    c.lineTo(58, 8);
    c.closePath();
    c.fill();
    c.stroke();
    poly(
      c,
      [
        [73, -25],
        [79, -43],
        [88, -25],
      ],
      PAL_D.bone,
      "#100507",
      1.3,
    );
    poly(
      c,
      [
        [94, -23],
        [108, -46],
        [105, -16],
      ],
      PAL_D.bone2,
      "#100507",
      1.3,
    );
    poly(
      c,
      [
        [109, 12],
        [124, 20],
        [109, 22],
      ],
      PAL_D.bone2,
      "#100507",
      1.2,
    );
    c.fillStyle = "#ff3517";
    c.shadowColor = "#ff2108";
    c.shadowBlur = 11;
    c.beginPath();
    c.arc(88, 1, 7, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(255,115,70,.8)";
    c.lineWidth = 1.7;
    c.beginPath();
    c.moveTo(68, -7);
    c.lineTo(83, -1);
    c.lineTo(96, -11);
    c.moveTo(85, 7);
    c.lineTo(100, 17);
    c.stroke();
    c.restore();
  }
  function drawDemonBlade(c, hx, hy, A, len, glow) {
    c.save();
    c.translate(hx, hy);
    c.rotate(A);
    if (glow) {
      c.shadowColor = "#ff3b18";
      c.shadowBlur = glow;
    }
    const g = c.createLinearGradient(0, -9, 0, 9);
    g.addColorStop(0, "#381719");
    g.addColorStop(0.5, "#c08175");
    g.addColorStop(1, "#210b0e");
    c.fillStyle = g;
    c.strokeStyle = "#100508";
    c.lineWidth = 1.7;
    c.beginPath();
    c.moveTo(-5, -10);
    c.lineTo(len - 18, -7);
    c.lineTo(len, 0);
    c.lineTo(len - 22, 8);
    c.lineTo(-5, 10);
    for (let x = 55; x > 10; x -= 14) c.lineTo(x, 11 + (x % 3) * 2);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#ff6a42";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(8, 0);
    c.lineTo(len - 22, 0);
    c.stroke();
    c.shadowBlur = 0;
    c.restore();
  }
  function demonObj() {
    let shown = B.dphase,
      alpha = 1;
    if (B.state === "transform") {
      const k = clamp(B.pt / 2.65, 0, 1);
      shown = k < 0.18 ? B.prevDPhase || Math.max(1, B.dphase - 1) : B.dphase;
      alpha = k < 0.16 ? 1 - k / 0.16 : k > 0.78 ? (k - 0.78) / 0.22 : 0;
    }
    const ph = shown,
      blade = ph === 3,
      wing = ph >= 2;
    const o = {
      x: B.x,
      y: B.y - B.h,
      face: B.face,
      scale: ph === 3 ? 1.67 : 1.62,
      t: time,
      run: B.moving ? 0.72 : 0,
      phase: B.stride,
      air: B.h > 5,
      crouch: 2,
      lean: 0,
      alpha,
      flash: B.flash > 0,
      wing,
      blade,
      hammerA: 0.18,
      bladeA: 0.28,
      bladeB: 0.52,
      glow: ph > 1 ? 8 : 3,
      shownPhase: ph,
      roar: B.state === "intro" || B.state === "transform",
    };
    switch (B.state) {
      case "intro":
        o.lean = -0.1;
        o.hammerA = -1.0;
        o.bladeA = -0.8;
        o.bladeB = 0.2;
        break;
      case "combo": {
        const a = B.atk || { type: "sweep", w: 0.5, a: 0.13, r: 0.3 },
          K = BK[a.type] || BK.sweep;
        let k;
        if (B.phase === "wind") {
          k = clamp(B.pt / (a.w || 0.5), 0, 1);
          o.hammerA = lerp(0.18, K.aw, easeOut(k));
          o.bladeA = lerp(0.25, K.aw, easeOut(k));
          o.bladeB = lerp(0.55, K.aw + 0.45, easeOut(k));
          o.lean = K.wl * k;
          o.crouch = 7 * k;
        } else if (B.phase === "act") {
          k = clamp(B.pt / (a.a || 0.13), 0, 1);
          o.hammerA = lerp(K.aw, K.a1, ease(k));
          o.bladeA = lerp(K.aw, K.a1, ease(k));
          o.bladeB = lerp(K.aw + 0.45, K.a1 - 0.38, ease(k));
          o.lean = lerp(K.wl, K.sl, k);
          o.crouch = 4;
        } else {
          k = clamp(B.pt / (a.r || 0.3), 0, 1);
          o.hammerA = lerp(K.a1, 0.18, k);
          o.bladeA = lerp(K.a1, 0.28, k);
          o.bladeB = lerp(K.a1 - 0.38, 0.52, k);
          o.lean = K.sl * (1 - k);
        }
        o.run = 0;
        break;
      }
      case "dcast":
        o.crouch = 9;
        o.lean = -0.08;
        o.hammerA = B.phase === "charge" ? -1.35 : 0.45;
        o.bladeA = -0.9;
        o.bladeB = 0.15;
        break;
      case "drush":
        o.crouch = B.phase === "dash" ? 18 : 9;
        o.lean = B.phase === "dash" ? 0.48 : -0.18;
        o.hammerA = B.phase === "dash" ? 0.05 : -0.75;
        o.bladeA = 0.02;
        o.bladeB = 0.22;
        o.run = 0;
        break;
      case "dair":
        o.air = B.h > 5;
        o.crouch = B.h > 5 ? 0 : 18;
        o.lean = 0.22;
        o.hammerA = 1.05;
        o.bladeA = 0.72;
        o.bladeB = 1.05;
        o.run = 0;
        break;
      case "dquake": {
        const q = clamp(B.pt / 1.5, 0, 1);
        o.crouch = q > 0.68 ? 17 : 7;
        o.lean = q > 0.68 ? 0.32 : -0.14;
        o.hammerA =
          q < 0.68
            ? lerp(0.18, -1.55, easeOut(q / 0.68))
            : lerp(-1.55, 1.18, ease((q - 0.68) / 0.32));
        o.bladeA = o.hammerA;
        o.bladeB = o.hammerA + 0.25;
        o.run = 0;
        break;
      }
      case "dlaser":
        o.crouch = 6;
        o.lean = -0.12;
        o.hammerA = -1.15;
        o.bladeA = -0.35;
        o.bladeB = 0.18;
        o.run = 0;
        break;
      case "djump":
        o.air = B.h > 5;
        o.crouch = B.phase === "crouch" ? 22 : B.phase === "air" ? 0 : 15;
        o.lean = B.phase === "air" ? 0.25 : -0.15;
        o.hammerA = B.phase === "air" ? 1.0 : -1.4;
        o.bladeA = 0.75;
        o.bladeB = 1.1;
        o.run = 0;
        break;
      case "dsky":
        o.hammerA = -1.45;
        o.bladeA = -1.25;
        o.bladeB = -1.85;
        o.lean = -0.1;
        o.run = 0;
        break;
      case "dknives":
        o.crouch = 5;
        o.lean = 0.18;
        o.bladeA = -0.15;
        o.bladeB = 0.65;
        o.run = 0;
        break;
      case "dtele":
        o.crouch = 10;
        o.lean = 0.38;
        o.bladeA = 0.03;
        o.bladeB = 0.32;
        o.run = 0;
        break;
      case "transform":
        o.crouch = 12;
        o.lean = -0.08;
        o.hammerA = -1.2;
        o.bladeA = -1.0;
        o.bladeB = -2.1;
        o.run = 0;
        break;
      case "stunned":
        o.crouch = 28;
        o.lean = 0.35;
        o.hammerA = 1.65;
        o.bladeA = 1.5;
        o.bladeB = 1.8;
        o.run = 0;
        break;
      case "dead":
        o.crouch = 28;
        o.lean = 0.45;
        o.hammerA = 1.7;
        o.bladeA = 1.45;
        o.bladeB = 1.9;
        o.run = 0;
        o.alpha *= clamp(1 - (B.dieT - 1) / 2.2, 0, 1);
        break;
    }
    return o;
  }
  function drawDemon(c, o) {
    const p = PAL_D,
      t = o.t,
      run = o.run || 0,
      crouch = o.crouch || 0,
      lean = o.lean || 0;
    c.save();
    c.translate(o.x, o.y);
    c.scale(o.face * o.scale, o.scale);
    c.globalAlpha = o.alpha;
    if (o.flash) c.filter = "brightness(2.5) saturate(.4)";
    const hipY = -43 + crouch * 0.85;
    // Fully articulated wings: shoulder joints, folding tips, membrane bones, and state-sensitive flapping.
    if (o.wing) {
      const active = ["djump", "dair", "drush", "transform"].includes(B.state),
        speed = active ? 5.4 : B.moving ? 3.7 : 2.15,
        beat = Math.sin(t * speed + B.stride * 0.12),
        flap = beat * (active ? 12 : 7),
        fold = Math.cos(t * (speed * 0.73)) * 5,
        spread = B.state === "transform" ? 22 : 0;
      c.save();
      c.globalAlpha *= 0.97;
      const left = [
        [-8, -92],
        [-35, -133 - flap - spread],
        [-79 - fold, -156 - flap - spread],
        [-68, -112 - flap * 0.25],
        [-111 - fold, -72 + flap],
        [-58, -82],
        [-20, -55],
      ];
      const right = [
        [8, -92],
        [36, -136 + flap - spread],
        [80 + fold, -157 + flap - spread],
        [67, -111 + flap * 0.25],
        [112 + fold, -72 - flap],
        [57, -82],
        [20, -55],
      ];
      poly(c, left, "#45171d", "#100609", 2);
      poly(c, right, "#592129", "#100609", 2);
      c.strokeStyle = "#b05c4d";
      c.lineWidth = 2.6;
      c.beginPath();
      c.moveTo(-8, -92);
      c.lineTo(-35, -133 - flap - spread);
      c.lineTo(-79 - fold, -156 - flap - spread);
      c.moveTo(8, -92);
      c.lineTo(36, -136 + flap - spread);
      c.lineTo(80 + fold, -157 + flap - spread);
      c.stroke();
      c.strokeStyle = "rgba(168,72,65,.72)";
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(-35, -133 - flap - spread);
      c.lineTo(-68, -112 - flap * 0.25);
      c.lineTo(-111 - fold, -72 + flap);
      c.moveTo(36, -136 + flap - spread);
      c.lineTo(67, -111 + flap * 0.25);
      c.lineTo(112 + fold, -72 - flap);
      c.stroke();
      c.fillStyle = "#7d302e";
      c.strokeStyle = "#120609";
      c.lineWidth = 1.3;
      c.beginPath();
      c.arc(-8, -92, 6, 0, TAU);
      c.arc(8, -92, 6, 0, TAU);
      c.fill();
      c.stroke();
      c.restore();
    }
    // Animated red cape behind the torso, cut like a superhero cape but scarred by the volcanic arena.
    {
      const sway =
          Math.sin(t * 2.4 + B.stride * 0.11) * 5 -
          run * 10 -
          (B.state === "drush" ? 18 : 0),
        lift = (o.air ? 15 : 0) + (B.state === "transform" ? 10 : 0);
      c.save();
      c.globalAlpha = 0.94;
      const cg = c.createLinearGradient(-12, -88, -42, 4);
      cg.addColorStop(0, "#b62f2c");
      cg.addColorStop(0.48, "#741b24");
      cg.addColorStop(1, "#250a12");
      c.fillStyle = cg;
      c.strokeStyle = "#16060b";
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(-11, -91);
      c.lineTo(12, -89);
      c.lineTo(20 + sway, -45 - lift * 0.3);
      c.lineTo(27 + sway, -5 - lift);
      c.lineTo(15 + sway, 7 - lift);
      c.lineTo(7 + sway, -2 - lift);
      c.lineTo(-2 + sway, 10 - lift);
      c.lineTo(-10 + sway, -3 - lift);
      c.lineTo(-19 + sway, 5 - lift);
      c.lineTo(-24 + sway, -39 - lift * 0.25);
      c.closePath();
      c.fill();
      c.stroke();
      c.strokeStyle = "rgba(255,92,75,.38)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-3, -87);
      c.quadraticCurveTo(4 + sway, -42, 7 + sway, -2 - lift);
      c.moveTo(7, -87);
      c.quadraticCurveTo(14 + sway, -45, 16 + sway, -9 - lift);
      c.stroke();
      c.restore();
    }
    let fA, fB;
    if (o.air) {
      fA = { x: -14, y: -18 };
      fB = { x: 18, y: -27 };
    } else {
      const ph = o.phase !== undefined ? o.phase : t * 7,
        rx = 18 * run;
      fA = {
        x: -11 * (1 - run) + Math.sin(ph) * rx,
        y: -Math.max(0, Math.cos(ph)) * 11 * run,
      };
      fB = {
        x: 11 * (1 - run) + Math.sin(ph + Math.PI) * rx,
        y: -Math.max(0, Math.cos(ph + Math.PI)) * 11 * run,
      };
    }
    const leg = (hx, f, far) => {
      const k = ik(hx, hipY, f.x, f.y, 25, 26, -1);
      limb(
        c,
        [
          { x: hx, y: hipY },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        13,
        p.dark,
        far ? "#3a1518" : p.flesh,
        p.bone2,
      );
      const ang = Math.atan2(k.ty - k.y, k.tx - k.x);
      c.save();
      c.translate(k.x, k.y);
      c.rotate(ang);
      const lg = c.createLinearGradient(0, -7, 0, 7);
      lg.addColorStop(0, p.bone2);
      lg.addColorStop(0.5, p.flesh2);
      lg.addColorStop(1, p.dark);
      c.fillStyle = lg;
      c.strokeStyle = "#100507";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-5, -7);
      c.lineTo(17, -6);
      c.lineTo(23, 0);
      c.lineTo(16, 6);
      c.lineTo(-5, 7);
      c.closePath();
      c.fill();
      c.stroke();
      poly(
        c,
        [
          [5, -7],
          [11, -14],
          [15, -6],
        ],
        p.bone,
        "#100507",
        1,
      );
      c.restore();
      poly(
        c,
        [
          [k.tx - 9, k.ty - 5],
          [k.tx + 12, k.ty - 5],
          [k.tx + 20, k.ty],
          [k.tx + 10, k.ty + 2],
          [k.tx + 19, k.ty + 5],
          [k.tx - 10, k.ty + 2],
        ],
        p.dark,
        "#0b0406",
        1.2,
      );
      c.fillStyle = p.bone2;
      c.beginPath();
      c.arc(k.x, k.y, 4.5, 0, TAU);
      c.fill();
      c.strokeStyle = "#120608";
      c.stroke();
    };
    leg(-7, fA, true);
    leg(7, fB, false);
    c.save();
    c.translate(0, crouch);
    c.translate(0, -45);
    c.rotate(lean);
    c.translate(0, 45);
    const tg = c.createRadialGradient(-7, -78, 3, 0, -70, 48);
    tg.addColorStop(0, p.flesh2);
    tg.addColorStop(0.58, p.flesh);
    tg.addColorStop(1, p.dark);
    c.fillStyle = tg;
    c.strokeStyle = "#100507";
    c.lineWidth = 1.7;
    c.beginPath();
    c.moveTo(-25, -83);
    c.quadraticCurveTo(0, -103, 26, -83);
    c.lineTo(19, -44);
    c.quadraticCurveTo(0, -34, -18, -45);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "rgba(255,76,42,.7)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(-12, -80);
    c.lineTo(1, -70);
    c.lineTo(-5, -56);
    c.moveTo(12, -88);
    c.lineTo(4, -72);
    c.lineTo(14, -58);
    c.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      c.fillStyle = i % 2 ? p.bone2 : "#6d3933";
      c.beginPath();
      c.moveTo(Math.cos(a) * 22, -69 + Math.sin(a) * 25);
      c.lineTo(Math.cos(a) * 29, -69 + Math.sin(a) * 31);
      c.lineTo(Math.cos(a + 0.25) * 21, -69 + Math.sin(a + 0.25) * 23);
      c.fill();
    }
    // Layered rib armour, collar, belt, and torn waist cloth add the same detail density as the knight bosses.
    c.strokeStyle = "rgba(28,8,10,.85)";
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const yy = -79 + i * 9;
      c.beginPath();
      c.moveTo(-20 + i * 1.5, yy);
      c.quadraticCurveTo(0, yy + 7, 20 - i * 1.5, yy);
      c.stroke();
    }
    poly(
      c,
      [
        [-24, -87],
        [-8, -96],
        [0, -89],
        [-13, -78],
      ],
      p.bone2,
      "#100507",
      1.3,
    );
    poly(
      c,
      [
        [24, -87],
        [8, -96],
        [0, -89],
        [13, -78],
      ],
      p.bone,
      "#100507",
      1.3,
    );
    const shoulderPlate = (x, y, far) => {
      const pg = c.createRadialGradient(x - 3, y - 4, 2, x, y, 15);
      pg.addColorStop(0, far ? "#d7a92d" : "#ffe06a");
      pg.addColorStop(0.55, "#c58a20");
      pg.addColorStop(1, "#60400d");
      c.fillStyle = pg;
      c.strokeStyle = "#2c1905";
      c.lineWidth = 1.7;
      c.beginPath();
      c.arc(x, y, 13, 0, TAU);
      c.fill();
      c.stroke();
      c.strokeStyle = "rgba(255,241,150,.7)";
      c.beginPath();
      c.arc(x - 2, y - 2, 8, 0.2, 2.6);
      c.stroke();
      for (let i = 0; i < 3; i++)
        poly(
          c,
          [
            [x - 9 + i * 8, y - 8],
            [x - 5 + i * 8, y - 19 - i * 2],
            [x + i * 8, y - 8],
          ],
          i === 1 ? "#ffd75b" : "#b97818",
          "#2c1905",
          1,
        );
    };
    shoulderPlate(-20, -83, true);
    shoulderPlate(21, -84, false);
    c.fillStyle = "#2b1013";
    c.strokeStyle = "#100507";
    c.lineWidth = 1.2;
    c.fillRect(-18, -48, 36, 6);
    c.strokeRect(-18, -48, 36, 6);
    c.fillStyle = p.bone;
    c.beginPath();
    c.arc(0, -45, 4, 0, TAU);
    c.fill();
    c.stroke();
    poly(
      c,
      [
        [-16, -43],
        [16, -43],
        [14, -15],
        [7, -23],
        [1, -12],
        [-5, -24],
        [-13, -15],
      ],
      "#351216",
      "#100507",
      1.3,
    );
    for (let i = 0; i < 5; i++)
      poly(
        c,
        [
          [-18 + i * 9, -90 - (i % 2) * 2],
          [-15 + i * 9, -108 - i * 3],
          [-10 + i * 9, -91],
        ],
        p.bone2,
        "#100507",
        1,
      );
    // Wind-reactive dark crimson mane, layered behind the skull instead of a rigid hair block.
    {
      const hs =
        Math.sin(t * 3.2 + B.stride * 0.1) * 3 -
        run * 7 -
        (B.state === "drush" ? 10 : 0);
      c.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const y = -115 + i * 5,
          len = 22 + i * 4;
        c.strokeStyle = i % 2 ? "#3a0d17" : "#651624";
        c.lineWidth = 5 - i * 0.45;
        c.beginPath();
        c.moveTo(-5, y);
        c.bezierCurveTo(
          -13 - len * 0.25,
          y - 5 + Math.sin(t * 2 + i) * 3,
          -18 - len * 0.55 + hs,
          y + 5 + i * 2,
          -18 - len + hs,
          y + 10 + i * 4,
        );
        c.stroke();
      }
      c.lineCap = "butt";
    }
    // Side-facing predatory skull with heavy brow, hooked snout, articulated jaw, and bull-like horns.
    poly(
      c,
      [
        [-7, -96],
        [12, -98],
        [18, -86],
        [-8, -84],
      ],
      "#301317",
      "#100507",
      1.3,
    );
    const hg = c.createLinearGradient(-12, -124, 20, -88);
    hg.addColorStop(0, "#efe0c3");
    hg.addColorStop(0.5, p.bone);
    hg.addColorStop(1, "#6f5b50");
    c.fillStyle = hg;
    c.strokeStyle = "#110607";
    c.lineWidth = 1.7;
    c.beginPath();
    c.moveTo(-11, -111);
    c.quadraticCurveTo(-3, -126, 11, -120);
    c.quadraticCurveTo(19, -116, 18, -105);
    c.lineTo(26, -99);
    c.lineTo(18, -92);
    c.lineTo(5, -93);
    c.lineTo(-8, -99);
    c.closePath();
    c.fill();
    c.stroke();
    // Heavy curved bull/devil horns with dark roots and pale sharpened tips.
    const horn = (side, far) => {
      c.save();
      c.scale(side, 1);
      c.lineCap = "round";
      c.strokeStyle = "#100507";
      c.lineWidth = 11;
      c.beginPath();
      c.moveTo(4, -117);
      c.bezierCurveTo(17, -132, 34, -135, 38, -121);
      c.bezierCurveTo(40, -113, 35, -107, 31, -105);
      c.stroke();
      const hg2 = c.createLinearGradient(5, -118, 38, -108);
      hg2.addColorStop(0, far ? "#5d493f" : "#7c6556");
      hg2.addColorStop(0.65, p.bone2);
      hg2.addColorStop(1, "#ead8b9");
      c.strokeStyle = hg2;
      c.lineWidth = 7;
      c.stroke();
      poly(
        c,
        [
          [31, -109],
          [43, -106],
          [34, -101],
        ],
        "#ead8b9",
        "#100507",
        1,
      );
      c.restore();
    };
    horn(-1, true);
    horn(1, false);
    c.lineCap = "butt";
    // Brow ridge and deep eye socket.
    poly(
      c,
      [
        [5, -113],
        [19, -111],
        [15, -102],
        [4, -104],
      ],
      "#4b3732",
      "#100507",
      1.1,
    );
    c.fillStyle = "#ff2d13";
    c.shadowColor = "#ff1d08";
    c.shadowBlur = 9;
    c.beginPath();
    c.ellipse(12, -107, 3.3, 2.5, -0.15, 0, TAU);
    c.fill();
    c.shadowBlur = 0;
    c.fillStyle = "rgba(120,25,20,.65)";
    c.beginPath();
    c.ellipse(-3, -108, 2, 1.7, 0, 0, TAU);
    c.fill();
    // Separate jaw opens slightly during roars and transformations.
    const jaw = o.roar ? 8 : 2;
    const jy = -94 + jaw;
    c.fillStyle = "#8f7968";
    c.strokeStyle = "#110607";
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(0, jy);
    c.lineTo(21, jy - 2);
    c.lineTo(16, jy + 9);
    c.lineTo(3, jy + 8);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#f0dfbf";
    for (let i = 0; i < 5; i++) {
      const x = 4 + i * 3.2;
      c.beginPath();
      c.moveTo(x, jy);
      c.lineTo(x + 1.2, jy + 5);
      c.lineTo(x + 2.2, jy);
      c.fill();
    }
    c.strokeStyle = "#5b463d";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-5, -103);
    c.lineTo(2, -99);
    c.lineTo(-2, -94);
    c.moveTo(18, -115);
    c.lineTo(12, -117);
    c.stroke();
    const shoulder1 = { x: 18, y: -79 },
      shoulder2 = { x: -17, y: -77 };
    if (o.blade) {
      const arm = (S, A, far) => {
        const hand = { x: S.x + Math.cos(A) * 35, y: S.y + Math.sin(A) * 35 },
          e = ik(S.x, S.y, hand.x, hand.y, 18, 19, 1);
        limb(
          c,
          [S, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
          11,
          p.dark,
          far ? "#4a1b20" : p.flesh2,
          p.bone2,
        );
        drawDemonBlade(c, e.tx, e.ty, A, 82, o.glow);
        c.fillStyle = p.bone2;
        c.beginPath();
        c.arc(e.tx, e.ty, 5, 0, TAU);
        c.fill();
      };
      arm(shoulder2, o.bladeB, true);
      arm(shoulder1, o.bladeA, false);
    } else {
      const A = o.hammerA,
        center = { x: 17 + Math.cos(A) * 28, y: -70 + Math.sin(A) * 28 },
        grip1 = {
          x: center.x - Math.cos(A) * 14,
          y: center.y - Math.sin(A) * 14,
        },
        grip2 = {
          x: center.x - Math.cos(A) * 35,
          y: center.y - Math.sin(A) * 35,
        };
      const arm = (S, T, far) => {
        const e = ik(S.x, S.y, T.x, T.y, 18, 18, 1);
        limb(
          c,
          [S, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
          11,
          p.dark,
          far ? "#43181c" : p.flesh2,
          p.bone2,
        );
        c.fillStyle = p.bone2;
        c.beginPath();
        c.arc(T.x, T.y, 5, 0, TAU);
        c.fill();
      };
      arm(shoulder2, grip2, true);
      drawDemonHammer(c, center.x, center.y, A, o.glow);
      arm(shoulder1, grip1, false);
    }
    c.restore();
    c.restore();
  }
  function drawDemonTransformBeam() {
    if (B.type !== "demon" || B.state !== "transform") return;
    const k = clamp(B.pt / 2.65, 0, 1),
      pulse = 0.78 + 0.22 * Math.sin(time * 38),
      fade = k < 0.08 ? k / 0.08 : k > 0.9 ? (1 - k) / 0.1 : 1,
      w = 105 + 55 * Math.sin(Math.PI * k);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = fade;
    const g = ctx.createLinearGradient(B.x - w, 0, B.x + w, 0);
    g.addColorStop(0, "rgba(255,0,0,0)");
    g.addColorStop(0.28, "rgba(255,25,10,.72)");
    g.addColorStop(0.5, "rgba(255,235,210," + pulse * 0.98 + ")");
    g.addColorStop(0.72, "rgba(255,30,12,.75)");
    g.addColorStop(1, "rgba(255,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(B.x - w, -40, w * 2, GROUND + 45);
    ctx.fillStyle = "rgba(255,245,230,.88)";
    ctx.fillRect(B.x - 22 * pulse, -40, 44 * pulse, GROUND + 45);
    ctx.strokeStyle = "rgba(255,70,35,.95)";
    ctx.lineWidth = 5;
    for (let i = 0; i < 5; i++) {
      let x = B.x + rnd(-w * 0.7, w * 0.7);
      ctx.beginPath();
      ctx.moveTo(x, -20);
      for (let y = 20; y < GROUND; y += 42) {
        x += rnd(-22, 22);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255,55,20,.55)";
    ctx.beginPath();
    ctx.ellipse(B.x, GROUND + 2, w * 1.35, 24, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function drawWraithTransformBeam() {
    if (heroType !== "wraithknight" || P.state !== "wraithTransform") return;
    const k=clamp(P.t/2.35,0,1), pulse=.78+.22*Math.sin(time*42), fade=k<.08?k/.08:k>.9?(1-k)/.1:1, width=82+62*Math.sin(Math.PI*k);
    ctx.save();ctx.globalCompositeOperation="screen";ctx.globalAlpha=clamp(fade,0,1);
    const g=ctx.createLinearGradient(P.x-width,0,P.x+width,0);g.addColorStop(0,"rgba(90,20,180,0)");g.addColorStop(.2,"rgba(118,45,235,.55)");g.addColorStop(.42,"rgba(190,110,255,.78)");g.addColorStop(.5,`rgba(250,235,255,${pulse})`);g.addColorStop(.58,"rgba(190,110,255,.78)");g.addColorStop(.8,"rgba(118,45,235,.55)");g.addColorStop(1,"rgba(90,20,180,0)");ctx.fillStyle=g;ctx.fillRect(P.x-width,-40,width*2,GROUND+48);
    ctx.fillStyle="rgba(245,225,255,.84)";ctx.shadowColor="#b45cff";ctx.shadowBlur=34;ctx.fillRect(P.x-14*pulse,-40,28*pulse,GROUND+45);
    for(let i=0;i<7;i++){let x=P.x+rnd(-width*.72,width*.72);ctx.strokeStyle=i%2?"rgba(218,170,255,.95)":"rgba(142,65,255,.95)";ctx.lineWidth=i%2?3:5;ctx.beginPath();ctx.moveTo(x,-20);for(let y=18;y<GROUND;y+=34){x+=rnd(-25,25);ctx.lineTo(x,y)}ctx.stroke()}
    ctx.shadowBlur=0;ctx.globalCompositeOperation="source-over";ctx.fillStyle="rgba(138,55,235,.48)";ctx.beginPath();ctx.ellipse(P.x,GROUND+2,width*1.5,27,0,0,TAU);ctx.fill();ctx.strokeStyle="rgba(226,190,255,.92)";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(P.x,GROUND,width*(.72+.2*pulse),16,0,0,TAU);ctx.stroke();ctx.restore();
  }
  function updateSlashes(dt) {
    for (let i = slashes.length - 1; i >= 0; i--) {
      const p = slashes[i],
        target = projectileTarget(p);
      p.t += dt;
      const oldX = p.x;
      p.x += p.vx * dt;
      p.rot += dt * 26;
      if (Math.random() < 0.8)
        parts.push({
          k: "dot",
          x: p.x - p.face * 14,
          y: p.y + rnd(-6, 6),
          vx: -p.face * 40,
          vy: rnd(-8, 8),
          life: 0.22,
          t: 0,
          col: "255,224,140",
          g: 0,
          drag: 2,
          sz: rnd(3, 6),
        });
      let dead = p.t > p.life || p.x < -60 || p.x > WORLD + 60;
      if (!p.hit && target.state !== "dead" && target.state !== "intro") {
        if (
          sweptXHits(oldX, p.x, target.x, target.hw + 22) &&
          p.pb + 125 > target.h &&
          p.pb - 20 < target.h + target.hh
        ) {
          p.hit = true;
          dead = true;
          hitProjectileTarget(p, 300, 0.1, true, true);
          spark(p.x, p.y, 26, "#fff3b0", 560, 0.5);
          addRing(p.x, p.y, 6, 70, 0.3, "rgba(255,232,140,.9)", 5);
        }
      }
      if (dead) slashes.splice(i, 1);
    }
  }
  function updateOrbs(dt) {
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i];
      o.t += dt;
      o.vy += o.g * dt;
      const oldX = o.x,
        oldY = o.y;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      if (Math.random() < 0.6)
        parts.push({
          k: "dot",
          x: o.x,
          y: o.y,
          vx: 0,
          vy: 0,
          life: 0.25,
          t: 0,
          col: "150,195,255",
          g: 0,
          drag: 1,
          sz: 5,
        });
      let dead =
        o.t > o.life ||
        o.x < 0 ||
        o.x > WORLD ||
        (o.g > 0 && o.y >= GROUND - 4 && o.vy > 0);
      if (!dead && heroType === "wizard") {
        for (const s of skeletons) {
          if (
            s.hp > 0 &&
            s.state !== "spawn" &&
            sweptXHits(oldX, o.x, s.x, 14 + o.r) &&
            Math.max(oldY, o.y) > GROUND - 116 &&
            Math.min(oldY, o.y) < GROUND + 8
          ) {
            damageSkeleton(s, o.dmg);
            dead = true;
            break;
          }
        }
      }
      if (
        !dead &&
        P.state !== "dead" &&
        P.invuln <= 0 &&
        sweptXHits(oldX, o.x, P.x, 14 + o.r) &&
        Math.max(oldY, o.y) > P.y - 104 &&
        Math.min(oldY, o.y) < P.y + 10
      ) {
        if (hurtPlayer(o.dmg, o.x, false)) dead = true;
      }
      if (dead) {
        spark(o.x, Math.min(o.y, GROUND - 4), 6, "#bcd8ff", 260, 0.3);
        orbs.splice(i, 1);
      }
    }
  }
  function drawSlashes() {
    for (const p of slashes) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * 0.3);
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 30);
      g.addColorStop(0, "rgba(255,252,224,1)");
      g.addColorStop(0.4, "rgba(255,224,130,.9)");
      g.addColorStop(1, "rgba(255,180,50,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 15, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,246,200,.95)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 9, 0, 0.3, TAU - 0.3);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,214,110,.8)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(2, 0, 12, 5, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
  function drawOrbs() {
    for (const o of orbs) {
      const r = 16 + Math.sin(time * 30 + o.x) * 1.5;
      const g = ctx.createRadialGradient(o.x, o.y, 1, o.x, o.y, r * 1.8);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(160,200,255,.95)");
      g.addColorStop(1, "rgba(60,110,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, r * 1.8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#eaf4ff";
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r * 0.6, 0, TAU);
      ctx.fill();
    }
  }
  function drawGreatsword(c, hx, hy, A, len, glow) {
    c.save();
    c.translate(hx, hy);
    c.rotate(A);
    c.fillStyle = "#23262f";
    c.fillRect(-27, -2.8, 29, 5.6);
    c.strokeStyle = "#4b5166";
    c.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.moveTo(-25 + i * 4.6, -2.8);
      c.lineTo(-23 + i * 4.6, 2.8);
      c.stroke();
    }
    poly(
      c,
      [
        [-27, -4.5],
        [-27, 4.5],
        [-42, 0],
      ],
      "#8e94a8",
      "#090a11",
      1,
    );
    c.fillStyle = "#a9b0c6";
    c.strokeStyle = "#090a11";
    c.beginPath();
    c.arc(-28, 0, 3.6, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = "#7d8395";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(1, -14);
    c.quadraticCurveTo(6, -12, 7, -6);
    c.lineTo(7, 6);
    c.quadraticCurveTo(6, 12, 1, 14);
    c.lineTo(-2, 9);
    c.lineTo(-2, -9);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#2b58cf";
    c.beginPath();
    c.arc(2.5, 0, 2.3, 0, TAU);
    c.fill();
    if (glow) {
      c.shadowColor = "#7fb0ff";
      c.shadowBlur = glow;
    }
    const g = c.createLinearGradient(0, -5, 0, 5);
    g.addColorStop(0, "#5b7099");
    g.addColorStop(0.5, "#cfe2fb");
    g.addColorStop(1, "#5b7099");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(7, -5);
    c.lineTo(len - 18, -4.4);
    c.lineTo(len, 0);
    c.lineTo(len - 18, 4.4);
    c.lineTo(7, 5);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "#090a11";
    c.lineWidth = 1.2;
    c.stroke();
    c.strokeStyle = "rgba(235,245,255,.75)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(12, 0);
    c.lineTo(len - 26, 0);
    c.stroke();
    c.fillStyle = "rgba(70,110,200,.7)";
    for (let i = 0; i < 6; i++) c.fillRect(22 + i * 12, -1.4, 4, 2.8);
    c.restore();
  }
  function drawArtorias(c, o) {
    const p = PAL_A,
      t = o.t,
      run = o.run || 0,
      air = o.air,
      crouch = o.crouch || 0,
      lean = o.lean || 0;
    c.save();
    c.translate(o.x, o.y);
    c.scale(o.face * o.scale, o.scale);
    if (o.rot) c.rotate(o.rot);
    c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.flash) c.filter = "brightness(2.6) saturate(.35)";
    const hipY = -44 + crouch * 0.9;
    let fA, fB;
    if (air) {
      fA = { x: -8, y: -16 };
      fB = { x: 12, y: -28 };
    } else if (o.slide) {
      fA = { x: -18, y: -2 };
      fB = { x: 24, y: -1 };
    } else if (o.kneel) {
      fA = { x: -22, y: -2 };
      fB = { x: 12, y: 0 };
    } else {
      const ph = o.phase !== undefined ? o.phase : t * 7,
        rx = 17 * run;
      fA = {
        x: -10 * (1 - run) + Math.sin(ph) * rx,
        y: -Math.max(0, Math.cos(ph)) * 10 * run,
      };
      fB = {
        x: 10 * (1 - run) + Math.sin(ph + Math.PI) * rx,
        y: -Math.max(0, Math.cos(ph + Math.PI)) * 10 * run,
      };
    }
    const drawLeg = (hx, f, far) => {
      const k = ik(hx, hipY, f.x, f.y, 23, 23, -1);
      limb(
        c,
        [
          { x: hx, y: hipY },
          { x: k.x, y: k.y },
          { x: k.tx, y: k.ty },
        ],
        12,
        p.outline,
        far ? p.legFar : p.leg,
        p.light,
      );
      c.fillStyle = p.dark;
      c.strokeStyle = p.outline;
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(k.tx + 4, k.ty - 2, 10, 5, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = p.trim;
      c.beginPath();
      c.arc(k.x + 2, k.y, 5, 0, TAU);
      c.fill();
      c.stroke();
    };
    drawLeg(-4, fA, true);
    drawLeg(4, fB, false);
    // tattered blue cloth
    const sw = Math.sin(t * 1.7) * 1.8 + run * -7 + (o.clothSway || 0);
    poly(
      c,
      [
        [-9, hipY - 3],
        [-4, hipY - 3],
        [-14 + sw, hipY + 34],
        [-21 + sw, hipY + 30],
        [-24 + sw, hipY + 38],
      ],
      p.cloakDark,
      p.outline,
      1,
    );
    poly(
      c,
      [
        [-8, hipY - 3],
        [12, hipY - 3],
        [16 + sw, hipY + 30],
        [11 + sw, hipY + 26],
        [6 + sw, hipY + 37],
        [sw, hipY + 27],
        [-6 + sw, hipY + 35],
      ],
      p.cloak,
      p.outline,
      1.2,
    );

    c.save();
    c.translate(0, crouch);
    c.translate(0, -44);
    c.rotate(lean);
    c.translate(0, 44);
    const w1 = Math.sin(t * 3) * 3 + run * 9 + (o.capeBack || 0),
      w2 = Math.sin(t * 3 + 1) * 4 + run * 12 + (o.capeBack || 0) * 1.4;
    poly(
      c,
      [
        [-4, -85],
        [-16, -72],
        [-24 - w1, -44],
        [-32 - w2, -8],
        [-26 - w2, -1],
        [-21 - w1, -10],
        [-15 - w2 * 0.7, 0],
        [-9 - w1 * 0.5, -9],
        [-3, -2],
        [1, -44],
      ],
      p.cloak,
      p.outline,
      1.4,
    );
    poly(
      c,
      [
        [-4, -80],
        [-13, -66],
        [-19 - w1 * 0.8, -40],
        [-24 - w2 * 0.8, -14],
        [-9, -10],
        [-2, -44],
      ],
      p.cloakDark,
      null,
    );
    // long dark hair streaming from the helm
    c.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const ph = t * 3.2 + i * 1.2,
        len = 36 + i * 8 + (o.capeBack || 0) * 1.6 + run * 14;
      c.strokeStyle = p.hair;
      c.lineWidth = 3.4 - i * 0.55;
      c.beginPath();
      c.moveTo(-3, -108 + i * 2.2);
      c.bezierCurveTo(
        -13 - len * 0.3,
        -113 + Math.sin(ph) * 5,
        -21 - len * 0.6,
        -101 + Math.sin(ph + 1) * 9 + i * 4,
        -27 - len,
        -93 + i * 8 + Math.sin(ph + 2) * 7,
      );
      c.stroke();
    }
    // broken off-arm, hanging limp
    {
      const S = { x: -5, y: -78 },
        tgt = {
          x: -9 + Math.sin(t * 1.4) * 1.4 - run * 3,
          y: -47 + Math.sin(t * 2.1) * 0.8,
        };
      const e = ik(S.x, S.y, tgt.x, tgt.y, 16, 16, 1);
      limb(
        c,
        [S, { x: e.x, y: e.y }, { x: e.tx, y: e.ty }],
        9.5,
        p.outline,
        p.legFar,
        p.trim,
      );
      c.fillStyle = p.dark;
      c.beginPath();
      c.arc(e.tx, e.ty, 4.6, 0, TAU);
      c.fill();
      c.strokeStyle = p.cloakDark;
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(e.x - 4, e.y - 3);
      c.lineTo(e.x + 4, e.y + 3);
      c.stroke();
    }
    // torso
    const tg = c.createLinearGradient(-12, 0, 14, 0);
    tg.addColorStop(0, p.dark);
    tg.addColorStop(0.5, p.mid);
    tg.addColorStop(1, p.light);
    c.beginPath();
    c.moveTo(-11, -80);
    c.quadraticCurveTo(1, -90, 12, -80);
    c.quadraticCurveTo(17, -64, 11, -46);
    c.lineTo(-10, -46);
    c.quadraticCurveTo(-15, -64, -11, -80);
    c.closePath();
    c.fillStyle = tg;
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.6;
    c.stroke();
    c.strokeStyle = "rgba(0,0,0,.4)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-10, -70);
    c.quadraticCurveTo(2, -66, 13, -70);
    c.moveTo(-10, -60);
    c.quadraticCurveTo(2, -56, 12, -60);
    c.moveTo(-9, -52);
    c.quadraticCurveTo(2, -49, 11, -52);
    c.stroke();
    c.fillStyle = p.belt;
    c.fillRect(-11, -50, 23, 5.5);
    c.strokeStyle = p.outline;
    c.lineWidth = 1;
    c.strokeRect(-11, -50, 23, 5.5);
    c.fillStyle = p.gold;
    c.beginPath();
    c.arc(1, -47.3, 3.2, 0, TAU);
    c.fill();
    c.stroke();
    poly(
      c,
      [
        [-11, -85],
        [12, -84],
        [16, -72],
        [4, -63],
        [-10, -72],
      ],
      p.cloak,
      p.outline,
      1.2,
    );
    poly(
      c,
      [
        [9, -72],
        [16, -66],
        [18 + Math.sin(t * 2) * 1.5, -49],
        [10, -55],
      ],
      p.cloakDark,
      p.outline,
      1,
    );
    // head: tall crested helm
    c.fillStyle = p.dark;
    c.fillRect(-3, -88, 8, 8);
    const hg = c.createLinearGradient(-9, -114, 14, -84);
    hg.addColorStop(0, p.light);
    hg.addColorStop(0.55, p.mid);
    hg.addColorStop(1, p.dark);
    c.beginPath();
    c.moveTo(-9, -86);
    c.quadraticCurveTo(-12, -103, -3, -111);
    c.quadraticCurveTo(8, -115, 14, -101);
    c.lineTo(13, -88);
    c.quadraticCurveTo(5, -83, -6, -84);
    c.closePath();
    c.fillStyle = hg;
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.6;
    c.stroke();
    poly(
      c,
      [
        [-6, -108],
        [-1, -115],
        [6, -114],
        [10, -107],
        [3, -110],
      ],
      p.dark,
      p.outline,
      1.2,
    );
    poly(
      c,
      [
        [-1, -114],
        [-4, -128],
        [3, -114],
      ],
      p.trim,
      p.outline,
      1,
    );
    c.fillStyle = "#06070c";
    c.fillRect(4, -100, 10, 2.6);
    c.fillRect(8.5, -104, 2.4, 12);
    c.strokeStyle = "rgba(0,0,0,.5)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-6, -96);
    c.quadraticCurveTo(1, -92, 8, -90);
    c.stroke();
    // pauldron
    const pg = c.createRadialGradient(-2, -84, 1, 2, -78, 16);
    pg.addColorStop(0, p.light);
    pg.addColorStop(0.7, p.mid);
    pg.addColorStop(1, p.dark);
    c.fillStyle = pg;
    c.beginPath();
    c.arc(1, -78, 13.5, 0, TAU);
    c.fill();
    c.strokeStyle = p.outline;
    c.lineWidth = 1.6;
    c.stroke();
    c.strokeStyle = p.cloak;
    c.lineWidth = 2.2;
    c.beginPath();
    c.arc(1, -78, 9.5, 0.3, 2.7);
    c.stroke();
    c.fillStyle = p.trim;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      c.beginPath();
      c.arc(1 + Math.cos(a) * 12, -78 + Math.sin(a) * 12, 0.9, 0, TAU);
      c.fill();
    }
    // sword arm + greatsword
    const S = { x: 3, y: -79 },
      R = o.handR === undefined ? 26 : o.handR,
      A = o.swordA;
    const hand = { x: S.x + Math.cos(A) * R, y: S.y + Math.sin(A) * R };
    const el = ik(S.x, S.y, hand.x, hand.y, 17, 17, 1);
    limb(
      c,
      [S, { x: el.x, y: el.y }, { x: el.tx, y: el.ty }],
      10.5,
      p.outline,
      p.mid,
      p.light,
    );
    drawGreatsword(c, el.tx, el.ty, A, 104, o.glow || 0);
    c.fillStyle = p.mid;
    c.strokeStyle = p.outline;
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(el.tx, el.ty, 5.4, 0, TAU);
    c.fill();
    c.stroke();
    c.restore();
    c.restore();
  }
  const ART_IDLE = 0.68;
  function artObj() {
    const rage = B.rage;
    const o = {
      kind: "art",
      scale: 1.5,
      x: B.x,
      y: B.y - B.h,
      face: B.face,
      t: time,
      run: B.moving ? 0.55 : 0,
      air: false,
      swordA: ART_IDLE + Math.sin(time * 1.6) * 0.03,
      handR: 26,
      crouch: 8,
      lean: 0.07,
      flash: B.flash > 0,
      alpha: 1,
      glow: rage ? 14 : 4,
      phase: B.stride,
      capeBack: rage ? 6 : 0,
    };
    switch (B.state) {
      case "intro": {
        const k =
          clamp((phaseT - 0.4) / 0.5, 0, 1) *
          (1 - clamp((phaseT - 1.9) / 0.6, 0, 1));
        o.swordA = lerp(ART_IDLE, -1.8, k);
        o.lean = -0.15 * k;
        o.crouch = 8 * (1 - k);
        o.glow = 6 + 16 * k;
        o.capeBack = 8 * k;
        break;
      }
      case "combo": {
        const a = B.atk,
          K = BK[a.type],
          wS = a.w * (rage ? 0.86 : 1);
        let ang;
        o.crouch = 4;
        if (B.phase === "wind") {
          const k = Math.min(1, B.pt / wS);
          ang = lerp(ART_IDLE, K.aw, easeOut(k));
          o.lean = K.wl * k;
          o.handR = lerp(26, K.rw, k);
          o.glow = 8 + k * 12;
          o.capeBack = 5 * k;
        } else if (B.phase === "act") {
          const k = Math.min(1, B.pt / a.a);
          ang = lerp(K.aw, K.a1, ease(k));
          o.lean = lerp(K.wl, K.sl, k);
          o.handR = lerp(K.rw, K.rs, k);
          o.glow = 24;
          o.capeBack = 12;
        } else {
          const k = Math.min(1, B.pt / a.r);
          ang = lerp(K.a1, ART_IDLE, k * k);
          o.lean = K.sl * (1 - k);
          o.handR = lerp(K.rs, 26, k);
        }
        o.swordA = ang;
        o.run = 0;
        break;
      }
      case "jump": {
        if (B.phase === "crouch") {
          const durC = B.jfirst ? (rage ? 0.45 : 0.55) : 0.26,
            k = Math.min(1, B.pt / durC);
          o.crouch = lerp(8, 34, k);
          o.lean = -0.25 * k;
          o.swordA = lerp(ART_IDLE, -2.0, easeOut(k));
          o.glow = 8 + 12 * k;
        } else if (B.phase === "air") {
          const T = rage ? 0.52 : 0.62,
            k = Math.min(1, B.pt / T);
          o.air = true;
          o.crouch = 0;
          o.lean = lerp(-0.1, 0.3, k);
          o.swordA =
            k < 0.6
              ? lerp(-2.0, -1.5, k / 0.6)
              : lerp(-1.5, 1.1, (k - 0.6) / 0.4);
          o.glow = 18;
          o.capeBack = 14;
        } else if (B.phase === "slam") {
          const k = Math.min(1, B.pt / 0.22);
          o.crouch = lerp(16, 8, k);
          o.lean = 0.32 * (1 - k * 0.5);
          o.swordA = 1.05;
          o.glow = 26;
        } else {
          const k = Math.min(1, B.pt / 0.85);
          o.crouch = lerp(12, 8, k);
          o.lean = 0.2 * (1 - k);
          o.swordA = lerp(1.05, ART_IDLE, k);
        }
        o.run = 0;
        break;
      }
      case "rush": {
        if (B.phase === "wind") {
          const windT = B.rfirst ? (rage ? 0.42 : 0.55) : 0.24,
            k = Math.min(1, B.pt / windT);
          o.crouch = lerp(8, 26, k);
          o.lean = -0.3 * k;
          o.swordA = lerp(ART_IDLE, -0.05, easeOut(k));
          o.handR = lerp(26, 8, k);
          o.glow = 10 + 14 * k;
          o.capeBack = 6 * k;
        } else if (B.phase === "dash") {
          o.slide = true;
          o.crouch = 20;
          o.lean = 0.58;
          o.swordA = 0.02;
          o.handR = 44;
          o.glow = 26;
          o.capeBack = 28;
        } else {
          const k = Math.min(1, B.pt / 0.6);
          o.crouch = lerp(18, 8, k);
          o.lean = 0.3 * (1 - k);
          o.swordA = lerp(0.2, ART_IDLE, k);
          o.handR = lerp(36, 26, k);
        }
        o.run = 0;
        break;
      }
      case "explode": {
        const charge = rage ? 0.95 : 1.15;
        if (B.phase === "charge") {
          const k = Math.min(1, B.pt / charge);
          o.swordA = lerp(ART_IDLE, -1.75, easeOut(Math.min(1, k * 2)));
          o.crouch = 8 + 6 * k;
          o.lean = -0.12;
          o.glow = 8 + 18 * k;
          o.capeBack = 12 * k;
          o.shakeX = Math.sin(time * 70) * 1.2 * k;
        } else {
          const k = Math.min(1, B.pt / 0.5);
          o.swordA = lerp(-1.75, 0.5, easeOut(Math.min(1, k * 4)));
          o.lean = 0.25 * (1 - k);
          o.crouch = 4;
          o.glow = 24;
          o.capeBack = 16;
        }
        o.run = 0;
        break;
      }
      case "stunned":
        o.kneel = true;
        o.crouch = 26;
        o.lean = 0.32;
        o.swordA = 1.75;
        o.handR = 26;
        o.glow = 0;
        o.run = 0;
        o.shakeX = Math.sin(time * 40) * 0.8;
        break;
      case "dead": {
        const k = Math.min(1, B.dieT / 1.2);
        o.kneel = k < 1;
        o.crouch = 26 * Math.min(1, k * 3);
        o.lean = 0.32 + k * 0.3;
        o.swordA = 1.75;
        o.glow = 0;
        o.run = 0;
        o.alpha = clamp(1 - (B.dieT - 1.2) / 2.4, 0, 1);
        if (B.dieT > 1.2) o.flash = Math.floor(time * 20) % 2 === 0;
        break;
      }
    }
    if (o.shakeX) o.x += o.shakeX;
    return o;
  }
  function pickHero(type) {
    heroType = type;
    profile.hero = type;
    saveProfile();
    if ($("pickKnight")) {
      $("pickKnight").classList.toggle("selected", type === "knight");
      $("pickShadow").classList.toggle("selected", type === "shadow");
      $("pickRonin").classList.toggle("selected", type === "ronin");
      $("pickRegal").classList.toggle("selected", type === "regal");
      $("pickWizard").classList.toggle("selected", type === "wizard");
      $("pickKillnux").classList.toggle("selected", type === "killnux");
      $("pickWraithKnight").classList.toggle("selected", type === "wraithknight");
      if ($("pickThor")) $("pickThor").classList.toggle("selected", type === "thor");
    }
    renderTitleKeys();
    relabelTouch();
  }
  function relabelTouch() {
    const shadow = heroType === "shadow",
      ronin = heroType === "ronin",
      regal = heroType === "regal",
      wizard = heroType === "wizard",
      wraithKnight = heroType === "wraithknight",
      thor = heroType === "thor";
    if ($("ba"))
      $("ba").textContent = wraithKnight
        ? "WRAITH BLADE"
        : thor
        ? "STORM BLADE"
        : shadow
        ? "SHOOT"
        : regal
          ? "SWORD"
          : wizard
            ? "MISSILE"
            : "ATTACK";
    if ($("bp"))
      $("bp").textContent = wraithKnight
        ? "HAND PARRY"
        : thor
        ? "STORM BOLT"
        : shadow
        ? "DASH"
        : ronin
          ? "DEFLECT"
          : regal
            ? "GUN"
            : wizard
              ? "MAGIC SWORD"
              : "PARRY";
    if ($("bs1"))
      $("bs1").textContent = wraithKnight
        ? "DARK STORM"
        : thor
        ? "SKY STRIKE"
        : shadow
        ? "DIVE"
        : ronin
          ? "LUNGE"
          : regal
            ? "STAR"
            : wizard
              ? "SUMMON"
              : "SLASH";
    if ($("bs2"))
      $("bs2").textContent = wraithKnight
        ? "ASCEND"
        : thor
        ? "ASCEND"
        : shadow
        ? "RAIN"
        : ronin
          ? "FLAME"
          : regal
            ? "ABYSS"
            : wizard
              ? "COMET"
              : "BOMB";
  }
  function startGame(type) {
    if (typeof type === "string") bossType = type;
    ac();
    reset();
    if (bossType === "warden") ensureWardenBG();
    if (bossType === "spire") ensureSpireBG();
    phase = "intro";
    phaseT = 0;
    paused = false;
    clearInputState();
    hideFrontScreens();
    $("end").className = "ov hide";
    $("pause").classList.add("hide");
    $("pauseBtn").classList.remove("hide");
    musicStop(1.4);
  }
  function toTitle() {
    reset();
    phase = "title";
    phaseT = 0;
    paused = false;
    clearInputState();
    $("end").className = "ov hide";
    $("pause").classList.add("hide");
    $("pauseBtn").classList.add("hide");
    showFrontScreen("title");
    musicPlay("title");
  }

  /* ================= BACKGROUND LAYERS ================= */
  const LAY = {};
  function makeLayer(w, h, fn) {
    const c = document.createElement("canvas");
    c.width = Math.ceil(w * layerScale);
    c.height = Math.ceil(h * layerScale);
    const g = c.getContext("2d");
    g.scale(layerScale, layerScale);
    fn(g, w, h);
    return c;
  }
  function drawFar(g, w, h) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#05040a");
    gr.addColorStop(0.5, "#0e0a1c");
    gr.addColorStop(1, "#1b1228");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    const mx = w * 0.56,
      my = 150;
    let rg = g.createRadialGradient(mx, my, 20, mx, my, 260);
    rg.addColorStop(0, "rgba(160,110,230,.5)");
    rg.addColorStop(1, "rgba(160,110,230,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#b48be6";
    g.beginPath();
    g.arc(mx, my, 62, 0, TAU);
    g.fill();
    g.fillStyle = "rgba(90,50,150,.28)";
    [
      [-18, -14, 14],
      [16, 8, 20],
      [-10, 26, 9],
      [22, -22, 8],
    ].forEach((c) => {
      g.beginPath();
      g.arc(mx + c[0], my + c[1], c[2], 0, TAU);
      g.fill();
    });
    for (let i = 0; i < 70; i++) {
      g.fillStyle = "rgba(220,210,255," + rnd(0.15, 0.55) + ")";
      g.fillRect(rnd(0, w), rnd(0, 250), 1.2, 1.2);
    }
    g.strokeStyle = "rgba(120,110,175,.13)";
    g.lineWidth = 3;
    for (let x = -60; x < w + 260; x += 230) {
      g.beginPath();
      g.moveTo(x, 440);
      g.lineTo(x, 300);
      g.quadraticCurveTo(x, 210, x + 115, 170);
      g.quadraticCurveTo(x + 230, 210, x + 230, 300);
      g.lineTo(x + 230, 440);
      g.stroke();
    }
  }
  function drawMid(g, w, h) {
    g.fillStyle = "#090b18";
    g.fillRect(0, 0, w, h);
    const step = 290;
    const words = ["AHURA", "KYRIE", "MISERE", "PENITENS"];
    let wi = 0;
    for (let x = -40; x < w + step; x += step) {
      const a = x + 58,
        b = x + step - 20,
        m = (a + b) / 2;
      const gr = g.createLinearGradient(0, 64, 0, 440);
      gr.addColorStop(0, "#2c4a80");
      gr.addColorStop(0.5, "#172a50");
      gr.addColorStop(1, "#0a1224");
      g.beginPath();
      g.moveTo(a, 440);
      g.lineTo(a, 240);
      g.quadraticCurveTo(a, 130, m, 64);
      g.quadraticCurveTo(b, 130, b, 240);
      g.lineTo(b, 440);
      g.closePath();
      g.fillStyle = gr;
      g.fill();
      g.save();
      g.clip();
      g.fillStyle = "rgba(150,80,200,.12)";
      g.fillRect(a, 150, (b - a) / 2, 150);
      g.fillStyle = "rgba(230,150,70,.08)";
      g.fillRect(m, 200, (b - a) / 2, 150);
      let lg = g.createLinearGradient(0, 300, 0, 440);
      lg.addColorStop(0, "rgba(120,170,200,0)");
      lg.addColorStop(1, "rgba(120,170,200,.16)");
      g.fillStyle = lg;
      g.fillRect(a, 300, b - a, 140);
      g.strokeStyle = "rgba(170,190,230,.22)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(m, 70);
      g.lineTo(m, 440);
      g.moveTo(a, 300);
      g.lineTo(b, 300);
      g.moveTo(a + (m - a) / 2, 140);
      g.lineTo(a + (m - a) / 2, 440);
      g.moveTo(m + (b - m) / 2, 140);
      g.lineTo(m + (b - m) / 2, 440);
      g.moveTo(m + 24, 190);
      g.arc(m, 190, 24, 0, TAU);
      g.stroke();
      g.restore();
      g.strokeStyle = "#04050d";
      g.lineWidth = 7;
      g.beginPath();
      g.moveTo(a, 440);
      g.lineTo(a, 240);
      g.quadraticCurveTo(a, 130, m, 64);
      g.quadraticCurveTo(b, 130, b, 240);
      g.lineTo(b, 440);
      g.stroke();
      // pillar
      const pg = g.createLinearGradient(x - 40, 0, x + 58, 0);
      pg.addColorStop(0, "#0b0e1f");
      pg.addColorStop(0.45, "#171d38");
      pg.addColorStop(1, "#0a0d1b");
      g.fillStyle = pg;
      g.fillRect(x - 40, 0, 98, 440);
      g.fillStyle = "#1d2444";
      g.fillRect(x - 46, 232, 110, 8);
      g.fillRect(x - 46, 424, 110, 16);
      g.strokeStyle = "rgba(130,150,200,.14)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x - 10, 0);
      g.lineTo(x - 10, 440);
      g.moveTo(x + 28, 0);
      g.lineTo(x + 28, 440);
      g.stroke();
      // banner
      if (Math.floor((x + 40) / step) % 2 === 0) {
        const bx = x - 12;
        g.fillStyle = "rgba(184,172,140,.55)";
        g.beginPath();
        g.moveTo(bx, 40);
        g.lineTo(bx + 42, 40);
        g.lineTo(bx + 42, 236);
        g.lineTo(bx + 21, 250);
        g.lineTo(bx, 236);
        g.closePath();
        g.fill();
        g.strokeStyle = "rgba(60,50,30,.6)";
        g.lineWidth = 1;
        g.stroke();
        g.fillStyle = "rgba(28,22,12,.85)";
        g.font = "700 17px Cinzel, Georgia, serif";
        g.textAlign = "center";
        const word = words[wi++ % words.length];
        for (let i = 0; i < word.length; i++)
          g.fillText(word[i], bx + 21, 66 + i * 24);
      }
    }
  }
  function drawNear(g, w, h) {
    for (let x = 120; x < w + 500; x += 640) {
      const pg = g.createLinearGradient(x - 55, 0, x + 55, 0);
      pg.addColorStop(0, "#04050b");
      pg.addColorStop(0.5, "#0d1122");
      pg.addColorStop(1, "#03040a");
      g.fillStyle = pg;
      g.fillRect(x - 55, 0, 110, 452);
      g.fillStyle = "#131933";
      g.fillRect(x - 64, 60, 128, 10);
      g.fillRect(x - 64, 430, 128, 22);
      g.strokeStyle = "rgba(140,160,210,.12)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x - 20, 70);
      g.lineTo(x - 20, 430);
      g.moveTo(x + 22, 70);
      g.lineTo(x + 22, 430);
      g.stroke();
      g.strokeStyle = "rgba(120,120,150,.25)";
      g.lineWidth = 1.6;
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(x + 90, 0);
      g.lineTo(x + 90 + 4, 210);
      g.stroke();
      g.setLineDash([]);
    }
    const fg = g.createLinearGradient(0, 300, 0, 450);
    fg.addColorStop(0, "rgba(60,50,90,0)");
    fg.addColorStop(1, "rgba(60,50,90,.28)");
    g.fillStyle = fg;
    g.fillRect(0, 300, w, 150);
  }
  function drawGround(g, w, h) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#262034");
    gr.addColorStop(0.25, "#171221");
    gr.addColorStop(1, "#08060d");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,0,0,.55)";
    g.lineWidth = 1.5;
    [10, 26, 48, 78].forEach((y) => {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    });
    for (let x = 0; x < w; x += 150) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + (x - w / 2) * 0.18, h);
      g.stroke();
    }
    g.strokeStyle = "rgba(230,190,110,.22)";
    g.lineWidth = 2;
    [
      [430, 40],
      [320, 30],
      [190, 18],
    ].forEach((r) => {
      g.beginPath();
      g.ellipse(w / 2, 46, r[0], r[1], 0, 0, TAU);
      g.stroke();
    });
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * TAU;
      g.beginPath();
      g.moveTo(w / 2 + Math.cos(a) * 320, 46 + Math.sin(a) * 30);
      g.lineTo(w / 2 + Math.cos(a) * 430, 46 + Math.sin(a) * 40);
      g.stroke();
    }
    g.fillStyle = "rgba(230,190,110,.3)";
    g.font = "600 11px Cinzel, Georgia, serif";
    g.textAlign = "center";
    "MISERERE  NOBIS  DOMINE".split("").forEach((ch, i, arr) => {
      const a = -Math.PI / 2 + (i / arr.length) * TAU + 0.1;
      g.save();
      g.translate(w / 2 + Math.cos(a) * 375, 46 + Math.sin(a) * 35);
      g.rotate(a + Math.PI / 2);
      g.scale(1, 0.18);
      g.fillText(ch, 0, 0);
      g.restore();
    });
    const rg = g.createRadialGradient(w / 2, 40, 10, w / 2, 40, 520);
    rg.addColorStop(0, "rgba(170,120,230,.16)");
    rg.addColorStop(1, "rgba(170,120,230,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#3a3050";
    g.fillRect(0, 0, w, 1.5);
  }
  function drawVig(g, w, h) {
    const rg = g.createRadialGradient(
      w / 2,
      h / 2,
      h * 0.32,
      w / 2,
      h / 2,
      h * 0.95,
    );
    rg.addColorStop(0, "rgba(0,0,0,0)");
    rg.addColorStop(1, "rgba(2,1,6,.78)");
    g.fillStyle = rg;
    g.fillRect(0, 0, w, h);
  }
  function drawFog(g, w, h) {
    for (let i = 0; i < 16; i++) {
      const x = rnd(0, w),
        y = rnd(40, h - 30),
        r = rnd(110, 200),
        rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, "rgba(150,140,190,.10)");
      rg.addColorStop(1, "rgba(150,140,190,0)");
      g.fillStyle = rg;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  function drawDemonFar(g, w, h) {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#090407");
    sky.addColorStop(0.45, "#38100d");
    sky.addColorStop(1, "#a12a12");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    const sun = g.createRadialGradient(w * 0.55, 110, 10, w * 0.55, 110, 260);
    sun.addColorStop(0, "rgba(255,170,55,.9)");
    sun.addColorStop(0.35, "rgba(255,55,20,.35)");
    sun.addColorStop(1, "rgba(255,30,10,0)");
    g.fillStyle = sun;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#18080a";
    g.beginPath();
    g.moveTo(0, 360);
    for (let x = 0; x <= w; x += 90) g.lineTo(x, 210 - rnd(0, 150));
    g.lineTo(w, 440);
    g.lineTo(0, 440);
    g.fill();
    for (let i = 0; i < 5; i++) {
      const x = w * (0.12 + i * 0.2),
        top = 110 + rnd(-25, 35);
      g.fillStyle = "#260b0c";
      g.beginPath();
      g.moveTo(x - 90, 420);
      g.lineTo(x, top);
      g.lineTo(x + 100, 420);
      g.fill();
      g.strokeStyle = "#ff3b18";
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(x, top + 18);
      g.bezierCurveTo(x - 12, 220, x + 18, 285, x - 4, 420);
      g.stroke();
    }
  }
  function drawDemonMid(g, w, h) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(18,5,7,.94)";
    for (let x = -30; x < w; x += 235) {
      g.fillRect(x, 260, 58, 185);
      g.fillRect(x - 18, 250, 94, 16);
      g.strokeStyle = "#6b2118";
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(x + 29, 260);
      g.lineTo(x + 29, 80);
      g.stroke();
      g.fillStyle = "#311013";
      g.beginPath();
      g.arc(x + 29, 75, 28, 0, TAU);
      g.fill();
    }
    g.strokeStyle = "rgba(255,60,25,.45)";
    g.lineWidth = 3;
    for (let x = 0; x < w; x += 180) {
      g.beginPath();
      g.moveTo(x, 390);
      g.lineTo(x + 70, 315);
      g.lineTo(x + 125, 390);
      g.stroke();
    }
  }
  function drawDemonNear(g, w, h) {
    g.clearRect(0, 0, w, h);
    for (let x = 150; x < w; x += 520) {
      g.fillStyle = "#0d0507";
      g.fillRect(x - 32, 0, 64, 445);
      g.strokeStyle = "#421217";
      g.lineWidth = 6;
      g.strokeRect(x - 32, 0, 64, 445);
      g.strokeStyle = "#8c2a1b";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x - 58, 0);
      g.lineTo(x - 52, 180);
      g.moveTo(x + 58, 0);
      g.lineTo(x + 52, 180);
      g.stroke();
    }
  }
  function drawDemonGround(g, w, h) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#3a1a17");
    gr.addColorStop(1, "#090506");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#170707";
    g.lineWidth = 2;
    for (let x = 0; x < w; x += 70) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + rnd(-20, 20), h);
      g.stroke();
    }
    g.shadowColor = "#ff2d14";
    g.shadowBlur = 8;
    g.strokeStyle = "#ff4a1e";
    g.lineWidth = 2;
    for (let x = 30; x < w; x += 145) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 25, 24);
      g.lineTo(x - 8, 48);
      g.lineTo(x + 32, 78);
      g.lineTo(x + 12, h);
      g.stroke();
    }
    g.shadowBlur = 0;
  }

  function drawShogunFar(g, w, h) {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#080d16");
    sky.addColorStop(0.52, "#142230");
    sky.addColorStop(1, "#354451");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    const mx = w * 0.26, my = 86;
    const halo = g.createRadialGradient(mx, my, 8, mx, my, 125);
    halo.addColorStop(0, "rgba(255,255,235,.65)");
    halo.addColorStop(0.18, "rgba(220,232,222,.24)");
    halo.addColorStop(1, "rgba(190,215,225,0)");
    g.fillStyle = halo;
    g.fillRect(mx - 140, my - 140, 280, 280);
    g.fillStyle = "#eef1df";
    g.beginPath();
    g.arc(mx, my, 34, 0, TAU);
    g.fill();
    g.fillStyle = "rgba(115,128,120,.28)";
    for (let i = 0; i < 8; i++) {
      g.beginPath();
      g.arc(mx + rnd(-22, 22), my + rnd(-19, 19), rnd(3, 8), 0, TAU);
      g.fill();
    }
    g.fillStyle = "#0b1119";
    g.beginPath();
    g.moveTo(0, 375);
    for (let x = 0; x <= w; x += 100) g.lineTo(x, 250 + Math.sin(x * 0.011) * 28 + rnd(-25, 18));
    g.lineTo(w, 440);
    g.lineTo(0, 440);
    g.fill();
  }
  function drawShogunMid(g, w, h) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(16,23,31,.88)";
    for (let x = 80; x < w; x += 310) {
      const bh = 80 + ((x / 37) % 70);
      g.beginPath();
      g.moveTo(x - 75, 430);
      g.quadraticCurveTo(x - 45, 350 - bh * .4, x, 310 - bh);
      g.quadraticCurveTo(x + 45, 345 - bh * .3, x + 86, 430);
      g.fill();
    }
    g.strokeStyle = "rgba(170,190,200,.24)";
    g.lineWidth = 2;
    for (let x = 40; x < w; x += 220) {
      g.beginPath();
      g.moveTo(x, 430);
      g.lineTo(x + rnd(-16,16), 325);
      g.stroke();
    }
  }
  function drawShogunNear(g, w, h) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(3,7,12,.92)";
    for (let x = 170; x < w; x += 620) {
      g.beginPath();
      g.moveTo(x - 54, 445);
      g.quadraticCurveTo(x - 38, 315, x - 12, 278);
      g.quadraticCurveTo(x + 12, 300, x + 46, 445);
      g.fill();
    }
  }
  function drawShogunGround(g, w, h) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#52605d");
    gr.addColorStop(0.24, "#303c3b");
    gr.addColorStop(1, "#080d12");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    for (let x = -10; x < w + 20; x += 8) {
      const height = 20 + ((x * 17) % 34 + 34) % 34;
      const sway = Math.sin(x * .09) * 5;
      g.strokeStyle = x % 24 === 0 ? "rgba(242,244,225,.88)" : "rgba(198,208,194,.65)";
      g.lineWidth = x % 24 === 0 ? 1.8 : 1;
      g.beginPath();
      g.moveTo(x, h);
      g.quadraticCurveTo(x + sway, h - height * .55, x + sway * 1.45, h - height);
      g.stroke();
      if (x % 24 === 0) {
        g.fillStyle = "rgba(244,242,220,.8)";
        for (let j = 0; j < 4; j++) {
          const yy = h - height + j * 5;
          g.beginPath();
          g.ellipse(x + sway * 1.45 + (j % 2 ? 3 : -3), yy, 4, 1.2, j % 2 ? .5 : -.5, 0, TAU);
          g.fill();
        }
      }
    }
  }
  /* Volturus arena: a storm-broken cathedral based on the supplied arena
     reference.  It is drawn in parallax layers so the reference character
     is never baked into gameplay and the stage remains readable at every
     camera position. */
  function drawVolturusFar(g, w, h) {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#050817");
    sky.addColorStop(0.5, "#17243c");
    sky.addColorStop(1, "#40536b");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    const mx = w * 0.2, my = 95;
    const moon = g.createRadialGradient(mx, my, 12, mx, my, 120);
    moon.addColorStop(0, "rgba(226,242,255,.85)");
    moon.addColorStop(0.2, "rgba(150,190,235,.28)");
    moon.addColorStop(1, "rgba(90,135,210,0)");
    g.fillStyle = moon;
    g.fillRect(mx - 130, my - 130, 260, 260);
    g.fillStyle = "#d9e6ed";
    g.beginPath();
    g.arc(mx, my, 34, 0, TAU);
    g.fill();
    g.fillStyle = "rgba(60,80,110,.2)";
    g.beginPath();
    g.arc(mx + 14, my - 8, 29, 0, TAU);
    g.fill();
    // Distant gothic skyline.
    g.fillStyle = "#090f1b";
    g.beginPath();
    g.moveTo(0, 390);
    for (let x = 0; x <= w + 90; x += 90) {
      const top = 270 - ((x / 90) % 3) * 28;
      g.lineTo(x, 390);
      g.lineTo(x + 34, top);
      g.lineTo(x + 45, top - 75);
      g.lineTo(x + 56, top);
      g.lineTo(x + 90, 390);
    }
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.fill();
    // Frozen lightning in the distant storm.
    g.strokeStyle = "rgba(137,155,255,.36)";
    g.shadowColor = "#755cff";
    g.shadowBlur = 12;
    g.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      const x = w * (0.42 + i * 0.13);
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x - 14, 48);
      g.lineTo(x + 5, 73);
      g.lineTo(x - 20, 132);
      g.stroke();
    }
    g.shadowBlur = 0;
  }
  function drawVolturusMid(g, w, h) {
    g.clearRect(0, 0, w, h);
    const stone = g.createLinearGradient(0, 120, 0, 440);
    stone.addColorStop(0, "rgba(31,43,61,.96)");
    stone.addColorStop(1, "rgba(9,14,25,.98)");
    for (let x = -40; x < w + 300; x += 300) {
      const a = x + 22, b = x + 278, m = (a + b) / 2;
      g.fillStyle = stone;
      g.beginPath();
      g.moveTo(a, 440);
      g.lineTo(a, 235);
      g.quadraticCurveTo(a, 125, m, 92);
      g.quadraticCurveTo(b, 125, b, 235);
      g.lineTo(b, 440);
      g.closePath();
      g.fill();
      // Open, broken arch.
      g.fillStyle = "rgba(6,10,18,.95)";
      g.beginPath();
      g.moveTo(a + 35, 440);
      g.lineTo(a + 35, 242);
      g.quadraticCurveTo(a + 35, 158, m, 126);
      g.quadraticCurveTo(b - 35, 158, b - 35, 242);
      g.lineTo(b - 35, 440);
      g.closePath();
      g.fill();
      g.strokeStyle = "rgba(105,128,154,.28)";
      g.lineWidth = 4;
      g.stroke();
      // Buttresses and cracked capitals.
      g.fillStyle = "#151e2c";
      g.fillRect(x - 7, 155, 56, 285);
      g.fillRect(x - 17, 148, 76, 14);
      g.strokeStyle = "rgba(120,145,170,.2)";
      g.lineWidth = 2;
      g.strokeRect(x + 4, 165, 34, 275);
    }
    // Thorn silhouettes along the shattered wall.
    g.strokeStyle = "rgba(6,8,13,.9)";
    g.lineWidth = 4;
    for (let x = 20; x < w; x += 82) {
      g.beginPath();
      g.moveTo(x, 225);
      g.quadraticCurveTo(x + 22, 188, x + 46, 216);
      g.lineTo(x + 58, 185);
      g.moveTo(x + 31, 205);
      g.lineTo(x + 19, 178);
      g.stroke();
    }
  }
  function drawVolturusNear(g, w, h) {
    g.clearRect(0, 0, w, h);
    for (let x = 90; x < w + 500; x += 650) {
      const pg = g.createLinearGradient(x - 58, 0, x + 58, 0);
      pg.addColorStop(0, "rgba(3,6,12,.98)");
      pg.addColorStop(0.5, "rgba(21,30,45,.98)");
      pg.addColorStop(1, "rgba(3,6,12,.98)");
      g.fillStyle = pg;
      g.fillRect(x - 58, 0, 116, 448);
      g.fillStyle = "#1d293b";
      g.fillRect(x - 69, 72, 138, 13);
      g.fillRect(x - 70, 426, 140, 22);
      g.strokeStyle = "rgba(132,154,188,.2)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x - 21, 86);
      g.lineTo(x - 21, 426);
      g.moveTo(x + 22, 86);
      g.lineTo(x + 22, 426);
      g.stroke();
    }
    const haze = g.createLinearGradient(0, 270, 0, 450);
    haze.addColorStop(0, "rgba(66,92,125,0)");
    haze.addColorStop(1, "rgba(74,93,125,.22)");
    g.fillStyle = haze;
    g.fillRect(0, 270, w, 180);
  }
  function drawVolturusGround(g, w, h) {
    const floor = g.createLinearGradient(0, 0, 0, h);
    floor.addColorStop(0, "#293443");
    floor.addColorStop(0.28, "#141b27");
    floor.addColorStop(1, "#05080e");
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(4,7,12,.78)";
    g.lineWidth = 2;
    [9, 27, 51, 82].forEach((y) => {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    });
    for (let x = -40; x < w + 80; x += 118) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + (x - w / 2) * 0.1, h);
      g.stroke();
    }
    // Violet runic dais and broken cracks.
    g.shadowColor = "#774cff";
    g.shadowBlur = 10;
    g.strokeStyle = "rgba(151,105,255,.42)";
    g.lineWidth = 2;
    [210, 330, 455].forEach((r, i) => {
      g.beginPath();
      g.ellipse(w / 2, 42, r, 17 + i * 9, 0, 0, TAU);
      g.stroke();
    });
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * TAU;
      g.beginPath();
      g.moveTo(w / 2 + Math.cos(a) * 330, 42 + Math.sin(a) * 25);
      g.lineTo(w / 2 + Math.cos(a) * 455, 42 + Math.sin(a) * 34);
      g.stroke();
    }
    g.shadowBlur = 0;
    g.strokeStyle = "rgba(118,153,190,.2)";
    for (let x = 55; x < w; x += 170) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 23, 18);
      g.lineTo(x - 12, 35);
      g.lineTo(x + 31, 61);
      g.stroke();
    }
    g.fillStyle = "#445266";
    g.fillRect(0, 0, w, 2);
  }
  function drawWraithFar(g, w, h) {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#03050b");
    sky.addColorStop(0.58, "#12172a");
    sky.addColorStop(1, "#080b12");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    const mx = w * 0.52, my = 130, mr = 92;
    const halo = g.createRadialGradient(mx, my, mr * 0.2, mx, my, mr * 2.5);
    halo.addColorStop(0, "rgba(235,240,255,.98)");
    halo.addColorStop(0.38, "rgba(180,195,255,.42)");
    halo.addColorStop(1, "rgba(70,82,145,0)");
    g.fillStyle = halo;
    g.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
    g.fillStyle = "#d9def2";
    g.shadowColor = "#9aa9ef";
    g.shadowBlur = 28;
    g.beginPath();
    g.arc(mx, my, mr, 0, TAU);
    g.fill();
    g.shadowBlur = 0;
    g.fillStyle = "rgba(76,83,120,.35)";
    for (let i = 0; i < 17; i++) {
      g.beginPath();
      g.arc(mx + rnd(-62, 62), my + rnd(-62, 62), rnd(5, 18), 0, TAU);
      g.fill();
    }
    g.fillStyle = "#05070d";
    g.beginPath();
    g.moveTo(0, 335);
    for (let x = 0; x <= w; x += 45)
      g.lineTo(x, 290 - Math.abs(Math.sin(x * 0.018)) * 110 - (x % 180 === 0 ? 60 : 0));
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.fill();
    // Ruined spires silhouetted beneath the moon.
    for (let x = 70; x < w; x += 145) {
      const bh = 65 + (x % 4) * 18;
      g.fillStyle = "#070912";
      g.fillRect(x, 335 - bh, 70, bh);
      poly(g, [[x - 10, 335 - bh], [x + 35, 220 - bh * 0.35], [x + 80, 335 - bh]], "#070912", null);
      g.fillRect(x + 31, 190 - bh * 0.25, 8, 70);
      poly(g, [[x + 27, 195 - bh * 0.25], [x + 35, 155 - bh * 0.25], [x + 43, 195 - bh * 0.25]], "#070912", null);
    }
  }
  function drawWraithMid(g, w, h) {
    g.clearRect(0, 0, w, h);
    const haze = g.createLinearGradient(0, 250, 0, 450);
    haze.addColorStop(0, "rgba(35,45,75,0)");
    haze.addColorStop(1, "rgba(65,75,112,.3)");
    g.fillStyle = haze;
    g.fillRect(0, 240, w, 220);
    g.fillStyle = "#0a0d16";
    g.beginPath();
    g.moveTo(0, 420);
    for (let x = 0; x <= w; x += 70)
      g.lineTo(x, 380 - Math.abs(Math.sin(x * 0.027 + 1.2)) * 92);
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.fill();
    for (let x = 65; x < w; x += 170) {
      g.strokeStyle = "#171b29";
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(x, 430);
      g.bezierCurveTo(x - 55, 390, x - 45, 325, x - 12, 285);
      g.stroke();
      g.strokeStyle = "rgba(255,122,28,.7)";
      g.shadowColor = "#ff6518";
      g.shadowBlur = 12;
      g.beginPath();
      g.moveTo(x - 8, 365);
      g.lineTo(x + 8, 365);
      g.stroke();
      g.shadowBlur = 0;
    }
  }
  function drawWraithNear(g, w, h) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(5,7,13,.84)";
    for (let x = -80; x < w + 100; x += 310) {
      poly(g, [[x, 455], [x + 45, 300], [x + 82, 435], [x + 130, 270], [x + 190, 455]], "#080b13", "#151b2b", 3);
      g.strokeStyle = "#111725";
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(x + 20, 448);
      g.quadraticCurveTo(x + 90, 390, x + 165, 445);
      g.stroke();
    }
  }
  function drawWraithGround(g, w, h) {
    const floor = g.createLinearGradient(0, 0, 0, h);
    floor.addColorStop(0, "#262b38");
    floor.addColorStop(0.22, "#141824");
    floor.addColorStop(1, "#05070d");
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(83,92,120,.3)";
    g.lineWidth = 1.5;
    [8, 28, 55, 88].forEach((y) => {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    });
    for (let x = 0; x < w; x += 105) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + rnd(-35, 35), h);
      g.stroke();
      g.strokeStyle = "rgba(5,7,12,.75)";
      g.beginPath();
      g.moveTo(x + 24, 12);
      g.lineTo(x + 42, 29);
      g.lineTo(x + 19, 48);
      g.lineTo(x + 55, 73);
      g.stroke();
      g.strokeStyle = "rgba(83,92,120,.3)";
    }
    g.fillStyle = "#3c4353";
    g.fillRect(0, 0, w, 2);
  }
  function drawWardenFar(g, w, h) {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#08061b");
    sky.addColorStop(0.48, "#17154a");
    sky.addColorStop(1, "#050713");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    const cx = w * 0.58,
      cy = 190,
      maxR = Math.max(w, h) * 0.72;
    const halo = g.createRadialGradient(cx, cy, 14, cx, cy, maxR * 0.85);
    halo.addColorStop(0, "rgba(3,3,13,.98)");
    halo.addColorStop(0.16, "rgba(19,15,57,.94)");
    halo.addColorStop(0.48, "rgba(73,75,178,.46)");
    halo.addColorStop(1, "rgba(76,92,210,0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, w, h);
    g.save();
    g.translate(cx, cy);
    g.rotate(-0.18);
    g.lineCap = "round";
    for (let band = 0; band < 34; band++) {
      const offset = band * 0.41,
        baseR = 34 + band * 13.5;
      g.beginPath();
      for (let j = 0; j <= 82; j++) {
        const a = offset + j * 0.105,
          r = baseR + j * (2.1 + (band % 4) * 0.08),
          squash = 0.53 + Math.min(0.2, band * 0.004),
          x = Math.cos(a) * r,
          y = Math.sin(a) * r * squash;
        if (j === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      const bright = band % 5 === 0;
      g.strokeStyle = bright
        ? "rgba(226,231,255,.64)"
        : band % 2
          ? "rgba(116,132,255,.27)"
          : "rgba(89,74,190,.34)";
      g.lineWidth = bright ? 4.5 : 2 + (band % 3);
      g.shadowColor = bright ? "#aebeff" : "#6756ca";
      g.shadowBlur = bright ? 13 : 5;
      g.stroke();
    }
    g.shadowBlur = 0;
    const core = g.createRadialGradient(0, 0, 2, 0, 0, 86);
    core.addColorStop(0, "#010107");
    core.addColorStop(0.55, "rgba(3,4,20,.98)");
    core.addColorStop(1, "rgba(18,16,55,0)");
    g.fillStyle = core;
    g.beginPath();
    g.ellipse(0, 0, 122, 68, 0, 0, TAU);
    g.fill();
    g.restore();
    for (let i = 0; i < 150; i++) {
      const x = rnd(0, w),
        y = rnd(18, 390),
        a = 0.12 + Math.random() * 0.55;
      g.fillStyle = "rgba(195,210,255," + a + ")";
      g.fillRect(x, y, rnd(0.7, 2.2), rnd(0.7, 2.2));
    }
  }
  function drawWardenMid(g, w, h) {
    g.clearRect(0, 0, w, h);
    const haze = g.createLinearGradient(0, 250, 0, 470);
    haze.addColorStop(0, "rgba(62,69,160,0)");
    haze.addColorStop(0.6, "rgba(40,48,125,.24)");
    haze.addColorStop(1, "rgba(3,5,18,.75)");
    g.fillStyle = haze;
    g.fillRect(0, 230, w, 250);
    g.strokeStyle = "rgba(120,150,255,.24)";
    g.lineWidth = 2;
    for (let x = -120; x < w + 160; x += 115) {
      g.beginPath();
      g.moveTo(x, 455);
      g.bezierCurveTo(x + 95, 414, x + 145, 430, x + 240, 393);
      g.stroke();
    }
    for (let x = 45; x < w; x += 270) {
      const glow = g.createRadialGradient(x, 414, 1, x, 414, 56);
      glow.addColorStop(0, "rgba(132,167,255,.55)");
      glow.addColorStop(1, "rgba(74,80,190,0)");
      g.fillStyle = glow;
      g.fillRect(x - 60, 350, 120, 120);
    }
  }
  function drawWardenNear(g, w, h) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(2,3,12,.72)";
    for (let x = -90; x < w + 120; x += 330) {
      poly(
        g,
        [
          [x, 470],
          [x + 55, 365],
          [x + 82, 448],
          [x + 138, 330],
          [x + 188, 458],
          [x + 252, 382],
          [x + 305, 470],
        ],
        "#050715",
        "rgba(85,91,170,.4)",
        2,
      );
    }
  }
  function drawWardenGround(g, w, h) {
    const floor = g.createLinearGradient(0, 0, 0, h);
    floor.addColorStop(0, "#343a70");
    floor.addColorStop(0.12, "#171c43");
    floor.addColorStop(0.55, "#090c22");
    floor.addColorStop(1, "#03040e");
    g.fillStyle = floor;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(116,142,255,.34)";
    g.lineWidth = 1.4;
    for (let y = 4; y < h; y += 24) {
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 90)
        g.lineTo(x, y + Math.sin(x * 0.018 + y) * 5);
      g.stroke();
    }
    for (let x = 20; x < w; x += 92) {
      g.strokeStyle = x % 184 ? "rgba(45,53,112,.7)" : "rgba(115,139,235,.26)";
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + rnd(-42, 42), h);
      g.stroke();
    }
    g.fillStyle = "#6975b5";
    g.fillRect(0, 0, w, 2);
  }
  function ensureWardenBG() {
    if (LAY.efar) return;
    // Boss seven's large vortex layers are built only when selected so the
    // title screen and the other arenas do not carry their canvas memory.
    LAY.efar = makeLayer(W + (WORLD - W) * 0.12, H, drawWardenFar);
    LAY.emid = makeLayer(W + (WORLD - W) * 0.35, H, drawWardenMid);
    LAY.enear = makeLayer(W + (WORLD - W) * 0.8, H, drawWardenNear);
    LAY.eground = makeLayer(WORLD, H - 430, drawWardenGround);
  }
  function drawSpireFar(g,w,h){g.fillStyle="#07090b";g.fillRect(0,0,w,h);if(imgSpireArena.complete&&imgSpireArena.naturalWidth){const iw=imgSpireArena.naturalWidth,ih=imgSpireArena.naturalHeight,scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale,sx=(iw-sw)/2,sy=Math.max(0,(ih-sh)*.3);g.drawImage(imgSpireArena,sx,sy,sw,sh,0,0,w,h);g.fillStyle="rgba(3,4,6,.18)";g.fillRect(0,0,w,h)}}
  function drawSpireEmpty(g,w,h){g.clearRect(0,0,w,h)}
  function drawSpireGround(g,w,h){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"rgba(35,39,43,.05)");gr.addColorStop(1,"rgba(2,3,4,.68)");g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle="rgba(120,125,130,.22)";for(let x=0;x<w;x+=110){g.beginPath();g.moveTo(x,0);g.lineTo(x-70,h);g.stroke()}}
  function ensureSpireBG(){if(LAY.spfar)return;LAY.spfar=makeLayer(W+(WORLD-W)*.12,H,drawSpireFar);LAY.spmid=makeLayer(W+(WORLD-W)*.35,H,drawSpireEmpty);LAY.spnear=makeLayer(W+(WORLD-W)*.8,H,drawSpireEmpty);LAY.spground=makeLayer(WORLD,H-430,drawSpireGround)}
  function buildBG() {
    LAY.far = makeLayer(W + (WORLD - W) * 0.12, H, drawFar);
    LAY.mid = makeLayer(W + (WORLD - W) * 0.35, H, drawMid);
    LAY.near = makeLayer(W + (WORLD - W) * 0.8, H, drawNear);
    LAY.ground = makeLayer(WORLD, H - 430, drawGround);
    LAY.vig = makeLayer(W, H, drawVig);
    LAY.fog = makeLayer(1400, 220, drawFog);
    LAY.dfar = makeLayer(W + (WORLD - W) * 0.12, H, drawDemonFar);
    LAY.dmid = makeLayer(W + (WORLD - W) * 0.35, H, drawDemonMid);
    LAY.dnear = makeLayer(W + (WORLD - W) * 0.8, H, drawDemonNear);
    LAY.dground = makeLayer(WORLD, H - 430, drawDemonGround);
    LAY.sfar = makeLayer(W + (WORLD - W) * 0.12, H, drawShogunFar);
    LAY.smid = makeLayer(W + (WORLD - W) * 0.35, H, drawShogunMid);
    LAY.snear = makeLayer(W + (WORLD - W) * 0.8, H, drawShogunNear);
    LAY.sground = makeLayer(WORLD, H - 430, drawShogunGround);
    LAY.vfar = makeLayer(W + (WORLD - W) * 0.12, H, drawVolturusFar);
    LAY.vmid = makeLayer(W + (WORLD - W) * 0.35, H, drawVolturusMid);
    LAY.vnear = makeLayer(W + (WORLD - W) * 0.8, H, drawVolturusNear);
    LAY.vground = makeLayer(WORLD, H - 430, drawVolturusGround);
    LAY.wfar = makeLayer(W + (WORLD - W) * 0.12, H, drawWraithFar);
    LAY.wmid = makeLayer(W + (WORLD - W) * 0.35, H, drawWraithMid);
    LAY.wnear = makeLayer(W + (WORLD - W) * 0.8, H, drawWraithNear);
    LAY.wground = makeLayer(WORLD, H - 430, drawWraithGround);
  }
  const flowers = [],
    blades = [];
  (function () {
    for (let i = 0; i < 190; i++) {
      const y = 438 + Math.pow(Math.random(), 0.8) * 98;
      flowers.push({
        x: rnd(0, WORLD),
        y,
        s: 0.6 + ((y - 438) / 100) * 0.95,
        h: rnd(10, 30),
        ph: rnd(0, 7),
        n: Math.random() < 0.5 ? 5 : 6,
      });
    }
    flowers.sort((a, b) => a.y - b.y);
    for (let i = 0; i < 420; i++)
      blades.push({
        x: rnd(0, WORLD),
        y: 436 + Math.random() * 100,
        h: rnd(6, 20),
        ph: rnd(0, 7),
      });
  })();
  function drawBlades(y0, y1) {
    ctx.strokeStyle = "rgba(30,58,42,.9)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (const b of blades) {
      if (b.y < y0 || b.y >= y1 || b.x < cam - 20 || b.x > cam + W + 20)
        continue;
      const sw = Math.sin(time * 1.5 + b.ph) * 2.2;
      ctx.moveTo(b.x, b.y);
      ctx.quadraticCurveTo(
        b.x + sw * 0.4,
        b.y - b.h * 0.5,
        b.x + sw,
        b.y - b.h,
      );
    }
    ctx.stroke();
  }
  function drawFlowers(y0, y1) {
    for (const f of flowers) {
      if (f.y < y0 || f.y >= y1 || f.x < cam - 30 || f.x > cam + W + 30)
        continue;
      const sw = Math.sin(time * 1.4 + f.ph) * 3 * f.s,
        h = f.h * f.s + 8 * f.s,
        cx = f.x + sw,
        cy = f.y - h;
      ctx.strokeStyle = "#1f3d2c";
      ctx.lineWidth = 1.5 * f.s;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.quadraticCurveTo(f.x + sw * 0.4, f.y - h * 0.5, cx, cy);
      ctx.stroke();
      ctx.fillStyle = "rgba(240,235,255,.11)";
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * f.s, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#f2eee2";
      ctx.strokeStyle = "rgba(80,70,90,.55)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let i = 0; i < f.n; i++) {
        const a = (i / f.n) * TAU + f.ph;
        ctx.moveTo(
          cx + Math.cos(a) * 3.6 * f.s + 2.6 * f.s,
          cy + Math.sin(a) * 3.2 * f.s,
        );
        ctx.arc(
          cx + Math.cos(a) * 3.6 * f.s,
          cy + Math.sin(a) * 3.2 * f.s,
          2.6 * f.s,
          0,
          TAU,
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e8c15e";
      ctx.beginPath();
      ctx.arc(cx, cy, 1.7 * f.s, 0, TAU);
      ctx.fill();
    }
  }

  /* ================= RENDER ================= */
  function drawShadow(x, y, w, air) {
    ctx.fillStyle = "rgba(0,0,0," + (0.38 - air * 0.2) + ")";
    ctx.beginPath();
    ctx.ellipse(x, GROUND + 4, w * (1 - air * 0.4), 6, 0, 0, TAU);
    ctx.fill();
  }
  function drawCoopRevive() {
    if (gameMode !== "coop" || players.length < 2) return;
    for (let i = 0; i < 2; i++) {
      const down = players[i];
      if (!down || down.state !== "dead") continue;
      const rescuer = players[i === 0 ? 1 : 0],
        close =
          rescuer &&
          rescuer.state !== "dead" &&
          Math.abs(rescuer.x - down.x) <= REVIVE_RANGE,
        progress = clamp((down.reviveT || 0) / REVIVE_TIME, 0, 1),
        x = down.x,
        y = GROUND - 105,
        pulse = 1 + Math.sin(time * 5) * 0.05;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(pulse, pulse);
      ctx.lineCap = "round";
      ctx.shadowColor = close ? "#a98aff" : "#584a72";
      ctx.shadowBlur = close ? 14 : 6;
      for (let seg = 0; seg < 3; seg++) {
        const a0 = -Math.PI / 2 + seg * (TAU / 3) + 0.08,
          a1 = a0 + TAU / 3 - 0.16,
          filled = progress * 3 - seg;
        ctx.strokeStyle =
          filled >= 1
            ? "#c8b4ff"
            : filled > 0
              ? "rgba(178,145,255,.9)"
              : "rgba(110,98,135,.38)";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(0, 0, 24, a0, a1);
        ctx.stroke();
        if (filled > 0 && filled < 1) {
          ctx.strokeStyle = "#efe8ff";
          ctx.beginPath();
          ctx.arc(0, 0, 24, a0, a0 + (a1 - a0) * filled);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(4,5,10,.8)";
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "800 11px Cinzel, Georgia, serif";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,.85)";
      const label = close
        ? "HOLD " + (i === 0 ? primaryKey2("block") : primaryKey("block")) + " TO REVIVE"
        : "ALLY DOWN";
      ctx.strokeText(label, x, y - 39);
      ctx.fillStyle = close ? "#ded2ff" : "#958aa9";
      ctx.fillText(label, x, y - 39);
      ctx.restore();
    }
  }
  function drawWraithKnightBolts() {
    for (const q of wraithKnightBolts) {
      ctx.save();
      if (q.t < q.delay) {
        const k = clamp(q.t / q.delay, 0, 1);
        ctx.strokeStyle = "rgba(190,120,255," + (0.35 + k * 0.55) + ")";
        ctx.lineWidth = 3;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.ellipse(q.x, GROUND - 4, 58 - k * 16, 11, 0, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        const fade = clamp((q.life - q.t) / 0.22, 0, 1);
        ctx.globalAlpha = fade;
        ctx.shadowColor = "#9d54ff";
        ctx.shadowBlur = 22;
        for (let j = 0; j < 4; j++) {
          ctx.strokeStyle = j === 0 ? "#f3e8ff" : "rgba(136,65,230,.9)";
          ctx.lineWidth = j === 0 ? 5 : 2;
          ctx.beginPath();
          let x = q.x + (j - 1.5) * 5;
          ctx.moveTo(x, 0);
          for (let y = 0; y < GROUND; y += 35) {
            x = q.x + (j - 1.5) * 5 + Math.sin(y * 0.08 + q.t * 60 + j) * 15;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
  function drawBeam() {
    if (B.state !== "kame") return;
    const f = B.face;
    if (B.phase === "charge") {
      const charge = B.rage ? 0.95 : 1.15,
        k = B.pt / charge,
        hx = B.x + f * 51,
        hy = GROUND - 51;
      const r = 8 + 34 * k;
      let g = ctx.createRadialGradient(hx, hy, 1, hx, hy, r * 1.8);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.3, "rgba(210,170,255,.95)");
      g.addColorStop(1, "rgba(110,50,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(hx, hy, r * 1.8, 0, TAU);
      ctx.fill();
      // warning lane
      const a = 0.08 + 0.22 * k * (0.6 + 0.4 * Math.sin(time * 26)),
        x0 = B.x + f * 40;
      ctx.fillStyle = "rgba(190,120,255," + a + ")";
      ctx.fillRect(f > 0 ? x0 : x0 - WORLD, GROUND - BEAM_H, WORLD, BEAM_H);
      ctx.strokeStyle = "rgba(230,200,255," + a * 2 + ")";
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      const yy = GROUND - BEAM_H;
      ctx.moveTo(x0, yy);
      ctx.lineTo(x0 + f * WORLD, yy);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (B.phase === "fire") {
      const reach = Math.min(WORLD * 1.2, 4200 * B.pt + 40),
        x0 = B.x + f * 40,
        x1 = x0 + f * reach;
      const lo = Math.min(x0, x1),
        wd = Math.abs(reach),
        pulse = 1 + Math.sin(time * 90) * 0.06,
        fade = B.pt > 0.26 ? 1 - (B.pt - 0.26) / 0.1 : 1;
      ctx.save();
      ctx.globalAlpha = clamp(fade, 0, 1);
      const cy = GROUND - BEAM_H / 2;
      const layers = [
        [BEAM_H + 22, "rgba(110,50,255,.35)"],
        [BEAM_H, "rgba(160,100,255,.75)"],
        [BEAM_H * 0.62, "rgba(225,200,255,.95)"],
        [BEAM_H * 0.3, "rgba(255,255,255,1)"],
      ];
      for (const L of layers) {
        const hh = L[0] * pulse;
        ctx.fillStyle = L[1];
        ctx.beginPath();
        ctx.roundRect(lo, cy - hh / 2, wd, hh, hh / 2);
        ctx.fill();
      }
      let g = ctx.createRadialGradient(x0, cy, 2, x0, cy, 90);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(150,80,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x0, cy, 90, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
  function drawExplosion() {
    if (B.state !== "explode") return;
    const art = B.type === "art",
      cx = B.x,
      cy = GROUND - 70;
    const C1 = art ? "190,215,255" : "230,200,255",
      C2 = art ? "70,120,255" : "140,70,255",
      C3 = art ? "40,80,230" : "120,50,255",
      C4 = art ? "150,190,255" : "210,150,255",
      C5 = art ? "170,210,255" : "210,160,255";
    if (B.phase === "charge") {
      const chargeT = art ? (B.rage ? 0.95 : 1.15) : B.rage ? 1.0 : 1.2,
        k = Math.min(1, B.pt / chargeT),
        R = 250;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - R - 20, 0, R * 2 + 40, GROUND + 6);
      ctx.clip();
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, R);
      g.addColorStop(0, "rgba(" + C1 + "," + (0.25 + 0.45 * k) + ")");
      g.addColorStop(0.6, "rgba(" + C2 + "," + (0.1 + 0.15 * k) + ")");
      g.addColorStop(1, "rgba(" + C3 + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * (0.35 + 0.65 * k), 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle =
        "rgba(" +
        C4 +
        "," +
        (0.35 + 0.4 * Math.sin(time * 18) * 0.5 + 0.2) +
        ")";
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 12]);
      ctx.lineDashOffset = -time * 60;
      ctx.beginPath();
      ctx.ellipse(cx, GROUND + 2, R, 22, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(255,255,255," + (0.2 + 0.5 * k) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, GROUND + 2, R * k, 22 * k, 0, 0, TAU);
      ctx.stroke();
    } else if (B.phase === "burst") {
      const k = Math.min(1, B.pt / (art ? 0.5 : 0.55)),
        R = 270 * easeOut(Math.min(1, k * 1.6));
      ctx.save();
      ctx.globalAlpha = 1 - k * k;
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, R);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(" + C5 + ",.85)");
      g.addColorStop(1, "rgba(" + C3 + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
  function drawParts() {
    for (const p of parts) {
      const k = p.t / p.life;
      if (p.k === "spark") {
        ctx.strokeStyle = p.col;
        ctx.globalAlpha = 1 - k;
        ctx.lineWidth = p.sz * (1 - k * 0.5);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (p.k === "dot") {
        ctx.fillStyle = "rgba(" + p.col + "," + 0.8 * (1 - k) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz * (1 - k * 0.4), 0, TAU);
        ctx.fill();
      } else if (p.k === "petal") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, (1 - k) * 2);
        ctx.fillStyle = "#f4f0e6";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.sz, p.sz * 0.5, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (p.k === "gather") {
        const e = k * k,
          x = lerp(p.sx, p.tx, e),
          y = lerp(p.sy, p.ty, e);
        ctx.fillStyle =
          "rgba(" + (p.gc || "220,180,255") + "," + (0.3 + 0.7 * k) + ")";
        ctx.beginPath();
        ctx.arc(x, y, 2.2 * (1 - k * 0.5), 0, TAU);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  function drawFx() {
    for (const f of fx) {
      const k = f.t / f.life;
      if (f.k === "arc") {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale(f.face, 1);
        ctx.globalAlpha = 1 - k;
        ctx.lineCap = "round";
        ctx.strokeStyle = f.col;
        ctx.lineWidth = f.w * (1 - k * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, f.r, f.a0, f.a1, f.a1 < f.a0);
        ctx.stroke();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = f.w * 0.3 * (1 - k);
        ctx.beginPath();
        ctx.arc(0, 0, f.r, f.a0, f.a1, f.a1 < f.a0);
        ctx.stroke();
        ctx.restore();
      } else if (f.k === "streak") {
        ctx.save();
        ctx.globalAlpha = 1 - k;
        ctx.lineCap = "round";
        ctx.strokeStyle = f.col;
        ctx.lineWidth = 10 * (1 - k);
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x + f.len, f.y);
        ctx.stroke();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3 * (1 - k);
        ctx.stroke();
        ctx.restore();
      } else if (f.k === "ring") {
        const r = lerp(f.r0, f.r1, easeOut(k));
        ctx.save();
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = f.col;
        ctx.lineWidth = f.w * (1 - k);
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, r, r * (f.r1 > 150 ? 0.55 : 1), 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      } else if (f.k === "groundburst") {
        const r = lerp(18, f.r1, easeOut(k)),
          fade = Math.pow(1 - k, 1.4);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = fade;
        const glow = ctx.createLinearGradient(0, -75, 0, 14);
        glow.addColorStop(0, "rgba(255,40,10,0)");
        glow.addColorStop(0.55, "rgba(255,72,18,.48)");
        glow.addColorStop(1, "rgba(255,210,90,.92)");
        ctx.fillStyle = glow;
        ctx.fillRect(-r, -72, r * 2, 84);
        ctx.strokeStyle = "#ffbd66";
        ctx.lineWidth = 7 * (1 - k) + 2;
        ctx.beginPath();
        ctx.ellipse(0, 2, r, 10 + r * 0.018, 0, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = "#ff3b18";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 3, r * 0.78, 7 + r * 0.014, 0, 0, TAU);
        ctx.stroke();
        const spikes = Math.max(8, Math.floor(r / 55));
        for (let i = 0; i < spikes; i++) {
          const x = -r + ((i + 0.5) * r * 2) / spikes,
            hh = (22 + Math.sin(i * 12.7) * 13) * (1 - k);
          ctx.fillStyle = i % 2 ? "#ff4b1d" : "#ff9a3d";
          ctx.beginPath();
          ctx.moveTo(x - 9, 4);
          ctx.lineTo(x, -hh - 8);
          ctx.lineTo(x + 10, 4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(255,60,20,.9)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 7; i++) {
          const x = ((i - 3) * r) / 7;
          ctx.beginPath();
          ctx.moveTo(x, 4);
          ctx.lineTo(x + (i % 2 ? 18 : -18), 16);
          ctx.lineTo(x + (i % 2 ? -12 : 12), 26);
          ctx.stroke();
        }
        ctx.restore();
      } else if (f.k === "text") {
        ctx.save();
        ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
        ctx.font = "900 " + f.size + "px Cinzel, Georgia, serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,.8)";
        ctx.strokeText(f.txt, f.x, f.y - k * 34);
        ctx.fillStyle = f.col;
        ctx.fillText(f.txt, f.x, f.y - k * 34);
        ctx.restore();
      }
    }
  }
  function render(alpha) {
    if (alpha === undefined) alpha = 1;
    alpha = clamp(alpha, 0, 1);
    const sv = [P.x, P.y, B.x, cam, P.t, B.pt, time, P.stride, B.stride, B.h];
    P.x = lerp(prev.px, P.x, alpha);
    P.y = lerp(prev.py, P.y, alpha);
    B.x = lerp(prev.bx, B.x, alpha);
    cam = lerp(prev.cam, cam, alpha);
    P.stride = lerp(prev.pst, P.stride, alpha);
    B.stride = lerp(prev.bst, B.stride, alpha);
    B.h = lerp(prev.bh, B.h, alpha);
    if (P.state === prev.ps) P.t = lerp(prev.pt, P.t, alpha);
    if (B.state === prev.bs && B.phase === prev.bph)
      B.pt = lerp(prev.bpt, B.pt, alpha);
    time = time - DT * (1 - alpha);
    try {
      renderFrame();
    } finally {
      P.x = sv[0];
      P.y = sv[1];
      B.x = sv[2];
      cam = sv[3];
      P.t = sv[4];
      B.pt = sv[5];
      time = sv[6];
      P.stride = sv[7];
      B.stride = sv[8];
      B.h = sv[9];
    }
  }
  function renderFrame() {
    const rw = cv.width,
      rh = cv.height,
      ds = Math.min(rw / W, rh / H),
      ox = (rw - W * ds) / 2,
      oy = (rh - H * ds) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#020205";
    ctx.fillRect(0, 0, rw, rh);
    ctx.setTransform(ds, 0, 0, ds, ox, oy);
    ctx.fillStyle = "#05040a";
    ctx.fillRect(0, 0, W, H);
    if (!LAY.far) return;
    const snap = (v) => Math.round(v * RS) / RS;
    const sx = shake ? (Math.random() - 0.5) * shake : 0,
      sy = shake ? (Math.random() - 0.5) * shake * 0.7 : 0;
    const demonArena = B.type === "demon",
      shogunArena = B.type === "shogun",
      volturusArena = B.type === "volturus",
      wraithArena = B.type === "wraith",
      wardenArena = B.type === "warden",
      spireArena = B.type === "spire",
      specialArena =
        demonArena || shogunArena || volturusArena || wraithArena || wardenArena || spireArena;
    ctx.drawImage(
      demonArena
        ? LAY.dfar
        : shogunArena
          ? LAY.sfar
          : volturusArena
            ? LAY.vfar
            : wraithArena
              ? LAY.wfar
              : spireArena
                ? LAY.spfar
              : wardenArena
                ? LAY.efar
                : LAY.far,
      snap(-cam * 0.12 + sx * 0.2),
      snap(sy * 0.2),
      W + (WORLD - W) * 0.12,
      H,
    );
    ctx.drawImage(
      demonArena
        ? LAY.dmid
        : shogunArena
          ? LAY.smid
          : volturusArena
            ? LAY.vmid
            : wraithArena
              ? LAY.wmid
              : spireArena
                ? LAY.spmid
              : wardenArena
                ? LAY.emid
                : LAY.mid,
      snap(-cam * 0.35 + sx * 0.5),
      snap(sy * 0.5),
      W + (WORLD - W) * 0.35,
      H,
    );
    ctx.drawImage(
      demonArena
        ? LAY.dnear
        : shogunArena
          ? LAY.snear
          : volturusArena
            ? LAY.vnear
            : wraithArena
              ? LAY.wnear
              : spireArena
                ? LAY.spnear
              : wardenArena
                ? LAY.enear
                : LAY.near,
      snap(-cam * 0.8 + sx * 0.8),
      snap(sy * 0.8),
      W + (WORLD - W) * 0.8,
      H,
    );
    ctx.save();
    ctx.translate(snap(-cam + sx), snap(sy));
    ctx.drawImage(
      demonArena
        ? LAY.dground
        : shogunArena
          ? LAY.sground
          : volturusArena
            ? LAY.vground
            : wraithArena
              ? LAY.wground
              : spireArena
                ? LAY.spground
              : wardenArena
                ? LAY.eground
                : LAY.ground,
      0,
      430,
      WORLD,
      H - 430,
    );
    // fog behind
    const fo = Math.round((time * 9) % 1400);
    if (profile.graphics !== "low") {
      ctx.globalAlpha = profile.graphics === "medium" ? 0.55 : 0.9;
      ctx.drawImage(LAY.fog, Math.round(cam) - fo, 330, 1400, 220);
      ctx.drawImage(LAY.fog, Math.round(cam) - fo + 1400, 330, 1400, 220);
      ctx.globalAlpha = 1;
    }
    if (!specialArena) {
      drawBlades(430, GROUND + 6);
      drawFlowers(0, GROUND);
    }
    drawExplosion();
    drawDemonSmashWarning();
    // boss then hero
    const isPvp = gameMode === "pvp",
      isArt = B.type === "art",
      isDemon = B.type === "demon",
      isShogun = B.type === "shogun",
      isVolturus = B.type === "volturus",
      isWraith = B.type === "wraith",
      isWarden = B.type === "warden",
      isSpire = B.type === "spire",
      isRanger = heroType === "shadow",
      isRonin = heroType === "ronin",
      isRegal = heroType === "regal",
      isWizard = heroType === "wizard",
      isKillnux = heroType === "killnux",
      isWraithKnight = heroType === "wraithknight",
      isThor = heroType === "thor",
      bo = isPvp
        ? { alpha: 0 }
        : isDemon
        ? demonObj()
        : isArt
          ? artObj()
          : isShogun
            ? shogunObj()
            : isVolturus
              ? { alpha: 1 }
              : isWraith
                ? { alpha: B.state === "dead" ? clamp(1 - B.dieT / 2.2, 0, 1) : 1 }
                : isWarden
                  ? { alpha: B.state === "dead" ? clamp(1 - B.dieT / 2.2, 0, 1) : 1 }
            : bossObj(),
      ho = isRanger ? rangerObj() : isRonin ? roninObj() : heroObj();
    if (!isPvp)
      drawShadow(
        B.x,
        0,
        isDemon ? 82 : isVolturus ? 66 : isWraith ? 72 : isWarden ? 62 : isArt || isShogun ? 54 : 46,
        clamp(B.h / 220, 0, 1),
      );
    drawShadow(P.x, 0, 22, clamp((GROUND - P.y) / 170, 0, 1));
    if (isPvp) {
      /* no boss in local versus */
    } else if (B.state === "dead" && bo.alpha <= 0) {
      /* gone */
    } else if (isDemon) drawDemon(ctx, bo);
    else if (isArt) drawArtorias(ctx, bo);
    else if (isShogun) drawShogun(ctx, bo);
    else if (isVolturus) drawVolturus(ctx);
    else if (isWraith) drawWraith(ctx);
    else if (isWarden) drawWarden(ctx);
    else if (isSpire) drawSpire(ctx);
    else drawKnight(ctx, bo);
    if (isShogun && shogunMinion) drawShogunMinion(ctx, shogunMinion);
    drawDemonTransformBeam();
    drawWraithTransformBeam();
    drawThorTransformBeam();
    if (isWraithKnight) drawWraithKnight(ctx);
    else if (isThor) drawThor(ctx);
    else if (isRanger) drawRanger(ctx, ho);
    else if (isRonin) drawRonin(ctx, ho);
    else if (isRegal) drawRegal(ctx, regalObj());
    else if (isWizard) drawWizard(ctx);
    else if (isKillnux) drawKillnux(ctx, killnuxObj());
    else drawKnight(ctx, ho);
    if (gameMode !== "solo" && players[1]) {
      withPlayer(1, () => {
        drawShadow(P.x, 0, 22, clamp((GROUND - P.y) / 170, 0, 1));
        if (heroType === "wraithknight") drawWraithKnight(ctx);
        else if (heroType === "thor") drawThor(ctx);
        else if (heroType === "shadow") drawRanger(ctx, rangerObj());
        else if (heroType === "ronin") drawRonin(ctx, roninObj());
        else if (heroType === "regal") drawRegal(ctx, regalObj());
        else if (heroType === "wizard") drawWizard(ctx);
        else if (heroType === "killnux") drawKillnux(ctx, killnuxObj());
        else drawKnight(ctx, heroObj());
      });
    }
    drawCoopRevive();
    drawExecMark();
    if (B.state === "stunned") {
      for (let i = 0; i < 3; i++) {
        const a = time * 5 + i * 2.1;
        ctx.fillStyle = "#ffe28a";
        ctx.beginPath();
        ctx.arc(
          B.x + Math.cos(a) * 30,
          GROUND - (B.type === "art" ? 195 : 175) + Math.sin(a) * 7,
          3.5,
          0,
          TAU,
        );
        ctx.fill();
      }
    }
    drawBeam();
    drawDemonHazards();
    drawShogunHazards();
    drawVolturusHazards();
    drawWraithHazards();
    drawWardenHazards();
    drawSpireHazards();
    drawWraithKnightBolts();
    drawThorSystems();
    drawOrbs();
    drawSlashes();
    drawKillWaves();
    drawArrows();
    drawRain();
    drawRegalProjectiles();
    drawWizardSystems();
    drawParts();
    drawFx();
    if (!specialArena) {
      drawBlades(GROUND + 6, 600);
      drawFlowers(GROUND, 600);
    }
    // motes
    const moteStep =
      profile.graphics === "low" ? 4 : profile.graphics === "medium" ? 2 : 1;
    for (let mi = 0; mi < motes.length; mi += moteStep) {
      const m = motes[mi];
      if (m.x < cam - 10 || m.x > cam + W + 10) continue;
      const a = 0.25 + 0.3 * Math.sin(time * 2 + m.ph);
      ctx.fillStyle = "rgba(240,235,255," + a + ")";
      if (m.petal) {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(time + m.ph);
        ctx.beginPath();
        ctx.ellipse(0, 0, m.s * 1.6, m.s * 0.8, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.s * 0.6, 0, TAU);
        ctx.fill();
      }
    }
    if (profile.graphics === "high") {
      const f2 = Math.round(fo * 1.4) % 1400;
      ctx.globalAlpha = 0.55;
      ctx.drawImage(LAY.fog, Math.round(cam) - f2, 400, 1400, 220);
      ctx.drawImage(LAY.fog, Math.round(cam) - f2 + 1400, 400, 1400, 220);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (profile.graphics !== "low") ctx.drawImage(LAY.vig, 0, 0, W, H);
    if (profile.graphics !== "low" && screenFlash > 0) {
      ctx.fillStyle =
        "rgba(" + screenFlashCol + "," + Math.min(0.7, screenFlash) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    if (P && P.hp < 120 && P.state !== "dead") {
      const a = 0.12 + 0.08 * Math.sin(time * 6);
      const g = ctx.createRadialGradient(
        W / 2,
        H / 2,
        H * 0.35,
        W / 2,
        H / 2,
        H * 0.8,
      );
      g.addColorStop(0, "rgba(120,0,10,0)");
      g.addColorStop(1, "rgba(160,0,20," + a * 2.5 + ")");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    if (phase !== "title") drawHUD();
    if (phase === "intro") drawIntro();
    if (phase === "won" || phase === "wonUI") {
      const k = clamp(phaseT / 1.5, 0, 1);
      ctx.fillStyle = "rgba(0,0,0," + 0.35 * k + ")";
      ctx.fillRect(0, 0, W, H);
      if (phase === "won" && phaseT > 1) {
        ctx.save();
        ctx.globalAlpha = clamp((phaseT - 1) / 1, 0, 1);
        ctx.textAlign = "center";
        ctx.font = "900 44px Cinzel, Georgia, serif";
        ctx.fillStyle = "#f2dc9c";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 12;
        ctx.fillText("BOSS DEFEATED", W / 2, 270);
        ctx.restore();
      }
    }
    if (phase === "lost" || phase === "lostUI") {
      const k = clamp(phaseT / 1.6, 0, 1);
      ctx.fillStyle = "rgba(30,0,4," + 0.55 * k + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ================= HUD ================= */
  function cropSmooth(img, fx, fy, fw, fh, x, y, s) {
    if (img.complete && img.naturalWidth) {
      const w = img.naturalWidth,
        h = img.naturalHeight;
      ctx.drawImage(img, fx * w, fy * h, fw * w, fh * h, x, y, s, s);
    } else {
      ctx.fillStyle = "#221a2a";
      ctx.fillRect(x, y, s, s);
    }
  }
  function cropPortrait(img, sx, sy, sw, sh, x, y, s) {
    if (img.complete && img.naturalWidth) {
      const r = img.naturalWidth / 736;
      ctx.drawImage(img, sx * r, sy * r, sw * r, sh * r, x, y, s, s);
    } else {
      ctx.fillStyle = "#221a2a";
      ctx.fillRect(x, y, s, s);
    }
  }
  function drawBar(x, y, w, h, frac, ghost, c1, c2) {
    ctx.fillStyle = "#07050a";
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    if (ghost > frac) {
      ctx.fillStyle = "#d9cfae";
      ctx.fillRect(x, y, w * ghost, h);
    }
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w * frac, h);
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.fillRect(x, y, w * frac, h * 0.38);
    ctx.strokeStyle = "#b9975a";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x - 2.5, y - 2.5, w + 5, h + 5);
    ctx.fillStyle = "#d8b56a";
    [
      [x - 3, y - 3],
      [x + w + 3, y - 3],
      [x - 3, y + h + 3],
      [x + w + 3, y + h + 3],
    ].forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c[0], c[1] - 3.4);
      ctx.lineTo(c[0] + 3.4, c[1]);
      ctx.lineTo(c[0], c[1] + 3.4);
      ctx.lineTo(c[0] - 3.4, c[1]);
      ctx.fill();
    });
  }
  function drawFlask(x, y, full) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "#b9975a";
    ctx.lineWidth = 1.6;
    ctx.fillStyle = full ? "#7fe36c" : "rgba(20,16,24,.85)";
    ctx.beginPath();
    ctx.ellipse(0, 5, 8, 9, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = full ? "#e5dcc2" : "#3a3244";
    ctx.fillRect(-3, -8, 6, 7);
    ctx.strokeRect(-3, -8, 6, 7);
    ctx.fillStyle = full ? "#8a5a2c" : "#2a2430";
    ctx.fillRect(-3.6, -12, 7.2, 4.6);
    if (full) {
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.beginPath();
      ctx.ellipse(-3, 3, 1.6, 3.4, 0.3, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawSkillIcon(x, y, r, cd, maxCd, key, kind) {
    const ready = cd <= 0,
      frac = clamp(cd / maxCd, 0, 1);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#0c0910";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    if (kind === "slash") {
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r);
      g.addColorStop(0, "rgba(255,244,190,.95)");
      g.addColorStop(1, "rgba(230,170,60,.15)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.68, r * 0.3, -0.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,240,190,.9)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.68, r * 0.3, -0.5, 0, TAU);
      ctx.stroke();
    } else if (kind === "pierce") {
      ctx.strokeStyle = "rgba(140,240,235,.95)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#7ff0e6";
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, 0);
      ctx.lineTo(r * 0.45, 0);
      ctx.stroke();
      ctx.fillStyle = "rgba(200,250,247,.95)";
      ctx.beginPath();
      ctx.moveTo(r * 0.45, -4);
      ctx.lineTo(r * 0.78, 0);
      ctx.lineTo(r * 0.45, 4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (kind === "rain") {
      ctx.strokeStyle = "rgba(140,240,235,.9)";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "#7ff0e6";
      ctx.shadowBlur = 4;
      for (const dx of [-5, 0, 5]) {
        ctx.beginPath();
        ctx.moveTo(dx, -r * 0.55);
        ctx.lineTo(dx - 2, r * 0.5);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    } else if (kind === "scarlet") {
      ctx.strokeStyle = "#ff3557";
      ctx.shadowColor = "#ff244c";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-r * 0.72, r * 0.38);
      ctx.lineTo(r * 0.72, -r * 0.38);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (kind === "starfall") {
      ctx.fillStyle = "#6d319e";
      ctx.shadowColor = "#a566e8";
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(0, -3, r * 0.42, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#ddb9ff";
      ctx.lineWidth = 1.5;
      for (const dx of [-6, -2, 2, 6]) {
        ctx.beginPath();
        ctx.moveTo(dx, -1);
        ctx.lineTo(dx - 2, r * 0.65);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    } else if (kind === "abyss") {
      ctx.fillStyle = "#1a0628";
      ctx.shadowColor = "#8b42c2";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.72, r * 0.3, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#e0b9ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.65, 0);
      ctx.lineTo(r * 0.7, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (kind === "blood") {
      const g = ctx.createRadialGradient(0, 3, 1, 0, 1, r);
      g.addColorStop(0, "#ffd0a8");
      g.addColorStop(0.38, "#ff405e");
      g.addColorStop(1, "rgba(110,0,20,.25)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.8);
      ctx.quadraticCurveTo(r * 0.8, -1, r * 0.35, r * 0.72);
      ctx.quadraticCurveTo(0, r * 0.35, -r * 0.35, r * 0.72);
      ctx.quadraticCurveTo(-r * 0.8, -1, 0, -r * 0.8);
      ctx.fill();
    } else if (kind === "summon") {
      ctx.strokeStyle = "#a8e8ff";
      ctx.fillStyle = "#dff8ff";
      ctx.shadowColor = "#4cbcff";
      ctx.shadowBlur = 7;
      ctx.lineWidth = 1.5;
      for (const dx of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.arc(dx, -2, 3.5, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(dx, 2);
        ctx.lineTo(dx, 9);
        ctx.moveTo(dx - 4, 5);
        ctx.lineTo(dx + 4, 5);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    } else if (kind === "comet") {
      ctx.strokeStyle = "#d9fbff";
      ctx.shadowColor = "#5ad6ff";
      ctx.shadowBlur = 9;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.72, r * 0.25);
      ctx.lineTo(r * 0.74, -r * 0.25);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-r * 0.1, 0, r * 0.65, 0, TAU);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (kind === "thunder") {
      ctx.fillStyle = "#bfe6ff";
      ctx.shadowColor = "#5ab4ff";
      ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.moveTo(r * 0.18, -r * 0.8);
      ctx.lineTo(-r * 0.45, r * 0.1);
      ctx.lineTo(-r * 0.02, r * 0.1);
      ctx.lineTo(-r * 0.2, r * 0.8);
      ctx.lineTo(r * 0.45, -r * 0.12);
      ctx.lineTo(r * 0.02, -r * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (kind === "hammer") {
      ctx.fillStyle = "#241a12";
      ctx.fillRect(-1.6, -2, 3.2, r * 0.85);
      const g = ctx.createLinearGradient(-r * 0.55, -r * 0.75, r * 0.55, 0);
      g.addColorStop(0, "#f2fbff");
      g.addColorStop(0.5, "#7ec8ff");
      g.addColorStop(1, "#274a6d");
      ctx.fillStyle = g;
      ctx.shadowColor = "#5ab4ff";
      ctx.shadowBlur = 8;
      ctx.fillRect(-r * 0.55, -r * 0.8, r * 1.1, r * 0.62);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(220,242,255,.9)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-r * 0.55, -r * 0.8, r * 1.1, r * 0.62);
    } else {
      const g = ctx.createRadialGradient(0, 1, 1, 0, 1, r);
      g.addColorStop(0, "rgba(255,224,150,1)");
      g.addColorStop(0.5, "rgba(255,110,40,.9)");
      g.addColorStop(1, "rgba(160,30,10,.2)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 1, r * 0.62, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = ready ? "#f2d48f" : "#5a4a30";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
    if (!ready) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + frac * TAU);
      ctx.closePath();
      ctx.fillStyle = "rgba(4,3,6,.74)";
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#f2e6c8";
      ctx.font = "700 11px Cinzel, Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.ceil(cd), 0, 1);
      ctx.textBaseline = "alphabetic";
    }
    ctx.fillStyle = "rgba(240,230,200,.85)";
    ctx.font = "700 10px Cinzel, Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(key, 0, r + 12);
    ctx.restore();
  }
  function drawHUD() {
    ctx.save();
    const px = 16,
      py = 14,
      pr = 36;
    ctx.fillStyle = "#07050a";
    ctx.beginPath();
    ctx.arc(px + pr, py + pr, pr + 4, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(px + pr, py + pr, pr, 0, TAU);
    ctx.clip();
    if (heroType === "shadow")
      cropSmooth(imgShadowHero, 0.2, 0.02, 0.6, 0.66, px, py, pr * 2);
    else if (heroType === "ronin")
      cropSmooth(imgRoninHero, 0.14, 0.26, 0.72, 0.42, px, py, pr * 2);
    else if (heroType === "regal")
      cropSmooth(imgRegalHero, 0.22, 0.04, 0.56, 0.42, px, py, pr * 2);
    else if (heroType === "wizard")
      cropSmooth(imgWizardHero, 0.22, 0.0, 0.56, 0.48, px, py, pr * 2);
    else if (heroType === "killnux")
      cropSmooth(imgKillnuxHero, 0.12, 0.02, 0.76, 0.72, px, py, pr * 2);
    else if (heroType === "wraithknight")
      cropSmooth(imgWraithKnightHero, 0.08, 0.02, 0.84, 0.58, px, py, pr * 2);
    else if (heroType === "thor")
      cropSmooth(imgThorHero, 0.08, 0.02, 0.84, 0.6, px, py, pr * 2);
    else cropPortrait(imgHero, 226, 0, 268, 268, px, py, pr * 2);
    ctx.restore();
    if (P.flash > 0) {
      ctx.fillStyle = "rgba(200,20,30,.45)";
      ctx.beginPath();
      ctx.arc(px + pr, py + pr, pr, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = "#c9a45a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px + pr, py + pr, pr + 2, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#4b3714";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px + pr, py + pr, pr + 5, 0, TAU);
    ctx.stroke();
    const bx = 106;
    drawBar(
      bx,
      24,
      270,
      17,
      P.hp / P.maxhp,
      P.ghost / P.maxhp,
      "#e0403c",
      "#8a1414",
    );
    ctx.font = "700 12px Cinzel, Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#f2e6c8";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 4;
    ctx.fillText(Math.ceil(P.hp) + " / " + P.maxhp, bx + 6, 37);
    ctx.shadowBlur = 0;
    drawBar(
      bx,
      50,
      200,
      9,
      P.st / P.maxst,
      0,
      P.st < 15 ? "#e0a040" : "#5fd6a0",
      P.st < 15 ? "#8a5a14" : "#1f8a68",
    );
    for (let i = 0; i < P.maxFlasks; i++)
      drawFlask(bx + 8 + i * 15, 80, i < P.flasks);
    if (heroType === "shadow") {
      drawSkillIcon(
        bx + 168,
        82,
        15,
        P.skill1CD,
        skill1MaxCD(),
        primaryKey("skill1"),
        "pierce",
      );
      drawSkillIcon(
        bx + 210,
        82,
        15,
        P.skill2CD,
        skill2MaxCD(),
        primaryKey("skill2"),
        "rain",
      );
    } else if (heroType === "ronin") {
      drawSkillIcon(
        bx + 168,
        82,
        15,
        P.skill1CD,
        skill1MaxCD(),
        primaryKey("skill1"),
        "scarlet",
      );
      drawSkillIcon(
        bx + 210,
        82,
        15,
        P.skill2CD,
        skill2MaxCD(),
        primaryKey("skill2"),
        "blood",
      );
      ctx.font = "700 10px Cinzel, Georgia, serif";
      ctx.fillStyle = "#ff7b90";
      ctx.textAlign = "left";
      ctx.fillText("DEFLECT " + P.deflects + "/15", bx + 244, 77);
      if (P.flameT > 0) {
        ctx.fillStyle = "#ff405e";
        ctx.fillText("BLOODFLAME " + P.flameT.toFixed(1) + "s", bx + 244, 92);
      }
    } else if (heroType === "regal") {
      drawSkillIcon(
        bx + 168,
        82,
        15,
        P.skill1CD,
        skill1MaxCD(),
        primaryKey("skill1"),
        "starfall",
      );
      drawSkillIcon(
        bx + 210,
        82,
        15,
        P.skill2CD,
        skill2MaxCD(),
        primaryKey("skill2"),
        "abyss",
      );
    } else if (heroType === "wizard") {
      drawSkillIcon(
        bx + 168,
        82,
        15,
        P.skill1CD,
        skill1MaxCD(),
        primaryKey("skill1"),
        "summon",
      );
      drawSkillIcon(
        bx + 210,
        82,
        15,
        P.skill2CD,
        skill2MaxCD(),
        primaryKey("skill2"),
        "comet",
      );
      ctx.font = "700 10px Cinzel, Georgia, serif";
      ctx.fillStyle = "#86d8ff";
      ctx.textAlign = "left";
      ctx.fillText(
        "GRAVEGUARD " + skeletons.filter((s) => s.hp > 0).length + "/3",
        bx + 244,
        84,
      );
    } else if (heroType === "wraithknight") {
      drawSkillIcon(bx + 168,82,15,P.skill1CD,skill1MaxCD(),primaryKey("skill1"),"storm");
      drawSkillIcon(bx + 210,82,15,P.skill2CD,skill2MaxCD(),primaryKey("skill2"),"wraith");
      ctx.font = "700 9px Cinzel, Georgia, serif";
      ctx.fillStyle = P.wraithBuffT > 0 ? "#d3a9ff" : "#9f83bd";
      ctx.textAlign = "left";
      ctx.fillText(P.wraithBuffT > 0 ? "ASCENDED " + P.wraithBuffT.toFixed(1) + "s" : "BLADE 150", bx + 244, 84);
    } else if (heroType === "thor") {
      drawSkillIcon(bx + 168,82,15,P.skill1CD,skill1MaxCD(),primaryKey("skill1"),"thunder");
      drawSkillIcon(bx + 210,82,15,P.skill2CD,skill2MaxCD(),primaryKey("skill2"),"hammer");
      ctx.font = "700 9px Cinzel, Georgia, serif";
      ctx.fillStyle = P.thorBuffT > 0 ? "#9fd8ff" : "#7fa8c9";
      ctx.textAlign = "left";
      ctx.fillText(P.thorBuffT > 0 ? "STORM FORM " + P.thorBuffT.toFixed(1) + "s" : "BOLT 190", bx + 244, 84);
    } else if (heroType === "killnux") {
      drawSkillIcon(bx + 168,82,15,P.skill1CD,skill1MaxCD(),primaryKey("skill1"),"quake");
      drawSkillIcon(bx + 210,82,15,P.skill2CD,skill2MaxCD(),primaryKey("skill2"),"armor");
      ctx.font = "700 9px Cinzel, Georgia, serif";
      ctx.fillStyle = P.killArmorT > 0 ? "#b998cc" : "#d9e0e7";
      ctx.textAlign = "left";
      ctx.fillText(P.killArmorT > 0 ? "BLACK ARMOUR " + P.killArmorT.toFixed(1) + "s" : "SWORD 200", bx + 244, 84);
    } else {
      drawSkillIcon(
        bx + 168,
        82,
        15,
        P.skill1CD,
        skill1MaxCD(),
        primaryKey("skill1"),
        "slash",
      );
      drawSkillIcon(
        bx + 210,
        82,
        15,
        P.skill2CD,
        skill2MaxCD(),
        primaryKey("skill2"),
        "bomb",
      );
    }
    if (gameMode !== "solo" && players[1]) {
      const p2 = players[1],
        x2 = W - 292;
      ctx.textAlign = "left";
      ctx.font = "800 12px Cinzel, Georgia, serif";
      ctx.fillStyle = "#8fc5ff";
      ctx.fillText(
        "P2 · " +
          (playerHeroes[1] === "killnux"
            ? "KILLNUX"
            : playerHeroes[1].toUpperCase()),
        x2,
        18,
      );
      drawBar(x2, 25, 270, 16, p2.hp / p2.maxhp, p2.ghost / p2.maxhp, "#4e9fe8", "#174e86");
      ctx.fillStyle = "#eef7ff";
      ctx.font = "700 11px Cinzel, Georgia, serif";
      ctx.fillText(Math.ceil(p2.hp) + " / " + p2.maxhp, x2 + 6, 37);
      drawBar(
        x2,
        49,
        200,
        8,
        p2.st / p2.maxst,
        0,
        p2.st < 15 ? "#e0a040" : "#6dd7d0",
        p2.st < 15 ? "#8a5a14" : "#246f7a",
      );
      for (let i = 0; i < p2.maxFlasks; i++)
        drawFlask(x2 + 8 + i * 15, 76, i < p2.flasks);
      withPlayer(1, () => {
        const kinds =
          heroType === "wraithknight"
            ? ["storm", "wraith"]
            : heroType === "thor"
            ? ["thunder", "hammer"]
            : heroType === "shadow"
            ? ["pierce", "rain"]
            : heroType === "ronin"
              ? ["scarlet", "blood"]
              : heroType === "regal"
                ? ["starfall", "abyss"]
                : heroType === "wizard"
                  ? ["summon", "comet"]
                  : heroType === "killnux"
                    ? ["quake", "armor"]
                    : ["slash", "bomb"];
        drawSkillIcon(
          x2 + 218,
          77,
          13,
          P.skill1CD,
          skill1MaxCD(),
          primaryKey2("skill1"),
          kinds[0],
        );
        drawSkillIcon(
          x2 + 258,
          77,
          13,
          P.skill2CD,
          skill2MaxCD(),
          primaryKey2("skill2"),
          kinds[1],
        );
      });
      ctx.font = "600 8px Cinzel, Georgia, serif";
      ctx.fillStyle = "#9fb4ca";
      ctx.fillText(
        primaryKey2("left") +
          "/" +
          primaryKey2("right") +
          " MOVE · " +
          primaryKey2("attack") +
          " ATTACK · " +
          primaryKey2("dodge") +
          " DODGE · " +
          primaryKey2("heal") +
          " FLASK",
        x2,
        116,
      );
    }
    // boss bar
    if (gameMode !== "pvp" && phase !== "title" && (B.state !== "dead" || B.dieT < 2)) {
      const fill = phase === "intro" ? B.introFill : 1,
        bw = 640,
        bxx = (W - bw) / 2,
        byy = 498;
      ctx.textAlign = "center";
      ctx.font = "700 17px Cinzel, Georgia, serif";
      ctx.fillStyle = "#efdcae";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 6;
      ctx.fillText(
        B.type === "demon"
          ? "SHATTERED DEMON"
          : B.type === "shogun"
            ? "THE INFERNAL SHOGUN"
            : B.type === "volturus"
              ? B.revived
                ? "VOLTURUS, ZEUS-BORN"
                : "VOLTURUS, THE STORMLORD"
            : B.type === "wraith"
              ? "OBSIDIAN TENDRIL WRAITH"
            : B.type === "spire"
              ? "THE BLACK SPIRE KNIGHT"
            : B.type === "warden"
              ? "EMBERCROWN IRIDESCENT WARDEN"
            : B.type === "art"
              ? "ARTORIAS THE ABYSSWALKER"
              : "THE VIOLET SENTINEL",
        W / 2,
        byy - 10,
      );
      ctx.shadowBlur = 0;
      const sw = 30;
      ctx.save();
      ctx.beginPath();
      ctx.arc(bxx - 30, byy + 6, sw / 2, 0, TAU);
      ctx.clip();
      if (B.type === "demon") {
        if (imgDemonFace.complete && imgDemonFace.naturalWidth) {
          const sm = ctx.imageSmoothingEnabled;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(imgDemonFace, bxx - 45, byy - 9, sw, sw);
          ctx.imageSmoothingEnabled = sm;
        } else {
          ctx.fillStyle = "#5b1514";
          ctx.fillRect(bxx - 45, byy - 9, sw, sw);
        }
      } else if (B.type === "shogun")
        cropFrac(
          B.sphase === 2 ? imgShogunP2 : imgShogun,
          0.18,
          0.05,
          0.64,
          0.42,
          bxx - 45,
          byy - 9,
          sw,
        );
      else if (B.type === "volturus") {
        const vi = B.vphase === 1 ? imgVolturus1 : B.vphase === 2 ? imgVolturus2 : imgVolturus3,
          vc = B.vphase === 1 ? [131, 12, 206, 260] : B.vphase === 2 ? [60, 4, 398, 267] : [53, 7, 385, 268];
        ctx.drawImage(vi, vc[0], vc[1], vc[2], vc[3], bxx - 45, byy - 9, sw, sw);
      }
      else if (B.type === "wraith")
        ctx.drawImage(imgWraith, 0, 0, imgWraith.naturalWidth || 200, imgWraith.naturalHeight || 200, bxx - 45, byy - 9, sw, sw);
      else if (B.type === "spire")
        ctx.drawImage(imgSpire, 0, 0, imgSpire.naturalWidth || 200, imgSpire.naturalHeight || 200, bxx - 45, byy - 9, sw, sw);
      else if (B.type === "warden")
        ctx.drawImage(imgWarden, 0, 0, imgWarden.naturalWidth || 200, imgWarden.naturalHeight || 200, bxx - 45, byy - 9, sw, sw);
      else if (B.type === "art")
        cropFrac(imgArt, 0.367, 0.164, 0.309, 0.309, bxx - 45, byy - 9, sw);
      else cropPortrait(imgBoss, 232, 92, 250, 250, bxx - 45, byy - 9, sw);
      ctx.restore();
      ctx.strokeStyle = "#c9a45a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bxx - 30, byy + 6, sw / 2 + 1, 0, TAU);
      ctx.stroke();
      drawBar(
        bxx,
        byy,
        bw,
        13,
        (B.hp / B.maxhp) * fill,
        (B.ghost / B.maxhp) * fill,
        B.type === "demon"
          ? B.dphase === 3
            ? "#ff3a1f"
            : B.dphase === 2
              ? "#d93126"
              : "#b52822"
          : B.type === "shogun"
            ? B.sphase === 2
              ? "#6f2c91"
              : "#e04a24"
            : B.type === "volturus"
              ? B.revived
                ? "#ecfbff"
                : B.vphase === 3
                  ? "#44d7ff"
                  : B.vphase === 2
                    ? "#398cff"
                    : "#d1aa58"
            : B.type === "wraith"
              ? B.wphase === 2
                ? "#4b355f"
                : "#202a45"
            : B.type === "spire"
              ? "#8f1830"
            : B.type === "spire"
              ? "#26050d"
            : B.type === "warden"
              ? B.ephase === 2
                ? "#9a4b9f"
                : "#4769a8"
            : B.rage
              ? B.type === "art"
                ? "#5a9bff"
                : "#b04cff"
              : "#c93a3a",
        B.type === "demon"
          ? "#5a0907"
          : B.type === "shogun"
            ? B.sphase === 2
              ? "#24102f"
              : "#68180d"
            : B.type === "volturus"
              ? B.revived
                ? "#46758a"
                : "#102d66"
            : B.type === "wraith"
              ? B.wphase === 2
                ? "#160d20"
                : "#080c18"
            : B.type === "warden"
              ? B.ephase === 2
                ? "#321436"
                : "#142044"
            : B.rage
              ? B.type === "art"
                ? "#1f3f9a"
                : "#4a1a90"
              : "#7a1212",
      );
      if (B.type === "volturus") {
        ctx.font = "600 10px Cinzel, Georgia, serif";
        ctx.fillStyle = B.revived ? "#ffffff" : "#a9eaff";
        ctx.fillText(
          B.state === "vrevive"
            ? "RESURRECTING  —  THE HEAVENS ANSWER"
            : B.revived
              ? "ASCENDED LIFE  —  10000 HP  —  MAXIMUM AGGRESSION"
              : "PHASE " + B.vphase + "  —  " + (B.vphase === 1 ? "ARMORED SENTINEL" : B.vphase === 2 ? "LIGHTNING UNLEASHED" : "STORMLORD"),
          W / 2,
          byy + 30,
        );
      } else if (B.type === "wraith") {
        ctx.font = "600 10px Cinzel, Georgia, serif";
        ctx.fillStyle = B.wphase === 2 ? "#d4b9e8" : "#b9c9e8";
        ctx.fillText(
          B.state === "wtransform"
            ? "DARK SYMBIOTE AWAKENING"
            : B.wphase === 2
              ? "PHASE TWO  —  +40% DAMAGE"
              : "PHASE ONE  —  LIVING SYMBIOTE",
          W / 2,
          byy + 30,
        );
      } else if (B.type === "warden") {
        ctx.font = "600 10px Cinzel, Georgia, serif";
        ctx.fillStyle = B.ephase === 2 ? "#f2c8ff" : "#c9e5ff";
        ctx.fillText(
          B.state === "etransform"
            ? "NIGHTLORD AWAKENING — SKY RUPTURE"
            : B.ephase === 2
              ? "PHASE TWO — EXPLODING FISSURES / " + B.eAffinity.toUpperCase() + " AFFINITY"
              : "PHASE ONE — CINDER AND MOONLIGHT",
          W / 2,
          byy + 30,
        );
      } else if (B.type === "demon") {
        ctx.font = "600 10px Cinzel, Georgia, serif";
        ctx.fillStyle = "#ffb09c";
        ctx.fillText(
          "PHASE " +
            B.dphase +
            (B.dphase === 3 ? "  —  +30% DAMAGE / 10% RANGED PARRY" : ""),
          W / 2,
          byy + 30,
        );
      } else if (B.type === "shogun") {
        ctx.font = "600 10px Cinzel, Georgia, serif";
        ctx.fillStyle = B.sphase === 2 ? "#d6a6ec" : "#ffb27b";
        ctx.fillText(
          B.sphase === 2
            ? "PHASE TWO  —  BLACK FLAME / +20% DAMAGE / 10% DEFLECT"
            : "PHASE ONE  —  10% ATTACK DEFLECT",
          W / 2,
          byy + 30,
        );
      } else if (B.rage) {
        ctx.font = "600 10px Cinzel, Georgia, serif";
        ctx.fillStyle = B.type === "art" ? "#bcd8ff" : "#d9b3ff";
        ctx.fillText(
          B.type === "art" ? "PHASE TWO  -  +40% DAMAGE" : "ENRAGED",
          W / 2,
          byy + 30,
        );
      }
    }
    ctx.restore();
    if (gameMode === "solo" && phase === "fight" && phaseT < 12) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - (phaseT - 8) / 4, 0, 0.8);
      ctx.font = "600 12px Cinzel, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "#f0e2c0";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 4;
      (heroType === "killnux"
        ? [
            primaryKey("left") + " / " + primaryKey("right") + " move   " + primaryKey("jump") + " jump   " + primaryKey("attack") + " greatsword (200)",
            primaryKey("dodge") + " super dodge (50% farther, 20 stamina)",
            primaryKey("skill1") + " Abyss Quake (400)   " + primaryKey("skill2") + " Black Armour (+50% ATK / +20% DEF)",
            primaryKey("heal") + " flask   Hold " + primaryKey("block") + " to block",
          ]
        : heroType === "shadow"
        ? [
            primaryKey("left") +
              " / " +
              primaryKey("right") +
              " move   " +
              primaryKey("jump") +
              " jump   " +
              primaryKey("attack") +
              " shoot",
            primaryKey("dodge") +
              " dodge (also in the air)   " +
              primaryKey("parry") +
              " Umbral Dash",
            "Hold " +
              primaryKey("block") +
              " to block (-25% damage)   " +
              primaryKey("heal") +
              " flask   Esc pause",
            primaryKey("skill1") +
              " Piercing Dive   " +
              primaryKey("skill2") +
              " Arrow Rain",
          ]
        : heroType === "ronin"
          ? [
              primaryKey("left") +
                " / " +
                primaryKey("right") +
                " move   " +
                primaryKey("attack") +
                " twin katana (100)",
              primaryKey("dodge") +
                " teleport dodge (20 stamina)   " +
                primaryKey("parry") +
                " deflect",
              primaryKey("heal") +
                " flask   15 deflects = 600 damage + stagger",
              primaryKey("skill1") +
                " Scarlet Lunge   " +
                primaryKey("skill2") +
                " Bloodflame",
            ]
          : heroType === "regal"
            ? [
                primaryKey("left") +
                  " / " +
                  primaryKey("right") +
                  " move   " +
                  primaryKey("attack") +
                  " sword (90, 20 stamina)",
                primaryKey("parry") +
                  " pistol (70, 20 stamina)   " +
                  primaryKey("dodge") +
                  " dodge",
                primaryKey("heal") +
                  " flask   Hold " +
                  primaryKey("block") +
                  " to block",
                primaryKey("skill1") +
                  " Black Starfall   " +
                  primaryKey("skill2") +
                  " Abyss Cannon",
              ]
            : heroType === "wizard"
              ? [
                  primaryKey("left") +
                    " / " +
                    primaryKey("right") +
                    " move   " +
                    primaryKey("attack") +
                    " Arcane Missile (100)",
                  primaryKey("parry") +
                    " magic sword (70)   " +
                    primaryKey("dodge") +
                    " blue teleport (20 stamina)",
                  primaryKey("heal") +
                    " flask   Hold " +
                    primaryKey("block") +
                    " for arcane guard",
                  primaryKey("skill1") +
                    " Graveguard Trio   " +
                    primaryKey("skill2") +
                    " Astral Comet",
                ]
              : heroType === "wraithknight"
                ? [
                    primaryKey("left") + " / " + primaryKey("right") + " move   " + primaryKey("jump") + " jump / double jump   " + primaryKey("attack") + " wraith blade (150)",
                    primaryKey("dodge") + (P.wraithBuffT > 0 ? " teleport dodge (18 stamina)   " : " full-body roll (22 stamina)   ") + primaryKey("parry") + " hand parry",
                    primaryKey("heal") + " flask   Hold " + primaryKey("block") + " to block",
                    primaryKey("skill1") + " Dark Sky Judgment   " + primaryKey("skill2") + " Wraith Ascension",
                  ]
                : heroType === "thor"
                  ? [
                      primaryKey("left") + " / " + primaryKey("right") + " move   " + primaryKey("jump") + " jump   " + primaryKey("attack") + (P.thorBuffT > 0 ? " hammer combo (120)" : " storm blade (120)"),
                      primaryKey("dodge") + (P.thorBuffT > 0 ? " lightning teleport (20 stamina, works in the air)   " : " dodge roll (20 stamina, also while jumping)   ") + primaryKey("parry") + (P.thorBuffT > 0 ? " hammer throw (220)" : " storm bolt (190)"),
                      primaryKey("heal") + " flask   Hold " + primaryKey("block") + " to block",
                      primaryKey("skill1") + " Thunder Sky Strike (600)   " + primaryKey("skill2") + " Storm Ascension",
                    ]
                : [
                  primaryKey("left") +
                    " / " +
                    primaryKey("right") +
                    " move   " +
                    primaryKey("jump") +
                    " jump   " +
                    primaryKey("attack") +
                    " attack",
                  primaryKey("dodge") +
                    " dodge (also in the air)   " +
                    primaryKey("parry") +
                    " parry",
                  "Hold " +
                    primaryKey("block") +
                    " to block (-25% damage)   " +
                    primaryKey("heal") +
                    " flask   Esc pause",
                  primaryKey("skill1") +
                    " Sunray Slash   " +
                    primaryKey("skill2") +
                    " Cinder Bomb",
                ]
      ).forEach((s, i) => ctx.fillText(s, W - 16, 26 + i * 17));
      ctx.restore();
    }
  }
  function drawIntro() {
    const t = phaseT,
      a = t < 0.5 ? t / 0.5 : t > 2.2 ? clamp(1 - (t - 2.2) / 0.6, 0, 1) : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.5, "rgba(0,0,0,.72)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 205, W, 130);
    ctx.font = "900 40px Cinzel, Georgia, serif";
    ctx.fillStyle = "#e9d6a4";
    ctx.shadowColor =
      gameMode === "pvp"
        ? "#5aa7ff"
        : B.type === "demon"
        ? "#ff2a14"
        : B.type === "shogun"
          ? "#ff5a24"
          : B.type === "volturus"
            ? "#59d8ff"
          : B.type === "wraith"
            ? "#ff7a1c"
          : B.type === "spire"
            ? "#d0203f"
          : B.type === "warden"
            ? "#c29bff"
          : B.type === "art"
            ? "#4a7dff"
            : "#7a3cff";
    ctx.shadowBlur = 20;
    ctx.fillText(
      gameMode === "pvp"
        ? "PLAYER 1  VS  PLAYER 2"
        : B.type === "demon"
        ? "SHATTERED DEMON"
        : B.type === "shogun"
          ? "THE INFERNAL SHOGUN"
          : B.type === "volturus"
            ? "VOLTURUS, THE STORMLORD"
          : B.type === "wraith"
            ? "OBSIDIAN TENDRIL WRAITH"
          : B.type === "spire"
            ? "THE BLACK SPIRE KNIGHT"
          : B.type === "warden"
            ? "EMBERCROWN IRIDESCENT WARDEN"
          : B.type === "art"
            ? "ARTORIAS"
            : "THE VIOLET SENTINEL",
      W / 2,
      262,
    );
    ctx.shadowBlur = 0;
    ctx.font = "600 15px Cinzel, Georgia, serif";
    ctx.fillStyle = "#b9a4d8";
    ctx.fillText(
      gameMode === "pvp"
        ? "Local Duel · Four Flasks Each"
        : gameMode === "coop"
          ? "Two Heroes Stand Together"
          : B.type === "demon"
        ? "The Ruin Beneath the Volcano"
        : B.type === "shogun"
          ? "The Moon-Winged Bowmaster"
          : B.type === "volturus"
            ? "The Undying God of Thunder"
          : B.type === "wraith"
            ? "The Living Darkness Beneath the Moon"
          : B.type === "spire"
            ? "Lord of the Gothic Eclipse"
          : B.type === "warden"
            ? "Twin Blades at the Origin of Night"
          : B.type === "art"
            ? "The Abysswalker"
            : "Warden of the Moonlit Nave",
      W / 2,
      292,
    );
    ctx.strokeStyle = "rgba(201,164,90,.7)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 170, 306);
    ctx.lineTo(W / 2 + 170, 306);
    ctx.stroke();
    ctx.restore();
  }

  /* ================= LOOP ================= */
  let last = performance.now(),
    acc = 0,
    fpsFrames = 0,
    fpsStamp = last;
  function frame(now) {
    pollGamepads();
    fpsFrames++;
    if (now - fpsStamp >= 500) {
      const fps = Math.round((fpsFrames * 1000) / (now - fpsStamp));
      if ($("fpsCounter")) {
        $("fpsCounter").textContent = "FPS " + fps;
        $("fpsCounter").style.color =
          fps >= 55 ? "#9de3b5" : fps >= 40 ? "#f0d17d" : "#ff8a7d";
      }
      fpsFrames = 0;
      fpsStamp = now;
    }
    let d = (now - last) / 1000;
    last = now;
    if (d > 0.1) d = 0.1;
    acc += d;
    while (acc >= DT) {
      step(DT);
      acc -= DT;
    }
    render(acc / DT);
    requestAnimationFrame(frame);
  }
  reset();
  applyVideoSettings();
  buildBG();
  pickHero(heroType);
  updateCoinLabels();
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load("700 16px Cinzel"),
      document.fonts.load("900 16px Cinzel"),
    ])
      .then(() => {
        buildBG();
      })
      .catch(() => {});
  }
  function openMultiplayerLobby(mode) {
    gameMode = mode;
    $("multiKicker").textContent =
      mode === "coop" ? "LOCAL CO-OP" : "LOCAL PVP";
    $("multiTitle").textContent =
      mode === "coop" ? "Two Heroes, One Boss" : "Choose Both Fighters";
    $("multiBossWrap").classList.toggle("hide", mode === "pvp");
    $("startMultiplayer").textContent =
      mode === "coop" ? "BEGIN CO-OP HUNT" : "BEGIN LOCAL DUEL";
    $("multiHero1").value = heroType;
    $("multiHero2").value = heroType2;
    $("p1ControlSummary").innerHTML =
      primaryKey("left") +
      "/" +
      primaryKey("right") +
      " move · " +
      primaryKey("jump") +
      " jump · " +
      primaryKey("attack") +
      " attack · " +
      primaryKey("parry") +
      " parry · " +
      primaryKey("dodge") +
      " dodge<br>" +
      primaryKey("block") +
      " block · " +
      primaryKey("heal") +
      " flask · " +
      primaryKey("skill1") +
      "/" +
      primaryKey("skill2") +
      " skills";
    $("p2ControlSummary").innerHTML =
      primaryKey2("left") +
      "/" +
      primaryKey2("right") +
      " move · " +
      primaryKey2("jump") +
      " jump · " +
      primaryKey2("attack") +
      " attack · " +
      primaryKey2("parry") +
      " parry · " +
      primaryKey2("dodge") +
      " dodge<br>" +
      primaryKey2("block") +
      " block · " +
      primaryKey2("heal") +
      " flask · " +
      primaryKey2("skill1") +
      "/" +
      primaryKey2("skill2") +
      " skills";
    if (mode === "coop") {
      $("p1ControlSummary").innerHTML +=
        "<br><b>Hold " + primaryKey("block") + " near a fallen ally to revive</b>";
      $("p2ControlSummary").innerHTML +=
        "<br><b>Hold " + primaryKey2("block") + " near a fallen ally to revive</b>";
    }
    showFrontScreen("multiplayerLobby");
  }
  $("singlePlayer").addEventListener("click", () => {
    gameMode = "solo";
    showFrontScreen("bossSelect");
  });
  $("openCoop").addEventListener("click", () => openMultiplayerLobby("coop"));
  $("openPvp").addEventListener("click", () => openMultiplayerLobby("pvp"));
  $("startMultiplayer").addEventListener("click", () => {
    heroType = $("multiHero1").value;
    heroType2 = $("multiHero2").value;
    if (profile) {
      profile.hero = heroType;
      saveProfile();
    }
    startGame(
      gameMode === "coop" ? $("multiBoss").value : "sentinel",
    );
  });
  $("openLoadout").addEventListener("click", () => showFrontScreen("loadout"));
  $("openShop").addEventListener("click", () => showFrontScreen("shop"));
  document
    .querySelectorAll('[data-back="menu"]')
    .forEach((b) =>
      b.addEventListener("click", () => showFrontScreen("title")),
    );
  $("spinRelic").addEventListener("click", spinRelic);
  $("archiveUp").addEventListener("click", () =>
    $("shopRelicList").scrollBy({
      top:
        -170 * parseFloat(getComputedStyle(stage).getPropertyValue("--u") || 1),
      behavior: "smooth",
    }),
  );
  $("archiveDown").addEventListener("click", () =>
    $("shopRelicList").scrollBy({
      top:
        170 * parseFloat(getComputedStyle(stage).getPropertyValue("--u") || 1),
      behavior: "smooth",
    }),
  );
  $("pickKnight").addEventListener("click", () => {
    pickHero("knight");
    renderLoadout();
  });
  $("pickShadow").addEventListener("click", () => {
    pickHero("shadow");
    renderLoadout();
  });
  $("pickRonin").addEventListener("click", () => {
    pickHero("ronin");
    renderLoadout();
  });
  $("pickRegal").addEventListener("click", () => {
    pickHero("regal");
    renderLoadout();
  });
  $("pickWizard").addEventListener("click", () => {
    pickHero("wizard");
    renderLoadout();
  });
  $("pickKillnux").addEventListener("click", () => {
    pickHero("killnux");
    renderLoadout();
  });
  $("pickWraithKnight").addEventListener("click", () => {
    pickHero("wraithknight");
    renderLoadout();
  });
  $("pickThor").addEventListener("click", () => {
    pickHero("thor");
    renderLoadout();
  });
  $("pickSent").addEventListener("click", () => startGame("sentinel"));
  $("pickArt").addEventListener("click", () => startGame("art"));
  $("pickDemon").addEventListener("click", () => startGame("demon"));
  $("pickShogun").addEventListener("click", () => startGame("shogun"));
  $("pickVolturus").addEventListener("click", () => startGame("volturus"));
  $("pickWraith").addEventListener("click", () => startGame("wraith"));
  $("pickWarden").addEventListener("click", () => startGame("warden"));
  $("pickSpire").addEventListener("click", () => startGame("spire"));
  $("endBtn").addEventListener("click", () => startGame());
  $("menuBtn").addEventListener("click", toTitle);
  if (window.__TEST__)
    window.__G = {
      step,
      render,
      press,
      release,
      startGame,
      get P() {
        return P;
      },
      get P2() {
        return players[1] || null;
      },
      get B() {
        return B;
      },
      get skeletons() {
        return skeletons;
      },
      get wizardMissiles() {
        return wizardMissiles;
      },
      get shogunHazards() {
        return shogunHazards;
      },
      get volturusHazards() {
        return volturusHazards;
      },
      get shogunMinion() {
        return shogunMinion;
      },
      shogunChoose,
      beginShogunPhase2,
      beginVolturusPhase,
      volturusChoose,
      startVolturusAttack,
      VOLTURUS_ATTACKS,
      startWraithAttack,
      wraithChoose,
      beginWraithPhase2,
      get wraithHazards() {
        return wraithHazards;
      },
      startWardenAttack,
      wardenChoose,
      startSpireAttack,
      spireChoose,
      spireHazards,
      beginWardenPhase2,
      WARDEN_ATTACKS,
      get wardenHazards() {
        return wardenHazards;
      },
      get phase() {
        return phase;
      },
      set phase(v) {
        phase = v;
      },
      hurtPlayer,
      hitBoss,
      bossCombatTarget,
      bossStrike,
      bossDie,
      COMBOS,
      COMBOS_A,
      renderTrackOffline,
      TRACKS,
      get music() {
        return Music;
      },
      get paused() {
        return paused;
      },
      get binds() {
        return binds;
      },
      openPause,
      closePause,
      toTitle,
      get orbs() {
        return orbs;
      },
      get slashes() {
        return slashes;
      },
      get arrows() {
        return arrows;
      },
      get rain() {
        return rain;
      },
      get regalShots() {
        return regalShots;
      },
      get regalMeteors() {
        return regalMeteors;
      },
      get regalBeams() {
        return regalBeams;
      },
      get bossType() {
        return bossType;
      },
      get heroType() {
        return heroType;
      },
      pickHero,
      buildBonuses,
      renderLoadout,
      renderShop,
      spinRelic,
      rollRelic,
      sellRelic,
      RELICS,
      RARITIES,
      get profile() {
        return profile;
      },
      saveProfile,
      awardCoins,
      SKILL1_CD,
      SKILL2_CD,
      SHADOW_SKILL1_CD,
      SHADOW_SKILL2_CD,
      RONIN_SKILL1_CD,
      RONIN_SKILL2_CD,
      REGAL_SKILL1_CD,
      REGAL_SKILL2_CD,
      KILLNUX_SKILL1_CD,
      KILLNUX_SKILL2_CD,
      WRAITH_KNIGHT_SKILL1_CD,
      WRAITH_KNIGHT_SKILL2_CD,
      THOR_SKILL1_CD,
      THOR_SKILL2_CD,
      get wraithKnightBolts() {
        return wraithKnightBolts;
      },
      get thorBolts() {
        return thorBolts;
      },
      get thorHammers() {
        return thorHammers;
      },
    };
  requestAnimationFrame((t) => {
    last = t;
    requestAnimationFrame(frame);
  });
})();
