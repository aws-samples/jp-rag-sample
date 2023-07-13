// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import React from "react";
import { Highlight, TextWithHighlights } from "@aws-sdk/client-kendra";

export const isNullOrEmpty = (it: { readonly length: number }) => isNullOrUndefined(it) || it.length === 0;
export const isNullOrUndefined = (it: any) => it === null || it === undefined;

// highlightの順序を整理
export function unionSortedHighlights(highlights: any) {
    // highlightがなければそのまま返す
    if (isNullOrEmpty(highlights)) {
        return highlights;
    }

    // highlightの順序を整理
    let prev = highlights[0];
    const unioned = [prev];
    for (let i = 1; i < highlights.length; i++) {
        const h = highlights[i];
        if (prev.EndOffset >= h.BeginOffset) { // 前の highlight と次の highlight がつながっている時１つにまとめる
            prev.EndOffset = Math.max(h.EndOffset, prev.EndOffset);
        } else { // 結合せず次の highlight を見る
            unioned.push(h);
            prev = h;
        }
    }

    return unioned;
}


// 重要な文字を切り取って強調する
class HighlightedText extends React.Component<
    {
        text: string | undefined
        highlight: Highlight
    },
    {}
> {
    render() {
        const { text, highlight } = this.props;
        return (
            <strong>
                {!isNullOrUndefined(text) &&
                    text!.substring(highlight.BeginOffset ?? 0, highlight.EndOffset ?? text?.length)}
            </strong>
        );
    }
}


export default class HighlightedTexts extends React.Component<
    { textWithHighlights: TextWithHighlights },
    {}
> {
    render() {
        const { textWithHighlights } = this.props;

        // 文字がない場合なにもしない
        if (isNullOrUndefined(textWithHighlights)) {
            return null;
        }

        // 文字はあるが、highlightするものがない場合、テキストをそのまま表示する
        const text = textWithHighlights.Text;
        if (isNullOrUndefined(textWithHighlights.Highlights)) {
            return <span>{text}</span>;
        }

        // Kendra からの response にある Highlight を並び替える
        const sortedHighlights = unionSortedHighlights(
            textWithHighlights.Highlights!.sort(
                (highlight1: any, highlight2: any) =>
                    highlight1.BeginOffset - highlight2.BeginOffset
            )
        );
        const lastHighlight = sortedHighlights[sortedHighlights.length - 1];

        return (
            <span>
                {/* 強調しないテキスト+強調するテキストの塊を繰り返し出力する */}
                {sortedHighlights.map((highlight: any, idx: number) => (
                    <span key={idx}>
                        {/* 強調しないテキスト */}
                        <span>
                            {text!.substring(
                                idx === 0 ? 0 : sortedHighlights[idx - 1].EndOffset,
                                highlight.BeginOffset
                            )}
                        </span>
                        {/* 強調するテキスト */}
                        <HighlightedText text={text} highlight={highlight} />
                    </span>
                ))}
                {/* 最後の強調しないテキストを出力する */}
                <span>
                    {text!.substring(lastHighlight ? lastHighlight.EndOffset : 0)}
                </span>
            </span>
        );
    }
}
