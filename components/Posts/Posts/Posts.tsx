import { Stack } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Community } from '../../../atoms/communitiesAtom';
import { Post } from '../../../atoms/postAtom';
import { auth, firestore } from '../../../firebase/clientApp';
import usePosts from '../../../hooks/usePosts';
import PostItem from '../PostItem';
import PostLoader from './PostLoader';

type PostsProps = {
    communityData: Community;
    userId?: string;
};

const Posts: React.FC<PostsProps> = ({ communityData }) => {

    const [loading, setLoading] = useState(false);

    // bringing in our user item 
    const [user] = useAuthState(auth);

    // initializing our post hook to update and get post state values
    const { postStateValue, setPostStateValue, onVote, onDeletePost, onSelectPost } = usePosts(communityData!);

    // once this component renders we need to fetch all of the posts from the db 
    // then store the posts in state and map through them and display each one 

    const getPosts = async () => {

        try {

            setLoading(true);


            // get posts for this community
            // really basic firestore functions, just query the database for everything in this collection, so we specif
            // the exact parts that we do want instead with the where clause
            // db query with firebase
            const postsQuery = query(collection(firestore, 'posts'),
                where('communityId', '==', communityData.id),
                orderBy('createdAt', 'desc'));

            // now we gotta use our firebase query to actually get the docs
            const postDocs = await getDocs(postsQuery);

            // now we wanna actually store what we got
            const posts = postDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            // so we take the previous state and spread it cause we only wanna update one value which is posts which we set to our posts
            // this means we can now access the posts anywhere with this hook state
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
            }))

            console.log("Posts", posts);



        } catch (error: any) {
            console.log('getPosts error', error.message)
        }

        setLoading(false);

    };

    // this is gonna run as soon as the component mounts and this is where we actually fetch the posts
    useEffect(() => {
        getPosts();
    }, [communityData]);

    // pretty straightforward, we just access the postStateValue through the hook that we've been updating the post states through
    // and then we are just mapping each of them to the PostItem tag that we have defined
    // here 'item' is actually defined as a Post type through the map so we can access data about the posts there
    return (

        // if it is loading then we show our custom loading skeleton 

        <>
            {loading ? (
                <PostLoader />
            ) : (


                <Stack>
                    {postStateValue.posts.map((item) => (
                        // the user vote value just checks if there is a vote value
                        <PostItem
                            key={item.id}
                            post={item}
                            userIsCreator={user?.uid === item.creatorId}
                            userVoteValue={postStateValue.postVotes.find((vote) => vote.postId === item.id)?.voteValue
                                }
                            onVote={onVote}
                            onSelectPost={onSelectPost}
                            onDeletePost={onDeletePost}
                        />
                    ))}

                </Stack>
            )}
        </>
    )
}
export default Posts;