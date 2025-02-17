import { GitLabMergeRequestExtractor, MergeRequestData } from "../src";
import { GitLabApiError, InvalidConfigError } from "../src/errors";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { DiffParser } from "../src/diff-parser";
import * as json2csv from "json2csv";
dotenv.config();

async function main() {
  try {
    const resultsDir = path.join(__dirname, "..", "results");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const extractor = new GitLabMergeRequestExtractor({
      baseUrl: "https://gitlab.com",

      privateToken: process.env.GITLAB_TOKEN || "",

      projectId: process.env.GITLAB_PROJECT_ID || "",
    });

    console.log("Fetching merge requests...");

    const options = {
      maxResults: Number(process.env.MAX_RESULTS) || 10,

      authorId: process.env.AUTHOR_ID
        ? Number(process.env.AUTHOR_ID)
        : undefined,
    };

    const allResults: MergeRequestData[] = [];

    const mergeRequests = await extractor.extractMergeRequests(options);

    mergeRequests.forEach((mr) => {
      const changesSnapshot = mr.changes.map((change) => {
        const mrDir = path.join(resultsDir, `mr-${mr.iid}`);
        if (!fs.existsSync(mrDir)) {
          fs.mkdirSync(mrDir, { recursive: true });
        }

        const diffFileName = `${change.new_path.replace(/\//g, "_")}.diff`;
        const diffPath = path.join(mrDir, diffFileName);
        fs.writeFileSync(diffPath, change.diff);
        const parsedChanges = DiffParser.parse(change.diff);

        return {
          old_path: change.old_path,
          new_path: change.new_path,
          diff_file: diffFileName,
          diff: change.diff,
          changes: parsedChanges,
        };
      });

      allResults.push({ ...mr, changes: changesSnapshot });
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const jsonOutputFile = path.join(
      resultsDir,
      `merge-requests-${timestamp}.json`
    );
    fs.writeFileSync(jsonOutputFile, JSON.stringify(allResults, null, 2));

    const csvOutputFile = path.join(
      resultsDir,
      `merge-requests-${timestamp}.csv`
    );
    const csv = json2csv.parse(allResults);
    fs.writeFileSync(csvOutputFile, csv);

    const mdxOutputFile = path.join(
      resultsDir,
      `merge-requests-${timestamp}.mdx`
    );
    const mdxContent = allResults
      .map(
        (mr) => `
    # Merge Request: ${mr.title}

    **ID:** ${mr.id}
    **IID:** ${mr.iid}
    **Project ID:** ${mr.project_id}
    **Description:** ${mr.description}
    **State:** ${mr.state}
    **Created At:** ${mr.created_at}
    **Updated At:** ${mr.updated_at}
    **Merged By:** ${mr.merged_by.name}
    **Merged At:** ${mr.merged_at}

    ## Changes
    ${mr.changes
      .map(
        (change) => `
    - **Old Path:** ${change.old_path}
    - **New Path:** ${change.new_path}
    - **Diff:** \`${change.diff}\`
    `
      )
      .join("")}
    `
      )
      .join("\n");

    fs.writeFileSync(mdxOutputFile, mdxContent.trim());
  } catch (error) {
    if (error instanceof GitLabApiError) {
      console.error("GitLab API Error:", error.message);
      console.error("Status:", error.status);
      if (error.response) {
        console.error("Details:", error.response);
      }
    } else if (error instanceof InvalidConfigError) {
      console.error("Configuration Error:", error.message);
      console.error(
        "Please ensure GITLAB_TOKEN and GITLAB_PROJECT_ID environment variables are set"
      );
    } else if (error instanceof Error) {
      console.error("Unexpected Error:", error.message);
    } else {
      console.error("Unexpected Error:", String(error));
    }
    process.exit(1);
  }
}

main();
