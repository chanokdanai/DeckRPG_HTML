/* Card definitions */
function makeCard(id, name, cost, desc, playFn, rarity='common'){
  return { id, name, cost, desc, play: playFn, rarity };
}

/* Item/Equipment definitions for Diablo-style inventory system */
const EQUIPMENT_TYPES = ['weapon', 'armor', 'boots', 'gloves', 'ring', 'necklace', 'helmet', 'belt', 'potion'];

const EMOJI_MAP = {
  helmet: '🪖',
  weapon: '⚔️',
  leftHand: '🗡️',
  rightHand: '🛡️',
  necklace: '📿',
  armor: '👕',
  ring: '💍',
  ring1: '💍',
  ring2: '💍',
  gloves: '🧤',
  belt: '🔗',
  boots: '👢',
  potion: '🧪'
};

const ITEM_POOL = {
  weapon: {
    common: [
      {id:'rusty_sword', name:'Rusty Sword', type:'weapon', rarity:'common', stats:{attack:2}},
      {id:'wooden_club', name:'Wooden Club', type:'weapon', rarity:'common', stats:{attack:3}},
      {id:'iron_dagger', name:'Iron Dagger', type:'weapon', rarity:'common', stats:{attack:2, draw:1}},
      {id:'wooden_shield', name:'Wooden Shield', type:'weapon', rarity:'common', stats:{hp:5}},
    ],
    uncommon: [
      {id:'steel_sword', name:'Steel Sword', type:'weapon', rarity:'uncommon', stats:{attack:5}},
      {id:'war_axe', name:'War Axe', type:'weapon', rarity:'uncommon', stats:{attack:6, hp:-5}},
      {id:'enchanted_blade', name:'Enchanted Blade', type:'weapon', rarity:'uncommon', stats:{attack:4, energy:1}},
      {id:'iron_shield', name:'Iron Shield', type:'weapon', rarity:'uncommon', stats:{hp:8, attack:1}},
    ],
    rare: [
      {id:'flaming_sword', name:'Flaming Sword', type:'weapon', rarity:'rare', stats:{attack:8, hp:5}},
      {id:'vorpal_blade', name:'Vorpal Blade', type:'weapon', rarity:'rare', stats:{attack:10}},
      {id:'lightning_spear', name:'Lightning Spear', type:'weapon', rarity:'rare', stats:{attack:7, draw:1}},
      {id:'enchanted_shield', name:'Enchanted Shield', type:'weapon', rarity:'rare', stats:{hp:12, energy:1}},
    ],
    legendary: [
      {id:'excalibur', name:'Excalibur', type:'weapon', rarity:'legendary', stats:{attack:15, hp:10}},
      {id:'doombringer', name:'Doombringer', type:'weapon', rarity:'legendary', stats:{attack:18, energy:1}},
      {id:'aegis_shield', name:'Aegis Shield', type:'weapon', rarity:'legendary', stats:{hp:20, attack:5}},
    ],
    unique: [
      {id:'storm_glaive', name:'Storm Glaive', type:'weapon', rarity:'unique', stats:{attack:6}, uniqueEffect:{type:'aoe_bonus', bonus:3, description:'AOE cards deal +3 damage.'}}
    ]
  },
  armor: {
    common: [
      {id:'leather_armor', name:'Leather Armor', type:'armor', rarity:'common', stats:{hp:8}},
      {id:'chainmail', name:'Chainmail', type:'armor', rarity:'common', stats:{hp:10, energy:-1}},
      {id:'cloth_robe', name:'Cloth Robe', type:'armor', rarity:'common', stats:{hp:5, draw:1}},
    ],
    uncommon: [
      {id:'steel_plate', name:'Steel Plate', type:'armor', rarity:'uncommon', stats:{hp:15}},
      {id:'mithril_vest', name:'Mithril Vest', type:'armor', rarity:'uncommon', stats:{hp:12, attack:2}},
      {id:'scale_mail', name:'Scale Mail', type:'armor', rarity:'uncommon', stats:{hp:14, draw:1}},
    ],
    rare: [
      {id:'dragon_scale', name:'Dragon Scale Armor', type:'armor', rarity:'rare', stats:{hp:20, attack:3}},
      {id:'holy_armor', name:'Holy Armor', type:'armor', rarity:'rare', stats:{hp:18, energy:1}},
      {id:'shadow_cloak', name:'Shadow Cloak', type:'armor', rarity:'rare', stats:{hp:12, draw:2}},
    ],
    legendary: [
      {id:'titans_plate', name:"Titan's Plate", type:'armor', rarity:'legendary', stats:{hp:30, attack:5}},
      {id:'archmage_robe', name:'Archmage Robe', type:'armor', rarity:'legendary', stats:{hp:20, energy:2, draw:2}},
    ]
  },
  boots: {
    common: [
      {id:'leather_boots', name:'Leather Boots', type:'boots', rarity:'common', stats:{hp:3}},
      {id:'traveler_boots', name:"Traveler's Boots", type:'boots', rarity:'common', stats:{draw:1}},
      {id:'iron_boots', name:'Iron Boots', type:'boots', rarity:'common', stats:{hp:5, energy:-1}},
    ],
    uncommon: [
      {id:'swiftness_boots', name:'Boots of Swiftness', type:'boots', rarity:'uncommon', stats:{draw:1, energy:1}},
      {id:'steel_greaves', name:'Steel Greaves', type:'boots', rarity:'uncommon', stats:{hp:8, attack:1}},
      {id:'mage_boots', name:'Mage Boots', type:'boots', rarity:'uncommon', stats:{energy:1, draw:1}},
    ],
    rare: [
      {id:'dragon_boots', name:'Dragon Boots', type:'boots', rarity:'rare', stats:{hp:10, attack:2}},
      {id:'winged_boots', name:'Winged Boots', type:'boots', rarity:'rare', stats:{draw:2, energy:1}},
      {id:'crusader_boots', name:'Crusader Boots', type:'boots', rarity:'rare', stats:{hp:12, energy:1}},
    ],
    legendary: [
      {id:'hermes_sandals', name:'Hermes Sandals', type:'boots', rarity:'legendary', stats:{draw:3, energy:2}},
      {id:'titans_stride', name:"Titan's Stride", type:'boots', rarity:'legendary', stats:{hp:15, attack:3, energy:1}},
    ]
  },
  gloves: {
    common: [
      {id:'leather_gloves', name:'Leather Gloves', type:'gloves', rarity:'common', stats:{attack:1}},
      {id:'cloth_gloves', name:'Cloth Gloves', type:'gloves', rarity:'common', stats:{draw:1}},
      {id:'iron_gauntlets', name:'Iron Gauntlets', type:'gloves', rarity:'common', stats:{attack:2, hp:2}},
    ],
    uncommon: [
      {id:'warrior_gloves', name:'Warrior Gloves', type:'gloves', rarity:'uncommon', stats:{attack:3, hp:3}},
      {id:'mage_gloves', name:'Mage Gloves', type:'gloves', rarity:'uncommon', stats:{energy:1, draw:1}},
      {id:'berserker_gauntlets', name:'Berserker Gauntlets', type:'gloves', rarity:'uncommon', stats:{attack:4, hp:-3}},
    ],
    rare: [
      {id:'dragon_gauntlets', name:'Dragon Gauntlets', type:'gloves', rarity:'rare', stats:{attack:5, hp:5}},
      {id:'arcane_gloves', name:'Arcane Gloves', type:'gloves', rarity:'rare', stats:{energy:2, draw:1}},
      {id:'blessed_gauntlets', name:'Blessed Gauntlets', type:'gloves', rarity:'rare', stats:{attack:4, hp:8}},
    ],
    legendary: [
      {id:'fist_of_gods', name:'Fist of Gods', type:'gloves', rarity:'legendary', stats:{attack:8, hp:10, energy:1}},
      {id:'infinity_gauntlets', name:'Infinity Gauntlets', type:'gloves', rarity:'legendary', stats:{attack:10, energy:2, draw:2}},
    ]
  },
  ring: {
    common: [
      {id:'health_ring', name:'Health Ring', type:'ring', rarity:'common', stats:{hp:5}},
      {id:'power_ring', name:'Power Ring', type:'ring', rarity:'common', stats:{attack:2}},
      {id:'energy_ring', name:'Energy Ring', type:'ring', rarity:'common', stats:{energy:1}},
    ],
    uncommon: [
      {id:'vampiric_ring', name:'Vampiric Ring', type:'ring', rarity:'uncommon', stats:{attack:3, hp:5}},
      {id:'sages_ring', name:"Sage's Ring", type:'ring', rarity:'uncommon', stats:{draw:2, energy:1}},
      {id:'berserker_ring', name:'Berserker Ring', type:'ring', rarity:'uncommon', stats:{attack:5, hp:-5}},
    ],
    rare: [
      {id:'phoenix_ring', name:'Phoenix Ring', type:'ring', rarity:'rare', stats:{hp:15, draw:1}},
      {id:'warlords_ring', name:"Warlord's Ring", type:'ring', rarity:'rare', stats:{attack:6, energy:1}},
      {id:'arcane_ring', name:'Arcane Ring', type:'ring', rarity:'rare', stats:{energy:2, draw:2}},
    ],
    legendary: [
      {id:'infinity_band', name:'Infinity Band', type:'ring', rarity:'legendary', stats:{attack:8, hp:15, energy:2}},
      {id:'ring_of_gods', name:'Ring of Gods', type:'ring', rarity:'legendary', stats:{attack:10, hp:20, draw:2}},
    ],
    unique: [
      {id:'duelist_emblem', name:"Duelist's Emblem", type:'ring', rarity:'unique', stats:{attack:3}, uniqueEffect:{type:'combo_bonus', bonus:4, description:'Combo cards deal +4 damage when triggered.'}}
    ]
  },
  necklace: {
    common: [
      {id:'simple_amulet', name:'Simple Amulet', type:'necklace', rarity:'common', stats:{hp:5}},
      {id:'power_pendant', name:'Power Pendant', type:'necklace', rarity:'common', stats:{attack:2}},
      {id:'focus_charm', name:'Focus Charm', type:'necklace', rarity:'common', stats:{draw:1}},
    ],
    uncommon: [
      {id:'life_pendant', name:'Life Pendant', type:'necklace', rarity:'uncommon', stats:{hp:10, energy:1}},
      {id:'strength_amulet', name:'Strength Amulet', type:'necklace', rarity:'uncommon', stats:{attack:4, hp:5}},
      {id:'wisdom_pendant', name:'Wisdom Pendant', type:'necklace', rarity:'uncommon', stats:{draw:2, energy:1}},
    ],
    rare: [
      {id:'phoenix_feather', name:'Phoenix Feather', type:'necklace', rarity:'rare', stats:{hp:15, draw:1}},
      {id:'dragon_fang', name:'Dragon Fang', type:'necklace', rarity:'rare', stats:{attack:7, hp:10}},
      {id:'arcane_amulet', name:'Arcane Amulet', type:'necklace', rarity:'rare', stats:{energy:2, draw:2}},
    ],
    legendary: [
      {id:'infinity_stone', name:'Infinity Stone', type:'necklace', rarity:'legendary', stats:{attack:8, hp:15, energy:2}},
      {id:'eye_of_gods', name:'Eye of Gods', type:'necklace', rarity:'legendary', stats:{attack:10, hp:20, draw:3, energy:2}},
    ]
  },
  helmet: {
    common: [
      {id:'leather_cap', name:'Leather Cap', type:'helmet', rarity:'common', stats:{hp:5}},
      {id:'iron_helmet', name:'Iron Helmet', type:'helmet', rarity:'common', stats:{hp:6, energy:-1}},
      {id:'cloth_hood', name:'Cloth Hood', type:'helmet', rarity:'common', stats:{draw:1}},
    ],
    uncommon: [
      {id:'steel_helm', name:'Steel Helm', type:'helmet', rarity:'uncommon', stats:{hp:10}},
      {id:'mage_hat', name:'Mage Hat', type:'helmet', rarity:'uncommon', stats:{energy:1, draw:1}},
      {id:'warriors_helm', name:"Warrior's Helm", type:'helmet', rarity:'uncommon', stats:{hp:8, attack:2}},
    ],
    rare: [
      {id:'dragon_helm', name:'Dragon Helm', type:'helmet', rarity:'rare', stats:{hp:12, attack:3}},
      {id:'crown_of_wisdom', name:'Crown of Wisdom', type:'helmet', rarity:'rare', stats:{energy:2, draw:2}},
      {id:'blessed_crown', name:'Blessed Crown', type:'helmet', rarity:'rare', stats:{hp:10, energy:1, draw:1}},
    ],
    legendary: [
      {id:'helm_of_gods', name:'Helm of Gods', type:'helmet', rarity:'legendary', stats:{hp:15, attack:5, energy:1}},
      {id:'infinity_crown', name:'Infinity Crown', type:'helmet', rarity:'legendary', stats:{hp:12, energy:3, draw:3}},
    ]
  },
  belt: {
    common: [
      {id:'leather_belt', name:'Leather Belt', type:'belt', rarity:'common', stats:{hp:4}},
      {id:'utility_belt', name:'Utility Belt', type:'belt', rarity:'common', stats:{draw:1}},
      {id:'simple_sash', name:'Simple Sash', type:'belt', rarity:'common', stats:{energy:1}},
    ],
    uncommon: [
      {id:'reinforced_belt', name:'Reinforced Belt', type:'belt', rarity:'uncommon', stats:{hp:8, attack:1}},
      {id:'mages_sash', name:"Mage's Sash", type:'belt', rarity:'uncommon', stats:{energy:1, draw:1}},
      {id:'warriors_belt', name:"Warrior's Belt", type:'belt', rarity:'uncommon', stats:{attack:3, hp:5}},
    ],
    rare: [
      {id:'dragon_belt', name:'Dragon Belt', type:'belt', rarity:'rare', stats:{hp:10, attack:3}},
      {id:'arcane_sash', name:'Arcane Sash', type:'belt', rarity:'rare', stats:{energy:2, draw:1}},
      {id:'titans_belt', name:"Titan's Belt", type:'belt', rarity:'rare', stats:{hp:12, attack:4}},
    ],
    legendary: [
      {id:'belt_of_gods', name:'Belt of Gods', type:'belt', rarity:'legendary', stats:{hp:15, attack:5, energy:2}},
      {id:'eternity_sash', name:'Eternity Sash', type:'belt', rarity:'legendary', stats:{hp:10, energy:2, draw:3}},
    ]
  },
  potion: {
    common: [
      {id:'minor_heal', name:'Minor Healing Potion', type:'potion', rarity:'common', stats:{heal:8}},
      {id:'swift_draught', name:'Swift Draught', type:'potion', rarity:'common', stats:{energy:1}}
    ],
    uncommon: [
      {id:'healing_potion', name:'Healing Potion', type:'potion', rarity:'uncommon', stats:{heal:15}},
      {id:'focus_tonic', name:'Focus Tonic', type:'potion', rarity:'uncommon', stats:{draw:1}}
    ],
    rare: [
      {id:'greater_heal', name:'Greater Healing Potion', type:'potion', rarity:'rare', stats:{heal:25}},
      {id:'battle_elixir', name:'Battle Elixir', type:'potion', rarity:'rare', stats:{attack:3}}
    ]
  }
};


