import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { askUserState } from "state/chat";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 3,
  width: 200,
  borderRadius: 4,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

export default function WaitForResponse() {
  const askUser = useRecoilValue(askUserState);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (askUser) {
      timer = setInterval(() => {
        setElapsed((_elapsed) => {
          return _elapsed + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [askUser]);

  if (!askUser || !askUser.timeout) return null;

  const remaining = askUser.timeout - elapsed;

  if (!remaining) return null;

  const progress = (remaining / askUser.timeout) * 100;

  return (
    <Stack id="wait-for-response" direction="row" spacing={1} alignItems="center">
      <BorderLinearProgress variant="determinate" value={progress} />
      <Typography color="text.secondary" fontWeight={500}>
        {remaining}s left
      </Typography>
    </Stack>
  );
}
