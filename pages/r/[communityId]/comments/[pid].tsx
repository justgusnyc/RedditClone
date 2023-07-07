import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Post } from '../../../../atoms/postAtom';
import About from '../../../../components/Community/About';
import PageContent from '../../../../components/Layout/PageContent';
import Comments from '../../../../components/Posts/Comments/Comments';
import PostItem from '../../../../components/Posts/PostItem';
import { auth, firestore } from '../../../../firebase/clientApp';
import useCommunityData from '../../../../hooks/useCommunityData';
import usePosts from '../../../../hooks/usePosts';

// the name of this title is in brackets so we can change the routing



const PostPage: React.FC = () => {

    // getting our communityData from our hook
    const { communityStateValue } = useCommunityData();

    const router = useRouter();

    // user auth
    const [user] = useAuthState(auth)

    // bringing in our hook for PostItem
    const { postStateValue, setPostStateValue, onDeletePost, onVote } = usePosts();

    // fetch post which fetches a specific page from the db so you do not always have to enter from community

    const fetchPost = async (postId: string) => {

        try {

            // get post from db 
            const postDocRef = doc(firestore, 'posts', postId);

            const postDoc = await getDoc(postDocRef);

            // set the postState recoil value
            setPostStateValue(prev => ({
                ...prev,
                selectedPost: { id: postDoc.id, ...postDoc.data() } as Post,
            }));
            
        } catch (error) {
            console.log('fetchPost error', error)
        }

    };

    useEffect(() => {

        // we call fetchPost if there is a valid postId in the URL, and there is no selectedPost then we call fetchPost
        // this is getting the title of this file which is the postId of each post in the search bar
        const { pid } = router.query;

        if(pid && !postStateValue.selectedPost){
            fetchPost(pid as string);
        }

    }, [router.query, postStateValue.selectedPost]);

    // once again use PageContent layout
    return (
        <PageContent>
            {/* RHS  */}
            <>
                {/* SelectedPost -> postItem  */}
                {postStateValue.selectedPost &&
                    (<PostItem
                        post={postStateValue.selectedPost}
                        onVote={onVote}
                        onDeletePost={onDeletePost}
                        userVoteValue={
                            postStateValue.postVotes.find(item => item.postId === postStateValue.selectedPost?.id)?.voteValue
                        }
                        userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
                    />)}


                <Comments 
                user={user as User} 
                selectedPost={postStateValue.selectedPost} 
                communityId={postStateValue.selectedPost?.communityId as string} 
                />

            </>


            {/* LHS */}
            <>
                {communityStateValue.currentCommunity && <About communityData={communityStateValue.currentCommunity}/>}
            </>
        </PageContent>
    );
}
export default PostPage;