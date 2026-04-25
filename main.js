const form = document.getElementById('quiz');
const submitBtn = document.getElementById('submitBtn');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const resultContent = document.getElementById('resultContent');

const questions = ['q1', 'q2', 'q3', 'q4', 'q5'];

function checkAllAnswered() {
  const allAnswered = questions.every(q => form.querySelector(`input[name="${q}"]:checked`));
  submitBtn.disabled = !allAnswered;
}

form.addEventListener('change', checkAllAnswered);

function getHellName(score) {
  if (score <= 20) return '✨ ほぼ天国';
  if (score <= 40) return '😤 普通の修行場';
  if (score <= 60) return '🔥 地獄の入口';
  if (score <= 80) return '😈 中級地獄';
  return '💀 最深部・無間地獄';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const scores = questions.map(q => {
    const checked = form.querySelector(`input[name="${q}"]:checked`);
    return parseInt(checked?.value || 0);
  });

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 3;
  const hellPercent = Math.round((totalScore / maxScore) * 100);

  const answers = {
    q1: form.querySelector('input[name="q1"]:checked')?.parentElement.textContent.trim(),
    q2: form.querySelector('input[name="q2"]:checked')?.parentElement.textContent.trim(),
    q3: form.querySelector('input[name="q3"]:checked')?.parentElement.textContent.trim(),
    q4: form.querySelector('input[name="q4"]:checked')?.parentElement.textContent.trim(),
    q5: form.querySelector('input[name="q5"]:checked')?.parentElement.textContent.trim(),
  };

  form.classList.add('hidden');
  resultDiv.classList.remove('hidden');
  loadingDiv.classList.remove('hidden');
  resultContent.classList.add('hidden');

  try {
    const response = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, hellPercent }),
    });

    const data = await response.json();

    document.getElementById('hellScore').textContent = `${hellPercent}%`;
    document.getElementById('hellName').textContent = getHellName(hellPercent);
    document.getElementById('diagnosisText').textContent = data.diagnosis;

    const tweetText = encodeURIComponent(
      `私の職場の地獄度は ${hellPercent}%「${getHellName(hellPercent)}」でした🔥\n\n#職場地獄度診断\nhttps://jigoku-shindan-o0prbwmym-kojiworkdesigns-projects.vercel.app/`
    );
    document.getElementById('tweetBtn').href = `https://twitter.com/intent/tweet?text=${tweetText}`;

    loadingDiv.classList.add('hidden');
    resultContent.classList.remove('hidden');
  } catch (err) {
    loadingDiv.innerHTML = '<p style="color:#ff6b6b">エラーが発生しました。時間をおいて再度お試しください。</p>';
  }
});
