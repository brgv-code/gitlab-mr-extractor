# GitLab Merge Request Extractor

A TypeScript library for extracting and analyzing GitLab merge request data, including code diffs and changes.

## Features

- Extract merge request data from GitLab repositories
- Parse and analyze code diffs
- Export data in multiple formats (JSON, CSV, MDX)
- Save code changes and diffs to files
- TypeScript support with type definitions
- Error handling
- Simple API

## Installation

```bash
npm install gitlab-mr-extractor
```

## Quick Start

```typescript
import { GitLabMergeRequestExtractor } from 'gitlab-mr-extractor';

// Initialize the extractor
const extractor = new GitLabMergeRequestExtractor({
  baseUrl: 'https://gitlab.com',
  privateToken: 'your-gitlab-token',
  projectId: 'your-project-id'
});

// Extract merge requests
const mergeRequests = await extractor.extractMergeRequests({
  maxResults: 5 // Optional: limit results
});
```

## API Reference

### GitLabMergeRequestExtractor

Main class for interacting with GitLab merge requests.

#### Constructor

```typescript
constructor(config: GitLabConfig)
```

Parameters:
- `config`: Configuration object containing:
  - `baseUrl`: GitLab instance URL
  - `privateToken`: GitLab API token
  - `projectId`: Target project ID

#### Methods

##### extractMergeRequests

```typescript
async extractMergeRequests(options?: FetchOptions): Promise<MergeRequestData[]>
```

Parameters:
- `options`: Optional configuration
  - `authorId`: Filter by author ID
  - `maxResults`: Limit number of results

Returns: Array of merge request data

### DiffParser

Utility class for parsing Git diffs.

```typescript
static parse(rawDiff: string): DiffChange[]
```

## Data Structures

### MergeRequestData

```typescript
interface MergeRequestData {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  merged_at: string;
  author: {
    id: number;
    name: string;
    username: string;
  };
  changes: CodeDiff[];
}
```

### CodeDiff

```typescript
interface CodeDiff {
  old_path: string;
  new_path: string;
  diff: string;
  changes: DiffChange[];
}
```

## Examples

### Basic Usage

```typescript
import { GitLabMergeRequestExtractor } from 'gitlab-mr-extractor';

async function main() {
  const extractor = new GitLabMergeRequestExtractor({
    baseUrl: 'https://gitlab.com',
    privateToken: process.env.GITLAB_TOKEN,
    projectId: process.env.GITLAB_PROJECT_ID
  });

  const mergeRequests = await extractor.extractMergeRequests();
  console.log(`Found ${mergeRequests.length} merge requests`);
}
```

### Saving Results

```typescript
// Save as JSON
fs.writeFileSync('results.json', JSON.stringify(mergeRequests, null, 2));

// Save as CSV
import * as json2csv from 'json2csv';
const csv = json2csv.parse(mergeRequests);
fs.writeFileSync('results.csv', csv);

// Save as MDX
const mdxContent = generateMdxContent(mergeRequests);
fs.writeFileSync('results.mdx', mdxContent);
```

### Error Handling

```typescript
try {
  const mergeRequests = await extractor.extractMergeRequests();
} catch (error) {
  if (error instanceof GitLabApiError) {
    console.error('GitLab API Error:', error.message);
    console.error('Status:', error.status);
  } else if (error instanceof InvalidConfigError) {
    console.error('Configuration Error:', error.message);
  }
}
```

## Contributing

To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

Requirements:
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Write clear commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support:

1. Check the documentation [here](https://github.com/brgv-code/gitlab-mr-extractor/blob/main/docs/local-setup.md)
2. Search existing issues [here](https://github.com/brgv-code/gitlab-mr-extractor/issues)
3. Create a new issue [here](https://github.com/brgv-code/gitlab-mr-extractor/issues/new)

## Acknowledgments

- GitLab API Team
- Contributors

---

Created by [Bhargav](https://github.com/brgv-code)