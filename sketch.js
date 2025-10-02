// ========== VARIABLES ==========
let video;
let pose;
let camera;
let poseLandmarks = [];

// Array to store all landmarks
let bodyPoints = new Array(33).fill({x:0, y:0});

// Optional face mesh
let TRI, VTX;

// ========== SETUP ==========
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Video capture
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Initialize MediaPipe Pose
  pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  pose.onResults((results) => {
    if (results.poseLandmarks) {
      poseLandmarks = results.poseLandmarks;
      updateBodyPoints();
    }
  });

  // Start camera
  camera = new Camera(video.elt, {
    onFrame: async () => await pose.send({ image: video.elt }),
    width: 640,
    height: 480
  });
  camera.start();

  // Choose face landmarks (optional)
  chooseFaceLandmarks();
}

// ========== DRAW LOOP ==========
function draw() {
  background(0);

  // Draw mirrored video
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Draw body skeleton
  drawBodySkeleton();
}

// ========== UPDATE BODY POINTS ==========
function updateBodyPoints() {
  if (!poseLandmarks) return;

  for (let i = 0; i < poseLandmarks.length; i++) {
    bodyPoints[i] = {
      x: map(poseLandmarks[i].x, 0, 1, width, 0),
      y: map(poseLandmarks[i].y, 0, 1, 0, height)
    };
  }
}

// ========== DRAW BODY ==========
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
    let neckX = (bodyPoints[11].x + bodyPoints[12].x)/2;
    let neckY = (bodyPoints[11].y + bodyPoints[12].y)/2;
    line(neckX, neckY, bodyPoints[0].x, bodyPoints[0].y);
  }
}

// ========== FACE LANDMARKS ==========
function chooseFaceLandmarks() {
  VTX = VTX68;
  TRI = TRI68;
}
