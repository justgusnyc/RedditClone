import { Box, Flex, SkeletonCircle, SkeletonText, Stack, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { collection, doc, getDocs, increment, orderBy, query, serverTimestamp, Timestamp, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { Post, postState } from '../../../atoms/postAtom';
import { firestore } from '../../../firebase/clientApp';
import CommentInput from './CommentInput';
import CommentItem, { Comment } from './CommentItem';

type CommentsProps = {
    user: User;
    selectedPost: Post | null;
    communityId: string;
};



const Comments: React.FC<CommentsProps> = ({ user, selectedPost, communityId }) => {


    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);

    // we handle this loading delete differently to how we did our post delete,
    // here we just give the loading delete property the id value of the comment id 
    // then we pass that as a prop to each comment item and it loads like that 
    // instead of creating a handle delete function that takes in the onDelete and handles personal error handling like that
    const [loadingDeleteId, setLoadingDeleteId] = useState('');

    const setPostState = useSetRecoilState(postState);


    const onCreateComment = async () => {
        // creating a comment document



        try {

            setCreateLoading(true);

            // because we want both to succeed or fail then we want batch writes
            const batch = writeBatch(firestore);

            // create a new comment document
            const commentDocRef = doc(collection(firestore, 'comments'));
            const newComment: Comment = {
                id: commentDocRef.id,
                creatorId: user.uid,
                creatorDisplayText: user.email!.split('@')[0],
                communityId,
                postId: selectedPost?.id!,
                postTitle: selectedPost?.title!,
                text: commentText,
                createdAt: serverTimestamp() as Timestamp,
            };

            // creating our document with the ref of the collection we want to add to, then what we want to store in it
            batch.set(commentDocRef, newComment);

            newComment.createdAt = { seconds: Date.now() / 1000 } as Timestamp;

            // update post number of comments +1
            const postDocRef = doc(firestore, 'posts', selectedPost?.id!);
            // actually increment that field by 1 in db
            batch.update(postDocRef, {
                numberOfComments: increment(1),
            });


            // actually running the batch now
            await batch.commit();


            //update client recoil state
            // clears input after you comment
            setCommentText("");
            // add new comment to the top of comments array
            setComments((prev) => (
                [newComment, ...prev]
            ));

            // updating recoil state 
            setPostState(prev => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfComments: prev.selectedPost?.numberOfComments! + 1,
                } as Post,
            }));




        } catch (error) {
            console.log('onCreateComment error', error)
        }

        setCreateLoading(false);

    };


    const onDeleteComment = async (comment: any) => {



        // because we want both to succeed or fail then we want batch writes
        
        // update client recoil state
        
        
            
        setLoadingDeleteId(comment.id as string);
            try {
                if (!comment.id) throw "Comment has no ID";
                
                const batch = writeBatch(firestore);
                // delete comment document
                const commentDocRef = doc(firestore, "comments", comment.id);
                batch.delete(commentDocRef);
                
                // update post number of comments -1
                batch.update(doc(firestore, "posts", selectedPost?.id!), {
                    numberOfComments: increment(-1),
                });

                // run the batch
                await batch.commit();

                // update client recoil state
                setPostState((prev) => ({
                    ...prev,
                    selectedPost: {
                        ...prev.selectedPost,
                        numberOfComments: prev.selectedPost?.numberOfComments! - 1,
                    } as Post,
                }));

                setComments((prev) => prev.filter((item) => item.id !== comment.id));
                // return true;
            } catch (error) {
                console.log("Error deletig comment", error);
                // return false;
            }
            setLoadingDeleteId("");
        
            [setComments, setPostState]
    };

    const getPostComments = async () => {

        try {
            const commentsQuery = query(collection(firestore, 'comments'),
                where('postId', '==', selectedPost?.id),
                orderBy('createdAt', 'desc'));

            const commentDocs = await getDocs(commentsQuery);

            const comments = commentDocs.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setComments(comments as Comment[]);

        } catch (error) {
            console.log('getPostComments error', error);
        }

        setFetchLoading(false);

    }

    // only want to run once so no dependencies
    useEffect(() => {
        if (!selectedPost) return;
        getPostComments();
    }, [selectedPost])

    return (
        <Box bg='white' borderRadius='0px 0px 4px 4px' p={2}>
            {/* Comment Input */}
            <Flex direction='column' pl={10} pr={4} mb={6} fontSize='10pt' width='100%'>
                {!fetchLoading && <CommentInput
                    commentText={commentText}
                    setCommentText={setCommentText}
                    user={user}
                    createLoading={createLoading}
                    onCreateComment={onCreateComment}
                />}
            </Flex>

            {/* Comment Items */}
            <Stack spacing={6} p={2}>
                {fetchLoading ? (
                    <>
                        {[0, 1, 2].map((item) => (
                            <Box key={item} padding="6" bg="white">
                                <SkeletonCircle size="10" />
                                <SkeletonText mt="4" noOfLines={2} spacing="4" />
                            </Box>
                        ))}
                    </>
                ) : (
                    <>
                        {comments.length === 0 ? (
                            <Flex
                                direction="column"
                                justify="center"
                                align="center"
                                borderTop="1px solid"
                                borderColor="gray.100"
                                p={20}
                            >
                                <Text fontWeight={700} opacity={0.3}>
                                    No Comments Yet
                                </Text>
                            </Flex>
                        ) : (
                            comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onDeleteComment={onDeleteComment}
                                    loadingDelete={loadingDeleteId === comment.id}
                                    userId={user.uid}
                                />
                            ))
                        )}
                    </>
                )}
            </Stack>
        </Box>
    );
};

export default Comments;