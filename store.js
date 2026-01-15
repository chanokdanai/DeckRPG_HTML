/* Store helpers */
Game.prototype.showShop = function(){
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
};

Game.prototype.buyCard = function(item){
  if(this.gold < item.price){
    this.log('Not enough gold!');
    return;
  }
  
  this.gold -= item.price;
  const newCard = createCardWithEffect(item, this);
  this.deck.discard.push(newCard);
  this.log(`Purchased ${item.name} for ${item.price} gold!`);
  this.showShop(); // Refresh shop display
};

Game.prototype.leaveShop = function(){
  $("shop").classList.add('hidden');
  this.roomsCleared++;
  this.log('Left the shop.');
  // Return to map for next choice
  this.showMap();
};
