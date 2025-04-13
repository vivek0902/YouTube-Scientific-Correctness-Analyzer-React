import { useState } from "react";

import "./App.css";
import Typewriter from "./hooks/Typewriter";

import {
  getTranscriptAnalysisPrompt,
  getNotesPrompt,
  getSummaryPrompt,
} from "./prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";
function App() {
  const [loading, setLoading] = useState(false);
  const [videourl, setVideourl] = useState("");
  const [youtubeTranscript, setYoutubeTranscript] = useState(null);

  const [analysisData, setAnalysisData] = useState(null);
  const [notesData, setNotesData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const [displayButtons, setDisplayButtons] = useState(false);
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const generationConfig = {
    maxOutputTokens: 8000,
    temperature: 0.7, // Non-deterministic
    topP: 0.9,
    topK: 40,
  };
  const fetchData = async (prompt) => {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig,
    });
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const cleanText = text
        .trim()
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "");
      return JSON.parse(cleanText);
    } catch (err) {
      console.error("Failed to parse Gemini response:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const getYoutubeVideoId = (url) => {
    const regex = /(?:v=|\/shorts\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  const fetchTranscriptData = async () => {
    const videoId = getYoutubeVideoId(videourl);
    if (!videoId) throw new Error("Invalid YouTube URL");

    const response = await fetch(
      `https://youtube-scientific-correctness-analyzer.onrender.com/transcript?videourl=${videourl}`
    );
    if (!response.ok) throw new Error("Transcript not found.");
    const data = await response.json();
    setYoutubeTranscript(data);
    setDisplayButtons(true);
    return data;
  };
  const handleTranscriptUrl = async (e) => {
    e.preventDefault();
    if (videourl === "") {
      alert("Please enter a YouTube URL.");
      setVideourl("");
      return;
    }

    const videoId = getYoutubeVideoId(videourl);
    if (!videoId) {
      alert("Invalid YouTube URL. Please enter a correct one.");
      setVideourl("");
      return;
    }
    setLoading(true);
    setAnalysisData(null);
    setNotesData(null);
    setSummaryData(null);
    setYoutubeTranscript(null);
    setDisplayButtons(false);
    try {
      const transcript = await fetchTranscriptData(); // use returned data
      const prompt = getTranscriptAnalysisPrompt(transcript); // use it directly
      const fetchedData = await fetchData(prompt);
      setAnalysisData(fetchedData);
    } catch (err) {
      console.error("Error fetching transcript or generating analysis:", err);
      alert("Failed to fetch transcript or analyze content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async () => {
    setLoading(true);

    setNotesData(null);
    setSummaryData(null);

    const AnalysisPrompt = getTranscriptAnalysisPrompt(youtubeTranscript);
    const fetchedData = await fetchData(AnalysisPrompt);
    setAnalysisData(fetchedData);
  };

  const handleNotes = async () => {
    setLoading(true);

    setAnalysisData(null);
    setSummaryData(null);

    const notesPrompt = getNotesPrompt(youtubeTranscript);
    const fetchedData = await fetchData(notesPrompt);
    setNotesData(fetchedData);
  };
  const handleSummary = async () => {
    setLoading(true);

    setAnalysisData(null);
    setNotesData(null);

    const summaryPrompt = getSummaryPrompt(youtubeTranscript);
    const fetchedData = await fetchData(summaryPrompt);
    setSummaryData(fetchedData);
  };

  const SkeletonLoader = () => (
    <>
      <div className="skeleton-container">
        <div className="skeleton title"></div>
        <div className="skeleton heading"></div>
        <div className="skeleton text"></div>
        <div className="skeleton text"></div>
        <div className="skeleton heading"></div>
        <div className="skeleton text"></div>
        <div className="skeleton text"></div>
      </div>

      <div className="skeleton-container">
        <div className="skeleton title"></div>
        <div className="skeleton heading"></div>
        <div className="skeleton text"></div>
        <div className="skeleton text"></div>
        <div className="skeleton heading"></div>
        <div className="skeleton text"></div>
        <div className="skeleton text"></div>
      </div>
      <div className="skeleton-container">
        <div className="skeleton title"></div>
        <div className="skeleton heading"></div>
        <div className="skeleton text"></div>
        <div className="skeleton text"></div>
        <div className="skeleton heading"></div>
        <div className="skeleton text"></div>
        <div className="skeleton text"></div>
      </div>
      <div className="skeleton-container">
        <div className="skeleton title"></div>
        <div className="skeleton heading"></div>
        <div className="skeleton text"></div>
        <div className="skeleton text"></div>
        <div className="skeleton heading"></div>
        <div className="skeleton text"></div>
        <div className="skeleton text"></div>
      </div>
    </>
  );

  return (
    <div className="app-container">
      <div className="left-panel">
        <h1>YouTube Content Analyzer (YCA)</h1>
        <div>
          <h2>{youtubeTranscript?.videoTitle}</h2>
          {youtubeTranscript && (
            <div style={{ marginTop: "20px" }}>
              <iframe
                width="100%"
                height="610"
                src={`https://www.youtube.com/embed/${youtubeTranscript.source}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
        <div className="transcriptSearchBox">
          <form onSubmit={handleTranscriptUrl}>
            <div>
              <div>
                <label htmlFor="url">Enter Youtube Url</label>
                <input
                  type="text"
                  id="url"
                  value={videourl}
                  onChange={(e) => setVideourl(e.target.value)}
                />
              </div>
              <div>
                <button type="submit">Submit</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="right-panel">
        <div>
          {displayButtons && (
            <div className="button-group">
              <div className="button-container">
                <button onClick={handleNotes}>Notes</button>
              </div>
              <div className="button-container">
                <button onClick={handleAnalysis}>Analysis</button>
              </div>
              <div className="button-container">
                <button onClick={handleSummary}>Summary</button>
              </div>
            </div>
          )}
        </div>
        {!loading && analysisData && (
          <div className="analysis-container">
            <h1 style={{ textAlign: "center" }}>Content Analysis</h1>
            <h1 className="analysis-title">
              <Typewriter text={analysisData.title} speed={20} />
            </h1>

            {analysisData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="analysis-section">
                <h3 className="section-heading">
                  {" "}
                  <Typewriter text={section.heading} speed={20} />
                </h3>
                <ul className="points-list">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="point-item">
                      <p
                        className={`point-text ${
                          point.validity === "valid" ? "valid" : "invalid"
                        }`}
                      >
                        <b>({point.validity})</b>{" "}
                        <Typewriter text={point.text} speed={20} />
                      </p>
                      {point.validity === "invalid" && (
                        <p className="explanation">
                          <b>Explanation:</b>{" "}
                          <Typewriter text={point.explanation} speed={20} />
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {!loading && notesData && (
          <div className="notes-container">
            <h1 style={{ textAlign: "center" }}>Content Notes</h1>

            <h1 className="notes-title">
              <Typewriter text={notesData.title} speed={20} />
            </h1>

            {notesData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="notes-section">
                <h3 className="section-heading">
                  {" "}
                  <Typewriter text={section.heading} speed={20} />
                </h3>
                <ul className="points-list">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="point-item">
                      <p className="point-text valid">
                        <Typewriter text={point.text} speed={20} />
                      </p>
                      {point.explanation && (
                        <p className="explanation">
                          Explanation:{" "}
                          <Typewriter text={point.explanation} speed={20} />
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {!loading && summaryData && (
          <div className="summary-container">
            <h1 style={{ textAlign: "center" }}>Content Summary</h1>

            <h1 className="summary-title">
              <Typewriter text={summaryData.title} speed={20} />
            </h1>

            <div className="summary-section">
              <h3 className="section-heading">Summary</h3>
              <p className="summary-text">
                <Typewriter text={summaryData.summary} speed={20} />
              </p>
            </div>

            <div className="summary-section">
              <h3 className="section-heading">Key Points</h3>
              <ul className="keypoints-list">
                {summaryData.keyPoints.map((keyPoint, index) => (
                  <li key={index} className="keypoint-item">
                    <Typewriter text={keyPoint} speed={20} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="summary-section">
              <h3 className="section-heading">Target Audience</h3>
              <p className="summary-meta">
                <Typewriter text={summaryData.targetAudience} speed={20} />
              </p>
            </div>

            <div className="summary-section">
              <h3 className="section-heading">Application</h3>
              <p className="summary-meta">
                <Typewriter text={summaryData.application} speed={20} />
              </p>
            </div>

            <div className="summary-section">
              <h3 className="section-heading">Tone</h3>
              <p className="summary-meta">
                <Typewriter text={summaryData.tone} speed={20} />
              </p>
            </div>
          </div>
        )}

        <div>{loading && <SkeletonLoader />}</div>
      </div>
    </div>
  );
}
export default App;
