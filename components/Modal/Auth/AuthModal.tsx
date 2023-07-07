import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { authModalState } from '../../../atoms/authModalAtom';
import { useRecoilState } from "recoil";
import { cert } from 'firebase-admin/app';
import AuthInputs from './AuthInputs';
import OAuthButtons from './OAuthButtons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase/clientApp';



const AuthModal: React.FC = () => {
    // this modal and page overall dictates what modal and info is going to be shown depending on whether or not
    // the login or signup page is clicked on the nav bar
    // we define this inside of the AuthButtons file where we say onClick -> setAuthModalState to open when clicked
    // this means we read and write to the same atom and depending on the values of that atom we alter global variables and act accordingly

    // this is very similar to native react state, but we instead of useState we have useRecoilState
    // same thing as use state, first thing is the state value and the second is the setting state function
    // hover over or check documentation on useRecoilState, first is val of state, second is what to change to
    const [modalState, setModalState] = useRecoilState(authModalState);

    // we use this after the user has been authenticated
    const [user, loading, error] = useAuthState(auth);

    // this function is gonna handle the closing of the modal
    const handleClose = () => {
        setModalState(prev => ({
            ...prev, // we spread the previous state values and we only want open which we set to false because we are closing
            open: false,
        }));
    };

    // this hook below essentially will be enacted every time the user is changed
    // this runs whenever the app mounds or any of the dependencies change
    useEffect(() => {
        if(user) handleClose(); // if valid user close modal
        console.log("user", user);
    }, [user]);

    // const { isOpen, onOpen, onClose } = useDisclosure() this was provided by chakra but we define our own hook above
    // typical react stuff but using the recoil atom of the modalState to see what the view is set to and then display 
    // the right title of the modal depending on the view
    // pb is padding bottom
    return (
        <>
            <Modal isOpen={modalState.open} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign='center'>
                        {modalState.view === 'login' && 'Login'}
                        {modalState.view === 'signup' && 'Sign Up'}
                        {modalState.view === 'resetPassword' && 'Reset Password'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody 
                    display='flex' 
                    flexDirection='column' 
                    alignItems='center'
                    justifyContent='center'
                    pb={6}>
                        <Flex 
                        direction='column' 
                        align='center'
                        justify='center'
                        width='70%'>
                            <OAuthButtons/>
                            <Text color='gray.400' fontWeight={700}>OR</Text>
                            <AuthInputs/>
                            {/* {<ResetPassword/>} */}


                        </Flex>
                    </ModalBody>

                </ModalContent>
            </Modal>
        </>
    )
}
export default AuthModal;