<template>
  <div :class="['comment-section-wrapper', { 'modal-comments': isInModal }]">
    <!-- Separator Line -->
    <div class="section-divider"></div>
    
    <!-- Sticky Placeholder - maintains space when comments become sticky -->
    <div 
      v-if="isSticky" 
      class="sticky-placeholder"
      :style="{ height: stickyPlaceholderHeight + 'px' }"
    ></div>
    
    <!-- Comments Section -->
    <div 
      :class="['comment-section-container', { 'sticky-active': isSticky }]"
      :style="{ 
        '--sticky-top': stickyTop + 'px',
        '--sticky-left': stickyLeft + 'px',
        '--sticky-right': stickyRight + 'px'
      }"
      ref="commentsContainer"
    >
      <div class="comment-section-header">
        <div class="header-left">
          <h4 class="section-title">Comments</h4>
        </div>
        <div class="comment-sort-dropdown">
          <div class="simple-dropdown" @click="toggleDropdown">
            <span class="dropdown-text">{{ sortLabel }}</span>
            <svg 
              class="dropdown-arrow" 
              :class="{ 'open': isDropdownOpen }"
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 4.5L6 7.5L9 4.5" 
                stroke="currentColor" 
                stroke-width="1.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div v-if="isDropdownOpen" class="dropdown-menu-custom">
            <div 
              class="dropdown-item-custom"
              :class="{ active: sortOrder === 'DESC' }"
              @click="setSortOrder('DESC')"
            >
              Newest First
            </div>
            <div 
              class="dropdown-item-custom"
              :class="{ active: sortOrder === 'ASC' }"
              @click="setSortOrder('ASC')"
            >
              Oldest First
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scrollable Comments Content -->
      <div 
        class="comments-scrollable-content scroll-y"
        :class="{ 'sticky-scrollable': isSticky }"
        ref="commentsScrollContainer"
      >
        <!-- Comment Input Section -->
      <div class="comment-input-section">
        <div class="comment-composer">
          <div class="composer-avatar">
            <img 
              v-if="currentUserAvatar" 
              :src="currentUserAvatar" 
              :alt="currentUserId"
              class="user-avatar-img"
            >
            <div v-else class="user-avatar-placeholder">
              {{ getUserInitials(currentUserName) }}
            </div>
          </div>
          <div class="composer-content">
            <div class="composer-input-wrapper">
              <b-form-textarea
                ref="commentTextarea"
                v-model="newComment"
                placeholder="Add a comment... (Use @ to mention users)"
                rows="3"
                max-rows="6"
                maxlength="4000"
                :disabled="isCommentSubmitting"
                class="comment-textarea"
                @input="handleTextareaInput"
                @keydown.ctrl.enter="submitComment"
                @keydown.meta.enter="submitComment"
                @keydown="handleTextareaKeydown"
                @focus="isComposerFocused = true"
                @blur="handleComposerBlur"
              ></b-form-textarea>

              <!-- Mention Dropdown -->
              <div
                v-if="showMentionDropdown && filteredMentionUsers.length > 0"
                class="mention-dropdown"
                ref="mentionDropdown"
              >
                <div
                  v-for="(user, index) in filteredMentionUsers"
                  :key="user.USER_ID || user.id"
                  :class="['mention-item', { 'selected': index === selectedMentionIndex }]"
                  @mousedown.prevent="selectMention(user)"
                  @mouseenter="selectedMentionIndex = index"
                >
                  <div class="mention-avatar">
                    <div :class="['user-avatar-placeholder-small', getAvatarColorForUser(user)]">
                      {{ getUserInitials(user.USER_NAME || user.USER_ID || 'U') }}
                    </div>
                  </div>
                  <div class="mention-info">
                    <div class="mention-name">{{ user.USER_NAME || 'Unknown' }}</div>
                    <div class="mention-id">@{{ user.USER_ID || user.id }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Character count display -->
              <div 
                v-if="newComment.length > 0" 
                :class="['character-count', characterCountClass]"
              >
                {{ newComment.length }}/4000
              </div>
              
              <!-- Comment button positioned inside the textarea area -->
              <div class="composer-inline-button">
                <button 
                  type="button" 
                  :class="['comment-btn-inline', { 'active': newComment.trim().length > 0 }]"
                  :disabled="!newComment.trim() || isCommentSubmitting || newComment.length > 4000"
                  @click="submitComment"
                  title="Add comment"
                >
                  <div v-if="isCommentSubmitting" class="btn-spinner">
                    <div class="btn-spinner-dot"></div>
                    <div class="btn-spinner-dot"></div>
                    <div class="btn-spinner-dot"></div>
                  </div>
                  <span v-else>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments List Section -->
      <div class="comments-list-section">
        <!-- Loading State -->
        <transition name="fade" mode="out-in">
          <div v-if="isCommentsLoading" key="loading" class="loading-state">
            <div class="advanced-spinner">
              <!-- Main spinner with rotating rings -->
              <div class="spinner-container">
                <div class="spinner-outer-ring"></div>
                <div class="spinner-middle-ring"></div>
                <div class="spinner-inner-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>
            </div>
            <div class="loading-text-enhanced">
              <span class="loading-text-main">Loading comments</span>
              <div class="loading-dots">
                <span class="loading-dot">.</span>
                <span class="loading-dot">.</span>
                <span class="loading-dot">.</span>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="comments.length === 0" key="empty" class="empty-state">
            <div class="empty-comments-icon mb-2">
              <b-icon icon="chat-left" font-scale="2" class="text-muted"></b-icon>
            </div>
            <div class="text-muted">No comments yet.</div>
            <small class="text-muted">
              Be the first to add a comment!
            </small>
          </div>
          
          <!-- Activity Section -->
          <div v-else key="comments" class="activity-section">
            <div class="activity-header" v-show="!isInModal">
              <h4 class="section-title">Activity</h4>
            </div>
            
            <transition-group name="slide-fade" tag="div" class="activity-list">
              <div
                v-for="comment in processedComments"
                :key="comment.ID"
                class="activity-item"
              >
                <div class="activity-avatar">
                  <img 
                    v-if="comment.avatar" 
                    :src="comment.avatar" 
                    :alt="comment.AUTHOR_NAME"
                    class="user-avatar-img"
                  >
                  <div v-else :class="['user-avatar-placeholder', comment.avatarColorClass]">
                    {{ comment.initials }}
                  </div>
                </div>
                
                <div class="activity-content">
                  <div class="activity-text">
                    <span class="activity-author">{{ comment.AUTHOR_NAME }}</span>
                    <span class="activity-action">{{ comment.actionText }}</span>
                    <span class="activity-time">{{ comment.relativeTime }}</span>
                  </div>
                  
                  <div v-if="comment.COMMENT_TEXT && comment.COMMENT_TEXT.trim()" class="activity-comment scroll-y">
                    <div class="comment-text" v-html="comment.isExpanded ? comment.processedText.full : comment.processedText.truncated"></div>
                    <button
                      v-if="comment.hasLongText"
                      class="view-more-btn"
                      @click="toggleCommentExpansion(comment.ID)"
                    >
                      {{ comment.isExpanded ? 'View less' : 'View more' }}
                    </button>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </transition>
      </div>
      </div> <!-- Close comments-scrollable-content -->
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { globalDateFormatLong } from "config";
import config from "config";
import capps from "capps";

export default {
  name: 'CommentSection',
  props: {
    moduleName: {
      type: String,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    recordId: {
      type: [String, Number],
      required: true
    },
    isReadOnly: {
      type: Boolean,
      default: false
    },
    isSideBarOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      comments: [],
      newComment: '',
      isCommentsLoading: false,
      isCommentSubmitting: false,
      isComposerFocused: false,
      sortOrder: 'DESC', // 'DESC' for newest first, 'ASC' for oldest first
      isDropdownOpen: false,
      isSticky: false,
      stickyTop: 0,
      stickyLeft: 0,
      stickyRight: 0,
      stickyPlaceholderHeight: 0,
      currentScrollTop: 0,
      formHeaderElement: null,
      commentsElement: null,
      scrollContainer: null,
      expandedComments: {}, // Track which comments are expanded
      // Mention/Tagging feature
      showMentionDropdown: false,
      mentionSearchQuery: '',
      mentionUsers: [],
      selectedMentionIndex: 0,
      mentionCursorPosition: 0,
      mentionedUsers: [], // Track users mentioned in current comment
      userSearchDebounceTimer: null // Debounce timer for user search
    };
  },
  computed: {
    currentUserId() {
      // Get current user ID from global config session storage
      try {
        const session = config.getSessionStorage();
        return session.userid || 'Anonymous';
      } catch (error) {
        console.warn('Could not access session storage:', error);
        return 'Anonymous';
      }
    },
    currentUserName() {
      // Get current user name from global config session storage
      try {
        const session = config.getSessionStorage();
        return session.user_name || this.currentUserId;
      } catch (error) {
        console.warn('Could not access session storage:', error);
        return this.currentUserId;
      }
    },
    currentUserAvatar() {
      // Get current user avatar from session/store (if available in future)
      return null; // No avatar in session storage currently
    },
    
    isInModal() {
      // Check if component is being used in module route context
      // Look for ModuleDisplay or check if we have moduleName prop (indicating module usage)
      let parent = this.$parent;
      while (parent) {
        if (parent.$options.name === 'ModuleDisplay' || 
            parent.$options.name === 'ModuleDisplayWrapper') {
          return true;
        }
        parent = parent.$parent;
      }
      // Also check if this is a standalone module usage by checking props
      return this.$route && this.$route.path && this.$route.path.includes('/module/');
    },
    
    sortLabel() {
      return this.sortOrder === 'DESC' ? 'Newest First' : 'Oldest First';
    },
    
    isAtTop() {
      if (!this.isSticky) return false;
      return this.currentScrollTop <= 5;
    },
    
    sortedComments() {
      // Since we're now sorting on the server side, just return the comments as-is
      return this.comments || [];
    },
    
    characterCountClass() {
      const length = this.newComment.length;
      const maxLength = 4000;
      
      if (length >= maxLength * 0.9) { // 90% or more
        return 'danger';
      } else if (length >= maxLength * 0.75) { // 75% or more
        return 'warning';
      }
      return '';
    },
    
    // Optimized computed properties for comment rendering
    processedComments() {
      return this.sortedComments.map(comment => ({
        ...comment,
        // Pre-compute all display values
        initials: this.getUserInitials(comment.AUTHOR_NAME),
        avatarColorClass: this.getAvatarColorClass(comment),
        avatar: this.getCommentAvatar(comment.AUTHOR_NAME),
        actionText: this.getCommentActionText(comment.COMMENT_TYPE),
        relativeTime: this.formatRelativeTime(comment.CREATED_ON),
        // Text processing
        hasLongText: comment.COMMENT_TEXT && comment.COMMENT_TEXT.length > 200,
        truncatedText: comment.COMMENT_TEXT && comment.COMMENT_TEXT.length > 200
          ? comment.COMMENT_TEXT.substring(0, 200) + '...'
          : comment.COMMENT_TEXT,
        fullText: comment.COMMENT_TEXT,
        isExpanded: this.expandedComments[comment.ID] || false,
        // Process mentions for display
        processedText: this.processMentionsForDisplay(comment.COMMENT_TEXT)
      }));
    },

    // Filtered mention users - now users are already filtered by API
    filteredMentionUsers() {
      // Since we're fetching filtered results from API, just return the users
      // Limited to 10 results from the API
      return this.mentionUsers.slice(0, 10);
    }
  },
  
  watch: {
    isSideBarOpen() {
      // When sidebar opens/closes, recalculate sticky behavior
      this.$nextTick(() => {
        if (this.isSideBarOpen && this.isSticky) {
          // If sidebar opens while sticky, disable sticky
          this.isSticky = false;
        } else {
          // Force recalculation of sticky positioning
          this.handleScroll();
        }
      });
    }
  },
  
  async mounted() {
    await this.loadComments();
    // Add click outside listener
    document.addEventListener('click', this.handleClickOutside);
    // Initialize sticky behavior
    this.initializeStickyBehavior();
    // Add scroll event listener for sync
    this.addScrollDelegation();
  },
  
  beforeDestroy() {
    // Remove click outside listener
    document.removeEventListener('click', this.handleClickOutside);
    // Remove scroll listener
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }
    // Remove wheel event listener
    this.removeScrollDelegation();
    // Clear debounce timer
    if (this.userSearchDebounceTimer) {
      clearTimeout(this.userSearchDebounceTimer);
    }
  },
  methods: {
    async loadComments() {
      if (!this.recordId) return;
      
      this.isCommentsLoading = true;
      const startTime = Date.now();
      
      try {
        const response = await capps.rest[this.moduleName].comments.read({
          filter: [
            {
              field: "collection_name",
              asgn: "eq", 
              value: this.collection
            },
            {
              field: "record_id",
              asgn: "eq",
              value: this.recordId
            }
          ],
          sort: {
            field: "CREATED_ON",
            dir: this.sortOrder // Use dynamic sort order
          }
        }, { loader: false });
        
        if (Array.isArray(response)) {
          this.comments = response;
        } else {
          console.warn('Comments API returned unexpected format:', response);
          this.comments = [];
        }
      } catch (error) {
        console.error('Error loading comments:', error);
        capps.ui.toast({
          message: 'Failed to load comments',
          variant: 'danger'
        });
        this.comments = [];
      } finally {
        // Ensure minimum loading time to prevent flickering
        const minLoadingTime = 300; // 300ms minimum
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        if (remainingTime > 0) {
          setTimeout(() => {
            this.isCommentsLoading = false;
          }, remainingTime);
        } else {
          this.isCommentsLoading = false;
        }
      }
    },

    async submitComment() {
      if (!this.newComment.trim() || this.isCommentSubmitting || this.newComment.length > 4000) return;

      // Additional validation
      if (this.newComment.length > 4000) {
        capps.ui.toast({
          message: 'Comment cannot exceed 4000 characters',
          variant: 'danger'
        });
        return;
      }

      this.isCommentSubmitting = true;
      try {
        // Extract mentions from the comment text
        const mentionRegex = /@(\w+)/g;
        const matches = [...this.newComment.matchAll(mentionRegex)];
        const mentionedUserIds = [...new Set(matches.map(match => match[1]))]; // Remove duplicates

        const commentData = {
          COMMENT_TEXT: this.newComment.trim(),
          AUTHOR_NAME: this.currentUserName,
          COLLECTION_NAME: this.collection,
          RECORD_ID: this.recordId,
          COMMENT_TYPE: 'commented'
        };

        // Add mentioned users if any
        if (mentionedUserIds.length > 0) {
          commentData.MENTIONED_USERS = JSON.stringify(mentionedUserIds);
        }

        const response = await capps.rest[this.moduleName].comments.create({
          data: commentData
        }, { loader: false });

        if (response?.status === 'success' || response?.ID) {
          // Clear input and mentions
          this.newComment = '';
          this.mentionedUsers = [];
          this.showMentionDropdown = false;

          // Show success message
          capps.ui.toast({
            message: 'Comment added successfully',
            variant: 'success'
          });

          // Reload comments to show the new one
          await this.loadComments();
        } else {
          throw new Error(response?.error || 'Failed to add comment');
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
        capps.ui.toast({
          message: error.message || 'Failed to add comment',
          variant: 'danger'
        });
      } finally {
        this.isCommentSubmitting = false;
      }
    },

    formatRelativeTime(datetime) {
      if (!datetime) return '';
      
      const now = moment();
      const commentTime = moment(datetime, globalDateFormatLong);
      
      if (!commentTime.isValid()) {
        // Try parsing as ISO string if globalDateFormatLong fails
        const isoTime = moment(datetime);
        if (!isoTime.isValid()) return datetime;
        return this.calculateRelativeTime(now, isoTime);
      }
      
      return this.calculateRelativeTime(now, commentTime);
    },

    calculateRelativeTime(now, commentTime) {
      const diffMinutes = now.diff(commentTime, 'minutes');
      const diffHours = now.diff(commentTime, 'hours');
      const diffDays = now.diff(commentTime, 'days');
      
      if (diffMinutes < 1) return 'just now';
      if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      }
      
      return commentTime.format('MMM DD, YYYY');
    },

    getCommentIcon(commentType) {
      const iconMap = {
        'created': 'plus-circle',
        'edited': 'pencil',
        'commented': 'chat-left-text',
        'uploaded': 'cloud-upload',
        'deleted': 'trash',
        'approved': 'check-circle',
        'rejected': 'x-circle'
      };
      return iconMap[commentType] || 'chat-left-text';
    },

    getCommentIconClass(commentType) {
      const classMap = {
        'created': 'text-success',
        'edited': 'text-primary', 
        'commented': 'text-info',
        'uploaded': 'text-info',
        'deleted': 'text-danger',
        'approved': 'text-success',
        'rejected': 'text-danger'
      };
      return classMap[commentType] || 'text-info';
    },

    getCommentActionText(commentType) {
      const actionMap = {
        'created': 'created this record',
        'edited': 'edited this record',
        'commented': 'commented',
        'uploaded': 'uploaded this record',
        'deleted': 'deleted this record',
        'approved': 'approved this record',
        'rejected': 'rejected this record'
      };
      return actionMap[commentType] || 'commented';
    },

    getCommentAvatarClass(commentType) {
      const classMap = {
        'created': 'avatar-success',
        'edited': 'avatar-primary', 
        'commented': 'avatar-default',
        'uploaded': 'avatar-default',
        'deleted': 'avatar-danger',
        'approved': 'avatar-success',
        'rejected': 'avatar-danger'
      };
      return classMap[commentType] || 'avatar-default';
    },

    getCommentBubbleClass(commentType) {
      if (commentType !== 'commented') {
        return 'system-comment-bubble';
      }
      return 'user-comment-bubble';
    },

    handleComposerBlur() {
      // Simple blur handler for future use
      this.isComposerFocused = false;
    },

    cancelComment() {
      this.newComment = '';
      this.isComposerFocused = false;
    },

    getUserInitials(userName) {
      if (!userName || userName === 'Anonymous') return 'A';
      
      // Split by spaces and filter out empty strings
      const names = userName.trim().split(/\s+/).filter(name => name.length > 0);
      
      if (names.length >= 2) {
        // Use first letter of first two names
        return (names[0][0] + names[1][0]).toUpperCase();
      } else if (names.length === 1) {
        const name = names[0];
        if (name.length >= 2) {
          // For single names, use first two characters
          return name.slice(0, 2).toUpperCase();
        } else {
          return name.toUpperCase();
        }
      }
      
      return 'UN'; // Default for unknown/empty names
    },
    
    async setSortOrder(order) {
      this.sortOrder = order;
      this.isDropdownOpen = false;
      // Reload comments with new sort order
      await this.loadComments();
    },
    
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    
    getCommentAvatar(authorName) {
      // Return null for now, can be enhanced to fetch user avatars
      return null;
    },
    
    handleClickOutside(event) {
      // Close dropdown if clicking outside
      if (!this.$el.querySelector('.comment-sort-dropdown').contains(event.target)) {
        this.isDropdownOpen = false;
      }
    },
    
    getAvatarColorClass(comment) {
      // Generate consistent colors based on unique user identifier
      const colors = [
        'avatar-purple',
        'avatar-blue', 
        'avatar-green',
        'avatar-pink',
        'avatar-orange',
        'avatar-indigo',
        'avatar-teal',
        'avatar-red'
      ];
      
      // Use the most unique identifier available
      // Priority: AUTHOR_ID > CREATED_BY > combination of AUTHOR_NAME + CREATED_ON
      let uniqueIdentifier = '';
      
      if (comment.AUTHOR_ID) {
        uniqueIdentifier = comment.AUTHOR_ID.toString();
      } else if (comment.CREATED_BY) {
        uniqueIdentifier = comment.CREATED_BY.toString();
      } else if (comment.ID && comment.AUTHOR_NAME) {
        // Fallback: use combination of comment ID and author name for uniqueness
        uniqueIdentifier = `${comment.AUTHOR_NAME}_${comment.ID}`;
      } else {
        // Last resort: just use author name (existing behavior)
        uniqueIdentifier = comment.AUTHOR_NAME || 'Anonymous';
      }
      
      // Use a simple hash function to get consistent color for each unique user
      let hash = 0;
      for (let i = 0; i < uniqueIdentifier.length; i++) {
        const char = uniqueIdentifier.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      const colorIndex = Math.abs(hash) % colors.length;
      return colors[colorIndex];
    },
    
    initializeStickyBehavior() {
      // Find the specific elements for this form structure
      this.formHeaderElement = document.querySelector('.section-header');
      this.commentsElement = this.$el;
      
      // Find the collection form scroll container
      this.scrollContainer = document.querySelector('.capps-collection-form.scroll-y');
      
      if (!this.formHeaderElement || !this.commentsElement || !this.scrollContainer) {
        console.warn('Could not find required elements for sticky behavior:', {
          header: !!this.formHeaderElement,
          comments: !!this.commentsElement,
          scrollContainer: !!this.scrollContainer
        });
        return;
      }
      
      // Add scroll listener to the collection form container
      this.scrollContainer.addEventListener('scroll', this.handleScroll, { passive: true });
      
      // Initial check
      this.handleScroll();
    },
    
    getFormHeaderBottom() {
      // Get the bottom position of the form header including the HR line
      const headerRect = this.formHeaderElement.getBoundingClientRect();
      const hrElement = document.querySelector('.section-header + hr');
      
      if (hrElement) {
        const hrRect = hrElement.getBoundingClientRect();
        return hrRect.bottom;
      }
      
      return headerRect.bottom;
    },
    
    handleScroll() {
      if (!this.formHeaderElement || !this.commentsElement || !this.scrollContainer) return;
      
      const scrollContainerRect = this.scrollContainer.getBoundingClientRect();
      const commentsRect = this.commentsElement.getBoundingClientRect();
      const headerRect = this.formHeaderElement.getBoundingClientRect();
      
      // Simple sticky logic: stick when comments reach the header
      // BUT only if sidebar is not open
      const shouldBeSticky = !this.isSideBarOpen && 
                            commentsRect.top <= headerRect.bottom + 5 && 
                            commentsRect.bottom > scrollContainerRect.top;
      
      // Always recalculate positioning when sticky (to handle sidebar changes)
      if (this.isSticky || shouldBeSticky !== this.isSticky) {
        // Store the original height before making sticky
        if (!this.isSticky && shouldBeSticky) {
          this.stickyPlaceholderHeight = this.commentsElement.offsetHeight;
        }
        
        this.isSticky = shouldBeSticky;
        
        // Calculate positioning to maintain exact width
        if (this.isSticky) {
          this.stickyTop = headerRect.bottom;
          
          // Get the exact positioning from the original element's parent
          const parentElement = this.commentsElement.parentElement;
          const parentRect = parentElement.getBoundingClientRect();
          
          // Get the scroll container bounds for full width
          const scrollContainer = this.scrollContainer;
          const scrollContainerRect = scrollContainer.getBoundingClientRect();
          
          // Account for zoom-out effect when sidebar is open
          if (this.isSideBarOpen) {
            // When sidebar is open, use the scroll container's full bounds
            // but account for the zoom effect
            this.stickyLeft = scrollContainerRect.left;
            this.stickyRight = window.innerWidth - scrollContainerRect.right;
          } else {
            // Normal positioning when sidebar is closed - use scroll container bounds
            this.stickyLeft = scrollContainerRect.left;
            this.stickyRight = window.innerWidth - scrollContainerRect.right;
          }
        }
        
        // Emit event for parent components if needed
        this.$emit('sticky-state-changed', this.isSticky);
      }
    },
    
    addScrollDelegation() {
      // Use the scrollable container instead of the main container
      const scrollableContainer = this.$refs.commentsScrollContainer;
      if (scrollableContainer) {
        // Add scroll tracking for reactive updates
        scrollableContainer.addEventListener('scroll', this.trackScrollPosition, { passive: true });
        // Add wheel event listener for boundary scroll delegation
        scrollableContainer.addEventListener('wheel', this.handleBoundaryScroll, { passive: false });
      }
    },
    
    removeScrollDelegation() {
      const scrollableContainer = this.$refs.commentsScrollContainer;
      if (scrollableContainer) {
        scrollableContainer.removeEventListener('scroll', this.trackScrollPosition);
        scrollableContainer.removeEventListener('wheel', this.handleBoundaryScroll);
      }
    },
    
    handleBoundaryScroll(event) {
      // Only handle when comments are sticky
      if (!this.isSticky || !this.scrollContainer) return;
      
      const scrollableContainer = this.$refs.commentsScrollContainer;
      if (!scrollableContainer) return;
      
      const scrollTop = scrollableContainer.scrollTop;
      const scrollHeight = scrollableContainer.scrollHeight;
      const clientHeight = scrollableContainer.clientHeight;
      const deltaY = event.deltaY;
      
      // Check if there's scrollable content in comments
      const hasScrollableContent = scrollHeight > clientHeight;
      
      if (!hasScrollableContent) {
        // No scrollable content, delegate all scrolling to parent
        event.preventDefault();
        this.scrollContainer.scrollBy({
          top: deltaY,
          behavior: 'auto'
        });
        return;
      }
      
      // Very precise boundary detection
      const atExactTop = scrollTop === 0;
      const atExactBottom = scrollTop >= (scrollHeight - clientHeight - 1);
      
      // ONLY delegate at EXACT boundaries with specific scroll directions
      if (atExactTop && deltaY < 0) {
        // Exactly at top AND trying to scroll up
        event.preventDefault();
        
        // Calculate the exact position of comments section in parent scroll
        const commentsRect = this.commentsElement.getBoundingClientRect();
        const containerRect = this.scrollContainer.getBoundingClientRect();
        const commentsPositionInParent = commentsRect.top - containerRect.top + this.scrollContainer.scrollTop;
        
        // Scroll parent to the exact position of comments section
        this.scrollContainer.scrollTo({
          top: commentsPositionInParent,
          behavior: 'smooth'
        });
      } else if (atExactBottom && deltaY > 0) {
        // Exactly at bottom AND trying to scroll down -> delegate to parent
        event.preventDefault();
        this.scrollContainer.scrollBy({
          top: deltaY,
          behavior: 'auto'
        });
      }
      
      // For ALL other cases, do NOTHING - let normal scrolling happen
      // This includes:
      // - Scrolling down when at top (let comments scroll down)
      // - Scrolling up when at bottom (let comments scroll up)  
      // - Any scrolling in middle ranges (let comments scroll normally)
    },
    
    trackScrollPosition() {
      const scrollableContainer = this.$refs.commentsScrollContainer;
      if (scrollableContainer) {
        this.currentScrollTop = scrollableContainer.scrollTop;
      }
    },
    
    toggleCommentExpansion(commentId) {
      this.$set(this.expandedComments, commentId, !this.expandedComments[commentId]);
    },

    // ============================================
    // MENTION/TAGGING METHODS
    // ============================================

    async loadAvailableUsers(searchQuery = '') {
      try {
        // Try to fetch users from vr_user_master collection via REST API with search filter
        try {
          const filters = [];

          // If there's a search query, add filter for USER_NAME or USER_ID
          if (searchQuery) {
            // Try to search by USER_NAME or USER_ID (using 'like' operator)
            filters.push({
              field: "USER_NAME",
              asgn: "like",
              value: `%${searchQuery}%`
            });
          }

          const requestParams = {
            limit: 10 // Limit to 10 users for dropdown
          };

          if (filters.length > 0) {
            requestParams.filter = filters;
          }

          const response = await capps.rest[this.moduleName].vr_user_master.read(
            requestParams,
            { loader: false }
          );

          if (Array.isArray(response) && response.length > 0) {
            this.mentionUsers = response;
            return;
          }

          // If no results, try with USER_ID field
          if (searchQuery && response.length === 0) {
            const response2 = await capps.rest[this.moduleName].vr_user_master.read({
              filter: [{
                field: "USER_ID",
                asgn: "like",
                value: `%${searchQuery}%`
              }],
              limit: 10
            }, { loader: false });

            if (Array.isArray(response2)) {
              this.mentionUsers = response2;
              return;
            }
          }

        } catch (error) {
          // vr_user_master collection might not exist, log and continue to fallback
          console.log('vr_user_master collection not available or error fetching:', error.message);
        }

        // Fallback: Try to get users from session storage
        const session = config.getSessionStorage();
        if (session.users && Array.isArray(session.users)) {
          // Filter users based on search query if provided
          if (searchQuery) {
            this.mentionUsers = session.users.filter(user => {
              const userName = (user.name || user.user_name || '').toLowerCase();
              const userId = (user.userid || user.id || '').toString().toLowerCase();
              const query = searchQuery.toLowerCase();
              return userName.includes(query) || userId.includes(query);
            }).slice(0, 10);
          } else {
            this.mentionUsers = session.users.slice(0, 10);
          }
          return;
        }

        // Last fallback - Show current user only
        const fallbackUser = {
          userid: session.userid || 'current_user',
          name: session.user_name || 'Current User',
          user_name: session.user_name || 'Current User',
          id: session.userid
        };

        // Filter fallback user based on search
        if (searchQuery) {
          const userName = (fallbackUser.name || '').toLowerCase();
          const userId = (fallbackUser.userid || '').toLowerCase();
          const query = searchQuery.toLowerCase();
          if (userName.includes(query) || userId.includes(query)) {
            this.mentionUsers = [fallbackUser];
          } else {
            this.mentionUsers = [];
          }
        } else {
          this.mentionUsers = [fallbackUser];
        }

      } catch (error) {
        console.error('Error loading users for mentions:', error);
        this.mentionUsers = [];
      }
    },

    handleTextareaInput(event) {
      const textarea = this.$refs.commentTextarea.$el;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = this.newComment.substring(0, cursorPosition);

      // Check if we're typing after an @ symbol
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        // Show mention dropdown
        this.showMentionDropdown = true;
        this.mentionSearchQuery = mentionMatch[1]; // Text after @
        this.mentionCursorPosition = cursorPosition - mentionMatch[0].length;
        this.selectedMentionIndex = 0; // Reset selection

        // Clear existing timer
        if (this.userSearchDebounceTimer) {
          clearTimeout(this.userSearchDebounceTimer);
        }

        // Debounce user search API call (300ms delay)
        this.userSearchDebounceTimer = setTimeout(async () => {
          await this.loadAvailableUsers(this.mentionSearchQuery);
        }, 300);
      } else {
        // Hide mention dropdown
        this.showMentionDropdown = false;
        this.mentionSearchQuery = '';
        this.mentionUsers = []; // Clear users when not searching

        // Clear debounce timer
        if (this.userSearchDebounceTimer) {
          clearTimeout(this.userSearchDebounceTimer);
          this.userSearchDebounceTimer = null;
        }
      }
    },

    handleTextareaKeydown(event) {
      if (!this.showMentionDropdown) return;

      // Handle arrow keys and Enter when mention dropdown is open
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedMentionIndex = Math.min(
          this.selectedMentionIndex + 1,
          this.filteredMentionUsers.length - 1
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedMentionIndex = Math.max(this.selectedMentionIndex - 1, 0);
      } else if (event.key === 'Enter' && this.filteredMentionUsers.length > 0) {
        event.preventDefault();
        const selectedUser = this.filteredMentionUsers[this.selectedMentionIndex];
        if (selectedUser) {
          this.selectMention(selectedUser);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.showMentionDropdown = false;
      }
    },

    selectMention(user) {
      const textarea = this.$refs.commentTextarea.$el;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = this.newComment.substring(0, cursorPosition);
      const textAfterCursor = this.newComment.substring(cursorPosition);

      // Find the @ symbol position
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
      if (!mentionMatch) return;

      const atSymbolPosition = cursorPosition - mentionMatch[0].length;
      const username = user.USER_ID || user.id;

      // Replace the @search with @username
      const newText =
        this.newComment.substring(0, atSymbolPosition) +
        `@${username} ` +
        textAfterCursor;

      this.newComment = newText;

      // Track mentioned user
      if (!this.mentionedUsers.find(u => u.USER_ID === user.USER_ID)) {
        this.mentionedUsers.push({
          USER_ID: user.USER_ID || user.id,
          USER_NAME: user.USER_NAME
        });
      }

      // Hide dropdown
      this.showMentionDropdown = false;
      this.mentionSearchQuery = '';

      // Set cursor position after the mention
      this.$nextTick(() => {
        const newCursorPosition = atSymbolPosition + username.length + 2; // +2 for @ and space
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      });
    },

    processMentionsForDisplay(text) {
      if (!text) return { full: '', truncated: '' };

      // Regular expression to match @username patterns
      const mentionRegex = /@(\w+)/g;

      // Function to highlight mentions
      const highlightMentions = (str) => {
        return str.replace(mentionRegex, '<span class="comment-mention">@$1</span>');
      };

      // Process full text
      const fullText = highlightMentions(text);

      // Process truncated text
      let truncatedText = text;
      if (text.length > 200) {
        truncatedText = text.substring(0, 200) + '...';
      }
      const truncatedHighlighted = highlightMentions(truncatedText);

      return {
        full: fullText,
        truncated: truncatedHighlighted
      };
    },

    getAvatarColorForUser(user) {
      const colors = [
        'avatar-purple',
        'avatar-blue',
        'avatar-green',
        'avatar-pink',
        'avatar-orange',
        'avatar-indigo',
        'avatar-teal',
        'avatar-red'
      ];

      const uniqueId = user.userid || user.id || user.name || '';
      let hash = 0;
      for (let i = 0; i < uniqueId.length; i++) {
        const char = uniqueId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      const colorIndex = Math.abs(hash) % colors.length;
      return colors[colorIndex];
    },

  }
};
</script>

<style lang="scss" scoped>
// Main wrapper
.comment-section-wrapper {
  // margin-top: 2rem;
  position: relative;
  margin-top: 1.5rem;
  
  // Modal-specific styling
  &.modal-comments {
    margin-top: 0;
    
    .section-divider {
      display: none; /* Hide separator line in module mode */
    }
    
    .comment-section-container {
      border: none;
      border-radius: 0;
      box-shadow: none;
      background: transparent;
      padding: 0;
      width: 100%;
    }
    
    .comment-section-header {
      margin-bottom: 0.5rem;
      
      .header-left {
        display: block; // Show Comments title in modal
      }
    }
    
    .activity-header {
      display: none; // Hide Activity title in modal
    }
    
    .activity-section {
      margin-top: 0;
    }
  }
  
  ::v-deep .comment-section-card {
    box-shadow: 0 1px 8px rgba(60,60,100,0.08);
    border: 1px solid #e0e7ef;
  }
  
  // Match the zoom-out effect when sidebar is open
  .zoom-out & {
    transform: scale(0.95);
    transform-origin: 50% 20%;
  }
}

// Section divider
.section-divider {
  height: 1px;
  background: #e5e7eb;
  margin-bottom: 2rem;
}

// Sticky placeholder - maintains space when comments become fixed
.sticky-placeholder {
  width: 100%;
  background: transparent;
  pointer-events: none;
}

// Animations
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

// Container
.comment-section-container {
  width: 100%;
  margin: 0;
  background: #ffffff;
  border-radius: 8px;
  transition: none; // Remove transition to prevent jerky movement
  
  &.sticky-active {
    position: fixed;
    top: var(--sticky-top, 120px);
    left: var(--sticky-left, 0);
    right: var(--sticky-right, 0);
    width: auto; // Let left/right positioning handle width
    z-index: 1000;
    border-top: 1px solid #e5e7eb; // Add top horizontal line
    border-bottom: 1px solid #e5e7eb; // Add bottom horizontal line
    padding: 1rem 0; // Remove padding to prevent movement
    margin: 0;
    max-height: calc(100vh - var(--sticky-top, 120px) - 20px);
    display: flex;
    flex-direction: column;
    
    // Clean background when sticky
    background: #ffffff;
    
    // Adjust section divider when sticky
    .section-divider {
      display: none;
    }
    
    // Keep same spacing when sticky
    .comment-section-header {
      flex-shrink: 0;
    }
    
    // Scrollable content should take remaining space
    .comments-scrollable-content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }
  }
}

// Scrollable content container
.comments-scrollable-content {  
  &.sticky-scrollable {
    // When sticky, enable internal scrolling
    max-height: calc(100vh - var(--sticky-top, 120px) - 100px);
    overflow-y: auto;
  }
}

// Section headers
.comment-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  // Modal-specific adjustments
  .modal-comments & {
    margin-bottom: 1rem;
    
    // When title is hidden, reduce spacing
    &:empty, &:has(.header-left:empty) {
      margin-bottom: 0.5rem;
    }
  }
  
  .header-left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
}

