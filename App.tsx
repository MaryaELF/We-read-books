import React, { useState, useEffect, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import { transcribeImage } from './services/geminiService';
import { ApiStatus } from './types';

const App: React.FC = () => {
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'plainText' | 'markdown'>('markdown'); // New state for output format

  const handleImageSelected = useCallback((base64: string, mimeType: string, fileName: string) => {
    setSelectedImageBase64(base64);
    setSelectedImageMimeType(mimeType);
    setSelectedImageName(fileName);
    setTranscribedText(null); // Clear previous transcription
    setError(null); // Clear previous error
    setApiStatus(ApiStatus.IDLE); // Reset status
  }, []);

  const performTranscription = useCallback(async () => {
    if (!selectedImageBase64 || !selectedImageMimeType) {
      setError('Please upload an image first.');
      setApiStatus(ApiStatus.ERROR);
      return;
    }

    setApiStatus(ApiStatus.LOADING);
    setError(null);
    setTranscribedText(null);

    try {
      const text = await transcribeImage(selectedImageBase64, selectedImageMimeType, outputFormat);
      setTranscribedText(text);
      setApiStatus(ApiStatus.SUCCESS);
    } catch (err: any) {
      console.error("Transcription failed:", err);
      setError(err.message || 'Failed to transcribe image. Please try again.');
      setApiStatus(ApiStatus.ERROR);
    }
  }, [selectedImageBase64, selectedImageMimeType, outputFormat]); // Added outputFormat to dependencies

  // Effect to automatically trigger transcription when a new image is selected or format changes
  useEffect(() => {
    if (selectedImageBase64 && selectedImageMimeType) {
      performTranscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageBase64, selectedImageMimeType, outputFormat]); // Added outputFormat to dependencies

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOutputFormat(event.target.value as 'plainText' | 'markdown');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen-minus-padding">
      {/* Left Pane: Image Uploader, Format Selector, and Preview */}
      <div className="flex-1 flex flex-col p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center lg:text-left">
          Image Text Reader
        </h1>
        <ImageUploader onImageSelected={handleImageSelected} isLoading={apiStatus === ApiStatus.LOADING} />

        <fieldset className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <legend className="text-lg font-semibold text-gray-800 px-2">Output Format</legend>
          <div className="flex flex-col sm:flex-row gap-4 justify-around mt-2">
            <label htmlFor="plainText" className="inline-flex items-center cursor-pointer text-gray-700">
              <input
                type="radio"
                id="plainText"
                name="outputFormat"
                value="plainText"
                checked={outputFormat === 'plainText'}
                onChange={handleFormatChange}
                disabled={apiStatus === ApiStatus.LOADING}
                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                aria-label="Plain Text Output Format"
              />
              <span className="ml-2">Plain Text</span>
            </label>
            <label htmlFor="markdown" className="inline-flex items-center cursor-pointer text-gray-700">
              <input
                type="radio"
                id="markdown"
                name="outputFormat"
                value="markdown"
                checked={outputFormat === 'markdown'}
                onChange={handleFormatChange}
                disabled={apiStatus === ApiStatus.LOADING}
                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                aria-label="Markdown Output Format"
              />
              <span className="ml-2">Markdown</span>
            </label>
          </div>
        </fieldset>

        {selectedImageBase64 && (
          <div className="mt-8 text-center bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedImageName ? `Uploaded Image: ${selectedImageName}` : 'Uploaded Image'}
            </h2>
            <div className="relative w-full max-w-md h-auto flex justify-center items-center overflow-hidden rounded-md border border-gray-300">
              <img
                src={`data:${selectedImageMimeType};base64,${selectedImageBase64}`}
                alt="Uploaded for transcription"
                className="max-w-full h-auto object-contain rounded-md"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Pane: Transcription Display */}
      <div className="flex-1 flex flex-col p-6 bg-white rounded-lg shadow-lg">
        <TranscriptionDisplay
          transcribedText={transcribedText}
          status={apiStatus}
          error={error}
        />
      </div>
    </div>
  );
};

export default App;