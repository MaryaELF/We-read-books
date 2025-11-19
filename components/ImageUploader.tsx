import React from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string, fileName: string) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract base64 part and mime type
        const [meta, data] = base64String.split(',');
        const mimeTypeMatch = meta.match(/data:(.*?);base64/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : file.type;
        onImageSelected(data, mimeType, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      <label
        htmlFor="image-upload"
        className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md cursor-pointer hover:bg-blue-700 transition-colors duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Processing...' : 'Upload Image to Transcribe'}
      </label>
      <p className="mt-3 text-sm text-gray-600">
        Accepted formats: JPG, PNG, GIF. Max file size: 10MB.
      </p>
    </div>
  );
};

export default ImageUploader;
