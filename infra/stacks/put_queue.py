from aws_cdk import (
    # Duration,
    Stack,
    # aws_sqs as sqs,
)
from constructs import Construct

class PutQueueStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        print("[DEBUG] PutQueueStack")

        # The code that defines your stack goes here

        # example resource
        # queue = sqs.Queue(
        #     self, "ServerQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )
