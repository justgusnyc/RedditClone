import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilValue } from 'recoil';
import { communityState } from '../../../atoms/communitiesAtom';
import About from '../../../components/Community/About';
import PageContent from '../../../components/Layout/PageContent';
import NewPostForm from '../../../components/Posts/NewPostForm';
import { auth } from '../../../firebase/clientApp';
import useCommunityData from '../../../hooks/useCommunityData';


const SubmitPostPage:React.FC = () => {

    const [user] = useAuthState(auth);

    // bringing in our communityData by using global recoil states
    // allows us to pass data like props
    // const communityStateValue = useRecoilValue(communityState);

    // now instead of getting through our useRecoilValue like before, we use our hook so that the 
    // useEffect which fetches the data is called whenever the page loads and everything works correctly and is synced up
    // we use this so that the about page can stay consistent throughout the whole project
    const { communityStateValue } = useCommunityData();

    console.log('COMMUNITY', communityStateValue);
    
    // pretty cool that we can wrap all of this in our custom PageContent tag 
    // basically any major page of our app is gonna use this cause of the left and right side
    // all we have to do is include two react fragments, one for the LHS and one for RHS
    // and this will automatically handle lots for us
    return (
        <PageContent>
            {/* LHS */}
            <>
                <Box p='14px 0px'
                borderBottom='1px solid'
                borderColor='white'>
                    <Text>Create a post</Text>
                </Box>

                {user && <NewPostForm user={user}/>}

            </>

            {/* RHS */}
            <>
                { communityStateValue.currentCommunity && <About communityData={communityStateValue.currentCommunity} />}
            </>
        </PageContent>
    )
}
export default SubmitPostPage;