import { GitLabMergeRequestExtractor } from "../src";
import { GitLabApiError, InvalidConfigError } from "../src/errors";

async function main() {
  try {
    // Initialize the extractor with your GitLab configuration
    const extractor = new GitLabMergeRequestExtractor({
      // For GitLab running locally, typically at http://localhost:port
      baseUrl: "http://localhost:3000", // Adjust port as needed

      // Your GitLab personal access token
      privateToken: "your-gitlab-token",

      // Project ID can be found on your project's home page
      projectId: "your-project-id",
    });

    console.log("Fetching your merge requests...");
    // This will automatically fetch only your merge requests
    // and limit to the 5 most recent ones
    const mergeRequests = await extractor.extractMergeRequests({
      maxResults: 5, // Only fetch the 5 most recent MRs
    });

    // Print the results in a structured format
    console.log(`Found ${mergeRequests.length} of your merge requests\n`);

    mergeRequests.forEach((mr, index) => {
      console.log(`\n--- Merge Request ${index + 1} ---`);
      console.log(`Title: ${mr.title}`);
      console.log(`Author: ${mr.author.name} (${mr.author.username})`);
      console.log(`Merged at: ${new Date(mr.merged_at).toLocaleString()}`);
      console.log(`Files changed: ${mr.changes.length}`);

      mr.changes.forEach((change) => {
        console.log(`\nFile: ${change.new_path}`);
        console.log("Changes:");
        change.changes.forEach((c) => {
          const prefix =
            c.type === "add" ? "+" : c.type === "delete" ? "-" : "M";
          console.log(`  ${prefix} ${c.content}`);
        });
      });

      console.log("\n" + "-".repeat(40));
    });
  } catch (error) {
    if (error instanceof GitLabApiError) {
      console.error("GitLab API Error:", error.message);
      console.error("Status:", error.status);
      if (error.response) {
        console.error("Details:", error.response);
      }
    } else if (error instanceof InvalidConfigError) {
      console.error("Configuration Error:", error.message);
      console.error("Please check your GitLab configuration");
    } else {
      console.error("Unexpected Error:", error.message);
    }
    process.exit(1);
  }
}

main();
