const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',           // Your database username
  host: 'localhost',          // Your database server address
  database: 'game_player_manager', // Your database name
  password: 'postgres',       // Your password
  port: 5432,                 // Default PostgreSQL port
});

// Function to get games
const getGameById = async (id) => {
  const res = await pool.query(`
    SELECT 
    g.id, 
    g.name, 
    g.date, 
    g.leader_name, 
    g.start_hour, 
    g.end_hour, 
    g.price,
    g.member_price,
    g.low_level, 
    g.image_name,
    g.max_number,
    g.create_line_group,
    g.low_level,
    g.high_level,
    g.is_double,
    g.has_duece,
    g.ball_included,
    g.image_name,
    g.points,
    g.note,
    g.is_perweek,
    g.fix_members,
    g.skip_thisweek,
    g.skip_forever,
    (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS game_start_utc,
    (now() AT TIME ZONE 'Asia/Taipei') AS current_taipei_time,
    COUNT(p.id) AS player_count,
    (now() AT TIME ZONE 'Asia/Taipei') > (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS expired
    FROM games g
    LEFT JOIN players p ON g.id = p.game_id
    WHERE g.id = $1
    GROUP BY g.id
    ORDER BY g.id
  `,[id]);

  console.log(res.rows);
  if (res.rows.length==1)
  {
    return res.rows[0];
  }

  return null; 	    
};

const updateGameById = async (
  id, name, date, leader_name, is_double, points, has_duece, price,
  member_price, ball_included, start_hour, end_hour, max_number,
  low_level, high_level, image_name, note, is_perweek,
  create_line_group, create_line_id, fix_members, skip_thisweek, skip_forever
) => {
  console.log(fix_members);
  try {
    const result = await pool.query(
      `UPDATE games SET
        name = $1,
        date = $2,
        leader_name = $3,
        is_double = $4,
        points = $5,
        has_duece = $6,
        price = $7,
        member_price = $8,
        ball_included = $9,
        start_hour = $10,
        end_hour = $11,
        max_number = $12,
        low_level = $13,
        high_level = $14,
        image_name = $15,
        note = $16,
        is_perweek = $17,
        create_line_group = $18,
        create_line_id = $19,
        fix_members =$20,
        skip_thisweek = $21,
        skip_forever = $22
      WHERE id = $23
      RETURNING *`,
      [
        name, date, leader_name, is_double, points, has_duece, price,
        member_price, ball_included, start_hour, end_hour, max_number,
        low_level, high_level, image_name, note, is_perweek,
        create_line_group, create_line_id, fix_members, skip_thisweek, skip_forever, id
      ]
    );

    // Return the updated row only
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error updating game:', err);
    return null; // or return { error: true, message: err.message };
  }
};



const insertGameById = async(name, date, leader_name, is_double, points, has_duece, price,
  member_price, ball_included, start_hour, end_hour, max_number,
  low_level, high_level, image_name, note, is_perweek,
  create_line_group, create_line_id, fix_members, skip_thisweek, skip_forever)=>{
    try {
      const result = await pool.query(
        `INSERT INTO games (
          name, date, leader_name, is_double, points, has_duece, price,
          member_price, ball_included, start_hour, end_hour, max_number,
          low_level, high_level, image_name, note, is_perweek,
          create_line_group, create_line_id, fix_members, skip_thisweek, skip_forever
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22
        ) RETURNING *`,
        [
          name, date, leader_name, is_double, points, has_duece, price,
          member_price, ball_included, start_hour, end_hour, max_number,
          low_level, high_level, image_name, note, is_perweek,
          create_line_group, create_line_id, fix_members, skip_thisweek, skip_forever
        ]
      );
  
      return result.rows[0]; // return just the inserted game
    } catch (err) {
      console.error('Error inserting game:', err);
      return null;
    }
}

const getGamesByGroupId = async (groupId) => {
  const client = await pool.connect();
  try {
  const res = await pool.query(`
    SELECT 
    g.id, 
    g.name, 
    g.date, 
    g.leader_name, 
    g.start_hour, 
    g.end_hour, 
    g.price,
    g.member_price,
    g.low_level, 
    g.high_level,
    g.max_number,
    g.image_name,
    g.create_line_group,
    g.create_line_id,
    g.is_double,
    g.has_duece,
    g.ball_included,
    g.points,
    g.note,
    g.is_perweek,
    g.fix_members,
    g.skip_thisweek,
    g.skip_forever,
   (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS game_start_utc,
    (now() AT TIME ZONE 'Asia/Taipei') AS current_taipei_time,
    (now() AT TIME ZONE 'Asia/Taipei') > (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS expired
     FROM games g
    WHERE g.create_line_group = $1 and (now() AT TIME ZONE 'Asia/Taipei').date <= g.date
    ORDER BY g.date, g.start_hour
  `,[groupId]);
   console.log(res.rows);
  return res.rows;
} finally {
  client.release();
}
	      
}

