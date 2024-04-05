import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from 'aws-lambda'
import { HttpError, InternalServerError } from '../http-errors'

export type PromiseHandler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: Context
) => Promise<TResult>

export const withHttpErrors =
  (
    handler: PromiseHandler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>
  ): PromiseHandler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> =>
  async (
    event: APIGatewayProxyEventV2,
    context: Context
  ): Promise<APIGatewayProxyResultV2> => {
    try {
      return await handler(event, context)
    } catch (error) {
      if (error instanceof HttpError) {
        return {
          statusCode: error.status,
          body: JSON.stringify(error.serialize()),
        }
      }

      return {
        statusCode: 500,
        body: JSON.stringify(new InternalServerError().serialize()),
      }
    }
  }
