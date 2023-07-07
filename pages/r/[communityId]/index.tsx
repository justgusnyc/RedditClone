import React, { useEffect } from 'react';
import { GetServerSidePropsContext } from "next";
import { firestore } from '../../../firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { Community, communityState } from '../../../atoms/communitiesAtom';
import safeJsonStringify from 'safe-json-stringify';
import NotFound from '../../../components/Community/NotFound';
import Header from '../../../components/Community/Header';
import PageContent from '../../../components/Layout/PageContent';
import CreatePostLink from '../../../components/Community/CreatePostLink';
import Posts from '../../../components/Posts/Posts/Posts';
import { useSetRecoilState } from 'recoil';
import About from '../../../components/Community/About';

type CommunityPageProps = {
    communityData: Community;
};
// we use ssr here
// Essentially: we GetServerSideProps at the bottom with that function which gives us our communityData, then we pass that community data which we pass
// using a useEffect so that it is called once the page is rendered setCommunityStateValue from recoil which makes it global and then access that everywhere 
// so that when they get that recoil state everything on the UI is updating and rendering properly and instantly and all the children have the right data

// using getServerSideProps
// this gets called on nextjs server then data from our db is fetched
// then passed to the component then the componenet is rendered on the server and then passed to the client

// this is our client side component here
const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {

    console.log("here is data", communityData);


    // here we bring in our recoil state which sets us up to share our communityData globally
    const setCommunityStateValue = useSetRecoilState(communityState);

    // basically if they try going to r/ something and it does not exist
    // if the async function below is not able to retrieve data from the db, we render
    // a notfound component instead
    if (!communityData) {
        return (
            <NotFound/>
        );
    }

    // useEffect with no dependencies 
    // this time we use this so that we can send the communityData to other parts of the app that need it for 
    // the RHS component of the entire application by setting global recoil state
    useEffect(() => {
        setCommunityStateValue((prev) => ({
            ...prev,
            currentCommunity: communityData,
        }));


    }, [communityData]);

    return (
        <>
        <Header communityData={ communityData }/>
        <PageContent>
            {/* each of these two children below is the representation of children in PageContents in pages */}
            {/* this first one is the child that represents the left hand content which is basically all of the real content  */}
            <>
            <CreatePostLink/>
            <Posts communityData={communityData}/>
            </>

            {/* This child react fragment below is for the right content which is the community info and stuff */}
            {/* RHS  */}
            <>
            <About communityData={communityData} />
            </>
        </PageContent>
        </>
    );
};


// we only call this function below once during SSR and then store what we get in the recoil states so that we are not endlessly calling the server 
// for all of the other parts of the application
// using GetServerSideProps queries DB

// because of this we need to also define a sort of data refresh because the home page of each of the 
// communities is responsible for making sure that next JS gets its data so if you refresh on the submit or create 
// page or something the data is not fixed unless... 

export async function getServerSideProps(context: GetServerSidePropsContext) {
    try {
        // get community data and pass it to client component
        // the context is basically just referencing whatever /r it is with the communityId reference in the folder structure
        // we structured our db in the same way, so based on communityId it will try to pull up that community
        const communityDocRef = doc(firestore, 'communities', context.query.communityId as string);

        const communityDoc = await getDoc(communityDocRef);


        // the community data that we are storing is coming fro this library which makes sure that we can safely store
        // this data with timestamps and such in firebase, the first parameter is the community id and then we wany all of the
        // data inside of the communtiy document so we just spread the data of the document 
        return {
            props: {
                communityData: communityDoc.exists() ?
                    JSON.parse(safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })) : "",
            },

        };

    } catch (error) {
        console.log('getServerSideProps error', error);
    }
}

export default CommunityPage;