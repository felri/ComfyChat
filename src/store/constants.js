export const defaultEdgeOptions = {
  animated: false,
  type: "smoothstep",
};

export const initialNodes = [
  {
    id: "1",
    type: "apiKey",
    position: { x: -350, y: 275 },
  },
  // {
  //   id: "2",
  //   type: "systemInput.jsx",
  //   data: { text: "You are a chatbot. You are talking to a human.", id: "2" },
  //   position: { x: 0, y: 250 },
  // },
  // {
  //   id: "3",
  //   type: "text",
  //   data: { text: "", id: "3", quantity: 1 },
  //   position: { x: -100, y: 600 },
  // },
];

export const initialEdges = [
  // {
  //   id: "e1-2",
  //   source: "1",
  //   target: "2",
  //   ...defaultEdgeOptions,
  // },
  // {
  //   id: "e2-3",
  //   source: "2",
  //   target: "3",
  //   ...defaultEdgeOptions,
  // },
];

export const initialLayouted = {
  nodes: [...initialNodes],
  edges: [...initialEdges],
};

export const responseFormatSTT = [
  "text", 
  "srt", 
  "vtt"
]

export const languagesSTT = {
  "Afrikaans": "af",
  "Arabic": "ar",
  "Armenian": "hy",
  "Azerbaijani": "az",
  "Belarusian": "be",
  "Bosnian": "bs",
  "Bulgarian": "bg",
  "Catalan": "ca",
  "Chinese": "zh",
  "Croatian": "hr",
  "Czech": "cs",
  "Danish": "da",
  "Dutch": "nl",
  "English": "en",
  "Estonian": "et",
  "Finnish": "fi",
  "French": "fr",
  "Galician": "gl",
  "German": "de",
  "Greek": "el",
  "Hebrew": "he",
  "Hindi": "hi",
  "Hungarian": "hu",
  "Icelandic": "is",
  "Indonesian": "id",
  "Italian": "it",
  "Japanese": "ja",
  "Kannada": "kn",
  "Kazakh": "kk",
  "Korean": "ko",
  "Latvian": "lv",
  "Lithuanian": "lt",
  "Macedonian": "mk",
  "Malay": "ms",
  "Marathi": "mr",
  "Maori": "mi",
  "Nepali": "ne",
  "Norwegian": "no",
  "Persian": "fa",
  "Polish": "pl",
  "Portuguese": "pt",
  "Romanian": "ro",
  "Russian": "ru",
  "Serbian": "sr",
  "Slovak": "sk",
  "Slovenian": "sl",
  "Spanish": "es",
  "Swahili": "sw",
  "Swedish": "sv",
  "Tagalog": "tl",
  "Tamil": "ta",
  "Thai": "th",
  "Turkish": "tr",
  "Ukrainian": "uk",
  "Urdu": "ur",
  "Vietnamese": "vi",
  "Welsh": "cy"
};