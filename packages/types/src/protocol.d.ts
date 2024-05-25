import { Model, UnrecordedMessage } from './message';
import {
  QueryCommandOutput,
  RetrieveCommandOutput,
} from '@aws-sdk/client-kendra';

export type PredictRequest = {
  model?: Model;
  messages: UnrecordedMessage[];
  id: string;
};

export type QueryKendraRequest = {
  query: string;
};

export type QueryKendraResponse = QueryCommandOutput;

export type RetrieveKendraRequest = {
  query: string;
};

export type RetrieveKendraResponse = RetrieveCommandOutput;

export type GetDocDownloadSignedUrlRequest = {
  bucketName: string;
  filePrefix: string;
  contentType?: string;
};

export type GetDocDownloadSignedUrlResponse = string;
