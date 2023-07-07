import { SearchIcon } from '@chakra-ui/icons';
import { Flex, Input, InputGroup, InputLeftElement, InputRightElement, Stack } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React from 'react';

type SearchInputProps = {
    user?: User | null;
};

// with Chakra when we put an underscore in front of an attribute, then that means we are accessing the pseudo class,
// which in many cases means that we can access the styling of something like the placeholder below

// flexgrow 1 means that it will take up 100% of the container it is in

// mr is margin right
// mb is margin bottom
const SearchInput: React.FC<SearchInputProps> = ({user}) => {

    return (
        <Flex flexGrow={1} mr={2} align="center" maxWidth={user ? "auto" : "600px" }>
            <InputGroup>
                <InputLeftElement pointerEvents='none'>
                    <SearchIcon color='gray.300' mb={1}/>
                </InputLeftElement>
                <Input 
                placeholder='Search Vouch' fontSize='10pt'
                    _placeholder={{ color: "gray.500" }}
                    _hover={{
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500'
                    }}
                    _focus={{
                        outline: 'none',
                        border: '1px solid',
                        borderColor: 'blue.500'
                    }}
                    height="34px"
                    bg="gray.50" />
            </InputGroup>
        </Flex>
    );
};
export default SearchInput;