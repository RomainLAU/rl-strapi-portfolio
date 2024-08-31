import axios from "axios";

const deploy = async () => {
  try {
    const response = await axios.post(
      "https://api.heroku.com/apps/rl-next-portfolio/builds",
      {
        source_blob: {
          url: "https://github.com/RomainLAU/rl-nextjs-portfolio/tarball/main",
          version: "commit-sha",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.heroku+json; version=3",
        },
      }
    );
    strapi.log.info("Deployment triggered successfully", response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      strapi.log.error(
        "Error triggering deployment",
        error.response?.data || error.message
      );
    } else {
      strapi.log.error("Unexpected error", error);
    }
  }
};

export default { deploy };
