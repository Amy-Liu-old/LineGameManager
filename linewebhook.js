const express = require('express');
const path = require('path');
const line = require('@line/bot-sdk');
const { channelAccessToken, channelSecret } = require('./config');
const {removeGameById, updateGameById,insertGameById, getGamesByGroupId, joinGame, leaveGame, getPlayersOfGame, getGameWithPlayers,  getGameById, getGames, getPlayers } = require('./db'); // Your db functions
//const background = require("/webhook/public/assets/poster.jpg");
const normalizeAndCheck = require('./parseMessage');
const app = express();
const port = process.env.PORT || 3001;

const axios = require('axios');
//const { sendMentionMessage } = require('./send_taguser_msg');

//app.use(express.json());
const { Client } = require('@line/bot-sdk');
// LINE config
const config = {
  channelAccessToken,
  channelSecret,
};

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});



app.get('/webhook/api/gameinfo/:gameId', async (req, res) => {
  const gameId = req.params.gameId;
  console.log("app.get/webhook/api/gameinfo/:gameId: get gameinfo=", gameId)
  try {
    const game = await getGameWithPlayers(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    console.log('Get fame:', game);
    res.status(200).json(game);
  } catch (error) {
    console.error('Error fetching game info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


async function getNickName(groupId, userId){
  try {
    const response = await axios.get(`https://api.line.me/v2/bot/group/${groupId}/member/${userId}`, {
      headers: {
        Authorization: `Bearer ${config.channelAccessToken}`,
      },
    });
    console.log(response.data.displayName);
    return response.data.displayName;
  }catch (err){
    console.log("Failed to get groupNickName for user");
    return "unnamedUser";
  }
}


async function createGame(event, res, client, groupId, userId, nickName){

      flexMessage = {

        type: 'flex',
        altText: '開團',
        contents: {
          type: 'carousel',
          contents: [{
            type: 'bubble',
              hero: {
                type: 'image',
                url: 'https://www.lifevocloud.com/webhook/assets/createGame.png',
                size: 'full',
                aspectRatio: '10:5',
                aspectMode: 'cover',
                backgroundColor: '#AFEA37'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                { type: 'text', text: `點選下方連結開團`, weight: 'bold', size: 'md' },
              ],
            },
            footer: {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  action: {
                          type: 'uri',
                          label: '開團',
                          uri: `https://liff.line.me/1657304004-NPlZynwM?create=1&groupId=${groupId}`
                  },
                },
              ],
            },
          }],
        },
      };

    await client.replyMessage(event.replyToken, flexMessage);
    res.sendStatus(200);
}

async function viewGame(event, res, client, groupId, userId, nickName){

  flexMessage = {

    type: 'flex',
    altText: '開團',
    contents: {
      type: 'carousel',
      contents: [{
        type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://www.lifevocloud.com/webhook/assets/createGame.png',
            size: 'full',
            aspectRatio: '10:5',
            aspectMode: 'cover',
            backgroundColor: '#AFEA37'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: `點選下方連結開團`, weight: 'bold', size: 'md' },
          ],
        },
        footer: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'button',
              style: 'primary',
              action: {
                      type: 'uri',
                      label: '開團',
                      uri: `https://liff.line.me/1657304004-NPlZynwM?create=2&groupId=${groupId}`
              },
            },
          ],
        },
      }],
    },
  };

await client.replyMessage(event.replyToken, flexMessage);
res.sendStatus(200);
}



const levelMap = {
  1: "新手階",
  2: "新手階",
  3: "新手階",
  4: "初階",
  5: "初階",
  6: "初中階",
  7: "初中階",
  8: "中階",
  9: "中階",
  10: "中進階",
  11: "中進階",
  12: "中進階",
  13: "高階",
  14: "高階",
  15: "高階",
  16: "職業級",
  17: "職業級",
  18: "職業級"
};


function formatLevelRange(low, high) {
  const lowText = levelMap[low];
  const highText = levelMap[high];

  if (lowText && highText) {
    return low === high ? lowText : `${lowText} ~ ${highText}`;
  } else if (lowText) {
    return lowText;
  } else if (highText) {
    return highText;
  } else {
    return "不限"; // or "未知程度"
  }
}

