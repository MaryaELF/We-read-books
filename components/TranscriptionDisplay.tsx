import React from 'react';
import { ApiStatus } from '../types';

interface TranscriptionDisplayProps {
  transcribedText: string | null;
  status: ApiStatus;
  error: string | null;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcribedText,
  status,
  error,
}) => {
  const getStatusMessage = () => {
    switch (status) {
      case ApiStatus.LOADING:
        return <p className="text-blue-600 text-lg font-medium">Transcribing image...</p>;
      case ApiStatus.ERROR:
        return <p className="text-red-600 text-lg font-medium">Error: {error || 'An unknown error occurred.'}</p>;
      case ApiStatus.IDLE:
        return <p className="text-gray-500 text-lg">Upload an image to see the transcription here.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-inner min-h-[200px] flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Transcription Results</h2>
      {status !== ApiStatus.SUCCESS && !transcribedText && (
        <div className="flex-grow flex items-center justify-center text-center">
          {getStatusMessage()}
        </div>
      )}
      {transcribedText && (
        <div className="flex-grow overflow-auto text-gray-700 leading-relaxed max-h-[500px]">
          <pre className="whitespace-pre-wrap font-sans text-base">{transcribedText}</pre>
        </div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
