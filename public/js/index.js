// Helper function for logging to both console and screen
function log(msg) {
  const el = document.getElementById('debugLog');
  if (el) el.textContent += msg + '\n';
  console.log(msg); // Fallback to console
}

let gameId = null;

/*
function renderPlayerList(data) {
  const players = data.players;
  const grid = document.getElementById('playerGrid');
  grid.innerHTML = '';

  players.forEach((name, index) => {
    const li = document.createElement('li');
    log(`${index}  ${data.max_number}`);
    if (index < data.max_number){
      li.textContent = `${index + 1}. ${p.name}`;
    }else{
      li.textContent = `候補${index + 1-data.max_number}. ${p.name}`;
    }
    grid.appendChild(li);
  });
}
*/

function renderSplitPlayers(data) {
  const players = data.players;
  const total = players.length;
  const max = data.max_number;

  const leftEl = document.getElementById('leftPlayers');
  const rightEl = document.getElementById('rightPlayers');
  leftEl.innerHTML = '';
  rightEl.innerHTML = '';

  const mid = Math.ceil((max+4) / 2);
  const leftList = players.slice(0, mid);
  const rightList = players.slice(mid);
 

  const rowCount = Math.max(leftList.length, mid);
  //log(`${mid} ${leftList.length} ${rightList.length} ${rowCount}`);
  for (let i = 0; i < rowCount; i++) {
    let index = i;
    // Left side
    const leftLi = document.createElement('li');
    const leftPlayer = leftList[i];
    if (leftPlayer) {

      leftLi.className =  "regular";
      leftLi.textContent = `${index + 1}. ${leftPlayer.name}`;
    }else {
      leftLi.className =  "regular";
      leftLi.textContent = `${index + 1}. `;
    } 
    //log(`${index+1}`);
    leftEl.appendChild(leftLi);

    // Right side
    const rightLi = document.createElement('li');
    const rightPlayer = rightList[i];
    index = i + mid;
    if (rightPlayer) {
      if (index < max) {
        rightLi.className =  "regular";
        rightLi.textContent = `${index + 1}. ${rightPlayer.name}`;
      } else {
        rightLi.className =  "standby";
        rightLi.textContent = `候補${index + 1 - max}. ${rightPlayer.name}`;
      }
    } else {
      if (index < max) {
        rightLi.className =  "regular";
        rightLi.textContent = `${index + 1}. `;
      }else {
        rightLi.className =  "standby";
        rightLi.textContent = `候補${index + 1 - max}. `;
      }
    }
    //log(`${index+1}`);
    rightEl.appendChild(rightLi);
  }
}

async function fetchGameInfo(gameId) {
  try {
    log(`Fetching game info for gameId: ${gameId}`);
    const res = await fetch(`/webhook/api/gameinfo/${gameId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    log(`Fetched data: ${JSON.stringify(data)}`);
    document.getElementById('gameName').textContent =  data.name+ `  (主揪：${data.leader_name})`;
    log(`gameName`);
    document.getElementById('gameTitle').textContent = formatGameTitle(data);
    log(`gameTitle`);
    document.getElementById('gameDetail').textContent = formatGamePrice(data)+`  `+formatGameDetail(data);

    document.getElementById('gameMemo').innerHTML = (data.note ?? "").replace(/\n/g, "<br>");
    log(`data.expired=${data.expired}`);
    if (data.expired) {
      document.getElementById('inputs').style.display = 'none';
      document.getElementById('joinBtn').style.display = 'none';
      document.getElementById('leaveBtn').style.display = 'none';
    } else {
      document.getElementById('joinBtn').style.display = 'block';
      document.getElementById('leaveBtn').style.display = 'block';
    }
    renderSplitPlayers(data);


  } catch (err) {
    log('Error fetching game info: ' + err.message);
  }
}


function formatGameTitle(game) {
  const date = new Date(game.date);
  const weekday = ['日','一','二','三','四','五','六'][date.getDay()];
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}(${weekday})  ${game.start_hour}:00-${game.end_hour}:00   ${formatGameＬevel(game.low_level, game.high_level)}`;
}


function formatGamePrice(game){
  let detail="";
  if (game.price == null){
    detail = `＄未決定`;
  }
  else{
    if (game.member_price==0 || game.member_price== null || game.price == game.member_price){
      detail = `$${Math.round(game.price)}`;
    }
    else {
      detail = `$${Math.round(game.price)} - 會員$${Math.round(game.member_price)}`;
    }
  }

  if (game.ball_included){
    detail+=`(含球)`;
  }else{
    detail+=`(不含球)`;
  }
  return detail;
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


function formatGameＬevel(low, high) {
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


function formatGameDetail(game) {
  let detail = "";
  if (game.is_double){
    detail +=`雙打`;
  }else{
    detail +=`單打`;
  }
  if (game.points){
    detail+= `,${game.points}分`;
  }

  if (game.has_duece){
    detail+= `,有duece`;
  }else{
    detail+= `,無duece`;
  }
  return detail;
}

// Called after LIFF init
function setGameIdAndFetch(stateParam) {
  let gameId = null;
  let groupId = null;
  if (stateParam) {
    // LIFF context state (used when launched via liff:// URL with state)
    const params = new URLSearchParams(stateParam);
    gameId = params.get("gameId");
    groupId = params.get("groupId");	  
    console.log("Parsed gameId from liff.state: " + gameId+ ',groupid='+ groupId);
  }

  if (!gameId) {
    // Fallback: parse from window.location.search
    const searchParams = new URLSearchParams(window.location.search);
    gameId = searchParams.get("gameId") || searchParams.get("liff.state")?.replace("?gameId=", "");
    groupId = searchParams.get("groupId") || searchParams.get("liff.state")?.replace("&groupId=", "");  
    log("Parsed gameId from URL search: " + gameId +" ,groupIdi= "+groupId);
    window.groupId = groupId;
  }

  if (gameId) {
    fetchGameInfo(gameId);
    window.gameId = gameId; // Make it available for join/leave
  } else {
    log("No gameId found in liff.state or URL");
  }
}
