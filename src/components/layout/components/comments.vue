<template>
  <div>
    <div class="about" style="text-overflow: ellipsis;">{{configuration.comments}}</div>
  </div>
</template>

<script>
export default {
  props: { configuration: Object },
  data ()  {
    return {comments : this.configuration.comments};;
  },
  methods: {
    configure() {
      let comment = window.prompt("Enter the comments", this.comments);
      if (comment) this.configuration.comments = comment;
      return this.configuration;
    }
  }
};
</script>