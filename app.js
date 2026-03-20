(function () {
  const data = window.LINGXI_DATA;
  if (!data) return;

  const user = data.user;
  const page = document.body.dataset.page;
  const rootPrefix = page === 'home' ? '' : '../';

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function byId(id) {
    return document.getElementById(id);
  }

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

  function pageLink(section, candidateId) {
    const base = `${rootPrefix}${section}/`;
    return candidateId ? `${base}?candidate=${encodeURIComponent(candidateId)}` : base;
  }

  function getQueryCandidateId() {
    return new URLSearchParams(window.location.search).get('candidate');
  }

  function readyCandidates() {
    return data.candidates.filter((candidate) => candidate.status === 'ready');
  }

  function waitingCandidates() {
    return data.candidates.filter((candidate) => candidate.status !== 'ready');
  }

  function getCandidate() {
    const candidateId = getQueryCandidateId();
    return data.candidates.find((item) => item.id === candidateId) || readyCandidates()[0] || data.candidates[0];
  }

  function statCard(item) {
    return `
      <article class="stat-card panel">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(item.value)}</strong>
        <p>${escapeHTML(item.note)}</p>
      </article>
    `;
  }

  function contentCard(item, extra = '') {
    return `
      <article class="panel card">
        <h3>${escapeHTML(item.title)}</h3>
        <p class="card-copy">${escapeHTML(item.copy)}</p>
        ${extra}
      </article>
    `;
  }

  function metricBlock(metrics) {
    return `
      <article class="panel card">
        <div class="metric-list">
          ${metrics
            .map(
              (metric) => `
                <div class="metric-row">
                  <div class="metric-head">
                    <span>${escapeHTML(metric.label)}</span>
                    <strong>${metric.value}%</strong>
                  </div>
                  <div class="metric-track"><i style="width:${metric.value}%"></i></div>
                  <p>${escapeHTML(metric.note)}</p>
                </div>
              `,
            )
            .join('')}
        </div>
      </article>
    `;
  }

  function candidateActions(candidate) {
    const reportButton = `<a class="button button-secondary" href="${pageLink('report', candidate.id)}">看报告</a>`;
    const takeoverButton = candidate.canTakeOver
      ? `<a class="button button-primary" href="${pageLink('connection', candidate.id)}">真人接管</a>`
      : `<a class="button button-ghost" href="${pageLink('report', candidate.id)}">看验证原因</a>`;

    return `${reportButton}${takeoverButton}`;
  }

  function candidateCard(candidate) {
    return `
      <article class="panel candidate-card ${candidate.status}">
        <div class="candidate-top">
          <div>
            <p class="eyebrow">${escapeHTML(candidate.stage)}</p>
            <h3>${escapeHTML(candidate.name)}</h3>
            <p class="candidate-meta">${escapeHTML(candidate.role)} · ${escapeHTML(candidate.city)} · ${candidate.age} 岁</p>
          </div>
          <div class="score-orb">
            <span>契合度</span>
            <strong>${candidate.score}%</strong>
          </div>
        </div>
        <div class="tag-row">
          <span class="state-pill ${candidate.status}">${escapeHTML(candidate.statusText)}</span>
          ${candidate.highlights.map((item) => `<span class="tag">${escapeHTML(item)}</span>`).join('')}
        </div>
        <p class="candidate-summary">${escapeHTML(candidate.summary)}</p>
        <p class="muted-line">${escapeHTML(candidate.whyNow)}</p>
        <div class="action-row">
          ${candidateActions(candidate)}
        </div>
      </article>
    `;
  }

  function pulseCard(item) {
    return `
      <article class="panel digest-card">
        <div class="digest-top">
          <h3>${escapeHTML(item.title)}</h3>
          <span class="tag">${escapeHTML(item.tag)}</span>
        </div>
        <p class="card-copy">${escapeHTML(item.copy)}</p>
      </article>
    `;
  }

  function renderHome() {
    const hero = byId('homeHero');
    if (!hero) return;

    byId('greetingText').textContent = `${greeting()}，${user.name}`;

    const spotlight = readyCandidates()[0];

    hero.innerHTML = `
      <div class="hero-main">
        <p class="eyebrow">${escapeHTML(fmtDate())}</p>
        <h1 class="hero-title">今天有 ${user.readyNow} 段关系，值得你亲自回应。</h1>
        <p class="hero-copy">${escapeHTML(user.dashboardLine)}</p>
        <div class="hero-actions">
          <a class="button button-primary" href="${pageLink('today')}">进入匹配中心</a>
          <a class="button button-secondary" href="${pageLink('report', spotlight.id)}">看最新报告</a>
        </div>
      </div>
      <div class="hero-side hero-side-stack">
        ${user.heroStats.map(statCard).join('')}
      </div>
    `;

    byId('pipelineGrid').innerHTML = user.pipeline.map((item) => contentCard(item)).join('');

    byId('spotlightCard').innerHTML = `
      <article class="panel spotlight-card">
        <div class="candidate-top">
          <div>
            <p class="eyebrow">最新完成的心动报告</p>
            <h3>${escapeHTML(spotlight.name)}</h3>
            <p class="candidate-meta">${escapeHTML(spotlight.role)} · ${escapeHTML(spotlight.city)} · ${spotlight.age} 岁</p>
          </div>
          <div class="score-orb accent">
            <span>契合度</span>
            <strong>${spotlight.score}%</strong>
          </div>
        </div>
        <p class="spotlight-title">${escapeHTML(spotlight.spark.title)}</p>
        <p class="card-copy">${escapeHTML(spotlight.spark.narrative)}</p>
        <div class="grid grid-two compact-grid">
          ${spotlight.overview.map((item) => contentCard(item)).join('')}
        </div>
        <div class="action-row">
          <a class="button button-primary" href="${pageLink('report', spotlight.id)}">阅读完整报告</a>
          <a class="button button-secondary" href="${pageLink('connection', spotlight.id)}">直接接手</a>
        </div>
      </article>
    `;

    byId('pulseFeed').innerHTML = user.pulseDigest.map(pulseCard).join('');
    byId('savedEffortGrid').innerHTML = user.savedEffort.map((item) => contentCard(item)).join('');
    byId('trustGrid').innerHTML = user.trustNotes.map((item) => contentCard(item)).join('');
  }

  function renderMatches() {
    const hero = byId('matchesHero');
    if (!hero) return;

    hero.innerHTML = `
      <div class="hero-main">
        <p class="eyebrow">匹配中心</p>
        <h1 class="hero-title">今天灵犀先替你筛过一轮，再把真正值得看的关系交给你。</h1>
        <p class="hero-copy">系统会先跑深层场景测试和云端磨合，只有越过 90 分阈值的对象，才会进入报告和真人接管。</p>
      </div>
      <div class="hero-side hero-side-stack">
        ${user.matchStats.map(statCard).join('')}
      </div>
    `;

    byId('readyCandidates').innerHTML = readyCandidates().map(candidateCard).join('');
    byId('waitingCandidates').innerHTML = waitingCandidates().map(candidateCard).join('');
    byId('sceneLibrary').innerHTML = user.sceneLibrary.map((item) => contentCard(item)).join('');
    byId('plazaDigest').innerHTML = user.pulseDigest.map(pulseCard).join('');
  }

  function renderReport() {
    const candidate = getCandidate();

    byId('reportHero').innerHTML = `
      <div class="hero-main">
        <p class="eyebrow">${escapeHTML(candidate.stage)} · ${escapeHTML(candidate.lastUpdate)}</p>
        <h1 class="hero-title">${escapeHTML(candidate.name)} 的心动报告</h1>
        <p class="candidate-meta hero-meta">${escapeHTML(candidate.role)} · ${escapeHTML(candidate.city)} · ${candidate.age} 岁</p>
        <p class="hero-copy">${escapeHTML(candidate.spark.subtitle)}</p>
        <div class="tag-row">
          <span class="state-pill ${candidate.status}">${escapeHTML(candidate.statusText)}</span>
          ${candidate.highlights.map((item) => `<span class="tag">${escapeHTML(item)}</span>`).join('')}
        </div>
        <div class="hero-actions">
          ${candidate.canTakeOver ? `<a class="button button-primary" href="${pageLink('connection', candidate.id)}">进入真人接管</a>` : `<a class="button button-primary" href="${pageLink('today')}">回到匹配中心</a>`}
          <a class="button button-secondary" href="${pageLink('today')}">看其他匹配</a>
        </div>
      </div>
      <div class="hero-side hero-side-stack">
        <article class="stat-card panel accent-card">
          <span>综合契合度</span>
          <strong>${candidate.score}%</strong>
          <p>${escapeHTML(candidate.whyNow)}</p>
        </article>
        <article class="stat-card panel">
          <span>报告生成条件</span>
          <strong>> 90%</strong>
          <p>只有通过深层场景测试的关系，才会进入这一步。</p>
        </article>
      </div>
    `;

    byId('reportNarrative').innerHTML = `
      <article class="panel report-card">
        <p class="eyebrow">灵犀心动报告</p>
        <h3>${escapeHTML(candidate.spark.title)}</h3>
        <p class="card-copy">${escapeHTML(candidate.spark.narrative)}</p>
      </article>
    `;

    byId('reportMetrics').innerHTML = metricBlock(candidate.metrics);

    byId('reportMoments').innerHTML = candidate.spark.moments.length
      ? candidate.spark.moments
          .map(
            (moment) => `
              <article class="panel moment-card">
                <h3>${escapeHTML(moment.title)}</h3>
                <div class="quote-pair">
                  <p>${escapeHTML(moment.quoteA)}</p>
                  <p>${escapeHTML(moment.quoteB)}</p>
                </div>
                <p class="card-copy">${escapeHTML(moment.insight)}</p>
              </article>
            `,
          )
          .join('')
      : `<article class="panel card"><p class="card-copy">这段关系还在云端验证阶段，所以暂时还没有生成足够多的心动片段。</p></article>`;

    byId('reportScripts').innerHTML = candidate.spark.scripts
      .map(
        (item) => `
          <article class="panel card scenario-card">
            <div class="scenario-top">
              <h3>${escapeHTML(item.title)}</h3>
              <span class="score-chip">${item.score}%</span>
            </div>
            <p class="scenario-verdict">${escapeHTML(item.verdict)}</p>
            <p class="card-copy">${escapeHTML(item.note)}</p>
          </article>
        `,
      )
      .join('');

    byId('reportRisks').innerHTML = candidate.spark.risks.map((item) => contentCard(item)).join('');
    byId('reportAnchors').innerHTML = candidate.spark.openerAnchors
      .map(
        (text, index) => `
          <article class="panel assist-card selectable-card" data-selectable>
            <div class="assist-top">
              <span class="card-badge">破冰锚点 ${index + 1}</span>
              <span class="tag">可直接发出</span>
            </div>
            <p class="card-copy">${escapeHTML(text)}</p>
          </article>
        `,
      )
      .join('');
    byId('reportDatePlan').innerHTML = candidate.spark.datePlan.map((item) => contentCard(item)).join('');
  }

  function renderConnection() {
    const candidate = getCandidate();

    byId('connectionHero').innerHTML = `
      <div class="hero-main">
        <p class="eyebrow">${escapeHTML(candidate.canTakeOver ? '已进入真人接管窗口' : '尚未建议接手')}</p>
        <h1 class="hero-title">${escapeHTML(candidate.name)} ${candidate.canTakeOver ? '现在可以交还给你了。' : '还留在云端继续验证。'}</h1>
        <p class="candidate-meta hero-meta">${escapeHTML(candidate.role)} · ${escapeHTML(candidate.city)} · ${candidate.age} 岁</p>
        <p class="hero-copy">${escapeHTML(candidate.summary)}</p>
        <div class="tag-row">
          <span class="state-pill ${candidate.status}">${escapeHTML(candidate.statusText)}</span>
          ${candidate.highlights.map((item) => `<span class="tag">${escapeHTML(item)}</span>`).join('')}
        </div>
      </div>
      <div class="hero-side hero-side-stack">
        <article class="stat-card panel accent-card">
          <span>综合契合度</span>
          <strong>${candidate.score}%</strong>
          <p>${escapeHTML(candidate.whyNow)}</p>
        </article>
        <article class="stat-card panel">
          <span>当前阶段</span>
          <strong>${escapeHTML(candidate.stage)}</strong>
          <p>${escapeHTML(candidate.lastUpdate)}</p>
        </article>
      </div>
    `;

    byId('handoffBoard').innerHTML = candidate.handoff.board.map((item) => contentCard(item)).join('');

    byId('liveThread').innerHTML = candidate.messages
      .map(
        (message) => `
          <article class="bubble ${message.side}">
            <small>${escapeHTML(message.from)}</small>
            <p>${escapeHTML(message.text)}</p>
          </article>
        `,
      )
      .join('');

    byId('replyModes').innerHTML = candidate.handoff.assistantModes.length
      ? candidate.handoff.assistantModes
          .map(
            (item) => `
              <article class="panel assist-card selectable-card" data-selectable>
                <div class="assist-top">
                  <h3>${escapeHTML(item.label)}</h3>
                  <span class="tag">${escapeHTML(item.tone)}</span>
                </div>
                <p class="card-copy">${escapeHTML(item.text)}</p>
              </article>
            `,
          )
          .join('')
      : `<article class="panel card"><p class="card-copy">这段关系还没有进入真人接手阶段，所以暂时不会生成助攻话术。</p></article>`;

    byId('noiseShield').innerHTML = candidate.handoff.noiseShield.map((item) => contentCard(item)).join('');

    byId('feedbackPanel').innerHTML = candidate.handoff.feedback.length
      ? candidate.handoff.feedback
          .map(
            (item) => `
              <article class="panel feedback-card">
                <h3>${escapeHTML(item.question)}</h3>
                <div class="option-row">
                  ${item.options.map((option) => `<button type="button" class="option-pill" data-selectable>${escapeHTML(option)}</button>`).join('')}
                </div>
              </article>
            `,
          )
          .join('')
      : `<article class="panel card"><p class="card-copy">这段关系还在后台验证，所以暂时没有进入接手后反馈流程。</p></article>`;
  }

  function renderProfile() {
    const hero = byId('profileHero');
    if (!hero) return;

    hero.innerHTML = `
      <div class="hero-main">
        <p class="eyebrow">分身训练中心</p>
        <h1 class="hero-title">${escapeHTML(user.name)}</h1>
        <p class="candidate-meta hero-meta">${escapeHTML(user.role)} · ${escapeHTML(user.city)} · ${user.age} 岁</p>
        <p class="hero-copy">${escapeHTML(user.profile.subtitle)}</p>
      </div>
      <div class="hero-side hero-side-stack">
        <article class="stat-card panel accent-card">
          <span>分身像你</span>
          <strong>${user.twinFit}%</strong>
          <p>语态、边界和有效关系判断已经不是一次性静态画像，而是在真实反馈里持续修正。</p>
        </article>
        <article class="stat-card panel">
          <span>已训练时长</span>
          <strong>${user.trainingDays} 天</strong>
          <p>“分身越老越香”在这里体现为更接近你真实风格的长期记忆。</p>
        </article>
      </div>
    `;

    byId('profileSources').innerHTML = user.profile.sources
      .map(
        (item) => `
          <article class="panel source-card">
            <p class="eyebrow">${escapeHTML(item.meta)}</p>
            <h3>${escapeHTML(item.title)}</h3>
            <p class="card-copy">${escapeHTML(item.copy)}</p>
          </article>
        `,
      )
      .join('');

    byId('profileSignals').innerHTML = user.profile.signals.map((item) => contentCard(item)).join('');
    byId('profileBoundaries').innerHTML = user.profile.boundaries
      .map(
        (item, index) => `
          <article class="panel boundary-card">
            <span class="card-badge">边界 ${index + 1}</span>
            <p class="card-copy">${escapeHTML(item)}</p>
          </article>
        `,
      )
      .join('');
    byId('profileMemory').innerHTML = user.profile.memory.map((item) => contentCard(item)).join('');
    byId('profileCalibrations').innerHTML = user.profile.calibrations.map((item) => contentCard(item)).join('');
    byId('inviteCard').innerHTML = `
      <article class="panel invite-card">
        <p class="eyebrow">增长引擎</p>
        <h3>${escapeHTML(user.profile.invite.title)}</h3>
        <p class="card-copy">${escapeHTML(user.profile.invite.copy)}</p>
        <div class="action-row">
          <a class="button button-primary" href="${pageLink('today')}">${escapeHTML(user.profile.invite.actionPrimary)}</a>
          <a class="button button-secondary" href="${pageLink('report')}">${escapeHTML(user.profile.invite.actionSecondary)}</a>
        </div>
      </article>
    `;
  }

  function bindSelectableCards() {
    document.querySelectorAll('[data-selectable]').forEach((node) => {
      node.addEventListener('click', () => {
        const group = node.closest('.stack, .option-row');
        if (group) {
          group.querySelectorAll('[data-selectable]').forEach((item) => item.classList.remove('is-selected'));
        }
        node.classList.add('is-selected');
      });
    });
  }

  if (page === 'home') renderHome();
  if (page === 'today') renderMatches();
  if (page === 'report') renderReport();
  if (page === 'connection') renderConnection();
  if (page === 'profile') renderProfile();

  bindSelectableCards();
})();
