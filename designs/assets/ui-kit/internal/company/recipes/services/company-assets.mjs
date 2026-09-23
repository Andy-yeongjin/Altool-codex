import { createAssetClient } from '../../../../../runtime/assets.mjs';

// The company pack owns semantic messages; service screens do not copy their wording.
let clientPromise;
export async function renderCompanyMessage(container, id, onAction) {
  if (!clientPromise) clientPromise = createAssetClient(new URL('../../../../..', import.meta.url));
  try {
    const client = await clientPromise;
    if (!container.isConnected) return;
    return await client.renderMessage(container, id, { onAction });
  } catch (error) {
    clientPromise = null;
    if (!container.isConnected) return;
    container.textContent = '공통 자산을 확인하지 못했습니다. 회사 자산 설치 상태를 확인해 주세요.';
    container.dataset.assetFailure = error.message;
    container.setAttribute('role', 'alert');
  }
}
