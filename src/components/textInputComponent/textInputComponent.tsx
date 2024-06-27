import React from 'react';

interface TextInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInputComponent: React.FC<TextInputProps> = ({ value, onChange }) => {
    return (
        <div className="mb-4">
            <input
                type="text"
                name="prompt"
                value={value}
                onChange={onChange}
                placeholder="Enter prompt"
                className="w-full px-4 py-2 border border-gray-300 rounded-full"
            />
        </div>
    );
};

export default TextInputComponent;