.activity-header {
  margin-bottom: 1.5rem;
  
  .modal-comments & {
    margin-bottom: 1rem;
  }
}

.comment-sort-dropdown {
  position: relative;
  
  .simple-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 400;
    
    &:hover {
      color: #374151;
    }
    
    .dropdown-text {
      margin-right: 4px;
    }
    
    .dropdown-arrow {
      color: #6b7280;
      transition: transform 0.2s ease;
      
      &.open {
        transform: rotate(180deg);
      }
    }
  }
  
  .dropdown-menu-custom {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 1000;
    min-width: 120px;
    margin-top: 4px;
    
    .dropdown-item-custom {
      padding: 8px 12px;
      font-size: 0.875rem;
      color: #374151;
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: #f3f4f6;
      }
      
      &.active {
        background-color: #eff6ff;
        color: #2563eb;
      }
      
      &:first-child {
        border-radius: 8px 8px 0 0;
      }
      
      &:last-child {
        border-radius: 0 0 8px 8px;
      }
    }
  }
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;
}

// Comment Composer Section
.comment-input-section {
  margin-bottom: 1rem;
}

.comment-composer {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.composer-avatar {
  flex-shrink: 0;
  
  .user-avatar-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .user-avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    border: 1px solid #e5e7eb;
  }
}

