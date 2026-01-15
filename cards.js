/* Card definitions */
function makeCard(id, name, cost, desc, playFn, rarity='common'){
  return { id, name, cost, desc, play: playFn, rarity };
}

/* Item/Equipment definitions for Diablo-style inventory system */
const EQUIPMENT_TYPES = ['weapon', 'armor', 'boots', 'gloves', 'ring', 'necklace', 'helmet', 'belt'];

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
  boots: '👢'
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
    if(rarityRoll > 0.97) rarity = 'legendary';
    else if(rarityRoll > 0.85) rarity = 'rare';
    else if(rarityRoll > 0.60) rarity = 'uncommon';
    else rarity = 'common';
    
    // Get item from pool
    const pool = ITEM_POOL[itemType][rarity];
    if(pool && pool.length > 0) {
      const item = {...pool[rand(pool.length)]};
      loot.push(item);
    }
  }
  
  return loot;
}

/* Card pool for rewards and shop */
const CARD_POOL = {
  common: [
    {id:'atk', name:'Strike', cost:1, desc:'Deal 6 damage', rarity:'common'},
    {id:'def', name:'Defend', cost:1, desc:'Gain 6 block', rarity:'common'},
    {id:'slash', name:'Slash', cost:1, desc:'Deal 7 damage', rarity:'common'},
    {id:'shield', name:'Shield', cost:1, desc:'Gain 7 block', rarity:'common'},
    {id:'quickStrike', name:'Quick Strike', cost:0, desc:'Deal 3 damage', rarity:'common'},
    {id:'prepare', name:'Prepare', cost:1, desc:'Draw 1 card', rarity:'common'},
  ],
  uncommon: [
    {id:'heavy', name:'Heavy Strike', cost:2, desc:'Deal 12 damage', rarity:'uncommon'},
    {id:'heal', name:'Heal', cost:1, desc:'Heal 8 HP', rarity:'uncommon'},
    {id:'powerStrike', name:'Power Strike', cost:2, desc:'Deal 15 damage', rarity:'uncommon'},
    {id:'ironWall', name:'Iron Wall', cost:2, desc:'Gain 12 block', rarity:'uncommon'},
    {id:'tactician', name:'Tactician', cost:0, desc:'Draw 2 cards', rarity:'uncommon'},
    {id:'cleave', name:'Cleave', cost:1, desc:'Deal 8 damage', rarity:'uncommon'},
  ],
  rare: [
    {id:'bash', name:'Bash', cost:2, desc:'Deal 16 damage', rarity:'rare'},
    {id:'rampage', name:'Rampage', cost:3, desc:'Deal 20 damage', rarity:'rare'},
    {id:'impervious', name:'Impervious', cost:2, desc:'Gain 15 block', rarity:'rare'},
    {id:'reaper', name:'Reaper', cost:2, desc:'Deal 8 damage, heal for damage dealt', rarity:'rare'},
    {id:'deepThinking', name:'Deep Thinking', cost:1, desc:'Draw 3 cards', rarity:'rare'},
    {id:'execute', name:'Execute', cost:2, desc:'Deal 18 damage', rarity:'rare'},
  ],
  legendary: [
    {id:'omnislash', name:'Omnislash', cost:3, desc:'Deal 25 damage', rarity:'legendary'},
    {id:'timeWarp', name:'Time Warp', cost:2, desc:'Draw 4 cards', rarity:'legendary'},
    {id:'invincible', name:'Invincible', cost:3, desc:'Gain 20 block', rarity:'legendary'},
    {id:'phoenix', name:'Phoenix', cost:2, desc:'Deal 10 damage, heal 10 HP', rarity:'legendary'},
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
  switch(template.id){
    case 'atk': case 'slash': case 'quickStrike': case 'cleave':
      let atkDmg = 6;
      if(template.id === 'slash') atkDmg = 7;
      else if(template.id === 'quickStrike') atkDmg = 3;
      else if(template.id === 'cleave') atkDmg = 8;
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, atkDmg + bonus);
        g.log(`${owner.name} deals ${actual} damage to ${target.name}.`);
      };
      break;
    case 'def': case 'shield':
      const defBlock = template.id === 'shield' ? 7 : 6;
      playFn = (g,owner) => {
        owner.block += defBlock;
        g.log(`${owner.name} gains ${defBlock} block.`);
      };
      break;
    case 'heavy':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, 12 + bonus);
        g.log(`${owner.name} deals ${actual} heavy damage to ${target.name}.`);
      };
      break;
    case 'heal':
      playFn = (g,owner) => {
        owner.heal(8);
        g.log(`${owner.name} heals 8 HP.`);
      };
      break;
    case 'bash':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, 16 + bonus);
        g.log(`${owner.name} bashes for ${actual} damage!`);
      };
      break;
    case 'powerStrike':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, 15 + bonus);
        g.log(`${owner.name} power strikes for ${actual} damage!`);
      };
      break;
    case 'ironWall':
      playFn = (g,owner) => {
        owner.block += 12;
        g.log(`${owner.name} gains 12 block from iron wall.`);
      };
      break;
    case 'rampage':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, 20 + bonus);
        g.log(`${owner.name} rampages for ${actual} massive damage!`);
      };
      break;
    case 'impervious':
      playFn = (g,owner) => {
        owner.block += 15;
        g.log(`${owner.name} becomes impervious with 15 block.`);
      };
      break;
    case 'reaper':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, 8 + bonus);
        owner.heal(actual);
        g.log(`${owner.name} reaps ${actual} damage and heals for ${actual}!`);
      };
      break;
    case 'execute':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, 18 + bonus);
        g.log(`${owner.name} executes for ${actual} damage!`);
      };
      break;
    case 'prepare':
      playFn = (g,owner) => {
        g.deck.draw(1);
        g.log(`${owner.name} draws 1 card.`);
        updateUI();
      };
      break;
    case 'tactician':
      playFn = (g,owner) => {
        g.deck.draw(2);
        g.log(`${owner.name} draws 2 cards.`);
        updateUI();
      };
      break;
    case 'deepThinking':
      playFn = (g,owner) => {
        g.deck.draw(3);
        g.log(`${owner.name} draws 3 cards.`);
        updateUI();
      };
      break;
    case 'timeWarp':
      playFn = (g,owner) => {
        g.deck.draw(4);
        g.log(`${owner.name} warps time and draws 4 cards!`);
        updateUI();
      };
      break;
    case 'omnislash':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, 25 + bonus);
        g.log(`${owner.name} omnislashes for ${actual} devastating damage!`);
      };
      break;
    case 'invincible':
      playFn = (g,owner) => {
        owner.block += 20;
        g.log(`${owner.name} becomes invincible with 20 block!`);
      };
      break;
    case 'phoenix':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = g.applyDamage(target, 10 + bonus);
        owner.heal(10);
        g.log(`${owner.name} channels phoenix power: ${actual} damage and 10 HP healed!`);
      };
      break;
    default:
      console.warn(`Unknown card ID: ${template.id}`);
      playFn = (g,owner) => g.log(`Played ${template.name}.`);
  }
  return makeCard(template.id, template.name, template.cost, template.desc, playFn, template.rarity);
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
