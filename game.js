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
        const actual = target.takeDamage(atkDmg);
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
        const actual = target.takeDamage(12);
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
        const actual = target.takeDamage(16);
        g.log(`${owner.name} bashes for ${actual} damage!`);
      };
      break;
    case 'powerStrike':
      playFn = (g,owner,target) => {
        const actual = target.takeDamage(15);
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
        const actual = target.takeDamage(20);
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
        const actual = target.takeDamage(8);
        owner.heal(actual);
        g.log(`${owner.name} reaps ${actual} damage and heals for ${actual}!`);
      };
      break;
    case 'execute':
      playFn = (g,owner,target) => {
        const actual = target.takeDamage(18);
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
        const actual = target.takeDamage(25);
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
        const actual = target.takeDamage(10);
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
    this.roomCount = 8 + rand(5);
    this.currentRoom = -1;
    this.gold = 0;
    this.startTime = Date.now();
    this.roomsCleared = 0;
    this.enemiesDefeated = 0;
    this.setupUI();
    this.resetPlayer();
    this.makeDeck();
    this.log("Welcome to DeckRPG! Click Start Run to generate a dungeon.");
    $("roomCount").textContent = this.roomCount;
  }

  setupUI(){
    $("nextRoomBtn").addEventListener('click', ()=> this.nextRoom());
    $("endTurn").addEventListener('click', ()=> this.endTurn());
    $("drawBtn").addEventListener('click', ()=> { this.drawToFull(); updateUI(); });
    $("skipReward").addEventListener('click', ()=> this.skipReward());
    $("leaveShop").addEventListener('click', ()=> this.leaveShop());
    $("restartBtn").addEventListener('click', ()=> this.restart());
  }

  resetPlayer(){
    this.player = new Entity("You", 50, 50);
    this.player.energy = 3;
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

  generateDungeon(){
    this.rooms = [];
    for(let i=0;i<this.roomCount;i++){ 
      // weighted: mostly combat, some rest and treasure
      const roll = Math.random();
      let type = 'combat';
      if(roll > 0.88) type = 'elite';
      else if(roll > 0.78) type = 'treasure';
      else if(roll > 0.68) type = 'rest';
      this.rooms.push({ index: i, type });
    }
  }

  nextRoom(){
    if(this.currentRoom === -1){
      // start run
      this.generateDungeon();
      this.currentRoom = -1;
      this.startTime = Date.now();
      this.roomsCleared = 0;
      this.enemiesDefeated = 0;
      $("nextRoomBtn").textContent = 'Enter Next Room';
      $("nextRoomBtn").classList.add('primary');
    }
    this.currentRoom++;
    if(this.currentRoom >= this.roomCount){
      this.showVictory();
      return;
    }
    $("roomIndex").textContent = this.currentRoom + 1;
    const room = this.rooms[this.currentRoom];
    $("roomInfo").textContent = `Room ${this.currentRoom +1 }: ${room.type.toUpperCase()}`;
    if(room.type === 'combat' || room.type==='elite'){
      this.startCombat(room.type);
    } else if(room.type === 'rest'){
      this.enterRest();
    } else if(room.type === 'treasure'){
      this.enterTreasure();
    } else {
      this.log('Empty room.');
    }
  }

  enterRest(){
    // simple rest: restore some HP and draw and reshuffle one card
    const heal = Math.floor(this.player.maxHp * 0.2);
    this.player.heal(heal);
    this.log(`Rest: healed ${heal} HP.`);
    this.roomsCleared++;
    updateUI();
  }

  enterTreasure(){
    // Show shop with cards for purchase
    this.showShop();
  }

  startCombat(type){
    $("combat").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    const baseHp = type==='elite' ? 36 + rand(10) : 20 + rand(12);
    const baseAtk = type==='elite' ? 8 + rand(4) : 5 + rand(3);
    this.enemy = new Entity(type==='elite' ? 'Elite' : 'Goblin', baseHp, baseHp);
    this.enemy.atk = baseAtk;
    
    // Set Pokemon sprites using PokeAPI
    // Player sprite (Pikachu - #25)
    const playerSpriteId = 25;
    const playerSprite = $("playerSprite");
    playerSprite.style.backgroundImage = `url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerSpriteId}.png)`;
    
    // Enemy sprite - random Pokemon based on enemy type
    let enemySpriteId;
    if(type === 'elite'){
      // Elite enemies use stronger Pokemon (150-200 range)
      enemySpriteId = 150 + rand(51);
    } else {
      // Normal enemies use common Pokemon (1-100 range, avoiding potential gaps)
      const commonPokemon = [1,4,7,10,13,16,19,23,25,27,29,32,35,37,39,41,43,46,48,50,52,54,56,58,60,63,66,69,72,74,77,79,81,84,86,88,90,92,95,98];
      enemySpriteId = commonPokemon[rand(commonPokemon.length)];
    }
    const enemySprite = $("enemySprite");
    enemySprite.style.backgroundImage = `url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${enemySpriteId}.png)`;
    
    this.log(`Encountered ${this.enemy.name} (HP ${this.enemy.hp}, ATK ${this.enemy.atk})`);
    // reset block/energy and draw
    this.player.block = 0;
    this.player.energy = 3;
    this.deck.discardHand(); // discard any leftover hand at new combat start
    // draw initial hand
    this.drawToFull();
    updateUI();
  }

  drawToFull(){
    // hand size 5
    const handSize = 5;
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
      this.player.energy = 3;
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
    this.enemy = null;
    $("nextRoomBtn").disabled = false;
    this.deck.discard.push(...this.deck.hand);
    this.deck.hand = [];
    updateUI();
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
    $("nextRoomBtn").disabled = false;
    this.roomsCleared++;
    this.log('Left the shop.');
    updateUI();
  }

  showGameOver(){
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    $("endTitle").textContent = "Defeated!";
    $("endStats").innerHTML = `
      <div>Rooms Cleared: ${this.roomsCleared}/${this.roomCount}</div>
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
      <div>🎉 You conquered the dungeon! 🎉</div>
      <div>Rooms Cleared: ${this.roomCount}/${this.roomCount}</div>
      <div>Enemies Defeated: ${this.enemiesDefeated}</div>
      <div>Gold Collected: ${this.gold}</div>
      <div>Final Deck Size: ${this.deck.drawPile.length + this.deck.discard.length + this.deck.hand.length}</div>
      <div>Time: ${minutes}m ${seconds}s</div>
    `;
    $("gameOver").classList.remove('hidden');
    $("nextRoomBtn").disabled = true;
    this.log("You reached the end of the dungeon. Victory!");
  }

  restart(){
    location.reload();
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
  window.G = new Game();
  updateUI();

  // make hand clickable by delegating to Game.playCardFromHand
  // (already wired up)
});