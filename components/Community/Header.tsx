import { Box, Button, Flex, Icon, Image, Text } from '@chakra-ui/react';
import React from 'react';
import { FaReddit } from 'react-icons/fa';
import { Community } from '../../atoms/communitiesAtom';
import useCommunityData from '../../hooks/useCommunityData';

type HeaderProps = {
    communityData: Community;
};

// we could technically get rid of the communityData prop and just bring all the data in from the CommunityState recoil
// since in our r/index we updated the recoil already, but it does render faster with communityData since that is directly from the server
// and it is rendered on the server, the storing to recoil happens in r/index useEffect
const Header: React.FC<HeaderProps> = ({ communityData }) => {

    const { communityStateValue, onJoinOrLeaveCommunity, loading } = useCommunityData();
    // reads from our communitySnippets, mySnippets is an array of communities that the user is currently in, so we search this array in our recoil
    // the find function allows us to loop through looking for an item that matches a specific condition
    // !! operator booleanizes 
    const isJoined = !!communityStateValue.mySnippets.find((item) => item.communityId === communityData.id);
    {/* flexgrow 1 just means to take up all the remaining space which would be 50% because the box height is 50% */ }
    {/* this second flex box is for the icons, maxwidth is to keep the header from stretching too far and looking weird on very large screens, before that 95% of the full flex grow from parent */ }

    return (
        <Flex direction='column' width='100%' height='146px'>
            <Box height='50%' bg="blue.400" />
            <Flex justify='center' bg='white' flexGrow={1}>
                <Flex width='95%' maxWidth='860px'>

                    {/* displays community profile pic  */}
                    {/* we have to reference the currentCommunity first because in the About page where an admin can update the community pic  */}
                    {/* we update the communityStateValue and so unless we refresh the page and pull from database if photo was just uploaded it wont change */}
                    {communityStateValue.currentCommunity?.imageURL ? (
                        /* logic for image URLs */
                        <Image
                            src={communityStateValue.currentCommunity.imageURL}
                            borderRadius="full"
                            boxSize="66px"
                            alt="Dan Abramov"
                            position="relative"
                            top={-3}
                            color="blue.500"
                            border="4px solid white"
                        />
                    ) : (
                        /* we do this because this icon uses relative positioning kind of sitting on top of some layers, it sits -3 from its parent position, negative means towards it */
                        <Icon
                            position='relative'
                            as={FaReddit}
                            fontSize={64}
                            top={-3}
                            color='blue.500'
                            border='4px solid white'
                            borderRadius='full'
                        />

                    )}

                    {/* flexbox spam ftw makes everything look nice and run nice */}
                    <Flex padding='10px 16px'>
                        <Flex direction='column' mr={6}>
                            {/* where we display community name */}
                            <Text fontWeight={800} fontSize='16pt'>
                                {communityData.id}
                            </Text>
                            <Text fontWeight={600} fontSize='10pt' color='gray.400'>
                                r/{communityData.id}
                            </Text>
                        </Flex>

                        <Button
                            variant={isJoined ? 'outline' : 'solid'}
                            height='30px'
                            pr={6}
                            pl={6}
                            onClick={() => onJoinOrLeaveCommunity(communityData, isJoined)}
                            isLoading={loading}
                        >
                            {isJoined ? 'Joined' : 'Join'}
                        </Button>
                    </Flex>


                </Flex>

            </Flex>

        </Flex>
    )
}
export default Header;