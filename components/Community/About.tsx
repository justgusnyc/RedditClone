import { Box, Button, Divider, Flex, Icon, Stack, Text, Image, Spinner } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { Community, communityState } from '../../atoms/communitiesAtom';
import { HiOutlineDotsHorizontal } from "react-icons/hi"
import { RiCakeLine } from "react-icons/ri"
import useCommunityData from '../../hooks/useCommunityData';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/dist/client/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore, storage } from '../../firebase/clientApp';
import useSelectFile from '../../hooks/useSelectFile';
import { FaReddit } from 'react-icons/fa';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { useSetRecoilState } from 'recoil';

type AboutProps = {
    communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {

    // getting our router so we can query the search bar path
    // const router = useRouter();

    // user data and auth
    const [user] = useAuthState(auth);

    // hook from React that allows us to get a reference that we can pass to our ref in our input that is hidden when uploading an image
    // an actual reference to the input itself specfically selectedFileRef.current is the input tag with this ref
    const selectedFileRef = useRef<HTMLInputElement>(null);

    // our custom hook that allows us to deal with selecting files and such     
    const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();

    // this is a loading state for the uploading of the image/file
    const [uploadingImage, setUploadingImage] = useState(false);

    // bringing in our set community state val from recoil
    const setCommunityStateValue = useSetRecoilState(communityState);

    // this is simpler and cleaner than our handleCreatePost function, all we gotta do is send this file to storage and then 
    // update our community doc and recoil state so the front end actually updates
    const onUpdateImage = async () => {

        // if there is no selected file then no point updating image
        if(!selectedFile) return;

        // for the loading state
        setUploadingImage(true);

        try {
            // the ref function from firebase returns a storagereference for a given URL
            const imageRef = ref(storage, `communities/${communityData.id}/image`);

            // now to actually upload it to storage, we upload by passing the image as a string URL, and what type of string it is
            await uploadString(imageRef, selectedFile, "data_url");

            // making sure that it successfully uploaded
            const downloadURL = await getDownloadURL(imageRef);

            // now we update our community collection so that the imageURL for this community both in firebase and in recoil
            // is this new prof pic
            // with updateDoc the first argument is the doc we want to update, the second is what we want to update it with
            await updateDoc(doc(firestore, 'communities', communityData.id), {
                imageURL: downloadURL,
            });

            // db done at this point, now doing recoil
            // basically we spread the previous community state so that we can grab our currentCommunity
            // then we go into that currentCommunity and spread it so that we can only change the imageURL
            // to stop TS from going crazy we typecase the new current community as type Community
            setCommunityStateValue(prev => ({
                ...prev,
                currentCommunity: {
                    ...prev.currentCommunity,
                    imageURL: downloadURL,
                } as Community,
            })) 

            
        } catch (error: any) {
            console.log('onUpdateImage error', error);
        }

        setUploadingImage(false);

    }

    // we make the position sticky so that when we scroll down the community page the about community stays at the top, 14px from top specifically
    return (
        <Box position='sticky' top='14px'>
            {/* about header component  */}
            <Flex
                justify='space-between'
                align='center'
                bg='blue.400'
                color='white'
                p={3}
                borderRadius='4px 4px 0 px 0 px'
            >
                <Text fontSize='10pt' fontWeight={700}>About Community </Text>

                <Icon as={HiOutlineDotsHorizontal} />

            </Flex>

            {/* body of about community  */}
            {/* to locale string auto formats numbers and makes it look nice  */}
            <Flex
                direction='column'
                p={3}
                bg='white'
                borderRadius='0px 0px 4px 4px'
            >

                <Stack>
                    <Flex width='100%' p={2} fontSize='10pt' fontWeight={700}>
                        <Flex direction='column' flexGrow={1}>
                            <Text>
                                {communityData.numberOfMembers.toLocaleString()}
                            </Text>
                            <Text>
                                Members
                            </Text>
                        </Flex>

                        <Flex direction='column' flexGrow={1}>
                            <Text> 1 </Text>
                            <Text> Online </Text>

                        </Flex>

                    </Flex>

                    <Divider />

                    <Flex align='center' width='100%' p={1} fontWeight={500} fontSize='10pt'>
                        <Icon as={RiCakeLine} fontSize={18} mr={2} />
                        {communityData.createdAt && (<Text> Created {moment(new Date(communityData.createdAt.seconds * 1000)).format('MMM DD, YYYY')}</Text>)}
                    </Flex>

                    {/* this allows us to do SSR that links/routes us to the submit page of the community  */}
                    {/* whatever we put in the link is gonna route us to the page we specify with SSR  */}
                    <Link href={`/r/${communityData.id}/submit`}>
                        <Button mt={3} height='30px'>Create Post</Button>

                    </Link>

                    {/* we only want to show this next section if the user is a moderator of community  */}

                    {user?.uid === communityData.creatorId && (
                        <>
                            <Divider />
                            <Stack spacing={1} fontSize='10pt'>
                                <Text fontWeight={600}>Admin</Text>
                                <Flex align='center' justify='space-between'>
                                    <Text
                                        color='blue.500'
                                        cursor='pointer'
                                        _hover={{ textDecoration: "underline" }}
                                        onClick={() => selectedFileRef.current?.click()}
                                    >Change Image
                                    </Text>
                                    {communityData.imageURL || selectedFile ? (
                                        <Image src={selectedFile || communityData.imageURL}
                                            borderRadius='full' boxSize='40px' alt='Community Image'
                                        />
                                    ) : (

                                        <Icon as={FaReddit} fontSize={44}
                                            color='brand.100'
                                            mr={2} />

                                    )}
                                </Flex>
                                {/* we need to check if there is a selected file because this means the user is attempting to change community id  */}
                                {/* if a file is selected and the image is uploading we show spinner, otherwise some text you can click on with a hidden input that uses our selectedFileRef  */}
                                {selectedFile && (
                                    (uploadingImage ? <Spinner /> : <Text
                                        cursor='pointer'
                                        onClick={onUpdateImage}
                                    >Save Changes</Text>)
                                )}

                                <input
                                    hidden
                                    id="file-upload"
                                    accept='image/x-png, image/gif, image/jpeg'
                                    ref={selectedFileRef}
                                    type="file"
                                    onChange={onSelectFile}
                                />

                            </Stack>
                        </>
                    )}

                </Stack>

            </Flex>

        </Box>

    );
}
export default About;