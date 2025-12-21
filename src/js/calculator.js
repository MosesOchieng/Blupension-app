// Retirement calculator functionality
function initializeCalculator() {
  const contributionSlider = document.getElementById("contributionSlider");
  const periodSlider = document.getElementById("periodSlider");
  const contributionValue = document.getElementById("contributionValue");
  const periodValue = document.getElementById("periodValue");
  const totalContributions = document.getElementById("totalContributions");
  const projectedValue = document.getElementById("projectedValue");

  // Add investment scenario buttons
  const scenarios = [
    { name: "Conservative", return: 0.06, risk: "Low" },
    { name: "Balanced", return: 0.08, risk: "Medium" },
    { name: "Aggressive", return: 0.10, risk: "High" },
    { name: "Crypto Enhanced", return: 0.12, risk: "Very High" }
  ];

  const scenarioContainer = document.createElement("div");
  scenarioContainer.className = "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6";
  
  scenarios.forEach(scenario => {
    const button = document.createElement("button");
    button.className = "bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center";
    button.innerHTML = `
      <h4 class="font-semibold">${scenario.name}</h4>
      <p class="text-sm text-gray-600">${scenario.risk} Risk</p>
      <p class="text-sm text-blue-600">${(scenario.return * 100).toFixed(1)}% Return</p>
    `;
    button.dataset.return = scenario.return;
    scenarioContainer.appendChild(button);
  });

  const calculatorContainer = document.querySelector(".max-w-2xl");
  calculatorContainer.insertBefore(scenarioContainer, calculatorContainer.firstChild);

  let currentReturn = 0.08; // Default to balanced scenario

  function updateCalculator() {
    const monthlyContribution = parseInt(contributionSlider.value);
    const years = parseInt(periodSlider.value);

    contributionValue.textContent = monthlyContribution;
    periodValue.textContent = years;

    const totalContrib = monthlyContribution * 12 * years;
    const futureValue = (monthlyContribution * (Math.pow(1 + currentReturn / 12, years * 12) - 1)) / (currentReturn / 12);

    totalContributions.textContent = totalContrib.toLocaleString();
    projectedValue.textContent = Math.round(futureValue).toLocaleString();

    // Add visual feedback for the selected scenario
    document.querySelectorAll(scenarioContainer.querySelectorAll("button")).forEach(btn => {
      if (parseFloat(btn.dataset.return) === currentReturn) {
        btn.classList.add("ring-2", "ring-blue-500");
      } else {
        btn.classList.remove("ring-2", "ring-blue-500");
      }
    });
  }

  // Add event listeners for scenario buttons
  scenarioContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      currentReturn = parseFloat(e.target.dataset.return);
      updateCalculator();
    }
  });

  contributionSlider.addEventListener("input", updateCalculator);
  periodSlider.addEventListener("input", updateCalculator);

  // Initialize with default values
  updateCalculator();
}

// Initialize calculator when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeCalculator);
