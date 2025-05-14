const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',           // Your database username
  host: 'localhost',          // Your database server address
  database: 'game_player_manager', // Your database name
  password: 'postgres',       // Your password
  port: 5432,                 // Default PostgreSQL port
});

// Sample Chinese names
const chineseNames = [
  '王大明', '李小華', '張美麗', '林大志', '陳小芳',
  '黃中正', '周文強', '吳志偉', '楊秀慧', '鄭義仁',
  '謝忠豪', '賴宜君', '簡承恩', '邱育文', '馮佩真',
  '何玉珍', '鍾文亮', '洪信豪', '曾怡君', '唐偉哲',
  '呂秀蓮', '潘俊傑', '廖芳儀', '范宗憲', '羅文山',
  '高美蘭', '章佳蓉', '鍾宜憶', '游天佑', '藍毓芳',
  '謝佳真', '郭俊佑', '黎志民', '詹雅婷', '韓政毅',
  '江昀潔', '戴宇翔', '蘇芷若', '丁建安', '尤佩怡',
  '廖志鴻', '曾國城', '林志玲', '黃品源', '鄧紫棋'
];

// Get a random item from array
function randFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate players for each game
async function insertPlayers() {
  try {
    for (let gameId = 1; gameId <= 10; gameId++) {
      const playerCount = Math.floor(Math.random() * 31) + 10; // 10–40 players
      const leader = randFromArray(chineseNames);

      for (let i = 0; i < playerCount; i++) {
        const name = randFromArray(chineseNames);
        const joinedBy = Math.random() < 0.7 ? leader : randFromArray(chineseNames); // 70% by leader
        const autoRejoin = Math.random() < 0.5;
        const paiedByLine = Math.random() < 0.5;

        await pool.query(
          `INSERT INTO players (name, game_id, auto_rejoin, paied_by_line, joined_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [name, gameId, autoRejoin, paiedByLine, joinedBy]
        );
      }

      console.log(`Inserted ${playerCount} players for game ${gameId}`);
    }

    await pool.end();
    console.log('All players inserted successfully.');
  } catch (err) {
    console.error('Error inserting players:', err);
  }
}

// Generate players for each game
async function alterGameGroup() {
  try {
    for (let gameId = 1; gameId <= 5; gameId++) {

        await pool.query(
          `UPDATE games SET create_line_group = $1 WHERE id = $2`,
          ['C909a9438c14ebe6762b0fa29f283c6a5', gameId]
	);

    }

    await pool.end();
    console.log('All players inserted successfully.');
  } catch (err) {
    console.error('Error inserting players:', err);
  }
}

async function alter() {
  try {
        await pool.query(
          `ALTER TABLE  games RENAME COLUMN max_numbers TO max_number;`
        );

    await pool.end();
    console.log('All players inserted successfully.');
  } catch (err) {
    console.error('Error inserting players:', err);
  }
}
//insertPlayers();
//alterGameGroup();
alter();