.composer-content {
  flex: 1;
  min-width: 0;
}

.composer-input-wrapper {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:focus-within {
    border-color: #d1d5db;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.comment-textarea {
  border: none;
  background: transparent;
  padding: 12px 16px;
  padding-right: 100px;
  padding-bottom: 50px;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  width: 100%;
  outline: none;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:focus {
    outline: none;
    box-shadow: none;
  }
  
  // Custom scrollbar styling
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    border: 2px solid #f1f5f9;
    
    &:hover {
      background: #94a3b8;
    }
  }
  
  // Firefox scrollbar
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.character-count {
  position: absolute;
  bottom: 50px;
  right: 16px;
  font-size: 0.75rem;
  color: #9ca3af;
  pointer-events: none;
  z-index: 5;
  
  &.warning {
    color: #f59e0b;
  }
  
  &.danger {
    color: #dc2626;
  }
}

.composer-inline-button {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;
}

.comment-btn-inline {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: 70px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  // Disabled state (default when no text)
  &:disabled {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
    opacity: 1;
  }
  
  // Active state (when text is present)
  &:not(:disabled) {
    background: #3b82f6;
    border: 1px solid #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: 80px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  // Disabled state (default when no text)
  &:disabled {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
    opacity: 1; // Keep full opacity for better visibility
  }
  
  // Active state (when text is present)
  &:not(:disabled) {
    background: #3b82f6;
    border: 1px solid #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  }
}

.btn-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.btn-spinner-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: btn-spinner-bounce 1.4s infinite ease-in-out both;
  
  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  &:nth-child(3) {
    animation-delay: 0s;
  }
}

@keyframes btn-spinner-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// Comments List Section
.comments-list-section {
  min-height: auto;
  position: relative;
}

.loading-state {
  text-align: center;
  padding: 0.5rem 0;
  min-height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

// Advanced Spinner Design (Compact Version)
.advanced-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}

.spinner-container {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-outer-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-top: 2px solid #3b82f6;
  border-right: 2px solid #3b82f680;
  border-radius: 50%;
  animation: spin-clockwise 2s linear infinite;
}

.spinner-middle-ring {
  position: absolute;
  width: 75%;
  height: 75%;
  border: 2px solid transparent;
  border-left: 2px solid #10b981;
  border-bottom: 2px solid #10b98180;
  border-radius: 50%;
  animation: spin-counter-clockwise 1.5s linear infinite;
}

.spinner-inner-dots {
  position: absolute;
  width: 50%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .dot {
    width: 4px;
    height: 4px;
    margin: 0 1px;
    border-radius: 50%;
    background: #8b5cf6;
    animation: pulse-dots 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.3s; }
    &:nth-child(2) { animation-delay: -0.15s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
}

// Enhanced Loading Text
.loading-text-enhanced {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.loading-text-main {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 0.25rem;
}

.loading-dots {
  display: flex;
  
  .loading-dot {
    color: #3b82f6;
    font-weight: bold;
    animation: text-dots 1.5s infinite;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

// Advanced Spinner Animations
@keyframes spin-clockwise {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spin-counter-clockwise {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}

@keyframes pulse-dots {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes text-dots {
  0%, 60%, 100% {
    opacity: 0.4;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.empty-state {
  text-align: center;
  padding: 1rem 0;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-comments-icon {
  opacity: 0.5;
}

// Activity Section
.activity-section {
  margin-top: 1.5rem;
  
  .modal-comments & {
    margin-top: 1rem;
  }
}

.activity-list {
  margin: 0;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 1.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.activity-avatar {
  flex-shrink: 0;
  margin-top: 0px; // Align with first line of text
  
  .user-avatar-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .user-avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    border: none;
    
    &.avatar-purple {
      background: #8b5cf6;
    }
    
    &.avatar-blue {
      background: #3b82f6;
    }
    
    &.avatar-green {
      background: #10b981;
    }
    
    &.avatar-pink {
      background: #ec4899;
    }
    
    &.avatar-orange {
      background: #f59e0b;
    }
    
    &.avatar-indigo {
      background: #6366f1;
    }
    
    &.avatar-teal {
      background: #14b8a6;
    }
    
    &.avatar-red {
      background: #ef4444;
    }
    
    // Default fallback
    &:not(.avatar-purple):not(.avatar-blue):not(.avatar-green):not(.avatar-pink):not(.avatar-orange):not(.avatar-indigo):not(.avatar-teal):not(.avatar-red) {
      background: #f3f4f6;
      color: #6b7280;
      border: 1px solid #e5e7eb;
    }
  }
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  line-height: 1.5;
  margin-bottom: 6px;
  
  .activity-author {
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
  }
  
  .activity-action {
    color: #6b7280;
    font-size: 0.875rem;
    margin-left: 4px;
  }
  
  .activity-time {
    color: #9ca3af;
    font-size: 0.875rem;
    margin-left: 4px;
  }
}

.activity-comment {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 9px 10px;
  margin-top: 8px;
  color: #212529;
  font-size: 0.875rem;
  line-height: 1.5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-height: 10px; // Set minimum height
  max-height: 10rem; // Minimum height for comment text
  
  .comment-text {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin-bottom: 0.5rem;
  }
  
  .view-more-btn {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    
    &:hover {
      color: #1d4ed8;
      text-decoration: none;
    }
    
    &:focus {
      outline: none;
      color: #1d4ed8;
    }
  }
}

// Smooth Transitions
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// Individual comment transitions
.slide-fade-enter-active {
  transition: all 0.4s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-move {
  transition: transform 0.4s ease;
}

// Legacy animation for backwards compatibility
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .comment-section-wrapper {
    margin-top: 1.5rem;
  }
  
  .section-divider {
    margin-bottom: 1.5rem;
  }
  
  .comment-composer {
    gap: 8px;
  }
  
  .composer-avatar {
    .user-avatar-img,
    .user-avatar-placeholder {
      width: 32px;
      height: 32px;
      font-size: 0.75rem;
    }
  }
  
  .comment-textarea {
    font-size: 0.8rem;
    padding: 10px 12px;
    padding-right: 70px; // Adjust for send button on mobile
  }
  
  .comment-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
    min-width: 70px;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .activity-item {
    gap: 8px;
    margin-bottom: 0.75rem;
  }
  
  .activity-avatar {
    .user-avatar-img,
    .user-avatar-placeholder {
      width: 28px;
      height: 28px;
      font-size: 0.7rem;
    }
  }
  
  .activity-text {
    .activity-author,
    .activity-action,
    .activity-time {
      font-size: 0.8rem;
    }
  }
  
  .activity-comment {
    font-size: 0.8rem;
    padding: 10px 12px;
  }
}

// ============================================
// MENTION/TAGGING STYLES
// ============================================

.mention-dropdown {
  position: absolute;
  top: 100%;
  left: 16px;
  right: 16px;
  max-width: 400px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover,
  &.selected {
    background-color: #f3f4f6;
  }

  &.selected {
    background-color: #eff6ff;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
}

.mention-avatar {
  flex-shrink: 0;
}

.user-avatar-placeholder-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border: none;

  &.avatar-purple {
    background: #8b5cf6;
  }

  &.avatar-blue {
    background: #3b82f6;
  }

  &.avatar-green {
    background: #10b981;
  }

  &.avatar-pink {
    background: #ec4899;
  }

  &.avatar-orange {
    background: #f59e0b;
  }

  &.avatar-indigo {
    background: #6366f1;
  }

  &.avatar-teal {
    background: #14b8a6;
  }

  &.avatar-red {
    background: #ef4444;
  }
}

.mention-info {
  flex: 1;
  min-width: 0;
}

.mention-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mention-id {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// Highlighted mentions in comments
.comment-text ::v-deep .comment-mention {
  background: #dbeafe;
  color: #1e40af;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #bfdbfe;
    color: #1e3a8a;
  }
}
</style>