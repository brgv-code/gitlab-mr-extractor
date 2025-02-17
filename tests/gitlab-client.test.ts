import { GitLabClient } from '../src/gitlab-client';
import { InvalidConfigError } from '../src/errors';

jest.mock('axios');

describe('GitLabClient', () => {
  const validConfig = {
    baseUrl: 'https://gitlab.com',
    privateToken: 'token123',
    projectId: '12345',
  };

  it('should create instance with valid config', () => {
    expect(() => new GitLabClient(validConfig)).not.toThrow();
  });

  it('should throw InvalidConfigError with invalid config', () => {
    const invalidConfig = { ...validConfig, privateToken: '' };
    expect(() => new GitLabClient(invalidConfig)).toThrow(InvalidConfigError);
  });

});
