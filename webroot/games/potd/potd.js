document.addEventListener("DOMContentLoaded", () => {
    const puzzleContainer = document.getElementById("puzzleContainer");
    const potdContainer = document.getElementById("potdContainer");
    const launchPuzzleButton = document.getElementById("launchPuzzle");
    const puzzleTitle = document.getElementById("puzzleTitle");
    const puzzleImage = document.getElementById("puzzleImage");
    const answerInput = document.getElementById("answerInput");
    const submitButton = document.getElementById("submitButton");
    const resultMessage = document.getElementById("resultMessage");
    const timerContainer = document.getElementById("timerContainer");
    const puzzleDescription = document.getElementById("puzzleDescription");
    const resultContainer = document.getElementById("resultContainer");
    const resultCorrect = document.getElementById("resultCorrect");
    const resultUsername = document.getElementById("resultUsername");
    const resultTime = document.getElementById("resultTime");
    const resultPercentile = document.getElementById("resultPercentile");
    let startTime;
    let currentPuzzleId;

  
    // Initially show the puzzleContainer
    puzzleContainer.style.display = "block";
    potdContainer.style.display = "none";
    resultContainer.style.display = "none";
  
    launchPuzzleButton.addEventListener("click", () => {
        puzzleContainer.style.display = "none";
        potdContainer.style.display = "block";
        answerInput.style.display = 'block';
        submitButton.style.display = 'block';
        timerContainer.style.display = 'block';
        puzzleImage.style.display = 'block';
        puzzleDescription.style.display = 'block';
        fetchPuzzle();
    });
    
  
    function fetchPuzzle() {
      showLoader();
      window.parent.postMessage({ type: "fetchPuzzle" }, "*");
    }
  
    function startTimer() {
      startTime = Date.now();
      updateTimer();
    }
  
    function updateTimer() {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      timerContainer.textContent = `${elapsedTime}s`;
      requestAnimationFrame(updateTimer);
    }
  
    function submitAnswer() {
        const answer = answerInput.value;
        const submissionTime = Math.floor((Date.now() - startTime) / 1000);
        showLoader();
        window.parent.postMessage({
          type: "submitPuzzleAnswer",
          data: { answer, submissionTime, puzzleId: currentPuzzleId }
        }, "*");
      }
  
    // Handle messages from Devvit
    window.addEventListener("message", (event) => {
      console.log("📩 Message received in WebView:", event.data);
      const wrappedMessage = event.data;
      let innerMessage;
  
      if (wrappedMessage.data?.message?.data) {
        innerMessage = wrappedMessage.data.message.data;
      } else {
        innerMessage = wrappedMessage.data;
      }
  
      if (wrappedMessage.type === "devvit-message" && innerMessage) {
        hideLoader();
        if (innerMessage.imageUrl && innerMessage.description) {
          console.log("Received puzzle data:", innerMessage);
          currentPuzzleId = innerMessage.puzzleId;
          puzzleTitle.textContent = innerMessage.title;
          puzzleImage.src = innerMessage.imageUrl;
          puzzleDescription.textContent = innerMessage.description;
          startTimer();
        }
        } else if (wrappedMessage.type === "devvit-message" && wrappedMessage.data?.message?.type === "potdAnswerResult") {
            hideLoader();
            const result = wrappedMessage.data.message.result;
            console.log("POTD Result:", result);
            

            if (result && result.isCorrect) {
                puzzleContainer.style.display = "none";
                potdContainer.style.display = "none";
                resultContainer.style.display = "block";

                resultCorrect.textContent = 'CORRECT ANSWER!!';
                resultTime.textContent = `⏱️ ${result.timeTaken}s`;
                resultPercentile.textContent = `Beats ${result.percentileBeat}% of solutions!`;

                triggerConfetti();

            } else
            {
            resultMessage.textContent = "Incorrect. Try again!";
            resultMessage.style.color = "red";
            }
        } else if (wrappedMessage.type === "devvit-message" && wrappedMessage.data?.message?.type === "potdAnswerError") {
            hideLoader();
            const errorMessage = wrappedMessage.data.message.error || "An error occurred while checking your answer.";
            resultMessage.textContent = errorMessage;
            resultMessage.style.color = "red";
            console.error("POTD Answer Error:", errorMessage);
        }
    });
  
    submitButton.addEventListener("click", submitAnswer);
  
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
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      
        const confetti = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
        for (let i = 0; i < 100; i++) {
          confetti.push({
            x: Math.random() * canvas.width,
            y: -10,
            size: Math.random() * 5 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 1
          });
        }
      
        function animate() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          confetti.forEach((particle, index) => {
            particle.y += particle.speed;
            particle.x += Math.sin(particle.y * 0.1) * 2;
      
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      
            if (particle.y > canvas.height) {
              particle.y = -10;
              particle.x = Math.random() * canvas.width;
            }
          });
      
          requestAnimationFrame(animate);
        }
      
        animate();
      
        // Stop the animation after 5 seconds
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 5000);
      }
      

    const showPuzzleSubmissionFormButton = document.getElementById("showPuzzleSubmissionForm");
    showPuzzleSubmissionFormButton.addEventListener("click", openPuzzleForm);
  
    function openPuzzleForm() {
      window.parent.postMessage({
        type: "openPuzzleSubmissionForm"
      }, "*");
    }
  
    window.addEventListener("message", (event) => {
        const wrappedMessage = event.data;
        
        if (wrappedMessage.type === "devvit-message") {
          const messageType = wrappedMessage.data?.message?.type;
          const messageData = wrappedMessage.data?.message?.data;
      
          if (messageType === 'puzzleData') {
            // Handle puzzle data population
            puzzleTitle.textContent = messageData.title;
            puzzleImage.src = messageData.imageUrl;
            puzzleDescription.textContent = messageData.description;
            startTimer();
          }
          
          if (messageType === 'potdAnswerResult') {
            const result = wrappedMessage.data?.message?.result;
            const message = wrappedMessage.data?.message;
            if (result?.isCorrect) {
                puzzleContainer.style.display = "none";
                potdContainer.style.display = "none";
                resultContainer.style.display = "block";

                resultUsername.textContent = message.username;resultContainer
                resultCorrect.textContent = 'CORRECT ANSWER!!';
                resultTime.textContent = `⏱️ ${result.timeTaken}s`;
                resultPercentile.textContent = `Beats ${result.percentileBeat}% of solutions!`;
            } else {
                resultMessage.textContent = "Incorrect. Try again!";
                resultMessage.style.color = "red";
          }
        }
        }
      });
  });