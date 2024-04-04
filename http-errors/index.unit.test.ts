import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '.'

describe('HTTP Errors', () => {
  describe.each([
    {
      type: 'BadRequestError',
      error: new BadRequestError('Request failed validation', {
        errors: { required_field: 'required_field is required' },
      }),
      expected: {
        status: 400,
        title: 'Bad Request',
        detail: 'Request failed validation',
        context: {
          errors: { required_field: 'required_field is required' },
        },
      },
    },
    {
      type: 'UnauthorizedError',
      error: new UnauthorizedError('Invalid token'),
      expected: {
        status: 401,
        title: 'Unauthorized',
        detail: 'Invalid token',
      },
    },
    {
      type: 'ForbiddenError',
      error: new ForbiddenError('Access denied'),
      expected: {
        status: 403,
        title: 'Forbidden',
        detail: 'Access denied',
      },
    },
    {
      type: 'NotFoundError',
      error: new NotFoundError('Resource not found'),
      expected: {
        status: 404,
        title: 'Not Found',
        detail: 'Resource not found',
      },
    },
    {
      type: 'TooManyRequestsError',
      error: new TooManyRequestsError('Rate limit exceeded'),
      expected: {
        status: 429,
        title: 'Too Many Requests',
        detail: 'Rate limit exceeded',
      },
    },
    {
      type: 'InternalServerError',
      error: new InternalServerError(),
      expected: {
        status: 500,
        title: 'Internal Server Error',
        detail: 'An unexpected error occurred. Please try again.',
      },
    },
  ])('GIVEN a $type error', ({ error, expected }) => {
    test(`THEN it should serialize to expected format`, () => {
      expect(error.serialize()).toEqual(expected)
    })
  })
})
