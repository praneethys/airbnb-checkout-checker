import { useState, useRef } from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCamera, FiAlertTriangle, FiUpload } from 'react-icons/fi';
import { useUploadPhoto } from '../hooks/api';

interface Props {
  checkId: number;
  roomId: number;
  roomName: string;
}

interface AnalysisResult {
  photo_id: number;
  analysis: {
    missing_items: string[];
    damage_detected: string[];
    cleanliness_issues?: string[];
    condition_score?: number;
  };
  issues_created: number;
}

export function PhotoUpload({ checkId, roomId, roomName }: Props) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const upload = useUploadPhoto(checkId, roomId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await upload.mutateAsync(file);
    setResult(res as AnalysisResult);
  };

  const hasIssues =
    result &&
    (result.analysis.missing_items.length > 0 || result.analysis.damage_detected.length > 0);

  return (
    <Box borderWidth="1px" borderColor={borderColor} borderRadius="md" p={4} bg={bgColor}>
      <HStack justify="space-between" mb={3}>
        <HStack>
          <Icon as={FiCamera} color="gray.500" />
          <Text fontWeight="medium">{roomName}</Text>
        </HStack>
        {result && (
          <Badge colorScheme={hasIssues ? 'orange' : 'green'}>
            {hasIssues ? 'Issues Found' : 'All Clear'}
          </Badge>
        )}
      </HStack>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {!result && !upload.isPending && (
        <Button
          leftIcon={<FiUpload />}
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          w="full"
        >
          Upload Photo
        </Button>
      )}

      {upload.isPending && (
        <VStack py={4}>
          <Spinner color="brand.500" />
          <Text fontSize="sm" color="gray.500">
            Analyzing photo with AI...
          </Text>
        </VStack>
      )}

      {result && (
        <VStack align="stretch" spacing={3} mt={2}>
          {result.analysis.missing_items.length > 0 && (
            <Box>
              <HStack mb={1}>
                <Icon as={FiAlertTriangle} color="orange.500" />
                <Text fontSize="sm" fontWeight="medium" color="orange.600">
                  Missing Items
                </Text>
              </HStack>
              <VStack align="stretch" spacing={1} pl={6}>
                {result.analysis.missing_items.map((item, i) => (
                  <Text key={i} fontSize="sm">
                    • {item}
                  </Text>
                ))}
              </VStack>
            </Box>
          )}

          {result.analysis.damage_detected.length > 0 && (
            <Box>
              <HStack mb={1}>
                <Icon as={FiAlertTriangle} color="red.500" />
                <Text fontSize="sm" fontWeight="medium" color="red.600">
                  Damage Detected
                </Text>
              </HStack>
              <VStack align="stretch" spacing={1} pl={6}>
                {result.analysis.damage_detected.map((damage, i) => (
                  <Text key={i} fontSize="sm">
                    • {damage}
                  </Text>
                ))}
              </VStack>
            </Box>
          )}

          {!hasIssues && (
            <Alert status="success" borderRadius="md" size="sm">
              <AlertIcon />
              <Text fontSize="sm">Room looks good! No issues detected.</Text>
            </Alert>
          )}

          {result.analysis.condition_score && (
            <HStack justify="space-between" pt={2} borderTopWidth="1px">
              <Text fontSize="sm" color="gray.500">
                Condition Score
              </Text>
              <Badge colorScheme={result.analysis.condition_score >= 7 ? 'green' : 'orange'}>
                {result.analysis.condition_score}/10
              </Badge>
            </HStack>
          )}

          <Button
            size="sm"
            variant="ghost"
            leftIcon={<FiUpload />}
            onClick={() => {
              setResult(null);
              fileInputRef.current?.click();
            }}
          >
            Upload New Photo
          </Button>
        </VStack>
      )}
    </Box>
  );
}