// LINE middleware for webhook
app.post('/webhook', line.middleware(config), async (req, res) => {
  const events = req.body.events;
  const client = new line.Client(config);

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      let replyMessages=[];
      const userMessage = event.message.text;
      // In your bot's webhook code
      const groupId = event.source.groupId;
      const userId = event.source.userId;
      const nickName = await getNickName(groupId, userId);
      console.log(nickName);
      const parseResult = normalizeAndCheck(userMessage);

      if (parseResult && parseResult.pattern_id == 4){
        //Handle create team ....
        createGame(event, res, client, groupId, userId, nickName);
        return;
      }

      if (parseResult){	
        const userName = (!parseResult.name || parseResult.name.trim() === "") ? nickName : parseResult.name.trim();
        let games = await getGames(groupId, parseResult.month, parseResult.day, parseResult.start_h, parseResult.end_h);
        console.log("Line 173:userName=",userName," nickName=", nickName,"groupId=", groupId);     
        console.log(parseResult);
        // Prepare a Flex Message or a Carousel based on DB
        //const players = await getPlayers();
	      console.log(games);

        if (games.length == 1 && parseResult.pattern_id != 1)
        {
          console.log(`[DEBUG] userName at line XX: "${userName}"`);
          const game = games[0];
          const players = await getPlayersOfGame(game.id);
          const playerCount = players.rows.length;
          const curUserNum = players.rows.filter(player => player.name === userName).length;
          let new_number = 0;
          let offset = 0;
          let success = 0;
          let standby = 0;
          let sortUpList = null;
          flexMessage = {
                  type: 'text',
                  text: '',
                };
          let noticeMessage = null;
          //join/leve directly
          if (parseResult.pattern_id == 2)
          {
            [success, code, okList, standbyList] = await joinGame(game.id, userName, nickName, userId, parseResult.count);

            if (success) {
              console.log("Join success:", { okList, standbyList});
              new_number = playerCount + parseResult.count;
              flexMessage.text = `${game.name} \n${formatGameTitle(game)} `; //目前報名:${new_number}/${game.max_number}`;
              //flexMessage.text += `\n${userName}報名${parseResult.count}人`;
              if (okList.length > 0)
              {
                flexMessage.text += `\n報名成功：`;
                for (const ok of okList) {
                  flexMessage.text += `\n  ${ok}`;
                }
              }
              if (standbyList.length > 0)
              {
                flexMessage.text += `\n候補成功：`;
                for (const standby of standbyList) {
                  flexMessage.text += `\n  候補${standby}`;
                }
              }
            } else {
              console.log("Join failed, code:", code);
              if (code == -1){
                flexMessage.text = `查無場次！`;
              }else if (code == -2){
                flexMessage.text = `${userName}報名人數已超過候補上限,請調整人數！`;
              }else if (code == -3){

              }
            }
            /*
            if (new_number == game.max_number){
              flexMessage.text += `\n\n該團目前已報名:${game.max_number}`;
            }else if (new_number > game.max_number){
              flexMessage.text += `\n\n該團目前已報名:${game.max_number}, 後補:${new_number -game.max_number}`;
            }else {
              flexMessage.text += `\n\n該團目前已報名:${new_number}`;
            }
             */ 
          }
          else if (parseResult.pattern_id == 3)
          {
            const [success, code, okList, standbyList, upList] = await leaveGame(game.id, userName, nickName, parseResult.count);

            if (success) {
              new_number = playerCount - parseResult.count;
              console.log("Leave success:", { okList, standbyList, upList });
              flexMessage.text = `${game.name} \n${formatGameTitle(game)}`;// 目前報名:${new_number}/${game.max_number}`;
              //flexMessage.text += `\n${userName}已取消報名${parseResult.count}人`;
              flexMessage.text += `\n取消成功：`;
              if (okList.length > 0)
              {
                for (const ok of okList.slice().reverse()) {
                  flexMessage.text += `\n  ${ok}`;
                }
              }
              if (standbyList.length > 0)
              {
                for (const standby of standbyList.slice().reverse()) {
                  flexMessage.text += `\n  候補${standby}`;
                }
              }
              
              sortUpList = upList;
              //sorting based on line_User_id
              sortUpList.sort((a, b) => a[2] - b[2]);

            } else {
              console.log("Leave failed, code:", code);
              if (code == -1){
                flexMessage.text = `查無場次！`;
              }else if (code == -2){
                if (parseResult.count ==1 )
                {
                  flexMessage.text = `${userName}目前沒有報名！`;
                }else {
                  flexMessage.text = `${userName}目前沒報名這麼多喔！請確認再試！`;
                }
              }else if (code == -3){
              }
            }
            /*
            if (new_number == game.max_number){
              flexMessage.text += `\n\n該團目前已報名:${game.max_number}`;
            }else if (new_number > game.max_number){
              flexMessage.text += `\n\n該團目前已報名:${game.max_number}, 後補:${new_number -game.max_number}`;
            }else {
              flexMessage.text += `\n\n該團目前已報名:${new_number}`;
            }
            */
          }

          flexMessage.text += '\n查詢詳細報名狀況請輸入 ??';
          replyMessages.push(flexMessage);
          await client.replyMessage(event.replyToken, replyMessages);
          res.sendStatus(200);
          return;

          /*
          if (sortUpList && sortUpList.length > 0)
          {
              let notice_name = "";
              let notice_nickname="";
              let notice_name_list = "";
              let notice_user_id = "";
              console.log("sortUpList=",sortUpList);
              for (let i = 0; i < sortUpList.length; i++) {
                [notice_name, notice_nickname, notice_user_id] = sortUpList[i];
                name_list = notice_name;
                while ((i + 1) < sortUpList.length){
                    let [notice_name1, notice_nickname1, notice_user_id1] = sortUpList[i+1];
                    if (notice_user_id1 == notice_user_id){
                        name_list +=","+notice_name1+'\n';
                        i=i+1;
                    }
                    else{
                      break;
                    }
                }
                console.log("i=",i,"name_list=",name_list);
                if (name_list.length >0)
                {//Send a message
                  console.log("groupid=",groupId," ",notice_user_id,", ",notice_nickname, `請留意候補 ${name_list} 已報名成功`);
                  //await sendMentionMessage(groupId, user_id, nickname, `請留意您的候補 ${name_list} 已改為報名成功`);
                  const mentionText = `@${notice_nickname}`;
                  console.log("/",notice_user_id,"/",notice_user_id.length);

                  const message = {
                    type: 'text',
                    text: `${mentionText}\n請留意候補 \n${name_list} 已報名成功`,
                    mention: {
                      mentionees: [{
                        index: 0,
                        length: mentionText.length + 1,
                        userId: notice_user_id
                      }]
                    }
                  };
                  replyMessages.push(message);
                  name_list = "";
                }
              }  
          }
          */
        }
        if (parseResult.pattern_id == 2 || parseResult.pattern_id == 3)
        {
          /*
          flexMessage = {
            type: 'text',
            text: '',
          };
          flexMessage.text = '目前有多團需指定場次';
          flexMessage.text += '\nEx: +1@5/16,9-12\nEx: -1@6/7,14-17';
          flexMessage.text += '\n或輸入 ?? 以選取報名場次';
          replyMessages.push(flexMessage);
          await client.replyMessage(event.replyToken, replyMessages);
          res.sendStatus(200);
          return;
          */
          viewGame(event, res, client, groupId, userId, nickName);
          return;
        }
    



        const bubbles = await Promise.all (games.map(async game => {
        console.log("gameid="+game.id);	
        const players = await getPlayersOfGame(game.id);
        const playerCount = players.rows.length;
        const state=`gameId=${game.id}&groupId=${groupId}`;

        let joinState=``;
     /*   if (playerCount>= game.max_number) {
          joinState =`已報名${playerCount},候補${playerCount-game.max_number}`;
        }else {
          joinState =`已報名${playerCount},尚有${game.max_number-playerCount}`;
        }
     */
        if (game.member_price == 0 || game.member_price == null ||game.member_price == game.price){
          joinState += `  $:${game.price} `;
        }else{
          joinState += `  $:${game.price} 會員$:${game.member_price}`;
        }
        const levelState = `程度:${formatLevelRange(game.low_level, game.high_level)}`;
        console.log("after gameid="+game.id+" count:"+playerCount); 
	      return {
            type: 'bubble',
              hero: {
                type: 'image',
                url: 'https://www.lifevocloud.com/webhook/assets/joinGame.png',
                size: 'full',
                aspectRatio: '10:5',
                aspectMode: 'cover',
                backgroundColor: '#AFEA37'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                { type: 'text', text: `${game.name} 主揪:${game.leader_name}`, weight: 'bold', size: 'md' },
                { type: 'text', text: formatGameTitle(game), weight: 'bold', size: 'md' },
                { type: 'text', text: levelState, weight: 'bold', size: 'md' },
                { type: 'text', text: joinState, size: 'sm' },
              ],
            },
            footer: {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  action: {
                          type: 'uri',
                          label: 'Join / Detail',
                          uri: `https://liff.line.me/1657304004-NPlZynwM?gameId=${game.id}&groupId=${event.source.groupId}`
                  },
                },
              ],
            },
          };
       }));

        if (bubbles && bubbles.length > 0) {
        /*  if (replyMessages.length == 0){
            titleMessage = {
              type: "text",
              text: "🏸歡迎點選報名："
            };

            replyMessages.push(titleMessage);
          }*/
          flexMessage = {

            type: 'flex',
            altText: '報名暢打',
            contents: {
              type: 'carousel',
              contents: bubbles,
            },
          };
          console.log(flexMessage);	
        } else {
          flexMessage = {
            type: 'text',
            text: '目前該時段沒開場或已過報名時間喔！',
          };
        }

        replyMessages.push(flexMessage);
        await client.replyMessage(event.replyToken, replyMessages);
      }
    }
 }

  res.sendStatus(200);
});



