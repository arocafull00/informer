import { Composition } from "remotion";
import { Stage } from "./Stage";
import { FPS, TOTAL } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InformerPromo"
        component={Stage}
        durationInFrames={TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
