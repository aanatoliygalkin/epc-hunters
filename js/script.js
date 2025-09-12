const menuToggle = document.getElementById("menuToggle");
const closeMenu = document.getElementById("closeMenu");
const menu = document.getElementById("menu");

if (menuToggle && menu && closeMenu) {
  menuToggle.addEventListener("click", () => menu.classList.add("active"));
  closeMenu.addEventListener("click", () => menu.classList.remove("active"));
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
      menu.classList.remove("active");
    }
  });
}

const popupOverlay = document.getElementById("popupOverlay");
const popupClose = document.getElementById("popupClose");
const openPopupBtn = document.querySelector(".open-popup-btn");

if (popupOverlay && popupClose && openPopupBtn) {
  openPopupBtn.addEventListener(
    "click",
    () => (popupOverlay.style.display = "flex")
  );
  popupClose.addEventListener(
    "click",
    () => (popupOverlay.style.display = "none")
  );
  popupOverlay.addEventListener(
    "click",
    (e) => e.target === popupOverlay && (popupOverlay.style.display = "none")
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popupOverlay.style.display === "flex") {
      popupOverlay.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelector(".slides");
  const prevBtn = document.querySelector(".arrow.prev");
  const nextBtn = document.querySelector(".arrow.next");

  if (!slides || !prevBtn || !nextBtn) return;

  const slideCount = document.querySelectorAll(".slide").length;
  let currentIndex = 0;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let startTranslate = 0;
  let animationID = 0;

  const showSlide = (index) => {
    index = index < 0 ? slideCount - 1 : index >= slideCount ? 0 : index;
    slides.style.transform = `translateX(-${index * 100}%)`;
    slides.style.transition = "transform 0.4s ease-out";
    currentIndex = index;
    startTranslate = -currentIndex * slides.clientWidth;
  };

  const getPositionX = (event) =>
    event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;

  const animation = () => {
    if (isDragging) {
      setSliderPosition();
      animationID = requestAnimationFrame(animation);
    }
  };

  const setSliderPosition = () => {
    slides.style.transform = `translateX(${currentTranslate}px)`;
    slides.style.transition = "none";
  };

  const touchStart = (e) => {
    isDragging = true;
    startPos = getPositionX(e);
    const matrix = new DOMMatrix(window.getComputedStyle(slides).transform);
    startTranslate = matrix.m41;
    currentTranslate = startTranslate;
    slides.style.transition = "none";
    slides.style.cursor = "grabbing";
    animationID = requestAnimationFrame(animation);
  };

  const touchMove = (e) => {
    if (isDragging) {
      const delta = getPositionX(e) - startPos;
      currentTranslate = startTranslate + delta;
    }
  };

  const touchEnd = () => {
    cancelAnimationFrame(animationID);
    isDragging = false;
    slides.style.cursor = "grab";

    const slideWidth = slides.clientWidth;
    const movedBy = currentTranslate - startTranslate;
    let newIndex = currentIndex;

    if (movedBy < -slideWidth * 0.3 && currentIndex < slideCount - 1)
      newIndex++;
    else if (movedBy > slideWidth * 0.3 && currentIndex > 0) newIndex--;

    showSlide(newIndex);
  };

  slides.addEventListener("mousedown", touchStart);
  slides.addEventListener("mousemove", touchMove);
  slides.addEventListener("mouseup", touchEnd);
  slides.addEventListener("mouseleave", touchEnd);

  slides.addEventListener("touchstart", touchStart);
  slides.addEventListener("touchmove", touchMove, { passive: false });
  slides.addEventListener("touchend", touchEnd);

  prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
  nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));

  slides.style.userSelect = "none";
  slides.style.cursor = "grab";

  showSlide(0);
});