app.use(express.json());
app.post('/webhook/api/join/:id', async (req, res) => {
  const gameId = req.params.id;           // Get the ID from the URL
  const { nickName, count, userName, userId, groupId } = req.body;

  if (!groupId) return res.status(400).send("Group ID missing");
  console.log(`groupid=${groupId}`)

  console.log(`[DEBUG] userName at line XX: ${userName}`);
  const game = await getGameById(gameId);
  if (game==null)
  {
    //Send error message
    res.status(400).send("Group ID missing");
    return;
  }  

  joinLeaveGame(res, true , game, nickName, userName, userId, count, groupId);

});

app.post('/webhook/api/leave/:id', async (req, res) => {
  console.log(`/webhook/api/leave/:id`);
  // Remove player from DB
  const gameId = req.params.id;           // Get the ID from the URL
  const { nickName, count, userName, userId, groupId } = req.body;

  if (!groupId) return res.status(400).send("Group ID missing");
  console.log(`groupid=${groupId}`)

  console.log(`[DEBUG] userName at line XX: ${userName}`);
  const game = await getGameById(gameId);
  if (game==null)
  {
    //Send error message
    return;
  }  

  
  joinLeaveGame(res, false , game, nickName, userName, userId, count, groupId);

});

app.get('/webhook/api/games', async (req, res) => {
  console.log(`/webhook/api/games`);
  console.log('Query Parameters:', req.query);


  const groupId = req.query['groupId'];
  if (!groupId) return res.status(400).send("Group ID missing");
  console.log(`groupid=${groupId}`)
  try{
    const games = await getGamesByGroupId(groupId);
    console.log(games);
    res.json(games || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }

});

app.post('/webhook/api/remove_game/:id', async (req, res) => {
  const id = req.params.id;
  const result = await removeGameById(id);

    if (result == 0) {
      res.status(500).json({ error: 'Delete failed' });
    }
    else {
      res.status(201);
      console.log('delete ok');
    }

});

app.post('/webhook/api/games', async (req, res) => {
  const {
    name, date, leader_name, is_double, points, has_duece, price,
    member_price, ball_included, start_hour, end_hour, max_number,
    low_level, high_level, image_name, note, is_perweek,
    create_line_group, create_line_id, fix_members, skip_thisweek, skip_forever
  } = req.body;

  const newGame = await insertGameById(name, date, leader_name, is_double, points, has_duece, price,
    member_price, ball_included, start_hour, end_hour, max_number,
    low_level, high_level, image_name, note, is_perweek,
    create_line_group, create_line_id,fix_members, skip_thisweek, skip_forever);


    if (!newGame) {
      res.status(500).json({ error: 'Insert failed' });
    }
    else {
      res.status(201).json(newGame);
      console.log(newGame);
      // Create fix memebers for this game
      const names = fix_members.trim().split(/\s+/).filter(Boolean);
      for (const userName of names) {
        await joinGame(gameId, userName, userName, create_line_id, count);
        console.log(`joinGame - ${userName}`);
      }
    }

});

// Update existing game
app.put('/webhook/api/games/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name, date, leader_name, is_double, points, has_duece, price,
    member_price, ball_included, start_hour, end_hour, max_number,
    low_level, high_level, image_name, note, is_perweek,
    create_line_group, create_line_id, fix_members, skip_thisweek, skip_forever
  } = req.body;

  console.log(req.body);

  updateGame = await updateGameById(id, name, date, leader_name, is_double, points, has_duece, price,
    member_price, ball_included, start_hour, end_hour, max_number,
    low_level, high_level, image_name, note, is_perweek,
    create_line_group, create_line_id, fix_members, skip_thisweek, skip_forever);

      if (!updateGame) {
        res.status(500).json({ error: 'Update failed' });
      }
      else {
        res.status(201).json(updateGame);
      }
});



// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Test route (optional)
app.get('/webhook/', (req, res) => {
  console.log('Query Parameters:', req.query);
  const liffState = req.query['liff.state'];
  const create = req.query['create'];
  if (liffState )
  {
    console.log(liffState);

    const params = new URLSearchParams(liffState);
    const create = params.get('create');
    const groupId = params.get('groupId');

    if (create)
      {  
        if (create ==1 ){
        console.log("game_scheduler.html");
        res.sendFile(path.join(__dirname, 'public', 'game_scheduler.html'));
        }else if (create ==2){
          console.log("game_list.html");
          res.sendFile(path.join(__dirname, 'public', 'game_list.html'));         
        }
      }else{
        console.log("index.html");
        res.sendFile(path.join(__dirname, 'public', 'index.html'));    
      }
  }else{
    if (create)
      {  
        if (create ==1) {
          console.log("game_scheduler.html");
          res.sendFile(path.join(__dirname, 'public', 'game_scheduler.html'));
          }else if (create ==2){
            console.log("game_list.html");
            res.sendFile(path.join(__dirname, 'public', 'game_list.html'));         
          }
      }else{
        console.log("index.html");
        res.sendFile(path.join(__dirname, 'public', 'index.html'));    
      }
  }  
 
});


app.use('/webhook', 
  express.static(path.join(__dirname, 'public'))
);

