import { Box, Stack } from '@mui/material';

import { AudioElement } from '@chainlit/components';

import { IAudioElement } from 'types/element';

interface Props {
  items: IAudioElement[];
}

export default function InlinedAudioList({ items }: Props) {
  return (
    <Stack spacing={1}>
      {items.map((audio, i) => {
        return (
          <Box key={i} pt={0.5}>
            <AudioElement element={audio} />
          </Box>
        );
      })}
    </Stack>
  );
}
