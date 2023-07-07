import { Button, Flex, Input, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { authModalState } from '../../../atoms/authModalAtom';
import { useSetRecoilState } from "recoil"
import {auth} from "../../../firebase/clientApp"
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { FIREBASE_ERRORS } from '../../../firebase/errors';

type LoginProps = {

};
// when we give the button type submit inside of a form it will know to call the onSubmit 
// function which we made ourselves
const Login: React.FC<LoginProps> = () => {

    const setAuthModalState = useSetRecoilState(authModalState)

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    });

    const [
        signInWithEmailAndPassword,
        user,
        loading,
        error,
      ] = useSignInWithEmailAndPassword(auth);

    // Firbase logic



    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => { 
        event.preventDefault();

        signInWithEmailAndPassword(loginForm.email, loginForm.password);
    };

    // we inherintly take in an event which is of type React Change Event and handles the type of tag HTML Input element
    // ts gives us great auto completion and things when we define it this way
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // update form state
        // prev here is the previous value of state and then we spread it because we only want to update
        // a single piece of our form state
        setLoginForm(prev => ({
            ...prev,
            [event.target.name]: event.target.value, // this comes from the form we submit below, we basically just pull the name for the type of form submitted
        }))

    };

    return (
        <form onSubmit={onSubmit}>
            <Input
                required
                name="email"
                placeholder='email'
                type='email'
                mb={2}
                onChange={onChange}
                fontSize='10pt'
                _placeholder={{ color: "gray.500" }}
                _hover={{
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'blue.500',
                }}
                _focus={{
                    outline: 'none',
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'blue.500',
                }}
                bg='gray.50'
            />
            <Input
                required
                name='password'
                placeholder='password'
                type='password'
                onChange={onChange}
                fontSize='10pt'
                _placeholder={{ color: "gray.500" }}
                _hover={{
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'blue.500',
                }}
                _focus={{
                    outline: 'none',
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'blue.500',
                }}
                bg='gray.50'
                mb={2}
            />

            <Text textAlign='center' color='red' fontSize='10pt'>
                {FIREBASE_ERRORS[error?.message as keyof typeof FIREBASE_ERRORS]}
            </Text>

            <Button
                width='100%'
                height="36px"
                mt={2}
                mb={2}
                type='submit'
                isLoading={loading}
                >
                Log In
            </Button>

            <Flex
                fontSize='9pt'
                justifyContent='center'>
                {/* so below we set the authmodal state through our recoil atom and spread the previous state and only take and change the view of the previous state */}
                <Text mr={1}>New here?</Text>
                <Text
                    color="blue.500"
                    fontWeight={700}
                    cursor="pointer"
                    onClick={() => setAuthModalState(prev => ({
                        ...prev,
                        view: 'signup',
                    }))}
                >SIGN UP</Text>

            </Flex>
        </form>
    );
};
export default Login;