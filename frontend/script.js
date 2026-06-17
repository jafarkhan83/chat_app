const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");

function sendMessage() {
  const question = userInput.value.trim();
  if (!question) return;

  // Remove welcome message
  const welcome = document.querySelector(".welcome-msg");
  if (welcome) welcome.remove();

  // Show user message
  appendMessage("user", question);
  userInput.value = "";

  // Show typing indicator
  const typingId = showTyping();

  // Call FastAPI
  fetch("http://localhost:8000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: question })
  })
    .then(res => res.json())
    .then(data => {
      removeTyping(typingId);
      appendMessage("bot", data.answer);
    })
    .catch(() => {
      removeTyping(typingId);
      appendMessage("bot", "Something went wrong. Please try again.");
    });
}

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", role);

  const label = document.createElement("div");
  label.classList.add("label");
  label.textContent = role === "user" ? "You" : "UniBot";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;

  msg.appendChild(label);
  msg.appendChild(bubble);
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping() {
  const id = "typing-" + Date.now();
  const msg = document.createElement("div");
  msg.classList.add("message", "bot", "typing");
  msg.id = id;
  msg.innerHTML = `<div class="bubble"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function clearChat() {
  chatWindow.innerHTML = `
    <div class="welcome-msg">
      <h2>Hello! 👋</h2>
      <p>I'm your university assistant. Ask me anything!</p>
    </div>`;
}