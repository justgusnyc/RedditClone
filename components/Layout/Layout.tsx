import React, { ReactNode } from 'react';
import Navbar from '../Navbar/Navbar';

// children here is our entire app that is being inherrited from the ReactNode
interface LayoutProps {
  children: ReactNode;
}
// the main idea here is that we want our navbar on all of our pages no matter what for example
// so we basically format the layout of different componenets that we want on our page, then we wrap 
// all of our page props from our app with this layout
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default Layout;
// when we use ts with react we create types for each component
// these types specify which props needs to be passed to each component so that we know 
// preemptively that everything will run, ts does this before we even compile
// React.FC here is a type of a functional component