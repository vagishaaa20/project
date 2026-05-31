const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage config for evidence videos
const evidenceStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { caseId, evidenceId } = req.body;
    return {
      folder:         `trustvault/evidence/${caseId}`,
      public_id:      `${caseId}_${evidenceId}`,
      resource_type:  "video",
      allowed_formats: ["mp4", "avi", "mov", "mkv"],
    };
  },
});

const uploadToCloud = multer({ storage: evidenceStorage });

// Upload a local file to Cloudinary and return URL
const uploadFileToCloudinary = async (filePath, caseId, evidenceId) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder:        `trustvault/evidence/${caseId}`,
    public_id:     `${caseId}_${evidenceId}`,
    resource_type: "video",
  });
  return {
    url:       result.secure_url,
    publicId:  result.public_id,
    bytes:     result.bytes,
    duration:  result.duration,
    format:    result.format,
  };
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
};

module.exports = { uploadToCloud, uploadFileToCloudinary, deleteFromCloudinary, cloudinary };