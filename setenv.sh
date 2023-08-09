if [ $# -ne 1 ]; then
    echo "Usage: $0 <index_name>"
    exit 1
fi

index_name="$1"
KendraIndexID=$(aws kendra list-indices --no-paginate | jq -r --arg name "$index_name" '.IndexConfigurationSummaryItems[] | select(.Name == $name) | .Id') 
echo $KendraIndexID >>amplify/backend/api/fargate/secrets/.secret-kendra
cp amplify/backend/api/fargate/src/docker-compose-template.yml amplify/backend/api/fargate/src/docker-compose.yml
VITE="VITE_INDEX_ID=${KendraIndexID}\n# VITE_SERVER_URL=http://localhost:8080"
echo -e $VITE >>.env
