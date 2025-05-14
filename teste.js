function escapeRegex(str) {
  return str.replace(/[.*+?^=!:${}()|[\]\\]/g, '\\$&');
}

const userName = 'WWW';
const regex = new RegExp(`^${escapeRegex(userName)}\\s{3}--\\d+$`);
console.log("Regex used:", regex);

// Sample test data
const playerNames = [
  { name: 'WWW   -1' },
  { name: 'WWW   2' },
  { name: 'WWW   --3' },
  { name: 'WWW (1)' },
  { name: 'WWW   (12)' },
];

const matchedPlayers = playerNames.filter(player => regex.test(player.name));
console.log("Matched Players: ", matchedPlayers);
