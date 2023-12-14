function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

export async function uploadAudio(
  model,
  file,
  apiKey,
  endpointType,
  language,
  responseType,
  prompt = ""
) {
  if (!["transcriptions", "translations"].includes(endpointType)) {
    throw new Error(
      'Invalid endpointType. Must be "transcriptions" or "translations".'
    );
  }

  const fileBlob = base64ToBlob(file.data, "audio/mpeg");

  const formData = new FormData();
  formData.append("file", fileBlob);
  formData.append("model", model);
  formData.append("response_format", responseType);
  formData.append("language", language);
  formData.append("prompt", prompt);

  const url = `https://api.openai.com/v1/audio/${endpointType}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP Error Response: ${response.status} ${response.statusText} ${errorText}`
      );
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  }
}