/* Get loot drops based on enemy/event type and rarity */
function generateLoot(sourceType, rarityBonus = 0) {
  const loot = [];
  let dropChance = 0.5; // Base 50% drop chance
  let itemCount = 1;
  
  // Adjust drop rates based on source
  if(sourceType === 'boss') {
    dropChance = 1.0; // Bosses always drop
    itemCount = 2 + rand(2); // 2-3 items
    rarityBonus += 0.25;
  } else if(sourceType === 'elite') {
    dropChance = 0.8; // 80% drop chance
    itemCount = 1 + rand(2); // 1-2 items
    rarityBonus += 0.15;
  } else if(sourceType === 'treasure') {
    dropChance = 1.0;
    itemCount = 1 + rand(2);
    rarityBonus += 0.1;
  }
  
  // Roll for drops
  for(let i = 0; i < itemCount; i++) {
    if(Math.random() > dropChance) continue;
    
    // Select item type
    const itemType = EQUIPMENT_TYPES[rand(EQUIPMENT_TYPES.length)];
    
    // Select rarity with bonus
    const rarityRoll = Math.random() + rarityBonus;
    let rarity;
    if(rarityRoll > 1.15) rarity = 'unique';
    else if(rarityRoll > 0.97) rarity = 'legendary';
    else if(rarityRoll > 0.85) rarity = 'rare';
    else if(rarityRoll > 0.60) rarity = 'uncommon';
    else rarity = 'common';
    
    // Get item from pool
    let pool = ITEM_POOL[itemType][rarity];
    if(!pool || pool.length === 0){
      const fallback = ['legendary', 'rare', 'uncommon', 'common'];
      for(const rarityOption of fallback){
        pool = ITEM_POOL[itemType][rarityOption];
        if(pool && pool.length) {
          rarity = rarityOption;
          break;
        }
      }
    }
    if(pool && pool.length > 0) {
      const item = {...pool[rand(pool.length)]};
      item.rarity = rarity;
      loot.push(item);
    }
  }
  
  return loot;
}

