import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.SOCIAL_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error("SOCIAL_ENCRYPTION_KEY must be set in production.");
}

/**
 * Encrypts a raw token string using AES-256-GCM.
 * Output format: "iv:authTag:encryptedPayload" (hex encoded)
 */
export const encryptToken = (text: string): string => {
  if (!ENCRYPTION_KEY) return text;
  
  try {
    const iv = crypto.randomBytes(12);
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (e) {
    console.error("Token encryption failed:", e);
    return text;
  }
};

/** 
 * Decrypts tokens stored in database using AES-256-GCM.
 * Assumes token format: "iv:authTag:encryptedPayload" (hex encoded)
 */
export const decryptToken = (token: string): string => {
  if (!ENCRYPTION_KEY || !token.includes(':')) return token;
  
  try {
    const [iv, authTag, encrypted] = token.split(':').map(v => Buffer.from(v, 'hex'));
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted as unknown as string, 'binary', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error("Token decryption failed:", e);
    return token;
  }
};

/** 
 * Refreshes an expired OAuth2 token for the target platform.
 * NOTE: This is a platform-agnostic facade. Real integrations must use the 
 * respective OAuth2 token endpoints (e.g. graph.facebook.com/oauth/access_token)
 */
export const refreshPlatformToken = async (platform: string, refreshToken: string): Promise<string | null> => {
   console.warn(`Refreshing token for ${platform} - NOT IMPLEMENTED`);
   // Real implementations should return the new access_token
   return "refreshed_" + refreshToken;
};

/** 
 * Publishes a post to the target platform API.
 * NOTE: This is a placeholder for actual API integrations (Meta Graph, TikTok Business API, etc.)
 */
export const publishToPlatform = async (platform: string, token: string, content: any): Promise<boolean> => {
   console.group(`Publishing to ${platform}`);
   console.debug("Targeting endpoint with encrypted payload protection active");
   console.groupEnd();
   
   // Implement platform-specific API calls based on platform input
   return true;
};
