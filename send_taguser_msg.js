const { Client } = require('@line/bot-sdk');

const client = new Client({
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN'
});

async function sendMentionMessage(toGroupId, userId, displayName, content) {
  const text = `@${displayName} ${content}`;

  const message = {
    type: 'text',
    text: text,
    mention: {
      mentionees: [
        {
          index: 0,
          length: displayName.length + 1, // include '@'
          userId: userId
        }
      ]
    }
  };

  try {
    await client.pushMessage(to, message);
    console.log('Mention sent successfully');
  } catch (err) {
    console.error('Failed to send mention:', err);
  }
}