// import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '../chakra/theme'
import Layout from '../components/Layout/Layout';
import { RecoilRoot } from 'recoil';
// chakra provider will make sure we can import styles and things look consistent
// incorporating our personal chakra theme by passing it as the theme of the chakra provider

// after wrapping our application in our Chakra provider, we will 
// wrap it in our recoil provider and then that is essentially all the entire
// app will consist of 
// One thing Recoil does is that it gives us access to "global states" such as whether an 
// authentication has been activated or not and we could tell that globally in the app
// an atom in redux is a slice of state essentially and then we access recoil, recoil is 
// supposedly much easier and more efficient than redux, recoil created by FB
function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </RecoilRoot>
  )
}


export default App;