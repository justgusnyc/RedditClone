import { Flex } from '@chakra-ui/react';
import React from 'react';
import { authModalState } from '../../../atoms/authModalAtom';
import { useRecoilValue } from "recoil";
import Login from './Login';
import SignUp from './SignUp';

type AuthInputsProps = {
    
};
// mt is margin top
// below we have really good example of power and ease of react logic and rendering
const AuthInputs:React.FC<AuthInputsProps> = () => {

    const modalState = useRecoilValue(authModalState);
    
    return(
        <Flex
        direction='column'
        align='center'
        width='100%'
        mt={4}>
            {modalState.view === 'login' && <Login/>}
            {modalState.view === 'signup' && <SignUp/>}
           
        </Flex>
    )
}
export default AuthInputs;