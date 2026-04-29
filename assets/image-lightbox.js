(function () {
  function ensureLightbox() {
    let box = document.querySelector(".np-lightbox");
    if (box) return box;
    box = document.createElement("div");
    box.className = "np-lightbox";
    box.innerHTML = '<button type="button" aria-label="关闭">×</button><img alt="" />';
    document.body.appendChild(box);
    box.addEventListener("click", (event) => {
      if (event.target === box || event.target.tagName === "BUTTON") closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
    });
    return box;
  }

  function openLightbox(img) {
    const box = ensureLightbox();
    const full = box.querySelector("img");
    full.src = img.currentSrc || img.src;
    full.alt = img.alt || "";
    box.classList.add("open");
  }

  function closeLightbox() {
    const box = document.querySelector(".np-lightbox");
    if (!box) return;
    box.classList.remove("open");
  }

  document.addEventListener("click", (event) => {
    const img = event.target.closest(".preview img");
    if (!img) return;
    openLightbox(img);
  });
})();
