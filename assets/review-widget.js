(function () {
  const STORE_KEY = "nextprime.productionReview.v1";
  const MAX_INLINE_ATTACHMENT = 1400 * 1024;
  const DEFAULT_REMOTE_TIMEOUT = 8000;

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveAll(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }

  function getState(itemId) {
    const all = loadAll();
    return all[itemId] || { checked: false, rating: 0, comment: "", attachments: [] };
  }

  function setState(itemId, state) {
    const all = loadAll();
    all[itemId] = Object.assign({}, state, { updatedAt: new Date().toISOString() });
    saveAll(all);
  }

  function esc(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatSize(bytes) {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function renderAttachments(listEl, state, itemId, save) {
    const attachments = state.attachments || [];
    if (!attachments.length) {
      listEl.innerHTML = "";
      return;
    }
    listEl.innerHTML = attachments.map((file, index) => {
      const label = `${esc(file.name)} · ${formatSize(file.size)}`;
      const link = file.dataUrl
        ? `<a href="${file.dataUrl}" download="${esc(file.name)}">${label}</a>`
        : `<span>${label}</span>`;
      const note = file.dataUrl ? "" : `<span class="np-review-muted">仅记录文件名，文件过大未写入本地存储</span>`;
      return `<li>${link}${note}<button class="np-remove-attachment" type="button" data-index="${index}">移除</button></li>`;
    }).join("");

    listEl.querySelectorAll(".np-remove-attachment").forEach((button) => {
      button.addEventListener("click", () => {
        state.attachments.splice(Number(button.dataset.index), 1);
        save();
        renderAttachments(listEl, state, itemId, save);
      });
    });
  }

  function pickReviewPayload(state) {
    return {
      checked: Boolean(state.checked),
      rating: Number(state.rating || 0),
      comment: String(state.comment || ""),
      updatedAt: state.updatedAt || ""
    };
  }

  function mergeState(baseState, remoteState) {
    const localTs = Date.parse(baseState && baseState.updatedAt ? baseState.updatedAt : "") || 0;
    const remoteTs = Date.parse(remoteState && remoteState.updatedAt ? remoteState.updatedAt : "") || 0;
    const winner = remoteTs >= localTs ? remoteState : baseState;
    return Object.assign({ checked: false, rating: 0, comment: "", attachments: [] }, winner || {}, {
      attachments: Array.isArray(baseState && baseState.attachments) ? baseState.attachments : []
    });
  }

  async function requestJson(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_REMOTE_TIMEOUT);
    try {
      const response = await fetch(url, Object.assign({}, options || {}, { signal: controller.signal }));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function mount(target, options) {
    const root = typeof target === "string" ? document.getElementById(target) : target;
    if (!root) return;

    const itemId = options && options.itemId ? String(options.itemId) : "unknown";
    const title = options && options.title ? options.title : itemId;
    const apiBase = options && options.apiBase ? String(options.apiBase).replace(/\/+$/, "") : "";
    let state = getState(itemId);
    let syncTimer = null;
    let syncSeq = 0;
    let lastRemoteUpdatedAt = "";

    root.innerHTML = `
      <div class="np-review-widget" data-review-id="${esc(itemId)}">
        <h3>评审记录 · ${esc(title)}</h3>
        <div class="np-review-row">
          <label class="np-review-check">
            <input type="checkbox" class="np-check" />
            <span>勾选为候选/通过</span>
          </label>
          <div class="np-rating" aria-label="评分">
            ${[1, 2, 3, 4, 5].map((score) => `<button type="button" data-score="${score}">${score}</button>`).join("")}
          </div>
          <span class="np-review-muted np-save-state"></span>
        </div>
        <textarea class="np-comment" placeholder="写下修改意见、可投放判断、需要返工的点..."></textarea>
        <div class="np-review-actions">
          <input class="np-attachment-input" type="file" multiple />
          <span class="np-review-muted">勾选 / 评分 / 文字会同步到共享评审；附件仍只保存在当前浏览器本地。</span>
          <button class="np-clear-review" type="button">清空本图评审</button>
        </div>
        <div class="np-review-sync">
          <span class="np-review-muted np-sync-state">共享评审未连接</span>
        </div>
        <ul class="np-attachment-list"></ul>
      </div>
    `;

    const check = root.querySelector(".np-check");
    const ratingButtons = Array.from(root.querySelectorAll(".np-rating button"));
    const comment = root.querySelector(".np-comment");
    const status = root.querySelector(".np-save-state");
    const syncStatus = root.querySelector(".np-sync-state");
    const fileInput = root.querySelector(".np-attachment-input");
    const clearButton = root.querySelector(".np-clear-review");
    const attachmentList = root.querySelector(".np-attachment-list");

    function setSyncStatus(message, tone) {
      syncStatus.textContent = message;
      syncStatus.dataset.tone = tone || "muted";
    }

    function paint() {
      check.checked = Boolean(state.checked);
      comment.value = state.comment || "";
      ratingButtons.forEach((button) => {
        button.classList.toggle("active", Number(button.dataset.score) <= Number(state.rating || 0));
      });
      renderAttachments(attachmentList, state, itemId, save);
    }

    function save() {
      try {
        setState(itemId, state);
        status.textContent = "已保存";
      } catch (error) {
        status.textContent = "本地存储已满，附件或评论未完全保存";
      }
    }

    async function pushRemote() {
      if (!apiBase) return;
      const currentSeq = ++syncSeq;
      setSyncStatus("共享评审同步中...", "pending");
      try {
        const payload = await requestJson(`${apiBase}/api/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId,
            review: pickReviewPayload(state)
          })
        });
        if (currentSeq !== syncSeq) return;
        if (payload && payload.review) {
          lastRemoteUpdatedAt = payload.review.updatedAt || lastRemoteUpdatedAt;
          state = mergeState(state, payload.review);
          save();
          paint();
        }
        setSyncStatus("共享评审已同步", "ok");
      } catch (error) {
        setSyncStatus("共享同步失败，当前仅保存在本机", "error");
      }
    }

    function scheduleRemoteSync() {
      if (!apiBase) return;
      clearTimeout(syncTimer);
      syncTimer = setTimeout(pushRemote, 450);
    }

    async function pullRemote() {
      if (!apiBase) {
        setSyncStatus("当前只启用本地保存", "muted");
        paint();
        return;
      }
      setSyncStatus("正在读取共享评审...", "pending");
      try {
        const payload = await requestJson(`${apiBase}/api/reviews/${encodeURIComponent(itemId)}`);
        const remoteReview = payload && payload.review ? payload.review : null;
        if (remoteReview && remoteReview.updatedAt) {
          lastRemoteUpdatedAt = remoteReview.updatedAt;
        }
        const merged = mergeState(state, remoteReview || {});
        const localTs = Date.parse(state.updatedAt || "") || 0;
        const remoteTs = Date.parse(lastRemoteUpdatedAt || "") || 0;
        state = merged;
        save();
        paint();
        if (localTs > remoteTs) {
          scheduleRemoteSync();
        } else {
          setSyncStatus("共享评审已连接", "ok");
        }
      } catch (error) {
        setSyncStatus("共享评审不可用，当前只保存在本机", "error");
        paint();
      }
    }

    check.addEventListener("change", () => {
      state.checked = check.checked;
      save();
      scheduleRemoteSync();
    });

    ratingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.rating = Number(button.dataset.score);
        save();
        paint();
        scheduleRemoteSync();
      });
    });

    comment.addEventListener("input", () => {
      state.comment = comment.value;
      save();
      scheduleRemoteSync();
    });

    fileInput.addEventListener("change", () => {
      const files = Array.from(fileInput.files || []);
      files.forEach((file) => {
        const record = {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: "",
          addedAt: new Date().toISOString()
        };
        if (file.size > MAX_INLINE_ATTACHMENT) {
          state.attachments = (state.attachments || []).concat(record);
          save();
          renderAttachments(attachmentList, state, itemId, save);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          record.dataUrl = String(reader.result || "");
          state.attachments = (state.attachments || []).concat(record);
          save();
          renderAttachments(attachmentList, state, itemId, save);
        };
        reader.readAsDataURL(file);
      });
      fileInput.value = "";
    });

    clearButton.addEventListener("click", () => {
      state = { checked: false, rating: 0, comment: "", attachments: [] };
      save();
      paint();
      scheduleRemoteSync();
    });

    pullRemote();
  }

  window.NPReviewWidget = { mount };
})();
