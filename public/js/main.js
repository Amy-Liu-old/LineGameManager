async function main() {
  await liff.init({ liffId: '1657304004-NPlZynwM' });

  if (!liff.isLoggedIn()) {
    liff.login();
    return; // wait for redirect
  }

  const profile = await liff.getProfile();
  document.getElementById('profile').innerText = `Hi ${profile.displayName}`;
  window.userId = profile.userId;
}

async function submitData() {
  const nickname = document.getElementById('nickname').value;
  console.log(`UserId: ${window.userId}, Nickname: ${nickname}`);

  await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: window.userId, nickname }),
  });

  // Optional: close LIFF window after submit
  liff.closeWindow();
}

document.addEventListener('DOMContentLoaded', () => {
  main();
});
