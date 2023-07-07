import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { communityState } from "../atoms/communitiesAtom";
import {
  defaultMenuItem,
  DirectoryMenuItem,
  directoryMenuState,
} from "../atoms/directoryMenuAtom";
import { FaReddit } from "react-icons/fa";

const useDirectory = () => {
  const [directoryState, setDirectoryState] =
    useRecoilState(directoryMenuState);
  const router = useRouter();

  const communityStateValue = useRecoilValue(communityState);

  // sets stuff when you select a menuItem so that everything loads
  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: menuItem,
    }));

    router?.push(menuItem.link);
    if (directoryState.isOpen) {
      toggleMenuOpen();
    }
  };

  // this is what toggles opening the directory menu that uses the Chakra menu isOpen attribute
  const toggleMenuOpen = () => {
    setDirectoryState((prev) => ({
      ...prev,
      isOpen: !directoryState.isOpen,
    }));
  };

  // this useEffect makes it so that every time you switch communities, the community prof pic and name switch to the directory
  useEffect(() => {
    const { currentCommunity } = communityStateValue;

    if (!currentCommunity) {
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: {
          displayText: `r/${currentCommunity!.id}`,
          link: `r/${currentCommunity!.id}`,
          icon: FaReddit,
          iconColor: "blue.500",
          imageURL: currentCommunity!.imageURL,
        },
      }));
      return;
    }
  }, [communityStateValue.currentCommunity]);
  //                              ^ used to be communityStateValue.vistedCommunities

  return { directoryState, onSelectMenuItem, toggleMenuOpen };
};

export default useDirectory;