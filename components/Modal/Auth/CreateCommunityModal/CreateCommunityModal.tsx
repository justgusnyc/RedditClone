import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Divider,
  Text,
  Input,
  Checkbox,
  Stack,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { getDoc, doc, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";
import { auth, firestore } from "../../../../firebase/clientApp";

type CreateCommunityModalProps = {
  open: boolean;
  handleClose: () => void;
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  open,
  handleClose,
}) => {
    const[user] = useAuthState(auth);


  const [communityName, setCommunityName] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(21);
  const [communityType, setCommunityType] = useState("public");
  const[error, setError] = useState('');
  const[loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 21) return;
    setCommunityName(event.target.value);
    // calculate how many chars remaining
    setCharsRemaining(21 - event.target.value.length);
  };

  const onCommunityTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCommunityType(event.target.name);
  };


  // below the firestore object that we use is coming from the clientapp file from firebase
  const handleCreateCommunity = async () => {
    // if they already submitted and there is an error clear it first
    if(error) setError("");
    // validate community name
    const format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(format.test(communityName) || communityName.length < 3){
        setError('Community names must be between 3-21 characters, and can only contain letters numbers, or underscores');
        return;
    };

    setLoading(true);

    try {
        // create community in firebase
        // check that this name has not been taken
        // if valid name, then create community
    
        // this is referencing a specific document in our firebase
        // this is a reference to a document that is through our linked firestore connection under the collection\
        // named communities, into the document that specifically has this community name
        const communityDocRef = doc(firestore, 'communities', communityName);
        
        await runTransaction(firestore, async (transaction) => {
          // actually getting the document itself now, we changed this from getDoc, but now we make it part of the transaction
          const communityDoc = await transaction.get(communityDocRef);
          // this .exists comes from firestore
          if(communityDoc.exists()){
              throw new Error(`Sorry, r/${communityName} is taken. Try another.`)
          }   

          //create community
          // first parameter is the communityDocRef, the second is the actual data of js object being stored
          // changed from setDoc from firestore
           transaction.set(communityDocRef, { 
              creatorId: user?.uid,
              cretaedAt: serverTimestamp(),
              numberOfMembers: 1,
              privacyType: communityType,
              
          });

          // create community snippet for each user
          // we write a new document to the community subcollection that lives on the user document
          // we set with a doc that has first parameter is our firestore connection, second is absolute path to the database, 3rd is id of document which is communityname for us
          // second argument of set function is the data we want to actually store
          // the path notation goes roughly like collection -> document -> collection -> document...
          transaction.set(doc(firestore, `users/${user?.uid}/communitySnippets`, communityName), {
            communityId: communityName,
            isModerator: true,
          });
        });
    
    
        
    } catch (error: any) {
        console.log('handleCreateCommunity error', error);
        setError(error.message);
        
    }

    handleClose();
    router.push(`r/${communityName}`);

    setLoading(false);
  };

  return (
    <>
      <Modal isOpen={open} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            flexDirection="column"
            fontSize={15}
            padding={3}
          >
            Create a community
          </ModalHeader>
          <Box pl={3} pr={3}>
            <Divider />
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" padding="10px 0px">
              <Text fontWeight={600} fontSize={15}>
                Name
              </Text>
              <Text fontSize={11} color="gray.500">
                Communities names including capitilizations cannot be changed
              </Text>
              <Text
                position="relative"
                top="27px"
                left="10px"
                width="20px"
                color="gray.400"
              >
                r/
              </Text>
              <Input
                position="relative"
                value={communityName}
                size="sm"
                pl="22px"
                onChange={handleChange}
              />
              <Text
                fontSize={9}
                color={charsRemaining === 0 ? "red" : "gray.400"}
              >
                {" "}
                {charsRemaining} Characters remaining
              </Text>

              <Text fontSize='9pt' color='red' pt={1}>{error}</Text>

              <Box mt={4} mb={4}>
                <Text fontWeight={600} fontSize={15}>
                  Community Type
                </Text>

                <Stack spacing={2}>
                  <Checkbox
                    name="public"
                    isChecked={communityType === "public"}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align="center">
                      <Icon as={BsFillPersonFill} color="gray.500" mr={2} />
                      <Text fontSize="10pt" mr={1}>
                        Public
                      </Text>
                      <Text fontSize="8pt" color="gray.500" pt={1}>
                        Anyone can view, post, and comment to this community
                      </Text>
                    </Flex>
                  </Checkbox>
                  <Checkbox
                    name="restricted"
                    isChecked={communityType === "restricted"}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align="center">
                      <Icon as={BsFillEyeFill} color="gray.500" mr={2} />
                      <Text fontSize="10pt" mr={1}>
                        Restricted
                      </Text>
                      <Text fontSize="8pt" color="gray.500" pt={1}>
                        Anyone can view this community, only approved can post
                      </Text>
                    </Flex>
                  </Checkbox>
                  <Checkbox
                    name="private"
                    isChecked={communityType === "private"}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align="center">
                      <Icon as={HiLockClosed} color="gray.500" mr={2} />
                      <Text fontSize="10pt" mr={1}>
                        Private
                      </Text>
                      <Text fontSize="8pt" color="gray.500" pt={1}>
                        Only approved users can use
                      </Text>
                    </Flex>
                  </Checkbox>
                </Stack>
              </Box>
            </ModalBody>
          </Box>

          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Button
              variant="outline"
              mr={3}
              onClick={handleClose}
              height="30px"
            >
              Cancel
            </Button>
            <Button height="30px" onClick={handleCreateCommunity} isLoading={loading}>
              Create Community
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default CreateCommunityModal;
