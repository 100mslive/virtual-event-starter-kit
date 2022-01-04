import {
  selectScreenShareByPeerID,
  selectIsLocalScreenShared,
  selectPeerScreenSharing
} from '@100mslive/hms-video-store';
import { useHMSActions, useHMSStore } from '@100mslive/react-sdk';
import { ShareScreenIcon } from '@100mslive/react-icons';
import React from 'react';
import IconFitScreen from '@components/icons/icon-fit-screen';
import Button from './Button';
import { CrossIcon } from '@100mslive/react-icons';

const ScreenshareTile = () => {
  const screenSharePeer = useHMSStore(selectPeerScreenSharing);
  const hmsActions = useHMSActions();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoTrack = useHMSStore(selectScreenShareByPeerID(screenSharePeer!.id));
  const isLocalScreenShared = useHMSStore(selectIsLocalScreenShared);
  React.useEffect(() => {
    (async () => {
      if (videoRef && videoRef?.current && videoTrack) {
        if (videoTrack.enabled) {
          await hmsActions.attachVideo(videoTrack.id, videoRef?.current);
        } else {
          await hmsActions.detachVideo(videoTrack.id, videoRef?.current);
        }
      }
    })();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTrack?.id, videoTrack?.enabled, videoTrack?.deviceID]);
  const stopScreenShare = async () => {
    try {
      await hmsActions.setScreenShareEnabled(false);
    } catch (error) {
      console.log('Error: ', error);
    }
  };
  const fullScreen = () => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById('screen-share-video');
      element?.requestFullscreen();
    }
  };
  return (
    <>
      {isLocalScreenShared ? (
        <div
          style={{ height: 'calc(100vh - 3.2 * var(--header-height))' }}
          className="flex flex-col items-center justify-center font-bold"
        >
          <p>You're sharing screen</p>{' '}
          <Button className="bg-red-600 hover:bg-red-700" onClick={stopScreenShare}>
            <CrossIcon className="mr-2" /> Stop screen share
          </Button>
        </div>
      ) : (
        <div className="relative" style={{ height: 'calc(100vh - 3.2 * var(--header-height))' }}>
          <div
            className="absolute flex items-center bottom-0 right-0 text-sm p-2 rounded-tl-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          >
            <ShareScreenIcon className="mr-2" /> Viewing {screenSharePeer?.name}’s Screen
          </div>
          <button
            onClick={fullScreen}
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
            className="absolute top-0 right-0 display items-center  justify-center rounded-bl-lg cursor-pointer z-10"
          >
            <IconFitScreen />
          </button>
          <video id="screen-share-video" className="h-full" ref={videoRef} autoPlay muted></video>
        </div>
      )}
    </>
  );
};

export default ScreenshareTile;
