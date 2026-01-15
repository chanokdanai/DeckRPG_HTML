/* Combat helpers */
Game.prototype.startCombat = function(type){
  $("combat").classList.remove('hidden');
  $("nextRoomBtn").disabled = true;
  
  const enemyCount = type === 'boss' ? 1 : (type === 'elite' ? 3 : 2);
  this.enemies = [];
  this.currentCombatType = type;
  for(let i = 0; i < enemyCount; i++){
    const enemy = this.createEnemy(type, i, enemyCount);
    this.enemies.push(enemy);
  }
  this.selectedEnemyIndex = 0;
  this.enemy = this.enemies[0] || null;
  this.lastCardId = null;

  // Player sprite (selected class or fallback to Pikachu - #25)
  const playerSpriteId = this.playerSpriteId || 25;
  const playerSprite = $("playerSprite");
  playerSprite.style.backgroundImage = `url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerSpriteId}.png)`;

  this.log(`Encountered ${this.enemies.length} ${type} ${this.enemies.length !== 1 ? 'enemies' : 'enemy'}.`);
  // reset block/energy and draw
  this.player.block = 0;
  this.player.energy = this.player.maxEnergy || 3;
  this.deck.discardHand(); // discard any leftover hand at new combat start
  // draw initial hand
  this.drawToFull();
  updateUI();
};

Game.prototype.createEnemy = function(type, index, total){
  let baseHp, baseAtk, enemyName;
  if(type === 'boss'){
    baseHp = 80 + rand(20);
    baseAtk = 12 + rand(5);
    enemyName = 'Boss Dragon';
  } else if(type === 'elite'){
    baseHp = 30 + rand(12);
    baseAtk = 7 + rand(4);
    enemyName = 'Elite Warrior';
  } else {
    baseHp = 18 + rand(12);
    baseAtk = 5 + rand(3);
    enemyName = 'Goblin';
  }

  const enemy = new Entity(enemyName, baseHp, baseHp);
  enemy.atk = baseAtk;
  let enemySpriteId;
  if(type === 'boss'){
    const bossPokemon = [6, 149, 150, 383, 384, 483, 484, 487, 643, 644];
    enemySpriteId = bossPokemon[rand(bossPokemon.length)];
  } else if(type === 'elite'){
    enemySpriteId = ELITE_POKEMON_IDS[rand(ELITE_POKEMON_IDS.length)];
  } else {
    enemySpriteId = COMMON_POKEMON_IDS[rand(COMMON_POKEMON_IDS.length)];
  }
  enemy.spriteId = enemySpriteId;
  if(total > 1){
    enemy.name = `${enemy.name} ${index + 1}`;
  }
  return enemy;
};

Game.prototype.getAliveEnemies = function(){
  return this.enemies.filter(enemy => enemy.hp > 0);
};

Game.prototype.getSelectedEnemy = function(){
  if(!this.enemies.length) return null;
  let selected = this.enemies[this.selectedEnemyIndex];
  if(!selected || selected.hp <= 0){
    const aliveIndex = this.enemies.findIndex(enemy => enemy.hp > 0);
    if(aliveIndex === -1) return null;
    this.selectedEnemyIndex = aliveIndex;
    selected = this.enemies[aliveIndex];
  }
  this.enemy = selected;
  return selected;
};

Game.prototype.selectEnemy = function(index){
  if(!this.enemies[index] || this.enemies[index].hp <= 0) return;
  this.selectedEnemyIndex = index;
  this.enemy = this.enemies[index];
  updateUI();
};

Game.prototype.isComboReady = function(comboFrom){
  if(!comboFrom || !comboFrom.length) return false;
  return comboFrom.includes(this.lastCardId);
};

Game.prototype.getUniqueDamageBonus = function(cardTemplate, options = {}){
  let bonus = 0;
  Object.values(this.inventory).forEach((item) => {
    if(!item || item.rarity !== 'unique' || !item.uniqueEffect) return;
    if(item.uniqueEffect.type === 'aoe_bonus' && options.isAoe){
      bonus += item.uniqueEffect.bonus || 0;
    }
    if(item.uniqueEffect.type === 'combo_bonus' && options.isCombo){
      bonus += item.uniqueEffect.bonus || 0;
    }
  });
  return bonus;
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
  const target = this.getSelectedEnemy();
  try {
    card.play(this, this.player, target);
  } catch(e){
    // fallback
    this.log(`Played ${card.name}.`);
  }
  this.deck.playCard(index);
  this.lastCardId = card.id;
  // check enemy death
  const aliveEnemies = this.getAliveEnemies();
  if(aliveEnemies.length === 0){
    this.log(`All enemies defeated!`);
    this.endCombat(true);
    return;
  }
  this.getSelectedEnemy();
  updateUI();
};

Game.prototype.applyDamage = function(target, amount, source, options = {}){
  if(!target) return {actual:0, crit:false};
  let finalAmount = amount;
  let crit = false;
  if(source === this.player){
    const critRate = this.player.subAttributes?.critRate || 0;
    const critDamage = this.player.subAttributes?.critDamage || 1.5;
    if(Math.random() < critRate){
      crit = true;
      finalAmount = Math.round(finalAmount * critDamage);
    }
  }
  if(target === this.player){
    const resist = this.player.subAttributes?.resistance || 0;
    finalAmount = Math.round(finalAmount * (1 - resist));
  }
  const actual = target.takeDamage(finalAmount);
  if(actual > 0){
    if(target === this.player) {
      this.showDamageNumber("player", actual);
    } else {
      const index = this.enemies.indexOf(target);
      this.showDamageNumber("enemy", actual, index);
    }
  }
  return {actual, crit};
};

const DAMAGE_FLOAT_TIMEOUT_MS = 1000;

Game.prototype.showDamageNumber = function(targetType, amount, enemyIndex){
  let targetEl;
  if(targetType === "player"){
    targetEl = $("playerArea");
  } else {
    targetEl = document.querySelector(`.enemy-card[data-enemy-index="${enemyIndex}"]`);
  }
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
  const aliveEnemies = this.getAliveEnemies();
  if(!aliveEnemies.length) return;
  for(const enemy of aliveEnemies){
    const atk = enemy.atk + rand(3);
    const result = this.applyDamage(this.player, atk, enemy);
    this.log(`${enemy.name} attacks for ${atk} (${result.actual} damage after block).`);
    if(this.player.hp <= 0){
      this.showGameOver();
      return;
    }
  }
  updateUI();
};

Game.prototype.endTurn = function(){
  // enemy acts
  this.enemyTurn();
  // refresh energy and draw a new hand
  if(this.getAliveEnemies().length > 0){
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
    const enemyCount = this.enemies.length || 1;
    const loot = 5 + rand(8);
    this.gold += loot;
    this.log(`Loot: +${loot} gold.`);
    updateUI();
    this.roomsCleared++;
    this.enemiesDefeated += enemyCount;
    const expBase = this.currentCombatType === 'boss' ? 30 : (this.currentCombatType === 'elite' ? 18 : 12);
    const expGain = expBase * enemyCount;
    this.gainExperience(expGain);
    this.log(`Gained ${expGain} EXP.`);
    
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
      this.enemies = [];
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
  this.enemies = [];
  this.currentCombatType = null;
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
