<template>
  <div>
    <v-btn color="blue darken-1"
      icon link left
      target="_blank"
      v-if="influencerInfo.facebook"
      :href="influencerInfo.facebook" >
      <v-icon>socicon-facebook</v-icon>
    </v-btn>
    <v-btn color="blue darken-4"
      icon link left
      target="_blank"
      v-if="influencerInfo.instagram"
      :href="`https://instagram.com/${influencerInfo.instagram}`" >
      <v-icon>socicon-instagram</v-icon>
    </v-btn>
    <v-btn color="blue lighten-2"
      v-if="influencerInfo.twitter"
      icon link left
      :href="`https://twitter.com/${influencerInfo.twitter}`"
      target="_blank">
      <v-icon>socicon-twitter</v-icon>
    </v-btn>
    <v-btn color="red darken-1"
      v-if="influencerInfo.youtube"
      icon link left
      :href="influencerInfo.youtube"
      target="_blank">
      <v-icon>socicon-youtube</v-icon>
    </v-btn>
    <v-btn color="red darken-1"
      v-if="influencerInfo.tiktok"
      icon link left
      :href="influencerInfo.tiktok"
      target="_blank">
      <v-icon>socicon-youtube</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  props: ['influencerInfo'],
  mounted() {
    console.log(this.$props)
  }
}
</script>
