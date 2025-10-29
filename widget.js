async function getScore(username) {
  const res = await fetch(`https://api.github.com/users/${username}/events`);
  if (!res.ok) return 0; // fallback if user not found
  const events = await res.json();

  let score = 0;
  events.forEach(e => {
    if (e.type === "PushEvent") score += 3;
    if (e.type === "PullRequestEvent") score += 5;
    if (e.type === "IssuesEvent") score += 2;
  });
  return score;
}

async function getAvatarUrl(username) {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.avatar_url;
}

async function drawMoodRing(username) {
  if (!username) return;

  const score = await getScore(username);
  const avatarUrl = await getAvatarUrl(username);

  const canvas = document.getElementById('moodRing');
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mood ring
  const angle = Math.min(score / 50, 1) * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(110, 110, 90, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.lineWidth = 20;
  ctx.strokeStyle = score < 10 ? '#FF4C4C' : score < 25 ? '#FFD93D' : '#4CAF50';
  ctx.stroke();

  // Fun random event
  if (Math.random() < 0.1) {
    ctx.font = '30px Arial';
    ctx.fillText('🪳', 90, 120); // Alaskan Bull Worm
  }

  // Draw avatar in center
  if (avatarUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // needed to allow downloads
    img.src = avatarUrl;
    img.onload = () => {
      const size = 80; // diameter of avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(110, 110, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 110 - size / 2, 110 - size / 2, size, size);
      ctx.restore();
    };
  }

  // Update share link
  const shareLink = `${window.location.origin}${window.location.pathname}?user=${username}`;
  document.getElementById('share-link').innerHTML = `<a href="${shareLink}" target="_blank">${shareLink}</a>`;
}

// Handle input button
document.getElementById('downloadBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  if (!username) return alert('Please enter a GitHub username!');

  const canvas = document.getElementById('moodRing');
  const ctx = canvas.getContext('2d');

  // Redraw mood ring to make sure avatar is included
  const score = await getScore(username);
  const avatarUrl = await getAvatarUrl(username);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mood ring
  const angle = Math.min(score / 50, 1) * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(110, 110, 90, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.lineWidth = 20;
  ctx.strokeStyle = score < 10 ? '#FF4C4C' : score < 25 ? '#FFD93D' : '#4CAF50';
  ctx.stroke();

  // Fun random event
  if (Math.random() < 0.1) {
    ctx.font = '30px Arial';
    ctx.fillText('🪳', 90, 120); // Alaskan Bull Worm
  }

  // Draw avatar and then download once loaded
  if (avatarUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = avatarUrl;
    img.onload = () => {
      const size = 80;
      ctx.save();
      ctx.beginPath();
      ctx.arc(110, 110, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 110 - size / 2, 110 - size / 2, size, size);
      ctx.restore();

      // Trigger download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${username}-mood-ring.png`;
      link.click();
    };
  } else {
    // If avatar fails, just download the mood ring
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${username}-mood-ring.png`;
    link.click();
  }
});


// Auto-load if username provided in URL
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const presetUser = urlParams.get('user');
  if (presetUser) {
    document.getElementById('username').value = presetUser;
    drawMoodRing(presetUser);
  }
});
