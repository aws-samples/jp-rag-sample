// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import Human from './Human';
import { Conversation } from '../../utils/interface';
import AICore from './components/AICore';

const AI: React.FC<{ data: Conversation }> = ({ data }) => {
    // AI モード時の吹き出し


    return (
        <>
            {/* aiResult があれば出力 */}
            {data.aiResponse && <AICore data={data.aiResponse} />}
            <Human data={data} />
        </>
    )
};
export default AI;