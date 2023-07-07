import { Button, Flex, Image, Stack } from '@chakra-ui/react';
import React, { useRef } from 'react';

type ImageUploadProps = {
    selectedFile?: string;
    onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setSelectedTab: (value: string) => void;
    setSelectedFile: (value: string) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({ selectedFile, onSelectImage, setSelectedTab, setSelectedFile }) => {

    // you can store anything when you use the useRef hook, but we specify a HTML Input element whose type we specified to file
    const selectedFileRef = useRef<HTMLInputElement>(null);

    // if they successfuly select a file then we display it, otherwise we show the upload button stuff 
    return (
        <Flex direction='column' justify='center' align='center' width='100%'>

            {selectedFile ? (
                <>
                    <Image src={selectedFile} maxWidth='400px' maxHeight='400px' />
                    <Stack direction='row' mt={4}>
                        <Button height='28px' onClick={() => setSelectedTab("Post")}>
                            Back to post
                        </Button>
                        <Button variant='outline' height='28px' onClick={() => setSelectedFile("")}>
                            Remove
                        </Button>
                    </Stack>
                </>

            ) : (<Flex
                justify='center'
                align='center'
                p={20}
                border='1px dashed'
                borderColor='gray.200'
                width='100%'
                borderRadius={4}
            >
                {/* we use the ref on the input to reference that for our onclick so that it clicks the input even tho its hidden  */}
                <Button variant='outline' height='28px' onClick={() => selectedFileRef.current?.click()}>
                    Upload
                </Button>

                {/* file inputs have an ocChange function that is generated once a file has been selected, and similarly to how we grab the value of what the user has typed  */}
                {/* from the event that is generated, we grab the file here that the user selects instead from the event that they trigger through the onChange where we call onSelectImage  */}
                <input
                    hidden 
                    id = "file-upload"
                    accept = 'image/x-png, image/gif, image/jpeg'
                    ref={selectedFileRef}
                    type="file"
                    onChange={onSelectImage}
                />
            </Flex>)
            }
        </Flex >
    )
}
export default ImageUpload;