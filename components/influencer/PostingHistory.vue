<template>
  <div>
    <div class="d-flex align-center justify-space-between">
      <v-btn icon class="ma-2" @click="$refs.calendar.prev()">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <h3>{{ $dayjs(startDate).format("MMMM YYYY") }}</h3>
      <v-btn icon class="ma-2" @click="$refs.calendar.next()">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
    <v-calendar
      ref="calendar"
      v-model="value"
      :weekdays="weekday"
      :type="type"
      :events="events"
      :event-color="getEventColor"
      :event-overlap-mode="mode"
      :event-overlap-threshold="30"
      :show-week="true"
      @change="getEvents"
    >
      <template v-slot:event="{ event, timed, eventSummary }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on" style="color: #000; text-align: center; padding-left: 5px">
              <i v-if="event.icon" :class="event.icon" />
              <span>{{ eventSummary() }}</span>
            </div>
          </template>
          <span>{{ eventSummary() }}</span>
        </v-tooltip>
      </template>
    </v-calendar>
  </div>
</template>

<script>
import moment from "moment";
import config from "@/config";

const actions = {
  1: {
    name: "Approved",
    color: "#b7e4c7"
  },
  2: {
    name: "Posted",
    color: "#faedcb"
  }
};

export default {
  props: {
    influencerId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    type: "month",
    mode: "stack",
    weekday: [1, 2, 3, 4, 5, 6, 0],
    value: "",
    events: [],
    startDate: "",
    endDate: ""
  }),
  methods: {
    async getEvents({ start, end }) {
      this.startDate = start.date;
      this.endDate = end.date;
      const events = [];

      const res = await this.$contentPostingService.listByInfluencerId(this.influencerId, {
        startDate: start.date,
        endDate: end.date
      });
      if (res.data) {
        res.data.forEach(item => {
          if (item.reason) {
            const reason = config.reasonCases.find(f => f.value == item.reason);
            let reasonLabel = reason.label;
            if (item.reason == 5) {
              reasonLabel = reason.label + ": " + item.notes;
            }
            events.push({
              name: reasonLabel,
              start: moment().year(item.year).week(item.week).startOf("isoWeek").format("YYYY-MM-DD"),
              end: moment().year(item.year).week(item.week).endOf("isoWeek").format("YYYY-MM-DD"),
              color: "#ddd",
              timed: false
            });
          }
          Object.keys(item)
            .filter(o => o.includes("day"))
            .forEach(d => {
              if (item[d]) {
                const day = d.replace("day", "");
                const date = moment().year(item.year).week(item.week).day(day).format("YYYY-MM-DD");
                const action = actions[item[d]];

                let eventName = action.name;
                if (eventName == "Posted") {
                  const socialMediaPostedOn = config.socialMediaCases.find(f => f.value == item.socialMedia);
                  if (socialMediaPostedOn) {
                    eventName = `Posted on ${socialMediaPostedOn.label}`;
                  }
                }

                events.push({
                  name: eventName,
                  start: date,
                  end: date,
                  color: action.color,
                  timed: false
                });
              }
            });
        });
      }
      this.events = events;
    },
    getEventColor(event) {
      const rgb = parseInt(event.color.substring(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      return event === this.dragEvent
        ? `rgba(${r}, ${g}, ${b}, 0.7)`
        : event === this.createEvent
        ? `rgba(${r}, ${g}, ${b}, 0.7)`
        : event.color;
    }
  }
};
</script>

<style lang="scss" scoped>
.icon-tiktok {
  display: inline-flex;
  height: 10px;
  font-size: 10px;
  width: 10px;
  background: url("/inf-admin/tiktok.svg");
}
</style>
