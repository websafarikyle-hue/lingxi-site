(function () {
  const data = window.LINGXI_DATA;
  if (!data) return;

  const user = data.user;
  const page = document.body.dataset.page;
  const threshold = 90;

  function fmtDate() {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(new Date());
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }

  function getQueryCandidateId() {
    return new URLSearchParams(window.location.search).get('candidate');
  }

  function readyCandidates() {
    return data.candidates.filter((candidate) => candidate.score >= threshold);
  }

  function waitingCandidates() {
    return data.candidates.filter((candidate) => candidate.score < threshold);
  }

  function getCandidate() {
    const requested = getQueryCandidateId();
    return data.candidates.find((item) => item.id === requested) || readyCandidates()[0] || data.candidates[0];
  }

  function createCard(title, copy, extra = '') {
    return `
      <article class="card">
        <h3>${title}</h3>
        <p class="card-copy">${copy}</p>
        ${extra}
      </article>
    `;
  }

  function metrics(candidate) {
    const rows = [
      ['价值观', candidate.metrics.values],
      ['冲突处理', candidate.metrics.conflict],
      ['共情能力', candidate.metrics.empathy],
      ['沟通节奏', candidate.metrics.rhythm],
    ];

    return rows
      .map(
        ([label, value]) => `
          <div class="metric-row">
            <span>${label}</span>
            <strong>${value}%</strong>
            <div class="metric-track"><i style="width:${value}%"></i></div>
          </div>
        `,
      )
      .join('');
  }

  function candidateCard(candidate) {
    const statusClass = candidate.status === 'ready' ? 'ready' : 'waiting';
    return `
      <a class="candidate-card" href="../connection/?candidate=${candidate.id}">
        <div class="candidate-top">
          <div>
            <strong>${candidate.name}</strong>
            <span>${candidate.role} · ${candidate.city}</span>
          </div>
          <div class="score-pill">
            <span>契合度</span>
            <strong>${candidate.score}%</strong>
          </div>
        </div>
        <div class="tag-row">
          <span class="state-pill ${statusClass}">${candidate.statusText}</span>
          ${candidate.highlights.map((item) => `<span class="tag">${item}</span>`).join('')}
        </div>
        <p class="card-copy">${candidate.summary}</p>
        <p class="muted-line">${candidate.whyNow}</p>
      </a>
    `;
  }

  function renderHome() {
    document.getElementById('greetingText').textContent = `${greeting()}，${user.name}`;
    document.getElementById('todayDate').textContent = fmtDate();
    document.getElementById('heroTitle').textContent = `今天有 ${user.readyNow} 段关系，值得你回应。`;
    document.getElementById('heroSummary').textContent = user.todayDateLine;

    document.getElementById('heroAside').innerHTML = `
      <div class="hero-stat-grid">
        <article class="stat-card accent-stat">
          <span>今晚可接住</span>
          <strong>${user.readyNow} 段</strong>
          <p>只把已经足够确定的关系交到你手里。</p>
        </article>
        <article class="stat-card">
          <span>已替你挡掉</span>
          <strong>${user.screenedOutToday} 段</strong>
          <p>它们不需要提前进入你的今天。</p>
        </article>
        <article class="stat-card">
          <span>分身拟合</span>
          <strong>${user.twinFit}%</strong>
          <p>灵犀现在更清楚你会因为什么而真正安心。</p>
        </article>
      </div>
    `;

    document.getElementById('savedEffortGrid').innerHTML = user.savedEffort
      .map((item) => createCard(item.title, item.copy))
      .join('');

    document.getElementById('priorityCards').innerHTML = readyCandidates()
      .map(
        (candidate) => `
          <article class="priority-card card card-featured">
            <div class="priority-head">
              <div>
                <p class="eyebrow">今晚优先关系</p>
                <h3>${candidate.name}</h3>
                <p class="muted-line">${candidate.role} · ${candidate.city}</p>
              </div>
              <div class="score-badge">${candidate.score}%</div>
            </div>
            <p class="card-copy">${candidate.summary}</p>
            <div class="tag-row">
              ${candidate.highlights.map((item) => `<span class="tag">${item}</span>`).join('')}
            </div>
            <a class="card-link" href="connection/?candidate=${candidate.id}">从这段关系继续</a>
          </article>
        `,
      )
      .join('');

    document.getElementById('understandGrid').innerHTML = user.highlights
      .map((item) => createCard(item.title, item.copy))
      .join('');
  }

  function renderToday() {
    document.getElementById('todaySummary').textContent = `灵犀已经替你筛掉了不够成熟的关系。今晚留在这里的，是 ${readyCandidates().length} 段真正值得你分配注意力的连接。`;

    document.getElementById('readyCandidates').innerHTML = readyCandidates().map(candidateCard).join('');
    document.getElementById('waitingCandidates').innerHTML = waitingCandidates().map(candidateCard).join('');
    document.getElementById('confidenceGrid').innerHTML = user.confidence
      .map((item) => createCard(item.title, item.copy))
      .join('');
  }

  function renderConnection() {
    const candidate = getCandidate();

    document.getElementById('candidateHero').innerHTML = `
      <div class="hero-copy-block">
        <p class="eyebrow">现在最值得你接手的关系</p>
        <h1>${candidate.name}</h1>
        <p class="candidate-subtitle">${candidate.role} · ${candidate.city} · ${candidate.age} 岁</p>
        <p class="hero-text">${candidate.summary}</p>
        <div class="tag-row">
          <span class="state-pill ${candidate.status === 'ready' ? 'ready' : 'waiting'}">${candidate.statusText}</span>
          ${candidate.highlights.map((item) => `<span class="tag">${item}</span>`).join('')}
        </div>
      </div>
      <div class="hero-side hero-side-metrics">
        <article class="stat-card accent-stat">
          <span>综合契合度</span>
          <strong>${candidate.score}%</strong>
          <p>${candidate.whyNow}</p>
        </article>
        <article class="stat-card">
          <span>今晚不需要你再做的事</span>
          <strong>重复筛选</strong>
          <p>这段关系已经先通过了一轮更深的验证。</p>
        </article>
      </div>
    `;

    document.getElementById('connectionOverview').innerHTML = `
      ${candidate.overview.map((item) => createCard(item.title, item.copy)).join('')}
      <article class="card">
        <h3>这段关系现在的匹配状态</h3>
        <div class="metric-list">${metrics(candidate)}</div>
      </article>
    `;

    document.getElementById('reportCard').innerHTML = `
      <article class="card report-surface">
        <p class="eyebrow">灵犀心动报告</p>
        <h3>${candidate.reportTitle}</h3>
        <p class="card-copy">${candidate.reportCopy}</p>
        <div class="scene-list">
          ${candidate.scenes
            .map(
              (scene) => `
                <article class="scene-item">
                  <div class="scene-head">
                    <strong>${scene.title}</strong>
                    <span>${scene.score}%</span>
                  </div>
                  <p>${scene.note}</p>
                </article>
              `,
            )
            .join('')}
        </div>
      </article>
    `;

    document.getElementById('chatThread').innerHTML = candidate.messages
      .map(
        (message) => `
          <article class="chat-bubble ${message.side}">
            <small>${message.from}</small>
            ${message.text}
          </article>
        `,
      )
      .join('');

    document.getElementById('openerList').innerHTML = candidate.openers
      .map(
        (item, index) => `
          <article class="card action-card">
            <div class="card-badge">开场方式 ${index + 1}</div>
            <p class="card-copy">${item}</p>
          </article>
        `,
      )
      .join('');

    document.getElementById('dateIdeas').innerHTML = candidate.dateIdeas
      .map((item) => createCard(item.title, item.copy))
      .join('');
  }

  function renderProfile() {
    document.getElementById('profileHero').innerHTML = `
      <div class="hero-copy-block">
        <p class="eyebrow">灵犀眼中的你</p>
        <h1>${user.name}</h1>
        <p class="candidate-subtitle">${user.role} · ${user.city} · ${user.age} 岁</p>
        <p class="hero-text">${user.profile.subtitle}</p>
      </div>
      <div class="hero-side">
        <div class="hero-stat-grid">
          <article class="stat-card accent-stat">
            <span>分身拟合</span>
            <strong>${user.twinFit}%</strong>
            <p>灵犀已经能更稳定地模拟你的节奏、边界和关系判断。</p>
          </article>
          <article class="stat-card">
            <span>更适合你的关系</span>
            <strong>少而准</strong>
            <p>你不需要更多候选，你更需要少量但真的值得回应的人。</p>
          </article>
        </div>
      </div>
    `;

    document.getElementById('profileSignals').innerHTML = user.profile.signals
      .map((item) => createCard(item.title, item.copy))
      .join('');

    document.getElementById('profileShields').innerHTML = user.shields
      .map((item) => createCard(item.title, item.copy))
      .join('');

    document.getElementById('profileBoundaries').innerHTML = user.profile.boundaries
      .map((item) => `<article class="card action-card"><p class="card-copy">${item}</p></article>`)
      .join('');

    document.getElementById('profileLearnings').innerHTML = user.profile.learnings
      .map((item) => `<article class="card action-card"><p class="card-copy">${item}</p></article>`)
      .join('');
  }

  if (page === 'home') renderHome();
  if (page === 'today') renderToday();
  if (page === 'connection') renderConnection();
  if (page === 'profile') renderProfile();
})();