/* Card pool for rewards and shop */
const CARD_POOL = {
  common: [
    {id:'atk', name:'Strike', cost:1, desc:'Deal 6 damage', rarity:'common', mainStat:'str'},
    {id:'def', name:'Defend', cost:1, desc:'Gain 6 block', rarity:'common', mainStat:'spd'},
    {id:'slash', name:'Slash', cost:1, desc:'Deal 7 damage', rarity:'common', mainStat:'dex'},
    {id:'shield', name:'Shield', cost:1, desc:'Gain 7 block', rarity:'common', mainStat:'spd'},
    {id:'quickStrike', name:'Quick Strike', cost:0, desc:'Deal 3 damage', rarity:'common', mainStat:'dex'},
    {id:'prepare', name:'Prepare', cost:1, desc:'Draw 1 card', rarity:'common', mainStat:'spd'},
  ],
  uncommon: [
    {id:'heavy', name:'Heavy Strike', cost:2, desc:'Deal 12 damage', rarity:'uncommon', mainStat:'str'},
    {id:'heal', name:'Heal', cost:1, desc:'Heal 8 HP', rarity:'uncommon', mainStat:'int'},
    {id:'powerStrike', name:'Power Strike', cost:2, desc:'Deal 15 damage', rarity:'uncommon', mainStat:'str'},
    {id:'ironWall', name:'Iron Wall', cost:2, desc:'Gain 12 block', rarity:'uncommon', mainStat:'spd'},
    {id:'tactician', name:'Tactician', cost:0, desc:'Draw 2 cards', rarity:'uncommon', mainStat:'spd'},
    {id:'cleave', name:'Cleave', cost:1, desc:'Deal 8 damage to ALL enemies', rarity:'uncommon', mainStat:'str', isAoe:true},
    {id:'whirlwind', name:'Whirlwind', cost:2, desc:'Deal 6 damage to ALL enemies', rarity:'uncommon', mainStat:'dex', isAoe:true},
    {id:'comboFinish', name:'Combo Finisher', cost:1, desc:'Deal 6 damage. Combo: +6 damage after Quick Strike or Slash', rarity:'uncommon', mainStat:'dex', comboFrom:['quickStrike','slash'], comboBonus:6},
  ],
  rare: [
    {id:'bash', name:'Bash', cost:2, desc:'Deal 16 damage', rarity:'rare', mainStat:'str'},
    {id:'rampage', name:'Rampage', cost:3, desc:'Deal 20 damage', rarity:'rare', mainStat:'str'},
    {id:'impervious', name:'Impervious', cost:2, desc:'Gain 15 block', rarity:'rare', mainStat:'spd'},
    {id:'reaper', name:'Reaper', cost:2, desc:'Deal 8 damage, heal for damage dealt', rarity:'rare', mainStat:'int'},
    {id:'deepThinking', name:'Deep Thinking', cost:1, desc:'Draw 3 cards', rarity:'rare', mainStat:'spd'},
    {id:'execute', name:'Execute', cost:2, desc:'Deal 18 damage', rarity:'rare', mainStat:'dex'},
  ],
  legendary: [
    {id:'omnislash', name:'Omnislash', cost:3, desc:'Deal 25 damage', rarity:'legendary', mainStat:'str'},
    {id:'timeWarp', name:'Time Warp', cost:2, desc:'Draw 4 cards', rarity:'legendary', mainStat:'spd'},
    {id:'invincible', name:'Invincible', cost:3, desc:'Gain 20 block', rarity:'legendary', mainStat:'spd'},
    {id:'phoenix', name:'Phoenix', cost:2, desc:'Deal 10 damage, heal 10 HP', rarity:'legendary', mainStat:'int'},
  ]
};

