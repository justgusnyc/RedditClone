// 1. Import `extendTheme`
// we import multiple weights of this font below
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";
import { extendTheme } from "@chakra-ui/react"
import { Button } from "./button";

// 2. Call `extendTheme` and pass your custom values
// this is gonna automatically give us the reddit oranghe color
// we had to install this font from chakra (chakra UI fonts)
// this is to make the background grey for the entire app using chakra notation and color choice
// this makes it so that we do not use any css, we use JS objects that Chakra provides us
// components is for chakra components such as buttons and stuff
export const theme = extendTheme({
  colors: {
    brand: {
      100: '#FF3c00', 
    },
  },
  fonts: {
    body: "Open Sans, sans-serif", 
  },
  styles: {
    global: () => ({
      body: {
        bg: "gray.200", 
      },
    }),
  },
  components: {
    Button,
  }
});

