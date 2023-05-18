import { CREDENTIALS_FILE_NAME, CREDENTIALS_FILE_PATH } from "../constants";

export default function MockDataWarning(props: { errors?: string[] }) {
  return (
    <div>
      <span>
        <b>
          {props.errors && props.errors.length > 0
            ? props.errors.map(err => <div>{err}</div>)
            : `${CREDENTIALS_FILE_PATH}/${CREDENTIALS_FILE_NAME} をロードできませんでした。READMEの Getting Started を参照してください。`}
        </b>
      </span>
      <span>
        検索結果には、サンプルデータが表示されています
      </span>
    </div>
  );
}
