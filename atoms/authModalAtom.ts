import { atom } from "recoil";

// this is gonna represent the property types of the modal state
// we basically are defining a struct where we can see whether the modal is open and
// what that modal is looking at and then we can act acordingly
export interface AuthModalState {
    open: boolean;
    view: 'login' | 'signup' | 'resetPassword';
}

// nice TS example here of defining the type above, then implementing it in this variable here
const defaultModalState: AuthModalState = {
    open: false,
    view: "login"
}

// creating the atom itself here
// the atom basically seems like a little dictionary here or map in java with defined type
// the default here needs to be something of type AuthModalState because we defined that atom type
export const authModalState = atom<AuthModalState>({
    key: "authModalState",
    default: defaultModalState,
});