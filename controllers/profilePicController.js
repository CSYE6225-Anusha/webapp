const aws = require('aws-sdk');
const s3 = new aws.S3();
const Image = require("../models/image.js")

const insertPic = async (req, res) => {
    const file = req.file;
    const user = req.user;
   
    const key = `${process.env.S3_BUCKET_NAME}/${user.id}/${file.originalname}`;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Body: file.buffer,
        Key: key
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        const newImage = await Image.create({
            file_name: file.originalname,
            url: uploadResult.Key,
            user_id: user.id,
        });
        res.status(201).json(newImage);
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: "Error uploading image" });
    }
}

module.exports = { insertPic };
