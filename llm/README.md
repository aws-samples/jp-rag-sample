# JP RAG SAMPLE (LLM)

ローカルもしくは [CloudShell](https://us-west-2.console.aws.amazon.com/cloudshell) から [rinna/japanese-gpt-neox-3.6b-instruction-ppo](https://huggingface.co/rinna/japanese-gpt-neox-3.6b-instruction-ppo) をデプロイするスクリプト。

その他のモデルのデプロイやモデルのファインチューニングについては[こちら](https://github.com/aws-samples/aws-ml-jp/tree/main/tasks/generative-ai/text-to-text/fine-tuning/instruction-tuning)のレポジトリを参照してください。

## エンドポイントのデプロイ

前提条件：deploy_llm.sh を実行する IAM User または IAM Role の「信頼関係」に SageMaker の AssumeRole を許可する以下のポリシーを設定する。

```
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "sagemaker.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
```

ローカルもしくは [CloudShell](https://us-west-2.console.aws.amazon.com/cloudshell) で `deploy_llm.sh` を実行するとエンドポイントがデプロイされる。

## エンドポイントの削除

デプロイと同様にローカルもしくは [CloudShell](https://us-west-2.console.aws.amazon.com/cloudshell) で `delete_llm.sh` を実行するとエンドポイントが削除される。