// Function to get games
const getGames = async (group_id, month, day, start_h, end_h) => {
  let date = null;
  let result = null;
  if (month && day){
    const now = new Date();
    const year = now.getFullYear();
    date = new Date(year, month-1, day, 0);
    if (start_h & end_h ){
       const res = await pool.query(`
        SELECT 
        g.id, 
        g.name, 
        g.date, 
        g.leader_name, 
        g.start_hour, 
        g.end_hour, 
        g.price,
        g.member_price,
        g.low_level, 
        g.high_level,
        g.max_number,
        g.image_name,
        g.create_line_group,
        g.create_line_id,
        g.is_double,
        g.has_duece,
        g.ball_included,
        g.points,
        g.note,
        g.is_perweek,
        g.fix_members,
        g.skip_thisweek,
        g.skip_forever,
        (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS game_start_utc,
        (now() ) AS current_taipei_time,
         COUNT(p.id) AS player_count,
        (now() ) > (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS expired
        FROM games g
        LEFT JOIN players p ON g.id = p.game_id
        WHERE g.date = $1 and g.start_hour = $2 and g.end_hour = $3 and g.create_line_group = $4 AND (g.date + make_interval(hours => g.start_hour)) > (now() AT TIME ZONE 'Asia/Taipei') AND g.skip_thisweek = FALSE AND g.skip_forever = FALSE
        GROUP BY g.id
        ORDER BY (g.date + (g.start_hour || ' hours')::interval)::timestamptz;
      `,[date.toISOString(),start_h, end_h, group_id]);

      console.log(res.rows);
      return res.rows; 	    
    }else
    {
       const res = await pool.query(`
        SELECT 
        g.id, 
        g.name, 
        g.date, 
        g.leader_name, 
        g.start_hour, 
        g.end_hour, 
        g.price,
        g.member_price,
        g.low_level, 
        g.high_level,
        g.max_number,
        g.image_name,
        g.create_line_group,
        g.create_line_id,
        g.is_double,
        g.has_duece,
        g.ball_included,
        g.points,
        g.note,
        g.is_perweek,
        g.fix_members,
        g.skip_thisweek,
        g.skip_forever,
        (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS game_start_utc,
        (now() AT TIME ZONE 'Asia/Taipei') AS current_taipei_time,
        COUNT(p.id) AS player_count,
        (now() AT TIME ZONE 'Asia/Taipei') > (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS expired
        FROM games g
        LEFT JOIN players p ON g.id = p.game_id
        WHERE g.date = $1 and g.create_line_group = $2 AND (g.date + make_interval(hours => g.start_hour)) > (now() AT TIME ZONE 'Asia/Taipei') AND g.skip_thisweek = FALSE AND g.skip_forever = FALSE
        GROUP BY g.id
        ORDER BY (g.date + make_interval(hours => g.start_hour))::timestamptz;
      `,[date.toISOString(), group_id]);
      return res.rows;
    }
  }
  
  try {
    const res = await pool.query(`
      SELECT 
        g.id, 
        g.name, 
        g.date, 
        g.leader_name, 
        g.start_hour, 
        g.end_hour, 
        g.price,
        g.member_price,
        g.low_level, 
        g.high_level,
        g.max_number,
        g.image_name,
        g.create_line_group,
        g.create_line_id,
        g.is_double,
        g.has_duece,
        g.ball_included,
        g.points,
        g.note,
        g.is_perweek,
        g.fix_members,
        g.skip_thisweek,
        g.skip_forever,
        (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS game_start_utc,
        (now() AT TIME ZONE 'Asia/Taipei') AS current_taipei_time,
        COUNT(p.id) AS player_count,
        (now() AT TIME ZONE 'Asia/Taipei') > (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS expired
        FROM games g
        LEFT JOIN players p ON g.id = p.game_id
        WHERE g.create_line_group = $1 
        AND (g.date + make_interval(hours => g.start_hour)) > (now() AT TIME ZONE 'Asia/Taipei') AND g.skip_thisweek = FALSE AND g.skip_forever = FALSE
        GROUP BY g.id
        ORDER BY (g.date + make_interval(hours => g.start_hour))::timestamptz;
    `,[group_id]);
    return res.rows;
  } catch (err) {
    console.error('Error querying games:', err);
    throw err;
  }
};

