// Chat widget functionality
const botResponses = {
  greetings: [
    "Hello! I'm your Blupension AI assistant. How can I help you with your retirement planning today?",
    "Welcome to Blupension! I'm here to guide you through your pension planning journey. What would you like to know?",
    "Hi there! I'm your personal pension planning assistant. How can I assist you today?",
    "Greetings! I'm here to help you make informed decisions about your retirement. What questions do you have?",
    "Welcome! I'm your AI pension advisor. How can I help you today?",
  ],
  contributions: [
    "You can start with as little as $100 per month. Our flexible contribution system adapts to your income pattern.",
    "We offer multiple contribution options: monthly, quarterly, or project-based contributions for freelancers.",
    "Our smart contribution system automatically adjusts based on your income, ensuring consistent retirement savings.",
    "You can contribute anytime, anywhere. Our platform supports both regular and one-time contributions.",
    "We recommend contributing 15-20% of your income for optimal retirement planning.",
  ],
  investments: [
    "We offer four investment strategies: Conservative (6% return), Balanced (8% return), Aggressive (10% return), and Crypto Enhanced (12% return).",
    "Your portfolio is automatically balanced between BLU tokens, stablecoins, and traditional assets using our AI-driven system.",
    "Our investment strategy adapts to market conditions and your risk profile in real-time.",
    "We use advanced algorithms to optimize your portfolio allocation based on market trends.",
    "Our crypto-enhanced strategy combines traditional assets with blockchain opportunities for maximum growth.",
  ],
  retirement: [
    "Our retirement calculator helps you visualize your future savings based on different investment scenarios.",
    "You can track your retirement goals and adjust your strategy through our intuitive dashboard.",
    "We provide personalized retirement planning based on your age, income, and risk tolerance.",
    "Our platform helps you plan for retirement while considering inflation and currency devaluation risks.",
    "You can set multiple retirement goals and track your progress towards each one.",
  ],
  security: [
    "Your funds are protected by advanced blockchain technology and multi-layer security protocols.",
    "We use smart contracts to ensure transparent and secure transactions.",
    "Your personal information is encrypted and stored with bank-level security measures.",
    "Our platform undergoes regular security audits by leading blockchain security firms.",
    "We implement 2FA and biometric authentication for enhanced account security.",
  ],
  fees: [
    "Our platform charges a minimal 0.1% fee, significantly lower than traditional pension plans.",
    "We're transparent about all fees - no hidden charges or surprise deductions.",
    "Our fee structure is designed to maximize your retirement savings.",
    "We offer fee-free withdrawals after reaching retirement age.",
    "Early withdrawal fees are clearly outlined in our terms of service.",
  ],
  default: [
    "I'd be happy to help you with that. Would you like to explore our investment strategies or speak with a pension advisor?",
    "That's a great question. Let me connect you with more specific information about that topic.",
    "I can help you find the information you need. What specific aspect would you like to know more about?",
    "I understand your concern. Let me provide you with detailed information about that.",
    "That's an important consideration. Let me explain how our platform addresses this.",
  ],
};

function initializeChat() {
  const chatWindow = document.getElementById("chatWindow");
  const chatToggle = document.getElementById("chatToggle");
  const closeChat = document.getElementById("closeChat");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendMessage = document.getElementById("sendMessage");

  // Add thought bubbles
  const thoughtBubbles = [
    "Calculating optimal investment strategy...",
    "Analyzing market trends...",
    "Generating personalized recommendations...",
    "Processing retirement projections...",
    "Evaluating risk factors...",
    "Checking portfolio performance...",
    "Calculating potential returns...",
    "Analyzing inflation impact...",
    "Optimizing asset allocation...",
    "Generating retirement scenarios...",
  ];

  let currentBubble = 0;
  let bubbleInterval;

  function showThoughtBubble() {
    const bubble = document.createElement("div");
    bubble.className =
      "absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-3 text-sm text-gray-700 animate-fade-in";
    bubble.textContent = thoughtBubbles[currentBubble];
    chatToggle.appendChild(bubble);

    setTimeout(() => {
      bubble.remove();
    }, 3000);

    currentBubble = (currentBubble + 1) % thoughtBubbles.length;
  }

  function startThoughtBubbles() {
    bubbleInterval = setInterval(showThoughtBubble, 4000);
  }

  function stopThoughtBubbles() {
    clearInterval(bubbleInterval);
  }

  function addMessage(message, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `flex ${isUser ? "justify-end" : "justify-start"} mb-4`;

    const messageContent = document.createElement("div");
    messageContent.className = `${isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"} rounded-lg px-4 py-2 max-w-[80%] shadow-sm`;
    messageContent.textContent = message;

    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hey")
    ) {
      return botResponses.greetings[
        Math.floor(Math.random() * botResponses.greetings.length)
      ];
    } else if (
      lowerMessage.includes("contribute") ||
      lowerMessage.includes("payment") ||
      lowerMessage.includes("deposit")
    ) {
      return botResponses.contributions[
        Math.floor(Math.random() * botResponses.contributions.length)
      ];
    } else if (
      lowerMessage.includes("invest") ||
      lowerMessage.includes("portfolio") ||
      lowerMessage.includes("strategy")
    ) {
      return botResponses.investments[
        Math.floor(Math.random() * botResponses.investments.length)
      ];
    } else if (
      lowerMessage.includes("retire") ||
      lowerMessage.includes("future") ||
      lowerMessage.includes("goal")
    ) {
      return botResponses.retirement[
        Math.floor(Math.random() * botResponses.retirement.length)
      ];
    } else if (
      lowerMessage.includes("secure") ||
      lowerMessage.includes("safe") ||
      lowerMessage.includes("protect")
    ) {
      return botResponses.security[
        Math.floor(Math.random() * botResponses.security.length)
      ];
    } else if (
      lowerMessage.includes("fee") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("charge")
    ) {
      return botResponses.fees[
        Math.floor(Math.random() * botResponses.fees.length)
      ];
    }
    return botResponses.default[
      Math.floor(Math.random() * botResponses.default.length)
    ];
  }

  chatToggle.addEventListener("click", () => {
    chatWindow.classList.toggle("hidden");
    if (!chatWindow.classList.contains("hidden")) {
      if (chatMessages.children.length === 0) {
        addMessage(
          "Hello! I'm your Blupension assistant. How can I help you today?",
        );
      }
      startThoughtBubbles();
    } else {
      stopThoughtBubbles();
    }
  });

  closeChat.addEventListener("click", () => {
    chatWindow.classList.add("hidden");
    stopThoughtBubbles();
  });

  sendMessage.addEventListener("click", () => {
    const message = chatInput.value.trim();
    if (message) {
      addMessage(message, true);
      chatInput.value = "";

      // Simulate bot typing with thought bubble
      const typingBubble = document.createElement("div");
      typingBubble.className = "flex justify-start mb-4";
      typingBubble.innerHTML = `
        <div class="bg-gray-100 rounded-lg px-4 py-2 shadow-sm">
          <div class="flex space-x-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      `;
      chatMessages.appendChild(typingBubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      setTimeout(() => {
        typingBubble.remove();
        addMessage(getBotResponse(message));
      }, 1500);
    }
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage.click();
    }
  });
}

// Initialize chat when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeChat);
