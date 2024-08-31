import herokuDeploy from "../../../../services/herokuDeploy";

export default {
  async afterUpdate(event) {
    try {
      await herokuDeploy.deploy();

      console.log("Heroku deploy successful");
    } catch (error) {
      console.error("Heroku deploy failed", error);
    }
  },
};