/* Pokemon sprite IDs - curated lists for reliable sprite availability */
const COMMON_POKEMON_IDS = [
  1,4,7,10,13,16,19,23,25,27,29,32,35,37,39,41,43,46,48,50,
  52,54,56,58,60,63,66,69,72,74,77,79,81,84,86,88,90,92,95,98
];
const ELITE_POKEMON_IDS = [
  150,151,144,145,146,243,244,245,380,381,382,383,384,
  480,481,482,483,484,485,486,487,488,491,492,493
];

/* Create a card with its effect function from a template */
function createCardWithEffect(template, game) {
  let playFn;
  const getDamageAmount = (g, owner, base, options = {}) => {
    const statBonus = template.mainStat ? g.getAttributeValue(template.mainStat) : 0;
    const attackBonus = owner.baseAttack || 0;
    let amount = base + statBonus + attackBonus;
    if(options.isCombo){
      amount += template.comboBonus || 0;
    }
    if(g.getUniqueDamageBonus){
      amount += g.getUniqueDamageBonus(template, options);
    }
    return amount;
  };
  const getBlockAmount = (g, base) => {
    const statBonus = template.mainStat ? g.getAttributeValue(template.mainStat) : 0;
    return base + statBonus;
  };
  const getHealAmount = (g, base) => {
    const statBonus = template.mainStat ? g.getAttributeValue(template.mainStat) : 0;
    return base + statBonus;
  };
  const getDrawAmount = (g, base) => {
    const statBonus = template.mainStat ? g.getAttributeValue(template.mainStat) : 0;
    return base + statBonus;
  };
  switch(template.id){
    case 'atk': case 'slash': case 'quickStrike': case 'cleave':
      let atkDmg = 6;
      if(template.id === 'slash') atkDmg = 7;
      else if(template.id === 'quickStrike') atkDmg = 3;
      else if(template.id === 'cleave') atkDmg = 8;
      playFn = (g,owner,target) => {
        if(template.isAoe){
          const targets = g.getAliveEnemies();
          if(!targets.length) return;
          const dmg = getDamageAmount(g, owner, atkDmg, {isAoe:true});
          targets.forEach((enemy) => {
            const result = g.applyDamage(enemy, dmg, owner, {isAoe:true});
            g.log(`${owner.name} hits ${enemy.name} for ${result.actual}${result.crit ? ' (CRIT)' : ''}.`);
          });
          return;
        }
        if(!target) return;
        const dmg = getDamageAmount(g, owner, atkDmg);
        const result = g.applyDamage(target, dmg, owner);
        g.log(`${owner.name} deals ${result.actual} damage to ${target.name}${result.crit ? ' (CRIT)' : ''}.`);
      };
      break;
    case 'def': case 'shield':
      const defBlock = template.id === 'shield' ? 7 : 6;
      playFn = (g,owner) => {
        const block = getBlockAmount(g, defBlock);
        owner.block += block;
        g.log(`${owner.name} gains ${block} block.`);
      };
      break;
    case 'heavy':
      playFn = (g,owner,target) => {
        if(!target) return;
        const dmg = getDamageAmount(g, owner, 12);
        const result = g.applyDamage(target, dmg, owner);
        g.log(`${owner.name} deals ${result.actual} heavy damage to ${target.name}${result.crit ? ' (CRIT)' : ''}.`);
      };
      break;
    case 'heal':
      playFn = (g,owner) => {
        const heal = getHealAmount(g, 8);
        owner.heal(heal);
        g.log(`${owner.name} heals ${heal} HP.`);
      };
      break;
    case 'bash':
      playFn = (g,owner,target) => {
        if(!target) return;
        const dmg = getDamageAmount(g, owner, 16);
        const result = g.applyDamage(target, dmg, owner);
        g.log(`${owner.name} bashes ${target.name} for ${result.actual} damage${result.crit ? ' (CRIT)' : ''}!`);
      };
      break;
    case 'powerStrike':
      playFn = (g,owner,target) => {
        if(!target) return;
        const dmg = getDamageAmount(g, owner, 15);
        const result = g.applyDamage(target, dmg, owner);
        g.log(`${owner.name} power strikes ${target.name} for ${result.actual} damage${result.crit ? ' (CRIT)' : ''}!`);
      };
      break;
    case 'ironWall':
      playFn = (g,owner) => {
        const block = getBlockAmount(g, 12);
        owner.block += block;
        g.log(`${owner.name} gains ${block} block from iron wall.`);
      };
      break;
    case 'rampage':
      playFn = (g,owner,target) => {
        if(!target) return;
        const dmg = getDamageAmount(g, owner, 20);
        const result = g.applyDamage(target, dmg, owner);
        g.log(`${owner.name} rampages ${target.name} for ${result.actual} massive damage${result.crit ? ' (CRIT)' : ''}!`);
      };
      break;
    case 'impervious':
      playFn = (g,owner) => {
        const block = getBlockAmount(g, 15);
        owner.block += block;
        g.log(`${owner.name} becomes impervious with ${block} block.`);
      };
      break;
    case 'reaper':
      playFn = (g,owner,target) => {
        if(!target) return;
        const dmg = getDamageAmount(g, owner, 8);
        const result = g.applyDamage(target, dmg, owner);
        owner.heal(result.actual);
        g.log(`${owner.name} reaps ${result.actual} damage and heals for ${result.actual}${result.crit ? ' (CRIT)' : ''}!`);
      };
      break;
    case 'execute':
      playFn = (g,owner,target) => {
        if(!target) return;
        const dmg = getDamageAmount(g, owner, 18);
        const result = g.applyDamage(target, dmg, owner);
        g.log(`${owner.name} executes ${target.name} for ${result.actual} damage${result.crit ? ' (CRIT)' : ''}!`);
      };
      break;
    case 'prepare':
      playFn = (g,owner) => {
        const drawCount = getDrawAmount(g, 1);
        g.deck.draw(drawCount);
        g.log(`${owner.name} draws ${drawCount} card${drawCount !== 1 ? 's' : ''}.`);
        updateUI();
      };
      break;
    case 'tactician':
      playFn = (g,owner) => {
        const drawCount = getDrawAmount(g, 2);
        g.deck.draw(drawCount);
        g.log(`${owner.name} draws ${drawCount} cards.`);
        updateUI();
      };
      break;
    case 'deepThinking':
      playFn = (g,owner) => {
        const drawCount = getDrawAmount(g, 3);
        g.deck.draw(drawCount);
        g.log(`${owner.name} draws ${drawCount} cards.`);
        updateUI();
      };
      break;
    case 'timeWarp':
      playFn = (g,owner) => {
        const drawCount = getDrawAmount(g, 4);
        g.deck.draw(drawCount);
        g.log(`${owner.name} warps time and draws ${drawCount} cards!`);
        updateUI();
      };
      break;
    case 'omnislash':
      playFn = (g,owner,target) => {
        if(!target) return;
        const dmg = getDamageAmount(g, owner, 25);
        const result = g.applyDamage(target, dmg, owner);
        g.log(`${owner.name} omnislashes ${target.name} for ${result.actual} devastating damage${result.crit ? ' (CRIT)' : ''}!`);
      };
      break;
    case 'invincible':
      playFn = (g,owner) => {
        const block = getBlockAmount(g, 20);
        owner.block += block;
        g.log(`${owner.name} becomes invincible with ${block} block!`);
      };
      break;
    case 'phoenix':
      playFn = (g,owner,target) => {
        if(!target) return;
        const dmg = getDamageAmount(g, owner, 10);
        const result = g.applyDamage(target, dmg, owner);
        const heal = getHealAmount(g, 10);
        owner.heal(heal);
        g.log(`${owner.name} channels phoenix power: ${result.actual} damage and ${heal} HP healed${result.crit ? ' (CRIT)' : ''}!`);
      };
      break;
    case 'whirlwind':
      playFn = (g,owner) => {
        const targets = g.getAliveEnemies();
        if(!targets.length) return;
        const dmg = getDamageAmount(g, owner, 6, {isAoe:true});
        targets.forEach((enemy) => {
          const result = g.applyDamage(enemy, dmg, owner, {isAoe:true});
          g.log(`${owner.name} slices ${enemy.name} for ${result.actual}${result.crit ? ' (CRIT)' : ''}.`);
        });
      };
      break;
    case 'comboFinish':
      playFn = (g,owner,target) => {
        if(!target) return;
        const comboActive = g.isComboReady(template.comboFrom);
        const dmg = getDamageAmount(g, owner, 6, {isCombo: comboActive});
        const result = g.applyDamage(target, dmg, owner, {isCombo: comboActive});
        g.log(`${owner.name} strikes ${target.name} for ${result.actual}${comboActive ? ' with combo power' : ''}${result.crit ? ' (CRIT)' : ''}.`);
      };
      break;
    default:
      console.warn(`Unknown card ID: ${template.id}`);
      playFn = (g,owner) => g.log(`Played ${template.name}.`);
  }
  const card = makeCard(template.id, template.name, template.cost, template.desc, playFn, template.rarity);
  if(template.mainStat) card.mainStat = template.mainStat;
  if(template.isAoe) card.isAoe = true;
  if(template.comboFrom) card.comboFrom = template.comboFrom;
  if(template.comboBonus) card.comboBonus = template.comboBonus;
  return card;
}

/* Select a random card pool based on rarity probabilities */
function selectRandomRarityPool(legendaryChance = 0.03, rareChance = 0.15, uncommonChance = 0.5) {
  const roll = Math.random();
  if(roll > (1 - legendaryChance)) return CARD_POOL.legendary;
  if(roll > (1 - legendaryChance - rareChance)) return CARD_POOL.rare;
  if(roll > (1 - legendaryChance - rareChance - uncommonChance)) return CARD_POOL.uncommon;
  return CARD_POOL.common;
}

/* Get price for a card based on its rarity */
function getCardPrice(rarity) {
  switch(rarity) {
    case 'legendary': return 120 + rand(41);
    case 'rare': return 75 + rand(26);
    case 'uncommon': return 40 + rand(21);
    case 'common': return 25 + rand(16);
    default: return 50;
  }
}
