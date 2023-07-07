import { Flex } from '@chakra-ui/react';
import React, { ReactNode } from 'react';


// the point of this layout component is to layout what the actual page content 
// of all of the different subreddit communities should look like

interface PageContentProps {
    children: ReactNode;
};

const PageContent: React.FC<PageContentProps> = ({ children }) => {
    console.log("Here is children", children);


    return (
        // outtermost container
        <Flex
            justify='center'
            p='16px 0px'>
            {/* actual content container, representing "left" and "right" sides  */}
            <Flex
                width='95%'
                justify='center'
                maxWidth='860px'>

                {/* left hand content */}
                <Flex
                    direction='column'
                    width={{ base: '100%', md: '65%' }}
                    mr={{ base: 0, md: 6 }}>
                    {/* fancy casting is because children could be null or anything so ts no likey */}
                    {children && children[0 as keyof typeof children]}
                </Flex>

                {/* right hand content, when on mobile the rhs does not show, on medium screens it acts flexy  */}
                <Flex
                    direction='column'
                    display={{ base: 'none', md: 'flex' }}
                    flexGrow={1}
                >
                    {children && children[1 as keyof typeof children]}
                </Flex>

            </Flex>
        </Flex>
    );
}
export default PageContent;