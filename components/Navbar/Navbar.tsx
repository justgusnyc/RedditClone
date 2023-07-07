import { Center, Flex, Image } from '@chakra-ui/react';
import React from 'react';
import SearchInput from './SearchInput';
import RightContent from './RightContent/RightContent';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/clientApp';
import Directory from './Directory/Directory';
import useDirectory from '../../hooks/useDirectory';
import { defaultMenuItem } from '../../atoms/directoryMenuAtom';

type NavbarProps = {

};
// the flex from Chakra is an out of the box div with css flexbox already applied to it
// we can see the different css properties applied as well
// we are also going to fit in a media query to do things like make the second image dissapear after a certain amount of time
// in the "display" in the second image we see base = none which means at the base size (it is a mobile first library) it will not be visible

// we have general styling for the buttons done in the chakra themes section

// justify space between in the flex on top makes all of the children in the nav bar actually move correctly with window size
const Navbar: React.FC = () => {
    const [user, loading, error] = useAuthState(auth);

    const { onSelectMenuItem } = useDirectory()

    return (
        <Flex bg="white" height='44px' padding='6px 12px' justify={{ md: 'space-between' }}>

            <Flex
                onClick={() => onSelectMenuItem(defaultMenuItem)}
                cursor='pointer'
                align="center"
                width={{ base: '40px', md: 'auto' }}
                mr={{ base: 0, md: 2 }}
            >
                <Image src='/images/redditFace.svg' height="30px" />
                <Image src='/images/redditText.svg' height="46px" display={{ base: "none", md: "unset" }} />
            </Flex>
            {user && <Directory />}
            <SearchInput user={user} />
            <RightContent user={user} />
        </Flex>
    );
}
export default Navbar;