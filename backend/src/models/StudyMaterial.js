// backend/src/models/StudyMaterial.js
const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  url: String,
  fileType: String,
  fileSize: Number,
  flashcards: { type: Array, default: [] },
  summary: { type: String, default: "" },
  quiz: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
