// Elements Selection
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const themeToggle = document.getElementById("theme-toggle");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const closeSidebarBtn = document.getElementById("close-sidebar-btn");
const sidebar = document.getElementById("sidebar");

// Initialize Marked.js options if loaded
if (typeof marked !== 'undefined') {
  marked.use({
    gfm: true,
    breaks: true,
    mangle: false,
    headerIds: false
  });
}

// Utility to escape HTML for fallback rendering
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Global variable to hold the chat history for the current session
let chatHistory = [];

// Send user message
function sendMessage() {
  const question = userInput.value.trim();
  if (!question) return;

  // Remove welcome message / hero
  const welcome = document.getElementById("welcome-container");
  if (welcome) welcome.style.display = "none";

  // Disable input & send button during request
  userInput.disabled = true;
  sendBtn.disabled = true;

  // Show user message
  appendMessage("user", question);
  userInput.value = "";

  // Show typing indicator
  const typingId = showTyping();

  // Call FastAPI Backend ask endpoint
  fetch("http://localhost:8000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question, history: chatHistory })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Server error");
      }
      return res.json();
    })
    .then(data => {
      removeTyping(typingId);
      // Add both user question and bot answer to history
      chatHistory.push({ role: "user", content: question });
      chatHistory.push({ role: "assistant", content: data.answer });
      appendMessage("bot", data.answer);
    })
    .catch((err) => {
      console.error(err);
      removeTyping(typingId);
      appendMessage("bot", "Something went wrong. Please check your connection or try again later.");
    })
    .finally(() => {
      // Re-enable input & send button and refocus input
      userInput.disabled = false;
      sendBtn.disabled = false;
      userInput.focus();
    });
}

// Trigger message send via suggestion cards/quick links
function sendStarter(text) {
  userInput.value = text;
  sendMessage();
  
  // Auto-close sidebar on mobile after clicking
  if (sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
  }
}

// Append bubble to chat window
function appendMessage(role, text) {
  const msgContainer = document.createElement("div");
  msgContainer.classList.add("message", role);

  const label = document.createElement("div");
  label.classList.add("label");
  label.textContent = role === "user" ? "You" : "BUITEMS Bot";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  if (role === "user") {
    // Plain text for user questions is safer and simple
    bubble.textContent = text;
  } else {
    // Markdown/HTML parsing for Bot answers
    if (typeof marked !== 'undefined') {
      bubble.innerHTML = marked.parse(text);
    } else {
      // Fallback
      bubble.innerHTML = `<p>${escapeHTML(text).replace(/\n/g, '<br>')}</p>`;
    }
  }

  msgContainer.appendChild(label);
  msgContainer.appendChild(bubble);
  chatWindow.appendChild(msgContainer);
  
  // Smooth scroll to bottom
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth"
  });
}

// Show animated typing dots
function showTyping() {
  const id = "typing-" + Date.now();
  const msgContainer = document.createElement("div");
  msgContainer.classList.add("message", "bot", "typing");
  msgContainer.id = id;

  const label = document.createElement("div");
  label.classList.add("label");
  label.textContent = "BUITEMS Bot";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;

  msgContainer.appendChild(label);
  msgContainer.appendChild(bubble);
  chatWindow.appendChild(msgContainer);
  
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth"
  });
  
  return id;
}

// Remove typing indicator by ID
function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Reset chat window to default state
function clearChat() {
  chatWindow.innerHTML = `
    <div class="welcome-container" id="welcome-container">
      <div class="welcome-hero">
        <div class="welcome-icon">
          <i class="fa-solid fa-graduation-cap animate-bounce"></i>
        </div>
        <h1>How can I help you today?</h1>
        <p>I am your official BUITEMS information assistant. Ask me questions about admissions, department programs, fee breakdowns, and student facilities.</p>
      </div>

      <div class="suggestion-grid">
        <div class="suggestion-card" onclick="sendStarter('What are the general admission criteria for engineering programs?')">
          <div class="card-icon"><i class="fa-solid fa-gears"></i></div>
          <h3>Engineering Admissions</h3>
          <p>Find out requirements, test details, and eligibility criteria.</p>
          <span class="card-action">Ask assistant <i class="fa-solid fa-arrow-right"></i></span>
        </div>
        
        <div class="suggestion-card" onclick="sendStarter('Can you list the undergraduate fee structure?')">
          <div class="card-icon"><i class="fa-solid fa-wallet"></i></div>
          <h3>Fee Structure</h3>
          <p>Check semester tuition, security deposits, and registration fees.</p>
          <span class="card-action">Ask assistant <i class="fa-solid fa-arrow-right"></i></span>
        </div>

        <div class="suggestion-card" onclick="sendStarter('What BS programs are offered in Faculty of Information and Communication Technology (FICT)?')">
          <div class="card-icon"><i class="fa-solid fa-laptop-code"></i></div>
          <h3>FICT Programs</h3>
          <p>List of CS, SE, IT, and Computer Engineering course offerings.</p>
          <span class="card-action">Ask assistant <i class="fa-solid fa-arrow-right"></i></span>
        </div>

        <div class="suggestion-card" onclick="sendStarter('What are the scholarship opportunities for needy students?')">
          <div class="card-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div>
          <h3>Scholarship Guides</h3>
          <p>Explore HEC, BUITEMS Need-Based, and merit scholarships.</p>
          <span class="card-action">Ask assistant <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </div>
    </div>`;
  
  userInput.value = "";
  userInput.disabled = false;
  sendBtn.disabled = false;

  // Reset the session's chat history
  chatHistory = [];
}

// Theme Management (Light/Dark Theme Toggle)
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeUI(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeUI(newTheme);
}

function updateThemeUI(theme) {
  const themeLabel = themeToggle.querySelector(".theme-label");
  const themeIcon = themeToggle.querySelector("i");
  
  if (theme === "dark") {
    themeIcon.className = "fa-solid fa-sun";
    themeLabel.textContent = "Light Mode";
  } else {
    themeIcon.className = "fa-regular fa-moon";
    themeLabel.textContent = "Dark Mode";
  }
}

// Sidebar Drawer Control (Mobile UI)
function initSidebarControl() {
  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
  });

  closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });

  // Close sidebar on desktop resize if left active
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992 && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active");
    }
  });
}

// Initial Configuration
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSidebarControl();
  themeToggle.addEventListener("click", toggleTheme);
  userInput.focus();
});