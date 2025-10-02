const admin = require("firebase-admin");
const express = require("express");
const crypto = require("crypto");
const session = require("express-session");
const path = require("path");
const multer = require("multer");

// Load environment variables
require("dotenv").config({ debug: true });

// Validate required environment variables
if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("FIREBASE_PRIVATE_KEY not found in environment variables");
}

console.log("🔧 Initializing Firebase with environment variables...");

// Initialize Firebase Admin SDK
try {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("✅ Firebase initialized successfully with environment variables");
} catch (error) {
  console.error("❌ Error initializing Firebase:", error.message);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Debugging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "50mb" })); // Increased limit for video data
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session setup
app.use(
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Multer setup for video uploads
const upload = multer({ storage: multer.memoryStorage() });

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "##admin123456";

// Question banks (simplified for testing)
const questionBanks = {
  writing: [
    { id: 1, question: "Write an essay on climate change and its impact on global economy (300-400 words)." },
    { id: 2, question: "Describe your most significant leadership experience and what you learned from it." },
  ],
  political: [
    {
      id: 1,
      question: "What should be the government's primary role in the economy?",
      options: [
        { text: "Minimal intervention - let markets regulate themselves" },
        { text: "Active regulation to prevent corporate abuses" },
        { text: "Strategic investment in key industries" },
        { text: "Comprehensive economic planning and control" },
      ],
    },
    {
      id: 2,
      question: "How should healthcare be organized?",
      options: [
        { text: "Fully private system with minimal government involvement" },
        { text: "Public-private partnership with regulated insurance markets" },
        { text: "Universal public healthcare funded by taxes" },
        { text: "State-controlled healthcare with private options" },
      ],
    },
  ],
  aptitude: [
    {
      id: 1,
      question: "Pointing to a photograph of boy Ramesh said, 'He is the son of the only son of my mother.' How is Ramesh related to that Boy?",
      options: [
        { text: "Brother", isCorrect: false },
        { text: "Father", isCorrect: true },
        { text: "Uncle", isCorrect: false },
        { text: "Cousin", isCorrect: false },
      ],
    },
    {
      id: 2,
      question: "A shopkeeper buys a pen for ₹50 and sells it for ₹65. What is the profit percentage?",
      options: [
        { text: "25%", isCorrect: false },
        { text: "30%", isCorrect: true },
        { text: "35%", isCorrect: false },
        { text: "20%", isCorrect: false },
      ],
    },
  ],
};

// Helper functions
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateUniqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

function selectQuestionsForCandidate() {
  return {
    writing: shuffle([...questionBanks.writing]).slice(0, 2),
    political: shuffle([...questionBanks.political]).slice(0, 2),
    aptitude: shuffle([...questionBanks.aptitude]).slice(0, 2),
  };
}

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

// Routes

// Test route to check if EJS is working
app.get("/test-template", (req, res) => {
  res.render("candidate/simple-test", {
    token: "test-token",
    name: "Test Candidate",
    email: "test@example.com",
  });
});

// Diagnostic route to check candidate data
app.get("/debug/candidate/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.json({ error: "Candidate not found" });
    }
    const candidate = doc.data();
    res.json({
      exists: true,
      name: candidate.name,
      email: candidate.email,
      verified: candidate.verified,
      examStarted: candidate.examStarted,
      examCompleted: candidate.examCompleted,
      currentModule: candidate.currentModule,
      expiresAt: candidate.expiresAt ? candidate.expiresAt.toDate() : null,
      assignedQuestions: candidate.assignedQuestions
        ? Object.keys(candidate.assignedQuestions)
        : "none",
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Admin Login Routes
app.get("/admin/login", (req, res) => {
  res.render("admin/login", { error: null });
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/login", { error: "Invalid username or password" });
  }
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

// Admin Routes
app.get("/admin/dashboard", isAdmin, async (req, res) => {
  try {
    const candidatesSnapshot = await db.collection("candidates").get();
    const candidates = candidatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("admin/dashboard", {
      candidates,
      error: req.query.error || null,
      successMessage: req.query.success || null,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res
      .status(500)
      .render("admin/dashboard", { candidates: [], error: "Error fetching candidates" });
  }
});

app.post("/admin/create-candidate", isAdmin, async (req, res) => {
  try {
    const { email, name, position } = req.body;

    // Server-side validation
    if (!email || !name) {
      const candidatesSnapshot = await db.collection("candidates").get();
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.render("admin/dashboard", {
        candidates,
        error: "Email and name are required",
      });
    }

    // Trim and validate inputs
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPosition = position ? position.trim() : "General Candidate";

    if (!trimmedEmail || !trimmedName) {
      const candidatesSnapshot = await db.collection("candidates").get();
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.render("admin/dashboard", {
        candidates,
        error: "Email and name cannot be empty",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const candidatesSnapshot = await db.collection("candidates").get();
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.render("admin/dashboard", {
        candidates,
        error: "Please enter a valid email address",
      });
    }

    // Check if candidate already exists
    const existingCandidateQuery = await db
      .collection("candidates")
      .where("email", "==", trimmedEmail.toLowerCase())
      .get();

    if (!existingCandidateQuery.empty) {
      const candidatesSnapshot = await db.collection("candidates").get();
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.render("admin/dashboard", {
        candidates,
        error: "A candidate with this email already exists",
      });
    }

    const token = generateUniqueToken();
    const link = `${BASE_URL}/candidate/${token}`; // Use configurable BASE_URL for cross-device/network access

    await db.collection("candidates").doc(token).set({
      email: trimmedEmail.toLowerCase(),
      name: trimmedName,
      position: trimmedPosition,
      token,
      link,
      verified: false,
      examStarted: false,
      examCompleted: false,
      currentModule: null,
      scores: { writing: null, political: null, aptitude: null },
      answers: {},
      videoUrls: { writing: null, political: null, aptitude: null }, // Per-module video URLs
      proctoringLogs: { writing: [], political: [], aptitude: [] }, // Per-module logs
      assignedQuestions: selectQuestionsForCandidate(),
      activity: [
        `Candidate created for position: ${trimmedPosition} at ${new Date().toISOString()}`,
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Link expires in 7 days
    });

    console.log(`✅ Assessment link for ${trimmedName} (${trimmedEmail}): ${link}`);

    const candidatesSnapshot = await db.collection("candidates").get();
    const candidates = candidatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("admin/dashboard", {
      candidates,
      successMessage: `Candidate "${trimmedName}" created successfully! Assessment link has been generated.`,
    });
  } catch (error) {
    console.error("❌ Error creating candidate:", error);

    const candidatesSnapshot = await db.collection("candidates").get();
    const candidates = candidatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("admin/dashboard", {
      candidates,
      error: "Error creating candidate. Please try again.",
    });
  }
});

// New: Reset exam endpoint (referenced in candidate-details.ejs)
app.post("/admin/candidate/:token/reset-exam", isAdmin, async (req, res) => {
  const { token } = req.params;
  try {
    await db.collection("candidates").doc(token).update({
      verified: false,
      examStarted: false,
      examCompleted: false,
      currentModule: null,
      scores: { writing: null, political: null, aptitude: null },
      answers: {},
      videoUrls: { writing: null, political: null, aptitude: null },
      proctoringLogs: { writing: [], political: [], aptitude: [] },
      startTime: null,
      completedAt: null,
      activity: admin.firestore.FieldValue.arrayUnion(
        `Exam reset by admin at ${new Date().toISOString()}`
      ),
    });
    res.redirect(`/admin/candidate/${token}?success=Exam reset successfully`);
  } catch (error) {
    console.error("Error resetting exam:", error);
    res.redirect(`/admin/candidate/${token}?error=Error resetting exam`);
  }
});

// Admin candidate details route
app.get("/admin/candidate/:token", isAdmin, async (req, res) => {
  const { token } = req.params;
  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.status(404).render("error", { message: "Candidate not found" });
    }
    const candidate = doc.data();

    // Prepare answers display: For MCQs, show selected vs correct; for writing, show text
    const detailedAnswers = {};
    Object.keys(candidate.assignedQuestions || {}).forEach((mod) => {
      const questions = candidate.assignedQuestions[mod] || [];
      const modAnswers = candidate.answers[mod] || {};
      detailedAnswers[mod] = questions.map((q) => ({
        question: q.question,
        answer: modAnswers[q.id] || "No answer",
        isCorrect:
          mod !== "writing" &&
          q.options?.find((opt) => opt.isCorrect && opt.text === modAnswers[q.id]),
        correctAnswer: mod !== "writing" ? q.options?.find((opt) => opt.isCorrect)?.text : null,
      }));
    });

    candidate.detailedAnswers = detailedAnswers;
    candidate.detailedScores = candidate.scores || {};
    candidate.proctoringLogs = candidate.proctoringLogs || {};
    candidate.videoUrls = candidate.videoUrls || {};

    res.render("admin/candidate-details", { candidate });
  } catch (error) {
    console.error("Error fetching candidate details:", error);
    res.status(500).render("error", { message: "Error loading candidate details" });
  }
});

// Candidate Routes - AUTOMATIC PROCESS (allows retake if not completed or reset)
app.get("/candidate/:token", async (req, res) => {
  const { token } = req.params;
  console.log(`🔍 Loading candidate with token: ${token}`);

  try {
    const doc = await db.collection("candidates").doc(token).get();

    if (!doc.exists) {
      console.log("❌ Candidate not found in database");
      return res.status(404).send(`
        <h1>Assessment Not Found</h1>
        <p>The assessment link is invalid or has expired.</p>
        <p>Please contact the administrator for assistance.</p>
      `);
    }

    const candidate = doc.data();
    console.log(
      `✅ Candidate found: ${candidate.name} (${candidate.email})`
    );
    console.log(
      `📊 Candidate status: verified=${candidate.verified}, examStarted=${candidate.examStarted}, examCompleted=${candidate.examCompleted}`
    );

    // Check if link expired
    if (candidate.expiresAt && candidate.expiresAt.toDate() < new Date()) {
      console.log("❌ Assessment link expired");
      return res.status(410).send(`
        <h1>Assessment Link Expired</h1>
        <p>This assessment link has expired. Please contact the administrator for a new link.</p>
      `);
    }

    if (candidate.examCompleted) {
      console.log("📝 Candidate has completed exam");
      return res.send(`
        <h1>Assessment Completed</h1>
        <p>Thank you, ${candidate.name}! You have completed the assessment.</p>
        <p>Your results will be reviewed and you will be contacted soon.</p>
        <p><a href="/admin/login">Admin Login</a> to reset if needed for retake.</p>
        <h2>Your Scores:</h2>
        <ul>
          <li>Writing: ${candidate.scores.writing}/2</li>
          <li>Political Awareness: ${candidate.scores.political}/2</li>
          <li>Analytical Aptitude: ${candidate.scores.aptitude}/2</li>
        </ul>
      `);
    }

    // AUTOMATIC VERIFICATION AND EXAM START (allows retake if not completed)
    if (!candidate.verified) {
      console.log("🔐 Auto-verifying candidate...");
      await db.collection("candidates")
        .doc(token)
        .update({
          verified: true,
          verifiedAt: new Date(),
          activity: admin.firestore.FieldValue.arrayUnion(
            `Auto-verified at ${new Date().toISOString()}`
          ),
        });
      console.log("✅ Candidate auto-verified");
    }

    if (!candidate.examStarted) {
      console.log("🚀 Auto-starting exam...");
      await db.collection("candidates")
        .doc(token)
        .update({
          examStarted: true,
          startTime: new Date(),
          currentModule: "writing",
          activity: admin.firestore.FieldValue.arrayUnion(
            `Assessment auto-started at ${new Date().toISOString()}`
          ),
        });
      console.log("✅ Exam auto-started");
    }

    // Redirect to current module
    const currentModule = candidate.currentModule || "writing";
    console.log(`📚 Redirecting to current module: ${currentModule}`);
    res.redirect(`/candidate/${token}/module/${currentModule}`);
  } catch (error) {
    console.error("💥 Error loading candidate:", error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>Something went wrong while loading your assessment.</p>
      <p>Please try again or contact support.</p>
      <p>Error: ${error.message}</p>
    `);
  }
});

app.get("/candidate/:token/module/:module", async (req, res) => {
  const { token, module } = req.params;
  console.log(`📖 Loading module: ${module} for token: ${token}`);

  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.status(404).send("Invalid assessment link");
    }

    const candidate = doc.data();

    if (!candidate.verified || !candidate.examStarted) {
      return res.redirect(`/candidate/${token}`);
    }

    if (candidate.examCompleted) {
      return res.send(`
        <h1>Assessment Completed</h1>
        <p>Thank you, ${candidate.name}! You have completed the assessment.</p>
        <p>Your results will be reviewed and you will be contacted soon.</p>
      `);
    }

    const validModules = ["writing", "political", "aptitude"];
    if (!validModules.includes(module)) {
      return res.status(404).send("Invalid module");
    }

    const questions = candidate.assignedQuestions[module] || [];
    const currentAnswers = candidate.answers[module] || {};
    const timeLimit = 1800; // 30 minutes in seconds

    // Capitalize module name for display
    const moduleName = module.charAt(0).toUpperCase() + module.slice(1);

    res.render("module", {
      moduleName,
      module,
      questions,
      currentAnswers,
      candidate,
      timeLimit,
    });
  } catch (error) {
    console.error("Error loading module:", error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>Something went wrong while loading your assessment module.</p>
      <p>Please try refreshing or contact support.</p>
      <p>Error: ${error.message}</p>
      <script>
        setTimeout(() => location.reload(), 5000); // Auto-reload after 5 seconds
      </script>
    `);
  }
});
app.post("/candidate/:token/log-proctoring", async (req, res) => {
  const { token } = req.params;
  const { module, logs } = req.body;
  try {
    await db.collection("candidates").doc(token).update({
      [`proctoringLogs.${module}`]: admin.firestore.FieldValue.arrayUnion(...logs),
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error logging proctoring:", error);
    res.status(500).json({ success: false });
  }
});

app.post("/candidate/:token/submit-module", upload.single("video"), async (req, res) => {
  const { token } = req.params;
  const { module } = req.body;
  let answers, timeSpent, proctoringLogsStr;

  try {
    answers = JSON.parse(req.body.answers || "{}");
    timeSpent = parseInt(req.body.timeSpent) || 0;
    proctoringLogsStr = JSON.parse(req.body.proctoringLogs || "[]");
  } catch (e) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  console.log(`📤 Submitting module: ${module} for token: ${token}`);

  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    const candidate = doc.data();
    const assignedQuestions = candidate.assignedQuestions[module] || [];

    // Step 1: Evaluate score
    let score = null;
    let maxScore = null;

    if (module === "political" || module === "aptitude") {
      score = 0;
      maxScore = assignedQuestions.length;

      assignedQuestions.forEach((q) => {
        const givenAnswer = answers[q.id];
        const correctOption = q.options?.find((opt) => opt.isCorrect);
        if (givenAnswer && correctOption && givenAnswer === correctOption.text) {
          score++;
        }
      });
    }

    // Step 2: Upload video (if present)
    let videoUrl = null;
    if (req.file) {
      const fileName = `recordings/${token}/${module}-${Date.now()}.webm`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: { firebaseStorageDownloadTokens: token },
      });

      videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
        fileName
      )}?alt=media&token=${token}`;
    }

    // Step 3: Update candidate record
    await db.collection("candidates").doc(token).update({
      [`answers.${module}`]: answers,
      [`scores.${module}`]: score !== null ? score : null,
      [`videoUrls.${module}`]: videoUrl,
      [`proctoringLogs.${module}`]: admin.firestore.FieldValue.arrayUnion(
        ...proctoringLogsStr
      ),
      currentModule: module,
      activity: admin.firestore.FieldValue.arrayUnion(
        `Module ${module} submitted at ${new Date().toISOString()} (timeSpent=${timeSpent}s, score=${
          score ?? "N/A"
        })`
      ),
    });

    // Step 4: Decide next module
    const moduleOrder = ["writing", "political", "aptitude"];
    const currentIndex = moduleOrder.indexOf(module);

    let nextModule = null;
    if (currentIndex >= 0 && currentIndex < moduleOrder.length - 1) {
      nextModule = moduleOrder[currentIndex + 1];
      await db.collection("candidates").doc(token).update({ currentModule: nextModule });
    } else {
      // Last module completed
      await db.collection("candidates").doc(token).update({
        examCompleted: true,
        completedAt: new Date(),
        activity: admin.firestore.FieldValue.arrayUnion(
          `Assessment completed at ${new Date().toISOString()}`
        ),
      });
    }

    res.json({ success: true, nextModule });
  } catch (error) {
    console.error("❌ Error submitting module:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/candidate/:token/results", async (req, res) => {
  const { token } = req.params;
  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.status(404).send("Candidate not found");
    }

    const candidate = doc.data();
    if (!candidate.examCompleted) {
      return res.status(400).send("Assessment not completed yet");
    }

    const totalScore = Object.values(candidate.scores || {}).reduce(
      (sum, score) => sum + (score || 0),
      0
    );
    const maxTotalScore = 6; // 2 writing + 2 political + 2 aptitude

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Assessment Results</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  max-width: 800px; 
                  margin: 0 auto; 
                  padding: 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  color: #333;
              }
              .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                  text-align: center;
              }
              .success { color: #28a745; }
              .scores { 
                  margin: 30px 0; 
                  text-align: left;
                  display: inline-block;
              }
              .scores li { margin: 10px 0; font-size: 18px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1 class="success">Assessment Completed! 🎉</h1>
              <p>Congratulations <strong>${candidate.name}</strong>!</p>
              <p>You have successfully completed the assessment.</p>
              
              <div class="scores">
                  <h2>Your Scores:</h2>
                  <ul>
                      <li>📝 Writing: ${candidate.scores.writing}/2</li>
                      <li>🏛️ Political Awareness: ${candidate.scores.political}/2</li>
                      <li>🔢 Analytical Aptitude: ${candidate.scores.aptitude}/2</li>
                  </ul>
                  
                  <h3>Total Score: ${totalScore}/${maxTotalScore}</h3>
              </div>
              
              <p>Your results have been recorded and will be reviewed by our team.</p>
              <p>You will be contacted soon regarding the next steps.</p>
              <p><strong>Thank you for your participation!</strong></p>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).send("Error fetching results");
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send(`
    <h1>Professional Assessment System</h1>
    <p>Amazon/Google Style Interview Platform 🚀</p>
    <ul>
      <li><a href="/admin/login">Admin Dashboard</a></li>
      <li><a href="/test-template">Test Template</a></li>
    </ul>
    <p><em>Note: Set BASE_URL env var for public access across devices/networks (e.g., ngrok URL).</em></p>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send(`
    <h1>Something went wrong!</h1>
    <p>Please try again later.</p>
    <p>Error: ${err.message}</p>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <h1>Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <p><a href="/">Go Home</a></p>
  `);
});

app.listen(3000, () => {
  console.log("🚀 Professional Assessment System running at http://localhost:3000");
  console.log("👨‍💼 Admin dashboard: http://localhost:3000/admin/login");
  console.log("🧪 Test template: http://localhost:3000/test-template");
  console.log("📊 System ready for candidate assessments");
  console.log(`🔗 Assessment links use BASE_URL: ${BASE_URL}`);
});
