"use client";
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaPlus, FaSpinner, FaEye } from 'react-icons/fa';
import { AiOutlineDownload } from 'react-icons/ai';
import { saveAs } from 'file-saver';
import { generateImageWithStyle } from '@/services/imageGenerateService/imageGenerateService';
import { uploadImage } from '@/services/imageUploadService/imageUploadService';
import { toast } from 'react-toastify';
import TextInputComponent from '../textInputComponent/textInputComponent';
import * as Yup from 'yup';
import { useFormik } from 'formik';

interface StyleOption {
    value: string;
    label: string;
}

const options: StyleOption[] = [
    { value: 'add disney style', label: 'Disney' },
    { value: 'add anime style', label: 'Anime' },
    { value: 'add realistic style', label: 'Realistic' },
];

const ImageGenerator: React.FC = () => {
    const [style, setStyle] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [inputVisible, setInputVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        setImage(file);
        setImageUrl(URL.createObjectURL(file));
        setResultUrl(null);  
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const formik = useFormik({
        initialValues: {
            prompt: '',
        },
        validationSchema: Yup.object({
            prompt: Yup.string().matches(/^[^<>{}]*$/, 'Prompt cannot contain <, >, {, or }')
        }),
        onSubmit: async (values) => {
            await handleGenerate(values.prompt);
        },
    });

    const handleStyleChange = (newStyle: string) => {
        if (style === newStyle) {
            setStyle(null);
        } else {
            setStyle(newStyle);
            setInputVisible(false);
        }
        formik.setFieldValue('prompt', '');
    };

    const handleImageUpload = async () => {
        if (image) {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_UPLOAD_PRESET || '');

            try {
                const response = await uploadImage(formData);
                return response.secure_url;
            } catch (error) {
                toast.error(`Error uploading image`);
                console.error('Error uploading image:', error);
                return null;
            }
        }
        return null;
    };

    const handleGenerate = async (prompt: string) => {
        if (!style && !prompt) {
            formik.setFieldError('prompt', 'Please select a style or enter a prompt');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        const uploadedImageUrl = await handleImageUpload();
        let textPrompt: any = style;
        let imgSrc: any = image;

        if (prompt) {
            textPrompt = `${style} ${prompt}`;
        }
        console.log("text",textPrompt)
        if (uploadedImageUrl) {
            formData.append('image', imgSrc);
            formData.append('prompt', textPrompt);
            formData.append('image_prompt', uploadedImageUrl);

            const result = await generateImageWithStyle(formData);

            if (result && result.url) {
                setResultUrl(result.url);
            }

            setLoading(false);
        } else {
            toast.error('Failed to upload image');
            console.error('Failed to upload image');
            setLoading(false);
        }
    };

    const generateRandomString = (length: number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    const handleDownload = async () => {
        let downloadUrl: any = resultUrl;

        try {
            const response = await fetch(downloadUrl, {
                mode: 'cors', 
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            saveAs(blob, `generated-image-${generateRandomString(6)}.jpg`);
        } catch (error) {
            console.error('Error fetching the image:', error);
        }
    };

    const handleView = () => {
        if (resultUrl) {
            window.open(resultUrl, '_blank');
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <div className="w-full max-w-md p-4">
                <div
                    {...getRootProps()}
                    className={`flex justify-center items-center border-2 border-dashed h-48 mb-4 cursor-pointer ${loading ? 'border-gray-400 bg-gray-100' : 'border-gray-400'}`}
                    style={{ pointerEvents: loading ? 'none' : 'auto' }}
                >
                    <input {...getInputProps()} />
                    {imageUrl ? (
                        <img src={imageUrl} alt="Uploaded" className="h-full w-full object-contain" />
                    ) : (
                        <FaPlus size={48} className="text-gray-400" />
                    )}
                </div>
                <div className="flex justify-center items-center mb-2">
                    <p className="font-bold">Choose Style or Prompt</p>
                </div>
                <div className="flex justify-center space-x-4 mb-4">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`px-4 py-2 rounded-full ${style === option.value ? 'bg-black text-white' : 'bg-gray-200'}`}
                            onClick={() => handleStyleChange(option.value)}
                            onDoubleClick={() => handleStyleChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                    <button
                        className="px-4 py-2 rounded-full bg-gray-200"
                        onClick={() => setInputVisible(!inputVisible)}
                    >
                        <FaPlus />
                    </button>
                </div>
                {inputVisible && (
                    <TextInputComponent
                        value={formik.values.prompt}
                        onChange={formik.handleChange}
                    />
                )}
                {formik.errors.prompt && (
                    <p className="text-red-500 mb-4">{formik.errors.prompt}</p>
                )}
                <button
                    className={`w-full py-2 text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 gradient-animation ${(!style && !formik.values.prompt) ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                    onClick={() => formik.handleSubmit()}
                    disabled={loading || (!style && !formik.values.prompt)}
                >
                    {resultUrl ? 'Try Another' : 'Generate'}
                </button>
            </div>
            <div className="w-full max-w-md border border-gray-300 p-4">
                <div className="flex justify-center items-center border-2 border-dashed border-gray-400 h-48">
                    {loading ? (
                        <FaSpinner className="text-gray-500 animate-spin" size={48} />
                    ) : resultUrl ? (
                        <>
                            <img src={resultUrl} alt="Result" className="h-full w-full object-contain" />
                        </>
                    ) : (
                        <span>Result</span>
                    )}
                </div>
            </div>
            {(!loading && resultUrl) && (
                <div className="flex space-x-4 mt-4">
                    <button onClick={handleDownload} className="text-blue-500 flex items-center">
                        <AiOutlineDownload size={20} className="mr-1" /> Download
                    </button>
                    <button onClick={handleView} className="text-blue-500 flex items-center">
                        <FaEye size={20} className="mr-1" /> View
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;
