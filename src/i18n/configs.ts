// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 言語jsonファイルのimport
import translation_en from "./en.json";
import translation_ja from "./ja.json";

const resources = {
    "en": {
        translation: translation_en
      },
       "es": {
        translation: translation_en
      },
       "fr": {
        translation: translation_en
      },
       "de": {
        translation: translation_en
      },
       "pt": {
        translation: translation_en
      },
       "ja": {
        translation: translation_ja
      },
       "ko": {
        translation: translation_en
      },
       "zh": {
        translation: translation_en
      },
       "it": {
        translation: translation_en
      },
       "hi": {
        translation: translation_en
      },
       "ar": {
        translation: translation_en
      },
       "hy": {
        translation: translation_en
      },
       "eu": {
        translation: translation_en
      },
       "bn": {
        translation: translation_en
      },
       "pt-BR": {
        translation: translation_en
      },
       "bg": {
        translation: translation_en
      },
       "ca": {
        translation: translation_en
      },
       "cs": {
        translation: translation_en
      },
       "da": {
        translation: translation_en
      },
       "nl": {
        translation: translation_en
      },
       "fi": {
        translation: translation_en
      },
       "gl": {
        translation: translation_en
      },
       "el": {
        translation: translation_en
      },
       "hu": {
        translation: translation_en
      },
       "id": {
        translation: translation_en
      },
       "ga": {
        translation: translation_en
      },
       "lv": {
        translation: translation_en
      },
       "lt": {
        translation: translation_en
      },
       "no": {
        translation: translation_en
      },
       "fa": {
        translation: translation_en
      },
       "ro": {
        translation: translation_en
      },
       "ru": {
        translation: translation_en
      },
       "ckb": {
        translation: translation_en
      },
       "sv": {
        translation: translation_en
      },
      "tr": {
        translation: translation_en
      }
  
  };

  i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "ja", 
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;