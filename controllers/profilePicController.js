const aws = require("aws-sdk");
const s3 = new aws.S3();
const Image = require("../models/image.js");
const logger = require('../libs/logger.js');
const client = require('../libs/statsd.js');

const insertPic = async (req, res) => {
  try {
    const file = req.file;
    const user = req.user;

    logger.info(`Checking if image already exists for user ID: ${user.id}`);
    const dbCheckStartTime = Date.now();
    const existingImage = await Image.findOne({ where: { user_id: user.id } });
    client.timing("db.checkExistingImage.time", Date.now() - dbCheckStartTime);

    if (existingImage) {
      logger.error(`Image already exists for user ID: ${user.id}`);
      return res.status(400).send();
    }

    const key = `${process.env.S3_BUCKET_NAME}/${user.id}/${file.originalname}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Body: file.buffer,
      Key: key,
    };

    logger.info(`Uploading image for user ID: ${user.id} to S3 bucket`);
    const s3UploadStartTime = Date.now();
    const uploadResult = await s3.upload(params).promise();
    client.timing("s3.uploadImage.time", Date.now() - s3UploadStartTime);

    logger.info(`Saving image metadata to database for user ID: ${user.id}`);
    const dbInsertStartTime = Date.now();
    const newImage = await Image.create({
      file_name: file.originalname,
      url: uploadResult.Key,
      user_id: user.id,
    });
    client.timing("db.insertImageRecord.time", Date.now() - dbInsertStartTime);

    res.status(201).json(newImage);
  } catch (error) {
    if (
      error.name === "SequelizeConnectionError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      logger.error("Database error while uploading image:", error);
      return res.status(503).send();
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

    logger.info(`Image fetched successfully for user ID: ${user.id}`);
    res.status(200).send(imageRecord);
  } catch (error) {
    if (
      error.name === "SequelizeConnectionError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      logger.error("Database error while fetching image:", error);
      return res.status(503).send();
    }
    logger.error("Error fetching image:", error);
    res.status(400).send();
  }
};

const deletePic = async (req, res) => {
  try {
    const user = req.user;

    logger.info(`Fetching image for deletion for user ID: ${user.id}`);
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

    logger.info(`Deleting image from S3 for user ID: ${user.id}`);
    const s3StartTime = Date.now();
    await s3.deleteObject(params).promise();
    client.timing("s3.deleteObject.time", Date.now() - s3StartTime);

    logger.info(`Deleting image metadata from database for user ID: ${user.id}`);
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
      return res.status(503).send();
    }
    logger.error("Error deleting image:", error);
    res.status(400).send();
  }
};

module.exports = { insertPic, getPic, deletePic };
