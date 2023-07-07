import { Button, Flex, Input, Stack, Textarea } from '@chakra-ui/react';
import React from 'react';

// interesting way to define types for objects below ts way
// we can even define the type used in the onChange event function
type TextInputsProps = {
    textInputs: {
        title: string;
        body: string
    };

    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

    handleCreatePost: () => void;
    loading: boolean;
};

const TextInputs: React.FC<TextInputsProps> = ({textInputs, onChange, handleCreatePost, loading}) => {
    // stack is just flexbox with direction of column built in 

    // great example of chakra psuedo place holder styling with placeholder attribute below
    // _focus styling is when the user actually clicks on it what does it look like

    // the names are required here because in our onChange function we need to know which part is being changed
    return (
        <Stack spacing={3} width='100%'>
            <Input
                name='title'
                value={textInputs.title}
                onChange={onChange}
                fontSize='10pt'
                borderRadius={4}
                placeholder='Title'
                _placeholder={{ color: 'gray.500' }}
                _focus={{
                    outline: 'none',
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'black',
                }}
            />
            <Textarea
                name='body'
                value={textInputs.body}
                onChange={onChange}
                height = '100px'
                fontSize='10pt'
                borderRadius={4}
                placeholder='Text (optional)'
                _placeholder={{ color: 'gray.500' }}
                _focus={{
                    outline: 'none',
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'black',
                }}
            />
            {/* disabled if no title so they cannot submit  */}
            <Flex justify='flex-end'>
                <Button 
                height = '34px' 
                padding = '0px 30px'
                disabled = {!textInputs.title}
                isLoading={loading}
                onClick = {handleCreatePost}
                >Post</Button>
            
            </Flex>
        </Stack>
    )
}
export default TextInputs;