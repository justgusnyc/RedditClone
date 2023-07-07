import React, { useState } from 'react';



const useSelectFile = () => {

    // this represents the actual name of the file that we will use as the source of an image
    const [selectedFile, setSelectedFile] = useState<string>();

    // handles what happens when a user selects a specific pic from the own computer and puts it into the post
    const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        // reading and processing the data that comes from ImageUpload.tsx
        const reader = new FileReader();

        // this can be an array but we only have one image being selected so we select the first item only 
        if (event.target.files?.[0]) {
            reader.readAsDataURL(event.target.files[0]);
        }

        reader.onload = (readerEvent) => {
            if (readerEvent.target?.result) {
                setSelectedFile(readerEvent.target.result as string);
            }
        }
    };
    
    return {
        selectedFile,
        setSelectedFile,
        onSelectFile,
    }
}
export default useSelectFile;