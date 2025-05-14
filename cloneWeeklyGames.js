// testPoolConnect.js
const { Pool } = require('pg');
const dayjs = require('dayjs');
const axios = require('axios');
const { channelAccessToken, channelSecret } = require('./config');

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',           // Your database username
  host: 'localhost',          // Your database server address
  database: 'game_player_manager', // Your database name
  password: 'postgres',       // Your password
  port: 5432,                 // Default PostgreSQL port
});

const config = {
  channelAccessToken,
  channelSecret,
};

function formatGameTitle(game) {
  const date = new Date(game.date);
  const weekday = ['日','一','二','三','四','五','六'][date.getDay()];
  return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}(${weekday}) ${game.start_hour}-${game.end_hour}`;
}
async function testConnection() {
  const client = await pool.connect();
  try {
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const nextWeek = dayjs().add(6, 'day').format('YYYY-MM-DD'); // yesterday + 7 days
  console.log(`yesterday: ${yesterday}`)
  const gamesRes = await pool.query(`
    SELECT * FROM games
    WHERE date = $1 AND skip_forever = false
  `, [yesterday]);

    console.log(yesterday);
    if (gamesRes.rows.count > 0){
      console.log(`yesterday's games: ${gamesRes.rows}`);
    }else{
      console.log(`yesterday's games: none`);
    }

     for (const game of gamesRes.rows) {
    const existsRes = await pool.query(`
      SELECT 1 FROM games
      WHERE name = $1 AND start_hour = $2 AND end_hour = $3 AND date = $4
      LIMIT 1
    `, [game.name, game.start_hour, game.end_hour, nextWeek]);

    if (existsRes.rowCount === 0) {
      const newGame = { ...game, date: nextWeek };
      delete newGame.id; // remove id to let SERIAL generate new
      newGame.skip_thisweek = false; // <-- Force skip_thisweek to be false
      const keys = Object.keys(newGame);
      const values = Object.values(newGame);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const insertRes = await pool.query(`
        INSERT INTO games (${keys.join(', ')})
        VALUES (${placeholders})
        RETURNING id
      `, values);

      const newGameId = insertRes.rows[0].id;

      if (game.fix_members) {
        const names = game.fix_members
          .split(/[\s,]+/)
          .map(name => name.trim())
          .filter(name => name.length > 0);

        for (const name of names) {
          const insertResult = await pool.query(
            'INSERT INTO players (name, joined_by, joined_by_user_id, game_id) VALUES ($1, $2, $3, $4)',
            [name, newGame.leader_name, newGame.create_line_id, newGameId]
          );
        }
      }

      console.log(`Created new game on ${nextWeek} with id ${newGameId}`);
      flexMessage = {
        type: 'text',
        text: '',
      };

      console.log(`gouopid=${newGame.create_line_group}`);

      flexMessage.text = `${newGame.name} 主揪:${game.leader_name}\n${formatGameTitle(game)} 開放報名～`; //目前報名:${new_number}/${game.max_number}`;
      try {
        const response = await axios.post('https://api.line.me/v2/bot/message/push', {
          to: newGame.create_line_group,
          messages: [flexMessage]
        }, {
          headers: {
            'Authorization': `Bearer ${config.channelAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        if (err.response?.status === 429) {
          console.error('Rate limit exceeded. Please try again later.');
        } else {
          console.error('Request failed:', err);
        }
      }
           
    } else {
      console.log(`Game already exists on ${nextWeek} for ${game.name}`);
    }
  }
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    await client.release(); // Close all connections if you're done
  }
}

testConnection();
