<template>
  <div class="social-media-links-container">
    <svg
      aria-hidden="true"
      style="position: absolute; width: 0; height: 0; overflow: hidden;"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <symbol id="icon-tiktok" viewBox="0 0 32 32">
          <path
            d="M16.707 0.027c1.747-0.027 3.48-0.013 5.213-0.027 0.107 2.040 0.84 4.12 2.333 5.56 1.493 1.48 3.6 2.16 5.653 2.387v5.373c-1.92-0.067-3.853-0.467-5.6-1.293-0.76-0.347-1.467-0.787-2.16-1.24-0.013 3.893 0.013 7.787-0.027 11.667-0.107 1.867-0.72 3.72-1.8 5.253-1.747 2.56-4.773 4.227-7.88 4.28-1.907 0.107-3.813-0.413-5.44-1.373-2.693-1.587-4.587-4.493-4.867-7.613-0.027-0.667-0.040-1.333-0.013-1.987 0.24-2.533 1.493-4.96 3.44-6.613 2.213-1.92 5.307-2.84 8.2-2.293 0.027 1.973-0.053 3.947-0.053 5.92-1.32-0.427-2.867-0.307-4.027 0.493-0.84 0.547-1.48 1.387-1.813 2.333-0.28 0.68-0.2 1.427-0.187 2.147 0.32 2.187 2.427 4.027 4.667 3.827 1.493-0.013 2.92-0.88 3.693-2.147 0.253-0.44 0.533-0.893 0.547-1.413 0.133-2.387 0.080-4.76 0.093-7.147 0.013-5.373-0.013-10.733 0.027-16.093z"
          ></path>
        </symbol>
      </defs>
    </svg>

    <div v-if="facebookLinks.length" class="d-inline-flex align-center flex-column mr-3">
      <v-btn class="white--text" color="facebook" fab icon small>
        <v-icon>mdi-facebook</v-icon>
      </v-btn>
      <div class="d-flex flex-column justify-center">
        <span>
          <strong>{{ formatFollowers(influencerInfo.fb_followers) }} </strong>
          <small>Followers</small>
        </span>
        <a :href="facebookLinks[0]" target="_blank"> View Profile <i class="mdi mdi-open-in-new"></i> </a>
        <v-menu v-if="facebookLinks.length > 1" bottom offset-y>
          <template #activator="{ on, attrs }">
            <a href="javascript:;" v-bind="attrs" style="text-decoration:none" v-on="on">
              +{{ facebookLinks.length - 1 }} more <i class="fa fa-angle-down"></i>
            </a>
          </template>
          <v-list>
            <v-list-item v-for="(item, i) in facebookLinks.slice(1, facebookLinks.length)" :key="i">
              <v-list-item-title>
                <a :href="item" target="_blank" class="social-media--link">
                  <i class="mdi mdi-facebook"></i> View Profile <i class="mdi mdi-open-in-new"></i>
                </a>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
    <div v-if="facebookLinks.length == 0" class="d-inline-flex mr-3">
      <v-btn class="white--text" depressed disabled target="_blank" fab icon small>
        <v-icon large>mdi-facebook</v-icon>
      </v-btn>
    </div>
    <div v-if="instagramLinks.length" class="d-inline-flex align-center flex-column mr-3">
      <v-btn class="white--text" color="instagram" fab icon small>
        <v-icon>mdi-instagram</v-icon>
      </v-btn>
      <div class="d-flex flex-column justify-center">
        <span>
          <strong>{{ formatFollowers(influencerInfo.instagram_followers) }} </strong>
          <small>Followers</small>
        </span>
        <a :href="`https://www.instagram.com/${instagramLinks[0]}`" target="_blank" class="social-media--link"
          >@{{ instagramLinks[0] }}</a
        >
        <v-menu v-if="instagramLinks.length > 1" bottom offset-y>
          <template #activator="{ on, attrs }">
            <a href="javascript:;" v-bind="attrs" style="text-decoration:none" v-on="on">
              +{{ instagramLinks.length - 1 }} more <i class="fa fa-angle-down"></i>
            </a>
          </template>
          <v-list>
            <v-list-item v-for="(item, i) in instagramLinks.slice(1, instagramLinks.length)" :key="i">
              <v-list-item-title>
                <a :href="`https://www.instagram.com/${item}`" target="_blank" class="social-media--link">
                  <i class="mdi mdi-instagram"></i> {{ item }}
                </a>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <!-- <a
          :href="`https://www.instagram.com/${link}`"
          target="_blank"
          class="social-media--link"
          v-for="link in instagramLinks"
          >@{{ link }}</a
        > -->
      </div>
    </div>
    <div v-if="instagramLinks.length == 0" class="d-inline-flex mr-3">
      <v-btn class="white--text" depressed disabled fab icon small>
        <v-icon large>mdi-instagram</v-icon>
      </v-btn>
    </div>
    <div v-if="youtubeLinks.length" class="d-inline-flex align-start flex-column mr-3">
      <v-btn class="white--text" color="youtube" fab icon small>
        <v-icon>mdi-youtube</v-icon>
      </v-btn>
      <div class="d-flex flex-column justify-center">
        <span>
          <strong>{{ formatFollowers(influencerInfo.youtube_followers) }} </strong>
          <small>Followers</small>
        </span>
        <a :href="youtubeLinks[0]" target="_blank"> View Profile <i class="mdi mdi-open-in-new"></i> </a>
        <v-menu v-if="youtubeLinks.length > 1" bottom offset-y>
          <template #activator="{ on, attrs }">
            <a href="javascript:;" v-bind="attrs" style="text-decoration:none" v-on="on">
              +{{ youtubeLinks.length - 1 }} more <i class="fa fa-angle-down"></i>
            </a>
          </template>
          <v-list>
            <v-list-item v-for="(item, i) in youtubeLinks.slice(1, youtubeLinks.length)" :key="i">
              <v-list-item-title>
                <a :href="item" target="_blank" class="social-media--link">
                  <i class="mdi mdi-youtube"></i> View Profile <i class="mdi mdi-open-in-new"></i>
                </a>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <!-- <a :href="link" v-for="link in youtubeLinks" target="_blank" class="social-media--link">{{
          link.replace("https://www.youtube.com", "").replace("https://youtube.com", "")
        }}</a> -->
      </div>
    </div>
    <div v-if="youtubeLinks.length == 0" class="d-inline-flex mr-3">
      <v-btn class="white--text" depressed disabled target="_blank" fab icon small>
        <v-icon large>mdi-youtube</v-icon>
      </v-btn>
    </div>
    <div v-if="twitterLinks.length" class="d-inline-flex align-center flex-column mr-3">
      <v-btn class="white--text" color="twitter" fab icon small>
        <v-icon>mdi-twitter</v-icon>
      </v-btn>
      <div class="d-flex flex-column justify-center">
        <span>
          <strong>{{ formatFollowers(influencerInfo.twitter_followers) }} </strong>
          <small>Followers</small>
        </span>
        <a :href="`https://twitter.com/${twitterLinks[0]}`" target="_blank" class="social-media--link">{{
          twitterLinks[0]
        }}</a>
        <v-menu v-if="twitterLinks.length > 1" bottom offset-y>
          <template #activator="{ on, attrs }">
            <a href="javascript:;" v-bind="attrs" style="text-decoration:none" v-on="on">
              +{{ twitterLinks.length - 1 }} more <i class="fa fa-angle-down"></i>
            </a>
          </template>
          <v-list>
            <v-list-item v-for="(item, i) in twitterLinks.slice(1, twitterLinks.length)" :key="i">
              <v-list-item-title>
                <a :href="`https://twitter.com/${item}`" target="_blank" class="social-media--link">
                  <i class="mdi mdi-twitter"></i> {{ item }}
                </a>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <!-- <a :href="`https://twitter.com/${link}`" target="_blank" class="social-media--link" v-for="link in twitterLinks"
          >/{{ link }}</a
        > -->
      </div>
    </div>
    <div v-if="twitterLinks.length == 0" class="d-inline-flex mr-3">
      <v-btn class="white--text" depressed disabled target="_blank" fab icon small>
        <v-icon large>mdi-twitter</v-icon>
      </v-btn>
    </div>
    <div v-if="tiktokLinks.length" class="d-inline-flex align-center flex-column mr-2">
      <v-btn class="white--text" color="tiktok" fab icon small>
        <i class="icon-tiktok"></i>
      </v-btn>
      <div class="d-flex flex-column justify-center">
        <span>
          <strong>{{ formatFollowers(influencerInfo.tiktok_followers) }} </strong>
          <small>Followers</small>
        </span>
        <a :href="`https://www.tiktok.com/@${tiktokLinks[0]}`" target="_blank" class="social-media--link"
          >@{{ tiktokLinks[0] }}</a
        >
        <v-menu v-if="tiktokLinks.length > 1" bottom offset-y>
          <template #activator="{ on, attrs }">
            <a href="javascript:;" v-bind="attrs" style="text-decoration:none" v-on="on">
              +{{ tiktokLinks.length - 1 }} more <i class="fa fa-angle-down"></i>
            </a>
          </template>
          <v-list>
            <v-list-item v-for="(item, i) in tiktokLinks.slice(1, tiktokLinks.length)" :key="i">
              <v-list-item-title>
                <a :href="`https://www.tiktok.com/@${item}`" target="_blank" class="social-media--link">
                  <i class="icon-tiktok" style="width:14px;height:14px"></i> {{ item }}
                </a>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <!-- <a
          v-for="link in tiktokLinks"
          :href="`https://www.tiktok.com/@${link}`"
          target="_blank"
          class="social-media--link"
          >@{{ link }}</a
        > -->
      </div>
    </div>
    <div v-if="tiktokLinks.length == 0" class="d-inline-flex mr-3">
      <v-btn class="white--text" depressed disabled target="_blank" fab icon small>
        <svg class="socicon socicon-tiktok"><use xlink:href="#icon-tiktok"></use></svg>
      </v-btn>
    </div>
  </div>
