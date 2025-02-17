import { MergeRequestFetcher } from '../src/merge-request';
import { GitLabClient } from '../src/gitlab-client';
import { MergeRequestData, ApiResponse, GitLabConfig } from '../src/types';
import { GitLabApiError } from '../src/errors';

jest.mock('../src/gitlab-client');

describe('MergeRequestFetcher', () => {
  let client: jest.Mocked<GitLabClient>;
  let fetcher: MergeRequestFetcher;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockConfig: GitLabConfig = {
      baseUrl: 'https://gitlab.com',
      privateToken: 'test-token',
      projectId: '12345'
    };

    client = new GitLabClient(mockConfig) as jest.Mocked<GitLabClient>;
    client.getMergedMergeRequests = jest.fn();
    client.getMergeRequestDiff = jest.fn();

    fetcher = new MergeRequestFetcher(client);
  });

  it('should fetch merge requests and their diffs', async () => {
    const mockMR = {
      id: 1,
      iid: 1,
      title: 'Test MR',
      description: 'Test description',
      state: 'merged',
      merged_at: '2024-02-16T00:00:00Z',
      author: {
        id: 1,
        name: 'Test User',
        username: 'testuser'
      }
    };

    const mockDiff = {
      old_path: 'test.ts',
      new_path: 'test.ts',
      diff: ' test\n+added line\n-removed line'
    };

    client.getMergedMergeRequests
      .mockResolvedValueOnce({
        data: [mockMR],
        status: 200
      } as ApiResponse<any[]>)
      .mockResolvedValueOnce({
        data: [],
        status: 200
      } as ApiResponse<any[]>);

    client.getMergeRequestDiff.mockResolvedValue({
      data: [mockDiff],
      status: 200
    } as ApiResponse<any[]>);

    const result = await fetcher.fetchAllMerged();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test MR');
    expect(result[0].changes).toBeDefined();
    expect(result[0].changes[0].diff).toBe(mockDiff.diff);
  });

  it('should handle large number of merge requests', async () => {
    const mockMRs = Array(100).fill(null).map((_, index) => ({
      id: index,
      iid: index,
      title: `MR ${index}`,
      description: 'Test',
      state: 'merged',
      merged_at: '2024-02-16T00:00:00Z',
      author: { id: 1, name: 'Test', username: 'test' }
    }));

    client.getMergedMergeRequests
      .mockResolvedValueOnce({
        data: mockMRs,
        status: 200
      } as ApiResponse<any[]>)
      .mockResolvedValueOnce({
        data: [],
        status: 200
      } as ApiResponse<any[]>);

    client.getMergeRequestDiff.mockResolvedValue({
      data: [{ old_path: 'test.ts', new_path: 'test.ts', diff: '+test' }],
      status: 200
    } as ApiResponse<any[]>);

    const result = await fetcher.fetchAllMerged();
    expect(result).toHaveLength(100);
  });

  it('should handle rate limiting', async () => {
    client.getMergedMergeRequests.mockRejectedValueOnce(
      new GitLabApiError('API rate limit exceeded', 429)
    );

    await expect(fetcher.fetchAllMerged()).rejects.toThrow('API rate limit exceeded');
    expect(client.getMergedMergeRequests).toHaveBeenCalledTimes(1);
  });

  it('should handle malformed merge request data', async () => {
    const malformedMR = {
      id: 1,
    };

    client.getMergedMergeRequests.mockResolvedValueOnce({
      data: [malformedMR],
      status: 200
    } as ApiResponse<any[]>);

    await expect(fetcher.fetchAllMerged()).rejects.toThrow();
  });

  it('should handle empty merge request list', async () => {
    client.getMergedMergeRequests.mockResolvedValueOnce({
      data: [],
      status: 200
    } as ApiResponse<any[]>);

    const result = await fetcher.fetchAllMerged();
    expect(result).toHaveLength(0);
    expect(client.getMergeRequestDiff).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    client.getMergedMergeRequests.mockRejectedValueOnce(new Error('API Error'));
    await expect(fetcher.fetchAllMerged()).rejects.toThrow('API Error');
  });

  it('should handle missing data in API response', async () => {
    client.getMergedMergeRequests.mockResolvedValueOnce({
      status: 200
    } as ApiResponse<any[]>);

    await expect(fetcher.fetchAllMerged()).rejects.toThrow('Invalid API response: missing data');
  });

  it('should handle network timeouts', async () => {
    client.getMergedMergeRequests.mockRejectedValueOnce(
      new GitLabApiError('Request timeout', 504)
    );

    await expect(fetcher.fetchAllMerged()).rejects.toThrow('Request timeout');
  });
});