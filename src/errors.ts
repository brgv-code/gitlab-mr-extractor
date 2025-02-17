export class GitLabApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GitLabApiError';
  }
}

export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidConfigError';
  }
}

export class DiffParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiffParsingError';
  }
}
