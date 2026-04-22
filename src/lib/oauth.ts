import { getPublicSiteUrl } from "@/lib/publicUrl";

type OAuthProvider = "google";

type OAuthErrorLike = {
  message?: string;
};

type OAuthResponse = {
  data?: {
    url?: string | null;
  } | null;
  error?: OAuthErrorLike | null;
};

type OAuthClient = {
  signInWithOAuth?: (options: {
    provider: OAuthProvider;
    options: {
      redirectTo: string;
      skipBrowserRedirect: true;
    };
  }) => Promise<OAuthResponse>;
};

const providerLabels: Record<OAuthProvider, string> = {
  google: "Google",
};

export const buildOAuthRedirectUrl = (baseUrl: string) => `${baseUrl.replace(/\/+$/, "")}/dashboard`;

export const getDefaultOAuthRedirectUrl = () => buildOAuthRedirectUrl(getPublicSiteUrl());

export const beginOAuthSignIn = async ({
  authClient,
  provider,
  redirectTo,
}: {
  authClient: OAuthClient;
  provider: OAuthProvider;
  redirectTo: string;
}) => {
  const signInWithOAuth = authClient.signInWithOAuth;

  if (typeof signInWithOAuth !== "function") {
    throw new Error(`${providerLabels[provider]} login isn't available in offline mode.`);
  }

  const { data, error } = await signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error(`${providerLabels[provider]} login is temporarily unavailable. Please try email login instead.`);

  return data.url;
};

export const getOAuthErrorMessage = (providerLabel: string, error: unknown) => {
  const rawMessage =
    typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  if (/provider is not enabled|unsupported provider/i.test(rawMessage)) {
    return `${providerLabel} login isn't enabled for this project yet. Enable ${providerLabel} in Supabase Authentication > Providers and add the OAuth client ID and secret.`;
  }

  if (/offline mode/i.test(rawMessage)) {
    return rawMessage;
  }

  return rawMessage || `${providerLabel} login failed`;
};
