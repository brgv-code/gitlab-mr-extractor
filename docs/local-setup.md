## GitLab Configuration

1. Start your local GitLab instance (typically runs on http://localhost:3000)

2. Create a Personal Access Token:

- Log into your local GitLab instance
- Go to User Settings > Access Tokens
- Create a new token with `api` and `read_api` scopes
- Save the token securely - you'll need it later

3. Get your project ID:

- Navigate to your project's homepage in GitLab
- Find the project ID on the project's landing page
- It can be either a number or the URL-encoded path (e.g., 'group/project')

## Usage

1. Create a test script (e.g., `examples/test-local.ts`):

```typescript
import { GitLabMergeRequestExtractor } from "../src";

async function main() {
  try {
    const extractor = new GitLabMergeRequestExtractor({
      // Replace with your local GitLab URL and port
      baseUrl: "http://localhost:3000",

      // Your personal access token from step 2
      privateToken: "your-gitlab-token",

      // Your project ID from step 3
      projectId: "your-project-id",
    });

    // This will automatically fetch only your merge requests
    // and limit to the 5 most recent ones
    const mergeRequests = await extractor.extractMergeRequests({
      maxResults: 5, // Optional: limit to 5 most recent MRs
    });

    console.log(`Found ${mergeRequests.length} of your merge requests\n`);

    mergeRequests.forEach((mr, index) => {
      console.log(`\n--- Merge Request ${index + 1} ---`);
      console.log(`Title: ${mr.title}`);
      console.log(`Author: ${mr.author.name} (${mr.author.username})`);
      console.log(`Merged at: ${new Date(mr.merged_at).toLocaleString()}`);

      mr.changes.forEach((change) => {
        console.log(`\nFile: ${change.new_path}`);
        console.log("Changes:");
        change.changes.forEach((c) => {
          const prefix =
            c.type === "add" ? "+" : c.type === "delete" ? "-" : "M";
          console.log(`  ${prefix} ${c.content}`);
        });
      });
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
```
