"use-strict";

import { setCreatorFields } from "@strapi/utils";

const setPathIdAndPath = async (folder, strapi) => {
  const result = await strapi.db.query("plugin::upload.folder").findMany({
    select: ["pathId"],
    orderBy: { pathId: "desc" },
    limit: 1,
  });

  const max = result.length > 0 ? result[0].pathId : 0;

  if (isNaN(max)) {
    throw new Error(`Invalid max value: ${max}`);
  }

  const pathId = max + 1;
  let parentPath = "/";
  if (folder.parent) {
    const parentFolder = await strapi.entityService.findOne(
      "plugin::upload.folder",
      folder.parent
    );
    parentPath = parentFolder.path;
  }

  return Object.assign(folder, {
    pathId,
    path: `${parentPath}/${pathId}`,
  });
};

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.url === "/upload" && ctx.method === "POST") {
      if (ctx.request.body) {
        try {
          let folderName;
          const rootFolder = process.env.CLOUDINARY_FOLDER;

          const config = strapi.config.get("plugin.upload");

          const fileInfo = JSON.parse(ctx?.request?.body?.fileInfo);
          const extension = fileInfo.name.split(".").pop().toLowerCase();

          if (
            extension === "jpg" ||
            extension === "jpeg" ||
            extension === "png"
          ) {
            folderName = "Images";
            config.actionOptions.uploadStream.folder = `${rootFolder}/${folderName}`;
          } else if (extension === "pdf") {
            folderName = "PDFs";
            config.actionOptions.uploadStream.folder = `${rootFolder}/${folderName}`;
          } else {
            folderName = "Others";
            config.actionOptions.uploadStream.folder = `${rootFolder}/${folderName}`;
          }

          const folders = await strapi.entityService.findMany(
            "plugin::upload.folder"
          );

          let folder = folders.find((folder) => folder.name === folderName);

          if (!folder) {
            const folderData = { name: folderName, parent: null };
            const user = ctx.state.user;
            let enrichedFolder = await setPathIdAndPath(folderData, strapi);
            if (user) {
              enrichedFolder = await setCreatorFields({ user })(enrichedFolder);
            }
            folder = await strapi.entityService.create(
              "plugin::upload.folder",
              { data: enrichedFolder }
            );
          }

          fileInfo.folder = folder.id;
          ctx.request.body.fileInfo = JSON.stringify(fileInfo);
        } catch (error) {
          console.error(
            "Error parsing or modifying fileInfo or Configurations:",
            error
          );
        }
      }
    }

    await next();
  };
};
