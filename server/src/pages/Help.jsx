import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Icon,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { EmailIcon, ChatIcon, PhoneIcon, QuestionIcon } from '@chakra-ui/icons';
import { FaDiscord, FaTelegram, FaTwitter } from 'react-icons/fa';

const Help = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const supportOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: EmailIcon,
      action: 'Send Email',
      link: 'mailto:support@blupension.com',
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: ChatIcon,
      action: 'Start Chat',
      link: '#',
    },
    {
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      icon: PhoneIcon,
      action: 'Call Now',
      link: 'tel:+1234567890',
    },
    {
      title: 'Help Center',
      description: 'Browse our knowledge base',
      icon: QuestionIcon,
      action: 'Visit Help Center',
      link: '#',
    },
  ];

  const faqs = [
    {
      question: 'What is Blupension?',
      answer: 'Blupension is a decentralized pension platform that allows users to save and invest for retirement using blockchain technology. It provides various investment options and rewards users with BPT tokens.',
    },
    {
      question: 'How do I start investing?',
      answer: 'To start investing, you need to connect your wallet, deposit funds, and choose from our available investment plans. Each plan has different risk levels and expected returns.',
    },
    {
      question: 'What are BPT tokens?',
      answer: 'BPT (Blupension Token) is our native token that provides governance rights and rewards to users. You can earn BPT tokens by participating in the platform and staking your investments.',
    },
    {
      question: 'How secure are my investments?',
      answer: 'Your investments are secured through smart contracts on the blockchain. We employ regular security audits and use industry-standard security practices to protect your assets.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including bank transfers, mobile money, and cryptocurrency payments through MetaMask and other supported wallets.',
    },
    {
      question: 'How can I withdraw my funds?',
      answer: 'You can withdraw your funds through the dashboard by selecting the withdrawal option and choosing your preferred payment method. Processing times vary depending on the method chosen.',
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading mb={2}>Help & Support</Heading>
        <Text color="gray.600">Get assistance and find answers to common questions</Text>
      </Box>

      {/* Support Options */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={12}>
        {supportOptions.map((option, index) => (
          <Box
            key={index}
            p={6}
            bg={bgColor}
            borderRadius="lg"
            shadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <VStack align="start" spacing={4}>
              <Icon as={option.icon} boxSize={6} color="blue.500" />
              <Box>
                <Heading size="md" mb={2}>{option.title}</Heading>
                <Text color="gray.600" mb={4}>{option.description}</Text>
                <Button
                  as={Link}
                  href={option.link}
                  colorScheme="blue"
                  size="sm"
                  width="full"
                >
                  {option.action}
                </Button>
              </Box>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* Community Support */}
      <Box
        mb={12}
        p={6}
        bg={bgColor}
        borderRadius="lg"
        shadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="md" mb={6}>Join Our Community</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Button
            as={Link}
            href="#"
            leftIcon={<Icon as={FaDiscord} />}
            colorScheme="purple"
            variant="outline"
            width="full"
          >
            Discord
          </Button>
          <Button
            as={Link}
            href="#"
            leftIcon={<Icon as={FaTelegram} />}
            colorScheme="blue"
            variant="outline"
            width="full"
          >
            Telegram
          </Button>
          <Button
            as={Link}
            href="#"
            leftIcon={<Icon as={FaTwitter} />}
            colorScheme="twitter"
            variant="outline"
            width="full"
          >
            Twitter
          </Button>
        </SimpleGrid>
      </Box>

      {/* FAQs */}
      <Box
        bg={bgColor}
        borderRadius="lg"
        shadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        p={6}
      >
        <Heading size="md" mb={6}>Frequently Asked Questions</Heading>
        <Accordion allowMultiple>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} border="none">
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="medium">
                  {faq.question}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} color="gray.600">
                {faq.answer}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    </Container>
  );
};

export default Help;
