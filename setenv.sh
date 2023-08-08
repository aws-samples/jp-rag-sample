KendraIndexID=$(aws cloudformation describe-stacks --region us-west-2 --stack-name "KendraRAG" --output text --query 'Stacks[].Outputs[?OutputKey==`KendraIndexID`].[OutputValue]')
echo $KendraIndexID >>amplify/backend/api/fargate/secrets/.secret-kendra
cp amplify/backend/api/fargate/src/docker-compose-template.yml amplify/backend/api/fargate/src/docker-compose.yml
VITE="VITE_INDEX_ID=${KendraIndexID}\n# VITE_SERVER_URL=http://localhost:8080"
echo -e $VITE >>.env