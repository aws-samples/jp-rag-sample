// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

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