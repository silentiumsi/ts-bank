import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from 'aws-lambda'
import { withHttpErrors } from '.'
import { BadRequestError } from '../http-errors'

const event: APIGatewayProxyEventV2 = {
  version: '2.0',
  routeKey: '$default',
  rawPath: '/my/path',
  rawQueryString: 'parameter1=value1&parameter1=value2&parameter2=value',
  cookies: ['cookie1', 'cookie2'],
  headers: {
    header1: 'value1',
    header2: 'value1,value2',
  },
  queryStringParameters: {
    parameter1: 'value1,value2',
    parameter2: 'value',
  },
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    authentication: {
      clientCert: {
        clientCertPem: 'CERT_CONTENT',
        subjectDN: 'www.example.com',
        issuerDN: 'Example issuer',
        serialNumber: 'a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1',
        validity: {
          notBefore: 'May 28 12:30:02 2019 GMT',
          notAfter: 'Aug  5 09:36:04 2021 GMT',
        },
      },
    },
    domainName: 'id.execute-api.us-east-1.amazonaws.com',
    domainPrefix: 'id',
    http: {
      method: 'POST',
      path: '/my/path',
      protocol: 'HTTP/1.1',
      sourceIp: '192.0.2.1',
      userAgent: 'agent',
    },
    requestId: 'id',
    routeKey: '$default',
    stage: '$default',
    time: '12/Mar/2020:19:03:58 +0000',
    timeEpoch: 1583348638390,
  },
  body: 'Hello from Lambda',
  pathParameters: {
    parameter1: 'value1',
  },
  isBase64Encoded: false,
  stageVariables: {
    stageVariable1: 'value1',
    stageVariable2: 'value2',
  },
}

const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (event.body === 'bad-request') {
    throw new BadRequestError('Validation failed', {
      errors: {
        field_path: 'field_path is required',
      },
    })
  }

  if (event.body === 'internal-server-error') {
    throw new Error('uh oh!')
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello, world!' }),
  }
}

describe('withHttpErrors', () => {
  describe('GIVEN a BadRequestError is thrown', () => {
    it('SHOULD return a serialized Bad Request response', async () => {
      const handlerWithMiddleware = withHttpErrors(handler)

      const response = await handlerWithMiddleware(
        {
          ...event,
          body: 'bad-request',
        },
        {} as Context
      )

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          status: 400,
          title: 'Bad Request',
          detail: 'Validation failed',
          context: {
            errors: {
              field_path: 'field_path is required',
            },
          },
        }),
      })
    })
  })

  describe('GIVEN a Generic Error is thrown', () => {
    it('SHOULD return a serialized Internal Server Error response', async () => {
      const handlerWithMiddleware = withHttpErrors(handler)

      const response = await handlerWithMiddleware(
        {
          ...event,
          body: 'internal-server-error',
        },
        {} as Context
      )

      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          status: 500,
          title: 'Internal Server Error',
          detail: 'An unexpected error occurred. Please try again.',
        }),
      })
    })
  })
})
