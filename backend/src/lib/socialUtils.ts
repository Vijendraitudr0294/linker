export const decryptToken = (token: string) => token;
export const refreshPlatformToken = async (platform: string, rt: string) => "new_" + rt;
export const publishToPlatform = async (platform: string, token: string, postId: string) => true;
