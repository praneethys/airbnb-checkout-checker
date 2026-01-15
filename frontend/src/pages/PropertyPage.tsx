import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  CardHeader,
  Select,
  Spinner,
  Icon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Collapse,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiHome,
  FiPlus,
  FiCamera,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiChevronDown,
  FiChevronUp,
  FiBox,
} from 'react-icons/fi';
import {
  useProperty,
  useRooms,
  useCreateRoom,
  useChecks,
  useCreateCheck,
  useChecklistItems,
  useCreateChecklistItem,
  useCostHistory,
  useDamageReport,
} from '../hooks/api';
import { PhotoUpload } from '../components/PhotoUpload';

export function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id);

  const { data: property } = useProperty(propertyId);
  const { data: rooms } = useRooms(propertyId);
  const { data: checks } = useChecks(propertyId);
  const { data: costHistory } = useCostHistory(propertyId);

  const createRoom = useCreateRoom(propertyId);
  const createCheck = useCreateCheck(propertyId);

  const [newRoom, setNewRoom] = useState({ name: '', room_type: 'other' as const });
  const [activeCheck, setActiveCheck] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  if (!property)
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="brand.500" />
      </Box>
    );

  return (
    <Box minH="100vh" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button as={Link} to="/" variant="ghost" leftIcon={<FiArrowLeft />} size="sm">
              Back
            </Button>
          </HStack>

          <Card bg="white" shadow="md">
            <CardBody>
              <HStack spacing={4}>
                <Icon as={FiHome} boxSize={10} color="brand.500" />
                <Box>
                  <Heading size="lg">{property.name}</Heading>
                  {property.address && <Text color="gray.500">{property.address}</Text>}
                </Box>
              </HStack>
            </CardBody>
          </Card>

          {/* Rooms Section */}
          <Card bg="white" shadow="sm">
            <CardHeader>
              <Heading size="md">Rooms</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <HStack spacing={3} mb={4}>
                <Input
                  placeholder="Room name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                />
                <Select
                  value={newRoom.room_type}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, room_type: e.target.value as typeof newRoom.room_type })
                  }
                  w="200px"
                >
                  <option value="bedroom">Bedroom</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="living_room">Living Room</option>
                  <option value="other">Other</option>
                </Select>
                <Button
                  colorScheme="red"
                  bg="brand.500"
                  _hover={{ bg: 'brand.600' }}
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    createRoom.mutate(newRoom);
                    setNewRoom({ name: '', room_type: 'other' });
                  }}
                  isLoading={createRoom.isPending}
                >
                  Add
                </Button>
              </HStack>
              <VStack align="stretch" spacing={2}>
                {rooms?.map((r) => (
                  <Box key={r.id} borderWidth="1px" borderRadius="md" p={3}>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiBox} color="gray.500" />
                        <Text fontWeight="medium">{r.name}</Text>
                        <Badge colorScheme="gray">{r.room_type}</Badge>
                      </HStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        rightIcon={selectedRoom === r.id ? <FiChevronUp /> : <FiChevronDown />}
                        onClick={() => setSelectedRoom(selectedRoom === r.id ? null : r.id)}
                      >
                        {selectedRoom === r.id ? 'Hide' : 'Items'}
                      </Button>
                    </HStack>
                    <Collapse in={selectedRoom === r.id}>
                      <Box pt={3}>
                        <RoomItems roomId={r.id} />
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Checks Section */}
          <Card bg="white" shadow="sm">
            <CardHeader>
              <Heading size="md">Check-ins / Check-outs</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <HStack spacing={3} mb={4}>
                <Button
                  colorScheme="green"
                  leftIcon={<FiCalendar />}
                  onClick={() =>
                    createCheck.mutate({
                      check_type: 'checkin',
                      guest_name: prompt('Guest name?') || undefined,
                    })
                  }
                >
                  New Check-in
                </Button>
                <Button
                  colorScheme="orange"
                  leftIcon={<FiCalendar />}
                  onClick={() =>
                    createCheck.mutate({
                      check_type: 'checkout',
                      guest_name: prompt('Guest name?') || undefined,
                    })
                  }
                >
                  New Check-out
                </Button>
              </HStack>
              <VStack align="stretch" spacing={2}>
                {checks?.map((c) => (
                  <Box key={c.id} borderWidth="1px" borderRadius="md" p={3}>
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Badge colorScheme={c.check_type === 'checkin' ? 'green' : 'orange'}>
                          {c.check_type.toUpperCase()}
                        </Badge>
                        <HStack>
                          <Icon as={FiUser} color="gray.500" />
                          <Text>{c.guest_name || 'Unknown'}</Text>
                        </HStack>
                        <Text color="gray.500" fontSize="sm">
                          {new Date(c.created_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<FiCamera />}
                        onClick={() => setActiveCheck(activeCheck === c.id ? null : c.id)}
                      >
                        {activeCheck === c.id ? 'Hide' : 'Photos'}
                      </Button>
                    </HStack>
                    <Collapse in={activeCheck === c.id}>
                      <Box pt={4}>
                        <VStack align="stretch" spacing={3}>
                          {rooms?.map((r) => (
                            <PhotoUpload key={r.id} checkId={c.id} roomId={r.id} roomName={r.name} />
                          ))}
                        </VStack>
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Damage Report Section */}
          <Card bg="white" shadow="sm">
            <CardHeader>
              <Heading size="md">Damage Report</Heading>
            </CardHeader>
            <CardBody pt={0}>
              {checks && checks.length >= 2 ? (
                <DamageReportSelector propertyId={propertyId} checks={checks} />
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Need at least one check-in and one check-out to generate a report.
                </Alert>
              )}
            </CardBody>
          </Card>

          {/* Cost History Section */}
          <Card bg="white" shadow="sm">
            <CardHeader>
              <Heading size="md">Cost History</Heading>
            </CardHeader>
            <CardBody pt={0}>
              {costHistory && costHistory.length > 0 ? (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Guest</Th>
                      <Th>Issue</Th>
                      <Th isNumeric>Cost</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {costHistory.map((h, i) => (
                      <Tr key={i}>
                        <Td>{new Date(h.date).toLocaleDateString()}</Td>
                        <Td>{h.guest || '-'}</Td>
                        <Td>{h.issue.description}</Td>
                        <Td isNumeric fontWeight="medium">
                          ${h.issue.estimated_cost.toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500" textAlign="center" py={4}>
                  No issues recorded yet.
                </Text>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

function RoomItems({ roomId }: { roomId: number }) {
  const { data: items } = useChecklistItems(roomId);
  const createItem = useCreateChecklistItem(roomId);
  const [newItem, setNewItem] = useState({ name: '', replacement_cost: 0 });

  return (
    <VStack align="stretch" spacing={3}>
      <HStack>
        <Input
          placeholder="Item name"
          size="sm"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <InputGroup size="sm" w="120px">
          <InputLeftElement>
            <FiDollarSign />
          </InputLeftElement>
          <Input
            type="number"
            placeholder="Cost"
            value={newItem.replacement_cost}
            onChange={(e) => setNewItem({ ...newItem, replacement_cost: Number(e.target.value) })}
          />
        </InputGroup>
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<FiPlus />}
          onClick={() => {
            createItem.mutate(newItem);
            setNewItem({ name: '', replacement_cost: 0 });
          }}
          isLoading={createItem.isPending}
        >
          Add
        </Button>
      </HStack>
      {items && items.length > 0 ? (
        <VStack align="stretch" spacing={1}>
          {items.map((i) => (
            <HStack key={i.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
              <Text fontSize="sm">{i.name}</Text>
              <Badge colorScheme="green">${i.replacement_cost}</Badge>
            </HStack>
          ))}
        </VStack>
      ) : (
        <Text fontSize="sm" color="gray.500">
          No items in checklist
        </Text>
      )}
    </VStack>
  );
}

function DamageReportSelector({
  propertyId,
  checks,
}: {
  propertyId: number;
  checks: Array<{ id: number; check_type: string; guest_name: string | null; created_at: string }>;
}) {
  const [checkinId, setCheckinId] = useState<number>(0);
  const [checkoutId, setCheckoutId] = useState<number>(0);

  const checkins = checks.filter((c) => c.check_type === 'checkin');
  const checkouts = checks.filter((c) => c.check_type === 'checkout');

  const { data: report, isLoading } = useDamageReport(propertyId, checkinId, checkoutId);

  return (
    <VStack align="stretch" spacing={4}>
      <HStack spacing={4}>
        <Select
          placeholder="Select Check-in"
          value={checkinId}
          onChange={(e) => setCheckinId(Number(e.target.value))}
        >
          {checkins.map((c) => (
            <option key={c.id} value={c.id}>
              {c.guest_name || 'Unknown'} - {new Date(c.created_at).toLocaleDateString()}
            </option>
          ))}
        </Select>
        <Select
          placeholder="Select Check-out"
          value={checkoutId}
          onChange={(e) => setCheckoutId(Number(e.target.value))}
        >
          {checkouts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.guest_name || 'Unknown'} - {new Date(c.created_at).toLocaleDateString()}
            </option>
          ))}
        </Select>
      </HStack>

      {isLoading && (
        <Box textAlign="center" py={4}>
          <Spinner color="brand.500" />
          <Text mt={2} color="gray.500">
            Generating report...
          </Text>
        </Box>
      )}

      {report && (
        <Card bg="gray.50" variant="outline">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Box>
                  <Heading size="sm">{report.property_name}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Guest: {report.guest_name || 'Unknown'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(report.checkin_date).toLocaleDateString()} -{' '}
                    {new Date(report.checkout_date).toLocaleDateString()}
                  </Text>
                </Box>
                <Stat textAlign="right">
                  <StatLabel>Total Cost</StatLabel>
                  <StatNumber color="red.500">${report.total_estimated_cost.toFixed(2)}</StatNumber>
                </Stat>
              </HStack>
              <Divider />
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Issues ({report.issues.length})
                </Text>
                {report.issues.length > 0 ? (
                  <VStack align="stretch" spacing={2}>
                    {report.issues.map((i) => (
                      <HStack key={i.id} justify="space-between" p={2} bg="white" borderRadius="md">
                        <Text fontSize="sm">{i.description}</Text>
                        <HStack>
                          <Badge
                            colorScheme={
                              i.severity === 'high'
                                ? 'red'
                                : i.severity === 'medium'
                                  ? 'orange'
                                  : 'gray'
                            }
                          >
                            {i.severity}
                          </Badge>
                          <Text fontWeight="medium">${i.estimated_cost}</Text>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text color="green.500" fontSize="sm">
                    No issues found!
                  </Text>
                )}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}
