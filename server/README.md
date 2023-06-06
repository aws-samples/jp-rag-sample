# JP RAG SAMPLE (Server)

## ローカル開発

```zsh
export AWS_REGION="us-weest-2"
export ALLOW_ORIGINS="http://localhost:5173"
export SAGEMAKER_ENDPOINT_NAME="Rinna-Inference"
export CALM_ENDPOINT_NAME="Open-calm-7b-ft3"
export KENDRA_INDEX_ID=d841dfc5-4de5-437e-932d-8ed079b83d91
cd ./server/app
uvicorn main:app --reload
```

## AWS 上で動かす方法（手動）

1. ECR のサービスコンソールに移動して、`jp-rag-sample` といったレポジトリを作成する
2. IAM Role を新規作成する

EC2 のサービスロールとして作成し、必要な権限をアタッチする。

- KendraReadOnlyPolicy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "useEndpoint",
      "Effect": "Allow",
      "Action": [
        "sagemaker:InvokeEndpointAsync",
        "sagemaker:DescribeEndpoint",
        "sagemaker:InvokeEndpoint"
      ],
      "Resource": "arn:aws:sagemaker:<region>:<account_id>:endpoint/jp-rag-sample*"
    },
    {
      "Sid": "listEndpoint",
      "Effect": "Allow",
      "Action": "sagemaker:ListEndpoints",
      "Resource": "*"
    }
  ]
}
```

作成した後、以下の Trusted Policy に変更する。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "tasks.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

3. App Runner のサービスコンソール画面に移動し、新規サービスを作成し、作成した ECR の指定をする。 Step2 のところの Security で先ほど作成した IAM Role を指定する。

## LangChain 周りの備忘録

- https://python.langchain.com/en/latest/modules/chains/index_examples/vector_db_qa.html