// Function to get players
const getPlayers = async () => {
  try {
    const res = await pool.query(`
      SELECT 
        id, 
        name, 
        game_id 
      FROM players  ORDER BY id
    `);
    return res.rows;
  } catch (err) {
    console.error('Error querying players:', err);
    throw err;
  }
};

async function getGameWithPlayers(gameId) {
  const client = await pool.connect();
  try {
    const gameResult = await client.query(`SELECT g.id, 
        g.id, 
        g.name, 
        g.date, 
        g.leader_name, 
        g.start_hour, 
        g.end_hour, 
        g.price,
        g.member_price,
        g.low_level, 
        g.high_level,
        g.max_number,
        g.image_name,
        g.create_line_group,
        g.create_line_id,
        g.is_double,
        g.has_duece,
        g.ball_included,
        g.points,
        g.note,
        g.is_perweek,
        (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS game_start_utc,
        (now() AT TIME ZONE 'Asia/Taipei') AS current_taipei_time,
        (now() AT TIME ZONE 'Asia/Taipei') > (g.date + (g.start_hour || ' hours')::interval)::timestamptz AS expired
       FROM games g WHERE id = $1 `, [gameId]);
    const playerResult = await client.query('SELECT * FROM players WHERE game_id = $1  ORDER BY id',[gameId]);

    console.log(gameResult.rows);
    //console.log(playerResult.rows);

    if (gameResult.rows.length === 0) {
      return null;
    }

    const game = gameResult.rows[0];
    game.players = playerResult.rows.map(p => ({
      id: p.id,
      name: p.name
    }));
    console.log(game);
    return game;
  } finally {
    client.release();
  }
}

async function getPlayersOfGame(gameId) {
  const client = await pool.connect();
  try {
    const playerResult = await client.query('SELECT * FROM players WHERE game_id = $1 ORDER BY id', [gameId]);
    console.log(playerResult.rows.length);	  
    return playerResult;
  } finally {
    client.release();
  }
}

async function filter(players, name){
  const matchedPlayers=[];

  for (let i = 0; i < players.length; i++) {
console.log("1==>",players[i].name );
console.log("2==>",name );
    if (players[i].name == name)
    {  
      matchedPlayers.push(players[i]);
      console.log("Case1");
    }
    else{
      let str2 = name+'   ';
      if (players[i].name.substring(0, str2.length-1) == str2.substring(0,str2.length-1)) {
        matchedPlayers.push(players[i]);
        console.log("Case2");
      } 
    }
  }
  console.log("matchedPlayers=", matchedPlayers)
  return matchedPlayers;
}
async function joinGame(gameId, userName, lineNickName, lineUserId, count) {
  const client = await pool.connect();
  let okList = [];
  let standbyList = [];
  let usedUserName = "";
  console.log("joinGame :",gameId," ", userName, " ",lineNickName, " ", count);
  try {
    const gameResult = await client.query('SELECT * FROM games WHERE id = $1  ORDER BY id', [gameId]);
    if (!gameResult || gameResult.rows.length === 0) {
      return [false, -1, null, null];
    }

    const game = gameResult.rows[0];

    let playerResult = await client.query('SELECT * FROM players WHERE game_id = $1 ORDER BY id', [gameId]);
    //console.log("playerResult=",playerResult.rows);
    const existingPlayerCount = playerResult.rows.length;

    // Filter matching players
    let matchedPlayers = await filter(playerResult.rows, userName);
    console.log("match=",matchedPlayers);
    console.log("existingPlayerCount=",existingPlayerCount);
    console.log("count=",count);
    console.log("game.max_number=",game.max_number);
    if ((existingPlayerCount+ count) > (game.max_number+4)){
      console.log(`Checking limit: ${existingPlayerCount} + ${count} = ${existingPlayerCount + count}, allowed: ${game.max_number + 4}`);
      return [false, -2, null, null];
    }
    
    console.log(`Checking limit: ${existingPlayerCount} + ${count} = ${existingPlayerCount + count}, allowed: ${game.max_number + 4} ,matched_count= ${matchedPlayers.length}`);
 
    console.log("joinGame 179: userName=",userName);  
    for (let i = 0; i < count; i++) {
      let newIndex = i + matchedPlayers.length+1;
      let allIndex = i + existingPlayerCount+ 1
      if (newIndex== 1){
        usedUserName = userName ;
      }
      else{
      usedUserName = userName + "   --" +(newIndex).toString();
      }
      console.log("joinGame 187: usedUserName=",usedUserName);  

      const insertResult = await client.query(
        'INSERT INTO players (name, joined_by, joined_by_user_id, game_id) VALUES ($1, $2, $3, $4)',
        [usedUserName, lineNickName, lineUserId, gameId]
      );

      if (existingPlayerCount + i + 1 <= game.max_number) {
        okList.push(`${allIndex}. ${usedUserName}`);
      } else {
        standbyList.push(`${allIndex-game.max_number}. ${usedUserName}`);
      }
    }

    return [true, 0, okList, standbyList];
  } finally {
    client.release();
  }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');  // Escape special characters
}

