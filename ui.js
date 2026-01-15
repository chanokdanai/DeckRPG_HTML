/* UI helpers */
function updateUI(){
  const g = window.G;
  if(!g) return;
  $("gold").textContent = g.gold;
  $("roomIndex").textContent = (g.currentRoom >=0 ? g.currentRoom+1 : 0);
  $("roomCount").textContent = g.roomCount;
  if($("playerLevel")) $("playerLevel").textContent = g.player.level ?? 1;
  if($("playerExp")) $("playerExp").textContent = g.player.exp ?? 0;
  if($("playerExpToLevel")) $("playerExpToLevel").textContent = g.player.expToLevel ?? 0;

  // player stats
  $("playerHp").style.width = (g.player.hp / g.player.maxHp * 100) + '%';
  $("playerHp").style.background = 'linear-gradient(90deg,var(--hp-green),#18b39b)';
  $("playerStats").textContent = `HP: ${g.player.hp}/${g.player.maxHp}  Block: ${g.player.block}`;
  if($("playerAttributes")){
    const attrs = g.player.attributes || {str:0,dex:0,int:0,spd:0};
    $("playerAttributes").textContent = `STR ${attrs.str}  DEX ${attrs.dex}  INT ${attrs.int}  SPD ${attrs.spd}`;
  }
  if($("playerSubStats")){
    const subs = g.player.subAttributes || {resistance:0, critRate:0, critDamage:1.5};
    const resist = Math.round((subs.resistance || 0) * 100);
    const critRate = Math.round((subs.critRate || 0) * 100);
    const critDmg = Math.round((subs.critDamage || 1.5) * 100);
    $("playerSubStats").textContent = `RES ${resist}%  CRIT ${critRate}%  CDMG ${critDmg}%`;
  }

  // enemies
  const enemyList = $("enemyList");
  if(enemyList){
    enemyList.innerHTML = '';
    if(g.enemies && g.enemies.length){
      g.enemies.forEach((enemy, index) => {
        const card = document.createElement('div');
        card.className = 'enemy-card';
        card.dataset.enemyIndex = index;
        if(enemy.hp <= 0){
          card.classList.add('defeated');
        }
        if(index === g.selectedEnemyIndex){
          card.classList.add('selected');
        }
        const hpPercent = enemy.maxHp ? (enemy.hp / enemy.maxHp) * 100 : 0;
        const spriteId = Number.isInteger(enemy.spriteId) && enemy.spriteId > 0 ? enemy.spriteId : 1;
        card.innerHTML = `
          <div class="target-arrow">⬇️</div>
          <div class="sprite" style="background-image:url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png)"></div>
          <div class="enemy-name">${enemy.name}</div>
          <div class="hpbar"><div class="hp" style="width:${hpPercent}%"></div></div>
          <div class="enemy-stats">HP: ${enemy.hp}/${enemy.maxHp} ATK: ${enemy.atk}</div>
        `;
        if(enemy.hp > 0){
          card.addEventListener('click', () => g.selectEnemy(index));
        }
        enemyList.appendChild(card);
      });
      $("combat").classList.remove('hidden');
    }
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
