import { getBackupProblem } from './codingproblemsbackup.js';

document.addEventListener("DOMContentLoaded", () => {
    const levelGrid = document.getElementById("levelGrid");
    const backButton = document.getElementById("backButton");
    const submitButton = document.getElementById("submitButton");
    const languageSelector = document.getElementById("languageSelector");
    const codeEditor = document.getElementById("codeEditor");

    const defaultCode = {
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\";\n    return 0;\n}",
        python: "print(\"Hello, World!\")",
        java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
        javascript: "console.log(\"Hello, World!\");",
        go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"Hello, World!\")\n}",
      };
      codeEditor.value = defaultCode.cpp; //setting cpp as default

      languageSelector.addEventListener("change", (event) => {
        const selectedLanguage = event.target.value;
        codeEditor.value = defaultCode[selectedLanguage];
      });
  
    // Generate level buttons
    for (let i = 1; i <= 100; i++) {
      const button = document.createElement("button");
      button.textContent = `${i}`;
      button.addEventListener("click", () => fetchProblem(i));
      levelGrid.appendChild(button);
    }

// Handle messages from Devvit & code execution results
window.addEventListener("message", (event) => {
    console.log("📩 Message received in WebView:", event.data);

    const wrappedMessage = event.data;
    const innerMessage = wrappedMessage.data?.message?.data;

    // Handle Coding Problem Data from Devvit
    if (wrappedMessage.type === "devvit-message" && innerMessage?.description) {
        hideLoader();
        const problemContainer = document.getElementById("codingProblem");
        const titleContainer = document.getElementById("problemTitle");

        console.log("Received problem data:", innerMessage);
        problemContainer.textContent = innerMessage.description;
        titleContainer.textContent = innerMessage.title;
    }

    if (wrappedMessage.type === "devvit-message" && wrappedMessage.data?.message?.type === "codeJudgementResult") {
        console.log("Code Judgement Result:", innerMessage);

        hideLoader();
        const resultMessage = document.getElementById("resultMessage");
        const nextLevelButton = document.getElementById("nextLevelButton");
        const submitButton = document.getElementById("submitButton");
        const codeEditor = document.getElementById("codeEditor");

        if (innerMessage.isAcceptable) {
            console.log("Code Accepted!");

            // Hide code editor and submit button
            codeEditor.style.display = "none";
            submitButton.style.display = "none";

            // Show "Next Level" button
            nextLevelButton.style.display = "block";
            nextLevelButton.textContent = "Next Level 🚀";

            // Success message
            resultMessage.textContent = "Solution Accepted! 🎉";
            resultMessage.style.color = "green";

            // 🎉 Confetti Effect
            // triggerConfetti();
        } else {
            console.log("Code Incorrect");

            // Keep editor visible
            codeEditor.style.display = "block";
            submitButton.style.display = "block";

            // Show failure message
            resultMessage.textContent = "❌ Code is incorrect. Try again!";
            resultMessage.style.color = "red";

            // Hide "Next Level" button
            nextLevelButton.style.display = "none";
        }
    }

    function goToNextLevel() {
        const currentLevel = parseInt(document.getElementById("problemHeading").textContent.split(" ")[1], 10);
        const nextLevel = currentLevel + 1;
        console.log("Moving to next level:", nextLevel);
      
        // Reset the UI
        const resultMessage = document.getElementById("resultMessage");
        if (resultMessage) resultMessage.textContent = "";
      
        const nextLevelButton = document.getElementById("nextLevelButton");
        if (nextLevelButton) nextLevelButton.style.display = "none";
      
        // Show the components again
        const problemContainer = document.getElementById("problemContainer");
        if (problemContainer) problemContainer.style.display = "block";
      
        const codeEditorContainer = document.getElementById("codeEditor");
        if (codeEditorContainer) codeEditorContainer.style.display = "block";
      
        // Reset any success styling/elements
        const successHeading = document.getElementById("successHeading");
        if (successHeading) successHeading.remove();
      
        // Reset code editor to default for the selected language
        const languageSelector = document.getElementById("languageSelector");
        const codeEditor = document.getElementById("codeEditor");
        if (languageSelector && codeEditor) {
          const selectedLanguage = languageSelector.value;
          codeEditor.value = defaultCode[selectedLanguage] || "";
        }
      
        // Fetch the next level problem
        fetchProblem(nextLevel);
      }

      nextLevelButton.addEventListener("click", goToNextLevel);
});

  
    // Fetch problem for the selected level
    function fetchProblem(level) {
      console.log("Fetching problem for level:", level);
  
      // Show loading message
      const problemContainer = document.getElementById("codingProblem");
      problemContainer.textContent = "Loading problem...";
      showLoader();
  
      // Send the fetch request to Devvit
      window.parent.postMessage({ type: "fetchProblem", level }, "*");
    }
  
    // Clear problem state on back button click
    backButton.addEventListener("click", () => {
  
      const problemContainer = document.getElementById("codingProblem");
      const titleContainer = document.getElementById("problemTitle");
      problemContainer.textContent = "";
      titleContainer.textContent = "";
      hideLoader();
    });
  
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

    function fetchProblem(level) {
        document.getElementById("levelSelectionContainer").style.display = "none";
        document.getElementById("problemContainer").style.display = "block";

        document.getElementById("problemHeading").textContent = `Level ${level}`;
        window.parent.postMessage({ type: "fetchProblem", level }, "*");
    }

    function goBackToMenu() {
        document.getElementById("problemContainer").style.display = "none";
        document.getElementById("levelSelectionContainer").style.display = "block";
    }

    function submitCode() {
        const code = document.getElementById("codeEditor").value;
        const problem = document.getElementById("codingProblem").textContent;
        const language = document.getElementById("languageSelector").value;
        
        showLoader();

        console.log("Submitting code...");
        
        window.parent.postMessage({
            type: "submitCode",
            data: { code, problem, language }
        }, "*");
    }

    backButton.addEventListener("click", goBackToMenu);
    submitButton.addEventListener("click", submitCode);
});

