// js/data/CloudSync.js

// 請將此處替換為您的 Google Cloud Client ID
const CLIENT_ID = '813440973270-e733k54uibmqjle0ksuadqvl8jhiecds.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const SAVE_FILENAME = 'multiplication_monster_save.json';

let tokenClient;
let accessToken = null;

/**
 * 初始化 Google Identity Services 與 GAPI
 */
export async function initCloudSync() {
  return new Promise((resolve) => {
    // 1. 初始化 GIS (Google Identity Services)
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) return;
        accessToken = resp.access_token;
        document.dispatchEvent(new CustomEvent('cloud:authorized', { detail: { accessToken } }));
      },
    });

    // 2. 載入並初始化 GAPI (用於呼叫 Drive API)
    gapi.load('client', async () => {
      await gapi.client.init({});
      await gapi.client.load('drive', 'v3');
      resolve();
    });
  });
}

/**
 * 要求使用者登入授權
 */
export function login() {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  }
}

/**
 * 檢查是否已取得授權
 */
export function isAuthorized() {
  return !!accessToken;
}

/**
 * 執行同步主流程 (搜尋 -> 下載 -> 比較 -> 合併 -> 上傳)
 * @param {Object} localProfile 當前本機存檔
 * @returns {Promise<{updatedProfile: Object, status: string}>}
 */
export async function sync(localProfile) {
  if (!accessToken) throw new Error('Not authorized');

  try {
    // 1. 在 appDataFolder 搜尋存檔檔案
    const response = await gapi.client.drive.files.list({
      q: `name = '${SAVE_FILENAME}'`,
      spaces: 'appDataFolder',
      fields: 'files(id, name, modifiedTime)',
    });

    const files = response.result.files;
    
    // 2. 如果檔案不存在，則將本機存檔上傳
    if (files.length === 0) {
      await uploadSave(localProfile);
      return { updatedProfile: localProfile, status: 'first_upload' };
    }

    // 3. 檔案存在，下載內容
    const fileId = files[0].id;
    const cloudProfile = await downloadSave(fileId);

    // 4. 衝突比較：自動選擇最新 (Newest wins)
    const localTime = new Date(localProfile.updatedAt || 0).getTime();
    const cloudTime = new Date(cloudProfile.updatedAt || 0).getTime();

    if (cloudTime > localTime) {
      // 雲端較新，使用雲端版本
      return { updatedProfile: cloudProfile, status: 'cloud_to_local' };
    } else if (localTime > cloudTime) {
      // 本機較新，上傳更新雲端
      await uploadSave(localProfile, fileId);
      return { updatedProfile: localProfile, status: 'local_to_cloud' };
    }

    return { updatedProfile: localProfile, status: 'synced' };
  } catch (err) {
    console.error('Sync failed:', err);
    throw err;
  }
}

/**
 * 上傳存檔到 appDataFolder
 */
export async function uploadSave(profile, existingFileId = null) {
  const metadata = {
    name: SAVE_FILENAME,
    mimeType: 'application/json',
    parents: existingFileId ? undefined : ['appDataFolder'],
  };

  const body = JSON.stringify(profile);
  
  // 使用 multipart 上傳 (中繼資料 + 內容)
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      body +
      close_delim;

  const path = existingFileId 
    ? `/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : '/upload/drive/v3/files?uploadType=multipart';

  return fetch(`https://www.googleapis.com${path}`, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
    },
    body: multipartRequestBody,
  });
}

/**
 * 從 Drive 下載存檔內容
 */
async function downloadSave(fileId) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
}
