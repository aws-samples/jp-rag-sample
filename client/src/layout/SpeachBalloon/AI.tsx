import Human from './Human';
import { Conversation } from '../../utils/interface';
import AICore from './components/AICore';

const AI: React.FC<{ data: Conversation }> = ({ data }) => {
    return (
        <>
            {/* aiResult があれば出力 */}
            {data.aiResponse && <AICore data={data.aiResponse} />}
            <Human data={data} />
        </>
    )
};
export default AI;