function goBackToMenu() {
    // Show the level grid, hide the problem view
    document.getElementById("problemContainer").style.display = "none";
    document.getElementById("levelSelectionContainer").style.display = "block";
}
async function submitCode() {
    const code = document.getElementById("codeEditor").value;
    const problem = document.getElementById("codingProblem").textContent;
    const language = document.getElementById("languageSelector").value;
    
    showLoader();
    
    try {
        // Call the Devvit server function
        const response = await devvit.call('submitCodeForJudging', { 
            code, 
            problem, 
            language 
        });
        
        if (response.success) {
            const result = response.result;
            const resultMessage = result.isAcceptable
                ? "Code is acceptable! 🎉"
                : "Code is not acceptable. Please try again.";
            
            alert(`${resultMessage}\n${result.description ? `Details: ${result.description}` : ''}`);
            
            if (result.isAcceptable) {
                // Handle successful submission, perhaps advance to next level
                const currentLevel = parseInt(document.getElementById("problemHeading").textContent.split(" ")[1], 10);
                loadLevel(currentLevel + 1);
            }
        } else {
            console.error('Failed to submit code:', response.error);
            alert('An error occurred while submitting the code. Please try again.');
        }
    } catch (error) {
        console.error("Error calling Devvit function:", error);
        alert('An error occurred while submitting the code. Please try again.');
    } finally {
        hideLoader();
    }
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

    // Create and show "Code Accepted" heading
    const successHeading = document.createElement("h2");
    successHeading.id = "successHeading";
    successHeading.textContent = "Code Accepted! 🎉";
    successHeading.style.color = "#4CAF50";
    successHeading.style.textAlign = "center";
    successHeading.style.fontSize = "2rem";
    successHeading.style.marginTop = "2rem";
    
    // Insert the heading at the top of the result container
    const resultContainer = document.getElementById("resultMessage").parentNode;
    resultContainer.insertBefore(successHeading, resultContainer.firstChild);
}
