const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const LINE_CHANNEL_ACCESS_TOKEN = 'YOUR_CHANNEL_ACCESS_TOKEN';

app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const replyToken = event.replyToken;

      const message = {
        type: 'flex',
        altText: 'Click the button below',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'Click below to go to the page',
                size: 'md',
                weight: 'bold',
                margin: 'md'
              },
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: 'Click here',
                  uri: 'https://example.com'
                },
                style: 'primary',
                margin: 'md'
              }
            ]
          }
        }
      };

      await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: replyToken,
          messages: [message]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer JOLIcsC9Y7tS84TExqdN3qmnVSfyjT7uiclJAokQm56cJopKltnQz8Y4SWsH53Qjat16gl2kOs47QUtcaJ//OrJAPQZgwU22lI/VP1EfdsM4+BelpnAuFrT9yEnKoM3N9MK78V4uMPneyzAJCI4zuQdB04t89/1O/w1cDnyilFU=`
          }
        }
      );
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`LINE webhook server running on port ${PORT}`);
});
