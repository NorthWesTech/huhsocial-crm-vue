<template>
  <div class="info-brief">
    <h4><i class="mdi mdi-note-text-outline"></i> Briefs</h4>
    <p
      v-html="influencer.brief"
      contenteditable="true"
      class="info-brief--edit"
      :class="{ placeholder: !influencer.brief }"
      ref="briefArea"
      @focus="onFocusBrief"
    ></p>
    <div class="info-brief--actions">
      <button type="button" class="info-brief--btn link" @click="onBriefCancel" v-if="!loading">Cancel</button>
      <button type="button" class="info-brief--btn primary" @click="onBriefSave">
        <span v-if="!loading">Save</span>
        <i v-else class="fa fa-circle-o-notch fa-spin"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    influencer: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    onFocusBrief() {
      this.$refs.briefArea.parentElement.classList.add("editable");
    },
    async onBriefSave() {
      this.loading = true;
      this.influencer.brief = this.$refs.briefArea.innerHTML;
      const result = this.$influencerService.edit(this.influencer);
      if (result) {
        this.loading = false;
        this.$refs.briefArea.parentElement.classList.remove("editable");
      }
    },
    onBriefCancel() {
      this.$refs.briefArea.innerHTML = this.influencer.brief;
      this.$refs.briefArea.parentElement.classList.remove("editable");
    }
  }
};
</script>

<style lang="scss" scoped>
@mixin focusVisible {
  background: #f9f9f9;
  outline: none;
  border: 2px dashed #ccc;
  &.placeholder {
    &:after {
      content: "";
    }
  }
}

.info-brief {
  //   width: 30%;
  text-align: justify;
  padding-left: 16px;
  height: 100%;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
  margin-bottom: 0.5rem;

  &--edit {
    background: rgb(225, 240, 255);
    padding: 1rem;
    width: calc(100% - 2rem);
    height: 245px;
    overflow: auto;
    margin-bottom: 4px;
    border-radius: 4px;

    &.placeholder {
      &:after {
        content: "Enter brief notes here...";
        position: absolute;
        font-style: italic;
      }
    }

    .editable & {
      @include focusVisible;
    }

    &.focus-visible {
      @include focusVisible;
    }
  }

  &--actions {
    position: absolute;
    bottom: -1rem;
    right: 2rem;
    display: none;

    .editable & {
      display: block;
    }
  }

  &--btn {
    padding: 0px 12px;
    border-radius: 5px;
    outline: none !important;
    // display: none;
    &.primary {
      background: #2976d2;
      color: #fff;
    }
    &.link {
      background: transparent;
      color: #333;
    }
  }
}
</style>
