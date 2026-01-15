import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  SimpleGrid,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { FiHome, FiPlus, FiMapPin } from 'react-icons/fi';
import { useProperties, useCreateProperty } from '../hooks/api';

export function HomePage() {
  const { data: properties, isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const [newProp, setNewProp] = useState({ name: '', address: '' });

  const handleCreate = () => {
    if (!newProp.name) return;
    createProperty.mutate(newProp);
    setNewProp({ name: '', address: '' });
  };

  return (
    <Box minH="100vh" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={6}>
            <Icon as={FiHome} boxSize={12} color="brand.500" mb={4} />
            <Heading size="2xl" mb={2}>
              Checkout Checker
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Photo-based property inspection for Airbnb hosts
            </Text>
          </Box>

          <Card bg="white" shadow="md">
            <CardBody>
              <Heading size="md" mb={4}>
                Add New Property
              </Heading>
              <HStack spacing={3}>
                <Input
                  placeholder="Property name"
                  value={newProp.name}
                  onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
                  bg="white"
                />
                <Input
                  placeholder="Address"
                  value={newProp.address}
                  onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
                  bg="white"
                />
                <Button
                  colorScheme="red"
                  bg="brand.500"
                  _hover={{ bg: 'brand.600' }}
                  leftIcon={<FiPlus />}
                  onClick={handleCreate}
                  isLoading={createProperty.isPending}
                  minW="120px"
                >
                  Add
                </Button>
              </HStack>
            </CardBody>
          </Card>

          <Box>
            <Heading size="lg" mb={4}>
              Your Properties
            </Heading>
            {isLoading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="lg" color="brand.500" />
              </Box>
            ) : properties?.length ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {properties.map((p) => (
                  <Card
                    key={p.id}
                    as={Link}
                    to={`/property/${p.id}`}
                    bg="white"
                    shadow="sm"
                    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    cursor="pointer"
                  >
                    <CardBody>
                      <HStack spacing={3}>
                        <Icon as={FiHome} boxSize={6} color="brand.500" />
                        <Box>
                          <Text fontWeight="semibold" fontSize="lg">
                            {p.name}
                          </Text>
                          {p.address && (
                            <HStack spacing={1} color="gray.500" fontSize="sm">
                              <FiMapPin />
                              <Text>{p.address}</Text>
                            </HStack>
                          )}
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Card bg="white" shadow="sm">
                <CardBody textAlign="center" py={10}>
                  <Icon as={FiHome} boxSize={10} color="gray.300" mb={3} />
                  <Text color="gray.500">No properties yet. Add one above!</Text>
                </CardBody>
              </Card>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
