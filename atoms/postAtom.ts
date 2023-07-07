import { Timestamp } from "firebase/firestore";
import { atom } from "recoil"


// here is our post type
export type Post = {
    id?: string;
    communityId: string;
    creatorId: string;
    creatorDisplayName: string;
    title: string;
    body: string;
    numberOfComments: number;
    voteStatus: number;
    imageURL?:string;
    communityImageURL?: string;
    createdAt: Timestamp;
}

// this is our type for our postVotes 
export type PostVote = {
    id: string;
    postId: string;
    communityId: string;
    voteValue: number;
}

// here is our interface to actually model our post state
interface PostState{
    selectedPost: Post | null;
    posts: Post[];
    postVotes: PostVote[];

}

const defaultPostState: PostState = {
    selectedPost: null,
    posts: [],
    postVotes: [],
}

export const postState = atom<PostState>({
    key: 'postState',
    default: defaultPostState,
});