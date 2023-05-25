import { KendraClient, QueryCommandInput, QueryCommand } from "@aws-sdk/client-kendra";

import React, { useEffect } from 'react';

type Props = {
    /* 認証済みの Kendra インスタンス */
    kendraClient?: KendraClient;
    /* Kendra の Index ID */
    indexId: string;
}

const AuthMock: React.FC<Props> = ({ kendraClient, indexId }) => {

    useEffect(() => {
        // async function fetchData() {
        //     let params: QueryCommandInput = {
        //         IndexId: indexId,
        //         PageNumber: 1,
        //         PageSize: 10,
        //         QueryText: "首相",
        //         AttributeFilter: {
        //             AndAllFilters: [
        //                 {
        //                     EqualsTo: {
        //                         Key: "_language_code",
        //                         Value: {
        //                             "StringValue": "ja"
        //                         }
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        //     return kendraClient?.send(new QueryCommand(params));
        // }
        // fetchData().then((data) => {
        // })
    }, []);
    return (
        <></>
    );
};
export default AuthMock;