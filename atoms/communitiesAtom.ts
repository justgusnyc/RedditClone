import { atom } from "recoil";
import { FieldValue, Timestamp } from "firebase/firestore";

// below we define all of the basic info and types of data we would want
// to store globally for our communities section
export interface Community {
  id: string;
  creatorId: string;
  numberOfMembers: number;
  privacyType: "public" | "restrictied" | "private";
  createdAt?: Timestamp;
  imageURL?: string;
}

// the community snippet for each user 
export interface CommunitySnippet {
  communityId: string;
  isModerator?: boolean;
  imageURL?: string;
}

// this is the interface of where we store our sub collection on users for the communities they are apart of
// where we pull the community state data first
// this interface is actually implemented by the atom exported at bottom of page
interface CommunityState {
  [key: string]:
    | CommunitySnippet[]
    | { [key: string]: Community }
    | Community
    | boolean
    | undefined;
  mySnippets: CommunitySnippet[]; // an array of community snippets for each of the users communities
  initSnippetsFetched: boolean;
  visitedCommunities: { // our recently visited communities for search etc
    [key: string]: Community;
  };
  currentCommunity?: Community;
}

export const defaultCommunity: Community = {
  id: "",
  creatorId: "",
  numberOfMembers: 0,
  privacyType: "public",
};

// defined a blank community to be the default
export const defaultCommunityState: CommunityState = {
  mySnippets: [],
  initSnippetsFetched: false,
  visitedCommunities: {},
  currentCommunity: defaultCommunity,
};

export const communityState = atom<CommunityState>({
  key: "communitiesState",
  default: defaultCommunityState,
});