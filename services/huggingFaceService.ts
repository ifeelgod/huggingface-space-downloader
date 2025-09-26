import { HfSpaceData } from '../types';

const API_BASE_URL = 'https://huggingface.co/api/spaces/';

function sanitizeSpaceId(inputId: string): string {
  const trimmedId = inputId.trim();
  try {
    let processedInput = trimmedId;

    // If it looks like a URL path (e.g., /user/repo), prepend the base to make it a full URL
    if (processedInput.startsWith('/') && !processedInput.startsWith('//')) {
      processedInput = `https://huggingface.co/spaces${processedInput}`;
    }

    // Handle full URLs
    if (processedInput.startsWith('http')) {
      const url = new URL(processedInput);
      // Pathname will be like /spaces/user/repo
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'spaces' && parts.length >= 3) {
        return `${parts[1]}/${parts[2]}`;
      }
    }
    
    // Fallback to return the trimmed original ID. It might be in user/repo format,
    // or it might be invalid. The API call will determine validity.
    return trimmedId;
  } catch (error) {
    // Fallback for invalid URLs or other errors
    return trimmedId;
  }
}


export const fetchSpaceFiles = async (spaceId: string, token?: string): Promise<HfSpaceData> => {
  const sanitizedId = sanitizeSpaceId(spaceId);
  const url = `${API_BASE_URL}${sanitizedId}`;

  const doFetch = async (authToken?: string) => {
    const headers: HeadersInit = { 'Accept': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    // Using 'no-cache' to avoid potential issues with stale responses.
    return fetch(url, { headers, cache: 'no-cache' });
  };

  try {
    // First, try without a token. This works for public spaces and avoids CORS issues.
    let response = await doFetch();

    // If it's a 401/404 and we have a token, it's likely a private space. Retry with the token.
    if ((response.status === 401 || response.status === 404) && token) {
      response = await doFetch(token);
    }
    
    // Now, handle the final response status.
    if (response.status === 401) {
      throw new Error(`Unauthorized. This space may be private. Please provide a valid Hugging Face token with read access.`);
    }

    if (response.status === 404) {
      throw new Error(`Space not found. Please check the ID: "${sanitizedId}".`);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch data for space: "${sanitizedId}". Status: ${response.status}`);
    }

    const data: HfSpaceData = await response.json();
    return data;
  } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
          throw new Error(`A network error occurred while fetching from Hugging Face for "${sanitizedId}".

This can happen if the space has specific access restrictions (CORS), a browser extension is blocking the request, or there's a temporary issue with your network or the Hugging Face API.`);
      }
      // Re-throw other errors (like the ones we threw manually above)
      throw err;
  }
};