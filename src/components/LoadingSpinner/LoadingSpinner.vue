<template>
  <div v-if="isVisible" class="capps-loading-spinner-overlay">
    <div class="capps-loading-spinner-container">
      <div class="capps-spinner"></div>
      <p class="capps-spinner-message">{{ message }}</p>
      <div v-if="showProgress" class="capps-spinner-progress">
        <div class="capps-progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  data() {
    return {
      isVisible: false,
      message: 'Loading...',
      progress: 0,
      showProgress: false,
      timeout: null
    };
  },
  methods: {
    /**
     * Show spinner with optional message and progress
     * @param {string} msg - Message to display
     * @param {boolean} showProg - Whether to show progress bar
     */
    show(msg = 'Loading...', showProg = false) {
      this.message = msg;
      this.showProgress = showProg;
      this.progress = 0;
      this.isVisible = true;
    },

    /**
     * Update spinner message
     * @param {string} msg - New message
     */
    updateMessage(msg) {
      this.message = msg;
    },

    /**
     * Update progress bar (0-100)
     * @param {number} percent - Progress percentage
     */
    updateProgress(percent) {
      this.progress = Math.min(Math.max(percent, 0), 100);
    },

    /**
     * Hide spinner
     */
    hide() {
      this.isVisible = false;
      this.progress = 0;
      this.showProgress = false;
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    },

    /**
     * Auto-hide after delay
     * @param {number} delay - Milliseconds to wait before hiding
     */
    hideAfter(delay = 1000) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.hide();
      }, delay);
    }
  }
};
</script>

<style scoped>
.capps-loading-spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in;
}

.capps-loading-spinner-container {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  min-width: 320px;
  max-width: 400px;
}

.capps-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: capps-spin 1s linear infinite;
  margin: 0 auto 20px;
}

.capps-spinner-message {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
}

.capps-spinner-progress {
  width: 100%;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 15px;
}

.capps-progress-bar {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s ease;
  border-radius: 3px;
}

@keyframes capps-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>