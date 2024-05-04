import { grey } from 'theme/palette';

import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import { Box } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';

interface Props {
  open?: boolean;
  isSpeaking?: boolean;
}

export default function RecordScreen({ open, isSpeaking = true }: Props) {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={!!open}
    >
      <Box
        height={300}
        width={300}
        position="relative"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <svg height="160" width="160" xmlns="http://www.w3.org/2000/svg">
          <circle r="80" cx="80" cy="80" fill={grey[50]} />
        </svg>
        <svg
          style={{
            position: 'absolute',
            zIndex: -1,
            transition: 'transform 500ms ease-in-out',
            transform: isSpeaking ? 'scale(1)' : 'scale(0)'
          }}
          viewBox="0 0 320 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill={grey[50]} transform="translate(160 160)">
            <animate
              attributeName="d"
              dur="8000ms"
              repeatCount="indefinite"
              values="M45.9,-81C58.9,-72.1,68.3,-58.5,75.4,-44.2C82.5,-29.9,87.4,-15,87.6,0.1C87.8,15.2,83.4,30.4,75.4,43.2C67.4,56,55.8,66.3,42.7,73.6C29.5,80.9,14.8,85.2,-0.6,86.2C-16,87.3,-31.9,85.1,-44.8,77.6C-57.6,70.1,-67.3,57.3,-74.9,43.5C-82.5,29.7,-87.9,14.8,-87.8,0.1C-87.6,-14.6,-81.9,-29.3,-74.1,-42.7C-66.3,-56.2,-56.4,-68.4,-43.7,-77.5C-31.1,-86.6,-15.5,-92.6,0.5,-93.4C16.5,-94.2,33,-90,45.9,-81Z;
              M43.6,-74.4C57.9,-67.3,71.6,-58.3,79.4,-45.6C87.1,-32.9,88.9,-16.4,87.9,-0.5C87,15.3,83.3,30.7,76.3,44.6C69.2,58.5,58.6,70.9,45.4,78.4C32.1,85.9,16,88.4,0.5,87.5C-15,86.6,-30,82.2,-44.2,75.3C-58.4,68.3,-71.8,58.8,-79.4,45.8C-86.9,32.8,-88.6,16.4,-87.3,0.8C-86,-14.9,-81.7,-29.8,-74.1,-42.6C-66.4,-55.5,-55.5,-66.3,-42.6,-74.1C-29.7,-81.9,-14.8,-86.7,-0.1,-86.6C14.7,-86.5,29.4,-81.4,43.6,-74.4Z;
              M46.1,-80C59.6,-72.1,70.3,-59.4,78.5,-45.3C86.7,-31.1,92.5,-15.6,92,-0.3C91.4,14.9,84.5,29.9,75.8,43.2C67.1,56.4,56.6,68.1,43.6,76.5C30.7,84.9,15.3,90,0.1,89.8C-15,89.5,-30.1,83.8,-43.4,75.7C-56.7,67.5,-68.2,56.8,-75.5,43.7C-82.7,30.7,-85.6,15.4,-85.6,0C-85.7,-15.4,-82.8,-30.8,-76.3,-45C-69.8,-59.3,-59.6,-72.6,-46.3,-80.6C-33,-88.6,-16.5,-91.4,-0.1,-91.3C16.3,-91.1,32.6,-87.9,46.1,-80Z;
              M40.3,-68.8C54.7,-61.5,70.6,-55.7,76.4,-44.5C82.2,-33.3,77.9,-16.6,72.8,-3C67.6,10.7,61.6,21.4,55.7,32.4C49.8,43.4,43.9,54.6,34.6,63.3C25.3,71.9,12.7,78,-0.9,79.6C-14.5,81.2,-29,78.3,-39.7,70.5C-50.4,62.7,-57.3,49.8,-63.7,37.3C-70.2,24.7,-76.3,12.3,-76.7,-0.2C-77,-12.8,-71.7,-25.5,-63.7,-35.5C-55.7,-45.4,-45.1,-52.5,-34,-61.8C-23,-71.1,-11.5,-82.5,0.7,-83.8C13,-85.1,25.9,-76.2,40.3,-68.8Z;
              M43.9,-76.9C57,-68.6,67.6,-56.8,74.9,-43.5C82.2,-30.1,86.3,-15,86.5,0.1C86.7,15.3,83.1,30.6,76.1,44.6C69.2,58.7,59,71.6,45.7,79.4C32.5,87.2,16.2,90.1,0.1,89.9C-16,89.7,-32.1,86.6,-45.3,78.7C-58.5,70.8,-68.8,58.2,-76.1,44.3C-83.4,30.4,-87.7,15.2,-88.1,-0.2C-88.5,-15.7,-84.9,-31.3,-77.2,-44.6C-69.5,-57.8,-57.7,-68.5,-44.1,-76.6C-30.5,-84.6,-15.3,-89.8,0.1,-90C15.5,-90.2,30.9,-85.2,43.9,-76.9Z;
              M43.7,-75.6C56.5,-68.3,66.7,-56.4,75.5,-43C84.3,-29.6,91.7,-14.8,92.3,0.4C93,15.6,87,31.1,77.8,43.8C68.6,56.5,56.2,66.2,42.7,74C29.2,81.8,14.6,87.7,-0.1,87.8C-14.7,87.9,-29.4,82.2,-43.7,74.9C-58,67.5,-71.9,58.5,-79.8,45.7C-87.6,33,-89.5,16.5,-89,0.3C-88.4,-15.9,-85.4,-31.7,-77.6,-44.5C-69.7,-57.4,-57.1,-67.1,-43.3,-73.9C-29.6,-80.6,-14.8,-84.3,0.3,-84.9C15.4,-85.4,30.9,-82.8,43.7,-75.6Z;
              M39.2,-68.8C50.9,-61,60.8,-50.9,67.9,-39.1C74.9,-27.2,79.1,-13.6,80.2,0.6C81.2,14.8,78.9,29.5,70.7,39.4C62.5,49.3,48.4,54.3,35.6,59.2C22.8,64,11.4,68.7,-1.6,71.5C-14.6,74.2,-29.2,75,-40.6,69.4C-52,63.7,-60.2,51.6,-66.3,39C-72.4,26.4,-76.4,13.2,-77.9,-0.8C-79.3,-14.9,-78.3,-29.8,-72.5,-42.9C-66.7,-56.1,-56.1,-67.5,-43.3,-74.6C-30.4,-81.8,-15.2,-84.6,-0.7,-83.3C13.7,-82,27.4,-76.6,39.2,-68.8Z;
              M46.7,-80.9C60.8,-72.6,72.8,-60.8,81.3,-46.7C89.8,-32.6,94.8,-16.3,94.1,-0.4C93.5,15.6,87.3,31.2,78.7,45.1C70,58.9,59,71,45.5,79.7C32,88.4,16,93.7,0.5,92.7C-14.9,91.8,-29.9,84.7,-43.6,76.2C-57.4,67.6,-70,57.6,-77.6,44.7C-85.3,31.8,-88,15.9,-87.3,0.4C-86.6,-15.1,-82.4,-30.1,-75.4,-44.1C-68.3,-58,-58.3,-70.8,-45.2,-79.7C-32.2,-88.5,-16.1,-93.4,0.1,-93.6C16.3,-93.7,32.5,-89.1,46.7,-80.9Z;
              M43,-76.3C55.7,-67.1,66,-55.6,74,-42.5C82,-29.4,87.5,-14.7,89.1,0.9C90.7,16.5,88.3,33,80.2,46C72.2,59,58.6,68.5,44.3,75.2C30,82,15,86,-0.2,86.4C-15.4,86.7,-30.9,83.5,-43.8,75.9C-56.7,68.4,-67.1,56.5,-76,43.2C-84.9,29.8,-92.4,14.9,-92.3,0.1C-92.2,-14.8,-84.5,-29.6,-76.1,-43.8C-67.6,-58,-58.4,-71.6,-45.6,-80.8C-32.8,-90,-16.4,-94.8,-0.6,-93.7C15.1,-92.5,30.2,-85.5,43,-76.3Z;
              M43.1,-73.9C56.6,-66.8,68.8,-56.8,76.6,-44C84.4,-31.2,87.9,-15.6,87.6,-0.2C87.3,15.2,83.2,30.5,75.6,43.7C68.1,57,57,68.3,43.8,75.7C30.6,83.1,15.3,86.5,-0.6,87.5C-16.5,88.5,-32.9,87,-45.6,79.3C-58.2,71.6,-67.1,57.7,-75.2,43.5C-83.3,29.2,-90.7,14.6,-91.4,-0.4C-92.1,-15.4,-86.1,-30.8,-77.9,-45C-69.7,-59.1,-59.3,-71.9,-46,-79C-32.6,-86.2,-16.3,-87.6,-0.8,-86.3C14.8,-85,29.6,-80.9,43.1,-73.9Z;
              M44.7,-77.9C58.5,-69.5,70.6,-58.7,77.9,-45.2C85.3,-31.8,87.8,-15.9,88.2,0.2C88.6,16.4,86.8,32.7,80,47C73.2,61.3,61.3,73.5,47.1,79.9C33,86.3,16.5,87,0.9,85.4C-14.6,83.7,-29.2,79.8,-42.2,72.7C-55.3,65.6,-66.8,55.4,-74.7,42.8C-82.6,30.1,-86.9,15.1,-87.6,-0.4C-88.3,-15.9,-85.3,-31.7,-77.7,-44.8C-70,-57.8,-57.6,-68,-43.9,-76.4C-30.1,-84.8,-15.1,-91.4,0.2,-91.7C15.5,-92.1,31,-86.3,44.7,-77.9Z;
              M42.3,-73.7C55.2,-65.9,66.2,-55.2,74.3,-42.5C82.5,-29.7,87.8,-14.9,88.3,0.3C88.7,15.4,84.4,30.8,76.4,43.8C68.4,56.7,56.6,67.2,43.3,75.5C29.9,83.9,15,90,0,90C-15,90.1,-30,84,-44.3,76.2C-58.7,68.5,-72.3,59.1,-80.1,46.1C-87.8,33.1,-89.6,16.6,-89.7,0C-89.7,-16.6,-88.1,-33.3,-80.2,-45.9C-72.3,-58.6,-58.1,-67.3,-43.6,-74.2C-29.2,-81.1,-14.6,-86.3,0.1,-86.5C14.7,-86.6,29.5,-81.6,42.3,-73.7Z;
              M38.1,-64.9C49.8,-59.3,60,-49.9,69.1,-38.5C78.3,-27,86.4,-13.5,85.2,-0.7C84.1,12.2,73.7,24.4,65.3,37.1C56.9,49.9,50.6,63.3,40.1,69.3C29.5,75.3,14.8,74,1.9,70.6C-10.9,67.2,-21.7,61.9,-35.1,57.5C-48.4,53.1,-64.2,49.6,-70.7,40.2C-77.2,30.8,-74.3,15.4,-75.4,-0.6C-76.5,-16.7,-81.5,-33.3,-77,-46.1C-72.5,-58.9,-58.4,-67.8,-44,-71.8C-29.5,-75.9,-14.8,-75,-0.8,-73.7C13.2,-72.3,26.4,-70.5,38.1,-64.9Z;
              M45,-78.6C58.8,-70,70.6,-58.8,79.3,-45.3C88,-31.8,93.6,-15.9,93,-0.3C92.5,15.2,85.8,30.5,77.2,44.2C68.6,57.9,58.1,70.2,44.9,77.3C31.7,84.5,15.9,86.6,0.6,85.5C-14.7,84.5,-29.4,80.4,-42,72.9C-54.7,65.5,-65.3,54.7,-73.8,42C-82.2,29.2,-88.4,14.6,-88.5,-0.1C-88.6,-14.8,-82.7,-29.5,-74.6,-42.9C-66.6,-56.2,-56.4,-68.2,-43.6,-77.3C-30.8,-86.4,-15.4,-92.6,0.1,-92.8C15.6,-93,31.3,-87.1,45,-78.6Z;
            M45.9,-81C58.9,-72.1,68.3,-58.5,75.4,-44.2C82.5,-29.9,87.4,-15,87.6,0.1C87.8,15.2,83.4,30.4,75.4,43.2C67.4,56,55.8,66.3,42.7,73.6C29.5,80.9,14.8,85.2,-0.6,86.2C-16,87.3,-31.9,85.1,-44.8,77.6C-57.6,70.1,-67.3,57.3,-74.9,43.5C-82.5,29.7,-87.9,14.8,-87.8,0.1C-87.6,-14.6,-81.9,-29.3,-74.1,-42.7C-66.3,-56.2,-56.4,-68.4,-43.7,-77.5C-31.1,-86.6,-15.5,-92.6,0.5,-93.4C16.5,-94.2,33,-90,45.9,-81Z"
            ></animate>
          </path>
        </svg>
        <KeyboardVoiceIcon
          sx={{
            height: 87,
            width: 87,
            color: '#ef4444',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </Box>
    </Backdrop>
  );
}
