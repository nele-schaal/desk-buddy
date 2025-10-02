// ================= IMPORTS =================
import { askChatGPT } from "./chatgpt.js";
import { VTX7, VTX33, VTX68 } from "./landmarks.js";

// ================= VARIABLES =================
let video;
let pose;
let camera;
let poseLandmarks = [];
let bodyPoints = new Array(33).fill({ x: 0, y: 0 });

// Optional face mesh
let TRI, VTX;

// Throttle ChatGPT calls
let lastQueryTime = 0;
const QUERY_INTERVAL = 20000; // 20 seconds in milliseconds

// Make p5.js functions globally available
window.setup = function() {
  createCanvas(windowWidth, windowHeight);

  // Video capture
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Initialize MediaPipe Pose
  pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  // Pose results callback
  pose.onResults((results) => {
    if (results.poseLandmarks) {
      poseLandmarks = results.poseLandmarks;
      updateBodyPoints();

      // Throttle API calls: once every 20 seconds
      const now = millis();
      if (now - lastQueryTime > QUERY_INTERVAL) {
        analyzePose(poseLandmarks);
        lastQueryTime = now;
      }
    }
  });

  // Start camera
  camera = new Camera(video.elt, {
    onFrame: async () => await pose.send({ image: video.elt }),
    width: 640,
    height: 480,
  });
  camera.start();

  // Face mesh
  chooseFaceLandmarks();
}

// ================= DRAW LOOP =================
window.draw = function() {
  background(0);

  // Draw mirrored video
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Draw body skeleton
  drawBodySkeleton();

  // Update timer
  updateTimer();
}

// ================= UPDATE BODY POINTS =================
function updateBodyPoints() {
  if (!poseLandmarks) return;

  for (let i = 0; i < poseLandmarks.length; i++) {
    bodyPoints[i] = {
      x: map(poseLandmarks[i].x, 0, 1, width, 0),
      y: map(poseLandmarks[i].y, 0, 1, 0, height),
    };
  }
}

// ================= DRAW BODY =================
function drawBodySkeleton() {
  stroke(255);
  strokeWeight(2);
  fill(255);

  // Draw circles for all detected landmarks
  for (let i = 0; i < bodyPoints.length; i++) {
    let p = bodyPoints[i];
    circle(p.x, p.y, 10);
  }

  // Connect some common lines for visualization
  if (bodyPoints[11] && bodyPoints[12]) line(bodyPoints[11].x, bodyPoints[11].y, bodyPoints[12].x, bodyPoints[12].y); // shoulders
  if (bodyPoints[23] && bodyPoints[24]) line(bodyPoints[23].x, bodyPoints[23].y, bodyPoints[24].x, bodyPoints[24].y); // hips

  // Arms
  line(bodyPoints[12].x, bodyPoints[12].y, bodyPoints[14].x, bodyPoints[14].y);
  line(bodyPoints[14].x, bodyPoints[14].y, bodyPoints[16].x, bodyPoints[16].y);
  line(bodyPoints[11].x, bodyPoints[11].y, bodyPoints[13].x, bodyPoints[13].y);
  line(bodyPoints[13].x, bodyPoints[13].y, bodyPoints[15].x, bodyPoints[15].y);

  // Legs
  line(bodyPoints[24].x, bodyPoints[24].y, bodyPoints[26].x, bodyPoints[26].y);
  line(bodyPoints[26].x, bodyPoints[26].y, bodyPoints[28].x, bodyPoints[28].y);
  line(bodyPoints[23].x, bodyPoints[23].y, bodyPoints[25].x, bodyPoints[25].y);
  line(bodyPoints[25].x, bodyPoints[25].y, bodyPoints[27].x, bodyPoints[27].y);

  // Neck to head
  if (bodyPoints[0] && bodyPoints[11] && bodyPoints[12]) {
    let neckX = (bodyPoints[11].x + bodyPoints[12].x) / 2;
    let neckY = (bodyPoints[11].y + bodyPoints[12].y) / 2;
    line(neckX, neckY, bodyPoints[0].x, bodyPoints[0].y);
  }
}

// ================= FACE LANDMARKS =================
function chooseFaceLandmarks() {
  VTX = VTX68;
}

// ================= CHATGPT INTEGRATION =================
function analyzePoseFeatures(landmarks) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  // Calculate shoulder distance as percentage of screen width
  const shoulderDistance = Math.abs(
    map(rightShoulder.x, 0, 1, width, 0) - 
    map(leftShoulder.x, 0, 1, width, 0)
  );
  const shoulderWidthPercentage = (shoulderDistance / width) * 100;

  // Only return shoulder width status
  if (shoulderWidthPercentage < 50) {
    return `hunched with shoulders covering only ${Math.round(shoulderWidthPercentage)}% of screen width`;
  } else {
    return `confident with shoulders spanning ${Math.round(shoulderWidthPercentage)}% of screen width`;
  }
}

async function analyzePose(landmarks) {
  const poseFeatures = analyzePoseFeatures(landmarks);
  if (!poseFeatures) return; // Skip if no notable features

  const question = `My shoulders are: ${poseFeatures}. If the word "hunched" appears, be a sassy, disappointed fashion critic judging my terrible posture. Use lots of "honey" and "darling" and be dramatically unimpressed. If the word "confident" appears, be an enthusiastic fashionista praising my powerful pose.`;
  
  try {
    const answer = await askChatGPT(question);
    // Display the response on screen
    const responseDiv = document.getElementById('chat-response');
    if (responseDiv) {
      responseDiv.textContent = answer;
    }
    lastQueryTime = millis(); // Update the query time after successful response
  } catch (err) {
    console.error("ChatGPT error:", err);
  }
}

// ================= TIMER =================
function updateTimer() {
  const timerDiv = document.getElementById('timer');
  if (!timerDiv) return;

  const now = millis();
  const timeSinceLastQuery = now - lastQueryTime;
  const timeUntilNext = Math.max(0, QUERY_INTERVAL - timeSinceLastQuery);
  const secondsRemaining = Math.ceil(timeUntilNext / 1000);

  if (secondsRemaining > 0) {
    timerDiv.textContent = `Next response in: ${secondsRemaining}s`;
  } else {
    timerDiv.textContent = 'Ready for next pose!';
  }
}
