// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CloudFormationCustomResourceEvent, Context } from 'aws-lambda';
import {
  KendraClient,
  StartDataSourceSyncJobCommand,
} from '@aws-sdk/client-kendra';
import * as cfnresponse from 'cfn-response';

const logger = console;

const INDEX_ID = process.env['INDEX_ID'] || '';
const DS_ID = process.env['DS_ID'] || '';
const AWS_REGION = process.env['AWS_REGION'] || '';
const KENDRA = new KendraClient({ region: AWS_REGION });

const startDataSourceSync = async (dsId: string, indexId: string) => {
  logger.info(`start_data_source_sync(dsId=${dsId}, indexId=${indexId})`);
  const command = new StartDataSourceSyncJobCommand({
    Id: dsId,
    IndexId: indexId,
  });
  const response = await KENDRA.send(command);
  logger.info(`response: ${JSON.stringify(response)}`);
};

export const handler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context
) => {
  await startDataSourceSync(DS_ID, INDEX_ID);
  const status: cfnresponse.ResponseStatus = cfnresponse.SUCCESS;
  cfnresponse.send(event, context, status, {});
  return status;
};
