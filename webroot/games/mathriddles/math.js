document.addEventListener("DOMContentLoaded", () => {
    const levelGrid = document.getElementById("levelGrid");
    const backButton = document.getElementById("backButton");
    const submitButton = document.getElementById("submitButton");
    const nextLevelButton = document.getElementById("nextLevelButton");
    
    let selectedOptionIndex = null;
    
    // Generate level buttons
    for (let i = 1; i <= 100; i++) {
      const button = document.createElement("button");
      button.textContent = `${i}`;
      button.addEventListener("click", () => fetchRiddle(i));
      levelGrid.appendChild(button);
    }
  
    // Handle messages from Devvit
    window.addEventListener("message", (event) => {
      console.log("📩 Message received in WebView:", event.data);
      const wrappedMessage = event.data;
      
      // Extract data from potentially different message structures
      let innerMessage;
      if (wrappedMessage.data?.message?.data) {
        innerMessage = wrappedMessage.data.message.data;
      }
      
      if (wrappedMessage.type === "devvit-message" && innerMessage) {
        hideLoader();
        const riddleContainer = document.getElementById("mathRiddle");
        const titleContainer = document.getElementById("riddleTitle");
        const optionsContainer = document.getElementById("optionsContainer");
        
        if (innerMessage.description) {
          console.log("Received riddle data:", innerMessage);
          
          // Store the riddleId for later use
          document.getElementById("riddleContainer").dataset.riddleId = innerMessage.riddleId || '';
          document.getElementById("riddleContainer").dataset.hiddenData = innerMessage._hiddenData || '';
          // Reset any previous selection
          selectedOptionIndex = null;
          
          // Display riddle and title
          riddleContainer.textContent = innerMessage.description;
          titleContainer.textContent = innerMessage.title;
          
          // Create option buttons
          optionsContainer.innerHTML = ''; // Clear previous options
          
          if (innerMessage.options && Array.isArray(innerMessage.options)) {
            innerMessage.options.forEach((option, index) => {
              const optionButton = document.createElement("button");
              optionButton.textContent = option;
              optionButton.classList.add("option-button");
              optionButton.dataset.index = index;
              optionButton.addEventListener("click", () => selectOption(index));
              optionsContainer.appendChild(optionButton);
            });
          }
        } else {
          riddleContainer.textContent = "Riddle description not found.";
          titleContainer.textContent = "Untitled Riddle";
        }
      }
      
      if (wrappedMessage.type === "mathAnswerResult" || (wrappedMessage.type === "devvit-message" && wrappedMessage.data?.message?.type === "mathAnswerResult")) {
        
        hideLoader();
        let result;
        if (wrappedMessage.type === "mathAnswerResult") {
            result = wrappedMessage.result;
        } else {
            // It's a wrapped devvit-message
            result = wrappedMessage.data?.message?.result;
        }
        
        console.log("Answer Validation Result:", result);
        
        // Get UI elements
        const resultMessage = document.getElementById("resultMessage");
        const nextLevelButton = document.getElementById("nextLevelButton");
        const submitButton = document.getElementById("submitButton");
        const optionsContainer = document.getElementById("optionsContainer");
        
        if (result && result.isAcceptable) {
          console.log("Correct Answer!");
          
            resultMessage.textContent = "✅ Correct answer! 🎉";
            resultMessage.style.color = "green";
            resultMessage.style.fontSize = "1.75rem";
            resultMessage.style.textAlign = "center";
            resultMessage.style.paddingTop = "2rem";
            
            // triggerConfetti();
            
            optionsContainer.style.display = "none";
            submitButton.style.display = "none";
            
            nextLevelButton.style.display = "block";
            nextLevelButton.textContent = "Next Level 🚀";
        } else {

            resultMessage.textContent = "❌ Incorrect answer. Try again!";
            resultMessage.style.color = "red";
            resultMessage.style.fontSize = "1.2rem";
            resultMessage.style.textAlign = "center";
            
            // Keep options visible
            optionsContainer.style.display = "block";
            submitButton.style.display = "block";
            
            // Hide next level button
            nextLevelButton.style.display = "none";
        }
    }
      
      if (event.data.type === "mathAnswerError") {
        hideLoader();
        const errorMessageElement = document.getElementById("errorMessage");
        errorMessageElement.textContent = "Error: Failed to check your answer.";
        errorMessageElement.style.display = "block";
      }
    });
  
    function fetchRiddle(level) {
      document.getElementById("levelSelectionContainer").style.display = "none";
      document.getElementById("riddleContainer").style.display = "block";
      document.getElementById("riddleHeading").textContent = `Level ${level}`;
      
      // Reset UI elements
      document.getElementById("resultMessage").textContent = "";
      document.getElementById("optionsContainer").innerHTML = "";
      document.getElementById("submitButton").style.display = "block";
      document.getElementById("nextLevelButton").style.display = "none";
      
      // Show loading message
      const riddleContainer = document.getElementById("mathRiddle");
      riddleContainer.textContent = "Loading riddle...";
      showLoader();
      
      // Request riddle from parent window
      window.parent.postMessage({ type: "fetchRiddle", level }, "*");
    }
  
    function selectOption(index) {
      selectedOptionIndex = index;
      
      // Clear any error messages when an option is selected
      const errorMessageElement = document.getElementById("errorMessage");
      errorMessageElement.style.display = "none";
      errorMessageElement.textContent = "";
      
      // Update UI to show selected option
      const options = document.querySelectorAll('.option-button');
      options.forEach(option => {
        option.classList.remove('selected');
      });
      
      options[index].classList.add('selected');
    }
    
  
    function submitAnswer() {

      const errorMessageElement = document.getElementById("errorMessage");
      errorMessageElement.style.display = "none";
      errorMessageElement.textContent = "";
      
      if (selectedOptionIndex === null) {

        errorMessageElement.textContent = "Please select an answer option";
        errorMessageElement.style.display = "block";
        return;
      }
      
      const riddleContainer = document.getElementById("riddleContainer");
      const hiddenData = riddleContainer.dataset.hiddenData;
      
      if (!hiddenData) {

        errorMessageElement.textContent = "Hidden data not found. Please try loading a new riddle.";
        errorMessageElement.style.display = "block";
        return;
      }
      
      showLoader();
      console.log("Submitting answer...");
      
      window.parent.postMessage({
        type: "submitMathAnswer",
        data: {
          selectedOptionIndex,
          _hiddenData: hiddenData
        }
      }, "*");
    }
  
    function goBackToMenu() {
      document.getElementById("riddleContainer").style.display = "none";
      document.getElementById("levelSelectionContainer").style.display = "block";
    }
    
    function goToNextLevel() {
      const currentLevel = parseInt(document.getElementById("riddleHeading").textContent.split(" ")[1], 10);
      const nextLevel = currentLevel + 1;
      console.log("Moving to next level:", nextLevel);
      
      // Reset the UI
      document.getElementById("resultMessage").textContent = "";
      document.getElementById("nextLevelButton").style.display = "none";
      
      // Show the submit button again
      document.getElementById("submitButton").style.display = "block";
      const optionsContainer = document.getElementById("optionsContainer");
      optionsContainer.style.display = "flex";
      optionsContainer.style.gap = "10px";
      optionsContainer.style.marginTop = "20px";
      
      // Fetch the next level riddle
      fetchRiddle(nextLevel);
    }
  
    // Show loading spinner
    function showLoader() {
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "block";
    }
  
    // Hide loading spinner
    function hideLoader() {
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "none";
    }
  
    function triggerConfetti() {
      // Create a more sophisticated confetti animation
      var count = 200;
      var defaults = {
        origin: { y: 0.7 }
      };
      
      function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      }
      
      // Launch multiple confetti bursts for a richer effect
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
      
      // Create and show "Answer Accepted" heading
      const successHeading = document.createElement("h2");
      successHeading.id = "successHeading";
      successHeading.textContent = "Answer Accepted! 🎉";
      successHeading.style.color = "#4CAF50";
      successHeading.style.textAlign = "center";
      successHeading.style.fontSize = "2rem";
      successHeading.style.marginTop = "2rem";
      
      // Insert the heading at the top of the result container
      const resultContainer = document.getElementById("resultMessage").parentNode;
      resultContainer.insertBefore(successHeading, resultContainer.firstChild);
    }
  
    // Event listeners
    backButton.addEventListener("click", goBackToMenu);
    submitButton.addEventListener("click", submitAnswer);
    nextLevelButton.addEventListener("click", goToNextLevel);
  });
  