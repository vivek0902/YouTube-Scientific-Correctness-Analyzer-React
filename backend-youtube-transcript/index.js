require("dotenv").config();
const express = require("express");
const {
  YoutubeLoader,
} = require("@langchain/community/document_loaders/web/youtube");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Transcript route
app.get("/transcript", async (req, res) => {
  const { videourl } = req.query;

  if (!videourl) {
    return res.status(400).json({ error: "Video URL is required" });
  }

  try {
    const loader = YoutubeLoader.createFromUrl(videourl, {
      language: "en",
      addVideoInfo: true,
    });

    const docs = await loader.load();

    console.log("Transcript Fetched");

    res.json({
      source: docs[0].metadata.source,
      videoTitle: docs[0].metadata.title || "Unknown Title",
      transcript: docs[0].pageContent,
    });
  } catch (err) {
    console.error("Transcript Error", err.message);
    res.status(500).json({ error: "Unexpected Error!" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

//http://localhost:3000/transcript?videourl=https://www.youtube.com/watch?v=HnRrA8ay_Ro
