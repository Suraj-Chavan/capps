function debounce(func, wait, immediate) { 
  let timeout; 
  return function(...args) { 
      const context = this; 
      const later = function() { 
        timeout = null; 
        if (!immediate) func.apply(context, args); 
      }; 
      const callNow = immediate && !timeout; 
      clearTimeout(timeout); 
      timeout = setTimeout(later, wait); 
      if (callNow) func.apply(context, args); 
    }; 
  }

export default {
    bind(el) {
      const TABLE_SCROLL_CONTAINER = el.querySelector(".mb-0.b-table-sticky-header.table-responsive-sm");
      
      const handleScroll = function() {
        const stickyCells = el.querySelectorAll('td.b-table-sticky-column, th.b-table-sticky-column');
        const scrollLeft = TABLE_SCROLL_CONTAINER.pageXOffset || TABLE_SCROLL_CONTAINER.scrollLeft;
        const scrollWidth = TABLE_SCROLL_CONTAINER.scrollWidth; 
        const clientWidth = TABLE_SCROLL_CONTAINER.clientWidth
        const scrollReachedEnd = scrollLeft + clientWidth >= scrollWidth;

        stickyCells.forEach(cell => {
          const IS_RIGHT_STICKY = cell.classList.contains("sticky-column-right");
          
          if (!IS_RIGHT_STICKY && scrollLeft > 0) {
            cell.classList.add('table_td_shadow_on_right_scroll');
          } else {
            cell.classList.remove('table_td_shadow_on_right_scroll');
          }

          if (scrollLeft < 0 || (IS_RIGHT_STICKY && scrollLeft > 0 && !scrollReachedEnd)) { 
            cell.classList.add('table_td_shadow_on_left_scroll'); 
          } else { 
            cell.classList.remove('table_td_shadow_on_left_scroll'); 
          }
        });
      };

      // Wrap handleScroll with debounce 
      const debouncedHandleScroll = debounce(handleScroll, 1, true);
      TABLE_SCROLL_CONTAINER.addEventListener('scroll', debouncedHandleScroll);
      // Save the handleScroll reference for later removal
      el._handleScroll = debouncedHandleScroll;
      el._scrollContainer = TABLE_SCROLL_CONTAINER;
    },
    
    unbind(el) {
      // Remove the event listener
      if (el._scrollContainer && el._handleScroll) {
        el._scrollContainer.removeEventListener('scroll', el._handleScroll);
      }
    }
  };
  