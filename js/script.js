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

  const slideElements = document.querySelectorAll(".slide");
  const slideCount = slideElements.length;
  let currentIndex = 0;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let startTranslate = 0;
  let animationID = 0;

  const slideWidth = slides.clientWidth;

  const showSlide = (index) => {
    index = Math.max(0, Math.min(slideCount - 1, index));
    slides.style.transform = `translateX(-${index * 100}%)`;
    slides.style.transition = "transform 0.4s ease-out";
    currentIndex = index;
    startTranslate = -currentIndex * slideWidth;
    currentTranslate = startTranslate; // Синхронизируем, чтобы не было скачков
  };

  const getPositionX = (event) => {
    let pos;
    if (event.type.includes("mouse")) {
      pos = event.pageX;
    } else if (event.touches && event.touches.length > 0) {
      pos = event.touches[0].clientX;
    } else {
      return 0; // fallback
    }
    return isNaN(pos) ? 0 : pos;
  };

  const animation = () => {
    if (isDragging) {
      setSliderPosition();
      animationID = requestAnimationFrame(animation);
    }
  };

  const setSliderPosition = () => {
    const maxTranslate = 0;
    const minTranslate = -(slideCount - 1) * slideWidth;
    currentTranslate = Math.min(maxTranslate, Math.max(minTranslate, currentTranslate));

    slides.style.transform = `translateX(${currentTranslate}px)`;
    slides.style.transition = "none";
  };

  const touchStart = (e) => {
    // Игнорируем, если уже тащим
    if (isDragging) return;

    isDragging = true;
    startPos = getPositionX(e);
    const matrix = new DOMMatrix(window.getComputedStyle(slides).transform);
    startTranslate = isNaN(matrix.m41) ? 0 : matrix.m41;
    currentTranslate = startTranslate;

    slides.style.transition = "none";
    slides.style.cursor = "grabbing";
    slides.style.pointerEvents = "none"; // Блокируем клики во время драга

    // 👇 Добавляем обработчики ДВИЖЕНИЯ только сейчас
    document.addEventListener("mousemove", touchMove);
    document.addEventListener("mouseup", touchEnd);
    document.addEventListener("touchmove", touchMove, { passive: false });
    document.addEventListener("touchend", touchEnd);

    animationID = requestAnimationFrame(animation);
    e.preventDefault(); // предотвращаем выделение текста и др.
  };

  const touchMove = (e) => {
    if (!isDragging) return; // двойная защита

    const pos = getPositionX(e);
    if (isNaN(pos)) return;

    const delta = pos - startPos;
    if (isNaN(delta)) return;

    currentTranslate = startTranslate + delta;
  };

  const touchEnd = () => {
    if (!isDragging) return; // двойная защита

    cancelAnimationFrame(animationID);
    isDragging = false;

    // 👇 Удаляем временные обработчики
    document.removeEventListener("mousemove", touchMove);
    document.removeEventListener("mouseup", touchEnd);
    document.removeEventListener("touchmove", touchMove);
    document.removeEventListener("touchend", touchEnd);

    slides.style.cursor = "grab";
    slides.style.pointerEvents = "auto";

    const movedBy = currentTranslate - startTranslate;
    const threshold = slideWidth * 0.3;
    let newIndex = currentIndex;

    if (movedBy < -threshold && currentIndex < slideCount - 1) {
      newIndex++;
    } else if (movedBy > threshold && currentIndex > 0) {
      newIndex--;
    }

    if (newIndex !== currentIndex) {
      showSlide(newIndex);
    } else {
      showSlide(currentIndex); // анимированно возвращаем на место
    }
  };

  // 👇 Основные обработчики — только для начала драга
  slides.addEventListener("mousedown", touchStart);
  slides.addEventListener("touchstart", touchStart);

  // Кнопки
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showSlide(currentIndex - 1);
  });
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showSlide(currentIndex + 1);
  });

  // Стили
  slides.style.userSelect = "none";
  slides.style.cursor = "grab";

  // Инициализация
  showSlide(0);
});