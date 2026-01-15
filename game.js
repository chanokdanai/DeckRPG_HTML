// Mini DeckRPG prototype
// Save these three files together and open index.html

// Utility
const $ = id => document.getElementById(id);
const rand = (n) => Math.floor(Math.random()*n);
const clamp = (v,m,M) => Math.max(m,Math.min(M,v));

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
        const actual = target.takeDamage(atkDmg + bonus);
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
        const actual = target.takeDamage(12 + bonus);
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
        const actual = target.takeDamage(16 + bonus);
        g.log(`${owner.name} bashes for ${actual} damage!`);
      };
      break;
    case 'powerStrike':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = target.takeDamage(15 + bonus);
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
        const actual = target.takeDamage(20 + bonus);
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
        const actual = target.takeDamage(8 + bonus);
        owner.heal(actual);
        g.log(`${owner.name} reaps ${actual} damage and heals for ${actual}!`);
      };
      break;
    case 'execute':
      playFn = (g,owner,target) => {
        const bonus = owner.baseAttack || 0;
        const actual = target.takeDamage(18 + bonus);
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
        const actual = target.takeDamage(25 + bonus);
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
        const actual = target.takeDamage(10 + bonus);
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

/* Game State */
class Deck {
  constructor(cards){
    this.drawPile = [...cards];
    this.discard = [];
    this.hand = [];
    this.shuffle();
  }
  shuffle(){
    for(let i=this.drawPile.length-1;i>0;i--){
      const j = rand(i+1);
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }
  draw(n=1){
    while(n-- > 0){
      if(this.drawPile.length===0){
        if(this.discard.length===0) return null;
        this.drawPile = this.discard.splice(0);
        this.shuffle();
      }
      const c = this.drawPile.shift();
      this.hand.push(c);
    }
  }
  playCard(index){
    const [c] = this.hand.splice(index,1);
    this.discard.push(c);
    return c;
  }
  discardHand(){
    this.discard.push(...this.hand);
    this.hand = [];
  }
}

class Entity {
  constructor(name, hp, maxHp){
    this.name = name;
    this.hp = hp;
    this.maxHp = maxHp;
    this.block = 0;
  }
  takeDamage(amount){
    const mitigated = Math.max(0, amount - this.block);
    const usedBlock = Math.min(this.block, amount);
    this.block -= usedBlock;
    this.hp -= mitigated;
    return mitigated;
  }
  heal(amount){
    this.hp = clamp(this.hp + amount, 0, this.maxHp);
  }
}

class Game {
  constructor(){
    this.floors = 15; // Total floors including boss
    this.currentFloor = -1;
    this.currentNode = null;
    this.mapNodes = [];
    this.gold = 0;
    this.inventory = {
      helmet: null,
      leftHand: null,
      rightHand: null,
      necklace: null,
      armor: null,
      ring1: null,
      ring2: null,
      gloves: null,
      belt: null,
      boots: null
    };
    this.startTime = Date.now();
    this.roomsCleared = 0;
    this.enemiesDefeated = 0;
    this.setupUI();
    this.resetPlayer();
    this.makeDeck();
    this.log("Welcome to DeckRPG! Click Start Run to explore the map.");
    $("roomCount").textContent = this.floors;
  }

  setupUI(){
    $("nextRoomBtn").addEventListener('click', ()=> this.nextRoom());
    $("endTurn").addEventListener('click', ()=> this.endTurn());
    $("drawBtn").addEventListener('click', ()=> { this.drawToFull(); updateUI(); });
    $("skipReward").addEventListener('click', ()=> this.skipReward());
    $("leaveShop").addEventListener('click', ()=> this.leaveShop());
    $("restartBtn").addEventListener('click', ()=> this.restart());
    $("closeLootBtn").addEventListener('click', ()=> this.closeLootModal());
    this.updateInventoryUI();
  }

  resetPlayer(){
    this.player = new Entity("You", 50, 50);
    this.player.energy = 3;
    this.player.maxEnergy = 3;
    this.player.baseAttack = 0;
    this.player.bonusDraw = 0;
  }

  makeDeck(){
    // basic card set
    const cards = [];
    
    // populate starting deck: mostly strikes and defends
    for(let i=0;i<6;i++) cards.push(createCardWithEffect(CARD_POOL.common[0], this)); // Strike
    for(let i=0;i<4;i++) cards.push(createCardWithEffect(CARD_POOL.common[1], this)); // Defend
    cards.push(createCardWithEffect(CARD_POOL.uncommon[0], this)); // Heavy Strike
    cards.push(createCardWithEffect(CARD_POOL.uncommon[1], this)); // Heal

    this.deck = new Deck(cards);
    updateUI();
  }

  log(msg){
    const el = $("log");
    const p = document.createElement('div');
    p.textContent = msg;
    el.prepend(p);
  }

  generateMap(){
    // Generate Slay the Spire style branching map
    this.mapNodes = [];
    const nodesPerFloor = [1, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 3, 2, 1]; // Branching pattern
    
    let nodeId = 0;
    for(let floor = 0; floor < this.floors; floor++){
      const nodeCount = nodesPerFloor[floor];
      const floorNodes = [];
      
      for(let i = 0; i < nodeCount; i++){
        let type;
        if(floor === 0){
          type = 'combat'; // Start node
        } else if(floor === this.floors - 1){
          type = 'boss'; // Final boss
        } else if(floor % 4 === 0 && floor > 0){
          type = 'rest'; // Rest nodes every 4 floors
        } else {
          // Weighted random for other floors
          const roll = Math.random();
          if(roll > 0.85) type = 'elite';
          else if(roll > 0.70) type = 'treasure';
          else if(roll > 0.60) type = 'rest';
          else type = 'combat';
        }
        
        floorNodes.push({
          id: nodeId++,
          floor: floor,
          position: i,
          type: type,
          visited: false,
          locked: floor > 0,
          connections: []
        });
      }
      
      this.mapNodes.push(floorNodes);
    }
    
    // Create connections between floors
    for(let floor = 0; floor < this.floors - 1; floor++){
      const currentFloor = this.mapNodes[floor];
      const nextFloor = this.mapNodes[floor + 1];
      
      currentFloor.forEach((node, idx) => {
        // Each node connects to 1-3 nodes in next floor
        const nextFloorSize = nextFloor.length;
        
        if(nextFloorSize === 1){
          // If next floor has 1 node, all connect to it
          node.connections.push(nextFloor[0].id);
        } else {
          // Connect to nearby nodes in next floor
          const spread = nextFloorSize > 3 ? 2 : 1;
          const center = Math.floor((idx / currentFloor.length) * nextFloorSize);
          
          for(let i = Math.max(0, center - spread); i <= Math.min(nextFloorSize - 1, center + spread); i++){
            if(Math.random() > 0.3 || node.connections.length === 0){
              node.connections.push(nextFloor[i].id);
            }
          }
        }
      });
    }
    
    // Unlock first floor nodes
    this.mapNodes[0].forEach(node => node.locked = false);
  }

  renderMap(){
    const svg = $("mapSvg");
    svg.innerHTML = '';
    
    const width = 800;
    const height = 600;
    const floorHeight = height / (this.floors + 1);
    
    // Draw connections first (so they appear behind nodes)
    this.mapNodes.forEach((floor, floorIdx) => {
      floor.forEach(node => {
        const x1 = (node.position + 1) * (width / (floor.length + 1));
        const y1 = (floorIdx + 1) * floorHeight;
        
        node.connections.forEach(connId => {
          const targetNode = this.findNodeById(connId);
          if(targetNode){
            const targetFloor = this.mapNodes[targetNode.floor];
            const x2 = (targetNode.position + 1) * (width / (targetFloor.length + 1));
            const y2 = (targetNode.floor + 1) * floorHeight;
            
            // Use simple straight lines instead of curves
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', `map-path ${!targetNode.locked ? 'active' : ''}`);
            svg.appendChild(line);
          }
        });
      });
    });
    
    // Draw nodes
    this.mapNodes.forEach((floor, floorIdx) => {
      floor.forEach(node => {
        const x = (node.position + 1) * (width / (floor.length + 1));
        const y = (floorIdx + 1) * floorHeight;
        
        // Node group
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `map-node ${node.locked ? 'locked' : ''} ${node.visited ? 'visited' : ''} ${this.currentNode === node ? 'current' : ''}`);
        g.setAttribute('data-node-id', node.id);
        
        // Node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 20);
        circle.setAttribute('class', `node-circle ${node.type}`);
        g.appendChild(circle);
        
        // Node icon
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('x', x);
        icon.setAttribute('y', y);
        icon.setAttribute('class', 'node-icon');
        icon.textContent = this.getNodeIcon(node.type);
        g.appendChild(icon);
        
        // Click handler
        if(!node.locked){
          g.style.cursor = 'pointer';
          g.addEventListener('click', () => this.selectNode(node));
          
          // Tooltip handlers
          g.addEventListener('mouseenter', () => this.showMapTooltip(node, x, y));
          g.addEventListener('mouseleave', () => this.hideMapTooltip());
        }
        
        svg.appendChild(g);
      });
    });
  }

  showMapTooltip(node, x, y) {
    const tooltip = $("mapTooltip");
    const labels = {
      combat: 'Combat',
      elite: 'Elite Enemy',
      rest: 'Rest Site',
      treasure: 'Treasure',
      boss: 'Boss Fight'
    };
    tooltip.textContent = labels[node.type] || node.type;
    tooltip.classList.add('show');
    
    // Position tooltip near the node
    const container = $("mapContainer");
    const rect = container.getBoundingClientRect();
    tooltip.style.left = (x + 30) + 'px';
    tooltip.style.top = (y - 10) + 'px';
  }

  hideMapTooltip() {
    const tooltip = $("mapTooltip");
    tooltip.classList.remove('show');
  }

  getNodeIcon(type){
    const icons = {
      combat: '⚔️',
      elite: '👑',
      rest: '🔥',
      treasure: '💰',
      boss: '💀'
    };
    return icons[type] || '?';
  }

  findNodeById(id){
    for(let floor of this.mapNodes){
      for(let node of floor){
        if(node.id === id) return node;
      }
    }
    return null;
  }

  selectNode(node){
    if(node.locked) return;
    
    this.currentNode = node;
    node.visited = true;
    this.currentFloor = node.floor;
    
    // Hide map, show appropriate room
    $("mapView").classList.add('hidden');
    
    // Unlock connected nodes
    node.connections.forEach(connId => {
      const targetNode = this.findNodeById(connId);
      if(targetNode) targetNode.locked = false;
    });
    
    // Handle room type
    this.enterRoom(node.type);
  }

  enterRoom(type){
    $("roomIndex").textContent = this.currentFloor + 1;
    
    if(type === 'combat' || type === 'elite' || type === 'boss'){
      this.startCombat(type);
    } else if(type === 'rest'){
      this.enterRest();
    } else if(type === 'treasure'){
      this.enterTreasure();
    }
  }

  showMap(){
    $("mapView").classList.remove('hidden');
    $("dungeon").classList.add('hidden');
    $("combat").classList.add('hidden');
    this.renderMap();
  }

  nextRoom(){
    if(this.currentFloor === -1 || !this.mapNodes.length){
      // Start run - generate map
      this.generateMap();
      this.currentFloor = -1;
      this.startTime = Date.now();
      this.roomsCleared = 0;
      this.enemiesDefeated = 0;
      this.showMap();
      return;
    }
    // After completing a room, show map for next choice
    this.showMap();
  }

  enterRest(){
    // simple rest: restore some HP and draw and reshuffle one card
    const heal = Math.floor(this.player.maxHp * 0.2);
    this.player.heal(heal);
    this.log(`Rest: healed ${heal} HP.`);
    this.roomsCleared++;
    updateUI();
    // Auto-return to map after short delay
    setTimeout(() => this.showMap(), 1500);
  }

  enterTreasure(){
    // Drop treasure loot
    const treasureLoot = generateLoot('treasure');
    if(treasureLoot.length > 0) {
      this.log(`Found ${treasureLoot.length} treasure item(s)!`);
      this.showLootDrop(treasureLoot);
    } else {
      // Fallback to shop if no items dropped
      this.showShop();
    }
  }

  startCombat(type){
    $("combat").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    
    let baseHp, baseAtk, enemyName;
    if(type === 'boss'){
      baseHp = 80 + rand(20);
      baseAtk = 12 + rand(5);
      enemyName = 'Boss Dragon';
    } else if(type === 'elite'){
      baseHp = 36 + rand(10);
      baseAtk = 8 + rand(4);
      enemyName = 'Elite Warrior';
    } else {
      baseHp = 20 + rand(12);
      baseAtk = 5 + rand(3);
      enemyName = 'Goblin';
    }
    
    this.enemy = new Entity(enemyName, baseHp, baseHp);
    this.enemy.atk = baseAtk;
    
    // Set Pokemon sprites using PokeAPI
    // Player sprite (Pikachu - #25)
    const playerSpriteId = 25;
    const playerSprite = $("playerSprite");
    playerSprite.style.backgroundImage = `url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerSpriteId}.png)`;
    
    // Enemy sprite - random Pokemon based on enemy type
    let enemySpriteId;
    if(type === 'boss'){
      // Boss uses legendary dragons
      const bossPokemon = [6, 149, 150, 383, 384, 483, 484, 487, 643, 644];
      enemySpriteId = bossPokemon[rand(bossPokemon.length)];
    } else if(type === 'elite'){
      // Elite enemies use legendary/mythical Pokemon
      enemySpriteId = ELITE_POKEMON_IDS[rand(ELITE_POKEMON_IDS.length)];
    } else {
      // Normal enemies use common Pokemon from curated list
      enemySpriteId = COMMON_POKEMON_IDS[rand(COMMON_POKEMON_IDS.length)];
    }
    const enemySprite = $("enemySprite");
    enemySprite.style.backgroundImage = `url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${enemySpriteId}.png)`;
    
    this.log(`Encountered ${this.enemy.name} (HP ${this.enemy.hp}, ATK ${this.enemy.atk})`);
    // reset block/energy and draw
    this.player.block = 0;
    this.player.energy = this.player.maxEnergy || 3;
    this.deck.discardHand(); // discard any leftover hand at new combat start
    // draw initial hand
    this.drawToFull();
    updateUI();
  }

  drawToFull(){
    // hand size 5 + bonus draw from equipment
    const handSize = 5 + (this.player.bonusDraw || 0);
    while(this.deck.hand.length < handSize){
      this.deck.draw(1);
    }
    this.log('Drew cards.');
    updateUI();
  }

  playCardFromHand(index){
    const card = this.deck.hand[index];
    if(!card) return;
    if(this.player.energy < card.cost){
      this.log('Not enough energy.');
      return;
    }
    this.player.energy -= card.cost;
    // play effect; provide references: game, owner, target
    // some cards target enemy, some affect owner
    try {
      card.play(this, this.player, this.enemy);
    } catch(e){
      // fallback
      this.log(`Played ${card.name}.`);
    }
    this.deck.playCard(index);
    // check enemy death
    if(this.enemy && this.enemy.hp <= 0){
      this.log(`${this.enemy.name} defeated!`);
      this.endCombat(true);
      return;
    }
    updateUI();
  }

  enemyTurn(){
    if(!this.enemy) return;
    const atk = this.enemy.atk + rand(3);
    const dmg = this.player.takeDamage(atk);
    this.log(`${this.enemy.name} attacks for ${atk} (${dmg} damage after block).`);
    if(this.player.hp <= 0){
      this.showGameOver();
      return;
    }
    updateUI();
  }

  endTurn(){
    // enemy acts
    this.enemyTurn();
    // refresh energy and draw a new hand
    if(this.enemy && this.enemy.hp > 0){
      this.player.energy = this.player.maxEnergy || 3;
      // discard hand after turn
      this.deck.discard.push(...this.deck.hand);
      this.deck.hand = [];
      this.drawToFull();
    }
    updateUI();
  }

  endCombat(victory){
    if(victory){
      const loot = 5 + rand(8);
      this.gold += loot;
      this.log(`Loot: +${loot} gold.`);
      this.roomsCleared++;
      this.enemiesDefeated++;
      
      // Generate item drops based on enemy type
      const enemyType = this.currentNode ? this.currentNode.type : 'combat';
      const droppedItems = generateLoot(enemyType);
      
      // Check if boss was defeated
      if(this.currentNode && this.currentNode.type === 'boss'){
        this.showVictory();
        return;
      }
      
      // Show loot drops if any
      if(droppedItems.length > 0) {
        this.log(`${droppedItems.length} item(s) dropped!`);
        // Clean up combat first
        this.enemy = null;
        $("combat").classList.add('hidden');
        this.deck.discard.push(...this.deck.hand);
        this.deck.hand = [];
        updateUI();
        // Show loot modal
        this.showLootDrop(droppedItems);
        return; // Don't proceed to card rewards yet
      }
      
      // Show card rewards
      this.showCardRewards();
      return; // Don't proceed to next room yet
    } else {
      this.log('Fled or defeated.');
    }
    // clean up
    this.enemy = null;
    $("combat").classList.add('hidden');
    $("nextRoomBtn").disabled = false;
    $("playerArea").style.display = '';
    this.deck.discard.push(...this.deck.hand);
    this.deck.hand = [];
    updateUI();
  }

  showCardRewards(){
    $("combat").classList.add('hidden');
    $("reward").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    
    // Generate 3 random cards to choose from
    const rewards = [];
    for(let i=0; i<3; i++){
      const pool = selectRandomRarityPool();
      const template = pool[rand(pool.length)];
      rewards.push(template);
    }
    
    const rewardsEl = $("cardRewards");
    rewardsEl.innerHTML = '';
    rewards.forEach((template, idx) => {
      const div = document.createElement('div');
      div.className = `card ${template.rarity}`;
      div.setAttribute('data-description', `${template.desc}\n\nCost: ${template.cost} Energy\nRarity: ${template.rarity.toUpperCase()}`);
      div.innerHTML = `<div><span class="title">${template.name}</span><span class="cost">${template.cost}</span></div>
        <div class="small">${template.desc}</div>
        <div class="small" style="margin-top:4px;color:#888">${template.rarity}</div>`;
      div.addEventListener('click', ()=> this.selectReward(template));
      rewardsEl.appendChild(div);
    });
    updateUI();
  }

  selectReward(template){
    // Add the selected card to the deck
    const newCard = createCardWithEffect(template, this);
    this.deck.discard.push(newCard);
    this.log(`Added ${template.name} to your deck!`);
    this.closeRewardScreen();
  }

  skipReward(){
    this.log('Skipped card reward.');
    this.closeRewardScreen();
  }

  closeRewardScreen(){
    $("reward").classList.add('hidden');
    $("combat").classList.add('hidden');
    // Return to map for next choice
    this.showMap();
  }

  showShop(){
    $("shop").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    
    // Generate shop inventory
    const shopItems = [];
    for(let i=0; i<6; i++){
      const pool = selectRandomRarityPool(0.05, 0.15, 0.5); // Slightly higher legendary chance in shop
      const template = pool[rand(pool.length)];
      const price = getCardPrice(template.rarity);
      shopItems.push({...template, price});
    }
    
    const shopEl = $("shopCards");
    shopEl.innerHTML = '';
    shopItems.forEach((item) => {
      const div = document.createElement('div');
      div.className = `card ${item.rarity}`;
      div.setAttribute('data-description', `${item.desc}\n\nCost: ${item.cost} Energy\nRarity: ${item.rarity.toUpperCase()}\nPrice: ${item.price} Gold`);
      const canAfford = this.gold >= item.price;
      div.innerHTML = `<div><span class="title">${item.name}</span><span class="cost">${item.cost}</span></div>
        <div class="small">${item.desc}</div>
        <div class="small" style="margin-top:4px;color:#888">${item.rarity}</div>
        <div style="margin-top:8px;font-weight:700;color:${canAfford?'#ffcc33':'#666'}">${item.price} Gold</div>`;
      if(canAfford){
        div.addEventListener('click', ()=> this.buyCard(item));
      } else {
        div.style.opacity = '0.5';
        div.style.cursor = 'not-allowed';
      }
      shopEl.appendChild(div);
    });
    updateUI();
  }

  buyCard(item){
    if(this.gold < item.price){
      this.log('Not enough gold!');
      return;
    }
    
    this.gold -= item.price;
    const newCard = createCardWithEffect(item, this);
    this.deck.discard.push(newCard);
    this.log(`Purchased ${item.name} for ${item.price} gold!`);
    this.showShop(); // Refresh shop display
  }

  leaveShop(){
    $("shop").classList.add('hidden');
    this.roomsCleared++;
    this.log('Left the shop.');
    // Return to map for next choice
    this.showMap();
  }

  showGameOver(){
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    $("endTitle").textContent = "Defeated!";
    $("endStats").innerHTML = `
      <div>Rooms Cleared: ${this.roomsCleared}/${this.floors}</div>
      <div>Enemies Defeated: ${this.enemiesDefeated}</div>
      <div>Gold Collected: ${this.gold}</div>
      <div>Final Deck Size: ${this.deck.drawPile.length + this.deck.discard.length + this.deck.hand.length}</div>
      <div>Time: ${minutes}m ${seconds}s</div>
    `;
    $("gameOver").classList.remove('hidden');
    $("endTurn").disabled = true;
    $("nextRoomBtn").disabled = true;
  }

  showVictory(){
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    $("endTitle").textContent = "Victory!";
    $("endTitle").style.color = '#3ad29f';
    $("endStats").innerHTML = `
      <div>🎉 You defeated the boss! 🎉</div>
      <div>Rooms Cleared: ${this.roomsCleared}/${this.floors}</div>
      <div>Enemies Defeated: ${this.enemiesDefeated}</div>
      <div>Gold Collected: ${this.gold}</div>
      <div>Final Deck Size: ${this.deck.drawPile.length + this.deck.discard.length + this.deck.hand.length}</div>
      <div>Time: ${minutes}m ${seconds}s</div>
    `;
    $("gameOver").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    this.log("You defeated the boss. Victory!");
  }

  restart(){
    location.reload();
  }

  /* Inventory Management */
  equipItem(item) {
    let slot = item.type;
    
    // Map item types to inventory slots
    if(item.type === 'weapon') {
      // Try to equip in left hand first, then right hand
      if(!this.inventory.leftHand) {
        slot = 'leftHand';
      } else if(!this.inventory.rightHand) {
        slot = 'rightHand';
      } else {
        // Replace left hand if both are full
        slot = 'leftHand';
      }
    } else if(item.type === 'ring') {
      // Try ring1 first, then ring2
      if(!this.inventory.ring1) {
        slot = 'ring1';
      } else if(!this.inventory.ring2) {
        slot = 'ring2';
      } else {
        // Replace ring1 if both are full
        slot = 'ring1';
      }
    }
    // For armor, boots, gloves, necklace, use the type directly as slot
    
    const oldItem = this.inventory[slot];
    
    // Unequip old item if exists
    if(oldItem) {
      this.unapplyItemStats(oldItem);
    }
    
    // Equip new item
    this.inventory[slot] = item;
    this.applyItemStats(item);
    this.log(`Equipped ${item.name}!`);
    this.updateInventoryUI();
    updateUI();
  }

  applyItemStats(item) {
    if(!item || !item.stats) return;
    
    const stats = item.stats;
    if(stats.hp) {
      this.player.maxHp += stats.hp;
      this.player.hp = clamp(this.player.hp + stats.hp, 0, this.player.maxHp);
    }
    if(stats.attack) {
      this.player.baseAttack = (this.player.baseAttack || 0) + stats.attack;
    }
    if(stats.energy) {
      this.player.maxEnergy = (this.player.maxEnergy || 3) + stats.energy;
    }
    if(stats.draw) {
      this.player.bonusDraw = (this.player.bonusDraw || 0) + stats.draw;
    }
  }

  unapplyItemStats(item) {
    if(!item || !item.stats) return;
    
    const stats = item.stats;
    if(stats.hp) {
      this.player.maxHp -= stats.hp;
      this.player.hp = clamp(this.player.hp, 0, this.player.maxHp);
    }
    if(stats.attack) {
      this.player.baseAttack = (this.player.baseAttack || 0) - stats.attack;
    }
    if(stats.energy) {
      this.player.maxEnergy = (this.player.maxEnergy || 3) - stats.energy;
    }
    if(stats.draw) {
      this.player.bonusDraw = (this.player.bonusDraw || 0) - stats.draw;
    }
  }

  updateInventoryUI() {
    const slots = Object.keys(this.inventory);
    
    slots.forEach(slot => {
      const slotEl = $(slot + 'Slot');
      const item = this.inventory[slot];
      
      if(item) {
        slotEl.className = `inv-slot ${item.rarity}`;
        slotEl.innerHTML = `
          <div class="item-icon">
            <div class="item-icon-image">${this.getItemEmoji(item.type)}</div>
            <div class="item-icon-name">${item.name}</div>
          </div>
          <div class="item-rarity-border"></div>
        `;
        slotEl.draggable = true;
        slotEl.ondragstart = (e) => this.handleDragStart(e, slot);
        slotEl.onclick = () => this.unequipItem(slot);
        
        // Tooltip on hover
        slotEl.onmouseenter = (e) => this.showItemTooltip(e, item);
        slotEl.onmouseleave = () => this.hideItemTooltip();
      } else {
        slotEl.className = 'inv-slot empty';
        slotEl.innerHTML = `<div class="slot-icon">${this.getSlotEmoji(slot)}</div>`;
        slotEl.draggable = false;
        slotEl.onclick = null;
        slotEl.onmouseenter = null;
        slotEl.onmouseleave = null;
      }
      
      // Allow dropping on all slots
      slotEl.ondragover = (e) => e.preventDefault();
      slotEl.ondragenter = (e) => {
        e.preventDefault();
        slotEl.classList.add('drag-over');
      };
      slotEl.ondragleave = () => slotEl.classList.remove('drag-over');
      slotEl.ondrop = (e) => this.handleDrop(e, slot);
    });
    
    // Update bonus stats display
    const hasAnyEquipment = Object.values(this.inventory).some(item => item !== null);
    const bonusStatsEl = $("bonusStats");
    
    if(hasAnyEquipment) {
      bonusStatsEl.classList.remove('hidden');
      const totalStats = this.getTotalEquipmentStats();
      $("bonusDisplay").innerHTML = this.formatItemStats(totalStats);
    } else {
      bonusStatsEl.classList.add('hidden');
    }
  }

  getSlotEmoji(slot) {
    return EMOJI_MAP[slot] || '?';
  }

  getItemEmoji(type) {
    return EMOJI_MAP[type] || '❓';
  }

  draggedElement = null;

  handleDragStart(e, fromSlot) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', fromSlot);
    this.draggedElement = e.target;
    e.target.classList.add('dragging');
  }

  handleDrop(e, toSlot) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    const fromSlot = e.dataTransfer.getData('text/plain');
    
    if(fromSlot && fromSlot !== toSlot) {
      // Swap items
      const temp = this.inventory[fromSlot];
      this.inventory[fromSlot] = this.inventory[toSlot];
      this.inventory[toSlot] = temp;
      
      this.updateInventoryUI();
      updateUI();
    }
    
    // Clean up dragging state
    if(this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement = null;
    }
  }

  showItemTooltip(e, item) {
    const tooltip = $("itemTooltip");
    tooltip.classList.remove('hidden');
    
    tooltip.innerHTML = `
      <div class="tooltip-name">${item.name}</div>
      <div class="tooltip-rarity ${item.rarity}">${item.rarity.toUpperCase()}</div>
      <div class="tooltip-stats">${this.formatItemStatsTooltip(item.stats)}</div>
    `;
    
    // Position tooltip
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = (rect.right + 10) + 'px';
    tooltip.style.top = rect.top + 'px';
  }

  hideItemTooltip() {
    const tooltip = $("itemTooltip");
    tooltip.classList.add('hidden');
  }

  formatItemStatsTooltip(stats) {
    const parts = [];
    if(stats.attack) parts.push(`<div class="tooltip-stat">⚔️ ${stats.attack > 0 ? '+' : ''}${stats.attack} Attack</div>`);
    if(stats.hp) parts.push(`<div class="tooltip-stat">❤️ ${stats.hp > 0 ? '+' : ''}${stats.hp} Health</div>`);
    if(stats.energy) parts.push(`<div class="tooltip-stat">⚡ ${stats.energy > 0 ? '+' : ''}${stats.energy} Energy</div>`);
    if(stats.draw) parts.push(`<div class="tooltip-stat">📜 ${stats.draw > 0 ? '+' : ''}${stats.draw} Draw</div>`);
    return parts.join('');
  }

  getTotalEquipmentStats() {
    const total = {attack: 0, hp: 0, energy: 0, draw: 0};
    
    Object.values(this.inventory).forEach(item => {
      if(item && item.stats) {
        if(item.stats.attack) total.attack += item.stats.attack;
        if(item.stats.hp) total.hp += item.stats.hp;
        if(item.stats.energy) total.energy += item.stats.energy;
        if(item.stats.draw) total.draw += item.stats.draw;
      }
    });
    
    return total;
  }

  formatItemStats(stats) {
    const parts = [];
    if(stats.attack) parts.push(`${stats.attack > 0 ? '+' : ''}${stats.attack} ATK`);
    if(stats.hp) parts.push(`${stats.hp > 0 ? '+' : ''}${stats.hp} HP`);
    if(stats.energy) parts.push(`${stats.energy > 0 ? '+' : ''}${stats.energy} Energy`);
    if(stats.draw) parts.push(`${stats.draw > 0 ? '+' : ''}${stats.draw} Draw`);
    return parts.join(', ');
  }

  unequipItem(slot) {
    const item = this.inventory[slot];
    if(!item) return;
    
    this.unapplyItemStats(item);
    this.inventory[slot] = null;
    this.log(`Unequipped ${item.name}.`);
    this.updateInventoryUI();
    updateUI();
  }

  showLootDrop(lootItems) {
    if(!lootItems || lootItems.length === 0) return;
    
    $("lootModal").classList.remove('hidden');
    const lootEl = $("lootItems");
    lootEl.innerHTML = '';
    
    lootItems.forEach(item => {
      const div = document.createElement('div');
      div.className = `loot-item ${item.rarity}`;
      div.innerHTML = `
        <div class="item-name">${item.name}</div>
        <div class="item-stats">${this.formatItemStats(item.stats)}</div>
        <div class="item-rarity ${item.rarity}">${item.rarity}</div>
      `;
      div.addEventListener('click', () => {
        this.equipItem(item);
        div.style.opacity = '0.5';
        div.style.pointerEvents = 'none';
        div.innerHTML += '<div style="margin-top:8px;color:#3ad29f;font-weight:700">✓ Equipped</div>';
      });
      lootEl.appendChild(div);
    });
  }

  closeLootModal() {
    $("lootModal").classList.add('hidden');
    
    // If we're coming from combat (not treasure), show card rewards
    if(this.enemy === null && this.currentNode && this.currentNode.type !== 'treasure') {
      this.showCardRewards();
    } else {
      // Otherwise return to map
      this.showMap();
    }
  }
}

