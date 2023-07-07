import { Alert, AlertDescription, AlertIcon, AlertTitle, Flex, Icon, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { BsLink45Deg, BsMic } from 'react-icons/bs';
import { BiPoll } from 'react-icons/bi';
import { IoDocumentText, IoImageOutline } from 'react-icons/io5';
import { type } from 'os';
import TabItem from './TabItem';
import TextInputs from './PostForm/TextInputs';
import ImageUpload from './PostForm/ImageUpload';
import { Post } from '../../atoms/postAtom';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { addDoc, collection, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebase/clientApp';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import useSelectFile from '../../hooks/useSelectFile';


type NewPostFormProps = {
    user: User
};

// here we are creating a static array of the tab items for the 
// internal nav bar that has icons and text bascially

const formTabs: Tabitem[] = [
    {
        title: 'Post',
        icon: IoDocumentText,
    },
    {
        title: 'Images & Video',
        icon: IoImageOutline,

    },
    {
        title: 'Link',
        icon: BsLink45Deg,

    },
    {
        title: 'Poll',
        icon: BiPoll,

    },
    {
        title: 'Talk',
        icon: BsMic,

    },
];

// basically defining props for our formTabs array
export type Tabitem = {
    title: string,
    icon: typeof Icon.arguments;
}

const NewPostForm: React.FC<NewPostFormProps> = ({ user }) => {

    // get the community id from the router hook and splicing so that we can satisfy prop requirements
    const router = useRouter();



    // so that we know what pages and such to load depeding on which of the tabs is clicked

    // for us to set and get our texts
    const [textInputs, setTextInputs] = useState({
        title: "",
        body: "",

    });

    const {selectedFile, setSelectedFile, onSelectFile} = useSelectFile();

    // we replace the useState below with custom hook usePosts, which we call above

    // this represents the actual name of the file that we will use as the source of an image
    // const [selectedFile, setSelectedFile] = useState<string>();

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(false);

    // default it to be opened to the first title of post
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title);

    // actually responsible for creating a post
    const handleCreatePost = async () => {

        const { communityId } = router.query;

        // construct new post object of type Post that we created ourselves
        // initializing post object
        // ! operator means that we know for sure we will receive that value with that type so it is safe to proceed
        const newPost: Post = {
            communityId: communityId as string,
            creatorId: user?.uid,
            creatorDisplayName: user.email!.split("@")[0],
            title: textInputs.title,
            body: textInputs.body,
            voteStatus: 0,
            numberOfComments: 0,
            createdAt: serverTimestamp() as Timestamp,
        };

        // store post in DB in posts collection
        setLoading(true);
        try {

            const postDocRef = await addDoc(collection(firestore, `posts`), newPost);

            // see if user has selected a file for their post and if so then we store it in 
            // firebase storage which is different than normal db it is for media content
            // we are gonna use storage => getDownloadURL (return imageURL) to get the url to store

            // we want to make sure that our post is uploaded before we upload and attach our image to it to avoid 
            // a possible random image in storage

            //update postdoc by adding imageURL
            if (selectedFile) {
                // our ref of the image we wanna store, uses store from clientApp
                const imageRef = ref(storage, `posts/${postDocRef.id}/image`);

                // this is what actually uploads the image URL to the db
                await uploadString(imageRef, selectedFile, `data_url`);

                // getting our valid image URL
                const downloadURL = await getDownloadURL(imageRef);

                // now we can actually update our post content with the image
                await updateDoc(postDocRef, {
                    imageURL: downloadURL,
                });
            }

            // reroute user to community page 
            router.back();

        } catch (error: any) {
            console.log('handleCreatePost error', error.message);
            setError(true)
        }
        setLoading(false);



    };


    // we replace this whole section below with usePosts hook

    // handles what happens when a user selects a specific pic from the own computer and puts it into the post
    // const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     // reading and processing the data that comes from ImageUpload.tsx
    //     const reader = new FileReader();

    //     // this can be an array but we only have one image being selected so we select the first item only 
    //     if (event.target.files?.[0]) {
    //         reader.readAsDataURL(event.target.files[0]);
    //     }

    //     reader.onload = (readerEvent) => {
    //         if (readerEvent.target?.result) {
    //             setSelectedFile(readerEvent.target.result as string);
    //         }
    //     }
    // };

    // handles when things change
    // destructuring things to get the text saved properly as body and title 
    const onTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {
            target: { name, value },
        } = event;
        setTextInputs((prev => ({
            ...prev,
            [name]: value,
        })));
    };

    return (
        <Flex
            direction='column'
            bg='white'
            borderRadius={4}
            mt={2}>
            {/* this second flex is for the little internal nav bar */}
            <Flex width='100%'>
                {/* below this we are mapping each of our different items in our array to a react item */}
                {formTabs.map((item) => (
                    // the selected attribute makes it so that we are only able to select one each time that defines which one is selected tab
                    // we pass our setSelectedTab item in as a prop to TabItem, 
                    // then in TabItem in our OnClick, when you click on the title of any of the internal nav tab items
                    // then it will setSelectedTab to the title of that tab
                    <TabItem
                        key={item.title}
                        item={item}
                        selected={item.title === selectedTab}
                        setSelectedTab={setSelectedTab}
                    />
                ))}
            </Flex>

            {/* This flex container if for everything on create post form that is not internal navbar */}
            <Flex p={4}>
                {selectedTab === 'Post' && (
                    <TextInputs
                        textInputs={textInputs}
                        handleCreatePost={handleCreatePost}
                        onChange={onTextChange}
                        loading={loading}
                    />
                )}

                {selectedTab === 'Images & Video' && (
                    <ImageUpload selectedFile={selectedFile}
                        onSelectImage={onSelectFile}
                        setSelectedTab={setSelectedTab}
                        setSelectedFile={setSelectedFile}
                    />
                )}

            </Flex>
            {error && (
                <Alert status='error'>
                    <AlertIcon />
                    <Text mr={2}>Error creating post</Text>
                </Alert>
            )}
        </Flex>
    )
}
export default NewPostForm;