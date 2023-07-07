import React, { useState } from 'react';
import { Post } from '../../atoms/postAtom';

import { AiOutlineDelete } from "react-icons/ai";
import { BsChat, BsDot } from "react-icons/bs";
import { FaReddit } from "react-icons/fa";
import {
    IoArrowDownCircleOutline,
    IoArrowDownCircleSharp,
    IoArrowRedoOutline,
    IoArrowUpCircleOutline,
    IoArrowUpCircleSharp,
    IoBookmarkOutline,
} from "react-icons/io5";
import { Alert, AlertIcon, Flex, Icon, Image, Skeleton, Spinner, Stack, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useRouter } from 'next/dist/client/router';

type PostItemProps = {
    post: Post;
    userIsCreator: boolean;
    userVoteValue?: number;
    onVote: (
        event: React.MouseEvent<SVGElement, MouseEvent>,
        post: Post,
        vote: number,
        communityId: string
    ) => void;
    onDeletePost: (post: Post) => Promise<boolean>;
    onSelectPost?: (post: Post) => void;

};

const PostItem: React.FC<PostItemProps> = ({
    post,
    userIsCreator,
    userVoteValue,
    onVote,
    onDeletePost,
    onSelectPost,
}) => {

    // we can tell whether or not we are on the single post page whether the PostItem has been passed onSelectPost as a prop, like in [pid] we do not need it because we are already in that state
    // AKA if onselectpost is defined we are on the community page, if not we are on the single post page
    const singlePostPage = !onSelectPost;

    // for each post we are adding this state to see whether the image is loading or not still
    const [loadingImage, setLoadingImage] = useState(true);

    // loading states for delete so we know when it is processing and not
    const [loadingDelete, setLoadingDelete] = useState(false)

    const [error, setError] = useState(false);

    // bring in the router to route the user back to the community page after delete
    const router = useRouter();

    // for deleting
    const handleDelete = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {

        // we do this so that when we click on a vote on the community page we are not triggered to go to the selected post page as well 
        event.stopPropagation();

        setLoadingDelete(true);

        try {

            // this represents a successful response from the onDeletePost function
            // because the onDeletePost is async we needed to make it type promise of boolean since only promises can be returned asynchronously in ts and we need that type
            // this just means its gonna try and if it succeeds returns true, fails false
            const success = await onDeletePost(post);

            if (!success) {
                throw new Error("Failed to delete post");
            }

            console.log('post was successfuly deleted');

            // check if singlePostPage view
            if(singlePostPage){
                router.push(`/r/${post.communityId}`);
            }


        } catch (error: any) {
            setError(error.message)
        }

        setLoadingDelete(false);
    };



    return (
        // This flex box represents each post 
        <Flex
            border='1px solid'
            bg='white'
            borderColor={singlePostPage ? ('white') : ('gray.300')}
            borderRadius={singlePostPage ? '4px 4px 0px 0px' : '4px'}
            _hover={{ borderColor: singlePostPage ? 'none' : "gray.500" }}
            cursor={singlePostPage ? 'unset' : 'pointer'}
            onClick={() => onSelectPost && onSelectPost(post)}
        >


            {/* this is for the gray voting column on left border */}
            <Flex
                direction='column'
                align='center'
                bg={singlePostPage ? 'none' : 'gray.100'}
                p={2}
                width='40px'
                borderRadius={singlePostPage ? '0' : '3px 0px 0px 3px'}
            >
                {/* if the userVoteValue == 1, that means they upvoted the post  */}
                <Icon
                    as={userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline}
                    color={userVoteValue === 1 ? 'brand.100' : 'gray.400'}
                    fontSize={22}
                    onClick={(event) => onVote(event, post, 1, post.communityId)}
                    cursor='pointer'
                />

                <Text fontSize='9pt'>
                    {post.voteStatus}
                </Text>
                {/* // checking out how the onVote function works is good  */}
                <Icon
                    as={userVoteValue === -1 ? IoArrowDownCircleSharp : IoArrowDownCircleOutline}
                    color={userVoteValue === -1 ? '#4379FF' : 'gray.400'}
                    fontSize={22}
                    onClick={(event) => onVote(event, post, -1, post.communityId)}
                    cursor='pointer'
                />

            </Flex>

            {/* this is where all the post stuff is */}

            <Flex direction='column' width='100%'>


                {error &&
                    <Alert status='error'>
                        <AlertIcon />
                        <Text mr={2}>{error}t</Text>
                    </Alert>}


                <Stack spacing={1} p='10px'>
                    <Stack direction='row' spacing={0.6} align='center' fontSize='9pt'>
                        {/* we do a check here to see if we are on the homepage, community icons for posts only show up on the home page  */}
                        <Text> Posted by u/{post.creatorDisplayName} {moment(new Date(post.createdAt.seconds * 1000)).fromNow()} </Text>
                    </Stack>

                    <Text fontSize='12pt' fontWeight={600}>{post.title}</Text>

                    <Text fontSize='10pt'>
                        {post.body}
                    </Text>

                    {/* where image posts actually are  */}
                    {post.imageURL && (
                        <Flex justify='center' align='center' p={2}>
                            {loadingImage &&
                                <Skeleton height='200px' width='100%' borderRadius={4} />
                            }
                            {/* we added these effects to the image like onLoad and display to make it clean when loading and reloading  */}
                            <Image
                                src={post.imageURL}
                                maxHeight='460px'
                                alt='Post Image'
                                onLoad={() => setLoadingImage(false)}
                                display={loadingImage ? 'none' : 'unset'}
                            />
                        </Flex>
                    )}

                </Stack>

                <Flex ml={1} mb={0.5} color='gray.500' fontWeight={600}>
                    {/* all the stuff in here is for the little nav bar below the picture or body like comment share and save */}
                    {/* each icon/action gets it's own flex container */}

                    {/* comment  */}
                    <Flex
                        align='center'
                        p='8px 10px'
                        borderRadius={4}
                        _hover={{ bg: 'gray.200' }}
                        cursor='pointer'
                    >
                        <Icon as={BsChat} mr={2} />
                        <Text fontSize='9pt'>{post.numberOfComments}</Text>

                    </Flex>

                    {/* share  */}
                    <Flex
                        align='center'
                        p='8px 10px'
                        borderRadius={4}
                        _hover={{ bg: 'gray.200' }}
                        cursor='pointer'
                    >
                        <Icon as={IoArrowRedoOutline} mr={2} />
                        <Text fontSize='9pt'> Share </Text>

                    </Flex>

                    {/* save  */}
                    <Flex
                        align='center'
                        p='8px 10px'
                        borderRadius={4}
                        _hover={{ bg: 'gray.200' }}
                        cursor='pointer'
                    >
                        <Icon as={IoBookmarkOutline} mr={2} />
                        <Text fontSize='9pt'>{post.numberOfComments}</Text>

                    </Flex>

                    {/* delete  but this only shows if you have made the post*/}
                    {userIsCreator && <Flex
                        align='center'
                        p='8px 10px'
                        borderRadius={4}
                        _hover={{ bg: 'gray.200' }}
                        cursor='pointer'
                        onClick={handleDelete}
                    >
                        {loadingDelete ? (
                            <Spinner size='sm' />
                        ) : (
                            <>
                                <Icon as={AiOutlineDelete} mr={2} />
                                <Text fontSize='9pt'>Delete</Text>
                            </>
                        )}

                    </Flex>}

                </Flex>

            </Flex>



        </Flex>
    );

};
export default PostItem;