/* UI helpers */
function updateUI(){
  const g = window.G;
  if(!g) return;
  $("gold").textContent = g.gold;
  $("roomIndex").textContent = (g.currentRoom >=0 ? g.currentRoom+1 : 0);
  $("roomCount").textContent = g.roomCount;

  // player stats
  $("playerHp").style.width = (g.player.hp / g.player.maxHp * 100) + '%';
  $("playerHp").style.background = 'linear-gradient(90deg,var(--hp-green),#18b39b)';
  $("playerStats").textContent = `HP: ${g.player.hp}/${g.player.maxHp}  Block: ${g.player.block}`;

  // enemy
  if(g.enemy){
    $("enemyName").textContent = g.enemy.name;
    $("enemyHp").style.width = (g.enemy.hp / g.enemy.maxHp * 100) + '%';
    $("enemyStats").textContent = `HP: ${g.enemy.hp}/${g.enemy.maxHp}  ATK: ${g.enemy.atk}`;
    $("combat").classList.remove('hidden');
  } else {
    $("enemyName").textContent = '';
    $("enemyHp").style.width = '0%';
    $("enemyStats").textContent = '';
    // hide only if not in combat
  }

  // deck counts
  $("deckCount").textContent = g.deck.drawPile.length;
  $("discardCount").textContent = g.deck.discard.length;
  $("energy").textContent = g.player.energy ?? 0;

  // hand UI
  const handEl = $("hand");
  handEl.innerHTML = '';
  g.deck.hand.forEach((c,i) => {
    const div = document.createElement('div');
    div.className = 'card';
    if(c.rarity) div.classList.add(c.rarity);
    div.setAttribute('data-description', `${c.desc}\n\nCost: ${c.cost} Energy${c.rarity ? '\nRarity: ' + c.rarity.toUpperCase() : ''}`);
    div.innerHTML = `<div><span class="title">${c.name}</span><span class="cost">${c.cost}</span></div>
      <div class="small">${c.desc}</div>`;
    div.addEventListener('click', ()=> {
      g.playCardFromHand(i);
    });
    handEl.appendChild(div);
  });
}

/* bootstrap */
window.addEventListener('load', ()=>{
  // Main Menu Handlers
  const mainMenu = $("mainMenu");
  const gameScreen = $("gameScreen");
  const saveManagementScreen = $("saveManagementScreen");
  
  $("newRunBtn").addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    window.G = new Game();
    updateUI();
  });
  
  $("saveManagementBtn").addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    saveManagementScreen.classList.remove('hidden');
  });
  
  $("backToMenuBtn").addEventListener('click', () => {
    saveManagementScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
  });
  
  // Show main menu first
  mainMenu.classList.remove('hidden');
});