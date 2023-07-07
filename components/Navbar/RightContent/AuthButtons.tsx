import { Button } from '@chakra-ui/react';
import React from 'react';
import { authModalState } from '../../../atoms/authModalAtom';
import { useSetRecoilState } from "recoil";

// we got the variant below from the chakra button theme

// the display we specified means it won't show up on mobile and if it gets too small acts as flex
const AuthButtons:React.FC = () => {
    // we use this recoil method because here we only need to set what the state is when 
    // these buttons are clicked then they should open and the recoil global state should be changed
    // in auth modals we needed to provide things to the recoil state because we needed to decide whether or not to close the modal or whatever

    // once one of the buttons is clicked then the modalState is set to the correct parameters and everything else can act accordingly 
    const setAuthModalState = useSetRecoilState(authModalState);
    
    return (
        <>
            <Button 
            variant='outline' 
            height='28px' 
            display={{base:"none", sm:"flex"}}
            width={{base: '70px', md: '110px'}}
            mr={2}
            onClick = {() => setAuthModalState({open: true, view: 'login'})}
            > Log In
            </Button>

            <Button
            height='28px' 
            display={{base:"none", sm:"flex"}}
            width={{base: '70px', md: '110px'}}
            mr={2}
            onClick = {() => setAuthModalState({open: true, view: 'signup'})}
            > Sign Up
            </Button>
        </>
    )
}
export default AuthButtons;