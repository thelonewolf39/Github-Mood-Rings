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
  const username = document.getElementById('username').value;
  if (!username) return alert('Enter a GitHub username!');
  
  const score = await getScore(username);
  const canvas = document.getElementById('moodRing');
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ring
  const angle = Math.min(score / 50, 1) * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(100, 100, 80, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.lineWidth = 20;

  // Color by activity
  ctx.strokeStyle = score < 10 ? '#FF0000' : score < 25 ? '#FFFF00' : '#00FF00';
  ctx.stroke();

  // Fun event (5% chance)
  if (Math.random() < 0.05) {
    ctx.font = '20px Arial';
    ctx.fillText('🪳', 90, 110); // Alaskan Bull Worm
  }
}
