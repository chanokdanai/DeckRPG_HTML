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
