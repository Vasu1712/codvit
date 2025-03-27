import { Context, Devvit, useForm, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
});


type WebViewMessage = {
  type: string;
  level?: number;
  data?: any;
};

Devvit.addCustomPostType({
  name: 'CodVit.',
  height: 'tall',
  render: (context: Context & { puzzleId?: string }) => {
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    const puzzleForm = useForm(
      {
        fields: [
          { name: 'title', label: 'Puzzle Title', type: 'string' },
          { name: 'description', label: 'Puzzle Description', type: 'string', multiline: true },
          { name: 'answer', label: 'Correct Answer', type: 'string' },
          { name: 'image', label: 'Puzzle Image', type: 'image' }
        ]
      },
      async (formData) => {
        console.log("Submitting puzzle data:", formData);
        try {
          const response = await fetch('https://codvit-api.vercel.app/api/submit-puzzle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          if (response.ok) {
            context.ui.showToast('Puzzle submitted successfully!');
          } else {
            context.ui.showToast('Failed to submit puzzle. Please try again.');
          }
        } catch (error) {
          console.error('Error submitting puzzle:', error);
          context.ui.showToast('An error occurred. Please try again later.');
        }
      }
    );

    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      return Number(redisCount ?? 0);
    });

    const [webviewVisible, setWebviewVisible] = useState(false);

    const onMessage = async (msg: WebViewMessage) => {
      console.log("Message received from WebView:", msg);
    
      if (msg.type === 'fetchProblem') {
        console.log(`Fetching problem for level ${msg.level}`);
    
        try {
          const response = await fetch(`https://codvit-api.vercel.app/api/coding-problems?level=${msg.level}`);
          console.log("API response status:", response.status);
    
          if (!response.ok) throw new Error(`Failed to fetch problem: ${response.status}`);
    
          const problemData = await response.json();
          console.log("Fetched problem data:", problemData);
    
          // Send the data back to the WebView
          context.ui.webView.postMessage('myWebView', {
            type: 'problemData',
            data: problemData,
          });
        } catch (error) {
          console.error('Error fetching problem:', error);
          context.ui.webView.postMessage('myWebView', {
            type: 'problemData',
            data: { error: 'Failed to load coding problem.' },
          });
        }
      }

      if (msg.type === 'submitCode') {
        const { code, problem, language } = msg.data;
    
        console.log("Forwarding code to judge...");
    
        try {
          // Make the server-side request to your judge API
          const response = await fetch('https://codvit-api.vercel.app/api/coding-judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, problem, language }),
          });
    
          const result = await response.json();
          console.log("Judgement result:", result);
    
          // Send the result back to the WebView
          context.ui.webView.postMessage('myWebView', {
            type: 'codeJudgementResult',
            data: result,
          });
        } catch (error) {
          console.error("Error sending code to judge:", error);
    
          context.ui.webView.postMessage('myWebView', {
            type: 'codeJudgementError',
            error: "Failed to judge code.",
          });
        }
      }

      if (msg.type === 'fetchRiddle') {
        console.log(`Fetching riddle for level ${msg.level}`);
    
        try {
          const response = await fetch(`https://codvit-api.vercel.app/api/math-riddle?level=${msg.level}`);
          console.log("API response status:", response.status);
    
          if (!response.ok) throw new Error(`Failed to fetch riddle: ${response.status}`);
    
          const riddleData = await response.json();
          console.log("Fetched riddle data:", riddleData);
    
          context.ui.webView.postMessage('myWebView', {
            type: 'riddleData',
            data: riddleData,
          });
        } catch (error) {
          console.error('Error fetching riddle:', error);
          context.ui.webView.postMessage('myWebView', {
            type: 'riddleData',
            data: { error: 'Failed to load math riddle.' },
          });
        }
      }

      if (msg.type === 'submitMathAnswer') {
        const { selectedOptionIndex, _hiddenData } = msg.data;
        console.log("Forwarding math answer to judge...");
        try {
          const response = await fetch('https://codvit-api.vercel.app/api/math-judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedOptionIndex, _hiddenData }),
          });
          
          const result = await response.json();
          console.log("Math judgment result:", result);
          
          context.ui.webView.postMessage('myWebView', {
            type: 'mathAnswerResult',
            result
          });
        } catch (error) {
          console.error("Error judging math answer:", error);
          context.ui.webView.postMessage('myWebView', {
            type: 'mathAnswerError',
            error: "Failed to check answer"
          });
        }
      }

      if (msg.type === 'openPuzzleSubmissionForm') {
        console.log("Opening puzzle submission form");

        context.ui.showForm(puzzleForm);
      }

      if (msg.type === 'submitPuzzle') {
        const { image, description, answer, username } = msg.data;
        console.log("Submitting puzzle...");
        try {
          const response = await fetch('https://codvit-api.vercel.app/api/submit-puzzle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image, description, answer, username }),
          });
          
          const result = await response.json();
          console.log("Puzzle submission result:", result);
          
          context.ui.webView.postMessage('myWebView', {
            type: 'puzzleSubmissionResult',
            data: result,
          });
        } catch (error) {
          console.error("Error submitting puzzle:", error);
          context.ui.webView.postMessage('myWebView', {
            type: 'puzzleSubmissionError',
            error: "Failed to submit puzzle"
          });
        }
      }
      
      if (msg.type === 'fetchPuzzle') {
        console.log("Fetching puzzle of the day");
        try {
          const response = await fetch('https://codvit-api.vercel.app/api/puzzle-of-the-day');
          if (!response.ok) throw new Error(`Failed to fetch puzzle: ${response.status}`);
          const puzzleData = await response.json();
          // Store the puzzleId in the context
          context.puzzleId = puzzleData.id;
          context.ui.webView.postMessage('myWebView', {
            type: 'puzzleData',
            data: puzzleData,
          });
        } catch (error) {
          console.error('Error fetching puzzle:', error);
          context.ui.webView.postMessage('myWebView', {
            type: 'puzzleData',
            data: { error: 'Failed to load puzzle of the day.' },
          });
        }
      }
      

      if (msg.type === 'submitPuzzleAnswer') {
        const { answer, submissionTime, puzzleId } = msg.data;
        console.log("Forwarding puzzle answer to judge...");
        try {
          const response = await fetch('https://codvit-api.vercel.app/api/potd-judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              answer, 
              submissionTime, 
              puzzleId,
              username: await context.reddit.getCurrentUser().then(user => user?.username)
            }),
          });
          const result = await response.json();
          console.log("POTD judgment result:", result);
          context.ui.webView.postMessage('myWebView', {
            type: 'potdAnswerResult',
            result,
            username
          });
        } catch (error) {
          console.error("Error judging POTD answer:", error);
          context.ui.webView.postMessage('myWebView', {
            type: 'potdAnswerError',
            error: "Failed to check answer"
          });
        }
      }
      
    };

    const onShowWebviewClick = () => {
      setWebviewVisible(true);
      context.ui.webView.postMessage('myWebView', {
        type: 'initialData',
        data: { username, currentCounter: counter },
      });
    };

    return (
      <vstack grow padding="small" backgroundColor="#000000">
        <vstack grow={!webviewVisible} height={webviewVisible ? '0%' : '100%'} alignment="middle center">
          <text size="xxlarge" weight="bold">CodVit.</text>
          <spacer size="medium" />
          <vstack alignment="start middle">
            <hstack>
              <text size="medium">Hi there, </text>
              <text size="medium" weight="bold">{username ?? ''}!</text>
            </hstack>
          </vstack>
          <spacer size="medium" />
          <button onPress={onShowWebviewClick}>Tap here to begin!!</button>
        </vstack>

        <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
          <vstack border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height={webviewVisible ? '100%' : '0%'}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
