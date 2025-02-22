import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Select,
  useToast,
  VStack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const LANGUAGES = {
  python: { name: 'Python', version: '3.10.0', id: 'python' },
  javascript: { name: 'JavaScript', version: '18.15.0', id: 'javascript' },
  java: { name: 'Java', version: '15.0.2', id: 'java' }
};

function App() {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const toast = useToast();

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = () => {
    setIsEditorReady(true);
  };

  const handleEditorError = () => {
    toast({
      title: 'Editor Error',
      description: 'Failed to load the code editor',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    // Set default code for each language
    const defaultCode = {
      javascript: '// Write your JavaScript code here\nconsole.log("Hello World!");',
      python: '# Write your Python code here\nprint("Hello World!")',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}'
    };
    setCode(defaultCode[event.target.value]);
  };

  const executeCode = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: LANGUAGES[language].id,
        version: LANGUAGES[language].version,
        files: [
          {
            content: code
          }
        ]
      });
      
      setOutput(response.data.run.output || 'No output');
    } catch (error) {
      toast({
        title: 'Error executing code',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setOutput('Error executing code');
    }
    setIsLoading(false);
  };

  return (
    <Container maxW="container.xxl" minH="100vh" py={4} px={10} bg="gray.700">
      <h1
        style={{
          color: "white",
          fontSize: "2em",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        Code Editor
      </h1>
      <VStack spacing={4} align="stretch">
        <Flex gap={4} justify="space-between" align="center">
          <Select
            value={language}
            onChange={handleLanguageChange}
            maxW="200px"
            bg="white"
            color="black"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </Select>
          <Button
            colorScheme="blue"
            onClick={executeCode}
            isLoading={isLoading}
            loadingText="Executing..."
            isDisabled={!isEditorReady}
          >
            Run Code
          </Button>
        </Flex>

        <Box
          h="60vh"
          border="1px"
          borderColor="gray.900"
          borderRadius="md"
          position="relative"
        >
          {!isEditorReady && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              align="center"
              justify="center"
              bg="gray.50"
            >
              <Spinner size="xl" />
            </Flex>
          )}
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            onError={handleEditorError}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              folding: true,
              renderLineHighlight: "all",
            }}
          />
        </Box>

        <Box
          bg="black"
          color="white"
          p={4}
          borderRadius="md"
          minH="150px"
          maxH="300px"
          overflow="auto"
          fontFamily="monospace"
          whiteSpace="pre-wrap"
        >
          <Text fontSize="md" as="div">
            {output || "Output will appear here..."}
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}

export default App;