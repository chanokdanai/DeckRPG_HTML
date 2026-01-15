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
