export async function uploadAudio(model, file, apiKey, endpointType) {
  if (!['transcriptions', 'translations'].includes(endpointType)) {
    throw new Error('Invalid endpointType. Must be "transcriptions" or "translations".');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', model);

  const url = `https://api.openai.com/v1/audio/${endpointType}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error Response: ${response.status} ${response.statusText} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading file:', error.message);
    throw error;
  }
}