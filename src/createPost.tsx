import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  http: true,
});


Devvit.addMenuItem({
  label: 'Create New Devvit Post (with Web View)',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    const level = 1;
    try {
      const response = await fetch('/api/codingProblemApi?level=' + level);
      if (!response.ok) {
        throw new Error('Failed to fetch coding problem');
      }
      const problemData = await response.json();

      const post = await reddit.submitPost({
        title: `CodVit Level ${problemData.level}`,
        subredditName: subreddit.name,
        // The preview appears while the post loads
        preview: (
          <vstack height="100%" width="100%" alignment="middle center">
            <text size="large">Loading ...</text>
          </vstack>
        ),
      });

      ui.showToast({ text: 'Created post!' });
      ui.navigateTo(post);
    } catch (error: unknown) {
      if (error instanceof Error) {
        ui.showToast({ text: `Error: ${error.message}` });
      } else {
        ui.showToast({ text: 'An unknown error occurred' });
      }
    }
  },
});

