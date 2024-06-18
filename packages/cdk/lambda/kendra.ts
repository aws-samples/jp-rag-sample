import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  KendraClient,
  QueryCommand,
  SubmitFeedbackCommand,
  DescribeIndexCommand,
  ListDataSourcesCommand,
  QueryCommandOutput,
} from '@aws-sdk/client-kendra';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const kendra_client = new KendraClient({});
const s3_client = new S3Client({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}');
  switch (event.httpMethod) {
    case 'POST':
      switch (event.path) {
        case '/kendra/query':
          return await kendraQuery(body);
        case '/kendra/send':
          return await kendraSend(body);
        case '/kendra/describeIndex':
          return await kendraDescribe(body);
        case '/kendra/listDataSources':
          return await kendraListDataSources(body);
        default:
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: 'Not found' }),
          };
      }
    default:
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Method not allowed' }),
      };
  }
};

async function kendraQuery(body: QueryCommand): Promise<APIGatewayProxyResult> {
  const requestBody = body.input;
  const response = await kendra_client.send(new QueryCommand(requestBody));
  const convertedResponse = await convertS3Url(response);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(convertedResponse),
  };
}

async function kendraSend(
  body: SubmitFeedbackCommand
): Promise<APIGatewayProxyResult> {
  const requestBody = body.input;
  const response = await kendra_client.send(
    new SubmitFeedbackCommand(requestBody)
  );
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(response),
  };
}

async function kendraDescribe(
  body: DescribeIndexCommand
): Promise<APIGatewayProxyResult> {
  const requestBody = body.input;
  const response = await kendra_client.send(
    new DescribeIndexCommand(requestBody)
  );
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(response),
  };
}

async function kendraListDataSources(
  body: ListDataSourcesCommand
): Promise<APIGatewayProxyResult> {
  const requestBody = body.input;
  const response = await kendra_client.send(
    new ListDataSourcesCommand(requestBody)
  );
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(response),
  };
}

async function convertS3Url(
  data: QueryCommandOutput
): Promise<QueryCommandOutput> {
  if (data && data.ResultItems) {
    for (const result of data.ResultItems) {
      if (result && result.DocumentId) {
        try {
          if (result.DocumentId.startsWith('s3')) {
            const [, , bucket, ...key] = result.DocumentId.split('/');
            const command = new GetObjectCommand({
              Bucket: bucket,
              Key: key.join('/'),
            });
            const signedUrl = await getSignedUrl(s3_client, command, {
              expiresIn: 3600,
            });
            result.DocumentURI = signedUrl;
          }
        } catch (error) {
          console.error('Error converting S3 URL:', error);
        }
      }
    }
  }
  return data;
}
