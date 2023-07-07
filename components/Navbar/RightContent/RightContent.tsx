import { Button, Flex } from '@chakra-ui/react';
import React from 'react';
import AuthButtons from './AuthButtons';
import AuthModal from '../../Modal/Auth/AuthModal';
import { signOut, User } from 'firebase/auth';
import { auth } from '../../../firebase/clientApp';
import Icons from './Icons';
import UserMenu from './UserMenu';

// belowe we define the user could be null or underfined or a real user
type RightContentProps = {
    user?: User | null;
};

// the flex shows how we basically center our items, justify means justified content
const RightContent:React.FC<RightContentProps> = ({user}) => {
    
    return (
        <>
        <AuthModal/>
        <Flex justify='center' align='center'>
            {user ? <Icons/>: <AuthButtons/>}
            <UserMenu user={user}/>

        </Flex>
        </>
    )
}
export default RightContent;