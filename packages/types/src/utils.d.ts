import { Model, UnrecordedMessage } from 'jp-rag-sample';

export type InvokeInterface = (
  model: Model,
  messages: UnrecordedMessage[],
  id: string
) => Promise<string>;

export type InvokeStreamInterface = (
  model: Model,
  messages: UnrecordedMessage[],
  id: string
) => AsyncIterable<string>;

export type ApiInterface = {
  invoke: InvokeInterface;
  invokeStream: InvokeStreamInterface;
};
