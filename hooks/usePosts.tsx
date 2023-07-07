import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { authModalState } from '../atoms/authModalAtom';
import { Community, communityState } from '../atoms/communitiesAtom';
import { Post, postState, PostVote } from '../atoms/postAtom';
import { auth, firestore, storage } from '../firebase/clientApp';

// extracting repeated logic


const usePosts = (communityData?: Community) => {

    // bring it router to route them back to the page they need 
    const router = useRouter();

    // user auth
    const [user] = useAuthState(auth);

    // the first state that we are going to need is the recoil state hook
    const [postStateValue, setPostStateValue] = useRecoilState(postState);

    // this returns only a specific value from within a recoil atom
    const currentCommunity = useRecoilValue(communityState).currentCommunity;

    // grab the ability to set our atom 
    const setAuthModalState = useSetRecoilState(authModalState);


    // functions for voting
    // takes in post to be voted on, the vote itself, and the communityID of post
    const onVote = async (
        event: React.MouseEvent<SVGElement, MouseEvent>,
        post: Post,
        vote: number,
        communityId: string) => {

        // we do this so that when we click on a vote on the community page we are not triggered to go to the selected post page as well 
        event.stopPropagation();

        // checks if user is trying to vote on a post thats not logged in
        // open modal for authentication
        if (!user?.uid) {
            // open login modal
            setAuthModalState({ open: true, view: 'login' });
            return;
        }





        // we model the votes similarily to how we got the communitySnippets in how we have a subcollection for the user to know which they are in
        // so that when a user joins a community for example we add that community to the users communitySnippet subcollection and then we update the number of people 
        // in the commmunity on the community collection, voting will work similarly 

        // in the posts collection we have a field called voteStatus which is updated whenever a user votes on that post, and on users we are creating another subCollection called 'postVotes'
        // this will allow us to know which post the user has voted on and which communities, this will use a batch write because we will be updating 
        // two documents at the same time, postVotes and voteStatus in the posts collection

        // the main pieces of this to think about are firstly how many votes a post has, then has a particular user already voted on that post?
        // if they have voted and they alter their vote are they removing or voting opposite way? Or normal vote use case


        try {
            // destructuring voteStatus from the post
            const { voteStatus } = post;

            // we first are finding out if this is a new vote or an update vote, returns the existing vote or undefined
            const exisitingVote = postStateValue.postVotes.find((vote) => vote.postId === post.id);

            // batch instance
            const batch = writeBatch(firestore);

            // these are the things we need to modify
            // we make copies of everything first then modify the copies then update the originals so we do not mutate the state
            const updatedPost = { ...post };
            const updatedPosts = [...postStateValue.posts];
            let updatedPostVotes = [...postStateValue.postVotes]
            let voteChange = vote;



            // new vote
            if (!exisitingVote) {


                // create a new postVote document
                // firestore connection, the collection we want a ref of, and the path
                const postVoteRef = doc(
                    collection(firestore, 'users', `${user?.uid}/postVotes`)
                );


                // making our new vote 
                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote, // 1 or -1
                };

                // set the batch with the document you want to modify and what you want to modify it with
                batch.set(postVoteRef, newVote);


                // add/subtract 1 to.from post.voteStatus
                // our voteStatus variable that we grabbed before represents current status
                updatedPost.voteStatus = voteStatus + vote;

                // we want to update the postVote recoil state with our newVote
                updatedPostVotes = [...updatedPostVotes, newVote];

                // creating a new postVote document on users postVote subcollection

            }
            // the else handles exisitng votes, meaning they have voted before
            else {

                // updating vote

                // before postVoteRef was a reference to a newly created collection, now we are going to reference an already exisitng collection
                const postVoteRef = doc(firestore, 'users', `${user?.uid}/postVotes/${exisitingVote.id}`);

                // user could be removing their vote
                // we know a user is removing their vote if their vote value (1 or -1) was the same as it was originally
                if (exisitingVote.voteValue === vote) {

                    // add/subtract 1 to/from post.voteStatus
                    // should always be -vote because - -1 to get rid of downvote 
                    updatedPost.voteStatus = voteStatus - vote;


                    // delete the postVote document
                    // does this by filtering through and selecting all of the ones that do not have our exisitng vote id
                    updatedPostVotes = updatedPostVotes.filter(
                        vote => vote.id !== exisitingVote.id
                    );

                    // delete the postVote document 
                    batch.delete(postVoteRef);

                    // when removing the vote we want to negate voteChange
                    voteChange *= -1;

                }
                // user could be flipping their vote
                else {
                    // add/subtract 2 to/from post.voteStatus because flipping switching downvote to upvote increates total number by 2
                    updatedPost.voteStatus = voteStatus + 2 * vote;

                    // now we are updating our postVotes array, but this time we are not adding or subtracting 1, we are editing it
                    // to edit it we need the index of this vote inside of the postVotes array, which is made easy for us with array.findindex
                    // find the vote where our vote id is equal to the exisitng id 
                    const voteIndex = postStateValue.postVotes.findIndex(
                        (vote) => vote.id === exisitingVote.id
                    );

                    updatedPostVotes[voteIndex] = {
                        ...exisitingVote,
                        voteValue: vote,

                    }

                    // updating exisitng postVote document in db
                    // when we do a batch update we are updating in the db, give it the document to update and then the value
                    batch.update(postVoteRef, {
                        voteValue: vote,
                    });

                    voteChange = 2 * vote;
                }
            }

            

            // updatedPosts does not yet have the updatedPost, so we will have to update it by finding index again
            const postIndex = postStateValue.posts.findIndex(item => item.id === post.id);
            updatedPosts[postIndex] = updatedPost;


            // update recoil state with the updated values so the frontend actually changes
            // this is why we made and modified those copies, so that we could store them like this
            setPostStateValue((prev) => ({
                ...prev,
                posts: updatedPosts,
                postVotes: updatedPostVotes,
            }));


            // this handles voting if it is on a selected post instead
            if (postStateValue.selectedPost) {
                setPostStateValue((prev) => ({
                    ...prev,
                    selectedPost: updatedPost,
                }));
            }




            // update our post in the db actually
            const postRef = doc(firestore, 'posts', post.id!);
            // update the collection with our voteChange amount that we kept track of
            batch.update(postRef, { voteStatus: voteStatus + voteChange });


            // this actually runs all of the batch operations
            await batch.commit();


        } catch (error) {
            console.log('onVote error', error);
        }






    };

    // when a post is selected and we go into single view
    const onSelectPost = (post: Post) => {

        // put our post into the selected post state
        setPostStateValue((prev) => ({
            ...prev,
            selectedPost: post,
        }));

        router.push(`/r/${post.communityId}/comments/${post.id}`);

    };

    // deleting a post
    // because the function is asynchronous we need to wrap the return type in a promise
    const onDeletePost = async (post: Post): Promise<boolean> => {

        // we do this so that when we click on a vote on the community page we are not triggered to go to the selected post page as well 
        // event.stopPropagation();


        try {
            // checks if post we are trying to delete has an image atached
            if (post.imageURL) {
                // get the image ref that is in our storage in firebase, clientApp storage there
                // then path to image
                const imageRef = ref(storage, `posts/${post.id}/image`);

                // now actually delete that object from storage
                await deleteObject(imageRef);
            }


            // then delete post document itself that the pic was sitting on or anything else
            // since the id type is optional we need bang (!) to force ts to continue 
            const postDocRef = doc(firestore, `posts`, post.id!);
            // now actually delete the document from firebase
            await deleteDoc(postDocRef)



            // then update the recoil state so it gets updated on the UI
            // we delete by taking the previous revoil state value, spreading it and then filtering 
            // through specifically the posts attribute and only keeping the ones which do not match this post id 
            setPostStateValue(prev => ({
                ...prev,
                posts: prev.posts.filter((item) => item.id !== post.id)
            }))

            return true;

        } catch (error) {
            return false;;
        }

    };

    // makes sure votes update
    // this is to ensure that the fact that we voted persists on posts that we did vote on after refresh
    const getCommunityPostVotes = async (communityId: string) => {
        // we make a query to fetch from the db all the docs where the community id is the same as this one and get their postVotes collection
        const postVotesQuery = query(
            collection(firestore, 'users', `${user?.uid}/postVotes`), where('communityId', '==', communityId)
        );

        // we use that query to actually fetch the postVotes collections from users collection that are from this community
        const postVoteDocs = await getDocs(postVotesQuery);

        const postVotes = postVoteDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // setting the PostState recoil now
        setPostStateValue(prev => ({
            ...prev,
            postVotes: postVotes as PostVote[],
        }))
    };


    // trigger the votes data when user enters community
    useEffect(() => {

        // if they are not a user or there is no communityId then do not call this function
        if (!user || !currentCommunity?.id) return;

        getCommunityPostVotes(currentCommunity?.id);


    }, [user, currentCommunity]);

    // this is to make sure that data does not persist if you are not a user 
    useEffect(() => {
        if (!user) {
            // clear user postVotes
            setPostStateValue(prev => ({
                ...prev,
                postVotes: [],
            }));
        }
    }, [user]);



    // because this is a hook, instead of returning some html stuff, we want to return functions
    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost,
    };
};
export default usePosts;