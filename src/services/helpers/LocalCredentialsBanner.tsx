export default function MockDataWarning() {
  return (
    <div>
      <span>
        この環境では現在、サービスとの認証にローカルの認証情報ファイルを使用しています。
      </span>
      <span>
        <b>
          認証情報をpublic repositoryに公開しないようにしてください。
        </b>
      </span>
    </div>
  );
}
