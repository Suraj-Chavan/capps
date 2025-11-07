// overflow-ellipsis.js
export default {
  inserted(el) {
    // Function to check for overflow and adjust width
    const checkOverflow = () => {
      const originalWidth = el.clientWidth;
      if (el.scrollWidth > el.clientWidth) {
        el.classList.add('overflow');
        el.style.width = `${originalWidth + 10}px`; // Reduce by some px
      }
    };

    // Initial check
    checkOverflow();
    // Recheck on window resize
    window.addEventListener('resize', checkOverflow);

    // Cleanup on unbind
    el._onResize = checkOverflow;
  },
  unbind(el) {
    window.removeEventListener('resize', el._onResize);
  }
};
