import createTemplatesService from "~/service/templates";
import createTemplates2Service from "~/service/templates2";
import createInfluencerService from "~/service/influencer";
import createContentPostingService from "~/service/content-posting";
import createUserService from "~/service/user";

export default (ctx, inject) => {
  const templatesService = createTemplatesService(ctx.$axios);
  const templates2Service = createTemplates2Service(ctx.$axios);
  const influencerService = createInfluencerService(ctx.$axios);
  const contentPostingService = createContentPostingService(ctx.$axios);
  const userService = createUserService(ctx.$axios);

  inject("templatesService", templatesService("/templates"));
  inject("templates2Service", templates2Service("/templates2"));
  inject("influencerService", influencerService("/influencer"));
  inject("contentPostingService", contentPostingService("/content-posting"));
  inject("userService", userService("/user"));
};