async function leaveGame(gameId, userName, lineNickName, count) {
  const client = await pool.connect();
  let okList = [];
  let standbyList = [];
  let upList = [];

  try {
    const gameResult = await client.query('SELECT * FROM games WHERE id = $1 ORDER BY id', [gameId]);
    if (!gameResult || gameResult.rows.length === 0) {
      console.log("No game matched");
      return [false, -1, null, null, null];
    }

    const game = gameResult.rows[0];

    let playerResult = await client.query('SELECT * FROM players WHERE game_id = $1 ORDER BY id', [gameId]);
    //console.log("playerResult=",playerResult.rows);
    // Regex to match userName with optional digits
    
    console.log("userName=", userName);
    let matchedPlayers = await filter(playerResult.rows, userName);
    if (matchedPlayers.length < count) {
      return [false, -2, null, null, null];
    }

    let players = playerResult.rows;
    // Remove matching players from end to preserve index integrity
    for (let i = players.length - 1; i >= 0 && count > 0; i--) {
      const player = players[i];
      const hit = await filter([player], userName);
      if (hit.length==1){
        await client.query('DELETE FROM players WHERE id = $1', [player.id]);
        players.splice(i, 1);
        count--;
        console.log("i=",i," game.max_number=",game.max_number);
        if (i < game.max_number) {
          okList.push(`${i+1}. ${player.name}`);

          console.log("playerResult.rows.length=",players.length," game.max_number=",game.max_number);
          // Promote someone from standby if needed
          if (players.length >= game.max_number){
            let upname = players[game.max_number - 1].name;
            let upline = players[game.max_number - 1].joined_by;
            let uplineUserid = players[game.max_number - 1].joined_by_user_id;
            console.log("upname=",upname, " upline=",upline);
            if (upline == null) {
              upline ="noline";
              uplineUserid ="000000000";
            }
            upList.push([upname, upline?upline:"", uplineUserid?uplineUserid:""]);
            console.log("upList.push ", [players[game.max_number - 1].name, players[game.max_number - 1].joined_by, players[game.max_number - 1].joined_by_user_id]);
            console.log(upList.length);
          }
        } else {
          standbyList.push(`${i+1-game.max_number}. ${player.name}`);
        }
      }  
    }

    return [true, 0, okList, standbyList, upList];
  } catch (err) {
    console.error('Error in leaveGame:', err);
    return [false, -99, null, null, null];
  } finally {
    client.release();
  }
}


async function removeGameById(gameId) {
  const client = await pool.connect();
  try {
    const gameResult = await client.query('DELETE FROM games WHERE id = $1;', [gameId]);
    if (gameResult.rowCount > 0) {
      console.log('Delete successful!');
    } else {
      console.log('No record found with that ID. Nothing was deleted.');
    }
    return gameResult.rowCount; 

  } catch (err) {
    console.error('Error in leaveGame:', err);
    return 0;
  } finally {
    client.release();
  } 
}   

module.exports = {
  updateGameById,insertGameById,
  getGames,
  getGameById,
  getGamesByGroupId,
  getPlayers,
  getGameWithPlayers,
  getPlayersOfGame,
  joinGame,
  leaveGame,
  removeGameById	
};
