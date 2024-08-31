import herokuDeploy from "../../../../services/herokuDeploy";

export default {
  async afterUpdate(event) {
    const { result, params } = event;

    if (result.publishedAt && !params.data.publishedAt) {
      await herokuDeploy.deploy();
    }
  },
};
