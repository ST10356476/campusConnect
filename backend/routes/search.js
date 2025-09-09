// backend/routes/search.js
const express = require("express");
const router = express.Router();
const StudyMaterial = require("../src/models/StudyMaterial");
const Meetup = require("../src/models/Meetup");
const Community = require("../src/models/Community");

// GET /api/search?q=query
router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: "Search query required" });

  try {
    const [materials, meetups, communities] = await Promise.all([
      StudyMaterial.find({
        $or: [
          { filename: { $regex: query, $options: "i" } },
          { originalName: { $regex: query, $options: "i" } },
          { summary: { $regex: query, $options: "i" } }
        ]
      })
        .select("_id filename originalName description url fileType fileSize summary uploadedBy")
        .limit(100),
      Meetup.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } }
        ]
      })
        .select("_id title description date time maxAttendees attendees organizer meetingLink duration status")
        .limit(100),
      Community.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } }
        ]
      })
        .select("_id name description category memberCount university avatar")
        .limit(100),
    ]);

    res.json({
      materials: materials.map(m => ({
        id: m._id,
        type: "material",
        name: m.filename || m.originalName,
        description: m.description || "",
        url: m.url,
        fileType: m.fileType,
        fileSize: m.fileSize,
        summary: m.summary,
        uploadedBy: m.uploadedBy,
      })),
      meetups: meetups.map(m => ({
        id: m._id,
        type: "meetup",
        name: m.title,
        description: m.description,
        date: m.date,
        time: m.time,
        maxAttendees: m.maxAttendees,
        attendees: m.attendees,
        organizer: m.organizer,
        meetingLink: m.meetingLink,
        duration: m.duration,
        status: m.status,
      })),
      communities: communities.map(c => ({
        id: c._id,
        type: "community",
        name: c.name,
        description: c.description,
        category: c.category,
        memberCount: c.memberCount,
        university: c.university,
        avatar: c.avatar?.url,
      })),
    });
    console.log({
      materials: materials.length,
      meetups: meetups.length,
      communities: communities.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
