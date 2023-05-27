export const MockDataWarning: React.FC<{ errors: string[] }> = ({ errors }) => {
  return (
    <div>
      <span>
        <b>
          {
            errors.map((err, idx) => {
              return (<div key={idx}>{err}</div>)
            })
          }
        </b>
      </span>
      <span>
        検索結果には、サンプルデータが表示されています
      </span>
    </div>
  );
}
export default MockDataWarning;