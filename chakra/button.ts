import { ComponentStyleConfig } from '@chakra-ui/theme'
// we import this stuff for ts help

// with ts pressing ctrl + spacebar shows you can see the list of properties that particular type expects

// the variants below are the most interesting thing here, to specify the white and blue reddit button variants
export const Button: ComponentStyleConfig = {
    baseStyle: {
        borderRadius: "60px",
        fontSize: "10pt",
        fontWeight: 700,
        _focus: {
          boxShadow: "none",
        },
      },
      sizes: {
        sm: {
          fontSize: "8pt",
        },
        md: {
          fontSize: "10pt",
          // height: "28px",
        },
      },
      variants: {
        solid: {
          color: "white",
          bg: "blue.500",
          _hover: {
            bg: "blue.400",
          },
        },
        outline: {
          color: "blue.500",
          border: "1px solid",
          borderColor: "blue.500",
        },
        oauth: {
          height: "34px",
          border: "1px solid",
          borderColor: "gray.300",
          _hover: {
            bg: "gray.50",
          },
        },
      },
    };