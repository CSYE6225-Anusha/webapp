const aws = require("aws-sdk");
const s3 = new aws.S3();
const Image = require("../models/image.js");

const insertPic = async (req, res) => {
  try {
    const file = req.file;
    const user = req.user;

    const key = `${process.env.S3_BUCKET_NAME}/${user.id}/${file.originalname}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Body: file.buffer,
      Key: key,
    };

    const uploadResult = await s3.upload(params).promise();
    const newImage = await Image.create({
      file_name: file.originalname,
      url: uploadResult.Key,
      user_id: user.id,
    });
    res.status(201).json(newImage);
  } catch (error) {
    if (
      error.name === "SequelizeConnectionError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      logger.error("Database error while uploading image:", error);
      return res
        .status(503)
        .send();
    }
    logger.error("Error uploading image:", error);
    res.status(400).send();
  }
};

const getPic = async (req, res) => {
  try {
    const user = req.user;

    logger.info(`Fetching image for user ID: ${user.id}`);

    const dbStartTime = Date.now();
    const imageRecord = await Image.findOne({ where: { user_id: user.id } });
    client.timing("db.getImageRecord.time", Date.now() - dbStartTime);

    if (!imageRecord) {
      logger.error(`Image not found for user ID: ${user.id}`);
      return res.status(404).send();
    }

    res.status(200).send(imageRecord);
  } catch (error) {
    if (
      error.name === "SequelizeConnectionError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      logger.error("Database error while fetching image:", error);
      return res
        .status(503)
        .send();
    }
    logger.error("Error fetching image:", error);
    res.status(400).send();
  }
};

const deletePic = async (req, res) => {
  try {
    const user = req.user;

    const dbStartTime = Date.now();
    const imageRecord = await Image.findOne({ where: { user_id: user.id } });
    client.timing("db.getImageRecord.time", Date.now() - dbStartTime);

    if (!imageRecord) {
      logger.error(`Image not found for user ID: ${user.id}`);
      return res.status(404).send();
    }

    const key = `${process.env.S3_BUCKET_NAME}/${user.id}/${imageRecord.file_name}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    logger.info(`Deleting image for user ID: ${user.id}`);

    const s3StartTime = Date.now();
    await s3.deleteObject(params).promise();
    client.timing("s3.deleteObject.time", Date.now() - s3StartTime);

    const dbDeleteStartTime = Date.now();
    await Image.destroy({ where: { user_id: user.id } });
    client.timing("db.deleteImageRecord.time", Date.now() - dbDeleteStartTime);

    logger.info(`Image deleted successfully for user ID: ${user.id}`);
    res.status(204).send();
  } catch (error) {
    if (
      error.name === "SequelizeConnectionError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      logger.error("Database error while deleting image:", error);
      return res
        .status(503)
        .send();
    }
    logger.error("Error deleting image:", error);
    res.status(400).send();
  }
};

module.exports = { insertPic, getPic, deletePic };
