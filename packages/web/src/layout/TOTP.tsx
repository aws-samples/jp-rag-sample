// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the MIT-0 License (https://github.com/aws/mit-0)

import { AmplifyUser } from '@aws-amplify/ui';
import { Auth } from 'aws-amplify';
import QRCode from 'qrcode';
import React, { useState } from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  MenuItem,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
// i18
import { useTranslation } from 'react-i18next';

const samlAuthEnabled: boolean =
  import.meta.env.VITE_APP_SAMLAUTH_ENABLED === 'true';

interface CustomSetupTOTPProps {
  user: AmplifyUser | undefined;
  issuer: string;
  handleAuthStateChange: () => void;
}

export function CustomSetupTOTP(props: CustomSetupTOTPProps) {
  // MFA 機能

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [qrCode, setQrCode] = React.useState('');
  const [token, setToken] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // totp(Time-based One-time Password) を生成
  const getTotpCode = (
    issuer: string,
    username: string,
    secret: string
  ): string =>
    encodeURI(
      `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`
    );

  const totpUsername = props.user?.getUsername() || '';

  // 言語設定
  const { t } = useTranslation();

  const generateQRCode = React.useCallback(
    async (currentUser: AmplifyUser): Promise<void> => {
      // QRコードを生成

      try {
        const newSecretKey = await Auth.setupTOTP(currentUser);
        const totpCode = getTotpCode(props.issuer, totpUsername, newSecretKey);
        const qrCodeImageSource = await QRCode.toDataURL(totpCode);
        setQrCode(qrCodeImageSource);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [props.issuer, totpUsername]
  );

  const verifyTotpToken = () => {
    // 確認後、ユーザーは TOTP を生成するアプリ (Google 認証システムなど) に TOTP アカウントを持つ
    // 生成されたワンタイムパスワードを使用して設定を検証

    setErrorMessage('');
    setIsVerifyingToken(true);
    Auth.verifyTotpToken(props.user, token)
      .then(async () => {
        await Auth.setPreferredMFA(props.user, 'TOTP');
        props.handleAuthStateChange();
        return null;
      })
      .catch((e) => {
        console.error(e);
        if (/Code mismatch/.test(e.toString())) {
          setErrorMessage('セキュリティコードが違います');
        }
      })
      .finally(() => {
        setIsVerifyingToken(false);
        onClose();
        toast({
          title: t('toast.mfa_success'),
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      });
  };

  React.useEffect(() => {
    if (!props.user) {
      return;
    }
    Auth.getPreferredMFA(props.user).then((data) => {
      if (data != 'NOMFA') {
        setMfaEnabled(true);
      }
    });
    void generateQRCode(props.user);
  }, [generateQRCode, props.user, isOpen]);

  const isValidToken = () => {
    return /^\d{6}$/gm.test(token);
  };

  if (mfaEnabled) return null;
  if (samlAuthEnabled) return null;

  return (
    <>
      <MenuItem onClick={onOpen}>{t('top_bar.set_mfa')}</MenuItem>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('top_bar.set_mfa')}</ModalHeader>
          <ModalBody>
            <form
              onSubmit={(event) => {
                event.preventDefault();
              }}>
              {isLoading && <div>{'loading...'}</div>}
              {!isLoading && (
                <>
                  <img
                    data-amplify-qrcode
                    src={qrCode}
                    alt="qr code"
                    width="228"
                    height="228"
                  />
                  <Text>
                    {
                      'QR コードを読み込み、セキュリティコードを入力してください。'
                    }
                  </Text>
                  <Input
                    my={4}
                    size="md"
                    onChange={(e: any) => {
                      setToken(e.target.value);
                    }}></Input>
                  {errorMessage && (
                    <Alert
                      status="error"
                      onClick={() => {
                        setErrorMessage('');
                      }}>
                      <AlertIcon />
                      {errorMessage}
                    </Alert>
                  )}
                  <Button
                    my={4}
                    size="md"
                    disabled={!isValidToken() || isVerifyingToken}
                    colorScheme="green"
                    type="submit"
                    onClick={verifyTotpToken}>
                    {isVerifyingToken
                      ? 'セキュリティコードを確認中・・・'
                      : 'セキュリティコードを確認'}
                  </Button>
                </>
              )}
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
