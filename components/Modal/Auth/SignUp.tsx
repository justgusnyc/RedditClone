import { Button, Flex, Input, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { authModalState } from '../../../atoms/authModalAtom';
import { useSetRecoilState } from "recoil"
import { auth } from '../../../firebase/clientApp';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth"
import { FIREBASE_ERRORS } from '../../../firebase/errors';

const SignUp: React.FC = () => {

    const setAuthModalState = useSetRecoilState(authModalState)

    const [signUpForm, setSignUpForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');

    // this comes from npm firebase hooks to authenticate
    const [
        createUserWithEmailAndPassword,
        user,
        loading,
        userError,
    ] = useCreateUserWithEmailAndPassword(auth)

    // Firbase logic
    // we pass in the event of type React Form event that returns an html form event
    const onSubmit = (event:React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();

        if(error){
            // if there is already an error when going to submit make it blank
            setError('');
        }

        if (signUpForm.password !== signUpForm.confirmPassword) {
            // then throw error
            setError("Passwords do not match");
            return;
        }

        // this makes sure that the password matches with the email, matches the confirm password from signup
        createUserWithEmailAndPassword(signUpForm.email, signUpForm.password);
    };




    // we inherintly take in an event which is of type React Change Event and handles the type of tag HTML Input element
    // ts gives us great auto completion and things when we define it this way
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // update form state
        // prev here is the previous value of state and then we spread it because we only want to update
        // a single piece of our form state
        setSignUpForm(prev => ({
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
            <Input
                required
                name='confirmPassword'
                placeholder='confirmPassword'
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

            {(error || userError) &&
                (<Text textAlign='center' color='red' fontSize='10px'> 
                {error || FIREBASE_ERRORS[userError?.message as keyof typeof FIREBASE_ERRORS]} 
                </Text>)}
{/* {in this button we can see lots of nice chakra stuff like the loading shown on auth sign up modal request we called the loading boolean there from the hook provided from the firebase authentication library so it knows automatically when it is done loading} */}
            <Button
                width='100%'
                height="36px"
                mt={2}
                mb={2}
                type='submit'
                isLoading = {loading}
            >
                Sign Up
            </Button>

            <Flex
                fontSize='9pt'
                justifyContent='center'>
                {/* so below we set the authmodal state through our recoil atom and spread the previous state and only take and change the view of the previous state */}
                <Text mr={1}>Already a voucher?</Text>
                <Text
                    color="blue.500"
                    fontWeight={700}
                    cursor="pointer"
                    onClick={() => setAuthModalState(prev => ({
                        ...prev,
                        view: 'login',
                    }))}
                >
                    LOG IN

                </Text>

            </Flex>
        </form>
    );
}
export default SignUp;