</template>

<script>
import config from "@/config";

export default {
  props: {
    influencerInfo: {
      type: Object,
      required: true
    }
  },
  computed: {
    facebookLinks() {
      let facebookLinks = [];
      if (!this.influencerInfo.facebook) return facebookLinks;
      if (this.influencerInfo.facebook.includes(config.socialMediaAddressSeperator)) {
        facebookLinks = this.influencerInfo.facebook.split(config.socialMediaAddressSeperator).map(addr => addr.trim());
      } else {
        facebookLinks.push(this.influencerInfo.facebook);
      }
      return facebookLinks;
    },
    instagramLinks() {
      let instagramLinks = [];
      if (!this.influencerInfo.instagram) return instagramLinks;
      if (this.influencerInfo.instagram.includes(config.socialMediaAddressSeperator)) {
        instagramLinks = this.influencerInfo.instagram
          .split(config.socialMediaAddressSeperator)
          .map(addr => addr.trim());
      } else {
        instagramLinks.push(this.influencerInfo.instagram);
      }
      return instagramLinks;
    },
    twitterLinks() {
      let twitterLinks = [];
      if (!this.influencerInfo.twitter) return twitterLinks;
      if (this.influencerInfo.twitter.includes(config.socialMediaAddressSeperator)) {
        twitterLinks = this.influencerInfo.twitter.split(config.socialMediaAddressSeperator).map(addr => addr.trim());
      } else {
        twitterLinks.push(this.influencerInfo.twitter);
      }
      return twitterLinks;
    },
    youtubeLinks() {
      let youtubeLinks = [];
      if (!this.influencerInfo.youtube) return youtubeLinks;
      if (this.influencerInfo.youtube.includes(config.socialMediaAddressSeperator)) {
        youtubeLinks = this.influencerInfo.youtube.split(config.socialMediaAddressSeperator).map(addr => addr.trim());
      } else {
        youtubeLinks.push(this.influencerInfo.youtube);
      }
      return youtubeLinks;
    },
    tiktokLinks() {
      let tiktokLinks = [];
      if (!this.influencerInfo.tiktok) return tiktokLinks;
      if (this.influencerInfo.tiktok.includes(config.socialMediaAddressSeperator)) {
        tiktokLinks = this.influencerInfo.tiktok.split(config.socialMediaAddressSeperator).map(addr => addr.trim());
      } else {
        tiktokLinks.push(this.influencerInfo.tiktok);
      }
      return tiktokLinks;
    }
  },
  methods: {
    formatFollowers(count) {
      if (!count) 0;
      return count.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
  }
};
</script>

<style lang="scss" scoped>
.facebook--text {
  color: #1877f2 !important;
  caret-color: #1877f2 !important;
}

.instagram--text {
  color: #e4405f !important;
  caret-color: #e4405f !important;
}

.youtube--text {
  color: #ff0000 !important;
  caret-color: #ff0000 !important;
}

.twitter--text {
  color: #1da1f2 !important;
  caret-color: #1da1f2 !important;
}

.tiktok--text {
  color: #000000 !important;
  caret-color: #000000 !important;
}

.align-items-center {
  align-items: center !important;
}

.icon-tiktok {
  display: inline-flex;
  height: 18px;
  font-size: 18px;
  width: 18px;
  background: url("/inf-admin/tiktok.svg");
}

.socicon {
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
}

.socicon-tiktok {
  font-size: 26px;
}

.social-media-links-container {
  display: flex;
  align-items: flex-start;
  grid-gap: 1rem;
}

.social-media--link {
  text-decoration: none;
  color: #666;
  font-weight: 600;
}
</style>
