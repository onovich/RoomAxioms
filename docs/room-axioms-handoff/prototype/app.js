(() => {
  'use strict';

  const SIZE = 4;
  const COLUMNS = ['A', 'B', 'C', 'D'];
  const CELLS = [];
  for (let y = 1; y <= SIZE; y += 1) {
    for (const x of COLUMNS) CELLS.push(`${x}${y}`);
  }

  const target = Object.freeze({
    A1: 'empty', B1: 'bottle', C1: 'mirror', D1: 'guest',
    A2: 'bottle', B2: 'bin', C2: 'bottle', D2: 'empty',
    A3: 'mirror', B3: 'empty', C3: 'mirror', D3: 'empty',
    A4: 'empty', B4: 'guest', C4: 'empty', D4: 'empty',
  });

  const initial = ['B1', 'A2', 'C2'];
  const labels = { empty: '空地', bottle: '酒瓶', bin: '垃圾桶', mirror: '镜子', guest: '访客' };
  const ruleMeta = {
    R1: { type: 'global' },
    R2: { type: 'global' },
    R3: { type: 'local', subject: 'bottle', scope: 'orthogonal' },
    R4: { type: 'local', subject: 'bin', scope: 'adjacent' },
    R5: { type: 'local', subject: 'mirror', scope: 'adjacent' },
    R6: { type: 'local', subject: 'bottle', scope: 'orthogonal' },
  };

  let revealed = new Set(initial);
  let marks = new Map();
  let actionLog = initial.map((id, i) => ({ id, kind: target[id], initial: true, order: i }));
  let tool = 'inspect';
  let selectedRule = null;
  let devMode = false;
  let showTarget = false;
  let failed = false;
  let hintCount = 0;
  let inspectCount = 0;
  let lastAnalysis = null;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  function coord(id) {
    return { x: COLUMNS.indexOf(id[0]), y: Number(id.slice(1)) - 1 };
  }

  function idAt(x, y) {
    return `${COLUMNS[x]}${y + 1}`;
  }

  function neighbors(id, scope) {
    const { x, y } = coord(id);
    const result = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        if (scope === 'orthogonal' && Math.abs(dx) + Math.abs(dy) !== 1) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) result.push(idAt(nx, ny));
      }
    }
    return result;
  }

  function combinations(items, choose) {
    const out = [];
    function visit(start, picked) {
      if (picked.length === choose) {
        out.push([...picked]);
        return;
      }
      for (let i = start; i <= items.length - (choose - picked.length); i += 1) {
        picked.push(items[i]);
        visit(i + 1, picked);
        picked.pop();
      }
    }
    visit(0, []);
    return out;
  }

  function analyze() {
    const start = performance.now();
    const observed = Object.fromEntries([...revealed].map((id) => [id, target[id]]));
    const knownBottles = Object.keys(observed).filter((id) => observed[id] === 'bottle');
    const knownMirrors = Object.keys(observed).filter((id) => observed[id] === 'mirror');
    const knownBins = Object.keys(observed).filter((id) => observed[id] === 'bin');

    let binCandidates = knownBins.length ? [...knownBins] : CELLS.filter((id) => !observed[id]);
    binCandidates = binCandidates.filter((binId) => {
      if (observed[binId] && observed[binId] !== 'bin') return false;
      return knownBottles.every((bottleId) => neighbors(bottleId, 'orthogonal').includes(binId));
    });

    const layoutKeys = new Set();
    const layouts = [];

    for (const binId of binCandidates) {
      const guestEligible = CELLS.filter((id) => id !== binId && !observed[id]);
      for (const guests of combinations(guestEligible, 2)) {
        const guestSet = new Set(guests);

        // R4: every actual bin has zero guests in its in-board adjacent scope.
        if (neighbors(binId, 'adjacent').some((id) => guestSet.has(id))) continue;

        // R6: every revealed bottle has zero guests in its orthogonal scope.
        if (knownBottles.some((bottleId) => neighbors(bottleId, 'orthogonal').some((id) => guestSet.has(id)))) continue;

        // R5: every revealed mirror has exactly one guest in its adjacent scope.
        let mirrorOkay = true;
        for (const mirrorId of knownMirrors) {
          const count = neighbors(mirrorId, 'adjacent').filter((id) => guestSet.has(id)).length;
          if (count !== 1) {
            mirrorOkay = false;
            break;
          }
        }
        if (!mirrorOkay) continue;

        const key = guests.slice().sort().join(',');
        if (!layoutKeys.has(key)) {
          layoutKeys.add(key);
          layouts.push(guests.slice().sort());
        }
      }
    }

    const unknown = CELLS.filter((id) => !revealed.has(id));
    const forcedSafe = unknown.filter((id) => layouts.length > 0 && layouts.every((layout) => !layout.includes(id)));
    const forcedGuests = unknown.filter((id) => layouts.length > 0 && layouts.every((layout) => layout.includes(id)));

    return {
      layouts,
      binCandidates,
      forcedSafe,
      forcedGuests,
      unique: layouts.length === 1,
      elapsed: performance.now() - start,
    };
  }

  function objectSvg(kind) {
    if (kind === 'bottle') return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M20 5h8v8l4 5v22a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V18l4-5V5Z"/><path d="M20 10h8M16 25h16"/></svg>';
    if (kind === 'bin') return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 16h20l-2 27H16l-2-27Z"/><path d="M11 13h26M19 13V8h10v5M21 21v15M27 21v15"/></svg>';
    if (kind === 'mirror') return '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="11" y="5" width="26" height="34" rx="12"/><path d="M24 39v5M17 44h14M17 14c3-4 8-5 12-3"/></svg>';
    if (kind === 'guest') return '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="15" r="8"/><path d="M10 43c1-10 6-16 14-16s13 6 14 16M17 13h.1M31 13h.1"/></svg>';
    return '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="3"/><path d="M14 24h5M29 24h5"/></svg>';
  }

  function renderBoard() {
    const grid = $('#boardGrid');
    grid.innerHTML = '';
    grid.appendChild(labelCell(''));
    for (const column of COLUMNS) grid.appendChild(labelCell(column));
    for (let y = 1; y <= SIZE; y += 1) {
      grid.appendChild(labelCell(String(y)));
      for (const column of COLUMNS) {
        const id = `${column}${y}`;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.dataset.cell = id;
        cell.setAttribute('role', 'gridcell');
        cell.addEventListener('click', () => handleCell(id));
        cell.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          cycleMark(id);
        });
        cell.addEventListener('mouseenter', () => updateCaption(id));
        cell.addEventListener('mouseleave', () => updateCaption());

        const coordinate = `<span class="coord">${id}</span>`;
        if (revealed.has(id)) {
          const kind = target[id];
          cell.classList.add('revealed');
          cell.innerHTML = `${coordinate}<span class="object">${objectSvg(kind)}<span>${labels[kind]}</span></span>`;
          cell.setAttribute('aria-label', `${id}，已揭示，${labels[kind]}`);
        } else if (marks.get(id) === 'guest') {
          cell.classList.add('mark-guest');
          cell.innerHTML = `${coordinate}<span class="player-mark">⚑<small>访客？</small></span>`;
          cell.setAttribute('aria-label', `${id}，未知，玩家标记为访客`);
        } else if (marks.get(id) === 'safe') {
          cell.classList.add('mark-safe');
          cell.innerHTML = `${coordinate}<span class="player-mark">○<small>安全？</small></span>`;
          cell.setAttribute('aria-label', `${id}，未知，玩家标记为安全`);
        } else {
          cell.innerHTML = `${coordinate}<span class="unknown-mark">?</span>`;
          cell.setAttribute('aria-label', `${id}，未知，未标记`);
        }

        if (devMode && lastAnalysis) {
          if (!revealed.has(id) && lastAnalysis.forcedSafe.includes(id)) cell.classList.add('dev-safe');
          if (!revealed.has(id) && lastAnalysis.forcedGuests.includes(id)) cell.classList.add('dev-guest');
        }
        if (devMode && showTarget && !revealed.has(id)) {
          cell.classList.add('target-spoiler');
          cell.insertAdjacentHTML('beforeend', `<span class="target-tag">${labels[target[id]]}</span>`);
        }
        grid.appendChild(cell);
      }
    }
    applyRuleHighlight();
  }

  function labelCell(text) {
    const node = document.createElement('div');
    node.className = 'coordinate-label';
    node.textContent = text;
    return node;
  }

  function renderEvidence() {
    const log = $('#evidenceLog');
    log.innerHTML = '';
    [...actionLog].reverse().forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'evidence-item';
      li.innerHTML = `<span class="evidence-coord">${entry.id}</span><span><b>${labels[entry.kind]}</b><small>${entry.initial ? '进入房间时可见' : '调查后揭示的客观事实'}</small></span>`;
      log.appendChild(li);
    });
    const guestMarks = [...marks.entries()].filter(([, value]) => value === 'guest').map(([id]) => id).sort();
    const safeMarks = [...marks.entries()].filter(([, value]) => value === 'safe').map(([id]) => id).sort();
    $('#guestMarks').textContent = guestMarks.length ? guestMarks.join('、') : '尚未标记';
    $('#safeMarks').textContent = safeMarks.length ? safeMarks.join('、') : '尚未标记';
    $('#flagCount').textContent = `${guestMarks.length} / 2`;
    $('#revealCount').textContent = `${revealed.size} / 16`;
  }

  function renderAnalysis() {
    lastAnalysis = analyze();
    $('#candidateCount').textContent = String(lastAnalysis.layouts.length);
    $('#topCandidateCount').textContent = String(lastAnalysis.layouts.length);
    $('#binCandidates').textContent = lastAnalysis.binCandidates.join('、') || '无';
    $('#forcedSafe').textContent = lastAnalysis.forcedSafe.join('、') || '—';
    $('#forcedGuests').textContent = lastAnalysis.forcedGuests.join('、') || '—';
    $('#uniqueLayout').textContent = lastAnalysis.unique ? '是' : '否';
    $('#analysisTime').textContent = `${lastAnalysis.elapsed.toFixed(2)} ms`;
  }

  function render() {
    renderAnalysis();
    renderBoard();
    renderEvidence();
    $('#developerPanel').hidden = !devMode;
    $('#topCandidateStat').hidden = !devMode;
    $('#targetToggle').checked = showTarget;
    $('#devToggle').checked = devMode;
  }

  function handleCell(id) {
    if (failed || revealed.has(id)) return;
    if (tool === 'guest') return setMark(id, 'guest');
    if (tool === 'safe') return setMark(id, 'safe');
    inspect(id);
  }

  function inspect(id) {
    if (marks.get(id) === 'guest') {
      setStatus(`${id} 已被你标记为访客。先撤销标记，再决定是否调查。`, 'error');
      return;
    }
    inspectCount += 1;
    if (target[id] === 'guest') {
      failed = true;
      revealed.add(id);
      actionLog.push({ id, kind: 'guest', initial: false, order: actionLog.length });
      render();
      showFailure(id);
      return;
    }
    marks.delete(id);
    revealed.add(id);
    actionLog.push({ id, kind: target[id], initial: false, order: actionLog.length });
    setStatus(`${id} 揭示为${labels[target[id]]}。这是新增事实，规则没有变化。`, 'success');
    render();
  }

  function setMark(id, value) {
    if (revealed.has(id) || failed) return;
    if (marks.get(id) === value) marks.delete(id);
    else marks.set(id, value);
    setStatus(value === 'guest' ? `${id} 已切换访客标记。标记只是你的笔记。` : `${id} 已切换安全笔记。`, 'normal');
    render();
  }

  function cycleMark(id) {
    if (revealed.has(id) || failed) return;
    const current = marks.get(id);
    if (!current) marks.set(id, 'guest');
    else if (current === 'guest') marks.set(id, 'safe');
    else marks.delete(id);
    render();
  }

  function setTool(next) {
    tool = next;
    $$('.tool-button').forEach((button) => button.classList.toggle('active', button.dataset.tool === next));
    const names = { inspect: '调查', guest: '标访客', safe: '标安全' };
    $('#modeBadge').textContent = `当前工具：${names[next]}`;
  }

  function setStatus(text, kind = 'normal') {
    $('#statusText').textContent = text;
    $('#statusStrip').classList.remove('error', 'success');
    if (kind === 'error') $('#statusStrip').classList.add('error');
    if (kind === 'success') $('#statusStrip').classList.add('success');
  }

  function updateCaption(id) {
    if (!id) {
      $('#boardCaption').textContent = selectedRule ? '蓝色描边为所选规则的实际棋盘内范围；金色描边为已揭示主体。' : '选择一条规则可查看其作用范围。右键格子可循环访客/安全笔记。';
      return;
    }
    const mark = marks.get(id);
    const stateText = revealed.has(id) ? labels[target[id]] : mark === 'guest' ? '玩家标记：访客？' : mark === 'safe' ? '玩家标记：安全？' : '尚未调查';
    $('#boardCaption').textContent = `${id} · ${stateText}`;
  }

  function selectRule(ruleId) {
    selectedRule = selectedRule === ruleId ? null : ruleId;
    $$('.rule-card').forEach((card) => card.classList.toggle('active', card.dataset.rule === selectedRule));
    renderBoard();
    if (selectedRule && ruleMeta[selectedRule].type === 'global') {
      $('#boardCaption').textContent = '这是全局规则，作用于整张棋盘。';
    }
  }

  function applyRuleHighlight() {
    if (!selectedRule) return;
    const meta = ruleMeta[selectedRule];
    const cells = new Map($$('.cell').map((element) => [element.dataset.cell, element]));
    if (meta.type === 'global') {
      cells.forEach((element) => element.classList.add('scope-highlight'));
      return;
    }
    const subjects = [...revealed].filter((id) => target[id] === meta.subject);
    subjects.forEach((subject) => {
      cells.get(subject)?.classList.add('subject-highlight');
      neighbors(subject, meta.scope).forEach((id) => cells.get(id)?.classList.add('scope-highlight'));
    });
  }

  function showHint() {
    hintCount += 1;
    let title = '一个必然结论';
    let conclusion = '';
    let premises = [];
    let reasoning = '';
    let highlight = null;

    if (!revealed.has('B2')) {
      conclusion = 'B2 可以安全调查；它必定是垃圾桶。';
      premises = ['房间中恰有 1 个垃圾桶（R1）。', '每只酒瓶的正交邻域中恰有 1 个垃圾桶（R3）。', 'B1、A2、C2 已揭示为酒瓶。'];
      reasoning = '三只酒瓶的正交邻域共同包含的格子只有 B2。垃圾桶全局唯一，所以 B2 必为垃圾桶；垃圾桶不是访客。';
      highlight = 'B2';
    } else if (!revealed.has('C1')) {
      conclusion = 'C1 可以安全调查。';
      premises = ['B2 已揭示为垃圾桶。', '垃圾桶的邻接域中没有访客（R4）。'];
      reasoning = 'C1 位于 B2 的邻接域内，因此不可能是访客。';
      highlight = 'C1';
    } else if (!marks.has('D1') && lastAnalysis.forcedGuests.includes('D1')) {
      title = '一个必为访客的格子';
      conclusion = 'D1 必定是访客，可以标记。';
      premises = ['C1 已揭示为镜子。', '每面镜子的邻接域中恰好有 1 名访客（R5）。', 'C1 邻接域内其他位置已由垃圾桶与酒瓶规则排除。'];
      reasoning = 'C1 的邻接域中只剩 D1 仍可容纳访客，因此“恰好 1”迫使 D1 为访客。';
      highlight = 'D1';
    } else if (!revealed.has('A3')) {
      conclusion = 'A3 可以安全调查。';
      premises = ['B2 是垃圾桶。', '垃圾桶邻接域中没有访客（R4）。'];
      reasoning = 'A3 位于 B2 的邻接域内。';
      highlight = 'A3';
    } else if (!revealed.has('C3')) {
      conclusion = 'C3 可以安全调查。';
      premises = ['B2 是垃圾桶。', '垃圾桶邻接域中没有访客（R4）。'];
      reasoning = 'C3 位于 B2 的邻接域内。揭示它可能为后续局部计数提供新事实。';
      highlight = 'C3';
    } else if (lastAnalysis.forcedGuests.length) {
      const id = lastAnalysis.forcedGuests[0];
      title = '一个必为访客的格子';
      conclusion = `${id} 在全部剩余候选布局中都是访客。`;
      premises = ['房间总访客数为 2（R2）。', '已揭示镜子的“恰好 1”约束同时成立。'];
      reasoning = '把局部候选集合与全局剩余数量合并后，其他位置均会导致至少一条规则矛盾。';
      highlight = id;
    } else if (lastAnalysis.forcedSafe.length) {
      const id = lastAnalysis.forcedSafe[0];
      conclusion = `${id} 可以安全调查。`;
      premises = ['该格在当前所有符合公开规则与已知事实的候选布局中都不是访客。'];
      reasoning = '本原型的通用提示尚未为该结论配置更短的人类证明；生产版本会拒绝只有机器证明而无人类解释的关卡状态。';
      highlight = id;
    } else {
      conclusion = '当前没有可用提示。';
      premises = ['这通常意味着关卡出现猜测点或原型状态异常。'];
      reasoning = '生产验证器会把这种状态判为不合格。';
    }

    $('#hintTitle').textContent = title;
    $('#hintBody').innerHTML = `<div class="hint-conclusion">${conclusion}</div><section class="hint-section"><h3>前提</h3><ul>${premises.map((item) => `<li>${item}</li>`).join('')}</ul></section><section class="hint-section"><h3>推理</h3><p>${reasoning}</p></section>`;
    $('#hintDialog').showModal();
    if (highlight) {
      const cell = document.querySelector(`[data-cell="${highlight}"]`);
      cell?.classList.add('subject-highlight');
    }
  }

  function submitConclusion() {
    const guestMarks = [...marks.entries()].filter(([, value]) => value === 'guest').map(([id]) => id).sort();
    if (guestMarks.length !== 2) {
      setStatus(`需要标记恰好 2 名访客；当前为 ${guestMarks.length}。`, 'error');
      return;
    }
    const correct = guestMarks.join(',') === ['B4', 'D1'].join(',');
    if (!correct) {
      setStatus('当前结论不成立。系统不会指出哪一格错误，你可以继续修正。', 'error');
      return;
    }
    $('#resultMark').classList.remove('fail');
    $('#resultMark').textContent = '✓';
    $('#resultEyebrow').textContent = '调查完成';
    $('#resultTitle').textContent = '两名访客已经定位';
    $('#resultBody').textContent = '规则从未改变。你通过逐步揭示客观物证，把候选危险布局收缩为唯一答案：D1 与 B4。';
    $('#resultStats').innerHTML = `<div><b>${revealed.size}</b><span>已揭示格</span></div><div><b>${hintCount}</b><span>提示次数</span></div><div><b>${lastAnalysis.layouts.length}</b><span>剩余候选布局</span></div>`;
    $('#resultDialog').showModal();
  }

  function showFailure(id) {
    $('#resultMark').classList.add('fail');
    $('#resultMark').textContent = '!';
    $('#resultEyebrow').textContent = '调查中止';
    $('#resultTitle').textContent = `${id} 中存在访客`;
    $('#resultBody').textContent = '规则没有改变；这次调查在执行前并未被公开信息证明安全。失败界面不会揭示另一名访客的位置。';
    $('#resultStats').innerHTML = `<div><b>${inspectCount}</b><span>主动调查</span></div><div><b>${hintCount}</b><span>提示次数</span></div><div><b>1</b><span>触发访客</span></div>`;
    $('#resultDialog').showModal();
  }

  function reset() {
    revealed = new Set(initial);
    marks = new Map();
    actionLog = initial.map((id, i) => ({ id, kind: target[id], initial: true, order: i }));
    tool = 'inspect';
    selectedRule = null;
    showTarget = false;
    failed = false;
    hintCount = 0;
    inspectCount = 0;
    $$('.rule-card').forEach((card) => card.classList.remove('active'));
    setTool('inspect');
    setStatus('从公开规则与三只酒瓶开始推理。没有倒计时。');
    render();
  }

  function buildMiniGrids() {
    const make = (selector, activeIndexes) => {
      const grid = $(selector);
      for (let i = 0; i < 9; i += 1) {
        const cell = document.createElement('span');
        cell.className = 'mini-cell';
        if (i === 4) {
          cell.classList.add('center');
          cell.textContent = '主体';
        } else if (activeIndexes.includes(i)) {
          cell.classList.add('active');
          cell.textContent = '计入';
        }
        grid.appendChild(cell);
      }
    };
    make('.orthogonal-demo', [1, 3, 5, 7]);
    make('.adjacent-demo', [0, 1, 2, 3, 5, 6, 7, 8]);
  }

  function bindEvents() {
    $$('.tool-button').forEach((button) => button.addEventListener('click', () => setTool(button.dataset.tool)));
    $$('.rule-card').forEach((card) => card.addEventListener('click', () => selectRule(card.dataset.rule)));
    $('#neighborhoodButton').addEventListener('click', () => $('#neighborhoodDialog').showModal());
    $('#hintButton').addEventListener('click', showHint);
    $('#submitButton').addEventListener('click', submitConclusion);
    $('#resetButton').addEventListener('click', reset);
    $('#resultReset').addEventListener('click', () => setTimeout(reset, 0));
    $('#devToggle').addEventListener('change', (event) => {
      devMode = event.target.checked;
      if (!devMode) showTarget = false;
      render();
    });
    $('#targetToggle').addEventListener('change', (event) => {
      showTarget = event.target.checked;
      renderBoard();
    });
    $$('.mobile-tabs button').forEach((button) => button.addEventListener('click', () => {
      document.body.dataset.mobilePanel = button.dataset.mobile;
      $$('.mobile-tabs button').forEach((item) => item.classList.toggle('active', item === button));
    }));
    document.addEventListener('keydown', (event) => {
      if (event.key.toLowerCase() === 'f') setTool('guest');
      if (event.key.toLowerCase() === 's') setTool('safe');
      if (event.key.toLowerCase() === 'i') setTool('inspect');
      if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey) showHint();
    });
  }

  buildMiniGrids();
  bindEvents();
  render();
})();
