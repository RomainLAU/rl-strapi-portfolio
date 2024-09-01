import herokuDeploy from "../../../../services/herokuDeploy";

export default {
  async afterCreate(event) {
    try {
      await herokuDeploy.deploy();

      await strapi.entityService.update(event.model.uid, event.result.id, {
        data: {
          status: "completed",
        },
      });
    } catch (error) {
      console.error(error);
      await strapi.entityService.update(event.model.uid, event.result.id, {
        data: {
          status: "failed",
        },
      });
    }
  },
};
