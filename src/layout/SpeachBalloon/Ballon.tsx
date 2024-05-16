// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { ReactNode } from 'react';

const Ballon: React.FC<{ bid: number, text: string, children: ReactNode, }> = ({ children }) => {
    return (
        <>
            {/* 吹き出し */}
            {children}
        </>
    )
};
export default Ballon;