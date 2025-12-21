import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  useToast,
  Switch,
  Text,
  HStack,
} from '@chakra-ui/react';

const Settings = () => {
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSaveChanges = (e) => {
    e.preventDefault();
    toast({
      title: 'Settings updated',
      description: 'Your settings have been successfully saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Settings</Heading>

        <Box as="form" onSubmit={handleSaveChanges}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4}>Profile Settings</Heading>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input defaultValue={user.firstName} />
                </FormControl>
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input defaultValue={user.lastName} />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input defaultValue={user.email} type="email" isReadOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input defaultValue={user.phone} type="tel" />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            <Box>
              <Heading size="md" mb={4}>Security Settings</Heading>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Current Password</FormLabel>
                  <Input type="password" />
                </FormControl>
                <FormControl>
                  <FormLabel>New Password</FormLabel>
                  <Input type="password" />
                </FormControl>
                <FormControl>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input type="password" />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            <Box>
              <Heading size="md" mb={4}>Notifications</Heading>
              <VStack spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Email Notifications</FormLabel>
                  <Switch defaultChecked />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">SMS Notifications</FormLabel>
                  <Switch defaultChecked />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Investment Updates</FormLabel>
                  <Switch defaultChecked />
                </FormControl>
              </VStack>
            </Box>

            <Button type="submit" colorScheme="blue" size="lg">
              Save Changes
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Settings; 