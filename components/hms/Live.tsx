import { selectIsConnectedToRoom } from '@100mslive/hms-video-store';
import { useHMSActions, useHMSStore } from '@100mslive/react-sdk';
import React from 'react';
import Join from './Join';
import Room from './Room';

interface Props {
  roomId: string;
}

/**
 * Entrypoint for Joining the Live Conference
 */
const Live: React.FC<Props> = ({ roomId }) => {
  const actions = useHMSActions();
  React.useEffect(() => {
    window.onunload = () => {
      actions.leave();
    };
  }, [actions]);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  return <>{isConnected ? <Room /> : <Join roomId={roomId} />}</>;
};

export default Live;
