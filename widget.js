async function getScore(username) {
  const res = await fetch(`https://api.github.com/users/${username}/events`);
  const events = await res.json();

  let score = 0;
  events.forEach(e => {
    if (e.type === "PushEvent") score += 3;
    if (e.type === "PullRequestEvent") score += 5;
    if (e.type === "IssuesEvent") score += 2;
  });
  return score;
}

async function drawMoodRing() {
  const usernameInput = document.getElementById('username');
  const username = usernameInput.value.trim();
  if (!username) return alert('Please enter a GitHub username!');

  const score = await getScore(username);
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

  // Color gradient
  ctx.strokeStyle = score < 10 ? '#FF4C4C' : score < 25 ? '#FFD93D' : '#4CAF50';
  ctx.stroke();

  // Fun random event
  if (Math.random() < 0.1) {
    ctx.font = '30px Arial';
    ctx.fillText('🪳', 90, 120); // Alaskan Bull Worm
  }

  // Update share link
  const shareLink = `${window.location.origin}${window.location.pathname}?user=${username}`;
  document.getElementById('share-link').innerHTML = `<a href="${shareLink}" target="_blank">${shareLink}</a>`;
}

// Auto-load if username provided in URL
const urlParams = new URLSearchParams(window.location.search);
const presetUser = urlParams.get('user');
if (presetUser) {
  document.getElementById('username').value = presetUser;
  drawMoodRing();
}
