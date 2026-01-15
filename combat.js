/* Combat helpers */
Game.prototype.startCombat = function(type){
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
  // Player sprite (selected class or fallback to Pikachu - #25)
  const playerSpriteId = this.playerSpriteId || 25;
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
};

Game.prototype.drawToFull = function(){
  // hand size 5 + bonus draw from equipment
  const handSize = 5 + (this.player.bonusDraw || 0);
  while(this.deck.hand.length < handSize){
    this.deck.draw(1);
  }
  this.log('Drew cards.');
  updateUI();
};

Game.prototype.playCardFromHand = function(index){
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
};

Game.prototype.applyDamage = function(target, amount){
  const actual = target.takeDamage(amount);
  if(actual > 0){
    if(target === this.enemy) {
      this.showDamageNumber("enemy", actual);
    } else if(target === this.player) {
      this.showDamageNumber("player", actual);
    }
  }
  return actual;
};

const DAMAGE_FLOAT_TIMEOUT_MS = 1000;

Game.prototype.showDamageNumber = function(targetType, amount){
  const targetEl = $(targetType === "player" ? "playerArea" : "enemyArea");
  if(!targetEl) return;
  const floatEl = document.createElement('div');
  floatEl.className = 'damage-float';
  floatEl.textContent = `-${amount}`;
  targetEl.appendChild(floatEl);
  const cleanup = () => {
    if(floatEl.parentNode) {
      floatEl.remove();
    }
  };
  floatEl.addEventListener('animationend', cleanup);
  setTimeout(cleanup, DAMAGE_FLOAT_TIMEOUT_MS);
};

Game.prototype.enemyTurn = function(){
  if(!this.enemy) return;
  const atk = this.enemy.atk + rand(3);
  const dmg = this.applyDamage(this.player, atk);
  this.log(`${this.enemy.name} attacks for ${atk} (${dmg} damage after block).`);
  if(this.player.hp <= 0){
    this.showGameOver();
    return;
  }
  updateUI();
};

Game.prototype.endTurn = function(){
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
};

Game.prototype.endCombat = function(victory){
  if(victory){
    const loot = 5 + rand(8);
    this.gold += loot;
    this.log(`Loot: +${loot} gold.`);
    updateUI();
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
};

Game.prototype.showCardRewards = function(){
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
};

Game.prototype.selectReward = function(template){
  // Add the selected card to the deck
  const newCard = createCardWithEffect(template, this);
  this.deck.discard.push(newCard);
  this.log(`Added ${template.name} to your deck!`);
  this.closeRewardScreen();
};

Game.prototype.skipReward = function(){
  this.log('Skipped card reward.');
  this.closeRewardScreen();
};

Game.prototype.closeRewardScreen = function(){
  $("reward").classList.add('hidden');
  $("combat").classList.add('hidden');
  // Return to map for next choice
  this.showMap();
};

Game.prototype.showGameOver = function(){
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
};

Game.prototype.showVictory = function(){
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
};
