import {
  selectDevices,
  selectLocalMediaSettings,
  selectRoleChangeRequest
} from '@100mslive/react-sdk';
import { useHMSActions, useHMSStore } from '@100mslive/react-sdk';
import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import s from './index.module.css';
import Select from '../select';
import g from './guest-invite.module.css';
import { Avatar, IconButton, Preview } from '@100mslive/react-ui';
import {
  MicOnIcon,
  MicOffIcon,
  VideoOnIcon,
  VideoOffIcon,
  SettingIcon,
  ArrowRightIcon,
  CrossIcon
} from '@100mslive/react-icons';
import InfoIcon from '@components/icons/icon-info';
import router from 'next/router';
import { TestAudio } from '../SettingDialog';

const RoleChangeDialog = () => {
  const actions = useHMSActions();
  const request = useHMSStore(selectRoleChangeRequest);
  const roleChange = (b: boolean) => {
    if (request) {
      try {
        if (b) {
          actions.acceptChangeRole(request);
          // also match the setting selected
          const vI = localStorage.getItem('videoInputDeviceId');
          const aI = localStorage.getItem('audioInputDeviceId');
          const aO = localStorage.getItem('audioOutputDeviceId');
          if (vI) {
            actions.setVideoSettings({ deviceId: vI });
            console.log('Changed Video Settings');
          }
          if (aI) {
            actions.setAudioSettings({ deviceId: aI });
            console.log('Changed Audio Input Settings');
          }
          if (aO) {
            actions.setAudioOutputDevice(aO);
            console.log('Changed Audio Output Settings');
          }
        } else {
          actions.rejectChangeRole(request);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const [showPreview, setShowPreview] = React.useState(false);
  return (
    <>
      {request && request.role.name === 'invitee' ? (
        <Dialog.Root open={request ? true : false}>
          <Dialog.Overlay className={s['pop-overlay']} />
          <Dialog.Content className={s['pop-content']}>
            {showPreview ? (
              <GuestPreview roleChange={roleChange} />
            ) : (
              <>
                <p className={s['head']}>You have been invited to speak</p>
                <p className={s['text']}>
                  {request.requestedBy.name} has invited you to speak, would you like to join?
                </p>
                <div className={s['cta-wrapper']}>
                  <button className={s['reject-btn']} onClick={() => roleChange(false)}>
                    Reject
                  </button>
                  <button className={s['accept-btn']} onClick={() => setShowPreview(true)}>
                    Yes
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Root>
      ) : null}
    </>
  );
};

export default RoleChangeDialog;

const GuestPreview: React.FC<{ roleChange: (b: boolean) => void }> = ({ roleChange }) => {
  const localVI = localStorage.getItem('videoInputDeviceId');
  const localAI = localStorage.getItem('audioInputDeviceId');
  const localAO = localStorage.getItem('audioOutputDeviceId');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const devices = useHMSStore(selectDevices);
  const videoInput = devices['videoInput'] || [];
  const audioInput = devices['audioInput'] || [];
  const audioOutput = devices['audioOutput'] || [];
  const [aI, setAI] = useState(localAI || audioInput[0].deviceId);
  const [vI, setVI] = useState(localVI || videoInput[0].deviceId);
  const [aO, setAO] = useState(localAO || audioOutput[0].deviceId);
  React.useEffect(() => {
    getVideo();
  }, [isVideoOn, vI]);
  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { deviceId: vI } })
      .then(stream => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch(err => {
        console.error('error:', err);
      });
  };
  const handleAudioInput = (a: string) => {
    localStorage.setItem('audioInputDeviceId', a);
    setAI(a);
  };
  const handleAudioOutput = (a: string) => {
    localStorage.setItem('audioOutputDeviceId', a);
    setAO(a);
  };
  const handleVideoInput = (a: string) => {
    localStorage.setItem('videoInputDeviceId', a);
    setVI(a);
  };
  const textClass = `text-gray-200`;
  const wrapperClass = `flex md:flex-row flex-col md:items-center md:justify-between my-6`;
  return (
    <div className={g['container']}>
      <div className={g['video-container']}>
        <Preview.VideoRoot css={{ width: '290px', height: '290px' }}>
          {isVideoOn ? (
            <Preview.Video local={true} ref={videoRef} autoPlay muted playsInline />
          ) : (
            <Avatar size="lg" style={{ backgroundColor: 'red' }}>
              DB
            </Avatar>
          )}
          <Preview.Controls>
            <IconButton active={isAudioOn} onClick={() => setIsAudioOn(!isAudioOn)}>
              {isAudioOn ? <MicOnIcon /> : <MicOffIcon />}
            </IconButton>
            <IconButton active={isVideoOn} onClick={() => setIsVideoOn(!isVideoOn)}>
              {isVideoOn ? <VideoOnIcon /> : <VideoOffIcon />}
            </IconButton>
          </Preview.Controls>
          <Preview.Setting>
            <Dialog.Root>
              <Dialog.Overlay
                className="fixed inset-0"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              />
              <Dialog.Trigger asChild>
                <IconButton>
                  <SettingIcon />
                </IconButton>
              </Dialog.Trigger>
              <Dialog.Content className="dialog-content bg-gray-700 md:w-[520px] rounded-2xl w-[90%]">
                <div className="w-full flex items-center justify-between">
                  <span className="text-xl font-bold">Settings</span>
                  <Dialog.Close asChild>
                    <button>
                      <CrossIcon />
                    </button>
                  </Dialog.Close>
                </div>
                <p className="my-0 text-gray-300 text-sm">
                  Control your audio, video source from here
                </p>
                {videoInput.length > 0 ? (
                  <div className={wrapperClass}>
                    <span className={textClass}>Video</span>
                    <Select onChange={e => handleVideoInput(e.target.value)} value={vI}>
                      {videoInput.map((device: MediaDeviceInfo) => (
                        <option value={device.deviceId} key={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : null}
                {audioInput.length > 0 ? (
                  <div className={wrapperClass}>
                    <span className={textClass}>Microphone</span>
                    <Select onChange={e => handleAudioInput(e.target.value)} value={aI}>
                      {audioInput.map((device: MediaDeviceInfo) => (
                        <option value={device.deviceId} key={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : null}
                {audioOutput.length > 0 ? (
                  <div className={wrapperClass}>
                    <span className={textClass}>Speaker</span>
                    <Select onChange={e => handleAudioOutput(e.target.value)} value={aO}>
                      {audioOutput.map((device: MediaDeviceInfo) => (
                        <option value={device.deviceId} key={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : null}
                <div className="flex justify-end">
                  <TestAudio id={aO || ''} />
                </div>
              </Dialog.Content>
            </Dialog.Root>
          </Preview.Setting>
          <Preview.BottomOverlay />
        </Preview.VideoRoot>
      </div>
      <div className={g['wrapper']}>
        <div>
          <p className={g['head-text']}>Welcome </p>
          <p className={g['sub-text']}>Preview your video and audio before joining the stage</p>
        </div>
        <form onSubmit={() => {}}>
          <p className={g['info']}>
            <InfoIcon /> Note: Your mic is {isAudioOn ? 'on' : 'off'} and video is{' '}
            {isVideoOn ? 'on' : 'off'}
          </p>
          <div className={g['btn-wrapper']}>
            <button
              className={`${g['back-btn']} ${g['btn']}`}
              onClick={() => {
                roleChange(false);
                router.push('/');
              }}
            >
              Go back
            </button>
            <button className={g['btn']} type="button" onClick={() => roleChange(true)}>
              Join Stage <ArrowRightIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
