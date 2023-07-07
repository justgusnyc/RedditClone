import { collection, doc, getDoc, getDocs, increment, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { authModalState } from '../atoms/authModalAtom';
import { Community, CommunitySnippet, communityState } from '../atoms/communitiesAtom';
import { auth, firestore } from '../firebase/clientApp';

// hooks must begin with 'use' no matter what


const useCommunityData = () => {

    // getting our router
    const router = useRouter();

    const [user] = useAuthState(auth);

    const setAuthModalState = useSetRecoilState(authModalState);

    const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // this function decides whether to call join or leave community
    const onJoinOrLeaveCommunity = (communityData: Community, isJoined: boolean) => {
        // first we check if the user is signed in
        // if not then open the auth modal
        if (!user) {
            // open modal to login
            setAuthModalState({ open: true, view: 'login' });
            return;
        }


        // if they are signed in
        // are they apart of community?
        if (isJoined) {
            leaveCommunity(communityData.id);
            return;
        }
        else {
            joinCommunity(communityData);
        }
    };

    // getting the snippets from the database
    const getMySnippets = async () => {

        setLoading(true);
        try {
            // get users snippet
            const snippetDocs = await getDocs(collection(firestore, `users/${user?.uid}/communitySnippets`));

            // we extract the data from each one and store it in mySnippets inside of communityStateValue
            const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: snippets as CommunitySnippet[],
            }));

        } catch (error: any) {
            console.log('getMySnippets error', error);
            setError(error.message);
        }
        setLoading(false);
    }

    // function for joining the community
    const joinCommunity = async (communityData: Community) => {
        try {

            // batch write

            const batch = writeBatch(firestore);

            const newSnippet: CommunitySnippet = {
                communityId: communityData.id,
                imageURL: communityData.imageURL || "",
            };

            // create new community snipper for user (1st write of batch operation)
            // when doing our batch write the first parameter is where we are going to write our batch
            // the second parameter is what we will actually write, this creates a new document in firebare subcollection
            batch.set(
                doc(
                    firestore,
                    `users/${user?.uid}/communitySnippets`,
                    communityData.id),
                newSnippet
            );

            // updating the number of members on this community +1 (2nd write)
            // because now we are just updating a collection instead we use update
            // update the number of member by one
            batch.update(doc(firestore, 'communities', communityData.id), {
                numberOfMembers: increment(1),
            });

            // this command below actually executes the batch actions
            await batch.commit()


            // afterwards we update our client data which is our recoil state which is our communityState.mySnippets
            // we spread the previous recoil state then take mySnippets and spread the previous mySnippets so that we just 
            // append the newSnippet to mySnippets
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: [...prev.mySnippets, newSnippet],
            }));



        } catch (error: any) {
            console.log('joinCommunity error', error);
            setError(error.message);
        }
        setLoading(false);


    };

    // function for leaving the community
    const leaveCommunity = async (communityId: string) => {
        // batch writes

        try {

            const batch = writeBatch(firestore);

            // deleting the communtiy snippet for this user
            batch.delete(doc(firestore,
                `users/${user?.uid}/communitySnippets`, communityId));


            // update the communityNumbers by -1
            batch.update(doc(firestore, 'communities', communityId), {
                numberOfMembers: increment(-1),
            });

            await batch.commit()

            // update clientside data recoil state communityState
            // the filter is a built in function that will remove items that do not meet a condition
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: prev.mySnippets.filter(
                    (item) => item.communityId !== communityId),
            }));

        } catch (error: any) {
            console.log('leaveCommunity error', error.message);
            setError(error.message);
        }

        setLoading(false);




    };

    const getCommunityData = async (communityId: string) => {

        try {

            const communityDocRef = doc(firestore, 'communities', communityId);
            const communityDoc = await getDoc(communityDocRef);

            setCommunityStateValue(prev => ({
                ...prev,
                currentCommunity: { 
                    id: communityDoc.id,
                    ...communityDoc.data(),
                 } as Community
            }))

            
            
        } catch (error) {
         console.log('getCommunityData error', error);   
        }



    }


    // this is called so that we can get our community data when the page refreshes
    useEffect(() => {
        const { communityId } = router.query;
        if (communityId && !communityStateValue.currentCommunity) {
            getCommunityData(communityId as string);
        }

    }, [router.query, communityStateValue.currentCommunity])

    // we use useEffect to load the snippet like any other component when the app loads and dom mounts
    // we added the dependency user so that this hook will trigger whenever the user changes
    useEffect(() => {
        // emptying the community recoil state value snippets if no user 
        if (!user) {
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: [],
            }));
            return
        }
        getMySnippets();
    }, [user]);

    return {
        // gonna return data and functions that will be useable in other parts of app
        communityStateValue,
        onJoinOrLeaveCommunity,
        loading,
    };
};
export default useCommunityData;