/*  

app.use('/webhook', async (req,res) => {
  console.log(`/webhook [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  //express.static(path.join(__dirname, 'public'))
    // Use logic here if you want to serve different pages.
    
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});  
*/
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Helper to format game date nicely
function formatGameTitle(game) {
  const date = new Date(game.date);
  const weekday = ['日','一','二','三','四','五','六'][date.getDay()];
return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}(${weekday}) ${game.start_hour}-${game.end_hour}`;
  }
function formatGamePrice(game){
  if (game.price == game.member_price){
	  return `$${Math.round(game.price)}`;
  }
  else {
	  return `$${Math.round(game.price)} - 會員$${Math.round(game.member_price)}`;
  }
}

async function joinLeaveGame(res, join, game, nickName, userName, userId, count, groupId)
{
  const client = new line.Client(config);
  let replyMessages=[];
  const players = await getPlayersOfGame(game.id);
  const playerCount = players.rows.length;
  const curUserNum = players.rows.filter(player => player.name === userName).length;
  if (game){
  console.log(game);
  }
  let new_number = 0;
  let offset = 0;
  let success = 0;
  let standby = 0;
  let sortUpList = null;
  let result = 0;
  flexMessage = {
          type: 'text',
          text: '',
        };
  let noticeMessage = null;

  if (join==1){
    [success, code, okList, standbyList] = await joinGame(game.id, nickName, userName,  userId, count);
    result = code;
    if (success) {
      console.log("Join success:", { okList, standbyList});
      new_number = playerCount + count;
      flexMessage.text = `${game.name} \n${formatGameTitle(game)}`;
      if (okList.length > 0)
        {
          flexMessage.text += `\n報名成功：`;
          for (const ok of okList) {
            flexMessage.text += `\n  ${ok}`;
          }
        }
        if (standbyList.length > 0)
        {
          flexMessage.text += `\n候補成功：`;
          for (const standby of standbyList) {
            flexMessage.text += `\n  候補${standby}`;
          }
        }
      /*if ( count > 1){
        flexMessage.text += `\n共${count}人`;
      }*/
      /*
      if (new_number == game.max_number){
        flexMessage.text += `\n\n該團目前報名:${game.max_number}`;
      }else if (new_number > game.max_number){
        flexMessage.text += `\n\n該團目前報名:${game.max_number}, 後補:${new_number -game.max_number}`;
      }else {
        flexMessage.text += `\n\n該團目前報名:${new_number}`;
      }*/
    } else {
      console.log("Join failed, code:", code);
      if (code == -1){
        flexMessage.text = `查無場次或已過報名時間！`;
      }else if (code == -2){
        flexMessage.text = `${userName}報名人數已超過候補上限,請調整人數！`;
      }else if (code == -3){
      }
    }
  }  
  else{
    const [success, code, okList, standbyList, upList] = await leaveGame(game.id,  nickName, userName,count);
    result = code;
    if (success) {
      new_number = playerCount - count;
      console.log("Leave success:", { okList, standbyList, upList });
      flexMessage.text = `${game.name} \n${formatGameTitle(game)}`;

      flexMessage.text += `\n取消成功：`;
      if (okList.length > 0)
      {
        for (const ok of okList.slice().reverse()) {
          flexMessage.text += `\n  ${ok}`;
        }
      }
      if (standbyList.length > 0)
      {
        for (const standby  of standbyList.slice().reverse()) {
          flexMessage.text += `\n  候補${standby}`;
        }
      }
      /*
      if ( count > 1){
        flexMessage.text += `\n共取消${count}人`;
      }
      if (new_number == game.max_number){
        flexMessage.text += `\n\n該團目前報名:${game.max_number}`;
      }else if (new_number > game.max_number){
        flexMessage.text += `\n\n該團目前報名:${game.max_number}, 後補:${new_number -game.max_number}`;
      }else {
        flexMessage.text += `\n\n該團目前報名:${new_number}`;
      }
        */
      
      console.log("flexMessage.text=", flexMessage.text);
      sortUpList = upList;
      //sorting based on line_User_id
      sortUpList.sort((a, b) => a[2] - b[2]);
      console.log("flexMessage.text2=", flexMessage.text);
    } else {
      console.log("Leave failed, code:", code);
      if (code == -1){
        flexMessage.text = `查無場次！`;
      }else if (code == -2){
        if (count ==1 )
        {
          flexMessage.text = `${userName}目前沒有報名！`;
        }else {
          flexMessage.text = `${userName}目前沒報名這麼多喔！請確認再試！`;
        }
      }else if (code == -3){

      }
    }
  }
  
  //flexMessage.text += '\n查詢詳細報名狀況請輸入??';

  if ( result  < 0)
  {  
    //return to LIFF app
    return res.json({
      success: true,
      message: flexMessage.text
    });
    //If error found, just response to LIFF app and return
    
  }else {
    res.json({
      success: true,
      message: flexMessage.text
    });
    //Let continue to send message in group chat to indicate changes
  
  }

  replyMessages.push(flexMessage);
  /*
  if (sortUpList && sortUpList.length > 0)
  {
      let notice_name = "";
      let notice_nickname="";
      let notice_name_list = "";
      let notice_user_id = "";
      console.log("sortUpList=",sortUpList);
      for (let i = 0; i < sortUpList.length; i++) {
        [notice_name, notice_nickname, notice_user_id] = sortUpList[i];
        name_list = notice_name;
        while ((i + 1) < sortUpList.length){
            let [notice_name1, notice_nickname1, notice_user_id1] = sortUpList[i+1];
            if (notice_user_id1 == notice_user_id){
                name_list +=","+notice_name1;
                i=i+1;
            }
            else{
              break;
            }
        }
        console.log("i=",i,"name_list=",name_list);
        if (name_list.length >0)
        {//Send a message
          console.log("groupid=",groupId," ",notice_user_id,", ",notice_nickname, `請留意候補 ${name_list} 已報名成功`);
          //await sendMentionMessage(groupId, user_id, nickname, `請留意您的候補 ${name_list} 已改為報名成功`);
          const mentionText = `@${notice_nickname}`;
          console.log("/",notice_user_id,"/",notice_user_id.length);

          const message = {
            type: 'text',
            text: `${mentionText} 請留意候補\n ${name_list} 已報名成功`,
            mention: {
              mentionees: [{
                index: 0,
                length: mentionText.length + 1,
                userId: notice_user_id
              }]
            }
          };
          replyMessages.push(message);
          name_list = "";
        }
      }  
  }

  const games = await getGames(groupId, null, null, null, null);
  const bubbles = await Promise.all (games.map(async game => {
    console.log("gameid="+game.id);	
    const players = await getPlayersOfGame(game.id);
    const playerCount = players.rows.length;
    const state=`gameId=${game.id}&groupId=${groupId}`;
    let joinState=``;
    if (playerCount>= game.max_number) {
      joinState =`已報名${playerCount},候補${playerCount-game.max_number}`;
    }else {
      joinState =`已報名${playerCount},尚有${game.max_number-playerCount}`;
    }

    if (game.member_price == 0 || game.member_price == null ||game.member_price == game.price){
      joinState += `  $:${game.price} `;
    }else{
      joinState += `  $:${game.price} 會員$:${game.member_price}`;
    }
    const levelState = `程度:${formatLevelRange(game.low_level, game.high_level)}`;
    console.log("after gameid="+game.id+" count:"+playerCount); 
    return {
        type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://www.lifevocloud.com/webhook/assets/joinGame.png',
            size: 'full',
            aspectRatio: '20:5',
            aspectMode: 'cover',
            backgroundColor: '#AFEA37'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: `${game.name} 主揪:${game.leader_name}`, weight: 'bold', size: 'md' },
            { type: 'text', text: formatGameTitle(game), weight: 'bold', size: 'md' },
            { type: 'text', text: levelState, weight: 'bold', size: 'md' },
            { type: 'text', text: joinState, size: 'sm' },
          ],
        },
        footer: {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'button',
              style: 'primary',
              action: {
                      type: 'uri',
                      label: 'Join / Detail',
                      uri: `https://liff.line.me/1657304004-NPlZynwM?gameId=${game.id}&groupId=${groupId}`
              },
            },
          ],
        },
      };
   }));

    if (bubbles && bubbles.length > 0) {
      titleMessage = {
        type: "text",
        text: "🏸歡迎點選報名："
      };

      replyMessages.push(titleMessage);
      flexMessage = {

        type: 'flex',
        altText: 'Choose a game',
        contents: {
          type: 'carousel',
          contents: bubbles,
        },
      };
      console.log(flexMessage);	
    } else {
      flexMessage = {
        type: 'text',
        text: '目前該時段沒開場喔！',
      };
    }

    replyMessages.push(flexMessage);

  */
  try {
    const response = await axios.post('https://api.line.me/v2/bot/message/push', {
      to: groupId,
      messages: replyMessages
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

  
  return; 

}